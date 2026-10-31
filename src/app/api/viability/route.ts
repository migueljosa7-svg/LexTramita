import { NextResponse, type NextRequest } from "next/server";
import { searchLaws } from "@/lib/rag/search-laws";
import { generateGroundedReport } from "@/lib/rag/report";
import { evaluarViabilidad } from "@/lib/viability";
import { CIUDADES, NEGOCIOS } from "@/lib/data";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { negocio?: string; ciudad?: string } | null;
  const negocio = body?.negocio ?? "";
  const ciudad = body?.ciudad ?? "";
  if (!(NEGOCIOS as readonly string[]).includes(negocio) || !(CIUDADES as readonly string[]).includes(ciudad)) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }
  // 1) Filtra por municipio + similitud semantica; 2) la IA solo redacta sobre lo recuperado.
  const fuentes = await searchLaws(`Requisitos de licencia de apertura para ${negocio} en ${ciudad}`, {
    municipio: ciudad,
    matchCount: 4,
  }).catch(() => []);
  const informe = await generateGroundedReport(negocio, ciudad, fuentes);
  return NextResponse.json(evaluarViabilidad(negocio, ciudad, fuentes, informe));
}
