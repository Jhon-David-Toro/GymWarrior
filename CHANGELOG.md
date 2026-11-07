# Changelog

## 2.0.0 — 2026-11-07

Reescritura completa del proyecto.

- Migración de PHP + MySQL a Next.js 16 + TypeScript + PostgreSQL (Drizzle ORM).
- Autenticación con Better Auth: contraseñas con scrypt, sesiones en base de datos y rate limiting.
- Tienda con catálogo en base de datos, carrito persistente y checkout transaccional con stock.
- Inscripción a planes en línea y área de cuenta con pedidos e historial de salud.
- Calculadoras de IMC (OMS) y calorías (Mifflin-St Jeor) corregidas y con tests.
- Panel de administración: métricas, productos y pedidos.
- Diseño nuevo con SCSS Modules, accesible y responsive.
- Tests (Vitest + Testing Library), ESLint, Stylelint, Prettier, Husky, Commitlint y CI en GitHub Actions.

## 1.0.0 — 2024-06

Versión original en PHP sin framework.
