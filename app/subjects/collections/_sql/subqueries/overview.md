---
title: "Subqueries & CTEs"
nav_title: "Overview"
description: "Break down problems and query related or hierarchical data."
keywords:
  - EXISTS
  - correlated subqueries
  - recursive CTE
  - LATERAL
aliases:
  - common table expressions
chapter: "subqueries"
order: 0
sequence: 500
level: "Chapter overview"
---

## Give each intermediate question a purpose

A subquery can answer a scalar question, test whether a related row exists, or supply a new table to another stage. A CTE names that stage. Choose the form from the result you need, then investigate execution separately.


## Quick reference

| Syntax | Think | Common use |
|---|---|---|
| `EXISTS` | At least one matching row exists | semi-join / “has any” |
| `NOT EXISTS` | No matching row exists | anti-join / “never” |
| `IN` | Value belongs to a set | simple membership |
| `ANY / SOME` | Comparison succeeds for at least one value | `> ANY(...)`, `= ANY(...)` |
| `ALL` | Comparison succeeds for every value | `> ALL(...)` |
| scalar subquery | Return one value | thresholds, lookup values |
| correlated subquery | Inner query references outer row | per-entity existence/comparison |
| CTE `WITH` | Name an intermediate result | multi-stage reasoning |
| recursive CTE | Repeat from an anchor | hierarchies, trees |
| `LATERAL` | Right-side query uses current left row | top-N related rows, per-row expansion |

## Interview wording → technique

| Wording | First technique to consider |
|---|---|
| “has at least one…” / “ever…” | `EXISTS` |
| “never…” / “without…” | `NOT EXISTS` |
| “is one of…” | `IN` |
| “greater than at least one…” | `> ANY` |
| “greater than every…” | `> ALL` |
| “every required item…” | double `NOT EXISTS` or constrained `HAVING` |
| “top N related rows for each parent…” | `LATERAL + ORDER BY + LIMIT` |
| “break this into stages…” | CTE |

## High-value combinations

**Semi-join**

```sql
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
)
```

Use when you need the outer row but not columns from the related row.

**Anti-join**

```sql
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
)
```

Prefer this over `NOT IN` when the comparison set can contain nulls.

**Every required item: double NOT EXISTS**

```sql
WHERE NOT EXISTS (
    SELECT 1
    FROM required_products rp
    WHERE NOT EXISTS (
        SELECT 1
        FROM purchases p
        WHERE p.customer_id = c.customer_id
          AND p.product_id = rp.product_id
    )
)
```

Read it as: there is no required product for which there is no purchase.

**Per-row top N with LATERAL**

```sql
SELECT c.customer_id, x.*
FROM customers c
LEFT JOIN LATERAL (
    SELECT o.*
    FROM orders o
    WHERE o.customer_id = c.customer_id
    ORDER BY o.order_ts DESC
    LIMIT 3
) x ON TRUE;
```

## Common traps

- `NOT IN` plus a null in the subquery can produce unknown instead of true.
- A CTE is not automatically faster or automatically materialized.
- A correlated subquery is a logical relationship; the optimizer may transform its execution.
- `EXISTS` avoids multiplying an outer row by inner matches, but it does not deduplicate duplicate rows already present in the outer table.
- `ALL` over an empty set is true; `ANY` over an empty set is false.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/subqueries/exists-in-all/' | relative_url }}">EXISTS, IN, ANY & ALL</a><span>Match related rows and understand null-sensitive membership.</span></li>
<li><a href="{{ '/sql/subqueries/cte-basics/' | relative_url }}">Subqueries & CTEs</a><span>Use intermediate results to make a query easier to reason about.</span></li>
<li><a href="{{ '/sql/subqueries/recursive-cte/' | relative_url }}">Recursive CTEs & hierarchies</a><span>Walk parent-child relationships with an anchor, a recursive step, and a stopping rule.</span></li>
<li><a href="{{ '/sql/subqueries/lateral/' | relative_url }}">LATERAL and per-row subqueries</a><span>Use a preceding table's values inside a FROM-clause subquery.</span></li>
</ul>

## Pick the shape before the syntax

Ask whether you need a yes/no match, a scalar value, extra columns, or a named intermediate result. That usually narrows the choice before `EXISTS`, a join, or a CTE enters the discussion.
