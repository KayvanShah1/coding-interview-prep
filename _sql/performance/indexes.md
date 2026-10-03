---
title: "Indexes and access paths"
description: "Choose indexes from predicates, ordering, and workload rather than a checklist."
chapter: "performance"
order: 2
sequence: 1102
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

An index-only scan also depends on whether the required columns are available and visibility checks permit avoiding heap access. “Covering” alone does not guarantee zero table reads.
