---
title: "Data types & casting"
description: "Choose representations that preserve precision and meaning."
chapter: "foundations"
order: 4
sequence: 4
level: "Core"
references: [{"title":"PostgreSQL data types","url":"https://www.postgresql.org/docs/current/datatype.html"}]
---

## Match the type to the value

| Type family | Example | Typical use |
|---|---|---|
| Integer | `integer`, `bigint` | Counts and identifiers |
| Exact decimal | `numeric(12,2)` | Monetary quantities with explicit precision |
| Floating point | `double precision` | Approximate scientific values |
| Character | `text`, `varchar(100)` | Text with optional length constraints |
| Boolean | `boolean` | True, false, or null |
| Date | `date` | Calendar date without time |
| Timestamp | `timestamp`, `timestamptz` | Local wall time or an instant |
| Duration | `interval` | A time interval |
| Structured | `jsonb`, arrays | Semi-structured values |

`numeric(12,2)` permits twelve total decimal digits, two after the decimal point. Floating-point arithmetic may have rounding error; exact equality on computed floating values can be surprising.

## Cast explicitly when meaning changes

```sql
SELECT CAST('42' AS integer) AS number,
       '2026-01-10'::date AS activity_date,
       5 / 2 AS integer_division,
       5::numeric / 2 AS decimal_division;
```

Expected values: `42`, `2026-01-10`, `2`, and `2.5`. PostgreSQL's `::` is shorthand for `CAST`.

Casting `'unknown'` to an integer raises an error. A production ingestion process should validate input or quarantine invalid records. Do not silently turn every invalid measurement into zero.

## Timestamp versus timestamptz

`timestamp without time zone` is a wall-clock reading without an associated timezone. `timestamptz` represents an instant; PostgreSQL displays it in the session timezone. It does not retain the original input timezone name as a separate attribute.

An event at midnight UTC can belong to a different local business date. Establish the reporting timezone before extracting a date or grouping by day.

## Try it yourself

Why can `SUM(integer_count) / COUNT(*)` lose the fractional portion? How would you preserve it?

<details markdown="1"><summary>Show the answer</summary>

An integer division expression can truncate the fraction. Cast one side to a decimal type or multiply by `1.0` before dividing. Casting only the already-truncated result is too late.

```sql
SELECT 5 / 2::numeric AS correct;
```

</details>
