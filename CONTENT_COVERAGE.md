# Content coverage

This is a scope map, not a claim of exhaustive SQL coverage. Each chapter has a decision reference, a reading route, and focused lesson pages.

## Foundations

- [Data types & casting](_sql/foundations/data-types.md)
- [Think in rows and grain](_sql/foundations/grain.md)
- [Query structure & execution order](_sql/foundations/query-order.md)
- [Relational databases & SQL commands](_sql/foundations/relational-basics.md)
- [Practice dataset & example conventions](_sql/foundations/sample-data.md)

## Filtering & expressions

- [NULL, CASE & conditional expressions](_sql/filtering/null-case.md)
- [BETWEEN, IN & pattern matching](_sql/filtering/predicates.md)

## Functions & dates

- [Dates, intervals & timezones](_sql/functions/date-time.md)
- [Numeric functions & safe arithmetic](_sql/functions/numeric-functions.md)
- [String functions & regular expressions](_sql/functions/strings.md)

## Joins & sets

- [Joins & row multiplication](_sql/joins/join-types.md)
- [Set operations & all-item matches](_sql/joins/set-operations.md)

## Aggregation

- [Counts, totals & conditional aggregation](_sql/aggregation/aggregate-functions.md)
- [GROUPING SETS, ROLLUP & CUBE](_sql/aggregation/grouping-sets.md)
- [Percentiles, WITHIN GROUP, and thresholds](_sql/aggregation/percentiles.md)

## Subqueries & CTEs

- [Subqueries & CTEs](_sql/subqueries/cte-basics.md)
- [EXISTS, IN, ANY & ALL](_sql/subqueries/exists-in-all.md)
- [LATERAL and per-row subqueries](_sql/subqueries/lateral.md)
- [Recursive CTEs & hierarchies](_sql/subqueries/recursive-cte.md)

## Window functions

- [NTILE, PERCENT_RANK & CUME_DIST](_sql/windows/distribution.md)
- [FIRST_VALUE & LAST_VALUE](_sql/windows/first-last.md)
- [Window frames](_sql/windows/frames.md)
- [The OVER clause](_sql/windows/introduction.md)
- [LAG, LEAD & period comparisons](_sql/windows/lag-lead.md)
- [ROW_NUMBER, RANK & DENSE_RANK](_sql/windows/ranking.md)
- [ROWS, RANGE & GROUPS](_sql/windows/rows-range-groups.md)
- [Running totals & moving averages](_sql/windows/running-calculations.md)

## Interview patterns

- [Duplicates & latest records](_sql/patterns/deduplication.md)
- [Ordered funnels](_sql/patterns/funnels.md)
- [Consecutive days & streaks](_sql/patterns/gaps-islands.md)
- [Pivots, medians & interval overlaps](_sql/patterns/mixed-patterns.md)
- [Period changes and missing months](_sql/patterns/period-changes.md)
- [Rates, populations, and weighted averages](_sql/patterns/rates-and-populations.md)
- [Retention & missing dates](_sql/patterns/retention-calendar.md)
- [Sessions & changes in state](_sql/patterns/sessions.md)

## Schema & data changes

- [Keys, constraints & defaults](_sql/schema/constraints.md)
- [CREATE, ALTER, DROP & TRUNCATE](_sql/schema/ddl.md)
- [INSERT, UPDATE & DELETE](_sql/schema/dml.md)
- [Upserts & MERGE](_sql/schema/upsert-merge.md)

## Database design

- [Fact tables, dimensions & slowly changing history](_sql/design/dimensional-modeling.md)
- [Normalization & functional dependencies](_sql/design/normalization.md)

## Transactions

- [ACID, commits & savepoints](_sql/transactions/acid.md)
- [Isolation levels & read anomalies](_sql/transactions/isolation.md)
- [Locks, deadlocks & lost updates](_sql/transactions/locks.md)

## Performance

- [Correctness & optimization traps](_sql/performance/common-mistakes.md)
- [Reading EXPLAIN plans](_sql/performance/explain.md)
- [Lab: investigate an order lookup](_sql/performance/index-lab.md)
- [Indexes and access paths](_sql/performance/indexes.md)
- [Joins, sorting, and memory](_sql/performance/joins-sorts.md)
- [Pagination: OFFSET and keysets](_sql/performance/pagination.md)
- [Lab: prove partition pruning](_sql/performance/partition-lab.md)
- [Partitioning & pruning](_sql/performance/partitioning.md)
- [Predicates and query rewrites](_sql/performance/sargability.md)
- [SQL Server performance investigation](_sql/performance/sql-server.md)
- [Statistics, cardinality, and skew](_sql/performance/statistics.md)
- [Warehouse performance: BigQuery, Redshift, Athena](_sql/performance/warehouses.md)
- [When and where to optimize](_sql/performance/workflow.md)

## Storage & scaling

- [Clustering means different things](_sql/scaling/clustering.md)
- [Choose the right storage or scaling change](_sql/scaling/decisions.md)
- [Replicas, freshness, and failover](_sql/scaling/replicas.md)
- [Sharding and distribution keys](_sql/scaling/sharding.md)

## PostgreSQL toolkit

- [Arrays & UNNEST](_sql/postgres/arrays.md)
- [JSONB extraction & expansion](_sql/postgres/jsonb.md)
- [DISTINCT ON & string types](_sql/postgres/postgres-shortcuts.md)
- [Functions, procedures & triggers](_sql/postgres/routines-triggers.md)
- [Privileges & parameterized queries](_sql/postgres/security.md)
- [Views & materialized views](_sql/postgres/views.md)

## Practice & revision

- [Find your next SQL problem](_sql/practice/platform-problems.md)

- [Apple Product Counts](_sql/practice/apple-users.md)
- [Later purchases of new products](_sql/practice/campaign-purchases.md)
- [Practice: diagnose before optimizing](_sql/practice/diagnosis-drills.md)
- [SQL dialect differences](_sql/practice/dialects.md)
- [Largest Olympics](_sql/practice/largest-olympics.md)
- [Mixed SQL practice with progressive hints](_sql/practice/mixed-drills.md)
- [Choose the right technique](_sql/practice/pattern-map.md)
- [Practice problem index](_sql/practice/problem-index.md)
- [Country rank changes](_sql/practice/rank-changes.md)
- [Sources, scope & coverage](_sql/practice/references.md)
- [Retention and the denominator](_sql/practice/retention-joins.md)
- [Revision drills](_sql/practice/revision-drills.md)
- [Spam Posts](_sql/practice/spam-posts.md)
- [Database interview questions](_sql/practice/theory-questions.md)
- [Top 5%: thresholds & quotas](_sql/practice/top-percent.md)

## Validation boundaries

PostgreSQL query results are checked with deterministic fixtures. Native PostgreSQL CI checks the index and pruning labs. SQL Server and cloud warehouse guidance is source-backed but requires those platforms for execution. Multi-session replication, failover, and sharding behavior is explained through scenarios rather than simulated by single-session tests.

## Planned subjects

- DSA
- Data Engineering
- Machine Learning
- AI Engineering
- Data Modeling and System Design
