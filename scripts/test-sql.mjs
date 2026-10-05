import fs from 'node:fs';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
await db.exec(fs.readFileSync('assets/sql/sample-data.sql', 'utf8'));
await db.exec(`
CREATE TABLE facebook_posts(post_id integer PRIMARY KEY,body text,post_date date,post_keywords text);
CREATE TABLE facebook_reactions(post_id integer,reaction text);
INSERT INTO facebook_posts VALUES(1,'one','2026-01-01','spam'),(2,'two','2026-01-01','news'),(3,'three','2026-01-01','news');
INSERT INTO facebook_reactions VALUES(1,'heart'),(1,'heart'),(2,'like'),(NULL,'heart');
CREATE TABLE facebook_post_views(post_id integer,viewer_id integer);
INSERT INTO facebook_post_views SELECT 1,generate_series(1,9);
INSERT INTO facebook_post_views VALUES(2,10);
CREATE TABLE olympics_athletes_events(id integer,games text,event text);
INSERT INTO olympics_athletes_events VALUES(1,'A','X'),(1,'A','Y'),(2,'A','X'),(3,'B','X'),(4,'B','X');
CREATE TABLE playbook_users(user_id integer PRIMARY KEY,language text);
CREATE TABLE playbook_events(user_id integer,device text);
INSERT INTO playbook_users VALUES(1,'English'),(2,'English'),(3,'English');
INSERT INTO playbook_events VALUES(1,'iphone 5s'),(1,'iphone 5s'),(1,'other'),(2,'other');
CREATE TABLE required_products(product_id text);
CREATE TABLE purchases(customer_id integer,product_id text);
INSERT INTO required_products VALUES('A'),('B');
INSERT INTO purchases VALUES(1,'A'),(1,'B'),(1,'B'),(2,'A');
CREATE TABLE campaign_purchases(user_id integer,purchase_date date,product_id text);
INSERT INTO campaign_purchases VALUES(1,'2026-01-01','A'),(1,'2026-01-01','B'),(1,'2026-01-02','B'),(2,'2026-01-01','A'),(2,'2026-01-02','C');
CREATE TABLE monthly_activity(user_id integer,month_start date);
INSERT INTO monthly_activity VALUES(1,'2026-01-01'),(2,'2026-01-01'),(1,'2026-02-01');
CREATE TABLE user_skills(user_id integer,skills text[]);
INSERT INTO user_skills VALUES(1,ARRAY['SQL','Python']),(2,ARRAY[]::text[]);
CREATE TABLE claims(claim_id integer,state text,fraud_score numeric);
INSERT INTO claims SELECT generate_series(1,21),'A',10;
CREATE TABLE country_month_comments(country text,month_start date,comment_count integer);
INSERT INTO country_month_comments VALUES('A','2019-12-01',10),('B','2019-12-01',20),('A','2020-01-01',30),('B','2020-01-01',20);
`);
function block(file, marker) {
  const text = fs.readFileSync('_sql/' + file + '.md', 'utf8');
  const blocks = [...text.matchAll(/```sql\n([\s\S]*?)```/g)].map((m) => m[1]);
  const found = blocks.find((b) => b.includes(marker));
  assert.ok(found, `block ${file} ${marker}`);
  return found;
}
const rows = async (file, marker) => (await db.query(block(file, marker))).rows;
let count = 0;
async function test(name, fn) {
  await fn();
  count++;
  console.log('PASS ' + name);
}
await test('Exact trailing and forward window output', async () => {
  const r = await rows('windows/frames', 'sample(day_no');
  assert.deepEqual(
    r.map((x) => [
      Number(x.running_total),
      Number(x.trailing_3),
      Number(x.forward_3),
      Number(x.centered_3),
    ]),
    [
      [10, 10, 60, 30],
      [30, 30, 90, 60],
      [60, 60, 120, 90],
      [100, 90, 90, 120],
      [150, 120, 50, 90],
    ],
  );
});
await test('RANGE includes peers', async () => {
  const r = await rows('windows/rows-range-groups', 'WITH t(id');
  assert.deepEqual(
    r.map((x) => Number(x.peer_total)),
    [20, 20, 40],
  );
});
await test('EXISTS does not duplicate posts', async () =>
  assert.equal(
    (await rows('subqueries/exists-in-all', 'FROM facebook_reactions r\n    WHERE r.post_id'))
      .length,
    1,
  ));
