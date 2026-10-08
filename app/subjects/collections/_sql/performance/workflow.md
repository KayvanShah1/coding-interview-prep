---
title: "When and where to optimize"
description: "Turn a performance complaint into a measurable question before changing SQL or infrastructure."
chapter: performance
order: 1
sequence: 1101
level: Core
references:
  - title: PostgreSQL performance tips
    url: https://www.postgresql.org/docs/current/performance-tips.html
---

## Begin with the symptom

“The database is slow” does not identify a fix. A customer lookup that takes three seconds, a nightly report that misses its deadline, and a dashboard that scans an expensive amount of data are different problems. Establish the operation, its normal behavior, the affected population, and the target you are trying to meet.

Suppose a page lists the latest 20 orders for a customer. Before proposing an index, ask whether the delay happens for every customer, only large accounts, or only during imports. Those answers distinguish a consistently expensive access path from data skew or competing work.

| Observation | First evidence to collect | Candidate investigation |
|---|---|---|
| Slow even in isolation | Actual plan, parameters, reads | Access paths, joins, sorting |
| Fast alone, slow under load | Waits, blocking, connection counts | Contention and concurrency |
| Slow for one customer | Plans, row counts, parameters | Skew, statistics, plan reuse |
| High warehouse scan cost | Bytes scanned and pruning | Filters, partitions, selected columns |
| Fast database, slow endpoint | Database time versus request trace | N+1 calls, network, serialization |
| Stale dashboard after a write | Routing and replication delay | Freshness contract and replica lag |

## Preserve the question the query answers

Write the output grain and edge cases first. Replacing an outer join with an inner join can reduce runtime by silently deleting customers with no orders. Removing `DISTINCT` can expose duplicates. Moving a filter before a window can change which rows are ranked.

For a proposed rewrite, compare both directions with `EXCEPT ALL`. Ordinary `EXCEPT` hides differences in duplicate counts. Compare ordering separately when order is part of the contract. Also test empty input, ties, nulls, and the largest expected group.

## Follow a repeatable investigation

1. Record the query, engine version, parameters, data size, indexes, and baseline measurements.
2. Identify concrete work: rows read, repeated lookups, large intermediate results, sorting, or waiting outside execution.
3. Form one hypothesis: “An ordered customer index could avoid reading unrelated orders and sorting the matches.”
4. Change one relevant factor, then collect the same evidence.
5. Test small and large customers, narrow and broad date ranges, normal concurrency, and write impact.

Record several runs and whether data was cached. An improvement on a warm local dataset is evidence about that experiment, not a production latency guarantee. Do not flush shared production caches to manufacture a cold benchmark.

## Choose the level of intervention

Start where the evidence points. A repeated expensive join may justify pre-aggregation. An unsuitable predicate may need a rewrite. Missing access paths may justify indexes. An analytical scan may need pruning or a different layout. Capacity and availability problems may need architectural changes after their requirements are understood.

Avoid treating these as an automatic ladder that ends in sharding. A large table can serve selective queries well; a small table can still be blocked by a long transaction.

## Practice the explanation

“We added a replica but this query still takes 20 seconds.” What would you ask?

<details markdown="1"><summary>Reason it through</summary>

Ask whether the bottleneck was read contention or the work required by one execution. A read replica can isolate traffic, but the same query can still scan and sort the same amount of data. Compare plans and resource conditions, then inspect freshness requirements before routing more traffic there.

</details>

Continue with [reading plans]({{ '/sql/performance/explain/' | relative_url }}) and the [index lab]({{ '/sql/performance/index-lab/' | relative_url }}).
