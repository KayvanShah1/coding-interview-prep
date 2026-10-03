---
title: "Keys, constraints & defaults"
description: "Encode data rules in the database and understand what each constraint guarantees."
chapter: "schema"
order: 1
sequence: 801
level: "Core"
references: [{"title":"PostgreSQL constraints","url":"https://www.postgresql.org/docs/current/ddl-constraints.html"}]
---

## Make invalid states explicit

```sql
CREATE TABLE accounts (
    account_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email text NOT NULL UNIQUE,
    balance numeric(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0)
);
```

This table generates an ID, requires a unique non-null email, and disallows negative or missing balances. A default is used when a value is omitted; it does not replace an explicitly supplied null.

## Compare the guarantees

| Constraint | Guarantee |
|---|---|
| `PRIMARY KEY` | Unique and non-null row identity |
| `UNIQUE` | Uniqueness under the engine's null rules |
| `NOT NULL` | A value must be present |
| `CHECK` | The expression cannot evaluate to false |
| `FOREIGN KEY` | A non-null reference must match a permitted parent key |

In PostgreSQL, a `CHECK (balance >= 0)` alone permits null because unknown is not false. Pair it with `NOT NULL` when the field is required. A regular unique constraint permits multiple nulls by default; PostgreSQL also supports `NULLS NOT DISTINCT` for a different rule.

## Foreign-key actions

```sql
CREATE TABLE account_notes (
    note_id bigint PRIMARY KEY,
    account_id bigint NOT NULL REFERENCES accounts(account_id)
        ON DELETE CASCADE,
    note_text text NOT NULL
);
```

Deleting a parent account deletes its dependent notes under this rule. `RESTRICT`, `NO ACTION`, and `SET NULL` express different relationships. Choose from the data lifecycle, not convenience.

## Interview check

Does a foreign key automatically create an index on the referencing column in PostgreSQL? No. Consider one when parent changes or queries need efficient lookups of child rows. Primary and unique constraints generally create supporting unique indexes on their constrained columns.
