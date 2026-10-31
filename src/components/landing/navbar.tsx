"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Scale } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const links = [
  { href: "/#simulador", label: "Simulador" },
  { href: "/#ahorro", label: "Ahorro" },
  { href: "/#precios", label: "Precios" },
  { href: "/#faq", label: "FAQ" },
  { href: "/dashboard", label: "Autónomos" },
  { href: "/gestorias", label: "Gestorías" },
];

/** Header flotante glassmorphism con modo oscuro/claro persistente. */
export function Navbar() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="sticky top-3 z-40 mx-auto mt-3 w-[calc(100%-1.5rem)] max-w-5xl"
    >
      <nav className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/60 px-4 py-2.5 shadow-lg shadow-indigo-500/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
            <Scale className="size-4" />
          </span>
          LexTramita
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <ThemeToggle />
      </nav>
    </motion.header>
  );
}
