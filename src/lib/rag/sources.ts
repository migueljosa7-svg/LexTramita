import type { OrdenanzaInput } from "@/lib/types";

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const toArr = <T,>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

interface BoeItem { identificador?: string; titulo?: string; url_html?: string }
interface BoeEpigrafe { item?: BoeItem | BoeItem[] }
interface BoeDepto { item?: BoeItem | BoeItem[]; epigrafe?: BoeEpigrafe | BoeEpigrafe[] }
interface BoeSumario {
  data?: { sumario?: { diario?: { seccion?: { departamento?: BoeDepto | BoeDepto[] }[] }[] | { seccion?: { departamento?: BoeDepto | BoeDepto[] }[] } } };
}

const KEYWORDS = /licencia|actividad|apertura|urban|ordenanza|establecimiento|hosteler|comercio|declaraci[oó]n responsable|ruido|terraza/i;

/** BOE real: API de datos abiertos (sumario diario). Devuelve [] si no hay boletin (festivos) o falla. */
export async function fetchBOE(date: Date): Promise<OrdenanzaInput[]> {
  const day = isoDay(date);
  const res = await fetch(`https://www.boe.es/datosabiertos/api/boe/sumario/${day.replaceAll("-", "")}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json()) as BoeSumario;
  const out: OrdenanzaInput[] = [];
  for (const diario of toArr(json.data?.sumario?.diario)) {
    for (const seccion of toArr(diario.seccion)) {
      for (const dep of toArr(seccion.departamento)) {
        const items = [...toArr(dep.item), ...toArr(dep.epigrafe).flatMap((e) => toArr(e.item))];
        for (const it of items) {
          if (!it.identificador || !it.titulo || !KEYWORDS.test(it.titulo)) continue;
          out.push({
            fuente: "BOE",
            external_id: it.identificador,
            municipio: null,
            titulo: it.titulo,
            contenido: it.titulo,
            url: it.url_html ?? null,
            fecha_publicacion: day,
          });
        }
      }
    }
  }
  return out;
}

/** BORM/BOCM: adaptadores SIMULADOS (sin API JSON estable). Sustituir por scraper/RSS propio. */
export function simulateRegionalBulletins(date: Date): OrdenanzaInput[] {
  const day = isoDay(date);
  const stamp = day.replaceAll("-", "");
  return [
    {
      fuente: "BORM",
      external_id: `BORM-SIM-${stamp}-01`,
      municipio: "Murcia",
      titulo: "Ordenanza municipal reguladora de la declaración responsable de actividades en Murcia",
      contenido:
        "Las actividades inocuas de hostelería, comercio minorista y servicios personales en el municipio de Murcia podrán iniciarse mediante declaración responsable, sin licencia previa, acompañada de memoria técnica firmada por técnico competente, certificado de instalaciones y justificante de pago de tasas. Terrazas requieren autorización de ocupación de vía pública independiente.",
      url: "https://www.borm.es",
      fecha_publicacion: day,
    },
    {
      fuente: "BOCM",
      external_id: `BOCM-SIM-${stamp}-01`,
      municipio: "Madrid",
      titulo: "Ordenanza para la apertura de actividades económicas en la ciudad de Madrid (OAAE)",
      contenido:
        "En Madrid, la implantación de actividades en locales se tramita por declaración responsable o licencia urbanística según superficie y uso. Actividades de hostelería con aforo superior a 100 personas o con música requieren licencia de funcionamiento, estudio acústico y plan de evacuación. Plazo máximo de resolución: 2 meses para licencias, 30 días de comprobación posterior en declaración responsable.",
      url: "https://www.bocm.es",
      fecha_publicacion: day,
    },
  ];
}

export interface FeedConfig {
  fuente: string; // p.ej. BORM, BOCM, BOP-ALICANTE
  municipio: string | null;
  url: string;
}

/**
 * Feeds RSS de boletines, configurables sin tocar codigo:
 * BULLETIN_FEEDS="BORM|Murcia|https://.../rss;BOP-ALICANTE||https://.../rss"
 */
export function parseFeedConfig(raw: string | undefined): FeedConfig[] {
  if (!raw) return [];
  return raw
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .flatMap((chunk) => {
      const [fuente, municipio, url] = chunk.split("|").map((x) => x.trim());
      return fuente && url?.startsWith("http") ? [{ fuente, municipio: municipio || null, url }] : [];
    });
}

const clean = (s: string) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const tag = (block: string, name: string) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? clean(m[1]) : "";
};

/** Lee un feed RSS 2.0 y devuelve las entradas relevantes (palabras clave) como ordenanzas. */
export async function fetchRSS(cfg: FeedConfig, date: Date): Promise<OrdenanzaInput[]> {
  const res = await fetch(cfg.url, { headers: { Accept: "application/rss+xml, application/xml, text/xml" }, cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!res.ok) return [];
  const xml = await res.text();
  const out: OrdenanzaInput[] = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const block = m[0];
    const titulo = tag(block, "title");
    const desc = tag(block, "description");
    if (!titulo || !KEYWORDS.test(`${titulo} ${desc}`)) continue;
    const link = tag(block, "link") || null;
    const guid = tag(block, "guid") || link || titulo;
    const pub = new Date(tag(block, "pubDate"));
    out.push({
      fuente: cfg.fuente,
      external_id: guid.slice(0, 200),
      municipio: cfg.municipio,
      titulo: titulo.slice(0, 500),
      contenido: (desc || titulo).slice(0, 4000),
      url: link,
      fecha_publicacion: isoDay(Number.isNaN(pub.getTime()) ? date : pub),
    });
  }
  return out;
}
