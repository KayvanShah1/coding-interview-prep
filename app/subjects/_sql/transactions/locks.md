---
title: "Locks, deadlocks & lost updates"
description: "Protect concurrent writes and recognize conflicting lock order."
chapter: "transactions"
order: 3
sequence: 1003
level: "Advanced"
references: [{"title":"PostgreSQL explicit locking","url":"https://www.postgresql.org/docs/current/explicit-locking.html"}]
---

## Avoid read-modify-write races

Two clients read a balance of 100, then each writes back 110. One increment is lost. An atomic update expresses the change against the row's current value:

```sql
UPDATE accounts SET balance = balance + 10 WHERE account_id = 1;
```

For multi-step decisions, lock the rows in a transaction or use an appropriate optimistic concurrency check.

```sql
BEGIN;
SELECT account_id, balance
FROM accounts
WHERE account_id IN (1, 2)
ORDER BY account_id
FOR UPDATE;
-- Validate balances and perform the related updates here.
COMMIT;
```

## A deadlock is a cycle

Transaction A locks account 1 and waits for account 2. Transaction B locks account 2 and waits for account 1. Neither can progress. The database detects the cycle and aborts one participant.

Acquire shared resources in a consistent order, keep transactions short, and handle deadlock retries. A lock wait is not necessarily a deadlock; it can simply be waiting for a transaction that will finish.

## SKIP LOCKED is a specific tool

For worker queues, `FOR UPDATE SKIP LOCKED` can let workers claim different available rows. It deliberately skips locked work, so it is not suitable when a query must produce a complete consistent report.

Optimistic concurrency is another option: update only if a `version` column still equals the version read, then check the affected-row count. If no row was updated, the application must resolve the conflict rather than silently proceeding.
