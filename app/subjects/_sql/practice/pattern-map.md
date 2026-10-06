---
title: "Choose the right technique"
description: "Translate interview wording into candidate query patterns."
chapter: "practice"
order: 1
sequence: 1401
level: "Core"
references: [{"title":"PostgreSQL table expressions","url":"https://www.postgresql.org/docs/current/queries-table-expressions.html"}]
---

## Before you reach for a pattern

Do not start with the table below. Start with five questions:

1. **Population:** Which rows or entities are allowed into the answer?
2. **Grain:** What should one output row represent?
3. **Operation:** Do you need a match test, an aggregate, an ordered comparison, or a change of grain?
4. **Edge case:** What happens with duplicates, nulls, ties, missing dates, or no related rows?
5. **Alternative:** What other query shape could express the same requirement, and where would it differ?

Once those are clear, use the wording map as a shortcut to candidate syntax rather than as a pattern-matching answer key.

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
