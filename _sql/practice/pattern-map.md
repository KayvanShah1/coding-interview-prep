---
title: "Choose the right technique"
description: "Translate interview wording into candidate query patterns."
chapter: "practice"
order: 1
sequence: 1401
level: "Core"
references: [{"title":"PostgreSQL table expressions","url":"https://www.postgresql.org/docs/current/queries-table-expressions.html"}]
---

| Wording in the question | First technique to consider | Check before writing |
|---|---|---|
| “At least one related…” | `EXISTS` | Need columns from the related row? |
| “Never / no matching…” | `NOT EXISTS` | Nullable matching keys |
| “How many per…” | `GROUP BY` | Input and output grain |
| “Groups with more than…” | `HAVING` | Filter rows first or groups afterward? |
| “Highest N in each…” | Ranking window + outer filter | Exactly N rows or N distinct values? |
| “Latest / earliest record…” | `ROW_NUMBER` | Tie-breaker and null timestamps |
| “Previous / next value…” | `LAG` / `LEAD` | Previous record or previous calendar period? |
| “Running / cumulative…” | `SUM OVER` with explicit frame | Order and tied values |
| “Last N observations…” | `ROWS` frame | Include current observation? |
| “Last N days…” | Time `RANGE` or calendar + `ROWS` | Calendar dates or elapsed time? |
| “Percentage of total…” | Aggregate, then `SUM OVER ()` | Denominator population |
| “Consecutive dates…” | Deduplicate + date minus row number | Fixed step and reporting timezone |
| “Session / new group after a gap…” | `LAG` + boundary flag + cumulative sum | Gap threshold inclusive or exclusive? |
| “Both categories…” | `COUNT(DISTINCT ...)` with `HAVING` | Restrict to requested categories |
| “Every required item…” | Double `NOT EXISTS` | Empty required set |
| “Include entities with zero…” | Base entity table + `LEFT JOIN` | Count right-side key |
| “All possible combinations…” | `CROSS JOIN` + `LEFT JOIN` | Size of the grid |
| “Compare different sources…” | `UNION`, `INTERSECT`, `EXCEPT` | Set versus duplicate-preserving semantics |
