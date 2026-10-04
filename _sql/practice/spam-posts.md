---
title: "Spam Posts"
description: "See why distinct posts and view records give different percentages."
chapter: "practice"
order: 6
sequence: 1406
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

The example schema has `facebook_posts(post_id, post_date, post_keywords, ...)` and `facebook_post_views(post_id, viewer_id)`. No view timestamp is available, so the following examples report by **post publication date**, not the date on which a view occurred.

Assume one row per post and that a case-insensitive substring match is the intended spam flag. If keywords are structured tokens, use token membership instead of a substring test.

**Interpretation 1: What percentage of distinct viewed posts are spam?**

```sql
WITH viewed_posts AS (
    SELECT p.post_id, p.post_date::date AS post_day,
           CASE WHEN p.post_keywords ILIKE '%spam%'
                THEN 1 ELSE 0 END AS is_spam
    FROM facebook_posts p
    WHERE EXISTS (
        SELECT 1
        FROM facebook_post_views v
        WHERE v.post_id = p.post_id
    )
)
SELECT post_day,
       ROUND(100.0 * SUM(is_spam) / NULLIF(COUNT(*), 0), 2)
           AS spam_post_percentage
FROM viewed_posts
GROUP BY post_day;
```

**Interpretation 2: What percentage of view records refer to spam posts?**

```sql
SELECT p.post_date::date AS post_day,
       ROUND(
           100.0 * SUM(CASE WHEN p.post_keywords ILIKE '%spam%'
                            THEN 1 ELSE 0 END)
           / NULLIF(COUNT(*), 0), 2
       ) AS spam_view_percentage
FROM facebook_posts p
JOIN facebook_post_views v ON v.post_id = p.post_id
GROUP BY p.post_date::date;
```

Suppose a spam post has nine view rows and a non-spam post has one, both published on the same date:

| Definition | Calculation | Result |
|---|---|---:|
| Distinct viewed posts | 1 spam post / 2 viewed posts | 50% |
| View records | 9 spam views / 10 views | 90% |

The difference is not a SQL optimization issue. It is a metric-definition issue. The second query also assumes each view row is a valid observation; duplicate ingestion records require a separate deduplication rule.

Before accepting a platform answer, compare its counting unit with the question and expected output.
