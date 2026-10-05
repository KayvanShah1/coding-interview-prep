---
title: "Privileges & parameterized queries"
description: "Separate SQL values from SQL code and give database roles only the access they need."
chapter: "postgres"
order: 6
sequence: 1306
level: "Core"
references: [{"title":"PostgreSQL privileges","url":"https://www.postgresql.org/docs/current/ddl-priv.html"},{"title":"PostgreSQL PREPARE","url":"https://www.postgresql.org/docs/current/sql-prepare.html"}]
---

## Treat user input as a value

Do not construct a query by concatenating a submitted string into SQL text. Use the driver's parameter binding. Parameters represent values, not arbitrary table names or SQL clauses.

```sql
PREPARE customer_lookup(integer) AS
SELECT customer_id, name FROM customers WHERE customer_id = $1;
EXECUTE customer_lookup(1);
DEALLOCATE customer_lookup;
```

This server-side example illustrates the separation. Application placeholder syntax depends on the driver. Dynamic identifiers need an allowlist and the driver's identifier-quoting utilities; a value placeholder is not an identifier placeholder.

## Grant a role the appropriate scope

```sql
CREATE ROLE reporting_reader;
GRANT USAGE ON SCHEMA analytics TO reporting_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO reporting_reader;
```

This example requires an existing `analytics` schema and sufficient privileges. Existing tables and future tables are separate considerations: default privileges can define access for future objects created by a particular role.

## Interview check

Read-only application access should not require a superuser. Schema access, table access, and row-level policies answer different questions. A view can provide a narrower interface, but its security behavior must be designed intentionally rather than assumed from its name.

Prepared statements help prevent injection through bound values. They do not replace authorization checks, business validation, or safe treatment of dynamic SQL structure.
