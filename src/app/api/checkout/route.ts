import { NextResponse, type NextRequest } from "next/server";
import { getStripe, siteUrl } from "@/lib/stripe";
import { PLANES } from "@/lib/data";
import type { PlanId } from "@/lib/types";

/** Crea una sesion de Stripe Checkout: pago unico (199 EUR) o suscripcion (149/249/399 EUR/mes). */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { plan?: string; email?: string } | null;
  const plan = body?.plan as PlanId | undefined;
  if (!plan || !(plan in PLANES)) return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  const email = body?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ? body.email : undefined;

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Pagos no configurados (falta STRIPE_SECRET_KEY)" }, { status: 503 });

  const info = PLANES[plan];
  const base = siteUrl();
  try {
    const session = await stripe.checkout.sessions.create({
      mode: info.recurrente ? "subscription" : "payment",
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: info.precio * 100,
            product_data: { name: `LexTramita · ${info.nombre}`, description: info.descripcion },
            ...(info.recurrente ? { recurring: { interval: "month" as const } } : {}),
          },
        },
      ],
      metadata: { plan },
      ...(info.recurrente ? { subscription_data: { metadata: { plan } } } : {}),
      allow_promotion_codes: true,
      success_url: `${base}/dashboard?pago=ok&plan=${plan}`,
      cancel_url: `${base}/#precios`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 502 });
  }
}
