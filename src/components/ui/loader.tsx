"use client";

import { motion } from "framer-motion";

export function Loader({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2.5 rounded-full bg-indigo-500"
            animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      {label && <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>}
    </div>
  );
}
