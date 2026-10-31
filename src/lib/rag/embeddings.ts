import { getOpenAI } from "@/lib/ai/openai";

export const EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 dimensiones

/** Devuelve un embedding por texto, o null si OpenAI no esta configurado. */
export async function embedTexts(texts: string[]): Promise<number[][] | null> {
  const openai = getOpenAI();
  if (!openai || texts.length === 0) return null;
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.slice(0, 24000)),
  });
  return res.data.map((d) => d.embedding);
}
