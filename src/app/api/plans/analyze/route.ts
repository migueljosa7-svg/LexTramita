import { NextResponse, type NextRequest } from "next/server";
import { CHAT_MODEL, getOpenAI } from "@/lib/ai/openai";
import { searchLaws, buildGroundedContext } from "@/lib/rag/search-laws";
import type { AnalisisPlano, HallazgoPlano } from "@/lib/types";

export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const AREAS: HallazgoPlano["area"][] = ["accesibilidad", "superficies", "salida_humos", "evacuacion", "otros"];

function demoAnalysis(): AnalisisPlano {
  return {
    modo: "demo",
    cumplimiento: 68,
    resumen: "Análisis de demostración (sin OPENAI_API_KEY). Configura la clave para analizar tu plano real con visión artificial.",
    hallazgos: [
      { area: "accesibilidad", severidad: "critico", titulo: "Itinerario accesible no acotado", detalle: "No se aprecia un paso libre ≥ 0,80 m ni diámetro de giro de 1,50 m junto a la entrada.", subsanacion: "Acotar el itinerario accesible y ampliar el hueco de acceso o instalar rampa." },
      { area: "salida_humos", severidad: "aviso", titulo: "Evacuación de humos no representada", detalle: "No consta la chimenea o conducto de extracción hasta cubierta.", subsanacion: "Añadir el trazado del conducto con altura sobre cubierta y certificado del instalador." },
      { area: "superficies", severidad: "ok", titulo: "Superficies útiles coherentes", detalle: "Las superficies de sala y servicios son coherentes con el aforo estimado.", subsanacion: "Sin acción necesaria." },
      { area: "evacuacion", severidad: "aviso", titulo: "Recorrido de evacuación sin señalizar", detalle: "No se indican salidas ni recorridos de evacuación.", subsanacion: "Incluir plano de evacuación con señalética normalizada." },
    ],
  };
}

function sanitize(raw: unknown): AnalisisPlano | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const hallazgos = Array.isArray(r.hallazgos) ? r.hallazgos : [];
  const clean: HallazgoPlano[] = hallazgos.flatMap((h) => {
    if (typeof h !== "object" || h === null) return [];
    const x = h as Record<string, unknown>;
    const area = AREAS.includes(x.area as HallazgoPlano["area"]) ? (x.area as HallazgoPlano["area"]) : "otros";
    const sev = x.severidad === "critico" || x.severidad === "aviso" || x.severidad === "ok" ? x.severidad : "aviso";
    return [{ area, severidad: sev, titulo: String(x.titulo ?? "Hallazgo").slice(0, 120), detalle: String(x.detalle ?? "").slice(0, 400), subsanacion: String(x.subsanacion ?? "").slice(0, 400) }];
  });
  const cumplimiento = Math.max(0, Math.min(100, Math.round(Number(r.cumplimiento) || 0)));
  return { modo: "vision", cumplimiento, resumen: String(r.resumen ?? "").slice(0, 600), hallazgos: clean };
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const municipio = typeof form?.get("municipio") === "string" ? String(form?.get("municipio")) : undefined;
  if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  const isPdf = file.type === "application/pdf";
  if (!isPdf && !IMAGE_TYPES.includes(file.type)) return NextResponse.json({ error: "Formato no admitido (PDF, PNG, JPG, WEBP)" }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "El archivo supera 8 MB" }, { status: 413 });

  const openai = getOpenAI();
  if (!openai) return NextResponse.json(demoAnalysis());

  const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const laws = await searchLaws("accesibilidad, superficies, salida de humos y evacuación de locales de actividad", { municipio, matchCount: 4 }).catch(() => []);

  const system =
    "Eres un técnico municipal revisando un plano de local comercial en España. Analiza el plano y devuelve SOLO JSON con: " +
    '{"resumen": string, "cumplimiento": 0-100, "hallazgos": [{"area": "accesibilidad|superficies|salida_humos|evacuacion|otros", "severidad": "critico|aviso|ok", "titulo": string, "detalle": string, "subsanacion": string}]}. ' +
    "Basa los hallazgos únicamente en lo visible en el plano y en la normativa del contexto (CTE DB-SUA, DB-SI y ordenanzas citadas). Si algo no es verificable en el plano, márcalo como 'aviso' y pide el dato; nunca inventes medidas.";

  const filePart = isPdf
    ? ({ type: "file", file: { filename: file.name, file_data: `data:application/pdf;base64,${b64}` } } as const)
    : ({ type: "image_url", image_url: { url: `data:${file.type};base64,${b64}` } } as const);

  try {
    const res = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: [{ type: "text", text: `Normativa de contexto:\n${buildGroundedContext(laws)}\n\nAnaliza el plano adjunto.` }, filePart] },
      ],
    });
    const parsed = sanitize(JSON.parse(res.choices[0]?.message?.content ?? "{}"));
    if (!parsed || parsed.hallazgos.length === 0) return NextResponse.json({ error: "No se pudo interpretar el plano" }, { status: 422 });
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("[plans/analyze]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Error al analizar el plano" }, { status: 502 });
  }
}
