import { CHAT_MODEL, getOpenAI } from "@/lib/ai/openai";
import { buildGroundedContext } from "./search-laws";
import type { OrdenanzaMatch } from "@/lib/types";

/**
 * Informe de viabilidad redactado por IA SOLO a partir de fragmentos recuperados
 * (ya filtrados por municipio). Sin fuentes -> null (no se genera nada).
 */
export async function generateGroundedReport(negocio: string, ciudad: string, matches: OrdenanzaMatch[]): Promise<string | null> {
  const openai = getOpenAI();
  if (!openai || matches.length === 0) return null;
  try {
    const res = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "Eres un analista de licencias en España. Responde en español, en máximo 120 palabras, usando EXCLUSIVAMENTE los fragmentos numerados del contexto. Cita cada afirmación como [n]. Si el contexto no cubre algo, dilo explícitamente; nunca inventes normativa, plazos ni importes.",
        },
        {
          role: "user",
          content: `Negocio: ${negocio}\nMunicipio: ${ciudad}\n\nCONTEXTO:\n${buildGroundedContext(matches)}\n\nRedacta el diagnóstico de viabilidad.`,
        },
      ],
    });
    return res.choices[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error("[report]", e instanceof Error ? e.message : e);
    return null;
  }
}
