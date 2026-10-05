---
title: "NTILE, PERCENT_RANK & CUME_DIST"
description: "Distinguish equal-row buckets from relative rank and cumulative distribution."
chapter: "windows"
order: 8
sequence: 608
level: "Intermediate"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

## Similar names, different questions

```sql
WITH scores(id, score) AS (
    VALUES (1, 10), (2, 20), (3, 20), (4, 40)
)
SELECT id, score,
       NTILE(2) OVER (ORDER BY score, id) AS half,
       PERCENT_RANK() OVER (ORDER BY score) AS relative_rank,
       CUME_DIST() OVER (ORDER BY score) AS cumulative_fraction
FROM scores
ORDER BY score, id;
```

| id | score | half | relative_rank | cumulative_fraction |
|---:|---:|---:|---:|---:|
| 1 | 10 | 1 | 0 | 0.25 |
| 2 | 20 | 1 | 0.3333… | 0.75 |
| 3 | 20 | 2 | 0.3333… | 0.75 |
| 4 | 40 | 2 | 1 | 1 |

`NTILE` divides rows as evenly as possible. It can split tied scores between buckets. `PERCENT_RANK` uses the starting rank of a peer group; `CUME_DIST` includes the whole peer group in the cumulative fraction.

## Ordering changes the interpretation

With ascending scores, a high cumulative fraction corresponds to a high score. Descending order reverses the perspective. Exclude null scores or specify their placement according to the intended population.

Do not add a unique ID to percent-rank ordering if equal scores should be peers. The ID is appropriate for deterministic NTILE assignment when ties must be broken.

## Exercise

If every score is identical, what happens?

<details markdown="1"><summary>Show the answer</summary>

`PERCENT_RANK` is 0 for every row and `CUME_DIST` is 1 for every row. `NTILE` still divides the rows into buckets. A claim that these are interchangeable ways of selecting the top 5% would fail this case.

</details>
