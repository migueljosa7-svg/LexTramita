"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Calculator, Download, FileSpreadsheet, Search } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { BudgetModal } from "@/components/gestorias/budget-modal";
import { EXPEDIENTES_DEMO, ESTADOS_LABEL, GESTORES, TRAMITES } from "@/lib/data";
import { cn, formatEUR } from "@/lib/utils";
import type { EstadoExpediente, Expediente, Tramite, Urgencia } from "@/lib/types";

const COLUMNAS: { key: string; label: string; estados: EstadoExpediente[]; accent: string }[] = [
  { key: "borrador", label: "Borrador", estados: ["borrador", "documentacion"], accent: "bg-slate-400" },
  { key: "revision", label: "En Revisión IA", estados: ["revision", "rechazado"], accent: "bg-amber-500" },
  { key: "presentado", label: "Presentado", estados: ["presentado"], accent: "bg-violet-500" },
  { key: "aprobado", label: "Aprobado", estados: ["aprobado"], accent: "bg-emerald-500" },
];

/** Siguiente estado al "avanzar" una tarjeta. */
const NEXT: Record<EstadoExpediente, { estado: EstadoExpediente; progreso: number } | null> = {
  borrador: { estado: "revision", progreso: 55 },
  documentacion: { estado: "revision", progreso: 60 },
  revision: { estado: "presentado", progreso: 85 },
  rechazado: { estado: "revision", progreso: 65 },
  presentado: { estado: "aprobado", progreso: 100 },
  aprobado: null,
};

const URG_CLS: Record<Urgencia, string> = {
  alta: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  media: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  baja: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

const selectCls = "cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

export default function GestoriasPage() {
  const [items, setItems] = useState<Expediente[]>(EXPEDIENTES_DEMO);
  const [q, setQ] = useState("");
  const [tramite, setTramite] = useState<Tramite | "todos">("todos");
  const [gestor, setGestor] = useState<string>("todos");
  const [urgencia, setUrgencia] = useState<Urgencia | "todas">("todas");
  const [budgetFor, setBudgetFor] = useState<Expediente | null>(null);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter(
      (e) =>
        (tramite === "todos" || e.tramite === tramite) &&
        (gestor === "todos" || e.gestor === gestor) &&
        (urgencia === "todas" || e.urgencia === urgencia) &&
        (!t || `${e.cliente} ${e.id} ${e.municipio} ${e.negocio}`.toLowerCase().includes(t)),
    );
  }, [items, q, tramite, gestor, urgencia]);

  const advance = (id: string) =>
    setItems((prev) =>
      prev.map((e) => {
        const n = NEXT[e.estado];
        return e.id === id && n ? { ...e, ...n, actualizado: new Date().toISOString().slice(0, 10) } : e;
      }),
    );

  function exportCSV() {
    const head = ["ID", "Cliente", "Negocio", "Municipio", "Trámite", "Gestor", "Urgencia", "Estado", "Progreso", "Actualizado", "Importe"];
    const lines = rows.map((e) => [e.id, e.cliente, e.negocio, e.municipio, e.tramite, e.gestor, e.urgencia, ESTADOS_LABEL[e.estado], e.progreso, e.actualizado, e.importe].map(csvCell).join(";"));
    const blob = new Blob(["﻿" + [head.map(csvCell).join(";"), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expedientes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const w = window.open("", "_blank");
    if (!w) return alert("Permite las ventanas emergentes para exportar el PDF.");
    const body = rows
      .map((e) => `<tr><td>${esc(e.id)}</td><td>${esc(e.cliente)}</td><td>${esc(e.tramite)}</td><td>${esc(e.municipio)}</td><td>${esc(e.gestor)}</td><td>${esc(ESTADOS_LABEL[e.estado])}</td><td>${e.progreso}%</td></tr>`)
      .join("");
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Expedientes LexTramita</title>
<style>body{font-family:Arial,sans-serif;padding:24px}h1{font-size:20px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#eef}</style></head>
<body><h1>Expedientes · LexTramita</h1><p>${new Date().toLocaleDateString("es-ES")} · ${rows.length} expedientes</p>
<table><thead><tr><th>ID</th><th>Cliente</th><th>Trámite</th><th>Municipio</th><th>Gestor</th><th>Estado</th><th>Progreso</th></tr></thead><tbody>${body}</tbody></table>
<script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  }

  const total = rows.reduce((a, e) => a + e.importe, 0);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Panel de gestoría</h1>
            <p className="text-slate-600 dark:text-slate-400">{rows.length} expedientes · {formatEUR(total)} facturables</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportCSV}><FileSpreadsheet className="size-4" /> CSV</Button>
            <Button onClick={exportPDF}><Download className="size-4" /> Exportar PDF</Button>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente, ID, municipio…" aria-label="Buscar expedientes"
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <select aria-label="Tipo de trámite" className={selectCls} value={tramite} onChange={(e) => setTramite(e.target.value as Tramite | "todos")}>
            <option value="todos">Todos los trámites</option>
            {TRAMITES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select aria-label="Gestor asignado" className={selectCls} value={gestor} onChange={(e) => setGestor(e.target.value)}>
            <option value="todos">Todos los gestores</option>
            {GESTORES.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select aria-label="Urgencia" className={selectCls} value={urgencia} onChange={(e) => setUrgencia(e.target.value as Urgencia | "todas")}>
            <option value="todas">Toda urgencia</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNAS.map((col) => {
            const cards = rows.filter((e) => col.estados.includes(e.estado));
            return (
              <div key={col.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="flex items-center gap-2 text-sm font-bold"><span className={cn("size-2.5 rounded-full", col.accent)} /> {col.label}</span>
                  <motion.span key={cards.length} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="rounded-full bg-white px-2 py-0.5 text-xs font-bold dark:bg-slate-800">{cards.length}</motion.span>
                </div>
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {cards.map((e) => (
                      <motion.article
                        key={e.id}
                        layout
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -3 }}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold">{e.cliente}</p>
                          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", URG_CLS[e.urgencia])}>{e.urgencia}</span>
                        </div>
                        <p className="text-xs text-slate-500">{e.id} · {e.tramite}</p>
                        <p className="text-xs text-slate-500">{e.negocio} · {e.municipio}</p>
                        {e.estado === "rechazado" && <p className="mt-1 text-xs font-semibold text-rose-500">Requiere subsanación</p>}
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <motion.div className="h-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${e.progreso}%` }} />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-slate-500">{e.gestor}</span>
                          <div className="flex gap-1">
                            <button onClick={() => setBudgetFor(e)} aria-label={`Presupuesto de ${e.cliente}`} className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Calculator className="size-4" /></button>
                            {NEXT[e.estado] && (
                              <button onClick={() => advance(e.id)} aria-label={`Avanzar ${e.cliente}`} className="cursor-pointer rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-500/10"><ArrowRight className="size-4" /></button>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                  {cards.length === 0 && <p className="py-6 text-center text-xs text-slate-400">Sin expedientes</p>}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <BudgetModal expediente={budgetFor} onClose={() => setBudgetFor(null)} />
    </>
  );
}
