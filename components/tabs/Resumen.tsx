"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getMotivosCierre,
  getPorPersona,
  getResumen,
  getSerieAbiertos,
  type Agente,
  type FiltroAgente,
} from "@/lib/data";
import { Panel } from "@/components/ui";
import type { DestinoHubSpot, Pestana } from "@/components/Tablero";

const C = {
  teal: "#00547C",
  lilacMedio: "#7F86D9",
  lilacSoft: "#CAD1FB",
  lilac: "#414392",
  grid: "#E6E4DE",
  texto: "#5B5B5B",
};

const ejeTick = { fill: C.texto, fontSize: 12 };
const tooltipEstilo = {
  contentStyle: { borderRadius: 8, border: "1px solid #E6E4DE", fontSize: 13 },
  cursor: { fill: "rgba(0,84,124,0.06)" },
};

export default function Resumen({
  agente,
  irA,
  irAHubSpot,
}: {
  agente: FiltroAgente;
  irA: (p: Pestana) => void;
  irAHubSpot: (d: DestinoHubSpot, a?: FiltroAgente) => void;
}) {
  const r = getResumen(agente);
  const serie = getSerieAbiertos();
  const motivos = getMotivosCierre(agente);
  const personas = getPorPersona(agente);

  const tarjetas = [
    {
      titulo: "Abiertos",
      valor: r.abiertos,
      detalle: `${r.porCerrar} por cerrar · ${r.porAdelantar} por adelantar`,
      ir: () => irAHubSpot({ vista: "cerrar" }),
    },
    {
      titulo: "Cerrados hoy",
      valor: r.cerradosHoy,
      detalle: agente === "Todos" ? `Récord anterior: ${r.equipo.record_anterior}` : "Ver en Equipo",
      ir: () => irA("equipo"),
    },
    {
      titulo: "Citas adelantadas",
      valor: r.citasAdelantadas,
      detalle: "Hoy · ver en Equipo",
      ir: () => irA("equipo"),
    },
    {
      titulo: "Por adelantar",
      valor: r.porAdelantar,
      detalle: "Primera vez, grupos A a D",
      ir: () => irAHubSpot({ vista: "adelantar" }),
    },
    {
      titulo: "Pedido Dra. Nat",
      valor: r.pedidoDraNat,
      detalle: "Grupo A: ya mandaron labs",
      ir: () => irAHubSpot({ vista: "adelantar", grupoAdelantar: "A" }),
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {tarjetas.map((t, i) => (
          <button
            key={t.titulo}
            type="button"
            onClick={t.ir}
            className={`group flex min-h-28 flex-col rounded-2xl border p-4 text-left transition-colors ${
              i === 0
                ? "col-span-2 border-teal bg-teal text-white hover:bg-teal-oscuro md:col-span-1"
                : "border-ink/10 bg-white hover:border-teal"
            }`}
          >
            <span className={`text-sm font-semibold ${i === 0 ? "text-white/90" : "text-ink/70"}`}>
              {t.titulo}
            </span>
            <span className={`mt-1 text-3xl font-bold tabular-nums ${i === 0 ? "" : "text-teal"}`}>
              {t.valor}
            </span>
            <span className={`mt-auto pt-2 text-xs ${i === 0 ? "text-white/85" : "text-ink/70"}`}>
              {t.detalle}
              <span aria-hidden="true" className="ml-1 group-hover:underline">
                ›
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          titulo="Tickets abiertos por corte"
          nota="Siempre de todo el equipo; no cambia con el filtro de agente."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serie} margin={{ top: 16, right: 16, bottom: 0, left: -16 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="corte" tick={ejeTick} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={12} />
                <YAxis tick={ejeTick} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={tooltipEstilo.contentStyle}
                  cursor={{ stroke: C.teal, strokeDasharray: "3 3" }}
                  formatter={(v) => [v, "Abiertos"]}
                />
                <Line
                  type="monotone"
                  dataKey="abiertos"
                  stroke={C.teal}
                  strokeWidth={2}
                  dot={{ r: 4, fill: C.teal, stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                >
                  <LabelList
                    dataKey="abiertos"
                    position="top"
                    content={(p) => {
                      const ultimo = p.index === serie.length - 1;
                      const pico = p.value === Math.max(...serie.map((s) => s.abiertos));
                      if (!ultimo && !pico) return null;
                      return (
                        <text x={Number(p.x)} y={Number(p.y) - 10} textAnchor="middle" fontSize={12} fontWeight={700} fill="#242424">
                          {p.value}
                        </text>
                      );
                    }}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-ink/70">
            Hoy: empezó con {r.equipo.abiertos_inicio}, entraron {r.equipo.nuevos}, se cerraron{" "}
            {r.equipo.cerrados} y quedan {r.equipo.abiertos_cierre}.
          </p>
        </Panel>

        <Panel
          titulo="Motivos de cierre de hoy"
          nota="Los motivos son inferidos a partir de las notas del ticket; pueden no ser exactos."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={motivos} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 8 }}>
                <CartesianGrid stroke={C.grid} horizontal={false} />
                <XAxis type="number" tick={ejeTick} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="etiqueta" tick={ejeTick} tickLine={false} axisLine={false} width={110} />
                <Tooltip {...tooltipEstilo} formatter={(v) => [v, "Tickets"]} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={22}>
                  {motivos.map((m) => (
                    <Cell key={m.clave} fill={m.clave === "cita_adelantada" ? C.lilac : C.lilacSoft} />
                  ))}
                  <LabelList dataKey="total" position="right" fill="#242424" fontSize={12} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-ink/70">
            Resaltado: <strong className="text-lilac">Cita adelantada</strong>, el resultado que buscamos.
          </p>
        </Panel>
      </div>

      <Panel
        titulo="Trabajo por persona"
        nota="Toca una persona para ver sus tickets en HubSpot."
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={personas}
              margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
              onClick={(e) => {
                const nombre = e?.activeLabel as Agente | undefined;
                if (nombre) irAHubSpot({ vista: "cerrar" }, nombre);
              }}
            >
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="nombre" tick={ejeTick} tickLine={false} axisLine={false} />
              <YAxis tick={ejeTick} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...tooltipEstilo} />
              <Legend wrapperStyle={{ fontSize: 13, color: "#242424" }} iconType="circle" />
              <Bar dataKey="cerradosHoy" name="Cerrados hoy" stackId="p" fill={C.teal} stroke="#fff" strokeWidth={2} className="cursor-pointer" />
              <Bar dataKey="porCerrar" name="Por cerrar" stackId="p" fill={C.lilacMedio} stroke="#fff" strokeWidth={2} className="cursor-pointer" />
              <Bar dataKey="porAdelantar" name="Por adelantar" stackId="p" fill={C.lilacSoft} stroke="#fff" strokeWidth={2} radius={[4, 4, 0, 0]} className="cursor-pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {personas.map((p) => (
            <li key={p.nombre}>
              <button
                type="button"
                onClick={() => irAHubSpot({ vista: "cerrar" }, p.nombre)}
                className="flex min-h-11 w-full flex-col rounded-lg border border-ink/10 px-3 py-2 text-left text-sm hover:border-teal"
              >
                <span className="font-semibold text-teal">Ver tickets de {p.nombre}</span>
                <span className="text-xs text-ink/70">
                  {p.cerradosHoy} cerrados · {p.porCerrar} por cerrar · {p.porAdelantar} por adelantar
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
