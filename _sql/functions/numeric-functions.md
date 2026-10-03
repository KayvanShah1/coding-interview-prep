---
title: "Numeric functions & safe arithmetic"
description: "Handle rounding, buckets, ratios, and zero denominators deliberately."
chapter: "functions"
order: 2
sequence: 202
level: "Core"
references: [{"title":"PostgreSQL mathematical functions","url":"https://www.postgresql.org/docs/current/functions-math.html"}]
---

## Common operations

```sql
SELECT ROUND(12.345::numeric, 2) AS rounded,
       FLOOR(2.9) AS rounded_down,
       CEIL(2.1) AS rounded_up,
       ABS(-9) AS magnitude,
       MOD(17, 5) AS remainder;
```

Expected values: `12.35`, `2`, `3`, `9`, `2`.

`FLOOR` moves toward negative infinity: `FLOOR(-2.1)` is -3. Truncation toward zero would give -2. Rounding behavior can differ across numeric types and engines.

## Ratios need a defined denominator

```sql
WITH counts(successes, attempts) AS (VALUES (3, 4), (0, 0))
SELECT successes, attempts,
       ROUND(100.0 * successes / NULLIF(attempts, 0), 2) AS success_pct
FROM counts;
```

The percentages are 75 and null. The second group has no observed attempts; it is not necessarily a 0% success rate.

Average rates carefully. A group with 1 success from 1 attempt and a group with 0 from 9 have a combined rate of 10%, not the 50% average of their percentages. Sum numerators and denominators for the combined population.

## Buckets and boundary conditions

```sql
WITH amounts(amount) AS (VALUES (99), (100), (199), (200))
SELECT amount, FLOOR(amount / 100.0) AS hundred_bucket
FROM amounts;
```

The bucket numbers are 0, 1, 1, 2. If the labels mean “up to and including 100,” this formula does not implement that boundary. State interval inclusivity before choosing arithmetic or `CASE`.

## Interview check

Avoid rounding intermediate values unless required. Calculate a weighted rate from full precision and round the final presentation value. For financial rules that require rounding per line, that is a different calculation and can produce a different total.
