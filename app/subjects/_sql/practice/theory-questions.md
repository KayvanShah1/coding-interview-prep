---
title: "Database interview questions"
description: "Practice concise explanations of the concepts behind SQL queries."
chapter: "practice"
order: 11
sequence: 1411
level: "Core"
---

## Query semantics

<details markdown="1"><summary>WHERE versus HAVING versus window filtering?</summary>

`WHERE` filters source rows, `HAVING` filters groups after aggregation, and a window result is filtered in an outer query in PostgreSQL. BigQuery provides `QUALIFY`. Choosing the wrong stage changes the population used by a calculation.

</details>

<details markdown="1"><summary>Primary key versus unique key versus foreign key?</summary>

A primary key identifies rows with uniqueness and non-nullness. Unique constraints express other candidate uniqueness rules, with engine-specific null semantics. A foreign key enforces a reference to an eligible parent key. Keys can contain multiple columns.

</details>

<details markdown="1"><summary>COUNT(*) versus COUNT(column)?</summary>

The first counts input rows. The second counts non-null values in that column. After a left join, count a right-side non-null key to count matches; `COUNT(*)` includes the null-extended row for an unmatched left entity.

</details>

## Database behavior

<details markdown="1"><summary>DELETE versus TRUNCATE versus DROP?</summary>

DELETE removes qualifying rows, TRUNCATE removes all rows through a different operation, and DROP removes the object. Rollback, identity, locking, foreign-key, and trigger behavior differ by engine. PostgreSQL TRUNCATE can be rolled back.

</details>

<details markdown="1"><summary>Is a CTE faster than a subquery?</summary>

Not inherently. A CTE names an intermediate result. Inlining, materialization, predicates, and reuse influence the plan. Choose a readable correct query and inspect the actual execution plan for performance claims.

</details>

<details markdown="1"><summary>Clustered versus nonclustered index?</summary>

The terminology is engine-specific. In SQL Server, a clustered index organizes table data by its key; nonclustered indexes are separate access structures. PostgreSQL normally uses heap tables with separate indexes. PostgreSQL CLUSTER rewrites physical order at that moment; it does not maintain SQL Server-style clustering on future writes.

</details>

<details markdown="1"><summary>OLTP versus OLAP?</summary>

OLTP commonly serves many small transactional reads and writes with integrity and latency requirements. OLAP commonly scans and aggregates larger datasets for analysis. This influences schemas, storage layout, indexing, and concurrency choices; it is a workload distinction, not a claim that one database can only do one kind of query.

</details>

## Practice the explanation

For each answer, add one concrete example and one qualification. A good short answer explains the consequence: why a join loses non-returners, why a unique key rejects duplicates, or why an index creates write overhead.
