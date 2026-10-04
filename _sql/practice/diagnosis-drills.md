---
title: "Practice: diagnose before optimizing"
description: "Use symptoms and evidence to choose your next investigation, then compare the reasoning."
chapter: practice
order: 15
sequence: 1415
level: Lab
dialect: Cross-engine concepts
references: []
---

## How to use these scenarios

For each scenario, write four sentences: the question you would clarify, the evidence you would collect, one hypothesis, and how you would check it. Try before opening the discussion. A named optimization without supporting evidence is not a complete answer.

## 1. The index exists, but the query scans

A report returns 80% of an orders table. An index exists on its filter column, but the plan scans the table. Is the index broken?

<details markdown="1"><summary>Discussion</summary>

A broad request can make a scan reasonable. Check the fraction selected, row width, available covering paths, reads, and runtime. Compare a selective request to understand when the index is useful. Do not force an index just to remove the word “scan.”

</details>

## 2. A join is both slow and wrong

An order's item total is 100 and payment total is 100. After joining items and payments, both totals are inflated.

<details markdown="1"><summary>Discussion</summary>

Inspect child-row counts and join multiplicity. Aggregate each child to order grain when that matches the requirement, then join. Test totals and row counts before measuring performance. Additional indexes cannot repair duplicated measures.

</details>

## 3. January became more expensive

A BigQuery report for January now scans data from the whole year after a dashboard change.

<details markdown="1"><summary>Discussion</summary>

Compare the emitted query, partition column, date predicates, and scanned bytes. Check whether the dashboard stopped sending the restriction or transformed it into a form that prevents the intended pruning. Verify the resulting date population. Clustering is a separate question from restoring the missing time restriction.

</details>

## 4. One large tenant dominates

A query runs well for ordinary tenants but becomes slow for one large account.

<details markdown="1"><summary>Discussion</summary>

Compare actual rows, parameters, plans, waits, and result size. Investigate skew and plan reuse. Test both tenant sizes after a change. Sharding by tenant may still concentrate that large tenant, so distribution is not an automatic cure.

</details>

## 5. The user cannot see their new order

The write succeeded, but the next request sometimes shows an empty history. It appears later without another write.

<details markdown="1"><summary>Discussion</summary>

Inspect request routing and replica lag, while also checking caching and transaction behavior. Define the read-after-write contract. For critical confirmation, a primary read or a supported replication-position mechanism may be needed. A fixed sleep is not a freshness guarantee.

</details>

## 6. The faster query lost customers

An engineer moves a paid-order filter from the `ON` clause of a left join into `WHERE`. Runtime improves, but some customers vanish.

<details markdown="1"><summary>Discussion</summary>

The new filter rejects unmatched rows, changing the population. Restore the intended outer-join semantics and test a customer with no orders. Only compare performance for queries meeting the same contract.

</details>

## Turn the reasoning into evidence

Run the [index lab]({{ '/sql/performance/index-lab/' | relative_url }}) and [partition lab]({{ '/sql/performance/partition-lab/' | relative_url }}). Keep a short note for each: baseline, hypothesis, change, result comparison, plan evidence, and remaining uncertainty. That note is the basis of a stronger spoken interview answer.
