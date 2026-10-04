---
title: "Replicas, freshness, and failover"
description: "Separate read capacity from availability and define what a user may observe after a write."
chapter: scaling
order: 4
sequence: 1204
level: Intermediate
dialect: Cross-engine concepts
references:
  - title: PostgreSQL standby servers and replication
    url: https://www.postgresql.org/docs/current/warm-standby.html
  - title: PostgreSQL hot standby
    url: https://www.postgresql.org/docs/current/hot-standby.html
---

## Begin with the user-visible contract

A user submits an order and immediately opens their order history. If the write goes to the primary and the read goes to a lagging replica, the order may appear missing. Replication can be functioning as configured while the product behavior is still unacceptable.

Define where reads go and how much staleness is allowed. Checkout confirmation and a daily analytical report may need different routing policies.

## Read capacity and availability are different goals

A readable replica can receive eligible query traffic. A failover replica can help recover service when a primary fails. One deployment may support both, but capacity, recovery behavior, and operational responsibilities must be evaluated separately.

Replication does not automatically make an individual query do less work. The same broad scan can remain expensive on a replica, though isolating it from primary traffic may improve the overall workload.

## Understand acknowledgment and visibility

Asynchronous replication can allow writes to be acknowledged before a replica catches up. Synchronous configurations can change which acknowledgment is required and the latency/availability trade-off. Durability acknowledgment and visibility to a replica query are not interchangeable; inspect the exact engine and configuration semantics.

For PostgreSQL, long-running standby queries can also interact with recovery and cleanup. Consider query cancellation and the consequences of feedback settings rather than assuming replicas are operationally independent copies.

## Design a read-after-write policy

Possible policies include routing a critical follow-up read to the primary, waiting for a known replication position where supported, or explicitly presenting eventual freshness for tolerant views. A fixed delay may reduce symptoms without guaranteeing that the write is visible.

Make the policy part of the application contract. Monitor replica lag and failover behavior under load. A stale-read incident should be diagnosable from routing and replication evidence.

## Failover needs a procedure

Specify how failure is detected, how a replacement is promoted, how clients reconnect, and how the old primary is prevented from accepting conflicting writes. State recovery-time and data-loss objectives. Replicas also do not replace backups: erroneous writes or deletions can be replicated.

## Exercise

An analytics team asks to run a two-hour report on a replica. What do you check?

<details markdown="1"><summary>Discussion</summary>

Check acceptable staleness, available capacity, impact on recovery/replication, query cancellation behavior, and whether the report belongs in a separate analytical system. A replica avoids some direct primary query load but still participates in a system with shared data movement and recovery constraints.

</details>
