"use client";

// Estado de las acciones (Hecho, Tomar, Resolver, Escalar, Atender).
// Etapa 1: se guarda solo en este navegador (localStorage) para poder probar.
// Etapa 2: se guardará en la base de datos con historial.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Agente, Coordinadora, Escalacion } from "@/lib/data";
import { getEscalaciones } from "@/lib/data";

const CLAVE = "healthops-tablero:estado:v1";

export type EstadoChat = "nueva" | "tomada" | "resuelta" | "escalada";
export type EstadoEscalacion = "abierta" | "en_atencion" | "resuelta";

interface Guardado {
  hechos: Record<string, boolean>;
  chat: Record<string, { estado: EstadoChat; tomadaPor?: Agente }>;
  escalaciones: Record<string, EstadoEscalacion>;
  nuevasEscalaciones: Escalacion[];
}

const VACIO: Guardado = { hechos: {}, chat: {}, escalaciones: {}, nuevasEscalaciones: [] };

interface NuevaEscalacion {
  para: Coordinadora;
  motivo: string;
  titulo: string;
  origen: string;
  escalo: string;
}

interface ContextoEstado {
  esHecho: (ticket: string) => boolean;
  alternarHecho: (ticket: string) => void;
  chat: (id: string) => { estado: EstadoChat; tomadaPor?: Agente };
  tomarChat: (id: string, agente: Agente) => void;
  resolverChat: (id: string) => void;
  escalaciones: (Escalacion & { estado: EstadoEscalacion })[];
  escalar: (e: NuevaEscalacion, chatId?: string) => void;
  yaEscalado: (origen: string) => Coordinadora | null;
  atender: (id: string) => void;
  resolverEscalacion: (id: string) => void;
  reiniciar: () => void;
}

const Contexto = createContext<ContextoEstado | null>(null);

function leer(): Guardado {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    return crudo ? { ...VACIO, ...JSON.parse(crudo) } : VACIO;
  } catch {
    return VACIO;
  }
}

export function ProveedorEstado({ children }: { children: React.ReactNode }) {
  const [g, setG] = useState<Guardado>(VACIO);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    // Se lee después de montar para que el HTML del servidor y del navegador coincidan.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setG(leer());
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(g));
    } catch {
      // Sin almacenamiento disponible: el estado vive solo mientras la página esté abierta.
    }
  }, [g, cargado]);

  const escalar = useCallback((e: NuevaEscalacion, chatId?: string) => {
    setG((prev) => {
      const nueva: Escalacion = { ...e, id: `N-${Date.now()}`, hace: "un momento" };
      const chat = chatId
        ? { ...prev.chat, [chatId]: { ...prev.chat[chatId], estado: "escalada" as const } }
        : prev.chat;
      return { ...prev, chat, nuevasEscalaciones: [nueva, ...prev.nuevasEscalaciones] };
    });
  }, []);

  const valor = useMemo<ContextoEstado>(() => {
    const todas = [...g.nuevasEscalaciones, ...getEscalaciones()].map((e) => ({
      ...e,
      estado: g.escalaciones[e.id] ?? ("abierta" as EstadoEscalacion),
    }));
    return {
      esHecho: (t) => !!g.hechos[t],
      alternarHecho: (t) => setG((p) => ({ ...p, hechos: { ...p.hechos, [t]: !p.hechos[t] } })),
      chat: (id) => g.chat[id] ?? { estado: "nueva" },
      tomarChat: (id, agente) =>
        setG((p) => ({ ...p, chat: { ...p.chat, [id]: { estado: "tomada", tomadaPor: agente } } })),
      resolverChat: (id) =>
        setG((p) => ({ ...p, chat: { ...p.chat, [id]: { ...p.chat[id], estado: "resuelta" } } })),
      escalaciones: todas,
      escalar,
      yaEscalado: (origen) =>
        g.nuevasEscalaciones.find((e) => e.origen === origen)?.para ?? null,
      atender: (id) => setG((p) => ({ ...p, escalaciones: { ...p.escalaciones, [id]: "en_atencion" } })),
      resolverEscalacion: (id) =>
        setG((p) => ({ ...p, escalaciones: { ...p.escalaciones, [id]: "resuelta" } })),
      reiniciar: () => setG(VACIO),
    };
  }, [g, escalar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstado(): ContextoEstado {
  const c = useContext(Contexto);
  if (!c) throw new Error("useEstado debe usarse dentro de <ProveedorEstado>");
  return c;
}
