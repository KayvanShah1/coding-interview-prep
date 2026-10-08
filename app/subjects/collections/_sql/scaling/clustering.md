---
title: "Clustering means different things"
description: "Distinguish BigQuery storage blocks, clustered indexes, PostgreSQL CLUSTER, and database clusters."
chapter: scaling
order: 2
sequence: 1202
level: Intermediate
dialect: Cross-engine concepts
references:
  - title: BigQuery clustered tables
    url: https://docs.cloud.google.com/bigquery/docs/clustered-tables
  - title: PostgreSQL CLUSTER
    url: https://www.postgresql.org/docs/current/sql-cluster.html
  - title: SQL Server clustered and nonclustered indexes
    url: https://learn.microsoft.com/en-us/sql/relational-databases/indexes/clustered-and-nonclustered-indexes-described?view=sql-server-ver17
---

## Name the engine first

“We use clustering” is ambiguous. Ask whether the speaker means physical table organization, an index structure, or multiple database nodes. Those meanings lead to different design and maintenance decisions.

## BigQuery: organize blocks around filtered values

BigQuery clustering organizes storage blocks using selected columns. A filter can allow block pruning. With multiple clustering columns, their order matters. Partitioning and clustering can be combined: choose the relevant date partitions, then reduce block access within them.

For a synthetic telemetry table, consider date partitioning with `asset_id` as the first clustering column when selective asset-and-date requests are frequent. If most requests filter region across all assets, reassess the key order and actual benefit. A column's high cardinality alone is not a complete workload argument.

```sql
-- BigQuery; replace the project and dataset with your own sandbox.
CREATE TABLE `your_project.sandbox.telemetry` (
  event_ts TIMESTAMP,
  asset_id STRING,
  site_id STRING,
  reading FLOAT64
)
PARTITION BY DATE(event_ts)
CLUSTER BY asset_id, site_id;
```

Measure bytes processed and execution details for the actual filters. Do not promise the same pruning for every query, or equate clustering with a PostgreSQL B-tree lookup.

## SQL Server: a clustered index

A SQL Server clustered index stores table data at the leaf level of its index structure. A nonclustered index provides another structure with row locators. Key width, stability, insertion behavior, and access patterns therefore matter beyond a single lookup.

The interview question is not merely “which column is unique?” Ask how the key affects frequent access and the cost of maintaining other indexes. Keep this explanation separate from BigQuery clustering.

## PostgreSQL: CLUSTER is an operation

PostgreSQL `CLUSTER` rewrites a table according to an index. Subsequent changes do not continuously preserve that physical ordering. Re-clustering has locking, space, and maintenance implications. It is not equivalent to declaring a SQL Server clustered index.

```sql
-- Illustrative maintenance operation, not part of the automated lab.
CLUSTER coretrail_lab.orders USING orders_customer_recent_idx;
```

Use a disposable database to study it. Do not introduce a maintenance rewrite into a busy system without evaluating its operational impact.

## Exercise

“We clustered by asset ID, so this query must be fast.” What is missing?

<details markdown="1"><summary>Discussion</summary>

The engine, mechanism, table size, filters, key order, selected columns, and execution evidence. A cross-fleet report that requests most data may benefit little from asset-oriented pruning. A distributed database cluster says nothing by itself about physical row locality.

</details>
