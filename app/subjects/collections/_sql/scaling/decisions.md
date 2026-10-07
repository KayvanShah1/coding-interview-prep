---
title: "Choose the right storage or scaling change"
description: "Separate query access, physical layout, capacity, and availability requirements."
chapter: scaling
order: 1
sequence: 1201
level: Core
dialect: Cross-engine concepts
references:
  - title: Azure data partitioning guidance
    url: https://learn.microsoft.com/en-us/azure/architecture/best-practices/data-partitioning
---

## Start with the requirement

Indexing, partitioning, clustering, sharding, and replication often appear together in interviews. They are not interchangeable solutions to “lots of data.” Explain the bottleneck and access pattern before choosing among them.

| Technique | Main question it addresses | Cost or complication to discuss |
|---|---|---|
| Index | How do we find selected rows or useful ordering? | Writes, storage, maintenance |
| Table partitioning | Which table pieces can be skipped or managed separately? | Key choice, granularity, constraints |
| Physical clustering | Can related values be stored near each other? | Engine-specific maintenance and key order |
| Sharding | How do we distribute data/work across independent units? | Routing, skew, joins, rebalancing |
| Read replica | Where can eligible reads run? | Lag, consistency, routing, replica capacity |
| Failover replica | How can service recover after a primary failure? | Recovery objectives and promotion behavior |
| Materialized summary | Can repeated computation be reused? | Refresh cost and staleness |

These techniques can coexist. A shard can contain partitioned tables and indexes, with replicas for availability. Every additional mechanism needs its own reason.

## Work through a concrete scenario

A telemetry service receives readings from assets. Users usually filter by a date interval and asset ID, while ingestion continuously appends data.

First define the request: recent raw readings, daily summaries, or a cross-fleet report? Then inspect scan volume and actual execution. Time partitioning may eliminate unrelated periods. Asset-oriented access within those periods may help selective requests. A summary table may help a repeatedly requested daily aggregate.

If a single write-serving unit becomes a measured capacity constraint, investigate distribution and shard-key choices. If reads interfere with ingestion and can tolerate some lag, evaluate replicas. These decisions follow different evidence even though they involve the same dataset.

## Ask about scale precisely

“One billion rows” omits row width, retention, ingestion rate, request frequency, selectivity, concurrency, latency targets, and required consistency. A rarely queried archive differs from a high-rate transactional service with the same row count.

Describe scale with operations: “The customer endpoint needs 20 recent records under its latency target during peak writes.” This gives you a testable design requirement.

## Interview practice

For each proposed change, finish this sentence: “This addresses ___ because ___; it introduces ___; I would verify it by ___.”

A good answer can reject a change. If the problem is an incorrectly multiplying join, adding replicas does not repair the result. If a report intentionally reads every partition, changing partition granularity alone may not reduce its scan.

Continue with [clustering]({{ '/sql/scaling/clustering/' | relative_url }}), [sharding]({{ '/sql/scaling/sharding/' | relative_url }}), and [replicas]({{ '/sql/scaling/replicas/' | relative_url }}).
