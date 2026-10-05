# Validation scope

## Automated

- Search regression checks cover focused content ranking, exact titles, token prefixes, multi-term queries, stable ordering, and matching excerpts.
- Lesson metadata, unique reading order, internal links, and balanced code fences.
- Selected SQL result checks in PostgreSQL via PGlite: window frames and ties, NULL membership, outer joins, aggregation grain, streaks, arrays, JSON, recursion, percentiles, retention, and funnels.
- Jekyll build in GitHub Actions on Linux.
- 40 deterministic PostgreSQL result checks, including continuous/discrete percentiles, calendar gaps, weighted rates, and mixed-practice answers.
- Native PostgreSQL 17 CI checks: identical ordered lookup results before/after indexing, timestamp-range equivalence, and one-partition versus all-partition access. Actual plans are available in the `performance-plans` artifact. No fixed timing threshold is asserted.

## Browser review

Review the landing page, subject switcher, chapter navigation, search, copy controls, outlines, platform/topic/level filters, expandable answers, and frame explorer at desktop and mobile sizes. Temporary browser review scripts are kept outside committed source.

## Limits

Not every illustrative SQL block is an independently executable script. Some are fragments, introduce tables in another block, need separate setup, or change schema and data. Examples state those assumptions.

Multi-session isolation, deadlocks, role administration, replication/failover, and distributed sharding behavior are explained but not verified by the single-session tests. SQL Server and cloud warehouse guidance requires those platforms for execution. Native lab measurements describe a controlled fixture, not production latency.

The supplied Database SQL interview questions.pdf could not be accessed through its attachment reference or Library lookup during this build. Its contents have not been claimed as reviewed or included. Accessible prior SQL material and primary online references were used instead.
