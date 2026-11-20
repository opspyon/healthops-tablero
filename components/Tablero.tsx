"use client";

import { useState } from "react";
import { AGENTES, getCorte, type FiltroAdelantar, type FiltroAgente, type GrupoCerrar } from "@/lib/data";
import { ProveedorEstado } from "@/lib/estado";
import { Chip } from "@/components/ui";
import Resumen from "@/components/tabs/Resumen";
import HubSpot, { type VistaHubSpot } from "@/components/tabs/HubSpot";
import Chat from "@/components/tabs/Chat";
import Equipo from "@/components/tabs/Equipo";
import Escalaciones from "@/components/tabs/Escalaciones";

export type Pestana = "resumen" | "hubspot" | "chat" | "equipo" | "escalaciones";

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "hubspot", etiqueta: "HubSpot" },
  { id: "chat", etiqueta: "Chat" },
  { id: "equipo", etiqueta: "Equipo" },
  { id: "escalaciones", etiqueta: "Escalaciones" },
];

export interface DestinoHubSpot {
  vista: VistaHubSpot;
  grupoCerrar?: GrupoCerrar | null;
  grupoAdelantar?: FiltroAdelantar | null;
}

export default function Tablero() {
  const [agente, setAgente] = useState<FiltroAgente>("Todos");
  const [pestana, setPestana] = useState<Pestana>("resumen");
  const [hubspot, setHubspot] = useState<DestinoHubSpot>({ vista: "cerrar" });
  const corte = getCorte();

  const irA = (p: Pestana) => {
    setPestana(p);
    window.scrollTo({ top: 0 });
  };
  const irAHubSpot = (destino: DestinoHubSpot, nuevoAgente?: FiltroAgente) => {
    setHubspot(destino);
    if (nuevoAgente) setAgente(nuevoAgente);
    irA("hubspot");
  };

  return (
    <ProveedorEstado>
      <header className="bg-teal text-white">
        <div className="mx-auto max-w-6xl px-4 pt-5 pb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h1 className="text-xl font-bold sm:text-2xl">Tablero HealthOps</h1>
            <p className="text-sm text-white/85">Corte: {corte.etiqueta} · datos de ejemplo</p>
          </div>

          <div className="mt-4">
            <p id="filtro-agente" className="mb-2 text-sm font-semibold text-white/90">
              Agente
            </p>
            <div
              role="group"
              aria-labelledby="filtro-agente"
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
            >
              {(["Todos", ...AGENTES] as FiltroAgente[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-pressed={agente === a}
                  onClick={() => setAgente(a)}
                  className={`min-h-11 shrink-0 rounded-full border-2 px-4 text-sm font-semibold transition-colors ${
                    agente === a
                      ? "border-white bg-white text-teal"
                      : "border-white/40 text-white hover:border-white"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <nav className="border-t border-white/15">
          <div
            role="tablist"
            aria-label="Secciones del tablero"
            className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2"
          >
            {PESTANAS.map((p) => (
              <button
                key={p.id}
                id={`tab-${p.id}`}
                type="button"
                role="tab"
                aria-selected={pestana === p.id}
                aria-controls="panel-principal"
                onClick={() => irA(p.id)}
                className={`min-h-12 shrink-0 border-b-4 px-4 text-sm font-semibold transition-colors ${
                  pestana === p.id
                    ? "border-lilac-soft text-white"
                    : "border-transparent text-white/75 hover:text-white"
                }`}
              >
                {p.etiqueta}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main
        id="panel-principal"
        role="tabpanel"
        aria-labelledby={`tab-${pestana}`}
        className="mx-auto max-w-6xl px-4 py-6"
      >
        {agente !== "Todos" && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="text-sm">
              Viendo solo a <strong>{agente}</strong>.
            </p>
            <Chip activo={false} onClick={() => setAgente("Todos")}>
              Ver a todo el equipo
            </Chip>
          </div>
        )}

        {pestana === "resumen" && (
          <Resumen agente={agente} irA={irA} irAHubSpot={irAHubSpot} />
        )}
        {pestana === "hubspot" && (
          <HubSpot agente={agente} destino={hubspot} onCambiarDestino={setHubspot} />
        )}
        {pestana === "chat" && <Chat agente={agente} />}
        {pestana === "equipo" && <Equipo agente={agente} irAHubSpot={irAHubSpot} />}
        {pestana === "escalaciones" && <Escalaciones agente={agente} />}
      </main>
    </ProveedorEstado>
  );
}
