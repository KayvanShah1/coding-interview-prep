---
title: "Predicates and query rewrites"
description: "Make restrictions usable while preserving dates, null behavior, and the intended population."
chapter: performance
order: 6
sequence: 1106
level: Intermediate
references:
  - title: PostgreSQL expression indexes
    url: https://www.postgresql.org/docs/current/indexes-expressional.html
  - title: PostgreSQL table expressions
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html
---

## Make the desired range explicit

An ordinary timestamp index stores timestamp values. A predicate transforming every value to a date may not provide the same direct index range as bounds on the original column.

For a `timestamp without time zone` column using an agreed business-time convention, compare:

```sql
-- Original predicate
WHERE order_ts::date = DATE '2026-01-10'

-- Candidate rewrite
WHERE order_ts >= TIMESTAMP '2026-01-10 00:00:00'
  AND order_ts <  TIMESTAMP '2026-01-11 00:00:00'
```

The half-open interval includes the first day and excludes next midnight. It avoids guessing a last possible time such as 23:59:59. `BETWEEN` includes both bounds, so using next midnight with `BETWEEN` would include an extra instant.

For `timestamptz`, establish the business timezone and derive the boundary instants. A calendar day can differ from 24 hours during daylight-saving transitions. A faster predicate with the wrong boundary is incorrect.

## An expression index is an alternative

For frequent case-insensitive exact lookups, `LOWER(name)` with a matching expression index may be appropriate. This differs from claiming that any function around a column prevents all index use. Match the expression, operator, collation, and workload, then inspect the plan.

For text search, distinguish exact matches, prefixes, substrings, and language-aware search. Their semantics and useful access methods differ.

## Move filters only when the meaning survives

“Filter early” is incomplete advice. To find customers whose latest order is paid, rank all their orders and inspect the winning row. Filtering to paid orders before ranking instead finds the latest *paid* order, even if a newer unpaid order exists.

A right-table condition in `WHERE` after a `LEFT JOIN` can also remove unmatched left rows. Choose predicate placement from the required population before considering physical execution.

## Reduce repeated work with evidence

A CTE clarifies intermediate grain but is not a performance promise. An engine may inline or materialize it depending on dialect, version, and query shape. Reusing expensive results can justify a temporary table or materialized result, introducing freshness and lifecycle decisions.

Measure semantically equivalent forms on the selected engine. Query length and nesting depth do not reliably predict execution cost.

## Practice

A customer has an unpaid order on Tuesday and a paid order on Monday. Explain why filtering `status = 'paid'` before `ROW_NUMBER()` changes the answer to “customers whose latest order is paid.” Design a two-row fixture that catches the error.

Continue to the [index lab]({{ '/sql/performance/index-lab/' | relative_url }}), which includes a date-predicate experiment.
