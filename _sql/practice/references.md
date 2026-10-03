---
title: "Sources, scope & coverage"
description: "Understand what the handbook covers and where to verify dialect-specific details."
chapter: "practice"
order: 13
sequence: 1313
level: "Core"
references: []
---

## Scope

This handbook is an interview-oriented SQL reference, from querying fundamentals through practical database engineering concepts. It is not a replacement for an engine's full manual. PostgreSQL is the teaching dialect; relevant BigQuery and MySQL differences are labelled.

Lessons use original explanations, small datasets, and worked patterns. Practice-platform questions inspire the problem categories; linked original tasks remain the authority for their own schemas and grading rules.

## Primary references

| Source | Use it for |
|---|---|
| [PostgreSQL documentation](https://www.postgresql.org/docs/current/) | SQL syntax, null behavior, window frames, storage, concurrency, and plans |
| [GoogleSQL reference](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax) | BigQuery syntax and QUALIFY |
| [MySQL reference](https://dev.mysql.com/doc/refman/8.4/en/) | MySQL date functions and engine-specific behavior |
| [Microsoft dimensional modeling guidance](https://learn.microsoft.com/en-us/power-bi/guidance/star-schema) | Facts, dimensions, and analytical modeling |

Individual pages link to the relevant manual sections. Check the database version when a feature has changed or is unavailable on a practice platform.

## Coverage and maintenance

The [content map](https://github.com/KayvanShah1/coding-interview-prep/blob/main/CONTENT_COVERAGE.md) lists every lesson. Contributions should add a focused page with explicit input assumptions, a query, an expected result or interpretation, and edge cases.

Executable checks cover selected result-sensitive examples, including ties, null membership, window frames, join multiplication, and streaks. Multi-session locking behavior requires an actual concurrent database setup; a single-session sample cannot validate it.

## How to evaluate an answer

Do not accept a solution just because it runs. Compare its population, grain, time boundaries, tie handling, and denominator with the prompt. If two solutions differ, build the smallest input that makes their outputs diverge.
