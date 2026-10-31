"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HardHat, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type Partner = "seguro_rc" | "prl";

const COPY: Record<Partner, { titulo: string; texto: string; icon: typeof ShieldCheck }> = {
  seguro_rc: { titulo: "Seguro de Responsabilidad Civil", texto: "Muchos ayuntamientos lo exigen para abrir. Compara ofertas de aseguradoras colaboradoras.", icon: ShieldCheck },
  prl: { titulo: "Prevención de Riesgos Laborales", texto: "Obligatorio si vas a contratar personal. Servicio de prevención ajeno a tu medida.", icon: HardHat },
};

/** Que partners son relevantes segun el negocio. */
function relevant(negocio: string): Partner[] {
  const conPersonal = /bar|restaurante|gimnasio|cl[ií]nica|academia/i.test(negocio);
  return conPersonal ? ["seguro_rc", "prl"] : ["seguro_rc"];
}

export function PartnerRecommendations({ negocio, ciudad }: { negocio: string; ciudad?: string }) {
  const [active, setActive] = useState<Partner | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function send() {
    if (!active) return;
    setState("sending");
    try {
      const res = await fetch("/api/partners/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner: active, email, negocio, ciudad, consentimiento: consent }),
      });
      setState(res.ok ? "ok" : "error");
    } catch {
      setState("error");
    }
  }

  const close = () => { setActive(null); setState("idle"); setEmail(""); setConsent(false); };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">Recomendado para tu {negocio.toLowerCase()}</h2>
      <p className="text-xs text-slate-500">Servicios de partners. Compartimos tu email solo si lo aceptas.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {relevant(negocio).map((p) => {
          const c = COPY[p];
          return (
            <motion.div key={p} whileHover={{ y: -3 }} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <c.icon className="size-6 text-indigo-500" />
              <p className="mt-2 font-semibold">{c.titulo}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{c.texto}</p>
              <Button variant="secondary" className="mt-3 w-full" onClick={() => setActive(p)}>Quiero presupuesto</Button>
            </motion.div>
          );
        })}
      </div>

      <Modal open={active !== null} onClose={close} title={active ? COPY[active].titulo : ""}>
        {state === "ok" ? (
          <p className="text-sm">¡Listo! Un partner te contactará por email con su propuesta.</p>
        ) : (
          <div className="space-y-3">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" aria-label="Email"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
            />
            <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
              Acepto que LexTramita comparta mi email y tipo de negocio con el partner para recibir un presupuesto.
            </label>
            {state === "error" && <p role="alert" className="text-xs text-rose-500">No se pudo enviar. Revisa el email e inténtalo de nuevo.</p>}
            <Button className="w-full" onClick={send} disabled={!consent || !email || state === "sending"}>
              {state === "sending" ? "Enviando…" : "Enviar solicitud"}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
