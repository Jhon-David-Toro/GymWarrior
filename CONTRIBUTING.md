# Cómo contribuir

## Flujo de trabajo

1. Crea una rama desde `main`: `feat/nombre-corto`, `fix/…`, `chore/…`.
2. Haz commits pequeños con [Conventional Commits](https://www.conventionalcommits.org/es/)
   (`feat: agrega filtro por precio`). Commitlint lo valida en cada commit.
3. Antes de abrir el PR ejecuta `pnpm check`.
4. Abre el PR usando la plantilla. CI debe pasar antes de hacer merge.

## Convenciones

- **Código en inglés, interfaz en español.** Nombres de variables, funciones y archivos en inglés;
  textos visibles, comentarios de negocio y mensajes de error en español.
- **Archivos en `kebab-case`**, componentes en `PascalCase`, clases SCSS en `camelCase`.
- **Rutas (`src/app`) solo componen.** La lógica va en `features/`, `lib/` o `server/`.
- **Lecturas en `server/queries`, mutaciones en `server/actions`.** Ninguna acción confía en datos
  del cliente sin validarlos con Zod, y todas comprueban permisos con `requireUser` / `requireAdmin`.
- **Estilos:** un `*.module.scss` por componente o feature. Empieza cada módulo con
  `@use "abstracts" as *;` para acceder a tokens (`$text-lg`, `$header-height`…) y mixins
  (`up("md")`, `surface`, `focus-ring`…). Los colores se usan como `var(--color-*)`.
- **Base de datos:** cambia `src/server/db/schema.ts` y genera la migración con `pnpm db:generate`.
  Nunca edites una migración ya publicada.

## Tests

- Lógica pura (`lib/`) → test unitario junto al archivo (`*.test.ts`).
- Componentes interactivos → Testing Library, consultando por rol y etiqueta accesible.
