"use client";

import { motion } from "framer-motion";

export function LiveBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, type: "spring" }}
      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-700 backdrop-blur dark:text-emerald-300"
    >
      <span className="relative flex size-2.5">
        <motion.span
          className="absolute inline-flex size-full rounded-full bg-emerald-500"
          animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
      </span>
      🟢 Ordenanzas Municipales Actualizadas Hoy en Tiempo Real
    </motion.div>
  );
}
