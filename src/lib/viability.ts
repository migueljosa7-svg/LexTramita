import type { OrdenanzaMatch, ViabilidadResultado, Veredicto } from "./types";

interface Perfil {
  riesgo: number; // 0-100 (mayor = mas complejo)
  tipo: string;
  plazo: number;
  coste: number;
  requisitos: string[];
}

const PERFILES: Record<string, Perfil> = {
  "Bar / Cafetería": { riesgo: 55, tipo: "Licencia de actividad (hostelería)", plazo: 60, coste: 1400, requisitos: ["Memoria técnica de actividad", "Certificado de insonorización", "Plan de evacuación y extintores", "Informe sanitario / APPCC"] },
  Restaurante: { riesgo: 68, tipo: "Licencia de actividad con cocina", plazo: 75, coste: 2200, requisitos: ["Proyecto técnico visado", "Salida de humos certificada", "Estudio acústico", "Registro sanitario RGSEAA"] },
  "Tienda de ropa": { riesgo: 15, tipo: "Declaración responsable", plazo: 15, coste: 350, requisitos: ["Memoria descriptiva del local", "Certificado de instalaciones eléctricas", "Justificante de tasas"] },
  "Peluquería / Estética": { riesgo: 28, tipo: "Declaración responsable", plazo: 20, coste: 520, requisitos: ["Memoria técnica", "Certificado de ventilación", "Gestión de residuos sanitarios"] },
  Gimnasio: { riesgo: 60, tipo: "Licencia de actividad (deportiva)", plazo: 70, coste: 1900, requisitos: ["Proyecto técnico", "Estudio acústico y vibraciones", "Plan de evacuación y aforo", "Seguro de responsabilidad civil"] },
  "Academia / Centro formativo": { riesgo: 35, tipo: "Declaración responsable + comunicación", plazo: 30, coste: 800, requisitos: ["Memoria técnica", "Accesibilidad (CTE DB-SUA)", "Plan de autoprotección"] },
  "Clínica / Fisioterapia": { riesgo: 50, tipo: "Licencia + autorización sanitaria", plazo: 80, coste: 1700, requisitos: ["Proyecto técnico", "Autorización sanitaria autonómica", "Gestión de residuos biosanitarios"] },
  "Coworking / Oficina": { riesgo: 20, tipo: "Declaración responsable", plazo: 18, coste: 450, requisitos: ["Memoria técnica", "Certificado de instalaciones", "Cumplimiento de accesibilidad"] },
};

const FACTOR_CIUDAD: Record<string, number> = { Madrid: 8, Barcelona: 12, Valencia: 3, Murcia: -6, Sevilla: 2, Bilbao: 5 };

function veredictoDe(score: number): Veredicto {
  return score >= 70 ? "viable" : score >= 45 ? "condicionada" : "compleja";
}

/** Evaluacion determinista (reglas) + fuentes citadas por RAG + informe IA opcional. Nunca inventa normativa. */
export function evaluarViabilidad(negocio: string, ciudad: string, fuentes: OrdenanzaMatch[], informe: string | null = null): ViabilidadResultado {
  const p = PERFILES[negocio] ?? PERFILES["Tienda de ropa"];
  const ajuste = FACTOR_CIUDAD[ciudad] ?? 0;
  const score = Math.max(5, Math.min(97, Math.round(100 - p.riesgo - ajuste)));
  return {
    score,
    veredicto: veredictoDe(score),
    tipoLicencia: p.tipo,
    plazoDias: Math.max(10, p.plazo + ajuste * 2),
    costeEstimado: p.coste + ajuste * 20,
    requisitos: p.requisitos,
    fuentes: fuentes.map((f) => ({ fuente: f.fuente, titulo: f.titulo, url: f.url, fecha: f.fecha_publicacion })),
    modo: fuentes.length > 0 ? "rag" : "demo",
    informe,
  };
}
