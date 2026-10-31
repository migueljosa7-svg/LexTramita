export type EstadoExpediente = "borrador" | "documentacion" | "revision" | "presentado" | "aprobado" | "rechazado";
export type Urgencia = "baja" | "media" | "alta";
export type Tramite = "Licencia de actividad" | "Declaración responsable" | "Memoria técnica" | "Cambio de titularidad";

export interface Expediente {
  id: string;
  cliente: string;
  negocio: string;
  municipio: string;
  estado: EstadoExpediente;
  progreso: number;
  actualizado: string; // ISO date
  importe: number;
  tramite: Tramite;
  gestor: string;
  urgencia: Urgencia;
}

export interface OrdenanzaMatch {
  id: string;
  fuente: string;
  external_id: string;
  municipio: string | null;
  titulo: string;
  contenido: string;
  url: string | null;
  fecha_publicacion: string;
  similarity: number;
}

export interface OrdenanzaInput {
  fuente: string; // BOE | BORM | BOCM | BOP-xxx | AYTO
  external_id: string;
  municipio: string | null;
  titulo: string;
  contenido: string;
  url: string | null;
  fecha_publicacion: string; // YYYY-MM-DD
}

export type Veredicto = "viable" | "condicionada" | "compleja";

export interface ViabilidadResultado {
  score: number;
  veredicto: Veredicto;
  tipoLicencia: string;
  plazoDias: number;
  costeEstimado: number;
  requisitos: string[];
  fuentes: { fuente: string; titulo: string; url: string | null; fecha: string }[];
  modo: "rag" | "demo";
  informe: string | null; // informe redactado por IA, solo con fuentes recuperadas
}

export type Severidad = "critico" | "aviso" | "ok";

export interface HallazgoPlano {
  area: "accesibilidad" | "superficies" | "salida_humos" | "evacuacion" | "otros";
  severidad: Severidad;
  titulo: string;
  detalle: string;
  subsanacion: string; // accion correctora propuesta
}

export interface AnalisisPlano {
  resumen: string;
  cumplimiento: number; // 0-100
  hallazgos: HallazgoPlano[];
  modo: "vision" | "demo";
}

export type PlanId = "expediente" | "gestoria_basic" | "gestoria_pro" | "gestoria_max";
