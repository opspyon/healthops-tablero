# Primer prompt para Claude Code (etapa 1)

Copia y pega esto en Claude Code, dentro de la carpeta del repositorio:

---

Lee CLAUDE.md y data/ejemplo-19nov.json. Quiero construir la etapa 1 del tablero de HealthOps.

1. Crea un proyecto Next.js (App Router) con TypeScript y Tailwind en esta carpeta, sin borrar CLAUDE.md, data/ ni docs/.
2. Crea `lib/data.ts` con tipos de TypeScript y funciones que lean `data/ejemplo-19nov.json` (por ejemplo `getResumen(agente)`, `getPorCerrar(agente, grupo)`, `getPorAdelantar(agente, grupo)`). Las pantallas solo deben usar estas funciones.
3. Construye la página principal con las 5 pestañas y el filtro global por agente que describe CLAUDE.md, con los colores y la tipografía de Clivi.
4. Las acciones (Hecho, Tomar, Resolver, Escalar, Atender) por ahora guardan su estado en el navegador (localStorage) para que se pueda probar.
5. Usa Recharts para la línea de tickets abiertos y las barras.
6. Al terminar, dime cómo correrlo (`npm run dev`) y haz un commit con un mensaje en español.

Antes de escribir código, muéstrame el plan de archivos y espera mi OK.

---

## Siguientes prompts sugeridos

- "Revisa que todo funcione en celular y corrige lo que se vea mal."
- "Agrega pruebas sencillas a lib/data.ts para que los totales cuadren con el JSON."
- "Prepara un README con cómo correr el proyecto y qué falta para la etapa 2."
