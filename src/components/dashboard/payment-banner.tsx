"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { PartyPopper } from "lucide-react";

/** Tras volver de Stripe (?pago=ok) celebra con confeti. No usa useSearchParams (compatible con prerender). */
export function PaymentBanner() {
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const ok = new URLSearchParams(window.location.search).get("pago") === "ok";
    if (!ok) return;
    const t = setTimeout(() => {
      setPaid(true);
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 } });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {paid && (
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300" role="status">
          <PartyPopper className="size-6" />
          <p className="text-sm font-medium">¡Pago recibido! Tu plan se activará en unos segundos. Ya puedes iniciar tu expediente.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
