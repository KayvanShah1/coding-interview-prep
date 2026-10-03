---
title: "Transactions"
nav_title: "Overview"
description: "Understand concurrent work, isolation, and locks."
chapter: "transactions"
order: 0
sequence: 1000
level: "Chapter overview"
---

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/transactions/acid/' | relative_url }}">ACID, commits & savepoints</a><span>Group related changes so failure does not leave partial work.</span></li>
<li><a href="{{ '/sql/transactions/isolation/' | relative_url }}">Isolation levels & read anomalies</a><span>Know which concurrent changes a transaction can observe.</span></li>
<li><a href="{{ '/sql/transactions/locks/' | relative_url }}">Locks, deadlocks & lost updates</a><span>Protect concurrent writes and recognize conflicting lock order.</span></li>
</ul>

## How to study

Read the explanation, predict the query output, then run the example. Change one input row to create a tie, a missing value, or a duplicate and explain what changes.
