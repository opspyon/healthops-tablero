// Única puerta de entrada a los datos del tablero.
// Etapa 1: lee el JSON de ejemplo. Etapa 2: estas mismas funciones leerán
// HubSpot y la base de datos, sin cambiar las pantallas.

import datos from "@/data/ejemplo-19nov.json";

// ---------- Tipos ----------

export const AGENTES = ["Janet", "Brenda", "Aureni", "Eduardo", "Lulú"] as const;
export type Agente = (typeof AGENTES)[number];
export type FiltroAgente = Agente | "Todos";

export const COORDINADORAS = ["Ari", "Grace"] as const;
export type Coordinadora = (typeof COORDINADORAS)[number];

export type GrupoCerrar = "duplicado" | "cerrar_ya" | "validar" | "sin_respuesta";
export type GrupoAdelantar = "A" | "B" | "C" | "D";
/** "sin_contacto" = tickets por adelantar con 0 intentos. */
export type FiltroAdelantar = GrupoAdelantar | "sin_contacto";

export type MotivoCierre =
  | "duplicado"
  | "cita_cercana"
  | "atendido"
  | "cita_adelantada"
  | "sin_cambio";

export interface TicketPorCerrar {
  ticket: string;
  grupo: GrupoCerrar;
  owner: Agente;
  cita: string | null;
  intentos: number;
  en_pausa: boolean;
  que_hacer: string;
}

export interface TicketPorAdelantar {
  ticket: string;
  grupo: GrupoAdelantar;
  owner: Agente;
  cita: string | null;
  intentos: number;
  labs_recibidos: string | null;
}

export interface AgenteDia {
  nombre: Agente;
  enfoque: string;
  cerrados_hoy: number;
  citas_adelantadas: number;
  dias_ganados: number;
  motivos: Record<MotivoCierre, number>;
}

export interface SolicitudChat {
  id: string;
  tipo: string;
  urgencia: "Alta" | "Media" | "Baja";
  espacio: string;
  hace: string;
}

export interface Escalacion {
  id: string;
  para: Coordinadora;
  motivo: string;
  titulo: string;
  origen: string;
  escalo: string;
  hace: string;
}

interface Datos {
  corte: string;
  serie_abiertos: { corte: string; abiertos: number }[];
  dia: {
    abiertos_inicio: number;
    cerrados: number;
    nuevos: number;
    abiertos_cierre: number;
    record_anterior: number;
  };
  agentes: AgenteDia[];
  por_cerrar: TicketPorCerrar[];
  por_adelantar: TicketPorAdelantar[];
  chat_ejemplo: SolicitudChat[];
  escalaciones_ejemplo: Escalacion[];
}

const D = datos as unknown as Datos;

// ---------- Etiquetas ----------

export const ETIQUETA_GRUPO_CERRAR: Record<GrupoCerrar, string> = {
  duplicado: "Duplicado",
  cerrar_ya: "Cita cercana",
  validar: "Validar",
  sin_respuesta: "Sin respuesta",
};

export const ETIQUETA_GRUPO_ADELANTAR: Record<FiltroAdelantar, string> = {
  A: "Grupo A · con labs",
  B: "Grupo B",
  C: "Grupo C",
  D: "Grupo D",
  sin_contacto: "Sin contacto",
};

export const ETIQUETA_MOTIVO: Record<MotivoCierre, string> = {
  duplicado: "Duplicado",
  cita_cercana: "Cita cercana",
  atendido: "Atendido",
  cita_adelantada: "Cita adelantada",
  sin_cambio: "Sin cambio",
};

const GRUPOS_CERRAR: GrupoCerrar[] = ["duplicado", "cerrar_ya", "validar", "sin_respuesta"];
const GRUPOS_ADELANTAR: GrupoAdelantar[] = ["A", "B", "C", "D"];
const MOTIVOS: MotivoCierre[] = [
  "cita_adelantada",
  "duplicado",
  "cita_cercana",
  "atendido",
  "sin_cambio",
];

/** Grupo que cuenta como "Pedido Dra. Nat": primera vez con labs ya recibidos. */
export const GRUPO_PEDIDO_DRA_NAT: GrupoAdelantar = "A";

// ---------- Utilidades ----------

const deAgente = (agente: FiltroAgente) => (owner: string) =>
  agente === "Todos" || owner === agente;

