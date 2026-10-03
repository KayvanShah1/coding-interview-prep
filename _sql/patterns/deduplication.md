---
title: "Duplicates & latest records"
description: "Find repeated business keys and choose one version deterministically."
chapter: "patterns"
order: 1
sequence: 701
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

## Find duplicate business keys

Assume `user_profiles(profile_id, email, updated_at)`.

```sql
SELECT LOWER(TRIM(email)) AS normalized_email, COUNT(*) AS occurrences
FROM user_profiles
WHERE email IS NOT NULL
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1;
```

Whether case and spaces should be ignored is a business rule, not a universal deduplication rule.

## Keep the latest row for each key

```sql
WITH ranked AS (
    SELECT p.*,
           ROW_NUMBER() OVER (
               PARTITION BY LOWER(TRIM(email))
               ORDER BY updated_at DESC NULLS LAST, profile_id DESC
           ) AS rn
    FROM user_profiles p
    WHERE email IS NOT NULL
)
SELECT profile_id, email, updated_at
FROM ranked
WHERE rn = 1;
```

This selects records; it does not delete anything. Null-email rows are intentionally excluded and need a separate policy if they must be retained.

`SELECT DISTINCT *` only removes completely identical output rows. It does not implement “keep the newest version.”
