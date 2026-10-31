import { cn } from "@/lib/utils";
import { ESTADOS_LABEL } from "@/lib/data";
import type { EstadoExpediente } from "@/lib/types";

const COLORS: Record<EstadoExpediente, string> = {
  borrador: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  documentacion: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  revision: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  presentado: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  aprobado: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  rechazado: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
};

export function StatusBadge({ estado }: { estado: EstadoExpediente }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", COLORS[estado])}>
      {ESTADOS_LABEL[estado]}
    </span>
  );
}
