---
title: "How a query actually runs"
description: "Follow SQL from text through parsing, planning, execution, and returned rows."
chapter: "foundations"
order: 3
sequence: 3
level: "Core"
mermaid: true
references:
  - title: PostgreSQL query processing
    url: https://www.postgresql.org/docs/current/query-path.html
  - title: PostgreSQL EXPLAIN
    url: https://www.postgresql.org/docs/current/using-explain.html
  - title: PostgreSQL planner statistics
    url: https://www.postgresql.org/docs/current/planner-stats.html
---

SQL is declarative. You describe the result you want; the database decides which physical operations should produce it.

A useful mental model is:

{% capture diagram_code %}
flowchart LR
A["SQL text"] --> B["Parse"]
B --> C["Bind / analyze"]
C --> D["Rewrite"]
D --> E["Plan / optimize"]
E --> F["Execute"]
F --> G["Return rows"]
{% endcapture %}
{% capture diagram_fallback %}
SQL text → Parse → Bind / analyze → Rewrite → Plan / optimize → Execute → Return rows
{% endcapture %}
{% include diagram.html title="From SQL text to rows" code=diagram_code fallback=diagram_fallback %}

The exact internals differ by database, but this model is enough to reason about PostgreSQL and most interview questions.

## 1. Parse: is this valid SQL?

The parser checks the grammar and builds an internal representation of the statement.

```sql
SELEKT customer_id FROM orders;
```

fails here because the syntax is invalid. At this stage the database is mainly deciding what the statement structurally says, not which index or join algorithm to use.

## 2. Bind and analyze: what do these names mean?

The engine resolves tables, columns, functions, operators, and types.

```sql
SELECT customer_id
FROM orders
WHERE amount > 100;
```

It needs to determine which `orders` relation is visible, what type `amount` has, which `>` operator applies, and whether referenced objects and expressions are valid.

Errors such as an unknown column or incompatible types normally surface around this stage.

## 3. Rewrite: transform without changing meaning

Before cost-based planning, the database can expand or transform parts of the query. In PostgreSQL this stage includes the rewrite system and handling of constructs such as views.

The important interview point is not to memorize every rewrite rule. Remember that the SQL text you wrote does not have to map one-to-one to physical operations.

A subquery, view, or CTE may be transformed, inlined, or otherwise represented differently in the final plan when the engine can preserve semantics.

## 4. Plan and optimize: choose a physical strategy

This is where the database asks questions such as:

- sequential scan or index scan?
- which table should be accessed first?
- nested loop, hash join, or merge join?
- hash aggregate or sort/group aggregate?
- is a separate sort required?
- can partitions be pruned?
- can work run in parallel?
- can an index satisfy both the filter and requested order?

The optimizer compares possible plans using estimated cost. Those estimates depend heavily on **cardinality estimates**: how many rows it expects each operation to produce.

For example:

```sql
SELECT c.region, SUM(o.amount) AS revenue
FROM orders o
JOIN customers c
  ON c.customer_id = o.customer_id
WHERE o.order_ts >= TIMESTAMP '2026-01-01'
GROUP BY c.region
ORDER BY revenue DESC;
```

A plausible physical strategy could be:

1. scan the relevant portion of `orders`;
2. apply the date predicate during that access;
3. scan or look up matching customers;
4. join the two inputs;
5. aggregate by region;
6. sort the grouped rows by revenue;
7. return the result.

But that is only one possible shape. A different data distribution, index, or table size can produce a different plan for the same SQL.

## 5. Execute: run the chosen plan

The executor performs the plan's physical operations.

A PostgreSQL plan is a tree of nodes such as:

```text
Sort
  -> HashAggregate
       -> Hash Join
            -> Seq Scan on orders
            -> Hash
                 -> Seq Scan on customers
```

Think of rows flowing through this tree. A scan produces rows, a filter discards some, a join combines inputs, an aggregate reduces many rows into groups, and a sort orders the surviving result.

Some nodes can begin returning rows quickly. Others are **blocking**: a sort usually needs its input before it can emit correctly ordered rows, and a hash aggregate or hash join may need to build an in-memory structure first.

## 6. Return rows to the client

Execution time inside the database is not always the whole latency.

A query returning millions of rows can spend significant time serializing results, sending them over the network, and having the application consume them. Returning `SELECT *` from a wide table can therefore be expensive even when the database finds those rows quickly.

## Where plans go wrong

Most bad plans are not “the optimizer being random.” They usually come from a mismatch between estimates, data shape, available access paths, and the query.

| Symptom | What may be happening |
|---|---|
| Index exists but planner scans | Query reads a large fraction of the table, predicate is not selective, or the expression does not match the usable index |
| Nested loop becomes very slow | Outer side produced far more rows than estimated, making repeated inner lookups expensive |
| Hash join or aggregate spills | Hash structure exceeded available memory |
| Sort spills to disk | Sort input was larger than memory available for the operation |
| Wrong join order | Cardinality estimates were inaccurate, often because of skew or correlated columns |
| Partitioned table still reads too much | Predicate does not support pruning or does not constrain the partition key effectively |
| Plan is fast for one parameter and slow for another | Different parameter values need different strategies but a reused plan may suit only one distribution |

The first useful debugging question is usually:

> **Where does estimated work diverge from actual work?**

That is why the difference between estimated and actual rows matters so much in `EXPLAIN ANALYZE`.

## EXPLAIN versus EXPLAIN ANALYZE

```sql
EXPLAIN
SELECT *
FROM orders
WHERE customer_id = 42;
```

shows the planner's chosen plan and estimates without running the query.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE customer_id = 42;
```

runs the statement and adds actual timing, row counts, loops, and buffer information.

For a slow query, compare:

- estimated rows versus actual rows;
- rows removed by filters;
- scan type;
- join algorithm and loop counts;
- sort method and whether it spilled;
- buffer reads/hits;
- the node where most time or repeated work accumulates.

Do not optimize from the top line alone. Follow the tree and find where the unexpectedly large amount of work begins.

## Connect this back to query writing

When writing SQL, you control the **problem definition**:

- correct grain;
- correct join relationships;
- useful row filters;
- whether an unnecessary `DISTINCT` or sort exists;
- whether predicates are expressed in a form an index or partitioning scheme can use;
- whether you are asking for 20 rows or 20 million.

The optimizer controls the physical strategy.

Your job is therefore not to manually dictate every operation. Write a query that expresses the right problem cleanly, then use the plan to check whether the engine is doing sensible work.

For deeper tuning, continue to [Reading EXPLAIN]({{ '/sql/performance/explain/' | relative_url }}), [Indexes]({{ '/sql/performance/indexes/' | relative_url }}), and [Statistics, cardinality, and skew]({{ '/sql/performance/statistics/' | relative_url }}).
