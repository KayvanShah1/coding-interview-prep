---
title: "Schema & data changes"
nav_title: "Overview"
description: "Define tables, enforce constraints, and modify data safely."
chapter: "schema"
order: 0
sequence: 800
level: "Chapter overview"
---

## Use the schema to enforce the contract

Tables and constraints encode assumptions that query authors otherwise have to guess. Data changes introduce another question: what must happen atomically, and what happens when a write conflicts or repeats?

**Suggested route:** Study DDL and constraints before DML and upserts. Compare a declared uniqueness guarantee with deduplicating a query result.

**By the end:** Choose a constraint from an invariant and explain safe insert/update/delete behavior under that invariant.

## Decision reference

| Operation | Start with |
|---|---|
| Define or change structure | CREATE / ALTER TABLE |
| Enforce identity or relationships | PRIMARY KEY / UNIQUE / FOREIGN KEY |
| Enforce row rules | NOT NULL / CHECK |
| Change rows | INSERT / UPDATE / DELETE |
| Handle conflicts | ON CONFLICT / MERGE; engine-specific semantics |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/schema/constraints/' | relative_url }}">Keys, constraints & defaults</a><span>Encode data rules in the database and understand what each constraint guarantees.</span></li>
<li><a href="{{ '/sql/schema/ddl/' | relative_url }}">CREATE, ALTER, DROP & TRUNCATE</a><span>Distinguish changing a table's structure from changing its rows.</span></li>
<li><a href="{{ '/sql/schema/dml/' | relative_url }}">INSERT, UPDATE & DELETE</a><span>Change exactly the intended rows and inspect the results.</span></li>
<li><a href="{{ '/sql/schema/upsert-merge/' | relative_url }}">Upserts & MERGE</a><span>Define how incoming records interact with existing keys.</span></li>
</ul>

## How to study

Use the suggested route above. For each lesson, explain the decision in your own words, test its example, and identify a situation where a different approach would be needed.
