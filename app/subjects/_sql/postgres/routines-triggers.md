---
title: "Functions, procedures & triggers"
description: "Recognize when logic belongs in a database routine and when hidden behavior adds risk."
chapter: "postgres"
order: 5
sequence: 1305
dialect: "PostgreSQL"
level: "Advanced"
references: [{"title":"PostgreSQL SQL functions","url":"https://www.postgresql.org/docs/current/xfunc-sql.html"},{"title":"PostgreSQL triggers","url":"https://www.postgresql.org/docs/current/triggers.html"}]
---

## A function returns a result

```sql
CREATE FUNCTION add_tax(price numeric, rate numeric)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$ SELECT price * (1 + rate) $$;

SELECT add_tax(100, 0.18) AS total;
```

Expected: 118. `IMMUTABLE` is a correctness promise that the same arguments always produce the same result. Do not apply it to a function that reads changing tables or the current time.

## Procedures and triggers

A procedure is invoked with `CALL` and is useful for database operations; PostgreSQL permits transaction control only in eligible calling contexts. A trigger runs automatically in response to specified database events and can operate per row or per statement.

Examples include maintaining an audit trail or validating a rule that cannot be expressed cleanly as a simple constraint. Prefer declarative constraints for rules they can enforce directly.

## Trade-offs to explain

Database routines can reduce round trips and centralize logic. They can also make behavior less visible to application developers and create deployment/testing dependencies. Triggers can add unexpected write cost or cascading behavior.

Set-based SQL should usually be the first option for batch transformations. A cursor processes a result incrementally and may be needed for specific workflows, but a row-by-row loop is not automatically better than a single statement.

## Interview check

Can a trigger guarantee business correctness by itself? Only for the rules actually implemented, under the relevant concurrency conditions. A check that reads other rows may require careful locking or a stronger constraint design to remain valid during concurrent writes.
