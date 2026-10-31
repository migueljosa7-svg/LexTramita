"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, FileUp, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "idle" | "scanning" | "done";

interface Check { label: string; ok: boolean }

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ["application/pdf", "image/png", "image/jpeg"];

/** Simulacion OCR/IA: resultado determinista a partir del nombre del archivo. */
function simulateChecks(name: string): Check[] {
  const hash = [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return [
    { label: "Documento legible (OCR 98%)", ok: true },
    { label: "Firma de técnico competente detectada", ok: hash % 4 !== 0 },
    { label: "Referencia catastral coincide con el local", ok: hash % 5 !== 0 },
    { label: "Fecha de emisión vigente (< 6 meses)", ok: hash % 3 !== 0 },
  ];
}

export function DocValidator() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [over, setOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleFile = useCallback((f: File | undefined) => {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) return setError("Formato no admitido. Usa PDF, PNG o JPG.");
    if (f.size > MAX_BYTES) return setError("El archivo supera los 10 MB.");
    setError(null);
    setFile(f);
    setPhase("scanning");
    timer.current = setTimeout(() => {
      setChecks(simulateChecks(f.name));
      setPhase("done");
    }, 3200);
  }, []);

  const reset = () => {
    setPhase("idle");
    setFile(null);
    setChecks([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">Validador documental</h2>

      <motion.div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => phase === "idle" && inputRef.current?.click()}
        animate={{ scale: over ? 1.02 : 1 }}
        className={cn(
          "relative mt-4 grid min-h-56 place-items-center overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          over ? "border-indigo-500 bg-indigo-500/10" : "border-slate-300 dark:border-slate-700",
          phase === "idle" && "cursor-pointer",
        )}
      >
        <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

        {phase === "idle" && (
          <div>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <FileUp className="mx-auto size-10 text-indigo-500" />
            </motion.div>
            <p className="mt-3 font-medium">Arrastra tu documento aquí</p>
            <p className="text-xs text-slate-500">PDF, PNG o JPG · máx. 10 MB</p>
          </div>
        )}

        {phase === "scanning" && (
          <div className="relative grid size-full min-h-48 place-items-center">
            <div className="text-center">
              <ScanLine className="mx-auto size-10 text-indigo-500" />
              <p className="mt-2 text-sm font-medium">Analizando {file?.name}…</p>
            </div>
            <div className="absolute inset-x-0 animate-scan">
              <div className="h-0.5 bg-rose-500 shadow-[0_0_16px_4px_rgba(244,63,94,0.7)]" />
              <div className="h-10 bg-gradient-to-b from-rose-500/25 to-transparent" />
            </div>
          </div>
        )}

        {phase === "done" && (
          <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.15 } } }} className="w-full space-y-2 text-left">
            {checks.map((c) => (
              <motion.li
                key={c.label}
                variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
                className="flex items-center gap-2 text-sm"
              >
                {c.ok ? <CheckCircle2 className="size-5 text-emerald-500" /> : <AlertTriangle className="size-5 text-amber-500" />}
                {c.label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-sm text-rose-500" role="alert">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {phase === "done" && (
        <button onClick={reset} className="mt-3 cursor-pointer text-sm font-semibold text-indigo-500 hover:underline">
          Validar otro documento
        </button>
      )}
      <p className="mt-3 text-xs text-slate-500">Simulación de OCR/IA: los archivos no se envían a ningún servidor.</p>
    </div>
  );
}