await test('NOT IN NULL is unknown', async () =>
  assert.equal((await db.query('SELECT 3 NOT IN (1,2,NULL) AS value')).rows[0].value, null));
await test('Left join includes zero matches', async () =>
  assert.equal(
    Number(
      (await rows('joins/join-types', 'COUNT(o.order_id)')).find((x) => x.customer_id === 3)
        .paid_orders,
    ),
    0,
  ));
await test('Preaggregate children prevents multiplication', async () => {
  const r = (await rows('joins/join-types', 'WITH item_totals')).find((x) => x.order_id === 101);
  assert.equal(Number(r.item_total), 100);
  assert.equal(Number(r.paid_total), 100);
});
await test('Gaps and islands with duplicate dates', async () =>
  assert.deepEqual(await rows('patterns/gaps-islands', 'activity_date - rn AS streak_key'), [
    { user_id: 1 },
  ]));
await test('LAG alternative gives same streak', async () =>
  assert.deepEqual(await rows('patterns/gaps-islands', 'AS two_dates_back'), [{ user_id: 1 }]));
await test('Largest Olympics includes ties', async () =>
  assert.equal((await rows('practice/largest-olympics', 'WITH participation')).length, 2));
await test('Apple user flags ignore repeated events', async () => {
  const r = (await rows('practice/apple-users', 'WITH user_flags'))[0];
  assert.equal(Number(r.apple_users), 1);
  assert.equal(Number(r.total_users), 2);
});
await test('Spam posts 50 percent', async () =>
  assert.equal(
    Number((await rows('practice/spam-posts', 'WITH viewed_posts'))[0].spam_post_percentage),
    50,
  ));
await test('Spam views 90 percent', async () =>
  assert.equal(
    Number((await rows('practice/spam-posts', 'AS spam_view_percentage'))[0].spam_view_percentage),
    90,
  ));
await test('New products exclude all first-day products', async () =>
  assert.equal(
    Number((await rows('practice/campaign-purchases', 'WITH first_days'))[0].qualifying_users),
    1,
  ));
await test('Retention keeps denominator', async () =>
  assert.equal(
    Number((await rows('practice/retention-joins', 'AS january_users'))[0].retention_pct),
    50,
  ));
await test('All-product match handles repeated purchases', async () =>
  assert.deepEqual(await rows('joins/set-operations', 'FROM required_products r'), [
    { customer_id: 1 },
  ]));
await test('Empty required set returns all customers', async () => {
  await db.exec('TRUNCATE required_products');
  assert.equal((await rows('joins/set-operations', 'FROM required_products r')).length, 3);
});
await test('Array expansion preserves ordinality', async () => {
  const r = await rows('postgres/arrays', 'WITH ORDINALITY');
  assert.deepEqual(
    r.map((x) => x.skill),
    ['SQL', 'Python'],
  );
  assert.deepEqual(
    r.map((x) => Number(x.position)),
    [1, 2],
  );
});
await test('Left lateral preserves empty array', async () =>
  assert.equal((await rows('postgres/arrays', 'LEFT JOIN LATERAL')).length, 3));
await test('JSON extraction and casting', async () => {
  const r = (await rows('postgres/jsonb', 'WITH payloads'))[0];
  assert.equal(r.user_id_text, '7');
  assert.equal(r.active, true);
});
await test('JSON array expansion', async () =>
  assert.deepEqual(
    (await rows('postgres/jsonb', 'WITH docs')).map((x) => x.tag),
    ['sql', 'data'],
  ));
await test('Recursive sequence terminates', async () =>
  assert.deepEqual(
    (await rows('subqueries/recursive-cte', 'numbers(n)')).map((x) => x.n),
    [1, 2, 3, 4, 5],
  ));
await test('Grouping sets includes grand total', async () =>
  assert.equal(
    Number(
      (await rows('aggregation/grouping-sets', 'WITH sales')).find((x) => x.grouping_mask === 3)
        .revenue,
    ),
    35,
  ));
await test('Percentile threshold includes all ties', async () =>
  assert.equal((await rows('practice/top-percent', 'WITH thresholds')).length, 21));
await test('Five percent quota rounds up', async () =>
  assert.equal((await rows('practice/top-percent', 'WITH ranked')).length, 2));
