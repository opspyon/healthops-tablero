"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AGENTES,
  COORDINADORAS,
  getSolicitudesChat,
  type Agente,
  type Coordinadora,
  type FiltroAgente,
  type SolicitudChat,
} from "@/lib/data";
import { useEstado, type EstadoChat } from "@/lib/estado";
import { AvisoEjemplo, Boton, DialogoOpciones, Etiqueta, Panel } from "@/components/ui";

const ETIQUETA_ESTADO: Record<EstadoChat, string> = {
  nueva: "Nueva",
  tomada: "Tomada",
  resuelta: "Resuelta",
  escalada: "Escalada",
};

export default function Chat({ agente }: { agente: FiltroAgente }) {
  const estado = useEstado();
  const [tomando, setTomando] = useState<SolicitudChat | null>(null);
  const [escalando, setEscalando] = useState<SolicitudChat | null>(null);

  const todas = getSolicitudesChat();
  const visibles = todas.filter((s) => {
    if (agente === "Todos") return true;
    const e = estado.chat(s.id);
    return e.estado === "nueva" || e.tomadaPor === agente;
  });

  const porTipo = Object.entries(
    todas.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.tipo]: (acc[s.tipo] ?? 0) + 1 }), {}),
  )
    .map(([tipo, total]) => ({ tipo, total }))
    .sort((a, b) => b.total - a.total);

  const tomar = (s: SolicitudChat) => {
    if (agente === "Todos") setTomando(s);
    else estado.tomarChat(s.id, agente);
  };

  return (
    <div className="grid gap-6">
      <AvisoEjemplo>
        Datos de ejemplo. En la etapa 3 un bot de Google Chat registrará las solicitudes con formato{" "}
        <code className="font-semibold">#solicitud</code> de los espacios PX y Sales PX.
      </AvisoEjemplo>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Panel
          titulo={`Solicitudes · ${visibles.length}`}
          nota={agente === "Todos" ? undefined : `Se muestran las que nadie ha tomado y las que tomó ${agente}.`}
        >
          <ul className="grid gap-3">
            {visibles.map((s) => {
              const e = estado.chat(s.id);
              const cerrada = e.estado === "resuelta" || e.estado === "escalada";
              return (
                <li key={s.id} className={`rounded-xl border border-ink/10 p-4 ${cerrada ? "bg-offwhite" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-teal">{s.id}</span>
                    <Etiqueta tono={s.urgencia === "Alta" ? "lilacFuerte" : "lilac"}>Urgencia {s.urgencia.toLowerCase()}</Etiqueta>
                    <Etiqueta tono="neutro">{ETIQUETA_ESTADO[e.estado]}</Etiqueta>
                  </div>
                  <p className="mt-2 font-semibold">{s.tipo}</p>
                  <p className="text-sm text-ink/70">
                    Espacio {s.espacio} · hace {s.hace}
                    {e.tomadaPor && ` · la tomó ${e.tomadaPor}`}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Boton variante="principal" disabled={e.estado !== "nueva"} onClick={() => tomar(s)}>
                      Tomar
                    </Boton>
                    <Boton disabled={cerrada} onClick={() => estado.resolverChat(s.id)}>
                      Resolver
                    </Boton>
                    <Boton disabled={cerrada} onClick={() => setEscalando(s)}>
                      Escalar
                    </Boton>
                    <Boton
                      variante="suave"
                      disabled
                      title="Disponible cuando el bot de Google Chat esté conectado (etapa 3)"
                    >
                      Ver hilo
                    </Boton>
                  </div>
                </li>
              );
            })}
          </ul>
          {visibles.length === 0 && <p className="py-6 text-center text-sm text-ink/70">No hay solicitudes para mostrar.</p>}
        </Panel>

        <Panel titulo="Qué piden más" nota="Todas las solicitudes de ejemplo, por tipo.">
          <div style={{ height: Math.max(160, porTipo.length * 40) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porTipo} layout="vertical" margin={{ top: 0, right: 28, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#E6E4DE" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: "#5B5B5B", fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="tipo" width={150} tick={{ fill: "#5B5B5B", fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(0,84,124,0.06)" }} formatter={(v) => [v, "Solicitudes"]} />
                <Bar dataKey="total" fill="#00547C" radius={[0, 4, 4, 0]} barSize={20}>
                  <LabelList dataKey="total" position="right" fill="#242424" fontSize={12} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <DialogoOpciones<Agente>
        abierto={tomando !== null}
        titulo={`¿Quién toma ${tomando?.id ?? ""}?`}
        descripcion="Elige a la persona del equipo que se hará cargo."
        opciones={AGENTES.map((a) => ({ valor: a, etiqueta: a }))}
        onCerrar={() => setTomando(null)}
        onElegir={(a) => {
          if (tomando) estado.tomarChat(tomando.id, a);
          setTomando(null);
        }}
      />

      <DialogoOpciones<Coordinadora>
        abierto={escalando !== null}
        titulo={`Escalar ${escalando?.id ?? ""}`}
        descripcion="¿A quién de coordinación se lo mandas? Si hay un riesgo clínico, lo decide el médico."
        opciones={COORDINADORAS.map((c) => ({ valor: c, etiqueta: `Escalar a ${c}` }))}
        onCerrar={() => setEscalando(null)}
        onElegir={(para) => {
          if (escalando) {
            const e = estado.chat(escalando.id);
            estado.escalar(
              {
                para,
                motivo: escalando.tipo,
                titulo: `Solicitud de Chat: ${escalando.tipo}`,
                origen: `Chat ${escalando.id}`,
                escalo: e.tomadaPor ?? (agente === "Todos" ? "Equipo" : agente),
              },
              escalando.id,
            );
          }
          setEscalando(null);
        }}
      />
    </div>
  );
}
