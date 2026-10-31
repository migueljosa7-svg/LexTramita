"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { CheckoutButton } from "@/components/ui/checkout-button";
import { PLANES } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/types";

type Audience = "autonomos" | "gestorias";
const B2B: PlanId[] = ["gestoria_basic", "gestoria_pro", "gestoria_max"];

function PlanCard({ id, featured }: { id: PlanId; featured?: boolean }) {
  const p = PLANES[id];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className={cn(
        "relative flex flex-col rounded-3xl border bg-white/80 p-7 backdrop-blur dark:bg-slate-900/70",
        featured ? "border-indigo-500 shadow-2xl shadow-indigo-500/20" : "border-slate-200 dark:border-slate-800",
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-bold text-white">
          <Star className="size-3 fill-current" /> Más popular
        </span>
      )}
      <h3 className="text-lg font-semibold">{p.nombre}</h3>
      <p className="text-sm text-slate-500">{p.descripcion}</p>
      <p className="mt-4">
        <span className="text-5xl font-extrabold">{p.precio}€</span>
        <span className="ml-1 text-slate-500">{p.recurrente ? "/mes" : "/expediente"}</span>
      </p>
      <ul className="mt-6 flex-1 space-y-3">
        {p.features.map((f, i) => (
          <motion.li key={f} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-2 text-sm">
            <Check className="size-4 shrink-0 text-emerald-500" /> {f}
          </motion.li>
        ))}
      </ul>
      <CheckoutButton plan={id} className="mt-8">{p.recurrente ? "Suscribirme" : "Pagar y empezar"}</CheckoutButton>
    </motion.div>
  );
}

export function Pricing() {
  const [aud, setAud] = useState<Audience>("autonomos");

  return (
    <section id="precios" className="mx-auto max-w-5xl px-4 py-20">
      <h2 className="text-center text-3xl font-bold sm:text-4xl">Precios claros</h2>
      <p className="mt-3 text-center text-slate-600 dark:text-slate-400">Pago seguro con Stripe. Sin permanencia. IVA no incluido.</p>

      <div className="mx-auto mt-8 flex w-fit rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
        {(["autonomos", "gestorias"] as Audience[]).map((k) => (
          <button
            key={k}
            onClick={() => setAud(k)}
            className={cn("relative cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors", aud === k ? "text-white" : "text-slate-600 dark:text-slate-300")}
          >
            {aud === k && (
              <motion.span layoutId="pricing-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
            )}
            <span className="relative">{k === "autonomos" ? "Autónomos" : "Gestorías"}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={aud}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("mt-10 grid gap-6", aud === "gestorias" ? "md:grid-cols-3" : "mx-auto max-w-md")}
        >
          {aud === "autonomos" ? <PlanCard id="expediente" featured /> : B2B.map((id) => <PlanCard key={id} id={id} featured={id === "gestoria_pro"} />)}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
