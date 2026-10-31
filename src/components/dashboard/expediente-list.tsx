"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { Expediente } from "@/lib/types";

interface Props {
  items: Expediente[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ExpedienteList({ items, selectedId, onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">Mis expedientes</h2>
      <ul className="mt-4 space-y-3">
        <AnimatePresence initial={false}>
          {items.map((e) => (
            <motion.li key={e.id} layout initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(e.id)}
                aria-pressed={selectedId === e.id}
                className={cn(
                  "w-full cursor-pointer rounded-xl border p-4 text-left transition-colors",
                  selectedId === e.id ? "border-indigo-500 bg-indigo-500/5" : "border-slate-200 dark:border-slate-800",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{e.cliente}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      {e.id} · {e.negocio} · <MapPin className="size-3" /> {e.municipio}
                    </p>
                  </div>
                  <StatusBadge estado={e.estado} />
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" aria-valuenow={e.progreso} aria-valuemin={0} aria-valuemax={100}>
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" initial={{ width: 0 }} animate={{ width: `${e.progreso}%` }} transition={{ duration: 0.8 }} />
                </div>
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
