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

## What problem are you trying to solve?

Storage layout, distribution, and replication solve different problems. This chapter helps choose among them using access patterns, capacity, consistency, and recovery requirements.


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

## Tie the change to a bottleneck

An index, partition, shard, replica, or clustering choice should answer a specific problem. State the bottleneck first, then the trade-off the change introduces. Do not treat these as interchangeable ways to “scale the database.”
