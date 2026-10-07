---
title: "Warehouse performance: BigQuery, Redshift, Athena"
description: "Investigate pruning, data movement, and file layout using the warehouse's own evidence."
chapter: performance
order: 12
sequence: 1112
level: Intermediate
dialect: BigQuery · Redshift · Athena
references:
  - title: BigQuery query computation
    url: https://docs.cloud.google.com/bigquery/docs/best-practices-performance-compute
  - title: Redshift distribution
    url: https://docs.aws.amazon.com/redshift/latest/dg/t_Distributing_data.html
  - title: Athena data optimization
    url: https://docs.aws.amazon.com/athena/latest/ug/performance-tuning-data-optimization-techniques.html
---

## Begin with the analytical request

A dashboard asks for daily energy readings from selected assets over the last month. Define the output grain as asset-day and confirm how incomplete or late data should appear. Then ask how much data the warehouse reads and moves to produce that result.

Use this scenario to compare engines. Do not copy PostgreSQL index advice into a system with a different storage and execution model.

## BigQuery: inspect scanning and execution stages

For a date-partitioned table, use a suitable partition filter. Select the columns required by the result. When clustering matches the access pattern, inspect its pruning effect. Review execution details for large joins, shuffle, and skew rather than using elapsed time alone.

```sql
-- BigQuery: illustrative telemetry schema from the clustering lesson.
SELECT DATE(event_ts) AS event_date, asset_id, AVG(reading) AS avg_reading
FROM `your_project.sandbox.telemetry`
WHERE event_ts >= TIMESTAMP('2026-01-01')
  AND event_ts < TIMESTAMP('2026-02-01')
  AND asset_id IN ('asset-7', 'asset-12')
GROUP BY event_date, asset_id;
```

Compare this with the actual dashboard request, including timezone semantics. Record bytes processed, cache use, and execution stages. A dry run helps estimate processing for supported queries, but clustering can make final scanned bytes dependent on execution. Repeated summaries may justify materialization if refresh behavior meets the freshness requirement.

## Redshift: inspect distribution and sorting

Redshift's distribution affects where rows live and how much data joins move. Sort keys can help eliminate irrelevant blocks for suitable filters. A distribution key that helps one large join can be poor when it creates skew or other requests use different keys.

For the asset-day report, ask whether fact and dimension joins redistribute substantial data. Inspect the actual distribution and sort strategy, including automatic optimization where configured. Consider both query patterns and load/maintenance behavior; do not select `DISTKEY` solely because a column appears in a join.

## Athena: inspect the objects being scanned

Athena queries over object storage depend heavily on layout. Relevant partition filters, columnar formats, compression, and sensible file sizes can reduce work. Large collections of tiny files introduce overhead even if total data volume seems modest.

A date-partitioned Parquet dataset needs a lifecycle too: how do you compact new files, publish partition metadata, and handle late events or corrections? A layout that works for one historical export may degrade under frequent micro-batches.

## A practical comparison exercise

Create a report worksheet with these columns: engine, query/result grain, input size, filter, bytes scanned, data movement, runtime, cache state, and proposed change. Fill it with measurements from your own sandbox; these cloud examples are not executed by the repository's PostgreSQL tests.

Then explain why the same logical query might need a different physical optimization in each engine. The goal is a justified improvement, not a claim that one warehouse is universally faster.
