---
title: "Joins & sets"
nav_title: "Overview"
description: "Combine tables while preserving the intended grain."
keywords:
  - INNER JOIN
  - LEFT JOIN
  - UNION
  - INTERSECT
  - EXCEPT
aliases:
  - SQL joins
interview_queries:
  - why does a join multiply rows
chapter: "joins"
order: 0
sequence: 400
level: "Chapter overview"
---

## What happens to the row count?

A join is a relationship between row sets. Its multiplicity determines whether measures remain correct. Start with matching and unmatched rows, then reason about independent one-to-many children and set operations.


## Quick reference

| Operation | Returns | Typical use |
|---|---|---|
| `INNER JOIN` | Matching row pairs | attach required related data |
| `LEFT JOIN` | All left rows + matches | preserve zero/no-match entities |
| `FULL OUTER JOIN` | Matches + unmatched rows from both sides | reconcile datasets |
| `CROSS JOIN` | Every possible pair | expected combinations / grids |
| self join | Same table through two aliases | manager relationships, interval comparisons |
| `UNION` | Combined sets, duplicates removed | merge distinct result sets |
| `UNION ALL` | Combined sets, duplicates retained | append data without unnecessary dedup |
| `INTERSECT` | Rows in both sets | overlap |
| `EXCEPT` | Rows in first but not second | set difference |

## Existence patterns

SQL does not require explicit `SEMI JOIN` or `ANTI JOIN` keywords in PostgreSQL.

| Need | Common expression |
|---|---|
| Keep left rows that have a match | `WHERE EXISTS (...)` |
| Keep left rows that have no match | `WHERE NOT EXISTS (...)` |
| Preserve left rows and attach matches | `LEFT JOIN` |

Use `EXISTS` when the right table is only a yes/no test. Use a join when you need right-side columns or need to aggregate matches.

## High-value combinations

**Preserve zero matches**

```sql
SELECT c.customer_id,
       COUNT(o.order_id) AS paid_orders
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.customer_id
 AND o.status = 'paid'
GROUP BY c.customer_id;
```

Put right-side filtering in `ON` when unmatched left rows must remain.

**Generate expected combinations, then attach observations**

```text
students
CROSS JOIN subjects
LEFT JOIN examinations
```

Use the same shape for customer × month, store × date, or product × region grids.

**Avoid one-to-many × one-to-many multiplication**

```text
aggregate child A to parent grain
aggregate child B to parent grain
join the aggregated results
```

Do not use `SUM(DISTINCT amount)` as a general repair for duplicated join rows.

**Interval overlap self-join**

For half-open intervals `[start, end)`:

```sql
a.start_time < b.end_time
AND b.start_time < a.end_time
```

Add a condition such as `a.id < b.id` to avoid self-pairs and duplicate mirrored pairs.

## Set-operation reminders

- `UNION`, `INTERSECT`, and `EXCEPT` use set-style duplicate elimination by default.
- `UNION ALL` normally does less work because it does not deduplicate.
- Input queries must return compatible column counts and types.
- Set operations combine result sets vertically; joins combine columns horizontally.

## Common traps

- Filtering a right-side column in `WHERE` after a `LEFT JOIN` can turn it effectively into an inner join.
- `COUNT(*)` after a left join includes the null-extended left row; count a right-side non-null key to count matches.
- Joining tables at incompatible grains can silently inflate totals.
- A `CROSS JOIN` of M and N rows produces M × N rows.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/joins/join-types/' | relative_url }}">Joins & row multiplication</a><span>Keep unmatched rows and avoid inflated totals.</span></li>
<li><a href="{{ '/sql/joins/set-operations/' | relative_url }}">Set operations & all-item matches</a><span>Combine result sets and express every-required-item conditions.</span></li>
</ul>

## Before you join

Write the grain of each input and estimate whether one left row can match zero, one, or many right rows. If both sides can match many, expect multiplication unless you aggregate or otherwise constrain the relationship.
