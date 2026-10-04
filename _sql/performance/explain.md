---
title: "Reading EXPLAIN plans"
description: "Follow data flow, compare estimates to reality, and find expensive work."
chapter: "performance"
order: 2
sequence: 1102
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

## Walk through an order lookup

Use the [lab fixture]({{ '/sql/performance/index-lab/' | relative_url }}) to retrieve the latest 20 orders for customer 42. Without a suitable index, one possible plan shape is `Limit → Sort → Seq Scan`. Read the data flow from the scan upward: inspect orders, retain the customer's rows, sort the survivors, and return 20.

After adding a matching customer-and-time index, a possible shape is `Limit → Index Scan`. The hypothesis is that the engine can find the relevant entries in order and stop early. Confirm the actual plan instead of treating this illustrative shape as a measured result.

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT order_id, order_ts, amount
FROM coretrail_lab.orders
WHERE customer_id = 42
ORDER BY order_ts DESC, order_id DESC
LIMIT 20;
```

Compare the `Index Cond` with any residual `Filter`. Is the selective predicate narrowing the access path, or are many accessed rows rejected afterward? Compare root-level buffer totals carefully; parent nodes include work from their children, so summing the tree double-counts.

## Find the first important estimate mismatch

Suppose a join input was estimated at 10 rows but produced 50,000. That observation raises questions before it suggests a fix: did the filter match more data than expected, are filtered columns correlated, are statistics stale, or did a join key contain unexpected duplicates?

Follow that input toward its source. The [statistics lesson]({{ '/sql/performance/statistics/' | relative_url }}) explains how to separate an estimation problem from an incorrect assumption about the data.

## Exercise: small output, expensive execution

A query returns 20 rows after scanning 200,000 and sorting 5,000 matches. What would you investigate?

<details markdown="1"><summary>Discussion</summary>

Investigate how the query finds and orders the matches. A suitable access path may avoid unrelated reads and a separate sort. Verify the same 20 rows are returned, including the tie-break order. A small final result alone does not imply little execution work.

</details>
