---
title: "Window frames"
description: "Choose exactly which rows participate in a calculation."
chapter: "windows"
order: 3
sequence: 603
level: "Core"
references: [{"title":"PostgreSQL window-frame syntax","url":"https://www.postgresql.org/docs/current/sql-expressions.html"}]
---

## Explore the moving frame

Change the current row and the frame. Highlighted cells are included in the sum; the outlined cell is the current row.

<div class="frame-demo"><div class="frame-controls"><label>Current row <input type="range" min="0" max="4" value="2" aria-label="Current row"></label><label>Frame <select aria-label="Window frame"><option value="trailing">2 PRECEDING → CURRENT ROW</option><option value="following">CURRENT ROW → 2 FOLLOWING</option><option value="previous">3 PRECEDING → 1 PRECEDING</option><option value="running">UNBOUNDED PRECEDING → CURRENT ROW</option></select></label></div><div class="frame-grid"></div><p class="frame-output" aria-live="polite"></p></div>

Here, `BETWEEN` specifies frame boundaries. It does not filter output rows like `WHERE amount BETWEEN ...`.

```sql
SUM(revenue) OVER (
    ORDER BY sale_date
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
)
```

Interpret this as: order the rows by date, then sum the current row and up to two rows before it.

| Boundary | Meaning with ROWS |
|---|---|
| `UNBOUNDED PRECEDING` | Start of the partition |
| `2 PRECEDING` | Two row positions before the current row |
| `CURRENT ROW` | This row |
| `2 FOLLOWING` | Two row positions after the current row |
| `UNBOUNDED FOLLOWING` | End of the partition |

## Frame recipes to remember

| Frame | Typical use |
|---|---|
| `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` | Running total |
| `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` | Three-row trailing calculation |
| `ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING` | Previous three rows, excluding current |
| `ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING` | Current and next two rows |
| `ROWS BETWEEN 1 FOLLOWING AND 3 FOLLOWING` | Next three rows, excluding current |
| `ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING` | Centered calculation |
| `ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING` | Remaining total from current row onward |
| `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` | Entire partition |

## Worked example with visible outputs

```sql
WITH sample(day_no, revenue) AS (
    VALUES (1, 10), (2, 20), (3, 30), (4, 40), (5, 50)
)
SELECT day_no, revenue,
       SUM(revenue) OVER (
           ORDER BY day_no
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_total,
       SUM(revenue) OVER (
           ORDER BY day_no
           ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
       ) AS trailing_3,
       SUM(revenue) OVER (
           ORDER BY day_no
           ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING
       ) AS forward_3,
       SUM(revenue) OVER (
           ORDER BY day_no
           ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
       ) AS centered_3
FROM sample
ORDER BY day_no;
```

| day_no | revenue | running_total | trailing_3 | forward_3 | centered_3 |
|---:|---:|---:|---:|---:|---:|
| 1 | 10 | 10 | 10 | 60 | 30 |
| 2 | 20 | 30 | 30 | 90 | 60 |
| 3 | 30 | 60 | 60 | 120 | 90 |
| 4 | 40 | 100 | 90 | 90 | 120 |
| 5 | 50 | 150 | 120 | 50 | 90 |

At row 4, a three-row forward frame contains only rows 4 and 5. Frames stop at partition boundaries; SQL does not invent missing rows.

`AVG` averages the available non-null inputs, not a fixed denominator of three. An empty frame gives null for `SUM`/`AVG` and zero for `COUNT`.

**Direction follows ORDER BY:** with `ORDER BY sale_date DESC`, preceding rows have later dates. `PRECEDING` does not inherently mean earlier in chronological time.
