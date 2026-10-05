# Content coverage

This is a scope map, not a claim of exhaustive SQL coverage. Each chapter has a decision reference, a reading route, and focused lesson pages.

## Foundations

- [Data types & casting](../app/subjects/_sql/foundations/data-types.md)
- [Think in rows and grain](../app/subjects/_sql/foundations/grain.md)
- [Query structure & execution order](../app/subjects/_sql/foundations/query-order.md)
- [Relational databases & SQL commands](../app/subjects/_sql/foundations/relational-basics.md)
- [Practice dataset & example conventions](../app/subjects/_sql/foundations/sample-data.md)

## Filtering & expressions

- [NULL, CASE & conditional expressions](../app/subjects/_sql/filtering/null-case.md)
- [BETWEEN, IN & pattern matching](../app/subjects/_sql/filtering/predicates.md)

## Functions & dates

- [Dates, intervals & timezones](../app/subjects/_sql/functions/date-time.md)
- [Numeric functions & safe arithmetic](../app/subjects/_sql/functions/numeric-functions.md)
- [String functions & regular expressions](../app/subjects/_sql/functions/strings.md)

## Joins & sets

- [Joins & row multiplication](../app/subjects/_sql/joins/join-types.md)
- [Set operations & all-item matches](../app/subjects/_sql/joins/set-operations.md)

## Aggregation

- [Counts, totals & conditional aggregation](../app/subjects/_sql/aggregation/aggregate-functions.md)
- [GROUPING SETS, ROLLUP & CUBE](../app/subjects/_sql/aggregation/grouping-sets.md)
- [Percentiles, WITHIN GROUP, and thresholds](../app/subjects/_sql/aggregation/percentiles.md)

## Subqueries & CTEs

- [Subqueries & CTEs](../app/subjects/_sql/subqueries/cte-basics.md)
- [EXISTS, IN, ANY & ALL](../app/subjects/_sql/subqueries/exists-in-all.md)
- [LATERAL and per-row subqueries](../app/subjects/_sql/subqueries/lateral.md)
- [Recursive CTEs & hierarchies](../app/subjects/_sql/subqueries/recursive-cte.md)

## Window functions

- [NTILE, PERCENT_RANK & CUME_DIST](../app/subjects/_sql/windows/distribution.md)
- [FIRST_VALUE & LAST_VALUE](../app/subjects/_sql/windows/first-last.md)
- [Window frames](../app/subjects/_sql/windows/frames.md)
- [The OVER clause](../app/subjects/_sql/windows/introduction.md)
- [LAG, LEAD & period comparisons](../app/subjects/_sql/windows/lag-lead.md)
- [ROW_NUMBER, RANK & DENSE_RANK](../app/subjects/_sql/windows/ranking.md)
- [ROWS, RANGE & GROUPS](../app/subjects/_sql/windows/rows-range-groups.md)
- [Running totals & moving averages](../app/subjects/_sql/windows/running-calculations.md)

## Interview patterns

- [Duplicates & latest records](../app/subjects/_sql/patterns/deduplication.md)
- [Ordered funnels](../app/subjects/_sql/patterns/funnels.md)
- [Consecutive days & streaks](../app/subjects/_sql/patterns/gaps-islands.md)
- [Pivots, medians & interval overlaps](../app/subjects/_sql/patterns/mixed-patterns.md)
- [Period changes and missing months](../app/subjects/_sql/patterns/period-changes.md)
- [Rates, populations, and weighted averages](../app/subjects/_sql/patterns/rates-and-populations.md)
- [Retention & missing dates](../app/subjects/_sql/patterns/retention-calendar.md)
- [Sessions & changes in state](../app/subjects/_sql/patterns/sessions.md)

## Schema & data changes

- [Keys, constraints & defaults](../app/subjects/_sql/schema/constraints.md)
- [CREATE, ALTER, DROP & TRUNCATE](../app/subjects/_sql/schema/ddl.md)
- [INSERT, UPDATE & DELETE](../app/subjects/_sql/schema/dml.md)
- [Upserts & MERGE](../app/subjects/_sql/schema/upsert-merge.md)

## Database design

- [Fact tables, dimensions & slowly changing history](../app/subjects/_sql/design/dimensional-modeling.md)
- [Normalization & functional dependencies](../app/subjects/_sql/design/normalization.md)

