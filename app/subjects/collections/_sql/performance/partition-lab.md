---
title: "Lab: prove partition pruning"
description: "Compare a time-bounded request with an asset-only request and inspect the partitions actually accessed."
chapter: performance
order: 11
sequence: 1111
level: Lab
references:
  - title: PostgreSQL partition pruning
    url: https://www.postgresql.org/docs/current/ddl-partitioning.html#DDL-PARTITION-PRUNING
---

## State the workload

A telemetry report needs event counts for January. The [lab setup]({{ '/sql/performance/index-lab/' | relative_url }}) created monthly partitions for January, February, and March. Each of 90 days has 1,000 events, so the January result should be 31,000.

```sql
SELECT COUNT(*)
FROM coretrail_lab.events
WHERE event_date >= DATE '2026-01-01'
  AND event_date < DATE '2026-02-01';
```

Before running it, predict which child tables are relevant. Then add `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` and inspect relation names in the plan. Depending on when pruning occurs, irrelevant partitions may be absent or reported as removed or unexecuted subplans.

## Change the access pattern

Now ask for all events for asset 42, without a time restriction:

```sql
SELECT COUNT(*)
FROM coretrail_lab.events
WHERE asset_id = 42;
```

The expected count is **900**. Because dates are unrestricted, all three month partitions can contain relevant events. Time partitioning alone does not tell the engine which month to skip for this request.

This is the distinction between choosing a layout because a table is large and choosing it because it matches a workload. The same layout can be useful for one query and unhelpful for another.

## Combine two access decisions

For frequent asset lookups within date ranges, consider indexes inside the partitions, and compare the additional write/storage cost. Partition pruning selects relevant table pieces; an index can find rows inside those pieces. They can cooperate.

An asset-only query might still use indexes across every partition. That improves row access without proving that partition pruning happened.

## Think beyond the scan

Monthly partitions may also support retention and backfills. Define how new partitions are created before data arrives, how late events reach older partitions, and how historical corrections are handled. Deleting or detaching an expired partition affects data availability and deserves a separate operational procedure.

The fixture's composite primary key includes the partition date. It enforces uniqueness for that key, not a promise that `event_id` alone is unique across all dates.

## Exercise

A dashboard filters by customer and asks for “all history.” Would moving from monthly to daily partitions necessarily improve it?

<details markdown="1"><summary>Discussion</summary>

No date restriction was added, so finer time partitions do not create a reason to eliminate historical data. There may be more partitions to plan and manage. Investigate customer access paths, aggregation needs, and retention requirements before changing granularity.

</details>

Native CI checks verify both expected counts and the difference in accessed partitions. They do not claim the partitioned layout is faster than every unpartitioned alternative.
