---
title: "Mixed SQL practice with progressive hints"
description: "Identify the grain and technique without being told the pattern in advance."
chapter: practice
order: 14
sequence: 1414
level: Intermediate
---

## Attempt first, then reveal

Use PostgreSQL. For each task, write the expected output before a query. The tiny fixtures make reasoning visible; you can paste a fixture CTE into your own solution. Open the first hint only when stuck, then compare the full answer.

## Task A: customers whose latest order is paid

Customer 1 has a paid order on January 1 and a pending order on January 2. Customer 2 has a paid order on January 2. Return only customer 2. Break equal-date ties using the larger order ID.

<details markdown="1"><summary>Hint: choose the population before filtering</summary>

“Latest order is paid” requires finding the latest order among all statuses. Filtering to paid orders first answers a different question.

</details>
<details markdown="1"><summary>Worked solution</summary>

```sql
WITH orders(order_id, customer_id, order_date, status) AS (
    VALUES (11, 1, DATE '2026-01-01', 'paid'),
           (12, 1, DATE '2026-01-02', 'pending'),
           (21, 2, DATE '2026-01-02', 'paid')
), ranked AS (
    SELECT *, ROW_NUMBER() OVER (
        PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC
    ) AS rn FROM orders
)
SELECT customer_id FROM ranked
WHERE rn = 1 AND status = 'paid'
ORDER BY customer_id;
```

The window chooses one winning row per customer. The outer filter inspects that row's status. Add another order with the same date to verify the tie policy.

</details>

## Task B: customers who bought every required product

Required products are A and B. Customer 1 bought A, B, and B again; customer 2 bought only A; customer 3 bought nothing. Return customer 1. If the required set is empty, return all three customers.

<details markdown="1"><summary>Hint: describe a disqualifying customer</summary>

A customer fails when there exists a required product they did not buy. Express “no such missing product exists.”

</details>
<details markdown="1"><summary>Worked solution</summary>

```sql
WITH customers(customer_id) AS (VALUES (1), (2), (3)),
required(product) AS (VALUES ('A'), ('B')),
purchases(customer_id, product) AS (
    VALUES (1, 'A'), (1, 'B'), (1, 'B'), (2, 'A')
)
SELECT c.customer_id FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM required r
    WHERE NOT EXISTS (
        SELECT 1 FROM purchases p
        WHERE p.customer_id = c.customer_id AND p.product = r.product
    )
)
ORDER BY c.customer_id;
```

Repeated purchases do not change existence. An empty required set contains no disqualifying product, so every customer qualifies. Compare this with a grouped-count solution, especially how it handles customers with no purchase rows.

</details>

## Task C: an absent month

January revenue is 100, March revenue is 150, and February has no fact rows. Produce month-over-month changes with a row for every month. Assume the load is complete and absent facts mean zero revenue.

<details markdown="1"><summary>Hint: create the comparison population</summary>

Aggregate sales to month, attach them to a complete calendar, then compare adjacent rows. Decide what percentage growth means when the previous value is zero.

</details>
<details markdown="1"><summary>Check your answer</summary>

February's absolute change is −100 and percentage change is −100%. March's absolute change is +150; its ordinary growth formula has a zero denominator and should return null or an explicitly defined label. See the complete [period-change solution]({{ '/sql/patterns/period-changes/' | relative_url }}).

</details>

## Explain your choices aloud

For one task, explain the population, intermediate grain, edge case, and rejected alternative in under two minutes. Then propose one additional fixture that would expose a plausible wrong solution. This tests understanding beyond remembering syntax.
