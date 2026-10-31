"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingDown } from "lucide-react";
import { formatEUR } from "@/lib/utils";

const DIAS_MES = 30;
const DIAS_RAPIDO = 21; // plazo medio con LexTramita (declaracion responsable / expediente preparado)

function Slider({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm font-medium">
        {label}
        <span className="font-bold text-indigo-500">{value.toLocaleString("es-ES")} {suffix}</span>
      </span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full cursor-pointer accent-indigo-500"
      />
    </label>
  );
}

/** Calculadora de "dinero perdido por alquiler" mientras se espera la licencia. */
export function RentCalculator() {
  const [alquiler, setAlquiler] = useState(1800);
  const [meses, setMeses] = useState(4);

  const { perdido, conLex, ahorro, pct } = useMemo(() => {
    const dias = meses * DIAS_MES;
    const perdido = Math.round((alquiler / DIAS_MES) * dias);
    const conLex = Math.round((alquiler / DIAS_MES) * Math.min(DIAS_RAPIDO, dias));
    const ahorro = Math.max(0, perdido - conLex);
    return { perdido, conLex, ahorro, pct: perdido > 0 ? Math.round((ahorro / perdido) * 100) : 0 };
  }, [alquiler, meses]);

  return (
    <section id="ahorro" className="mx-auto max-w-5xl px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Cada día de espera te cuesta dinero</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400">Mientras tramitas, pagas alquiler de un local cerrado. Calcula cuánto.</p>
      </div>

      <div className="mt-10 grid gap-8 rounded-3xl border border-slate-200 bg-white/80 p-8 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 md:grid-cols-2">
        <div className="space-y-6">
          <Slider label="Alquiler mensual" value={alquiler} min={400} max={8000} step={100} suffix="€" onChange={setAlquiler} />
          <Slider label="Meses de trámite habitual" value={meses} min={1} max={12} step={1} suffix="meses" onChange={setMeses} />
          <p className="text-xs text-slate-500">Estimación orientativa: plazo con LexTramita de ~{DIAS_RAPIDO} días. El plazo real depende del ayuntamiento.</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-rose-500/10 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-300"><Flame className="size-4" /> Pierdes sin acelerar</p>
            <motion.p key={perdido} initial={{ scale: 0.9, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl font-extrabold text-rose-600 dark:text-rose-300">
              {formatEUR(perdido)}
            </motion.p>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-300"><TrendingDown className="size-4" /> Con LexTramita ahorras</p>
            <motion.p key={ahorro} initial={{ scale: 0.9, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-300">
              {formatEUR(ahorro)}
            </motion.p>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Coste de espera: {formatEUR(conLex)} con LexTramita</span><span>-{pct}%</span></div>
            <div className="h-3 overflow-hidden rounded-full bg-rose-500/30">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 80, damping: 18 }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
