---
title: "Pagination: OFFSET and keysets"
description: "Return stable pages without repeatedly skipping an ever-growing prefix."
chapter: "performance"
order: 5
sequence: 1105
level: "Intermediate"
references: [{"title":"PostgreSQL LIMIT and OFFSET","url":"https://www.postgresql.org/docs/current/queries-limit.html"}]
---

## Always specify deterministic ordering

```sql
SELECT order_id, order_ts, amount
FROM orders
ORDER BY order_ts DESC, order_id DESC
LIMIT 20 OFFSET 40;
```

This returns the third page under the chosen order. Without a unique tie-breaker, equal timestamps can shift between pages unpredictably. Deep offsets can require processing many rows just to discard them.

## Continue after a known key

Assume non-null timestamps. The previous page ended with timestamp `2026-01-10 12:00:00` and ID 100.

```sql
SELECT order_id, order_ts, amount
FROM orders
WHERE (order_ts, order_id) < (TIMESTAMP '2026-01-10 12:00:00', 100)
ORDER BY order_ts DESC, order_id DESC
LIMIT 20;
```

The lexicographic tuple comparison matches the descending order. A compatible index can support advancing from the cursor.

## What it does not solve

Keyset pagination makes sequential navigation efficient, but it does not directly support jumping to arbitrary page numbers. Updates to sort keys and concurrent inserts still require a consistency policy. If the entire export must represent one point in time, consider a suitable snapshot or export strategy.

Nulls and mixed ascending/descending keys require additional care. Do not copy a tuple comparison without checking that it matches the exact ordering and null placement.
