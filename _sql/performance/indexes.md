---
title: "Indexes and access paths"
description: "Choose indexes from predicates, ordering, and workload rather than a checklist."
chapter: "performance"
order: 3
sequence: 1103
level: "Core"
references: [{"title":"PostgreSQL indexes","url":"https://www.postgresql.org/docs/current/indexes.html"}]
---

## An index trades write work for read access

An index is an additional structure the engine can use to locate rows. It consumes storage and must be maintained as data changes. Indexing every column is rarely a good default.

```sql
CREATE INDEX orders_customer_time_idx
ON orders (customer_id, order_ts DESC, order_id DESC);
```

This is a candidate for queries that filter a customer and return the latest orders. It is not evidence that every such query will use it.

## Useful PostgreSQL variants

| Index | Typical use |
|---|---|
| B-tree | Equality, ranges, and ordered access |
| GIN | Inverted membership searches such as supported array/JSONB operators |
| BRIN | Summaries over physically correlated ranges, often large append-oriented data |
| Partial | Index only rows matching a predicate |
| Expression | Index a computed expression used by queries |

```sql
CREATE INDEX customers_lower_name_idx ON customers (LOWER(name));
CREATE INDEX paid_orders_time_idx ON orders (order_ts)
WHERE status = 'paid';
```

The query must allow the planner to use the expression or imply the partial predicate. Parameterization and data selectivity can affect that decision.

## Composite index reasoning

For `(customer_id, order_ts)`, equality on customer ID and a time range can narrow the relevant region. Filtering only on time may be less effective; behavior depends on the optimizer and supported access strategies. Avoid absolute claims that any query missing the first column can never use the index.

An index-only scan also depends on whether the required columns are available and visibility checks permit avoiding heap access. "Covering" alone does not guarantee zero table reads.

## Choose the key order from a request

Compare two requests: “latest 20 orders for this customer” and “all orders from yesterday.” The first fixes a customer and needs time ordering within that customer. The second restricts time across customers. One composite index need not serve both equally well.

For the first request, reason through `(customer_id, order_ts DESC, order_id DESC)`: customer equality narrows the group, time orders it, and order ID makes ties deterministic. A candidate `INCLUDE (amount)` can make the returned amount available without making it part of the search ordering. Whether heap reads are avoided still depends on visibility and the actual plan.

For the second request, investigate a time-oriented access path, pruning, or a scan depending on the requested fraction. Do not mechanically place the highest-cardinality column first; use predicates and ordering as the starting point.

## Measure benefits and costs

Record the plans and reads for frequent queries before and after adding an index. Also evaluate insertion/update throughput, storage, and overlapping indexes. On a write-heavy table, a marginal improvement to an infrequent report may not justify another maintained structure.

Index creation in a production system requires an engine-specific operational procedure. The [lab]({{ '/sql/performance/index-lab/' | relative_url }}) deliberately uses a disposable database so the learning experiment does not imply a production rollout method.

## Check your reasoning

“An index exists, but PostgreSQL scans the table. Should we force it?”

<details markdown="1"><summary>Discussion</summary>

First inspect the fraction of rows requested, available order, table size, statistics, and actual reads. Scanning can be appropriate. If estimates are wrong, investigate their cause. If an expression or data type prevents useful indexed access, inspect the predicate. The word “scan” alone does not justify forcing another plan.

</details>
