import type { Expediente, PlanId, Tramite } from "./types";

export const NEGOCIOS = [
  "Bar / Cafetería",
  "Restaurante",
  "Tienda de ropa",
  "Peluquería / Estética",
  "Gimnasio",
  "Academia / Centro formativo",
  "Clínica / Fisioterapia",
  "Coworking / Oficina",
] as const;

export const CIUDADES = ["Madrid", "Murcia", "Barcelona", "Valencia", "Sevilla", "Bilbao"] as const;

export const TRAMITES: Tramite[] = ["Licencia de actividad", "Declaración responsable", "Memoria técnica", "Cambio de titularidad"];
export const GESTORES = ["Ana Beltrán", "Luis Ortega", "Marta Sanz"] as const;

export const ESTADOS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  documentacion: "Documentación",
  revision: "En revisión IA",
  presentado: "Presentado",
  aprobado: "Aprobado",
  rechazado: "Subsanar",
};

/** Etapas del "GPS del expediente" en orden. */
export const ETAPAS = [
  { key: "borrador", label: "Borrador" },
  { key: "documentacion", label: "Documentación" },
  { key: "revision", label: "Revisión IA" },
  { key: "presentado", label: "Presentado" },
  { key: "aprobado", label: "Aprobado" },
] as const;

export interface PlanInfo {
  id: PlanId;
  nombre: string;
  precio: number;
  recurrente: boolean;
  descripcion: string;
  features: string[];
}

export const PLANES: Record<PlanId, PlanInfo> = {
  expediente: {
    id: "expediente", nombre: "Pago por Expediente", precio: 199, recurrente: false,
    descripcion: "Un expediente completo",
    features: ["Memoria técnica generada con IA", "Análisis de planos y subsanación", "Normativa municipal vigente citada", "Seguimiento hasta la resolución"],
  },
  gestoria_basic: {
    id: "gestoria_basic", nombre: "Gestoría Básico", precio: 149, recurrente: true,
    descripcion: "Hasta 15 expedientes/mes",
    features: ["Kanban multi-cliente", "Exportación consolidada", "Presupuestos automáticos", "1 usuario gestor"],
  },
  gestoria_pro: {
    id: "gestoria_pro", nombre: "Gestoría Pro", precio: 249, recurrente: true,
    descripcion: "Hasta 60 expedientes/mes",
    features: ["Todo lo de Básico", "Alertas de cambios normativos", "Hasta 5 gestores", "Marca blanca en PDF"],
  },
  gestoria_max: {
    id: "gestoria_max", nombre: "Despacho Max", precio: 399, recurrente: true,
    descripcion: "Expedientes ilimitados",
    features: ["Todo lo de Pro", "Gestores ilimitados", "API e integraciones", "Soporte prioritario"],
  },
};

export const EXPEDIENTES_DEMO: Expediente[] = [
  { id: "EXP-2041", cliente: "Cafés La Plaza S.L.", negocio: "Bar / Cafetería", municipio: "Madrid", estado: "revision", progreso: 72, actualizado: "2026-10-29", importe: 199, tramite: "Licencia de actividad", gestor: "Ana Beltrán", urgencia: "alta" },
  { id: "EXP-2040", cliente: "Lucía Ferrer", negocio: "Peluquería / Estética", municipio: "Murcia", estado: "aprobado", progreso: 100, actualizado: "2026-10-27", importe: 199, tramite: "Declaración responsable", gestor: "Luis Ortega", urgencia: "baja" },
  { id: "EXP-2039", cliente: "FitPoint Gym S.L.", negocio: "Gimnasio", municipio: "Valencia", estado: "documentacion", progreso: 45, actualizado: "2026-10-28", importe: 199, tramite: "Licencia de actividad", gestor: "Marta Sanz", urgencia: "media" },
  { id: "EXP-2038", cliente: "Marcos Ibáñez", negocio: "Tienda de ropa", municipio: "Sevilla", estado: "presentado", progreso: 88, actualizado: "2026-10-25", importe: 199, tramite: "Declaración responsable", gestor: "Ana Beltrán", urgencia: "baja" },
  { id: "EXP-2037", cliente: "Tapas Norte S.L.", negocio: "Restaurante", municipio: "Bilbao", estado: "rechazado", progreso: 60, actualizado: "2026-10-22", importe: 199, tramite: "Licencia de actividad", gestor: "Luis Ortega", urgencia: "alta" },
  { id: "EXP-2036", cliente: "Clínica Aurora", negocio: "Clínica / Fisioterapia", municipio: "Barcelona", estado: "borrador", progreso: 15, actualizado: "2026-10-30", importe: 199, tramite: "Memoria técnica", gestor: "Marta Sanz", urgencia: "media" },
  { id: "EXP-2035", cliente: "Nuria Campos", negocio: "Coworking / Oficina", municipio: "Madrid", estado: "aprobado", progreso: 100, actualizado: "2026-10-18", importe: 199, tramite: "Cambio de titularidad", gestor: "Ana Beltrán", urgencia: "baja" },
  { id: "EXP-2034", cliente: "Academia Nova", negocio: "Academia / Centro formativo", municipio: "Murcia", estado: "revision", progreso: 66, actualizado: "2026-10-26", importe: 199, tramite: "Memoria técnica", gestor: "Luis Ortega", urgencia: "media" },
  { id: "EXP-2033", cliente: "Brasa & Co.", negocio: "Restaurante", municipio: "Madrid", estado: "borrador", progreso: 8, actualizado: "2026-10-31", importe: 199, tramite: "Licencia de actividad", gestor: "Marta Sanz", urgencia: "alta" },
  { id: "EXP-2032", cliente: "Studio Zen", negocio: "Gimnasio", municipio: "Sevilla", estado: "presentado", progreso: 90, actualizado: "2026-10-24", importe: 199, tramite: "Declaración responsable", gestor: "Luis Ortega", urgencia: "media" },
];
