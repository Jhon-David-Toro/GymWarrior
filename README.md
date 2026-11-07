<div align="center">
  <img src="public/brand/logo.png" alt="GymWarrior" width="96" height="96" />

# GymWarrior

Plataforma web para un gimnasio de barrio: planes en línea, tienda de suplementos,
calculadoras de salud y panel de administración.

[![CI](https://github.com/Jhon-David-Toro/GymWarrior/actions/workflows/ci.yml/badge.svg)](https://github.com/Jhon-David-Toro/GymWarrior/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-Modules-cc6699?logo=sass&logoColor=white)

</div>

---

> **v2 — reescritura completa.** La versión original (2024) era PHP sin framework + MySQL.
> Esta versión conserva la idea y el contenido, pero rehace todo con un stack moderno,
> seguridad real y buenas prácticas. Ver [qué cambió](#de-la-v1-a-la-v2).

## Funcionalidades

| Área               | Qué incluye                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sitio público**  | Landing con horario, planes, entrenadores, productos destacados y formulario de contacto (con honeypot y rate limit).                             |
| **Planes**         | Bronce, VIP y Gold. Inscripción en línea con validación de plan activo y fecha de vencimiento.                                                    |
| **Tienda**         | Catálogo filtrable por categoría, detalle de producto, carrito persistente y checkout transaccional con control de stock.                         |
| **Herramientas**   | Calculadora de IMC (clasificación OMS + escala visual) y de calorías (Mifflin-St Jeor + macros). Historial guardado por usuario.                  |
| **Cuenta**         | Registro/login, plan activo y días restantes, historial de mediciones y pedidos.                                                                  |
| **Administración** | Métricas (ventas, pedidos, socios), alertas de stock bajo, CRUD de productos y gestión de estados de pedidos con devolución de stock al cancelar. |

## Stack

- **[Next.js 16](https://nextjs.org/)** (App Router, Server Components, Server Actions, Cache Components / PPR, `typedRoutes`)
- **TypeScript** en modo estricto (`noUncheckedIndexedAccess`)
- **[Drizzle ORM](https://orm.drizzle.team/)** + **PostgreSQL** — esquema tipado, migraciones versionadas, constraints `CHECK`
- **[Better Auth](https://www.better-auth.com/)** — sesiones en base de datos, contraseñas con scrypt, cookies seguras
- **[Zod](https://zod.dev/)** — validación compartida entre cliente y servidor
- **[Zustand](https://zustand.docs.pmnd.rs/)** — carrito persistido en `localStorage`
- **SCSS Modules** — tokens como CSS custom properties, mixins y breakpoints compartidos
- **Vitest + Testing Library** — tests unitarios y de componentes
- **ESLint, Stylelint, Prettier, Husky, lint-staged, Commitlint** y **GitHub Actions**

## Empezar

Requisitos: **Node 22+**, **pnpm 10+** y **Docker** (o un PostgreSQL 16 propio).

```bash
# 1. Dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env
#    → genera BETTER_AUTH_SECRET con: openssl rand -base64 32

# 3. Base de datos
docker compose up -d
pnpm db:setup          # aplica migraciones y carga datos de demostración

# 4. Arrancar
pnpm dev               # http://localhost:3000
```

El seed crea un administrador con las credenciales de `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
(por defecto `admin@gymwarrior.co` / `Admin12345!`). **Cámbialas antes de desplegar.**

## Scripts

| Comando                                                | Descripción                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `pnpm dev`                                             | Servidor de desarrollo                                                               |
| `pnpm build` / `pnpm start`                            | Build y servidor de producción (el build lee el catálogo, necesita la base de datos) |
| `pnpm check`                                           | Lint + estilos + tipos + tests (lo mismo que corre CI)                               |
| `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` | Tests                                                                                |
| `pnpm lint` / `pnpm lint:styles` / `pnpm format`       | Calidad de código                                                                    |
| `pnpm db:generate`                                     | Genera una migración a partir de cambios en `schema.ts`                              |
| `pnpm db:migrate` / `pnpm db:seed` / `pnpm db:setup`   | Migrar / sembrar / ambos                                                             |
| `pnpm db:studio`                                       | Explorador visual de la base de datos                                                |

## Estructura

```
src/
├── app/                 # Rutas (App Router). Solo composición: sin lógica de negocio
│   ├── admin/           # Panel de administración
│   ├── cuenta/          # Área privada del usuario
│   ├── tienda/          # Catálogo y detalle de producto
│   ├── herramientas/    # Calculadoras de IMC y calorías
│   └── api/auth/        # Handler de Better Auth
├── components/ui/       # Primitivas de interfaz (botón, campos, badges…)
├── features/            # Componentes por dominio (cart, shop, plans, health, account, admin…)
├── lib/                 # Código puro y compartido: validaciones, cálculos, formato
├── server/
│   ├── actions/         # Server Actions (mutaciones)
│   ├── auth/            # Configuración de auth y Data Access Layer de sesión
│   ├── db/              # Esquema Drizzle y cliente
│   └── queries/         # Lecturas (catálogo cacheado, datos privados, admin)
├── styles/              # Tokens, mixins y estilos globales SCSS
└── proxy.ts             # Redirección optimista de rutas privadas
drizzle/                 # Migraciones SQL versionadas
scripts/seed.ts          # Datos de demostración (idempotente)
```

Más detalle en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Seguridad

- **Contraseñas** con scrypt (Better Auth) — la v1 usaba SHA-256 sin sal.
- **Consultas parametrizadas** (Drizzle) — la v1 concatenaba variables en SQL (inyección SQL).
- **Autorización en el servidor**: cada página privada y cada Server Action vuelve a comprobar la sesión y el rol (`requireUser` / `requireAdmin`). El `proxy.ts` solo hace una redirección optimista.
- **Precios desde la base de datos**: el cliente solo envía `productId` y cantidad; el total se calcula en el servidor dentro de una transacción con `SELECT … FOR UPDATE`.
- **Rate limiting** en login, registro y contacto; mensajes de error que no revelan si un correo existe.
- **Validación con Zod** de toda entrada, protección contra open redirects y cabeceras de seguridad (`X-Frame-Options`, `HSTS`, `Referrer-Policy`, `Permissions-Policy`).
- **Variables de entorno validadas** al arrancar (`src/env.ts`).

## De la v1 a la v2

|                         | v1 (2024)                                            | v2                                                       |
| ----------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Stack                   | PHP sin framework, MySQL, JS suelto                  | Next.js 16, TypeScript, PostgreSQL, Drizzle              |
| Contraseñas             | SHA-256 sin sal                                      | scrypt + sesiones en BD                                  |
| SQL                     | Concatenación de strings                             | Consultas parametrizadas y tipadas                       |
| Tienda                  | Precios en HTML, sin stock ni pedidos reales         | Catálogo en BD, stock transaccional, pedidos e historial |
| Calculadora de calorías | Etiquetada Harris-Benedict, fórmula Mifflin a medias | Mifflin-St Jeor completa + macros y mínimos de seguridad |
| IMC                     | Valores como 24,95 quedaban sin clasificar           | Clasificación OMS completa y probada                     |
| Estilos                 | CSS duplicado por página                             | SCSS Modules con tokens y mixins                         |
| Calidad                 | —                                                    | Tests, lint, tipos estrictos, CI                         |

## Despliegue

Pensado para **Vercel + Neon/Supabase (PostgreSQL)**:

1. Crea la base de datos y define `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` y `NEXT_PUBLIC_APP_URL`.
2. Ejecuta `pnpm db:setup` contra esa base.
3. Despliega. El build necesita acceso a la base para prerenderizar el catálogo.

> El rate limiter es en memoria (una instancia). Para varias instancias o serverless,
> cámbialo por Redis/Upstash en `src/server/rate-limit.ts` (misma interfaz).

## Notas

Proyecto de portafolio. **Los pagos son simulados**: no se integra ninguna pasarela real
(el punto de integración está documentado en `src/server/actions/membership.ts` y `checkout.ts`).
Los entrenadores son personajes ficticios; las imágenes de producto son las del proyecto original.

## Licencia

[MIT](LICENSE) © Jhon David Toro
