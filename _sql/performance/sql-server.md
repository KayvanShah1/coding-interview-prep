---
title: "SQL Server performance investigation"
description: "Connect actual plans, logical reads, waits, and Query Store history to a specific regression."
chapter: performance
order: 13
sequence: 1113
level: Intermediate
dialect: SQL Server
references:
  - title: SQL Server Query Store
    url: https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store?view=sql-server-ver17
  - title: SQL Server SET STATISTICS IO
    url: https://learn.microsoft.com/en-us/sql/t-sql/statements/set-statistics-io-transact-sql?view=sql-server-ver17
  - title: SQL Server parameter-sensitive plan optimization
    url: https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17
---

## Keep the workflow, change the instruments

The investigation still begins with correctness, a baseline, and a hypothesis. SQL Server supplies its own execution-plan tools and runtime diagnostics. PostgreSQL `EXPLAIN` syntax does not transfer directly.

For a representative read query in a sandbox, capture the actual execution plan through your client and enable:

```sql
SET STATISTICS IO ON;
SET STATISTICS TIME ON;
-- Run the query with representative parameter values here.
SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
```

Record logical reads, CPU/elapsed behavior, and the parameters. Treat these as complementary evidence; a query waiting on a lock needs a different response from a query consuming CPU on a large aggregation.

## Read the access path in context

A seek is not an automatic success. It can still touch many rows or be followed by repeated key lookups. A scan is not automatically a failure when the request needs much of the table.

For a frequent customer-history query, investigate whether a nonclustered index supports the filter/order and whether included columns can reduce lookups. Balance that against index size and update overhead. Check estimated-versus-actual rows, join inputs, sort/hash spills, and memory grants when relevant.

## Investigate parameter-sensitive behavior

One tenant may have far more records than others. Compare the same statement with representative small and large tenant values. Ask whether plan reuse, estimates, blocking, or result size explains the difference.

Modern SQL Server versions offer parameter-sensitive plan features under specific conditions and compatibility settings. Establish the version and configuration before giving advice. Recompilation or plan forcing has workload trade-offs; neither is a universal first response.

## Use history for regressions

Query Store can retain query, plan, and runtime history, allowing comparison across periods. When a report slowed after a deployment, compare its query text, plan, and workload conditions before and after. Availability of particular diagnostics depends on configuration and version.

If you use a previous plan as a mitigation, still investigate why the new plan appeared and whether the earlier plan suits today's data. Treat mitigation and root-cause correction as separate decisions.

## Interview scenario

“The query was fine yesterday. We did not change its SQL.” What could have changed?

<details markdown="1"><summary>Reasoned response</summary>

Data volume/distribution, statistics, indexes, parameters, plan compilation or reuse, blocking, competing jobs, and resource conditions. Collect history and compare the actual workload. Unchanged query text does not imply unchanged execution behavior.

</details>

This lesson provides a SQL Server investigation guide. Its diagnostic commands and server behavior require a SQL Server environment and are not validated by the PostgreSQL labs.
