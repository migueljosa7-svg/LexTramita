"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { LicenseWizard } from "@/components/dashboard/license-wizard";
import { DocValidator } from "@/components/dashboard/doc-validator";
import { PlanAnalyzer } from "@/components/dashboard/plan-analyzer";
import { ExpedienteList } from "@/components/dashboard/expediente-list";
import { ExpedienteTracker } from "@/components/dashboard/expediente-tracker";
import { PaymentBanner } from "@/components/dashboard/payment-banner";
import { PartnerRecommendations } from "@/components/partners/partner-recommendations";
import { EXPEDIENTES_DEMO } from "@/lib/data";
import type { Expediente } from "@/lib/types";

export default function DashboardPage() {
  const [items, setItems] = useState<Expediente[]>(EXPEDIENTES_DEMO.slice(0, 3));
  const [selectedId, setSelectedId] = useState<string | null>(EXPEDIENTES_DEMO[0].id);
  const selected = items.find((e) => e.id === selectedId) ?? null;

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <PaymentBanner />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold">Panel del autónomo</h1>
          <p className="text-slate-600 dark:text-slate-400">Inicia tu licencia, analiza planos, valida documentos y sigue tus expedientes.</p>
        </motion.div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <LicenseWizard
              onCreated={(e) => {
                setItems((prev) => [e, ...prev]);
                setSelectedId(e.id);
              }}
            />
            <PlanAnalyzer municipio={selected?.municipio} />
            <DocValidator />
          </div>
          <div className="space-y-6">
            <ExpedienteList items={items} selectedId={selectedId} onSelect={setSelectedId} />
            <ExpedienteTracker expediente={selected} />
            {selected && <PartnerRecommendations negocio={selected.negocio} ciudad={selected.municipio} />}
          </div>
        </div>
      </main>
    </>
  );
}
