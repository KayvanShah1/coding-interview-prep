---
title: "JSONB extraction & expansion"
description: "Query nested data while keeping types, missing keys, and row counts explicit."
chapter: "postgres"
order: 3
sequence: 1303
dialect: "PostgreSQL"
level: "Intermediate"
references: [{"title":"PostgreSQL JSON functions","url":"https://www.postgresql.org/docs/current/functions-json.html"}]
---

## JSON versus text extraction

```sql
WITH payloads(payload) AS (
    VALUES ('{"user":{"id":7},"tags":["sql","data"],"active":true}'::jsonb)
)
SELECT payload -> 'user' AS user_object,
       payload #>> '{user,id}' AS user_id_text,
       (payload ->> 'active')::boolean AS active
FROM payloads;
```

`->` returns a JSON value; `->>` returns text. `#>>` follows a path and returns text. Cast when a number or boolean is needed for calculation, and decide what invalid strings should do.

## Expand a JSON array

```sql
WITH docs(id, payload) AS (
    VALUES (1, '{"tags":["sql","data"]}'::jsonb)
)
SELECT d.id, t.tag
FROM docs d
CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS_TEXT(d.payload -> 'tags') AS t(tag);
```

The output has two rows for document 1. Multiple array expansions can multiply rows just like relational joins.

## Missing key and JSON null

A missing key extraction can produce SQL null. A present JSON `null` is a JSON value; text extraction can blur this distinction. Use key existence (`payload ? 'key'`) and JSON type inspection when presence itself matters.

Containment such as `payload @> '{"active":true}'::jsonb` can express structural predicates. Appropriate GIN indexes can help supported operators, but an index on the full JSON document does not automatically optimize every arbitrary extraction and cast.

Use JSON for data whose shape benefits from it. Stable relational keys, constraints, and frequently joined attributes may deserve typed columns.
