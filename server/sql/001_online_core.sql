-- Dvolada Online: esquema inicial. Ejecutar en PostgreSQL dedicado.
CREATE TABLE IF NOT EXISTS restaurants (
 id uuid PRIMARY KEY, name text NOT NULL,
 plan text NOT NULL CHECK (plan IN ('ONLINE','LOCAL','PLUS')),
 subscription_status text NOT NULL CHECK (subscription_status IN ('active','inactive'))
);
CREATE TABLE IF NOT EXISTS online_orders (
 id uuid PRIMARY KEY, restaurant_id uuid NOT NULL REFERENCES restaurants(id),
 order_number text NOT NULL, status text NOT NULL
 CHECK (status IN ('Pendiente','Aceptado','Preparando','Listo','Recogido','En camino','En ubicación','Entregado','Cancelado','Rechazado')),
 version integer NOT NULL DEFAULT 1 CHECK (version > 0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(restaurant_id,order_number)
);
CREATE INDEX IF NOT EXISTS idx_online_orders_restaurant_updated ON online_orders(restaurant_id,updated_at DESC,id);
CREATE TABLE IF NOT EXISTS online_order_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 order_id uuid NOT NULL REFERENCES online_orders(id), restaurant_id uuid NOT NULL REFERENCES restaurants(id),
 actor_id uuid NOT NULL, from_status text NOT NULL, to_status text NOT NULL,
 version integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_online_events_restaurant_id ON online_order_events(restaurant_id,id);
CREATE TABLE IF NOT EXISTS online_idempotency (
 restaurant_id uuid NOT NULL REFERENCES restaurants(id), actor_id uuid NOT NULL,
 idempotency_key uuid NOT NULL, request_hash text NOT NULL,
 response_status integer, response_body jsonb, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(restaurant_id,actor_id,idempotency_key)
);
