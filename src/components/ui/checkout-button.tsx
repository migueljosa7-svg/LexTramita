"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./button";
import type { PlanId } from "@/lib/types";

interface Props {
  plan: PlanId;
  children: React.ReactNode;
  className?: string;
}

/** Inicia Stripe Checkout y redirige. Muestra el error si los pagos no estan configurados. */
export function CheckoutButton({ plan, children, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Error de pago");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de pago");
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button className="w-full" onClick={go} disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />} {children}
      </Button>
      {error && <p role="alert" className="mt-2 text-center text-xs text-rose-500">{error}</p>}
    </div>
  );
}
