"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TESTIMONIOS = [
  { nombre: "Carmen Ruiz", rol: "Dueña de cafetería · Murcia", texto: "Conseguí la declaración responsable en 3 semanas. Antes me pedían 4 meses y 1.500€ de gestor.", metrica: "-79% de tiempo" },
  { nombre: "Javier Soto", rol: "Gestoría Soto & Asociados · Madrid", texto: "Con el panel multi-cliente llevamos 60 expedientes a la vez. El presupuesto automático nos ahorra horas cada semana.", metrica: "60 expedientes en paralelo" },
  { nombre: "Laia Ferrer", rol: "Fisioterapeuta · Barcelona", texto: "La memoria técnica salió casi perfecta y citaba la ordenanza exacta. Mi arquitecto solo tuvo que firmar.", metrica: "1 sola revisión" },
  { nombre: "Pablo Mena", rol: "Gimnasio boutique · Valencia", texto: "El análisis de planos detectó que faltaba el itinerario accesible antes de presentar. Me evitó un rechazo.", metrica: "0 rechazos" },
];

export function Testimonials() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % TESTIMONIOS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const t = TESTIMONIOS[i];

  return (
    <section className="bg-slate-50 py-20 dark:bg-slate-900/40">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Casos de éxito</h2>
        <div className="relative mt-10 min-h-64">
          <AnimatePresence mode="wait">
            <motion.figure
              key={i}
              initial={{ opacity: 0, x: 60, rotate: 1 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">{t.metrica}</span>
              <Quote className="mx-auto mt-3 size-8 text-indigo-500" />
              <blockquote className="mt-4 text-lg">“{t.texto}”</blockquote>
              <div className="mt-4 flex justify-center gap-0.5 text-amber-400" aria-label="5 estrellas">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="size-4 fill-current" />)}
              </div>
              <figcaption className="mt-3 text-sm">
                <strong>{t.nombre}</strong> <span className="text-slate-500">· {t.rol}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {TESTIMONIOS.map((x, k) => (
            <button key={x.nombre} onClick={() => setI(k)} aria-label={`Testimonio ${k + 1}`} className="cursor-pointer p-1">
              <motion.span
                animate={{ width: k === i ? 28 : 8 }}
                className={cn("block h-2 rounded-full", k === i ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700")}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
