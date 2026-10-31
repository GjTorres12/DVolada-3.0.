# Dvolada Online — Inicio del restaurante

**Estado: DISEÑO APROBADO / DEMOSTRACIÓN LOCAL / PENDIENTE DE SERVIDOR OFICIAL**  
**Actualizado: 2026-10-31**  
**Alcance: solo Inicio del panel de restaurante Online.**

## Qué está avanzado

- Diseño operativo del Inicio definido en los primeros 38 pasos y decisiones posteriores (39–47).
- Tablero Nuevos / En preparación / Listos; tarjetas, detalles y herramientas operativas de demostración.
- Panel de restaurante visualmente separado del cliente, con navegación propia.
- Notificaciones visibles para pedidos nuevos y agrupación de avisos en la implementación local.
- Aviso rojo de desconexión y bloqueo local de transiciones cuando el navegador detecta falta de red.
- Preferencias locales de recordatorios, capacidad, relevo de turno, impresión y disponibilidad.

**No confundir implementación local con funcionamiento multiusuario real.** Los pedidos y ajustes actuales no están respaldados por un servidor oficial. La detección de red del navegador no equivale a una comprobación de disponibilidad del backend.

## Pendiente obligatorio: servidor oficial

- [ ] Backend y base de datos persistente para restaurantes, usuarios, pedidos, estados y auditoría.
- [ ] Autenticación segura y permisos comprobados en el servidor para los roles Cliente, Restaurante, Repartidor y Administrador.
- [ ] Aislamiento por restaurante: impedir leer o modificar pedidos, precios, menús y configuraciones de otro negocio.
- [ ] Sesiones renovables y dispositivos de confianza: 30 días por defecto, alternativa de 7 días o no recordar; nombre del equipo y revocación individual.
- [ ] Restauración del Centro de pedidos tras reinicio o apagón, con sincronización y comprobación de sesión.
- [ ] Sincronización real entre varias computadoras/tablets y actualización en tiempo real de pedidos.
- [ ] Confirmación de cambios simultáneos: avisar si otro empleado modificó el pedido, recuperar versión actual y evitar sobrescrituras.
- [ ] Notificaciones fiables de pedidos nuevos, flotantes y agrupadas, con recordatorios configurables y control de audio.
- [ ] Comprobación real de conectividad con el backend, estado visible «Sin conexión / Pedidos en línea pausados», bloqueo seguro de operaciones y resincronización al volver.
- [ ] Alertas por pedidos sin atender y supervisión en el Centro de Control de Nexora, sin cancelación automática por demora.
- [ ] Configuración de capacidad de cocina, tiempos estimados y pausa de nuevos pedidos reflejada en el canal del cliente.
- [ ] Turnos opcionales o formales y permisos por empleado/dispositivo, con registro de autor de cada acción.
- [ ] Confirmación de entregas y estados coherentes entre restaurante, cliente y repartidor.
- [ ] Respaldo, recuperación, monitoreo, pruebas de seguridad, pruebas de carga y pruebas de regresión antes de producción.

## Decisiones aprobadas (no volver a preguntar)

- **Paso 39:** notificación flotante de nuevos pedidos, sin interrumpir la tarea actual.
- **Paso 40:** avisos agrupados si llegan varios pedidos.
- **Paso 41:** recordatorios configurables por restaurante.
- **Paso 42:** advertencia por demora y supervisión administrativa, sin cancelación automática por demora.
- **Paso 43:** modo seguro sin conexión, aviso rojo muy evidente y tablero marcado como pausado; no cambiar el estado real de pedidos solo por perder conexión local.
- **Paso 44:** dispositivos de confianza, nombres de equipos y recuperación de sesión tras cortes de luz; revocación segura.
- **Paso 45:** permisos configurables por empleado y dispositivo, siempre validados en servidor.
- **Paso 46:** pedir confirmación ante cambios simultáneos.
- **Paso 47:** cambio de turno configurable (rápido o entrega formal).
- **Capacidad de cocina:** ya definida en los primeros 38 pasos; no volver a abrir la misma decisión.

## Criterio para cerrar este pendiente

No marcar «Inicio terminado» hasta contar con backend oficial, pruebas multi-dispositivo, permisos efectivos en servidor, reconexión verificada, notificaciones reales y validación de seguridad/estabilidad. Mientras tanto, **mantener el estado PENDIENTE DE SERVIDOR OFICIAL**.

## Otros requisitos generales acordados (para fases posteriores)

Nexora Systems cuenta con **dos socios administradores de igual autoridad**, con cuentas individuales y auditoría. Los cuatro paneles tendrán recuperación híbrida de acceso (métodos verificados y revisión manual en casos especiales). Se desarrollará «Ayúdanos a mejorar», con reportes autenticados, comentarios, adjuntos y seguimiento. Estos requisitos no se consideran implementados por aparecer aquí.
