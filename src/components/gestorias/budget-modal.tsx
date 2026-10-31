"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatEUR } from "@/lib/utils";
import type { Expediente, Tramite } from "@/lib/types";

const HONORARIOS_BASE: Record<Tramite, number> = {
  "Licencia de actividad": 450,
  "Declaración responsable": 250,
  "Memoria técnica": 300,
  "Cambio de titularidad": 150,
};
const IVA = 0.21;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

/** Presupuesto automatico para el cliente final (honorarios editables + tasas + IVA). */
export function BudgetModal({ expediente, onClose }: { expediente: Expediente | null; onClose: () => void }) {
  const [honorarios, setHonorarios] = useState<number | null>(null);
  const [tasas, setTasas] = useState(120);

  const base = honorarios ?? (expediente ? HONORARIOS_BASE[expediente.tramite] : 0);
  const subtotal = base + tasas;
  const iva = Math.round(subtotal * IVA * 100) / 100;
  const total = subtotal + iva;

  function close() {
    setHonorarios(null);
    onClose();
  }

  function print() {
    if (!expediente) return;
    const w = window.open("", "_blank");
    if (!w) return alert("Permite las ventanas emergentes para generar el PDF.");
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Presupuesto ${esc(expediente.id)}</title>
<style>body{font-family:Arial,sans-serif;padding:32px;max-width:640px;margin:auto}h1{font-size:22px}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:8px;border-bottom:1px solid #ddd}td:last-child{text-align:right}.t{font-weight:bold;font-size:16px}</style></head>
<body><h1>Presupuesto de tramitación</h1><p>Cliente: <b>${esc(expediente.cliente)}</b><br>Expediente: ${esc(expediente.id)} · ${esc(expediente.tramite)}<br>Actividad: ${esc(expediente.negocio)} (${esc(expediente.municipio)})<br>Fecha: ${new Date().toLocaleDateString("es-ES")}</p>
<table><tr><td>Honorarios de gestión</td><td>${formatEUR(base)}</td></tr><tr><td>Tasas municipales estimadas</td><td>${formatEUR(tasas)}</td></tr><tr><td>IVA (21%)</td><td>${iva.toFixed(2)} €</td></tr><tr class="t"><td>Total</td><td>${total.toFixed(2)} €</td></tr></table>
<p style="font-size:11px;color:#666;margin-top:24px">Presupuesto orientativo válido 30 días. Las tasas definitivas las fija el ayuntamiento.</p>
<script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  }

  const inputCls = "w-28 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-right text-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <Modal open={expediente !== null} onClose={close} title="Presupuesto automático">
      {expediente && (
        <div className="space-y-3 text-sm">
          <p className="text-slate-600 dark:text-slate-400">{expediente.cliente} · {expediente.tramite}</p>
          <label className="flex items-center justify-between">Honorarios (€)
            <input type="number" min={0} className={inputCls} value={base} onChange={(e) => setHonorarios(Math.max(0, Number(e.target.value)))} />
          </label>
          <label className="flex items-center justify-between">Tasas estimadas (€)
            <input type="number" min={0} className={inputCls} value={tasas} onChange={(e) => setTasas(Math.max(0, Number(e.target.value)))} />
          </label>
          <div className="flex justify-between text-slate-500"><span>IVA 21%</span><span>{iva.toFixed(2)} €</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold dark:border-slate-800"><span>Total</span><span>{total.toFixed(2)} €</span></div>
          <Button className="w-full" onClick={print}><FileText className="size-4" /> Generar PDF para el cliente</Button>
        </div>
      )}
    </Modal>
  );
}
