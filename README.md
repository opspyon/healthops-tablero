# Tablero HealthOps · Clivi

Prototipo del tablero de HealthOps: tickets de HubSpot "Adelantar cita", solicitudes de Google Chat y escalaciones a coordinación.

- Contexto completo para Claude Code: `CLAUDE.md`
- Primer prompt: `docs/PROMPT-ETAPA-1.md`
- Datos de ejemplo (anonimizados): `data/ejemplo-19nov.json`

## Cómo correrlo

Necesitas Node.js (versión LTS) y npm.

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Lo que marques (Hecho, Tomar, Resolver, Escalar, Atender) se guarda solo en tu navegador; el botón "Reiniciar datos de prueba" en Escalaciones lo borra.

## Etapas

1. Prototipo local con datos de ejemplo (este repositorio).
2. Vercel + HubSpot (solo lectura) + base de datos + inicio de sesión con Google.
3. Bot de Google Chat.

## Importante

Repositorio privado. No subir datos reales de pacientes, tokens ni llaves.
