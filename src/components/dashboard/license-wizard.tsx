"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, ArrowRight, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CIUDADES, NEGOCIOS } from "@/lib/data";
import type { Expediente } from "@/lib/types";

interface FormState {
  cliente: string;
  negocio: string;
  municipio: string;
  direccion: string;
  superficie: string;
  aforo: string;
}

const INITIAL: FormState = { cliente: "", negocio: NEGOCIOS[0], municipio: CIUDADES[0], direccion: "", superficie: "", aforo: "" };
const STEPS = ["Titular", "Negocio", "Local"] as const;
const ANIMO = ["¡Buen comienzo! Solo 3 pasos.", "¡Vas genial! Ya tienes un tercio hecho.", "¡Último paso! Tu expediente está a un clic."] as const;

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function LicenseWizard({ onCreated }: { onCreated: (e: Expediente) => void }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [done, setDone] = useState<Expediente | null>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid =
    step === 0 ? form.cliente.trim().length > 2 :
    step === 1 ? true :
    form.direccion.trim().length > 4 && Number(form.superficie) > 0;

  const go = (d: 1 | -1) => {
    setDir(d);
    setStep((s) => s + d);
  };

  const submit = () => {
    const exp: Expediente = {
      id: `EXP-${2042 + Math.floor(Math.random() * 900)}`,
      cliente: form.cliente.trim(),
      negocio: form.negocio,
      municipio: form.municipio,
      estado: "borrador",
      progreso: 10,
      actualizado: new Date().toISOString().slice(0, 10),
      importe: 199,
      tramite: "Licencia de actividad",
      gestor: "Sin asignar",
      urgencia: "media",
    };
    onCreated(exp);
    setDone(exp);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
    setForm(INITIAL);
    setStep(0);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">Iniciar licencia</h2>

      <div className="mt-4" aria-label={`Paso ${step + 1} de ${STEPS.length}`}>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <motion.p key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm font-medium text-indigo-500">{ANIMO[step]}</motion.p>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          {STEPS.map((s, i) => (
            <span key={s} className={i <= step ? "font-semibold text-indigo-500" : ""}>{i + 1}. {s}</span>
          ))}
        </div>
      </div>

      <div className="relative mt-5 min-h-44 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {step === 0 && (
              <Field label="Nombre o razón social del titular">
                <input className={inputCls} value={form.cliente} onChange={set("cliente")} placeholder="Ej. Cafés La Plaza S.L." />
              </Field>
            )}
            {step === 1 && (
              <>
                <Field label="Tipo de negocio">
                  <select className={inputCls} value={form.negocio} onChange={set("negocio")}>
                    {NEGOCIOS.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </Field>
                <Field label="Municipio">
                  <select className={inputCls} value={form.municipio} onChange={set("municipio")}>
                    {CIUDADES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Dirección del local">
                  <input className={inputCls} value={form.direccion} onChange={set("direccion")} placeholder="Calle Mayor 12, bajo" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Superficie (m²)">
                    <input className={inputCls} type="number" min={1} value={form.superficie} onChange={set("superficie")} />
                  </Field>
                  <Field label="Aforo previsto">
                    <input className={inputCls} type="number" min={0} value={form.aforo} onChange={set("aforo")} />
                  </Field>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-between">
        <Button variant="ghost" onClick={() => go(-1)} disabled={step === 0}>
          <ArrowLeft className="size-4" /> Atrás
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => go(1)} disabled={!valid}>Siguiente <ArrowRight className="size-4" /></Button>
        ) : (
          <Button onClick={submit} disabled={!valid}>Crear expediente</Button>
        )}
      </div>

      <Modal open={done !== null} onClose={() => setDone(null)} title="¡Expediente creado!">
        <div className="space-y-3 text-center">
          <PartyPopper className="mx-auto size-10 text-indigo-500" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {done?.id} · {done?.cliente} ({done?.negocio}, {done?.municipio}). Sube ahora la documentación para validarla.
          </p>
          <Button className="w-full" onClick={() => setDone(null)}>Continuar</Button>
        </div>
      </Modal>
    </div>
  );
}
