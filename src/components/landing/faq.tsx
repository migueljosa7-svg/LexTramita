"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "¿Cómo se mantiene al día la normativa?", a: "Cada madrugada un proceso automático lee el BOE, BORM y BOCM, convierte las novedades en embeddings y las indexa en nuestra base vectorial. Las respuestas se generan solo a partir de fragmentos recuperados y citados." },
  { q: "¿La IA puede inventarse requisitos?", a: "El sistema responde únicamente con normativa recuperada. Si no hay fuente verificada, lo indica en lugar de improvisar. Aun así, recomendamos la revisión final de un técnico competente." },
  { q: "¿Presentáis el trámite por mí?", a: "Preparamos el expediente completo (memoria, documentación y formularios) y te guiamos hasta la presentación telemática. Algunos municipios exigen firma de técnico colegiado." },
  { q: "¿Qué ciudades cubrís?", a: "Cubrimos las principales ciudades españolas y ampliamos cobertura cada mes. Las ordenanzas autonómicas y estatales aplican en todo el territorio." },
  { q: "¿Puedo cancelar la suscripción de gestorías?", a: "Sí, en cualquier momento y sin permanencia. Conservas acceso hasta el final del periodo ya pagado." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
      <h2 className="text-center text-3xl font-bold sm:text-4xl">Preguntas frecuentes</h2>
      <div className="mt-10 space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <motion.div key={f.q} layout className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left font-semibold"
              >
                {f.q}
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown className="size-5" /></motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-5 pb-5 text-slate-600 dark:text-slate-400">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