## Transactions

- [ACID, commits & savepoints](../app/subjects/_sql/transactions/acid.md)
- [Isolation levels & read anomalies](../app/subjects/_sql/transactions/isolation.md)
- [Locks, deadlocks & lost updates](../app/subjects/_sql/transactions/locks.md)

## Performance

- [Correctness & optimization traps](../app/subjects/_sql/performance/common-mistakes.md)
- [Reading EXPLAIN plans](../app/subjects/_sql/performance/explain.md)
- [Lab: investigate an order lookup](../app/subjects/_sql/performance/index-lab.md)
- [Indexes and access paths](../app/subjects/_sql/performance/indexes.md)
- [Joins, sorting, and memory](../app/subjects/_sql/performance/joins-sorts.md)
- [Pagination: OFFSET and keysets](../app/subjects/_sql/performance/pagination.md)
- [Lab: prove partition pruning](../app/subjects/_sql/performance/partition-lab.md)
- [Partitioning & pruning](../app/subjects/_sql/performance/partitioning.md)
- [Predicates and query rewrites](../app/subjects/_sql/performance/sargability.md)
- [SQL Server performance investigation](../app/subjects/_sql/performance/sql-server.md)
- [Statistics, cardinality, and skew](../app/subjects/_sql/performance/statistics.md)
- [Warehouse performance: BigQuery, Redshift, Athena](../app/subjects/_sql/performance/warehouses.md)
- [When and where to optimize](../app/subjects/_sql/performance/workflow.md)

## Storage & scaling

- [Clustering means different things](../app/subjects/_sql/scaling/clustering.md)
- [Choose the right storage or scaling change](../app/subjects/_sql/scaling/decisions.md)
- [Replicas, freshness, and failover](../app/subjects/_sql/scaling/replicas.md)
- [Sharding and distribution keys](../app/subjects/_sql/scaling/sharding.md)

## PostgreSQL toolkit

- [Arrays & UNNEST](../app/subjects/_sql/postgres/arrays.md)
- [JSONB extraction & expansion](../app/subjects/_sql/postgres/jsonb.md)
- [DISTINCT ON & string types](../app/subjects/_sql/postgres/postgres-shortcuts.md)
- [Functions, procedures & triggers](../app/subjects/_sql/postgres/routines-triggers.md)
- [Privileges & parameterized queries](../app/subjects/_sql/postgres/security.md)
- [Views & materialized views](../app/subjects/_sql/postgres/views.md)

## Practice & revision

- [Find your next SQL problem](../app/subjects/_sql/practice/platform-problems.md)

- [Apple Product Counts](../app/subjects/_sql/practice/apple-users.md)
- [Later purchases of new products](../app/subjects/_sql/practice/campaign-purchases.md)
- [Practice: diagnose before optimizing](../app/subjects/_sql/practice/diagnosis-drills.md)
- [SQL dialect differences](../app/subjects/_sql/practice/dialects.md)
- [Largest Olympics](../app/subjects/_sql/practice/largest-olympics.md)
- [Mixed SQL practice with progressive hints](../app/subjects/_sql/practice/mixed-drills.md)
- [Choose the right technique](../app/subjects/_sql/practice/pattern-map.md)
- [Practice problem index](../app/subjects/_sql/practice/problem-index.md)
- [Country rank changes](../app/subjects/_sql/practice/rank-changes.md)
- [Sources, scope & coverage](../app/subjects/_sql/practice/references.md)
- [Retention and the denominator](../app/subjects/_sql/practice/retention-joins.md)
- [Revision drills](../app/subjects/_sql/practice/revision-drills.md)
- [Spam Posts](../app/subjects/_sql/practice/spam-posts.md)
- [Database interview questions](../app/subjects/_sql/practice/theory-questions.md)
- [Top 5%: thresholds & quotas](../app/subjects/_sql/practice/top-percent.md)

## Validation boundaries

PostgreSQL query results are checked with deterministic fixtures. Native PostgreSQL CI checks the index and pruning labs. SQL Server and cloud warehouse guidance is source-backed but requires those platforms for execution. Multi-session replication, failover, and sharding behavior is explained through scenarios rather than simulated by single-session tests.

## Planned subjects

- DSA
- Data Engineering
- Machine Learning
- AI Engineering
- Data Modeling and System Design
