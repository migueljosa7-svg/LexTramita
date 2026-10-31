"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, Euro, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { CIUDADES, NEGOCIOS } from "@/lib/data";
import { cn, formatEUR } from "@/lib/utils";
import type { ViabilidadResultado } from "@/lib/types";

const VEREDICTO_STYLE = {
  viable: { label: "Muy viable", color: "text-emerald-500", stroke: "#10b981" },
  condicionada: { label: "Viable con requisitos", color: "text-amber-500", stroke: "#f59e0b" },
  compleja: { label: "Tramitación compleja", color: "text-rose-500", stroke: "#f43f5e" },
} as const;

function ScoreRing({ score, stroke }: { score: number; stroke: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-32 shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-800" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round" stroke={stroke}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <motion.span
        className="absolute inset-0 grid place-items-center text-3xl font-extrabold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {score}
      </motion.span>
    </div>
  );
}

const selectCls =
  "w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900";

export function ViabilitySimulator() {
  const [negocio, setNegocio] = useState<string>(NEGOCIOS[0]);
  const [ciudad, setCiudad] = useState<string>(CIUDADES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ViabilidadResultado | null>(null);

  async function evaluar() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const [res] = await Promise.all([
        fetch("/api/viability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ negocio, ciudad }),
        }),
        new Promise((r) => setTimeout(r, 1100)), // tiempo minimo para mostrar el analisis
      ]);
      if (!res.ok) throw new Error("No se pudo evaluar");
      setResult((await res.json()) as ViabilidadResultado);
    } catch {
      setError("No hemos podido completar el análisis. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const style = result ? VEREDICTO_STYLE[result.veredicto] : null;

  return (
    <div
      id="simulador"
      className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div className="mb-4 flex items-center gap-2 font-semibold">
        <Sparkles className="size-5 text-indigo-500" /> Simulador de viabilidad en vivo
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-500">
          Tipo de negocio
          <select className={cn(selectCls, "mt-1")} value={negocio} onChange={(e) => setNegocio(e.target.value)}>
            {NEGOCIOS.map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-500">
          Ciudad
          <select className={cn(selectCls, "mt-1")} value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
            {CIUDADES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <Button className="mt-4 w-full" onClick={evaluar} disabled={loading}>
        {loading ? "Analizando ordenanzas…" : "Evaluar viabilidad con IA"}
      </Button>

      <div className="mt-4 min-h-6">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Loader label={`Consultando normativa vigente de ${ciudad}…`} />
            </motion.div>
          )}
          {error && (
            <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-rose-500" role="alert">
              {error}
            </motion.p>
          )}
          {result && style && (
            <motion.div key="r" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center gap-5">
                <ScoreRing score={result.score} stroke={style.stroke} />
                <div>
                  <p className={cn("text-xl font-bold", style.color)}>{style.label}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{result.tipoLicencia}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="size-3.5" /> ~{result.plazoDias} días</span>
                    <span className="flex items-center gap-1"><Euro className="size-3.5" /> ~{formatEUR(result.costeEstimado)} costes ext.</span>
                  </div>
                </div>
              </div>
              <ul className="space-y-1.5">
                {result.requisitos.map((r, i) => (
                  <motion.li
                    key={r}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> {r}
                  </motion.li>
                ))}
              </ul>
              {result.informe && (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 text-sm">
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-indigo-500"><Sparkles className="size-3.5" /> Informe IA (solo con fuentes vigentes)</p>
                  <p className="whitespace-pre-line">{result.informe}</p>
                </div>
              )}
              <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <p className="mb-1 flex items-center gap-1 font-semibold"><FileText className="size-3.5" /> Fuentes normativas</p>
                {result.fuentes.length > 0 ? (
                  result.fuentes.map((f) => (
                    <p key={`${f.fuente}-${f.titulo}`}>
                      {f.fuente} · {f.url ? <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline">{f.titulo}</a> : f.titulo} ({f.fecha})
                    </p>
                  ))
                ) : (
                  <p>Modo demostración: estimación orientativa. Conecta Supabase + OpenAI para citar ordenanzas vigentes.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
