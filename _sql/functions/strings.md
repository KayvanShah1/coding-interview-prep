---
title: "String functions & regular expressions"
description: "Clean text, extract pieces, and distinguish literal patterns from regex."
chapter: "functions"
order: 1
sequence: 201
level: "Core"
references: [{"title":"PostgreSQL string functions","url":"https://www.postgresql.org/docs/current/functions-string.html"},{"title":"Pattern matching","url":"https://www.postgresql.org/docs/current/functions-matching.html"}]
---

## Clean before comparing, when the rules allow it

```sql
SELECT LOWER(TRIM('  Kayvan@Example.COM  ')) AS normalized_email,
       LENGTH('SQL') AS characters,
       SPLIT_PART('a@b.com', '@', 2) AS domain,
       REPLACE('data-engineer', '-', ' ') AS label;
```

| normalized_email | characters | domain | label |
|---|---:|---|---|
| kayvan@example.com | 3 | b.com | data engineer |

Normalization is a business decision. Lowercasing a code or password can change its meaning. `LENGTH` counts characters for text; byte length is a separate question.

## Concatenation and missing values

```sql
SELECT 'first' || NULL AS operator_result,
       CONCAT('first', NULL, 'last') AS concat_result,
       CONCAT_WS(' ', 'first', NULL, 'last') AS with_separator;
```

In PostgreSQL these return null, `firstlast`, and `first last`. `CONCAT_WS` skips null arguments and places separators between the remaining values. Empty strings are still values.

## LIKE versus regex

`LIKE 'A%'` asks whether a value starts with A. A regex describes more complex structure. PostgreSQL `~` is a case-sensitive regex match and `~*` is case-insensitive.

```sql
SELECT 'AB123' ~ '^[A-Z]{2}[0-9]{3}$' AS valid_code,
       REGEXP_REPLACE('Phone: 123-456', '[^0-9]', '', 'g') AS digits;
```

The results are true and `123456`. Anchors `^` and `$` require the entire string to follow the pattern. Without them, a substring can match. The `g` flag replaces all matches.

## Aggregate strings in a defined order

```sql
WITH skills(user_id, skill) AS (
    VALUES (1, 'SQL'), (1, 'Python'), (1, 'SQL')
)
SELECT user_id, STRING_AGG(DISTINCT skill, ', ' ORDER BY skill) AS skills
FROM skills
GROUP BY user_id;
```

Expected: user 1, `Python, SQL`. An ordered string aggregation is different from ordering the final result rows.
