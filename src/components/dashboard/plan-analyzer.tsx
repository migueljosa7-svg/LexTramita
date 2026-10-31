"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertOctagon, AlertTriangle, CheckCircle2, Eye, ScanLine, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalisisPlano, Severidad } from "@/lib/types";

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

const AREA_LABEL: Record<string, string> = {
  accesibilidad: "Accesibilidad",
  superficies: "Superficies",
  salida_humos: "Salida de humos",
  evacuacion: "Evacuación",
  otros: "Otros",
};

const SEV: Record<Severidad, { icon: typeof CheckCircle2; cls: string; label: string }> = {
  critico: { icon: AlertOctagon, cls: "text-rose-500 bg-rose-500/10", label: "Crítico" },
  aviso: { icon: AlertTriangle, cls: "text-amber-500 bg-amber-500/10", label: "Aviso" },
  ok: { icon: CheckCircle2, cls: "text-emerald-500 bg-emerald-500/10", label: "Correcto" },
};

/** Visor de planos + agente de subsanacion proactiva (vision artificial en /api/plans/analyze). */
export function PlanAnalyzer({ municipio }: { municipio?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalisisPlano | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) return setError("Formato no admitido (PDF, PNG, JPG, WEBP).");
    if (f.size > MAX_BYTES) return setError("El plano supera 8 MB.");
    setError(null);
    setResult(null);
    setFile(f);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return f.type.startsWith("image/") ? URL.createObjectURL(f) : null;
    });
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (municipio) fd.append("municipio", municipio);
      const res = await fetch("/api/plans/analyze", { method: "POST", body: fd });
      const data = (await res.json()) as AnalisisPlano & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error al analizar");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al analizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <Eye className="size-5 text-indigo-500" />
        <h2 className="text-lg font-bold">Visor de planos + subsanación IA</h2>
      </div>
      <p className="text-sm text-slate-500">Sube el plano del local: revisamos accesibilidad, superficies, salida de humos y evacuación.</p>

      <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
          className="relative grid min-h-48 cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 p-3 text-center text-sm text-slate-500 dark:border-slate-700"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Vista previa del plano" className="max-h-56 rounded-lg object-contain" />
          ) : file ? (
            <span className="font-medium">{file.name}</span>
          ) : (
            <span>Arrastra el plano o haz clic<br /><span className="text-xs">PDF, PNG, JPG · máx. 8 MB</span></span>
          )}
          {loading && (
            <div className="absolute inset-x-0 animate-scan">
              <div className="h-0.5 bg-rose-500 shadow-[0_0_16px_4px_rgba(244,63,94,0.7)]" />
              <div className="h-10 bg-gradient-to-b from-rose-500/25 to-transparent" />
            </div>
          )}
        </motion.div>

        <div className="flex flex-col justify-center gap-3">
          <Button onClick={analyze} disabled={!file || loading}>
            <ScanLine className="size-4" /> {loading ? "Analizando plano…" : "Analizar cumplimiento"}
          </Button>
          {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}
          {result && (
            <div>
              <div className="flex justify-between text-xs text-slate-500"><span>Cumplimiento estimado</span><span className="font-bold">{result.cumplimiento}%</span></div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <motion.div
                  className={cn("h-full rounded-full", result.cumplimiento >= 75 ? "bg-emerald-500" : result.cumplimiento >= 50 ? "bg-amber-500" : "bg-rose-500")}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.cumplimiento}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3">
            <p className="text-sm">{result.resumen}</p>
            {result.modo === "demo" && <p className="text-xs text-amber-600">Resultado de demostración, no es un análisis real del plano.</p>}
            {result.hallazgos.map((h, i) => {
              const s = SEV[h.severidad];
              return (
                <motion.div key={`${h.titulo}-${i}`} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", s.cls)}><s.icon className="size-3.5" /> {s.label}</span>
                    <span className="text-xs text-slate-500">{AREA_LABEL[h.area]}</span>
                  </div>
                  <p className="mt-1 font-semibold">{h.titulo}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{h.detalle}</p>
                  {h.severidad !== "ok" && h.subsanacion && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-indigo-500/10 p-2 text-sm text-indigo-700 dark:text-indigo-300"><Wrench className="mt-0.5 size-4 shrink-0" /> {h.subsanacion}</p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
