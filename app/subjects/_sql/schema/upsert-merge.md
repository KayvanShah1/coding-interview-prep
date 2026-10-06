---
title: "Upserts & MERGE"
description: "Define how incoming records interact with existing keys."
chapter: "schema"
order: 4
sequence: 904
level: "Intermediate"
references: [{"title":"PostgreSQL ON CONFLICT","url":"https://www.postgresql.org/docs/current/sql-insert.html"},{"title":"PostgreSQL MERGE","url":"https://www.postgresql.org/docs/current/sql-merge.html"}]
---

## Upsert on a unique key

```sql
CREATE TABLE device_status (
    device_id integer PRIMARY KEY,
    status text NOT NULL,
    observed_at timestamptz NOT NULL
);
INSERT INTO device_status VALUES (1, 'online', '2026-01-01 10:00:00+00')
ON CONFLICT (device_id) DO UPDATE
SET status = EXCLUDED.status,
    observed_at = EXCLUDED.observed_at
WHERE EXCLUDED.observed_at > device_status.observed_at;
```

`EXCLUDED` refers to the proposed row. The time check prevents an older event from overwriting a newer state. Equal timestamps need a policy if two different values can arrive at the same instant.

## MERGE a source into a target

```sql
MERGE INTO products p
USING product_updates s ON p.product_id = s.product_id
WHEN MATCHED THEN UPDATE SET category = s.category
WHEN NOT MATCHED THEN INSERT (product_id, category)
VALUES (s.product_id, s.category);
```

Assume the source is unique by product ID. The matching condition determines whether a source row already has a target. Keep update-only filters in the appropriate action condition rather than accidentally changing match identity.

## They are not identical concurrency tools

`ON CONFLICT` handles conflicts against a unique constraint or index. `MERGE` expresses conditional actions based on source-target matching. PostgreSQL does not give these two statements identical guarantees under concurrent insertions. Choose based on required behavior, not only shorter syntax.

For pipelines, first establish the business key, resolve duplicate source records, and decide how late events and deletions should behave. An upsert alone does not solve all three.
