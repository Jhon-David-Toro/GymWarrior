# Arquitectura

## Visión general

```
Navegador ──► proxy.ts (redirección optimista de /cuenta y /admin)
          ──► Server Components ──► server/queries ──► Drizzle ──► PostgreSQL
          ──► Server Actions    ──► server/actions ──► Drizzle ──► PostgreSQL
          ──► /api/auth/*       ──► Better Auth
```

Todo corre en un solo proyecto Next.js. No hay API REST propia: las lecturas ocurren en Server
Components y las escrituras en Server Actions, lo que da tipos de punta a punta y elimina una capa
de serialización.

## Decisiones

### Cache Components y renderizado parcial

`cacheComponents` está activo. Las lecturas públicas del catálogo (`server/queries/catalog.ts`)
usan `"use cache"` con `cacheTag` y `cacheLife`, así la landing, la tienda y cada producto se
prerenderizan. Cuando cambia un precio o el stock, la acción correspondiente llama
`updateTag("products")` y la siguiente visita ya ve los datos nuevos.

Todo lo que depende de la sesión (menú de usuario, cuenta, carrito, admin) se lee dentro de
`<Suspense>`: el armazón de la página sale estático e instantáneo y la parte personal llega
en streaming.

### Autorización en capas

1. `proxy.ts` mira si existe la cookie de sesión y redirige al login. Es solo una mejora de UX.
2. `server/auth/session.ts` es el **Data Access Layer**: `getCurrentUser` (memoizado por request),
   `requireUser` y `requireAdmin`.
3. Cada query privada y cada Server Action llama a esas funciones. Las queries de cuenta filtran
   siempre por el `id` del usuario de la sesión, nunca por un id recibido del cliente.

### Checkout transaccional

`checkoutAction` recibe solo `{ productId, quantity }[]`. Dentro de una transacción:

1. Bloquea las filas de producto (`SELECT … FOR UPDATE`).
2. Verifica que existan, estén activos y tengan stock.
3. Calcula el total con los precios de la base.
4. Crea el pedido y sus ítems (con copia del nombre y precio unitario para el histórico).
5. Descuenta el stock.

Un `CHECK (stock >= 0)` en la tabla actúa como red de seguridad adicional.

### Por qué Drizzle

Es TypeScript puro (sin binarios ni generación de cliente), el SQL resultante es predecible,
las migraciones son archivos SQL legibles en `drizzle/` y Better Auth tiene adaptador oficial.

### Estilos

SCSS Modules: CSS con alcance local por componente y cero runtime. Los valores de diseño viven
como custom properties en `styles/globals.scss` (colores, radios, fuentes) y como variables SCSS
en `styles/_tokens.scss` (escala tipográfica, breakpoints). Los mixins (`up`, `surface`,
`focus-ring`, `hover`…) están en `styles/_mixins.scss`.

## Modelo de datos

```
user ─┬─< session
      ├─< account           (Better Auth: credenciales)
      ├─< order ─< order_item >─ product
      ├─< membership >─ plan
      └─< health_record     (IMC / calorías)

trainer, contact_message    (independientes)
```

## Pendiente / siguientes pasos

- Pasarela de pagos real (Wompi o Mercado Pago) con activación por webhook.
- Rate limiting distribuido (Redis/Upstash) para despliegues multi-instancia.
- Verificación de correo y recuperación de contraseña (Better Auth ya lo soporta; falta proveedor de email).
- Tests end-to-end con Playwright en CI.