await test('Country improvement uses smaller rank', async () =>
  assert.equal((await rows('practice/rank-changes', 'WITH ranked'))[0].country, 'A'));
await test('NTILE may split peers', async () => {
  const r = await rows('windows/distribution', 'WITH scores');
  assert.deepEqual(
    r.map((x) => x.half),
    [1, 1, 2, 2],
  );
  assert.equal(r[1].cumulative_fraction, 0.75);
});
await test('Lateral latest two includes customer without orders', async () =>
  assert.equal((await rows('subqueries/lateral', 'LEFT JOIN LATERAL')).length, 5));
await test('Session boundaries', async () =>
  assert.equal((await rows('patterns/sessions', 'WITH previous')).length, 5));
await test('Ordered funnel', async () => {
  const r = (await rows('patterns/funnels', 'WITH viewed'))[0];
  assert.equal(Number(r.viewers), 2);
  assert.equal(Number(r.purchasing_users), 1);
});
await test('Sample dataset expected totals', async () => {
  const r = await rows('foundations/sample-data', 'SUM(amount)');
  assert.deepEqual(
    r.map((x) => [x.customer_id, Number(x.orders), Number(x.revenue)]),
    [
      [1, 2, 300],
      [2, 1, 50],
    ],
  );
});
await test('String transformation example', async () => {
  const r = (await rows('functions/strings', 'normalized_email'))[0];
  assert.equal(r.normalized_email, 'kayvan@example.com');
  assert.equal(r.domain, 'b.com');
});
await test('Exact numeric functions', async () => {
  const r = (await rows('functions/numeric-functions', 'AS rounded'))[0];
  assert.equal(Number(r.rounded), 12.35);
  assert.equal(r.remainder, 2);
});
await test('Null from empty preceding frame', async () => {
  const r = (
    await db.query(
      'SELECT SUM(x) OVER(ORDER BY x ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING) AS s FROM (VALUES(1)) t(x)',
    )
  ).rows[0];
  assert.equal(r.s, null);
});
await test('Continuous and discrete percentile outputs', async () => {
  const r = await rows('aggregation/percentiles', 'WITH requests');
  assert.deepEqual(
    r.map((x) => [x.service, Number(x.median_cont), Number(x.median_disc)]),
    [
      ['checkout', 5, 5],
      ['search', 25, 20],
    ],
  );
});
await test('Calendar completion precedes monthly LAG', async () => {
  const r = await rows('patterns/period-changes', 'WITH sales');
  assert.deepEqual(
    r.map((x) => [
      Number(x.revenue),
      x.previous_revenue === null ? null : Number(x.previous_revenue),
      x.pct_change === null ? null : Number(x.pct_change),
    ]),
    [
      [100, null, null],
      [0, 100, -100],
      [150, 0, null],
    ],
  );
});
await test('User conversion does not count repeated orders', async () => {
  const r = (await rows('patterns/rates-and-populations', 'WITH users'))[0];
  assert.equal(Number(r.eligible_users), 3);
  assert.equal(Number(r.purchasing_users), 1);
  assert.equal(Number(r.purchase_pct), 33.33);
});
await test('Overall rate is weighted by attempts', async () =>
  assert.equal(
    Number((await rows('patterns/rates-and-populations', 'WITH groups'))[0].overall_pct),
    10.87,
  ));
await test('Latest order filtering retains unpaid competitors', async () =>
  assert.deepEqual(await rows('practice/mixed-drills', 'WITH orders(order_id'), [
    { customer_id: 2 },
  ]));
await test('Relational division handles repeated purchases in mixed drill', async () =>
  assert.deepEqual(await rows('practice/mixed-drills', 'WITH customers(customer_id)'), [
    { customer_id: 1 },
  ]));
await test('Mixed drill empty required set keeps all customers', async () => {
  const query = block('practice/mixed-drills', 'WITH customers(customer_id)').replace(
    "required(product) AS (VALUES ('A'), ('B'))",
    "required(product) AS (SELECT 'A'::text WHERE false)",
  );
  assert.deepEqual((await db.query(query)).rows, [
    { customer_id: 1 },
    { customer_id: 2 },
    { customer_id: 3 },
  ]);
});
console.log(
  `${count} PostgreSQL result checks passed (PGlite). Concurrency behavior requires separate multi-session testing.`,
);
await db.close();
