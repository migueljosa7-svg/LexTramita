import { getAdminClient } from "@/lib/supabase/admin";
import { embedTexts } from "./embeddings";
import type { OrdenanzaMatch } from "@/lib/types";

export interface SearchLawsOptions {
  municipio?: string;
  matchCount?: number;
  threshold?: number;
}

/**
 * Busqueda semantica sobre ordenanzas vigentes (pgvector + HNSW).
 * Devuelve [] si falta configuracion: el llamador NUNCA debe inventar normativa
 * cuando no hay fuentes recuperadas.
 */
export async function searchLaws(query: string, opts: SearchLawsOptions = {}): Promise<OrdenanzaMatch[]> {
  const supabase = getAdminClient();
  if (!supabase) return [];
  const embeddings = await embedTexts([query]);
  if (!embeddings) return [];

  const { data, error } = await supabase.rpc("match_ordenanzas", {
    query_embedding: embeddings[0],
    match_threshold: opts.threshold ?? 0.3,
    match_count: opts.matchCount ?? 5,
    filter_municipio: opts.municipio ?? null,
  });
  if (error) {
    console.error("[searchLaws]", error.message);
    return [];
  }
  return (data ?? []) as OrdenanzaMatch[];
}

/** Formatea fragmentos como contexto citado para un prompt anti-alucinacion. */
export function buildGroundedContext(matches: OrdenanzaMatch[]): string {
  if (matches.length === 0) return "SIN FUENTES: responde que no hay normativa verificada disponible.";
  return matches
    .map((m, i) => `[${i + 1}] (${m.fuente} ${m.external_id}, ${m.fecha_publicacion}) ${m.titulo}\n${m.contenido.slice(0, 1200)}`)
    .join("\n\n");
}
