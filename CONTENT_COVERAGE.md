# Content coverage

Each lesson is a separate Markdown document. Overview pages are navigation, not duplicates of the lessons.

## Foundations

- [Think in rows and grain](_sql/foundations/grain.md)
- [Query structure & execution order](_sql/foundations/query-order.md)
- [Relational databases & SQL commands](_sql/foundations/relational-basics.md)
- [Data types & casting](_sql/foundations/data-types.md)
- [Practice dataset & example conventions](_sql/foundations/sample-data.md)

## Filtering & expressions

- [BETWEEN, IN & pattern matching](_sql/filtering/predicates.md)
- [NULL, CASE & conditional expressions](_sql/filtering/null-case.md)

## Functions & dates

- [String functions & regular expressions](_sql/functions/strings.md)
- [Numeric functions & safe arithmetic](_sql/functions/numeric-functions.md)
- [Dates, intervals & timezones](_sql/functions/date-time.md)

## Joins & sets

- [Joins & row multiplication](_sql/joins/join-types.md)
- [Set operations & all-item matches](_sql/joins/set-operations.md)

## Aggregation

- [Counts, totals & conditional aggregation](_sql/aggregation/aggregate-functions.md)
- [GROUPING SETS, ROLLUP & CUBE](_sql/aggregation/grouping-sets.md)

## Subqueries & CTEs

- [EXISTS, IN, ANY & ALL](_sql/subqueries/exists-in-all.md)
- [Subqueries & CTEs](_sql/subqueries/cte-basics.md)
- [Recursive CTEs & hierarchies](_sql/subqueries/recursive-cte.md)
- [LATERAL and per-row subqueries](_sql/subqueries/lateral.md)

## Window functions

- [The OVER clause](_sql/windows/introduction.md)
- [ROW_NUMBER, RANK & DENSE_RANK](_sql/windows/ranking.md)
- [Window frames](_sql/windows/frames.md)
- [ROWS, RANGE & GROUPS](_sql/windows/rows-range-groups.md)
- [LAG, LEAD & period comparisons](_sql/windows/lag-lead.md)
- [FIRST_VALUE & LAST_VALUE](_sql/windows/first-last.md)
- [Running totals & moving averages](_sql/windows/running-calculations.md)
- [NTILE, PERCENT_RANK & CUME_DIST](_sql/windows/distribution.md)

## Interview patterns

- [Duplicates & latest records](_sql/patterns/deduplication.md)
- [Consecutive days & streaks](_sql/patterns/gaps-islands.md)
- [Sessions & changes in state](_sql/patterns/sessions.md)
- [Retention & missing dates](_sql/patterns/retention-calendar.md)
- [Pivots, medians & interval overlaps](_sql/patterns/mixed-patterns.md)
- [Ordered funnels](_sql/patterns/funnels.md)

## Schema & data changes

- [Keys, constraints & defaults](_sql/schema/constraints.md)
- [CREATE, ALTER, DROP & TRUNCATE](_sql/schema/ddl.md)
- [INSERT, UPDATE & DELETE](_sql/schema/dml.md)
- [Upserts & MERGE](_sql/schema/upsert-merge.md)

## Database design

- [Normalization & functional dependencies](_sql/design/normalization.md)
- [Fact tables, dimensions & slowly changing history](_sql/design/dimensional-modeling.md)

## Transactions

- [ACID, commits & savepoints](_sql/transactions/acid.md)
- [Isolation levels & read anomalies](_sql/transactions/isolation.md)
- [Locks, deadlocks & lost updates](_sql/transactions/locks.md)

## Performance

- [Correctness & optimization traps](_sql/performance/common-mistakes.md)
- [Indexes and access paths](_sql/performance/indexes.md)
- [Reading EXPLAIN plans](_sql/performance/explain.md)
- [Partitioning & pruning](_sql/performance/partitioning.md)
- [Pagination: OFFSET and keysets](_sql/performance/pagination.md)

## PostgreSQL toolkit

- [Arrays & UNNEST](_sql/postgres/arrays.md)
- [DISTINCT ON & string types](_sql/postgres/postgres-shortcuts.md)
- [JSONB extraction & expansion](_sql/postgres/jsonb.md)
- [Views & materialized views](_sql/postgres/views.md)
- [Functions, procedures & triggers](_sql/postgres/routines-triggers.md)
- [Privileges & parameterized queries](_sql/postgres/security.md)

## Practice & revision

- [Choose the right technique](_sql/practice/pattern-map.md)
- [Revision drills](_sql/practice/revision-drills.md)
- [SQL dialect differences](_sql/practice/dialects.md)
- [Largest Olympics](_sql/practice/largest-olympics.md)
- [Apple Product Counts](_sql/practice/apple-users.md)
- [Spam Posts](_sql/practice/spam-posts.md)
- [Country rank changes](_sql/practice/rank-changes.md)
- [Top 5%: thresholds & quotas](_sql/practice/top-percent.md)
- [Later purchases of new products](_sql/practice/campaign-purchases.md)
- [Retention and the denominator](_sql/practice/retention-joins.md)
- [Database interview questions](_sql/practice/theory-questions.md)
- [Practice problem index](_sql/practice/problem-index.md)
- [Sources, scope & coverage](_sql/practice/references.md)
