import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

const PARTNERS = ["seguro_rc", "prl"] as const;

/** Captura de lead para partners (seguro RC / PRL). Requiere consentimiento explicito. */
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => null)) as { partner?: string; email?: string; negocio?: string; ciudad?: string; consentimiento?: boolean } | null;
  if (!b || !(PARTNERS as readonly string[]).includes(b.partner ?? "")) return NextResponse.json({ error: "Partner inválido" }, { status: 400 });
  if (!b.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  if (b.consentimiento !== true) return NextResponse.json({ error: "Se requiere consentimiento" }, { status: 400 });

  const db = getAdminClient();
  if (!db) return NextResponse.json({ ok: true, stored: false });
  const { error } = await db.from("partner_leads").insert({
    partner: b.partner,
    email: b.email.slice(0, 200),
    negocio: b.negocio?.slice(0, 100) ?? null,
    ciudad: b.ciudad?.slice(0, 100) ?? null,
  });
  if (error) return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  return NextResponse.json({ ok: true, stored: true });
}
