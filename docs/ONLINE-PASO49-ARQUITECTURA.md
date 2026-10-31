# Dvolada · Servicio central de pedidos Online (Paso 49)

Estado: **contrato técnico propuesto; NO implementado ni desplegado**. El frontend actual en GitHub Pages sigue siendo una demostración. Esta especificación no habilita sincronización por sí sola.

## Separación de planes
- `ONLINE`: pedidos por internet, menú publicado, comandas Online, tiempos, disponibilidad y personal Online. No requiere instalación Local.
- `LOCAL`: caja, mesas, ventas presenciales, inventario y operación local. Sin acceso a pedidos Online salvo que contrate Plus.
- `PLUS`: ambas capacidades, con el mismo servicio central de pedidos Online que utiliza ONLINE. Las ventas locales son entidades separadas; la integración no duplica pedidos.
- Los permisos se verifican en el servidor por **tenant/restaurante, usuario, rol y suscripción activa**. No confiar en botones ocultos, datos del cliente ni un plan declarado por el navegador.

## Entidades mínimas (base de datos central)
- `restaurants(id, name, plan, subscription_status, ...)`
- `restaurant_users(id, restaurant_id, role, active, ...)`
- `online_orders(id, restaurant_id, order_number, status, version, created_at, updated_at, ...)`
- `online_order_items(id, order_id, product_id, name_snapshot, quantity, unit_price, ...)`
- `order_events(id, order_id, actor_id, from_status, to_status, version, created_at, ...)`
- `idempotency_keys(restaurant_id, actor_id, key, request_hash, response, expires_at)`
- `device_sessions(id, restaurant_user_id, device_label, revoked_at, expires_at, ...)`
- `restaurant_settings(restaurant_id, ...)`

Todo pedido Online debe tener un identificador único estable, `restaurant_id`, `version` incremental y marcas temporales del servidor. Nunca confiar en el total o el estado enviado por el navegador.

## API privada propuesta (HTTPS, autenticación obligatoria)
- `GET /health` devuelve `{"status":"ok"}` cuando el servicio está saludable. Esto **no prueba** que los pedidos estén sincronizados.
- `GET /api/v1/restaurant/orders?status=active&cursor=...` devuelve solo pedidos del restaurante autorizado; paginación por cursor, `serverTime`, `nextCursor`.
- `GET /api/v1/restaurant/orders/changes?since=...` devuelve eventos posteriores a un cursor de servidor; si el cursor expira, exige volver a obtener el estado completo.
- `PATCH /api/v1/restaurant/orders/:id/status` recibe `{"status":"Preparando","expectedVersion":7}` y encabezado `Idempotency-Key` único por intención.
- `GET /api/v1/restaurant/orders/:id` devuelve el estado y versión actuales antes de revisar un conflicto.
- `GET /api/v1/restaurant/capabilities` devuelve las capacidades efectivas del usuario, restaurante y plan, calculadas por el servidor.

## Reglas de cambios simultáneos — Paso 46, opción B
1. Cada cambio de estado requiere `expectedVersion`; la actualización es atómica y condicionada por versión y transición permitida.
2. Si la versión ya cambió, responder `409 CONFLICT` con versión actual y datos mínimos actualizados; **no aplicar** el cambio solicitado.
3. Mostrar aviso: «Otro empleado actualizó este pedido». Permitir revisar la versión actual y elegir una nueva acción válida. **No reintentar automáticamente** la operación anterior.
4. Si el pedido está cancelado/rechazado/entregado, impedir transiciones incompatibles aunque el usuario confirme.
5. Registrar cada cambio aceptado con actor, dispositivo, fecha y versión.

## Idempotencia y recuperación
- La misma clave con idéntica solicitud devuelve la misma respuesta; la misma clave con contenido distinto falla.
- Al reconectar: consultar estado del servidor, recuperar cambios, actualizar pedidos pendientes y avisar cuáles cambiaron. No aceptar automáticamente ni repetir cambios que quedaron sin confirmación.
- Pedidos creados durante una desconexión del restaurante permanecen en el servidor; no depender de que la pestaña esté abierta.
- El indicador `navigator.onLine` solo mide conectividad local; el frontend debe comprobar API y autorización.
- Si no hay conexión confirmada con API, la pantalla puede mostrar caché **solo lectura** y claramente identificada como potencialmente desactualizada.
- Realtime por SSE/WebSocket opcional con reconciliación por cursor al reconectar; polling paginado como respaldo.

## Seguridad y pruebas de aceptación
- Cookies de sesión HttpOnly, Secure, SameSite apropiado; protección CSRF si se usan cookies; control de acceso en cada endpoint.
- No publicar credenciales, secretos ni datos reales en GitHub Pages o localStorage.
- Probar dos restaurantes aislados, dos empleados editando el mismo pedido, 409, reintentos duplicados, cierre/reapertura, desconexión, reconexión y cambio de plan ONLINE/LOCAL/PLUS.
- PLUS consume el **mismo ID de pedido** y servicio Online, sin replicarlo en ventas locales.
- No se considera completado hasta disponer de backend, migraciones, autenticación, integración del frontend y pruebas automatizadas de concurrencia.
