# Dvolada 3.0 — revisión visual aprobada (31 octubre 2026)

La interfaz es un prototipo React/Vite basado en almacenamiento local. Este registro distingue trabajo visual implementado de infraestructura aún pendiente. No representa un sistema de pedidos multiusuario en producción.

| # | Solicitud | Estado |
|---|---|---|
| 1 | Consejos flotantes | Implementado en la pantalla de inicio, con persistencia de avisos vistos |
| 2 | Pie de página compacto | CSS responsive aplicado |
| 3 | Contraste de tarjetas día/noche | Bordes, fondos y sombras ajustados |
| 4 | Una sola navegación por dispositivo | Barra inferior oculta en escritorio; visible en móvil |
| 5 | Buscador visible | Buscador superior en PC y búsqueda por producto/restaurante en catálogo |
| 6 | D animada en seguimiento | Barra de progreso con marca blanca de Dvolada |
| 7 | Precios, tiempos y tarifas | Precio mínimo calculado; tiempo/tarifa solo si existen datos configurados |
| 8 | Categorías rápidas | Filtros de comida y productos en catálogo |
| 9 | Promociones dinámicas | Carrusel de descubrimiento y acceso a Flash; no inventa descuentos |
| 10 | Abierto/cerrado | Cálculo local a partir de horario opcional; sin horario muestra “por confirmar” |
| 11 | Confirmación animada | Ya existía celebración de pedido; conservada |
| 12 | Seguimiento simplificado | Estado principal visible; detalle de etapas desplegable |
| 13 | Volver a pedir | Función existente conservada, con validación de menú actual |
| 14 | Ventanas flotantes | Estilos existentes conservados; consejos flotantes añadidos |
| 15 | Notificaciones | Avisos locales existentes; push remoto pendiente |
| 16 | Ubicación/cobertura | Dirección en perfil y checkout existentes; validación real de cobertura pendiente de datos por negocio y backend |
| 17 | Android y reducir movimiento | Imágenes lazy, controles compactos, animaciones con reduced-motion |

## Pendientes antes de operar realmente
- Autenticación segura, backend, sincronización de órdenes entre cliente/restaurante y notificaciones push.
- Horarios y cobertura reales proporcionados por cada restaurante.
- Tarifas de entrega verificadas por zona y distancia, sin suposiciones.
- Pruebas de compilación y pruebas funcionales Android/iOS, especialmente de pedidos, pago, reorden y estado de cocina.
- Revisión de accesibilidad y regresión en producción.

No declarar estimaciones de entrega, restaurantes abiertos o reseñas como verificadas si los datos no están disponibles.
