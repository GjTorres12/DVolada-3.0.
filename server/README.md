# Dvolada Online API — primera implementación aislada

**No desplegado ni conectado al frontend.** API de prueba con Node.js + PostgreSQL, separada del plan Local. La web estática de GitHub Pages no ejecuta este servidor.

## Preparación
1. Crear una base PostgreSQL de pruebas y aplicar `sql/001_online_core.sql`.
2. En `server/`, ejecutar `npm install`.
3. Configurar `DATABASE_URL`, `DVOLADA_JWT_SECRET` (mínimo 32 bytes aleatorios), `DVOLADA_JWT_ISSUER`, `DVOLADA_JWT_AUDIENCE` y `PORT`.
4. Ejecutar `npm run check` y `npm start`.
5. Un servicio de identidad **todavía pendiente** debe emitir JWT HS256 con `sub` UUID de usuario, `restaurant_id` UUID y `permissions` (online:orders:read, online:orders:write). No emitir tokens en el frontend.

## Implementado en este primer corte
- `GET /health` comprueba la conexión SQL.
- `GET /api/v1/restaurant/capabilities` verifica que el plan permita Online.
- `GET /api/v1/restaurant/orders` devuelve hasta 100 pedidos del restaurante autenticado.
- `PATCH /api/v1/restaurant/orders/:id/status` exige versión y clave de idempotencia; usa transacción y bloqueo de fila, devuelve 409 si otro empleado cambió el pedido. Registra eventos.

## Pendiente antes de producción
- Autenticación completa y sesiones de dispositivos; revocación de usuarios y permisos consultados en base de datos (actualmente los permisos proceden del JWT).
- Protección de despliegue HTTPS, CORS restringido, rate limiting, métricas y auditoría operacional.
- Cursor paginado real, consulta de eventos y sincronización SSE/polling, recuperación offline, esquema completo de items y pedidos, integración con frontend.
- Pruebas automatizadas, pruebas con dos dispositivos y despliegue del servicio.
- Las rutas de transición de estado son iniciales; revisar flujos de cancelación, entrega y repartidor antes de usarlas en producción.

**No introducir credenciales reales ni datos de clientes en pruebas.**
