"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowRight } from "lucide-react";

export function CTA() {
  const router = useRouter();

  const go = () => {
    confetti({ particleCount: 160, spread: 100, startVelocity: 45, origin: { y: 0.75 } });
    setTimeout(() => router.push("/dashboard"), 650);
  };

  return (
    <section className="px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-center text-white sm:p-16"
      >
        <motion.div
          aria-hidden
          className="absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl"
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-24 -left-16 size-72 rounded-full bg-fuchsia-300/20 blur-2xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <h2 className="relative text-3xl font-extrabold sm:text-5xl">Abre tu negocio sin perder meses en trámites</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-white/80">Empieza hoy y ten tu expediente listo en minutos, con la normativa de esta mañana.</p>
        <motion.button
          onClick={go}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          className="relative mt-8 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-semibold text-indigo-700 shadow-xl"
        >
          Crear mi expediente <ArrowRight className="size-4" />
        </motion.button>
      </motion.div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
      © 2026 LexTramita · BuroAI. La información es orientativa y no sustituye asesoramiento profesional.
    </footer>
  );
}
