"use client";

import { useEffect, useRef } from "react";

type Variante = "principal" | "secundario" | "suave";

const VARIANTES: Record<Variante, string> = {
  principal: "bg-teal text-white hover:bg-teal-oscuro",
  secundario: "border-2 border-teal text-teal bg-white hover:bg-teal-suave",
  suave: "text-teal underline-offset-4 hover:underline",
};

export function Boton({
  variante = "secundario",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
      {...props}
    />
  );
}

/** Botón tipo chip, con estado presionado (para filtros). */
export function Chip({
  activo,
  children,
  onClick,
  conteo,
}: {
  activo: boolean;
  children: React.ReactNode;
  onClick: () => void;
  conteo?: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-colors ${
        activo
          ? "border-teal bg-teal text-white"
          : "border-teal/30 bg-white text-teal hover:border-teal"
      }`}
    >
      {children}
      {conteo !== undefined && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            activo ? "bg-white/20 text-white" : "bg-teal-suave text-teal"
          }`}
        >
          {conteo}
        </span>
      )}
    </button>
  );
}

export function Panel({
  titulo,
  nota,
  children,
  className = "",
}: {
  titulo?: string;
  nota?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-ink/10 bg-white p-4 sm:p-5 ${className}`}>
      {titulo && <h2 className="text-base font-bold text-ink">{titulo}</h2>}
      {nota && <p className="mt-1 text-sm text-ink/70">{nota}</p>}
      <div className={titulo || nota ? "mt-4" : ""}>{children}</div>
    </section>
  );
}

export function Etiqueta({
  children,
  tono = "teal",
}: {
  children: React.ReactNode;
  tono?: "teal" | "lilac" | "lilacFuerte" | "neutro";
}) {
  const tonos = {
    teal: "bg-teal-suave text-teal",
    lilac: "bg-lilac-soft text-lilac",
    lilacFuerte: "bg-lilac text-white",
    neutro: "bg-ink/5 text-ink/80",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tonos[tono]}`}>
      {children}
    </span>
  );
}

export function AvisoEjemplo({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-lilac/30 bg-lilac-soft/40 px-3 py-2 text-sm text-lilac">
      {children}
    </p>
  );
}

/** Diálogo accesible para elegir una opción (por ejemplo, Ari o Grace). */
export function DialogoOpciones<T extends string>({
  abierto,
  titulo,
  descripcion,
  opciones,
  onElegir,
  onCerrar,
}: {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  opciones: { valor: T; etiqueta: string }[];
  onElegir: (valor: T) => void;
  onCerrar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      aria-labelledby="dialogo-titulo"
      className="m-auto w-[min(92vw,26rem)] rounded-2xl bg-white p-5 text-ink shadow-xl"
    >
      <h2 id="dialogo-titulo" className="text-lg font-bold">
        {titulo}
      </h2>
      {descripcion && <p className="mt-1 text-sm text-ink/70">{descripcion}</p>}
      <div className="mt-4 grid gap-2">
        {opciones.map((o) => (
          <Boton key={o.valor} variante="principal" onClick={() => onElegir(o.valor)}>
            {o.etiqueta}
          </Boton>
        ))}
        <Boton variante="suave" onClick={onCerrar}>
          Cancelar
        </Boton>
      </div>
    </dialog>
  );
}
