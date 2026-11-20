"use client";

import { useState } from "react";
import {
  COORDINADORAS,
  ETIQUETA_GRUPO_ADELANTAR,
  ETIQUETA_GRUPO_CERRAR,
  formatoFecha,
  getPorAdelantar,
  getPorCerrar,
  getRepartoAdelantar,
  getRepartoCerrar,
  getTicketUrl,
  type Coordinadora,
  type FiltroAdelantar,
  type FiltroAgente,
  type GrupoCerrar,
} from "@/lib/data";
import { useEstado } from "@/lib/estado";
import { AvisoEjemplo, Boton, Chip, DialogoOpciones, Etiqueta, Panel } from "@/components/ui";
import type { DestinoHubSpot } from "@/components/Tablero";

export type VistaHubSpot = "cerrar" | "adelantar";

const COLORES_GRUPO = ["#00547C", "#7F86D9", "#CAD1FB", "#414392"];

interface Fila {
  ticket: string;
  grupo: string;
  owner: string;
  cita: string | null;
  intentos: number;
  queHacer: string;
  enPausa?: boolean;
}

export default function HubSpot({
  agente,
  destino,
  onCambiarDestino,
}: {
  agente: FiltroAgente;
  destino: DestinoHubSpot;
  onCambiarDestino: (d: DestinoHubSpot) => void;
}) {
  const { esHecho, alternarHecho, escalar, yaEscalado } = useEstado();
  const [escalando, setEscalando] = useState<Fila | null>(null);
  const vista = destino.vista;

  const reparto = vista === "cerrar" ? getRepartoCerrar(agente) : getRepartoAdelantar(agente);
  const totalReparto = reparto.reduce((s, g) => s + g.total, 0);

  const filas: Fila[] =
    vista === "cerrar"
      ? getPorCerrar(agente, destino.grupoCerrar ?? undefined).map((t) => ({
          ticket: t.ticket,
          grupo: ETIQUETA_GRUPO_CERRAR[t.grupo],
          owner: t.owner,
          cita: t.cita,
          intentos: t.intentos,
          queHacer: t.que_hacer,
          enPausa: t.en_pausa,
        }))
      : getPorAdelantar(agente, destino.grupoAdelantar ?? undefined).map((t) => ({
          ticket: t.ticket,
          grupo: ETIQUETA_GRUPO_ADELANTAR[t.grupo],
          owner: t.owner,
          cita: t.cita,
          intentos: t.intentos,
          queHacer: t.labs_recibidos
            ? `Labs recibidos el ${formatoFecha(t.labs_recibidos)}: ofrecer una cita más cercana`
            : t.cita
              ? `Buscar un espacio antes del ${formatoFecha(t.cita)}`
              : "Sin cita: contactar para agendar",
        }));

  const hechos = filas.filter((f) => esHecho(f.ticket)).length;
  const sinContacto = getPorAdelantar(agente, "sin_contacto").length;

  const elegirGrupo = (clave: string | null) =>
    onCambiarDestino(
      vista === "cerrar"
        ? { vista, grupoCerrar: clave as GrupoCerrar | null }
        : { vista, grupoAdelantar: clave as FiltroAdelantar | null },
    );
  const grupoActivo = vista === "cerrar" ? destino.grupoCerrar ?? null : destino.grupoAdelantar ?? null;

  return (
    <div className="grid gap-6">
      <div role="group" aria-label="Tipo de lista" className="inline-flex w-full rounded-xl bg-white p-1 ring-1 ring-ink/10 sm:w-auto">
        {(
          [
            ["cerrar", "Por cerrar"],
            ["adelantar", "Por adelantar"],
          ] as const
        ).map(([v, etiqueta]) => (
          <button
            key={v}
            type="button"
            aria-pressed={vista === v}
            onClick={() => onCambiarDestino({ vista: v })}
            className={`min-h-11 flex-1 rounded-lg px-5 text-sm font-semibold sm:flex-none ${
              vista === v ? "bg-teal text-white" : "text-teal hover:bg-teal-suave"
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      <Panel titulo={`Reparto por grupo · ${totalReparto} tickets`}>
        {totalReparto > 0 ? (
          <>
            <div className="flex h-5 w-full gap-0.5 overflow-hidden rounded-md" aria-hidden="true">
              {reparto
                .filter((g) => g.total > 0)
                .map((g) => (
                  <div
                    key={g.clave}
                    title={`${g.etiqueta}: ${g.total}`}
                    style={{
                      flexGrow: g.total,
                      background: COLORES_GRUPO[reparto.findIndex((x) => x.clave === g.clave)],
                    }}
                  />
                ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {reparto.map((g, i) => (
                <li key={g.clave} className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ background: COLORES_GRUPO[i] }} aria-hidden="true" />
                  {g.etiqueta}: <strong className="tabular-nums">{g.total}</strong>
                  {totalReparto > 0 && (
                    <span className="text-ink/70">({Math.round((g.total / totalReparto) * 100)}%)</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-ink/70">Sin tickets en esta lista para {agente}.</p>
        )}
      </Panel>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtrar por grupo">
        <Chip activo={grupoActivo === null} onClick={() => elegirGrupo(null)} conteo={totalReparto}>
          Todos
        </Chip>
        {reparto.map((g) => (
          <Chip key={g.clave} activo={grupoActivo === g.clave} onClick={() => elegirGrupo(g.clave)} conteo={g.total}>
            {g.etiqueta}
          </Chip>
        ))}
        {vista === "adelantar" && (
          <Chip activo={grupoActivo === "sin_contacto"} onClick={() => elegirGrupo("sin_contacto")} conteo={sinContacto}>
            Sin contacto
          </Chip>
        )}
      </div>

      <Panel
        titulo={`${filas.length} tickets · hechos: ${hechos} de ${filas.length}`}
        nota={
          vista === "adelantar" && grupoActivo === "sin_contacto"
            ? "Sin contacto: tickets por adelantar con 0 intentos."
            : undefined
        }
      >
        <AvisoEjemplo>
          Datos de ejemplo con tickets anonimizados. Los links a HubSpot se activan en la etapa 2.
        </AvisoEjemplo>

        <div className="mt-4 hidden grid-cols-[4.5rem_7rem_8rem_1fr_5.5rem_5rem_4.5rem_7rem] gap-3 border-b border-ink/10 px-2 pb-2 text-xs font-semibold text-ink/70 lg:grid">
          <span>Hecho</span>
          <span>Ticket</span>
          <span>Grupo</span>
          <span>Qué hacer</span>
          <span>Owner</span>
          <span>Cita</span>
          <span>Intentos</span>
          <span className="sr-only">Acciones</span>
        </div>

        <ul className="divide-y divide-ink/10">
          {filas.map((f) => {
            const hecho = esHecho(f.ticket);
            const url = getTicketUrl(f.ticket);
            const escaladoA = yaEscalado(f.ticket);
            return (
              <li
                key={f.ticket}
                className={`grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-2 py-3 lg:grid-cols-[4.5rem_7rem_8rem_1fr_5.5rem_5rem_4.5rem_7rem] lg:items-center lg:gap-3 ${
                  hecho ? "bg-offwhite" : ""
                }`}
              >
                <label className="row-span-5 flex min-h-11 min-w-11 cursor-pointer items-center justify-center lg:row-span-1 lg:justify-start">
                  <input
                    type="checkbox"
                    checked={hecho}
                    onChange={() => alternarHecho(f.ticket)}
                    className="size-5 accent-teal"
                  />
                  <span className="sr-only">Marcar {f.ticket} como hecho</span>
                </label>

                <span className="font-semibold">
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer" className="text-teal underline">
                      {f.ticket}
                    </a>
                  ) : (
                    <span className={hecho ? "text-ink/60 line-through" : "text-teal"}>{f.ticket}</span>
                  )}
                </span>

                <span>
                  <Etiqueta tono="teal">{f.grupo}</Etiqueta>
                  {f.enPausa && (
                    <span className="ml-1">
                      <Etiqueta tono="neutro">En pausa</Etiqueta>
                    </span>
                  )}
                </span>

                <span className={`text-sm ${hecho ? "text-ink/60" : ""}`}>{f.queHacer}</span>

                <span className="text-sm">
                  <span className="text-ink/70 lg:hidden">Owner: </span>
                  {f.owner}
                </span>

                <span className="col-start-2 text-sm lg:col-start-auto">
                  <span className="text-ink/70 lg:hidden">Cita: </span>
                  {formatoFecha(f.cita)}
                </span>

                <span className="col-start-2 text-sm lg:col-start-auto">
                  <span className="text-ink/70 lg:hidden">Intentos: </span>
                  {f.intentos === 0 ? (
                    <Etiqueta tono="lilacFuerte">0</Etiqueta>
                  ) : (
                    <span className="tabular-nums">{f.intentos}</span>
                  )}
                </span>

                <span className="col-start-2 lg:col-start-auto">
                  {escaladoA ? (
                    <Etiqueta tono="lilac">Escalado a {escaladoA}</Etiqueta>
                  ) : (
                    <Boton onClick={() => setEscalando(f)} aria-label={`Escalar ${f.ticket}`}>
                      Escalar
                    </Boton>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        {filas.length === 0 && <p className="py-6 text-center text-sm text-ink/70">No hay tickets con este filtro.</p>}
      </Panel>

      <DialogoOpciones<Coordinadora>
        abierto={escalando !== null}
        titulo={`Escalar ${escalando?.ticket ?? ""}`}
        descripcion="¿A quién de coordinación se lo mandas? Si hay un riesgo clínico, lo decide el médico."
        opciones={COORDINADORAS.map((c) => ({ valor: c, etiqueta: `Escalar a ${c}` }))}
        onCerrar={() => setEscalando(null)}
        onElegir={(para) => {
          if (escalando) {
            escalar({
              para,
              motivo: vista === "cerrar" ? "Ticket por cerrar" : "Ticket por adelantar",
              titulo: escalando.queHacer,
              origen: escalando.ticket,
              escalo: escalando.owner,
            });
          }
          setEscalando(null);
        }}
      />
    </div>
  );
}
