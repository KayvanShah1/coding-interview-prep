---
title: "Sharding and distribution keys"
description: "Choose where data lives while accounting for routing, hot keys, joins, and growth."
chapter: scaling
order: 3
sequence: 1203
level: Advanced
dialect: Cross-engine concepts
references:
  - title: Azure sharding pattern
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/sharding
---

## What changes when data is sharded?

Sharding places subsets of data on different storage or processing units. A request must reach the relevant subset, and operations crossing subsets require coordination. This adds capacity options and operational complexity.

Do not introduce sharding merely because a table has many rows. First identify a capacity, placement, or isolation requirement and evaluate the simpler options available in the selected system.

## Choose a key from the request path

Suppose most requests belong to one tenant. A tenant key can keep that tenant's related data together, making local joins and transactions easier to reason about. Now ask what happens when one tenant is much larger or busier than the rest.

| Candidate strategy | Useful property | Failure mode to investigate |
|---|---|---|
| Range by time or ID | Predictable ranges and routing | Newest range receives most writes |
| Hash of tenant/key | Distributes keys across buckets | One very hot key can still dominate |
| Directory mapping | Flexible placement of chosen groups | Mapping availability and migration complexity |

Hashing distributes keys, not necessarily traffic. Splitting a large tenant across shards can reduce concentration but may turn its formerly local queries into cross-shard work.

## Follow a query across boundaries

A tenant-specific order request can route to one shard when the tenant key is known. A global top-products report may need partial aggregates from many shards and a final combination. Global uniqueness, foreign-key checks, and multi-shard transactions need explicit support or application-level design.

Ask how tenant context reaches the database layer. A query that omits the routing key may become scatter-gather work. Explain that cost in terms of participating shards, network transfer, and tail latency.

## Plan for movement

The initial distribution will change. Rebalancing must account for live writes, copying, catch-up, routing changes, validation, and rollback. A design that explains only `hash(key) % N` omits what happens when N changes.

Also define failure isolation. A shard failure may affect a subset of tenants, but shared routing, metadata, or downstream services can still create broader failures. Replication and recovery remain separate responsibilities.

## Exercise: the largest customer

Most tenants have 10,000 rows. One tenant has 100 million rows and dominates traffic. Is hashing `tenant_id` enough?

<details markdown="1"><summary>Discussion</summary>

All rows for that tenant can still map to one shard. Options include dedicated capacity, a finer routing key, or redesigned access and aggregation, each with different isolation and cross-shard costs. Collect actual traffic and latency evidence before deciding. State how the proposed change handles joins and transactions for the large tenant.

</details>
