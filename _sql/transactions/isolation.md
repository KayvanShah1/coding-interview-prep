---
title: "Isolation levels & read anomalies"
description: "Know which concurrent changes a transaction can observe."
chapter: "transactions"
order: 2
sequence: 1002
level: "Intermediate"
references: [{"title":"PostgreSQL transaction isolation","url":"https://www.postgresql.org/docs/current/transaction-iso.html"}]
---

## Name the anomaly precisely

| Anomaly | What happens |
|---|---|
| Dirty read | Reading another transaction's uncommitted data |
| Nonrepeatable read | Reading the same row twice and seeing a committed change |
| Phantom read | Repeating a predicate query and seeing a changed matching set |
| Serialization anomaly | A combined result incompatible with every serial transaction order |

PostgreSQL defaults to Read Committed, with a new snapshot for each statement. Repeatable Read keeps a transaction snapshot and prevents phantom reads in PostgreSQL, but serialization anomalies remain possible. Serializable can reject transactions that must be retried. Read Uncommitted behaves like Read Committed in PostgreSQL.

## A two-session example

Session A:

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT balance FROM accounts WHERE account_id = 1;
-- Pause while session B updates and commits.
SELECT balance FROM accounts WHERE account_id = 1;
COMMIT;
```

Session B, between A's reads:

```sql
UPDATE accounts SET balance = balance + 10 WHERE account_id = 1;
```

A can observe different values. At Repeatable Read, its ordinary reads retain the same snapshot. This example needs two independent database connections; running the blocks sequentially on one connection does not demonstrate concurrency.

## Interview check

“Use the highest isolation level” is not a complete answer. Explain the invariant being protected, expected contention, and retry handling. A serializable transaction can fail legitimately; the application must retry the whole transaction when appropriate.
