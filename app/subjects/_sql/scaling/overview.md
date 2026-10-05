---
title: "Storage & scaling"
nav_title: Overview
description: "Choose physical layout, distribution, and replication from workload requirements."
chapter: scaling
order: 0
sequence: 1200
dialect: Cross-engine concepts
level: Chapter overview
---

## Connect physical design to workload and reliability

Storage layout, distribution, and replication solve different problems. This chapter helps choose among them using access patterns, capacity, consistency, and recovery requirements.

**Suggested route:** Start with the decision map, then compare the engine-specific meanings of clustering. Study sharding and replicas as separate architectural choices.

**By the end:** Explain which bottleneck a change addresses, what it cannot fix, and which operational trade-offs it adds.

## Decision reference

| Requirement | Investigate |
|---|---|
| Selective row access | Indexes |
| Time pruning and lifecycle | Table partitioning |
| Related values stored together | Engine-specific clustering |
| Distributed capacity | Sharding |
| Read isolation or failover | Replicas and their consistency contract |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/scaling/decisions/' | relative_url }}">Choose the right storage or scaling change</a><span>Separate query access, physical layout, capacity, and availability requirements.</span></li>
<li><a href="{{ '/sql/scaling/clustering/' | relative_url }}">Clustering means different things</a><span>Distinguish BigQuery storage blocks, clustered indexes, PostgreSQL CLUSTER, and database clusters.</span></li>
<li><a href="{{ '/sql/scaling/sharding/' | relative_url }}">Sharding and distribution keys</a><span>Choose where data lives while accounting for routing, hot keys, joins, and growth.</span></li>
<li><a href="{{ '/sql/scaling/replicas/' | relative_url }}">Replicas, freshness, and failover</a><span>Separate read capacity from availability and define what a user may observe after a write.</span></li>
</ul>
