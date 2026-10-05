---
title: "Arrays & UNNEST"
description: "Expand arrays, preserve empty rows, and avoid accidental products."
chapter: "postgres"
order: 1
sequence: 1301
level: "Core"
references: [{"title":"PostgreSQL arrays","url":"https://www.postgresql.org/docs/current/functions-array.html"}]
---

Suppose `user_skills(user_id, skills TEXT[])` has `(1, ARRAY['SQL','Python'])` and `(2, ARRAY[]::text[])`.

```sql
SELECT u.user_id, s.skill, s.position
FROM user_skills u
CROSS JOIN LATERAL UNNEST(u.skills) WITH ORDINALITY AS s(skill, position)
ORDER BY u.user_id, s.position;
```

| user_id | skill | position |
|---:|---|---:|
| 1 | SQL | 1 |
| 1 | Python | 2 |

`UNNEST` expands the array; ordinality records element positions. The empty-array user produces no rows. To preserve that user:

```sql
SELECT u.user_id, s.skill
FROM user_skills u
LEFT JOIN LATERAL UNNEST(u.skills) AS s(skill) ON TRUE;
```

`LATERAL` allows the right-hand expression to reference the current left row. PostgreSQL table functions permit that reference without spelling out `LATERAL`; writing it can make the relationship clearer.

Two independent cross-joined expansions multiply their lengths. To pair arrays by position, use multi-array `UNNEST`:

```sql
SELECT *
FROM UNNEST(ARRAY['SQL','Python'], ARRAY[4,3]) AS x(skill, years);
```

Unequal lengths are padded with nulls, so check array lengths when correspondence is required.

Useful related operations:

```sql
-- Array membership; no need to expand the array just to test a match.
SELECT user_id FROM user_skills WHERE 'SQL' = ANY(skills);

-- Reassemble event-level values into a distinct sorted array.
SELECT user_id, ARRAY_AGG(DISTINCT device ORDER BY device) AS devices
FROM playbook_events
GROUP BY user_id;

-- Split a simple delimited string. This is not a full quoted-CSV parser.
SELECT UNNEST(STRING_TO_ARRAY('SQL,Python,dbt', ',')) AS skill;
```
