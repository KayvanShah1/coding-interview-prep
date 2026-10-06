---
title: "Query structure & execution order"
description: "Understand logical SQL order, where each clause belongs, and what to optimize while writing the query."
chapter: "foundations"
order: 2
sequence: 2
level: "Core"
references:
  - title: PostgreSQL table expressions
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html
  - title: PostgreSQL SELECT
    url: https://www.postgresql.org/docs/current/sql-select.html
---

```sql
SELECT customer_id,
       COUNT(*) AS order_count,
       SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING COUNT(*) >= 3
ORDER BY revenue DESC, customer_id
LIMIT 10;
```

Read this as: retain paid orders, group by customer, retain customers with at least three orders, and return the ten largest revenues.

## Logical SQL order

A useful logical sequence is:

1. `FROM` / `JOIN`: build the input rows.
2. `WHERE`: filter individual rows.
3. `GROUP BY` and aggregates: summarize groups.
4. `HAVING`: filter groups.
5. Window calculations: operate on the surviving rows or groups.
6. `SELECT`: produce output expressions.
7. `DISTINCT`: remove duplicate output rows, if requested.
8. `ORDER BY`: sort the result.
9. `LIMIT` / `OFFSET`: select a portion of it.

This order explains **query semantics**. It is not a promise that the database physically executes the plan in exactly this sequence. The optimizer can push filters, reorder joins, choose indexes, and transform parts of the query while preserving the result.

| Need | Clause |
|---|---|
| Paid orders only | `WHERE status = 'paid'` |
| Customers whose total spending exceeds 1,000 | `HAVING SUM(amount) > 1000` |
| First ranked row per customer | Outer query filtering a window result |

You cannot use `WHERE SUM(amount) > 1000` or filter `ROW_NUMBER()` in the same query's `WHERE`. A select-list alias also generally cannot be referenced by another expression in that same select list. Put the intermediate calculation in a subquery or CTE when another query level needs it.

## What to optimize while writing the query

Do not treat logical order as a recipe for manually forcing execution order. The goal is to express the smallest correct problem in a form the optimizer can work with.

| Stage | What to think about while writing |
|---|---|
| `FROM` / `JOIN` | Join only the tables the answer needs. Check join keys and grain before adding `DISTINCT`. A many-to-many mistake can multiply rows long before later clauses repair the symptom. |
| `WHERE` | Remove irrelevant rows with row-level predicates. Prefer sargable predicates such as timestamp ranges over wrapping indexed columns in functions when an equivalent direct predicate exists. |
| `GROUP BY` | Group at the required output grain, not every column available. If a many-side table can be safely pre-aggregated before a large join, that can reduce work and avoid row multiplication. |
| `HAVING` | Use it for conditions on aggregates or groups. Put ordinary row filters in `WHERE` so the query does not aggregate rows that never needed to participate. |
| Windows | Reduce the input first **only when doing so preserves the window's required history**. Partition and ordering keys often imply sorting, so avoid calculating windows over unnecessarily large row sets. |
| `SELECT` | Return only the columns the consumer needs. Avoid carrying wide payloads such as large JSON/text columns through expensive joins or sorts unless they are required. |
| `DISTINCT` | Do not use it as a generic fix for duplicate rows caused by a bad join. It can require a hash or sort over the full output. Fix the grain first. |
| `ORDER BY` | Sort only when the result needs ordering. Matching indexes can sometimes provide useful order; otherwise large sorts may consume memory or spill to disk. |
| `LIMIT` | `LIMIT` helps most when the engine can find the first required rows cheaply. `ORDER BY ... LIMIT` can benefit from a matching index; a large `OFFSET` still makes the engine skip work. |

A useful rule is: **reduce unnecessary rows, columns, and duplicate work as early as the query's semantics allow, then verify what the optimizer actually did.**

### Example: filter before aggregate

Prefer:

```sql
SELECT customer_id, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING SUM(amount) > 1000;
```

Do not move the row-level condition into `HAVING` just because that clause appears later. `status = 'paid'` describes which **orders** are eligible, so it belongs in `WHERE`.

### Keep predicates easy to use

When two predicates mean the same thing, prefer the form that exposes the original column and range directly. That can make index use and partition pruning easier for the optimizer.

The detailed cases around timestamp bounds, expressions, outer joins, and when “filter early” changes the answer live in [Predicates and query rewrites]({{ '/sql/performance/sargability/' | relative_url }}).

## Logical order versus physical execution

The logical model answers **what the query means**. The physical plan answers **how this database chose to produce it**.

For example, even though `WHERE` appears logically after `FROM`, PostgreSQL may apply a selective filter during a scan and may reorder inner joins while preserving the result.

That is why query tuning should finish with the execution plan rather than assumptions based on SQL text alone.

Next: [How a query actually runs]({{ '/sql/foundations/query-execution/' | relative_url }}).
