"use client";

import { useState } from "react";
import { type Coordinadora, type FiltroAgente } from "@/lib/data";
import { useEstado, type EstadoEscalacion } from "@/lib/estado";
import { AvisoEjemplo, Boton, Chip, Etiqueta, Panel } from "@/components/ui";

const ETIQUETA_ESTADO: Record<EstadoEscalacion, string> = {
  abierta: "Abierta",
  en_atencion: "En atención",
  resuelta: "Resuelta",
};

export default function Escalaciones({ agente }: { agente: FiltroAgente }) {
  const { escalaciones, atender, resolverEscalacion, reiniciar } = useEstado();
  const [para, setPara] = useState<Coordinadora | "Todas">("Todas");

  const delAgente = escalaciones.filter((e) => agente === "Todos" || e.escalo === agente);
  const visibles = delAgente.filter((e) => para === "Todas" || e.para === para);

  const abiertasPara = (c: Coordinadora) =>
    delAgente.filter((e) => e.para === c && e.estado !== "resuelta").length;
  const resueltas = delAgente.filter((e) => e.estado === "resuelta").length;

  const contadores = [
    ["Abiertas para Ari", abiertasPara("Ari")],
    ["Abiertas para Grace", abiertasPara("Grace")],
    ["Resueltas hoy", resueltas],
  ] as const;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-3 gap-3">
        {contadores.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-sm font-semibold text-ink/70">{etiqueta}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-teal">{valor}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Para">
        <span className="mr-1 text-sm font-semibold">Para:</span>
        {(["Todas", "Ari", "Grace"] as const).map((p) => (
          <Chip key={p} activo={para === p} onClick={() => setPara(p)}>
            {p}
          </Chip>
        ))}
      </div>

      <Panel
        titulo={`Escalaciones · ${visibles.length}`}
        nota={agente === "Todos" ? undefined : `Escaladas por ${agente}.`}
      >
        <AvisoEjemplo>
          Datos de ejemplo. Las escalaciones nuevas y los cambios se guardan solo en este navegador.
        </AvisoEjemplo>
        <ul className="mt-4 grid gap-3">
          {visibles.map((e) => (
            <li key={e.id} className={`rounded-xl border border-ink/10 p-4 ${e.estado === "resuelta" ? "bg-offwhite" : ""}`}>
              <div className="flex flex-wrap items-center gap-2">
                <Etiqueta tono="lilacFuerte">Para {e.para}</Etiqueta>
                <Etiqueta tono="lilac">{e.motivo}</Etiqueta>
                <Etiqueta tono="neutro">{ETIQUETA_ESTADO[e.estado]}</Etiqueta>
              </div>
              <p className="mt-2 font-semibold">{e.titulo}</p>
              <p className="text-sm text-ink/70">
                {e.origen} · escaló {e.escalo} · hace {e.hace}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Boton variante="principal" disabled={e.estado !== "abierta"} onClick={() => atender(e.id)}>
                  Atender
                </Boton>
                <Boton disabled={e.estado === "resuelta"} onClick={() => resolverEscalacion(e.id)}>
                  Resolver
                </Boton>
              </div>
            </li>
          ))}
        </ul>
        {visibles.length === 0 && <p className="py-6 text-center text-sm text-ink/70">No hay escalaciones con este filtro.</p>}
      </Panel>

      <div>
        <Boton variante="suave" onClick={() => {
          if (window.confirm("¿Borrar todo lo que marcaste en este navegador (hechos, tomadas, escalaciones)?")) reiniciar();
        }}>
          Reiniciar datos de prueba
        </Boton>
      </div>
    </div>
  );
}
