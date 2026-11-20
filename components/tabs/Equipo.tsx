"use client";

import { getPorPersona, type FiltroAgente } from "@/lib/data";
import { Boton } from "@/components/ui";
import type { DestinoHubSpot } from "@/components/Tablero";

export default function Equipo({
  agente,
  irAHubSpot,
}: {
  agente: FiltroAgente;
  irAHubSpot: (d: DestinoHubSpot, a?: FiltroAgente) => void;
}) {
  const personas = getPorPersona(agente);

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {personas.map((p) => {
        const metricas = [
          ["Cerrados hoy", p.cerradosHoy],
          ["Citas adelantadas", p.citasAdelantadas],
          ["Por cerrar", p.porCerrar],
          ["Por adelantar", p.porAdelantar],
        ] as const;
        return (
          <li key={p.nombre} className="flex flex-col rounded-2xl border border-ink/10 bg-white p-5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">{p.nombre}</h2>
              <span className="text-sm text-ink/70">{p.enfoque}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {metricas.map(([etiqueta, valor]) => (
                <div key={etiqueta} className="rounded-xl bg-offwhite p-3">
                  <dt className="text-xs font-semibold text-ink/70">{etiqueta}</dt>
                  <dd className="text-2xl font-bold tabular-nums text-teal">{valor}</dd>
                </div>
              ))}
            </dl>
            {p.diasGanados > 0 && (
              <p className="mt-3 text-sm text-ink/70">
                {p.diasGanados} días ganados para pacientes al adelantar citas.
              </p>
            )}
            <Boton
              variante="principal"
              className="mt-4"
              onClick={() => irAHubSpot({ vista: "cerrar" }, p.nombre)}
            >
              Ver sus tickets
            </Boton>
          </li>
        );
      })}
    </ul>
  );
}
