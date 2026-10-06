---
title: "Interval overlaps"
description: "Detect overlapping ranges while avoiding self-pairs and mirrored duplicates."
chapter: "patterns"
order: 9
sequence: 709
level: "Core"
references: [{"title":"PostgreSQL range types","url":"https://www.postgresql.org/docs/current/rangetypes.html"}]
---

## Start with the boundary rule

Assume `bookings(booking_id, room_id, starts_at, ends_at)` uses valid, nonempty half-open intervals `[start, end)`.

Two intervals overlap when each starts before the other ends:

```sql
a.starts_at < b.ends_at
AND b.starts_at < a.ends_at
```

A booking ending exactly when another starts does **not** overlap under this half-open convention.

## Find overlapping bookings

```sql
SELECT a.booking_id AS booking_a,
       b.booking_id AS booking_b
FROM bookings a
JOIN bookings b
  ON a.room_id = b.room_id
 AND a.booking_id < b.booking_id
 AND a.starts_at < b.ends_at
 AND b.starts_at < a.ends_at;
```

The ID comparison removes self-matches and mirrored pairs such as `(1,2)` and `(2,1)`.

## Edge cases to decide explicitly

- Are endpoints inclusive or half-open?
- Can intervals be empty or invalid?
- Do null endpoints mean open-ended ranges or bad data?
- Must overlaps be checked within the same room, user, machine, or other partition?
- If timestamps tie, is there another ordering or identity rule?

PostgreSQL range types can express overlap directly with range operators, but the two-inequality form is portable and makes the boundary semantics visible.
