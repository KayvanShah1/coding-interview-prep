-- PostgreSQL 16+; run in a disposable learning database.
-- Creates its own namespace and refuses to overwrite an existing lab.
CREATE SCHEMA coretrail_lab;
CREATE TABLE coretrail_lab.orders (
  order_id bigint PRIMARY KEY,
  customer_id integer NOT NULL,
  order_ts timestamp NOT NULL,
  amount numeric(12,2) NOT NULL,
  status text NOT NULL,
  note text NOT NULL
);
INSERT INTO coretrail_lab.orders
SELECT n, 1 + n % 2000,
       TIMESTAMP '2026-01-01' + n * INTERVAL '1 minute',
       (n % 10000)::numeric / 100,
       CASE WHEN n % 5 = 0 THEN 'pending' ELSE 'paid' END,
       repeat('x', 80)
FROM generate_series(1, 120000) AS s(n);
ANALYZE coretrail_lab.orders;

CREATE TABLE coretrail_lab.events (
  event_id bigint NOT NULL,
  event_date date NOT NULL,
  asset_id integer NOT NULL,
  reading integer NOT NULL,
  PRIMARY KEY (event_date, event_id)
) PARTITION BY RANGE (event_date);
CREATE TABLE coretrail_lab.events_jan PARTITION OF coretrail_lab.events
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE coretrail_lab.events_feb PARTITION OF coretrail_lab.events
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE coretrail_lab.events_mar PARTITION OF coretrail_lab.events
FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
INSERT INTO coretrail_lab.events
SELECT n, DATE '2026-01-01' + ((n - 1) % 90),
       1 + n % 100, n % 50
FROM generate_series(1, 90000) AS s(n);
ANALYZE coretrail_lab.events;
