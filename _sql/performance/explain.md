---
title: "Reading EXPLAIN plans"
description: "Follow data flow, compare estimates to reality, and find expensive work."
chapter: "performance"
order: 3
sequence: 1103
level: "Intermediate"
references: [{"title":"PostgreSQL EXPLAIN","url":"https://www.postgresql.org/docs/current/using-explain.html"}]
---

## Start with the plan, then measure

```sql
EXPLAIN
SELECT customer_id, SUM(amount)
FROM orders
WHERE status = 'paid'
GROUP BY customer_id;
```

`EXPLAIN` shows the planned operations. `EXPLAIN (ANALYZE, BUFFERS)` executes the statement and includes runtime and buffer information. For modifying statements, that execution changes data unless contained in a rollback strategy appropriate to the operation.

## What to inspect

| Plan detail | Question |
|---|---|
| Estimated versus actual rows | Did the optimizer misunderstand cardinality? |
| Loops | Is a moderately expensive operation repeated many times? |
| Scan and filter | How much input is read and then discarded? |
| Sort method / memory | Did sorting spill to disk? |
| Buffers | How much data was accessed? |
| Join output | Did a join unexpectedly multiply rows? |

Costs are planner units, not milliseconds. Actual per-loop timings and counts must be interpreted with loop counts; blindly summing node times can double-count nested work.

## Physical join strategies

A nested loop pairs outer rows with inner lookups and can work well for a small selective outer input. A hash join builds and probes a hash table for compatible conditions. A merge join walks suitably ordered inputs. Each has conditions and trade-offs; no join algorithm is universally fastest.

## A useful debugging sequence

Confirm the result is correct. Identify the largest mismatch or dominant work. Check table statistics and predicates. Make one justified change, then compare plans and elapsed behavior on representative data.

A sequential scan on a tiny table or a query reading most rows can be the right choice. An interview answer that treats every sequential scan as a failure misses this context.
