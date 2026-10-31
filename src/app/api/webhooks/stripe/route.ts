import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getAdminClient } from "@/lib/supabase/admin";

/** Webhook de Stripe: verifica firma y registra pagos/suscripciones en Supabase (idempotente por event id). */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) return NextResponse.json({ error: "not configured" }, { status: 400 });

  const raw = await req.text(); // cuerpo sin parsear: necesario para la firma
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const db = getAdminClient();
  if (!db) return NextResponse.json({ received: true, stored: false });

  const upsert = (row: Record<string, unknown>) => db.from("pagos").upsert({ event_id: event.id, ...row }, { onConflict: "event_id" });

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const { error } = await upsert({
        tipo: s.mode === "subscription" ? "suscripcion" : "expediente",
        plan: s.metadata?.plan ?? null,
        email: s.customer_details?.email ?? s.customer_email ?? null,
        importe_cents: s.amount_total ?? 0,
        estado: s.payment_status,
        stripe_session_id: s.id,
        stripe_customer_id: typeof s.customer === "string" ? s.customer : null,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const { error } = await upsert({
        tipo: "suscripcion",
        plan: sub.metadata?.plan ?? null,
        email: null,
        importe_cents: 0,
        estado: "cancelada",
        stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      break;
    }
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
