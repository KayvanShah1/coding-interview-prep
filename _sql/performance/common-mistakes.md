---
title: "Correctness & optimization traps"
description: "Check semantics before comparing query performance."
chapter: "performance"
order: 7
sequence: 1107
level: "Core"
references: [{"title":"PostgreSQL EXPLAIN","url":"https://www.postgresql.org/docs/current/using-explain.html"}]
---

## Correctness checklist

| Mistake | What to do instead |
|---|---|
| Adding `DISTINCT` whenever counts look wrong | Inspect the join cardinality and intended grain |
| Summing order-level amounts after joining order lines | Aggregate first or calculate at the correct grain |
| `COUNT(*)` after an outer join when counting matches | Count a non-null right-side key |
| Filtering the right table in `WHERE` and losing unmatched rows | Put the match restriction in `ON` if unmatched rows must survive |
| `NOT IN` with nullable inputs | Use `NOT EXISTS` and define null-key behavior |
| `= NULL` | Use `IS NULL` |
| `COUNT(CASE ... ELSE 0 END)` | Use `SUM(CASE...)` or omit `ELSE` inside `COUNT` |
| Integer division truncating a rate | Use decimal arithmetic, e.g. `100.0 * numerator / denominator` |
| Dividing by zero | `NULLIF(denominator, 0)` |
| `ROW_NUMBER` without deterministic tie handling | Add a stable tie-breaker |
| Adding a unique ID to a ranking that should preserve ties | Rank on the actual measure only |
| Assuming `LAST_VALUE` sees the last row in the partition | Specify the full-partition frame |
| Treating seven rows as seven days | Validate date completeness or use a time-based range |
| Filtering dates before calculating a historical window | Calculate with enough history, then filter output |
| Returning arbitrary values beside aggregates | Group them correctly or select the relevant row explicitly |
| Joining timestamps directly to dates | Define the date conversion and timezone |
| Assuming output order from a CTE or window | Add a final `ORDER BY` |

## How to discuss performance without overclaiming

First establish correctness. Then explain likely work: scans, joins, aggregation, sorting, and the sizes of intermediate results.

- `EXISTS`, `IN`, and a semantically equivalent join can produce similar plans. Do not claim one always wins.
- A CTE improves organization; it is not automatically faster.
- Aggregating before a join can reduce intermediate rows, when the aggregation preserves the required semantics.
- In PostgreSQL, indexes on useful filter, join, and ordering columns may help. Their value depends on selectivity, table size, and access pattern.
- Applying a function to an indexed column can prevent use of an ordinary index for that expression. For time periods, direct timestamp bounds are often easier to optimize than casting every row to a date.
- `ORDER BY` and windows can require large sorts. Filter and reduce data when that does not remove required history or alter the result.
- In analytical warehouses, partition pruning and bytes scanned may matter more than traditional B-tree indexes.
- Inspect the engine's execution plan rather than inferring performance from query length. `EXPLAIN ANALYZE` executes the query in PostgreSQL; use it with awareness of the statement's effects.

**A useful spoken explanation:** “I first reduce the data to one row per customer per day, because that is the unit the question asks about. Then I calculate the window in date order and filter the result in an outer query. That avoids counting multiple events on the same day as multiple days.”
