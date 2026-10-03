-- PostgreSQL practice fixture. Run in a fresh practice schema.
CREATE TABLE customers(customer_id integer PRIMARY KEY, name text NOT NULL, city text);
INSERT INTO customers VALUES (1,'Mira','Mumbai'),(2,'Arun','Pune'),(3,'Leena','Delhi');
CREATE TABLE orders(order_id integer PRIMARY KEY, customer_id integer, order_ts timestamp, amount numeric(12,2), status text);
INSERT INTO orders VALUES (101,1,'2026-01-01 10:00',100,'paid'),(102,1,'2026-01-02 10:00',200,'paid'),(103,2,'2026-01-03 10:00',50,'paid'),(104,2,'2026-01-04 10:00',70,'cancelled');
CREATE TABLE order_items(order_id integer,product_id integer,quantity integer,unit_price numeric(12,2));
INSERT INTO order_items VALUES(101,10,1,60),(101,20,2,20),(102,10,2,100);
CREATE TABLE payments(payment_id integer PRIMARY KEY,order_id integer,amount numeric(12,2));
INSERT INTO payments VALUES(1,101,40),(2,101,60),(3,102,200);
CREATE TABLE employees(employee_id integer PRIMARY KEY,department_id integer,manager_id integer,salary numeric(12,2));
INSERT INTO employees VALUES(1,10,NULL,120),(2,10,1,100),(3,10,1,100),(4,10,1,80),(5,20,NULL,90);
CREATE TABLE events(event_id integer PRIMARY KEY,user_id integer,event_ts timestamp,event_type text);
INSERT INTO events VALUES(1,1,'2026-01-01 10:00','view'),(2,1,'2026-01-01 10:10','cart'),(3,1,'2026-01-01 10:20','purchase'),(4,1,'2026-01-02 10:00','view'),(5,1,'2026-01-03 10:00','view'),(6,2,'2026-01-01 11:00','view'),(7,2,'2026-01-03 11:00','view');
CREATE TABLE daily_sales(sale_date date PRIMARY KEY,revenue numeric(12,2));
INSERT INTO daily_sales VALUES('2026-01-01',10),('2026-01-02',20),('2026-01-03',30),('2026-01-04',40),('2026-01-05',50);
CREATE TABLE products(product_id integer PRIMARY KEY,category text);
INSERT INTO products VALUES(10,'software'),(20,'books');
CREATE TABLE sf_events(user_id integer,record_date date);
INSERT INTO sf_events VALUES(1,'2026-01-10'),(1,'2026-01-10'),(1,'2026-01-11'),(1,'2026-01-12'),(2,'2026-01-10'),(2,'2026-01-12'),(2,'2026-01-13');
