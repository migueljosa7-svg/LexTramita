import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { embedTexts } from "@/lib/rag/embeddings";
import { fetchBOE, fetchRSS, parseFeedConfig, simulateRegionalBulletins } from "@/lib/rag/sources";
import type { OrdenanzaInput } from "@/lib/types";

export const maxDuration = 300;

const BATCH = 50;

/**
 * Vercel Cron (vercel.json): ingesta diaria.
 * BOE (API oficial) + feeds RSS configurables (BORM, BOCM, BOPs...) -> embeddings -> Supabase (pgvector/HNSW).
 * Si no hay feeds configurados, se anaden documentos SIMULADOS de BORM/BOCM para demo (marcados -SIM-).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const feeds = parseFeedConfig(process.env.BULLETIN_FEEDS);

  const [boe, ...rss] = await Promise.all([
    fetchBOE(today).catch((e: unknown) => {
      console.error("[cron] BOE", e);
      return [] as OrdenanzaInput[];
    }),
    ...feeds.map((f) =>
      fetchRSS(f, today).catch((e: unknown) => {
        console.error(`[cron] ${f.fuente}`, e);
        return [] as OrdenanzaInput[];
      }),
    ),
  ]);
  const simulated = feeds.length === 0 ? simulateRegionalBulletins(today) : [];

  // Dedupe por (fuente, external_id): un upsert con duplicados en el mismo lote falla en Postgres.
  const byKey = new Map<string, OrdenanzaInput>();
  for (const d of [...boe, ...rss.flat(), ...simulated]) byKey.set(`${d.fuente}::${d.external_id}`, d);
  const docs = [...byKey.values()];

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, dryRun: true, reason: "Supabase no configurado", encontrados: docs.length });
  }

  let upserted = 0;
  let embedded = 0;
  for (let i = 0; i < docs.length; i += BATCH) {
    const chunk = docs.slice(i, i + BATCH);
    const vectors = await embedTexts(chunk.map((d) => `${d.titulo}\n${d.contenido}`));
    if (vectors) embedded += vectors.length;
    const rows = chunk.map((d, idx) => ({ ...d, vigente: true, ...(vectors ? { embedding: vectors[idx] } : {}) }));
    const { error } = await supabase.from("ordenanzas_municipales").upsert(rows, { onConflict: "fuente,external_id" });
    if (error) {
      console.error("[cron] upsert", error.message);
      return NextResponse.json({ ok: false, error: error.message, upserted }, { status: 500 });
    }
    upserted += rows.length;
  }

  await supabase.from("ingesta_log").insert({
    boe: boe.length,
    feeds: rss.flat().length,
    simulados: simulated.length,
    upserted,
    embedded,
  });

  return NextResponse.json({
    ok: true,
    fecha: today.toISOString(),
    fuentes: { BOE: boe.length, feeds: rss.flat().length, simulados: simulated.length },
    upserted,
    embedded,
  });
}
