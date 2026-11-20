# Tablero HealthOps · Clivi

Contexto para Claude Code. Léelo antes de cualquier cambio.

## Qué es

Tablero interno del equipo de Health Operations (HealthOps) de Clivi para dar seguimiento a:

1. **Tickets de HubSpot "SAS-Adelantar cita"**: los que hay que cerrar (duplicados, cita cercana, validar, sin respuesta) y los pacientes de primera vez a los que hay que adelantar la cita (grupos A, B, C, D).
2. **Solicitudes que llegan por Google Chat** (espacios de PX y Sales PX), con el formato fijo `#solicitud`.
3. **Escalaciones a coordinación** (Ari o Grace).

Responsable del proyecto: Ariadna Cárdenas (Ari), HealthOps.

## Etapas

- **Etapa 1 (ahora):** prototipo local en este repositorio con datos de ejemplo (`data/ejemplo-19nov.json`). Sin servicios externos.
- **Etapa 2:** despliegue en Vercel, lectura de HubSpot (solo lectura), base de datos para estados e historial, inicio de sesión con Google solo para `@clivi.com.mx`.
- **Etapa 3:** bot de Google Chat (Google Cloud + Workspace Events API) que registra las solicitudes.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS.
- Gráficas con Recharts.
- Toda la lectura de datos pasa por `lib/data.ts`. En la etapa 1 lee el JSON de ejemplo; en la etapa 2 se cambia por HubSpot y la base de datos sin tocar las pantallas.

## Pantallas (una sola página con pestañas)

- Filtro global por agente arriba: Todos, Janet, Brenda, Aureni, Eduardo, Lulú. Aplica en TODAS las pestañas.
- **Resumen:** 5 tarjetas clicables (Abiertos, Cerrados hoy, Citas adelantadas, Por adelantar, Pedido Dra. Nat) que llevan a su lista; gráfica de línea de tickets abiertos por corte (siempre de todo el equipo, indicarlo); barras de motivos de cierre (resaltar "Cita adelantada"); barras apiladas por persona (cerrados hoy, por cerrar, por adelantar). Al tocar una persona se filtra y se va a HubSpot.
- **HubSpot:** toggle "Por cerrar" / "Por adelantar"; barra de reparto por grupo; chips de grupo (y "Sin contacto" en Adelantar); tabla con casilla "Hecho", link al ticket, grupo, qué hacer, owner, cita, intentos (0 en morado) y botón "Escalar" (elige Ari o Grace).
- **Chat:** solicitudes con botones Tomar, Resolver, Escalar y "Ver hilo"; gráfica de qué piden más. Marcar como datos de ejemplo.
- **Equipo:** tarjeta por persona con cerrados hoy, citas adelantadas, por cerrar, por adelantar y botón "Ver sus tickets".
- **Escalaciones:** contadores (abiertas para Ari, para Grace, resueltas hoy), filtro "Para" (Todas, Ari, Grace), lista con Atender y Resolver.

## Marca (sistema de diseño Clivi)

- Teal `#00547C` (principal), Off White `#F8F7F4` (fondo), Lilac deep `#414392`, Lilac soft `#CAD1FB`, Ink `#242424`, blanco.
- Tipografía Public Sans (Google Fonts).
- Sin colores semánticos rojo/verde: usar etiquetas claras y teal/lilac.
- Sin emojis en la interfaz.

## Reglas

- **Nunca subir datos reales de pacientes, tokens ni llaves** a este repositorio. Las llaves van en variables de entorno (`.env.local`, ya en `.gitignore`).
- Español de México en toda la interfaz.
- Accesible: botones reales (`<button>`), objetivos táctiles de 44 px, contraste AA, funciona en celular.
- Los motivos de cierre son inferidos; decirlo en la interfaz.
- Nada de decisiones clínicas en el producto: un riesgo clínico se escala y lo decide el médico.
- Cambios pequeños y en ramas; commits descriptivos en español.
