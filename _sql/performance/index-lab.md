---
title: "Lab: investigate an order lookup"
description: "Capture a baseline, add a candidate index, and compare results and actual plans on PostgreSQL."
chapter: performance
order: 10
sequence: 1110
level: Lab
references:
  - title: PostgreSQL index ordering
    url: https://www.postgresql.org/docs/current/indexes-ordering.html
---

## Set up a repeatable experiment

Use PostgreSQL 16 or later in a disposable learning database. Download [performance-lab.sql]({{ '/assets/sql/performance-lab.sql' | relative_url }}) and run it using your SQL client or `psql`. It creates a dedicated `coretrail_lab` schema with 120,000 orders and 90,000 events. It intentionally fails if that schema already exists, so it cannot silently replace prior work. Use a fresh database for a clean repeat.

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f performance-lab.sql
```

The fixture is deterministic and deliberately uniform. It isolates access-path behavior; it does not model production skew, cold storage, or concurrent clients. Learn the investigation here, then repeat with representative workload distributions.

## Establish correctness and a baseline

Return the latest 20 orders for customer 42. Each output row is an order; the ID breaks timestamp ties.

```sql
SELECT order_id, order_ts, amount
FROM coretrail_lab.orders
WHERE customer_id = 42
ORDER BY order_ts DESC, order_id DESC
LIMIT 20;
```

The first returned ID should be **118041**, followed by 116041 and 114041. The twentieth is 80041. Derive this from `1 + order_id % 2000 = 42` and increasing timestamps before looking at a plan.

Run the same query prefixed with `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`. Record scan type, rows filtered, sorting, buffer activity, and execution time. Keep the JSON so you can compare the actual evidence.

## Test one hypothesis

Hypothesis: finding one customer's rows in the requested order will reduce unrelated reads and avoid a separate sort.

```sql
CREATE INDEX orders_customer_recent_idx
ON coretrail_lab.orders (customer_id, order_ts DESC, order_id DESC)
INCLUDE (amount);
ANALYZE coretrail_lab.orders;
```

Rerun the query and its plan. Compare all 20 output rows with the baseline. Inspect whether the index supports the restriction and ordering. An index-only scan may still need heap fetches; inspect those rather than assuming `INCLUDE` guarantees no table access.

Do not set `enable_seqscan = off` to produce an attractive result. The lesson is to observe a justified choice under ordinary planner settings.

## Run a second experiment: one calendar day

Create an index on `order_ts`, then compare these restrictions using `COUNT(*)` against the lab orders:

```sql
CREATE INDEX orders_time_idx ON coretrail_lab.orders (order_ts);

SELECT COUNT(*) FROM coretrail_lab.orders
WHERE order_ts::date = DATE '2026-01-10';

SELECT COUNT(*) FROM coretrail_lab.orders
WHERE order_ts >= TIMESTAMP '2026-01-10'
  AND order_ts < TIMESTAMP '2026-01-11';
```

Both counts should be **1440**. Compare plans: does the half-open range become an index condition? Even when both queries use an index, one may scan much more of it. Index presence alone is not the metric.

## Write your conclusion

Record the engine version, data size, query, index definition, several runtimes, reads, and output comparison. Then state what remains unknown: concurrent writes, customer skew, cache differences, and index-maintenance cost.

The repository's native PostgreSQL checks run these experiments and retain plan JSON in the workflow's `performance-plans` artifact. They check results and intended access behavior without asserting a machine-independent speedup. Run them locally with `DATABASE_URL` set and `npm run test:plans`.
