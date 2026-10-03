---
title: "Relational databases & SQL commands"
description: "Understand relations, keys, and the jobs different SQL statements perform."
chapter: "foundations"
order: 3
sequence: 3
level: "Core"
references: [{"title":"PostgreSQL tutorial","url":"https://www.postgresql.org/docs/current/tutorial.html"}]
---

## Start with relationships

A relational database represents entities and their relationships in tables. A customer can have many orders; an order can have many line items. A row identifier distinguishes one record from another, while a foreign key connects records.

SQL is declarative: describe the result or change you want. The engine chooses physical operations to carry it out. A query that looks short can still scan a large amount of data.

| Concept | Example | Why it matters |
|---|---|---|
| Relation / table | `customers` | Defines a set of attributes and records |
| Attribute / column | `customer_id` | Has a declared type |
| Tuple / row | One customer | Must have a clear grain |
| Primary key | `customer_id` | Unique, non-null identity |
| Foreign key | `orders.customer_id` | Enforces a permitted relationship |

SQL query results can contain duplicates. Do not assume the mathematical set model automatically deduplicates every result. Row order is also unspecified until you request `ORDER BY`.

## Command families

| Family | Typical commands | Purpose |
|---|---|---|
| Data definition | `CREATE`, `ALTER`, `DROP` | Define database objects |
| Data manipulation | `INSERT`, `UPDATE`, `DELETE`, `MERGE` | Change rows |
| Querying | `SELECT` | Retrieve results; often called DQL in teaching material |
| Access control | `GRANT`, `REVOKE` | Control privileges |
| Transaction control | `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT` | Group work and handle failure |

These labels are a learning convention. Actual statement syntax and transactional behavior depend on the database.

## A small relationship

```sql
CREATE TABLE customers (
    customer_id integer PRIMARY KEY,
    name text NOT NULL
);
CREATE TABLE orders (
    order_id integer PRIMARY KEY,
    customer_id integer REFERENCES customers(customer_id),
    amount numeric(12,2) NOT NULL
);
```

The foreign key prevents an order from referencing a nonexistent customer. Because `customer_id` in orders is nullable here, it still permits an unassigned order. Add `NOT NULL` if every order must belong to a customer.

## Interview check

**Is a database the same as a schema?** In PostgreSQL, a server hosts databases; a database contains schemas, and a schema groups named objects. For example, `analytics.orders` means the `orders` object in the `analytics` schema of the current database.

**Does a primary key have to be one column?** No. A composite primary key can use several columns, such as `(order_id, line_number)`.
