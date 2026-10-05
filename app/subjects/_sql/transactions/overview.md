---
title: "Transactions"
nav_title: "Overview"
description: "Understand concurrent work, isolation, and locks."
chapter: "transactions"
order: 0
sequence: 1000
level: "Chapter overview"
---

## Reason about interleaved work

Correct SQL can still behave unexpectedly when two sessions act together. Transactions define atomic work; isolation controls what concurrent work can observe. Locks and waits explain operational behavior beyond a single query plan.

**Suggested route:** Read ACID, then walk through an isolation example as two ordered sessions. Use locks to explain blocking and deadlocks.

**By the end:** Describe an anomaly, choose a consistency requirement, and explain retry behavior where needed.

## Decision reference

| Symptom or requirement | Investigate |
|---|---|
| Partial multi-step change | Transaction boundaries and rollback |
| Different results across reads | Isolation and snapshots |
| Two writers conflict | Locks, constraints, retry rules |
| Query waits despite a simple plan | Blocking sessions |
| Circular waiting | Deadlock detection and transaction order |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/transactions/acid/' | relative_url }}">ACID, commits & savepoints</a><span>Group related changes so failure does not leave partial work.</span></li>
<li><a href="{{ '/sql/transactions/isolation/' | relative_url }}">Isolation levels & read anomalies</a><span>Know which concurrent changes a transaction can observe.</span></li>
<li><a href="{{ '/sql/transactions/locks/' | relative_url }}">Locks, deadlocks & lost updates</a><span>Protect concurrent writes and recognize conflicting lock order.</span></li>
</ul>

## How to study

Use the suggested route above. For each lesson, explain the decision in your own words, test its example, and identify a situation where a different approach would be needed.
