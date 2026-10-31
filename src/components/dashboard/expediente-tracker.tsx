"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Check, Navigation } from "lucide-react";
import { ETAPAS } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Expediente } from "@/lib/types";

/** "GPS del expediente": linea de etapas con posicion actual animada. */
export function ExpedienteTracker({ expediente }: { expediente: Expediente | null }) {
  if (!expediente) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">
        Selecciona un expediente para ver su recorrido en tiempo real.
      </div>
    );
  }
  const rechazado = expediente.estado === "rechazado";
  const idx = rechazado ? 2 : ETAPAS.findIndex((e) => e.key === expediente.estado);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <Navigation className="size-5 text-indigo-500" />
        <h2 className="text-lg font-bold">GPS del expediente</h2>
      </div>
      <p className="text-sm text-slate-500">{expediente.id} · {expediente.cliente} · gestor: {expediente.gestor}</p>

      <ol className="mt-6 space-y-0">
        {ETAPAS.map((et, i) => {
          const done = i < idx || (i === idx && expediente.estado === "aprobado");
          const current = i === idx && !done;
          return (
            <li key={et.key} className="relative flex gap-4 pb-6 last:pb-0">
              {i < ETAPAS.length - 1 && (
                <div className="absolute left-[15px] top-8 h-full w-0.5 bg-slate-200 dark:bg-slate-800">
                  <motion.div className="w-full bg-indigo-500" initial={{ height: 0 }} animate={{ height: i < idx ? "100%" : 0 }} transition={{ duration: 0.6, delay: i * 0.15 }} />
                </div>
              )}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                className={cn(
                  "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
                  done ? "border-indigo-500 bg-indigo-500 text-white" : current ? (rechazado ? "border-rose-500 bg-rose-500/10 text-rose-500" : "border-indigo-500 bg-white text-indigo-500 dark:bg-slate-900") : "border-slate-300 text-slate-400 dark:border-slate-700",
                )}
              >
                {done ? <Check className="size-4" /> : current && rechazado ? <AlertTriangle className="size-4" /> : i + 1}
                {current && !rechazado && (
                  <motion.span className="absolute inset-0 rounded-full border-2 border-indigo-500" animate={{ scale: [1, 1.6], opacity: [0.6, 0] }} transition={{ duration: 1.4, repeat: Infinity }} />
                )}
              </motion.div>
              <div className="pt-1">
                <p className={cn("text-sm font-semibold", !done && !current && "text-slate-400")}>{et.label}</p>
                {current && (
                  <p className={cn("text-xs", rechazado ? "text-rose-500" : "text-indigo-500")}>
                    {rechazado ? "El ayuntamiento pide subsanar: revisa el análisis de planos." : "Estás aquí"}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
