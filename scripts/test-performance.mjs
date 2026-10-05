import fs from 'node:fs';
import assert from 'node:assert/strict';
import pg from 'pg';

assert.ok(process.env.DATABASE_URL, 'Set DATABASE_URL to a disposable PostgreSQL database.');
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
const plans = {};
const nodes = (p) => [p, ...(p.Plans || []).flatMap(nodes)];
const explain = async (name, sql) => {
  const result = await db.query('EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' + sql);
  plans[name] = result.rows[0]['QUERY PLAN'][0];
  return plans[name].Plan;
};
await db.connect();
try {
  // Rollback keeps the runner repeatable without dropping any existing schema.
  await db.query('BEGIN');
  await db.query(fs.readFileSync('app/assets/sql/performance-lab.sql', 'utf8'));
  const lookup = `SELECT order_id, order_ts, amount FROM coretrail_lab.orders
    WHERE customer_id = 42 ORDER BY order_ts DESC, order_id DESC LIMIT 20`;
  const baseline = (await db.query(lookup)).rows;
  assert.equal(baseline.length, 20);
  assert.equal(baseline[0].order_id, '118041');
  assert.equal(baseline.at(-1).order_id, '80041');
  await explain('lookup-before', lookup);
  await db.query(`CREATE INDEX orders_customer_recent_idx
    ON coretrail_lab.orders(customer_id, order_ts DESC, order_id DESC) INCLUDE(amount)`);
  await db.query('ANALYZE coretrail_lab.orders');
  assert.deepEqual((await db.query(lookup)).rows, baseline);
  const indexed = nodes(await explain('lookup-after', lookup));
  assert.ok(
    indexed.some((n) => n['Index Name'] === 'orders_customer_recent_idx'),
    'Customer access path used',
  );
  assert.ok(!indexed.some((n) => /Sort/.test(n['Node Type'])), 'Index supplies order');
  console.log('PASS customer lookup: 20 identical rows, candidate index used, no separate sort');

  await db.query('CREATE INDEX orders_time_idx ON coretrail_lab.orders(order_ts)');
  const cast = `SELECT COUNT(*) FROM coretrail_lab.orders WHERE order_ts::date = DATE '2026-01-10'`;
  const range = `SELECT COUNT(*) FROM coretrail_lab.orders WHERE order_ts >= TIMESTAMP '2026-01-10' AND order_ts < TIMESTAMP '2026-01-11'`;
  assert.equal((await db.query(cast)).rows[0].count, '1440');
  assert.deepEqual((await db.query(range)).rows, (await db.query(cast)).rows);
  await explain('date-cast', cast);
  const ranged = nodes(await explain('date-range', range));
  assert.ok(
    ranged.some((n) => n['Index Cond']?.includes('order_ts')),
    'Range reaches index condition',
  );
  console.log('PASS date rewrite: equal 1440-row populations, timestamp index condition');

  const jan = `SELECT COUNT(*) FROM coretrail_lab.events WHERE event_date >= DATE '2026-01-01' AND event_date < DATE '2026-02-01'`;
  const asset = `SELECT COUNT(*) FROM coretrail_lab.events WHERE asset_id = 42`;
  assert.equal((await db.query(jan)).rows[0].count, '31000');
  assert.equal((await db.query(asset)).rows[0].count, '900');
  const relations = (p) =>
    [
      ...new Set(
        nodes(p)
          .map((n) => n['Relation Name'])
          .filter(Boolean),
      ),
    ].sort();
  assert.deepEqual(relations(await explain('january-pruning', jan)), ['events_jan']);
  assert.deepEqual(relations(await explain('asset-all-months', asset)), [
    'events_feb',
    'events_jan',
    'events_mar',
  ]);
  console.log('PASS partition pruning: January accesses one child; asset-only accesses all three');
  const version = (await db.query('SHOW server_version')).rows[0].server_version;
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync(
    'test-results/performance-plans.json',
    JSON.stringify(
      { version, note: 'Single-session fixture observations; no universal latency claims.', plans },
      null,
      2,
    ),
  );
} finally {
  await db.query('ROLLBACK');
  await db.end();
}
