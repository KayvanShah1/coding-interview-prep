---
title: "Partitioning & pruning"
description: "Separate physical data layout from window partitions and logical grouping."
chapter: "performance"
order: 4
sequence: 1104
level: "Intermediate"
references: [{"title":"PostgreSQL table partitioning","url":"https://www.postgresql.org/docs/current/ddl-partitioning.html"}]
---

## Three unrelated uses of grouping

`GROUP BY` summarizes rows. Window `PARTITION BY` defines groups for a calculation. Table partitioning physically organizes a table into child partitions under a partitioning rule.

```sql
CREATE TABLE event_log (
    event_id bigint,
    event_date date NOT NULL,
    payload jsonb
) PARTITION BY RANGE (event_date);
CREATE TABLE event_log_2026_01 PARTITION OF event_log
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

The partition's lower date is included and its upper date excluded. A row outside all defined partitions fails to insert unless a suitable default partition exists.

## Prune irrelevant data

```sql
SELECT COUNT(*) FROM event_log
WHERE event_date >= DATE '2026-01-01'
  AND event_date < DATE '2026-02-01';
```

The predicate can allow the planner or executor to avoid unrelated partitions. Partitioning is useful for large time-based workloads, retention management, and some maintenance operations.

## Trade-offs

Too many partitions increase planning and management overhead. A partition key unrelated to common filters may not reduce query work. Indexes inside partitions and partition pruning address different parts of access.

PostgreSQL unique constraints on a partitioned table have restrictions involving the partition key. Do not assume a globally unique event ID is automatically enforced by independent per-partition unique indexes.

In warehouses such as BigQuery, discuss partition pruning and clustering in that engine's terms. Their storage model and index options differ from PostgreSQL.
