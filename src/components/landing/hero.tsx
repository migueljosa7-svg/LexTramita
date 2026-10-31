"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LiveBadge } from "./live-badge";
import { ViabilitySimulator } from "./viability-simulator";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-transparent blur-3xl"
        animate={{ scale: [1, 1.12, 1], rotate: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={item}><LiveBadge /></motion.div>
          <motion.h1 variants={item} className="text-5xl font-black leading-[1.05] tracking-tighter sm:text-6xl lg:text-7xl">
            Tu licencia de apertura,{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              sin papeleo ni sorpresas
            </span>
          </motion.h1>
          <motion.p variants={item} className="max-w-lg text-lg text-slate-600 dark:text-slate-400">
            LexTramita genera memorias técnicas y tramita expedientes con IA, contrastando cada requisito con las
            ordenanzas del BOE, BORM y BOCM actualizadas cada día.
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-105 active:scale-95"
            >
              Empezar mi licencia <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/gestorias"
              className="inline-flex items-center rounded-xl border border-slate-300 px-6 py-3 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Soy gestoría
            </Link>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="flex justify-center lg:justify-end">
          <ViabilitySimulator />
        </motion.div>
      </div>
    </section>
  );
}
