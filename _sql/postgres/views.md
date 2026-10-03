---
title: "Views & materialized views"
description: "Separate reusable query definitions from stored query results."
chapter: "postgres"
order: 4
sequence: 1204
level: "Core"
references: [{"title":"PostgreSQL views","url":"https://www.postgresql.org/docs/current/tutorial-views.html"},{"title":"PostgreSQL materialized views","url":"https://www.postgresql.org/docs/current/rules-materializedviews.html"}]
---

## A view stores a query definition

```sql
CREATE VIEW paid_order_totals AS
SELECT customer_id, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY customer_id;

SELECT * FROM paid_order_totals WHERE revenue > 1000;
```

A regular view does not inherently cache the result. It can simplify access and provide a consistent interface, while the underlying query still needs to be evaluated.

## A materialized view stores results

```sql
CREATE MATERIALIZED VIEW daily_paid_revenue AS
SELECT order_ts::date AS sale_date, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY order_ts::date;

REFRESH MATERIALIZED VIEW daily_paid_revenue;
```

The stored result can speed repeated reads but becomes stale as source data changes. Refreshing has a cost and does not happen automatically just because the source changed.

## Freshness is part of correctness

Ask how old the result may be, how refresh failures are detected, and whether readers can tolerate refresh locking. PostgreSQL concurrent refresh has requirements, including a suitable unique index; it is not simply a free switch.

A CTE, a temporary table, a view, and a materialized view have different scopes and persistence. Explain which property the use case needs before choosing one.