const agentesFiltrados = (agente: FiltroAgente) => D.agentes.filter((a) => deAgente(agente)(a.nombre));

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-11-24" → "24 nov". Sin zonas horarias: la fecha se toma tal cual. */
export function formatoFecha(iso: string | null): string {
  if (!iso) return "Sin cita";
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES[m - 1]}`;
}

/** Link al ticket en HubSpot. En la etapa 1 no hay tickets reales, así que no hay link. */
export function getTicketUrl(ticket: string): string | null {
  void ticket;
  return null;
}

// ---------- Lecturas ----------

export function getCorte() {
  const hora = D.corte.slice(11, 16);
  return {
    iso: D.corte,
    etiqueta: `${formatoFecha(D.corte.slice(0, 10))} ${D.corte.slice(0, 4)}, ${hora} h`,
  };
}

export function getAgentes(): AgenteDia[] {
  return D.agentes;
}

export function getPorCerrar(agente: FiltroAgente, grupo?: GrupoCerrar): TicketPorCerrar[] {
  return D.por_cerrar.filter(
    (t) => deAgente(agente)(t.owner) && (!grupo || t.grupo === grupo),
  );
}

export function getPorAdelantar(agente: FiltroAgente, filtro?: FiltroAdelantar): TicketPorAdelantar[] {
  return D.por_adelantar.filter((t) => {
    if (!deAgente(agente)(t.owner)) return false;
    if (!filtro) return true;
    if (filtro === "sin_contacto") return t.intentos === 0;
    return t.grupo === filtro;
  });
}

export function getRepartoCerrar(agente: FiltroAgente) {
  const tickets = getPorCerrar(agente);
  return GRUPOS_CERRAR.map((g) => ({
    clave: g,
    etiqueta: ETIQUETA_GRUPO_CERRAR[g],
    total: tickets.filter((t) => t.grupo === g).length,
  }));
}

export function getRepartoAdelantar(agente: FiltroAgente) {
  const tickets = getPorAdelantar(agente);
  return GRUPOS_ADELANTAR.map((g) => ({
    clave: g,
    etiqueta: ETIQUETA_GRUPO_ADELANTAR[g],
    total: tickets.filter((t) => t.grupo === g).length,
  }));
}

export function getResumen(agente: FiltroAgente) {
  const ags = agentesFiltrados(agente);
  const porCerrar = getPorCerrar(agente).length;
  const porAdelantar = getPorAdelantar(agente).length;
  return {
    abiertos: porCerrar + porAdelantar,
    porCerrar,
    porAdelantar,
    cerradosHoy: ags.reduce((s, a) => s + a.cerrados_hoy, 0),
    citasAdelantadas: ags.reduce((s, a) => s + a.citas_adelantadas, 0),
    pedidoDraNat: getPorAdelantar(agente, GRUPO_PEDIDO_DRA_NAT).length,
    // Datos del día de todo el equipo (no se filtran por agente).
    equipo: D.dia,
  };
}

/** Serie de tickets abiertos por corte. Siempre es de todo el equipo. */
export function getSerieAbiertos() {
  return D.serie_abiertos;
}

/** Motivos de cierre (inferidos) del día. */
export function getMotivosCierre(agente: FiltroAgente) {
  const ags = agentesFiltrados(agente);
  return MOTIVOS.map((m) => ({
    clave: m,
    etiqueta: ETIQUETA_MOTIVO[m],
    total: ags.reduce((s, a) => s + a.motivos[m], 0),
  }));
}

export interface FilaPersona {
  nombre: Agente;
  enfoque: string;
  cerradosHoy: number;
  citasAdelantadas: number;
  diasGanados: number;
  porCerrar: number;
  porAdelantar: number;
}

export function getPorPersona(agente: FiltroAgente): FilaPersona[] {
  return agentesFiltrados(agente).map((a) => ({
    nombre: a.nombre,
    enfoque: a.enfoque,
    cerradosHoy: a.cerrados_hoy,
    citasAdelantadas: a.citas_adelantadas,
    diasGanados: a.dias_ganados,
    porCerrar: getPorCerrar(a.nombre).length,
    porAdelantar: getPorAdelantar(a.nombre).length,
  }));
}

export function getSolicitudesChat(): SolicitudChat[] {
  return D.chat_ejemplo;
}

export function getEscalaciones(): Escalacion[] {
  return D.escalaciones_ejemplo;
}
