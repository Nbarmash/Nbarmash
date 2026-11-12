// Run with: node --test paint-quote/tests
const test = require('node:test');
const assert = require('node:assert');
const P = require('../pricing.js');

const settings = Object.assign({}, P.DEFAULT_SETTINGS, {
  laborRate: 50, markup: 20, minimumJob: 0, taxRate: 0, suppliesPct: 10,
  wallRate: 200, ceilingRate: 100, trimRate: 50, coverage: 400, setupHours: 0
});

test('wall area subtracts doors and windows', () => {
  const room = { length: 12, width: 12, height: 8, doors: 1, windows: 2, coats: 2,
    condition: 'good', surfaces: { walls: true } };
  const r = P.calcRoom(room, settings);
  // 2*(12+12)*8 = 384 - 20 - 30 = 334
  assert.strictEqual(r.wallArea, 334);
  // 334 * 2 coats / 200 = 3.34 hrs * $50
  assert.strictEqual(r.hours, 3.34);
  assert.strictEqual(r.laborCost, 167);
});

test('poor condition adds priming and slower labor', () => {
  const base = { length: 10, width: 10, height: 8, doors: 0, windows: 0, coats: 2, surfaces: { walls: true } };
  const good = P.calcRoom(Object.assign({}, base, { condition: 'good' }), settings);
  const poor = P.calcRoom(Object.assign({}, base, { condition: 'poor' }), settings);
  assert.ok(poor.hours > good.hours * 1.35);
  assert.ok(poor.lines.some(l => l.key === 'primer'));
  assert.ok(poor.gallons.primer > 0);
});

test('high ceilings cost more', () => {
  const base = { length: 12, width: 12, doors: 0, windows: 0, coats: 2, surfaces: { walls: true } };
  const low = P.calcRoom(Object.assign({}, base, { height: 8 }), settings);
  const high = P.calcRoom(Object.assign({}, base, { height: 10 }), settings);
  assert.ok(high.hours / high.wallArea > low.hours / low.wallArea);
});

test('job totals: markup, whole gallons, extras, discount, tax, deposit', () => {
  const job = {
    rooms: [{ length: 12, width: 12, height: 8, doors: 1, windows: 2, coats: 2,
      condition: 'good', surfaces: { walls: true } }],
    extras: [{ label: 'Drywall repair', price: 100 }],
    discount: 50
  };
  const q = P.calcJob(job, Object.assign({}, settings, { taxRate: 10, depositPct: 50 }));
  // labor 167 * 1.2 = 200.40
  assert.strictEqual(q.roomsTotal, 200.4);
  // 334*2/400 = 1.67 gal -> 2 gallons * $45 = 90, supplies 9 -> (99)*1.2 = 118.80
  assert.strictEqual(q.materials[0].qty, 2);
  assert.strictEqual(q.materialsTotal, 118.8);
  assert.strictEqual(q.subtotal, 419.2);
  assert.strictEqual(q.discount, 50);
  assert.strictEqual(q.tax, 36.92);
  assert.strictEqual(q.total, 406.12);
  assert.strictEqual(q.deposit, 203.06);
  assert.strictEqual(q.internal.cost, 266);
});

test('minimum job charge kicks in for tiny jobs', () => {
  const job = { rooms: [{ length: 5, width: 5, height: 8, doors: 0, windows: 0, coats: 1,
    condition: 'good', surfaces: { walls: true } }] };
  const q = P.calcJob(job, Object.assign({}, settings, { minimumJob: 500 }));
  assert.ok(q.minimumAdj > 0);
  assert.strictEqual(q.total, 500);
});

test('empty job is $0 and never NaN', () => {
  const q = P.calcJob({ rooms: [] }, settings);
  assert.strictEqual(q.total, 0);
  const q2 = P.calcJob({ rooms: [{ length: 'abc', width: '', surfaces: { walls: true } }] }, settings);
  assert.ok(Number.isFinite(q2.total));
});

test('new rooms from presets have sensible defaults', () => {
  const r = P.newRoom(P.ROOM_TYPES[0]);
  assert.strictEqual(r.name, 'Bedroom');
  assert.strictEqual(r.length, 12);
  assert.ok(P.calcJob({ rooms: [r] }, settings).total > 0);
});
