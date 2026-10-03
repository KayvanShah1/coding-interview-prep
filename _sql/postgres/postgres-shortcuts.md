---
title: "DISTINCT ON & string types"
description: "Recognize useful PostgreSQL-specific choices."
chapter: "postgres"
order: 2
sequence: 1202
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

**Latest row using `DISTINCT ON`:**

```sql
SELECT DISTINCT ON (customer_id)
       customer_id, order_id, order_ts, amount
FROM orders
ORDER BY customer_id, order_ts DESC NULLS LAST, order_id DESC;
```

The leading ordering expression matches `DISTINCT ON`; the remaining expressions choose the surviving row. Use the window version from section 9 when portability matters.

**String types:**

| Type | Main distinction |
|---|---|
| `TEXT` | Variable-length text without a declared length bound |
| `VARCHAR` | Variable-length text without a declared length bound |
| `VARCHAR(n)` | Variable-length text with a declared maximum length |
| `CHAR(n)` | Fixed-width, blank-padded character data |

Do not choose `CHAR(n)` expecting it to be faster in PostgreSQL. Choose a length bound when it expresses a real data constraint.
