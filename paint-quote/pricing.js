/*
 * PaintQuote pricing engine.
 * Pure functions only (no DOM) so it can be tested in Node and reused anywhere.
 */
(function (global) {
  'use strict';

  var DEFAULT_SETTINGS = {
    // Business info (shown on the quote)
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    website: '',
    logo: '',

    // Money
    laborRate: 55,        // $ per labor hour
    markup: 25,           // % added on top of labor + materials (overhead & profit)
    minimumJob: 450,      // smallest job you'll take, in $
    taxRate: 0,           // % sales tax applied to the total
    depositPct: 30,       // % deposit requested to book the job

    // Paint prices ($ per gallon, what YOU pay)
    wallPaintPrice: 45,
    ceilingPaintPrice: 35,
    trimPaintPrice: 55,
    primerPrice: 30,
    suppliesPct: 12,      // tape, plastic, caulk, patch: % of paint cost

    // Production rates (how fast you work, per coat)
    coverage: 350,        // sq ft one gallon covers
    wallRate: 175,        // sq ft of wall per hour
    ceilingRate: 140,     // sq ft of ceiling per hour
    trimRate: 50,         // linear ft of trim per hour
    doorHours: 0.75,      // hours per door (both sides, all coats)
    setupHours: 0.5,      // prep, protection & cleanup per room

    // Quote text
    validDays: 30,
    terms: 'Price includes all labor and materials listed. Furniture moving, ' +
      'masking and full cleanup included. Any additional work will be quoted ' +
      'before it starts. Balance due on completion.',
    nextNumber: 1001
  };

  var SIZES = {
    S: { label: 'Small', length: 10, width: 10 },
    M: { label: 'Medium', length: 12, width: 14 },
    L: { label: 'Large', length: 16, width: 20 }
  };

  var ROOM_TYPES = [
    { name: 'Bedroom', icon: '🛏️', size: 'M', doors: 2, windows: 2 },
    { name: 'Living Room', icon: '🛋️', size: 'L', doors: 1, windows: 3 },
    { name: 'Kitchen', icon: '🍳', size: 'M', doors: 1, windows: 1 },
    { name: 'Bathroom', icon: '🛁', size: 'S', doors: 1, windows: 1, length: 8, width: 6 },
    { name: 'Dining Room', icon: '🍽️', size: 'M', doors: 1, windows: 2 },
    { name: 'Hallway', icon: '🚪', size: 'custom', doors: 0, windows: 0, length: 15, width: 4 },
    { name: 'Office', icon: '💻', size: 'S', doors: 1, windows: 1 },
    { name: 'Other', icon: '➕', size: 'M', doors: 1, windows: 1 }
  ];

  var CONDITIONS = {
    good: { label: 'Good', labor: 1 },
    fair: { label: 'Fair', labor: 1.15 },
    poor: { label: 'Needs work', labor: 1.35, primer: true }
  };

  var DOOR_SQFT = 20;
  var WINDOW_SQFT = 15;
  var TRIM_LF_PER_GALLON = 300;
  var GALLONS_PER_DOOR = 0.25;

  function num(v, fallback) {
    var n = parseFloat(v);
    return isFinite(n) && n >= 0 ? n : (fallback || 0);
  }

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function heightFactor(h) {
    if (h >= 12) return 1.3;
    if (h >= 10) return 1.15;
    return 1;
  }

  function newRoom(type) {
    var t = type || ROOM_TYPES[0];
    var size = SIZES[t.size] || {};
    return {
      id: Math.random().toString(36).slice(2, 10),
      name: t.name,
      size: t.size,
      length: t.length || size.length || 12,
      width: t.width || size.width || 12,
      height: 8,
      doors: t.doors,
      windows: t.windows,
      coats: 2,
      condition: 'good',
      surfaces: { walls: true, ceiling: false, trim: true, doors: false }
    };
  }

  /** Measurements, labor hours and paint needed for one room (costs, no markup). */
  function calcRoom(room, settings) {
    var s = Object.assign({}, DEFAULT_SETTINGS, settings);
    var L = num(room.length), W = num(room.width), H = num(room.height, 8) || 8;
    var doors = Math.round(num(room.doors)), windows = Math.round(num(room.windows));
    var coats = Math.round(num(room.coats, 2)) || 2;
    var cond = CONDITIONS[room.condition] || CONDITIONS.good;
    var hf = heightFactor(H);
    var sf = room.surfaces || {};
    var rate = num(s.laborRate);
    var coverage = num(s.coverage, 350) || 350;

    var perimeter = 2 * (L + W);
    var wallArea = Math.max(0, perimeter * H - doors * DOOR_SQFT - windows * WINDOW_SQFT);
    var ceilingArea = L * W;
    var trimLF = Math.max(0, perimeter - doors * 3);
    var coatTxt = coats + (coats === 1 ? ' coat' : ' coats');

    var lines = [];
    var gallons = { wall: 0, ceiling: 0, trim: 0, primer: 0 };

    function add(key, label, detail, hours) {
      hours = round2(hours);
      lines.push({ key: key, label: label, detail: detail, hours: hours, laborCost: round2(hours * rate) });
    }

    if (sf.walls && wallArea > 0) {
      if (cond.primer) {
        add('primer', 'Patch, sand & prime walls', Math.round(wallArea) + ' sq ft',
          wallArea / (num(s.wallRate, 175) || 175) * hf);
        gallons.primer += wallArea / coverage;
      }
      add('walls', 'Walls', Math.round(wallArea) + ' sq ft · ' + coatTxt,
        wallArea * coats / (num(s.wallRate, 175) || 175) * cond.labor * hf);
      gallons.wall += wallArea * coats / coverage;
    }
    if (sf.ceiling && ceilingArea > 0) {
      add('ceiling', 'Ceiling', Math.round(ceilingArea) + ' sq ft · ' + coatTxt,
        ceilingArea * coats / (num(s.ceilingRate, 140) || 140) * cond.labor * hf);
      gallons.ceiling += ceilingArea * coats / coverage;
    }
    if (sf.trim && trimLF > 0) {
      add('trim', 'Trim & baseboards', Math.round(trimLF) + ' linear ft · ' + coatTxt,
        trimLF * coats / (num(s.trimRate, 50) || 50) * cond.labor);
      gallons.trim += trimLF * coats / TRIM_LF_PER_GALLON;
    }
    if (sf.doors && doors > 0) {
      add('doors', 'Doors & frames', doors + (doors === 1 ? ' door' : ' doors') + ' · both sides',
        doors * num(s.doorHours, 0.75) * cond.labor);
      gallons.trim += doors * GALLONS_PER_DOOR;
    }
    if (lines.length && num(s.setupHours) > 0) {
      add('prep', 'Prep, protection & cleanup', 'Move furniture, mask, drop cloths', num(s.setupHours));
    }

    var hours = 0, laborCost = 0;
    lines.forEach(function (l) { hours += l.hours; laborCost += l.laborCost; });

    return {
      length: L, width: W, height: H,
      wallArea: round2(wallArea), ceilingArea: round2(ceilingArea), trimLF: round2(trimLF),
      lines: lines, gallons: gallons,
      hours: round2(hours), laborCost: round2(laborCost)
    };
  }

  /** Full itemized quote for a job. */
  function calcJob(job, settings) {
    var s = Object.assign({}, DEFAULT_SETTINGS, settings);
    var mk = 1 + num(s.markup) / 100;

    var totalGallons = { wall: 0, ceiling: 0, trim: 0, primer: 0 };
    var rooms = (job.rooms || []).map(function (room) {
      var c = calcRoom(room, s);
      Object.keys(totalGallons).forEach(function (k) { totalGallons[k] += c.gallons[k]; });
      var lines = c.lines.map(function (l) { return Object.assign({}, l, { price: round2(l.laborCost * mk) }); });
      var price = 0;
      lines.forEach(function (l) { price += l.price; });
      return Object.assign({}, c, { id: room.id, name: room.name || 'Room', lines: lines, price: round2(price) });
    });

    var products = [
      ['wall', 'Wall paint', s.wallPaintPrice],
      ['ceiling', 'Ceiling paint', s.ceilingPaintPrice],
      ['trim', 'Trim & door paint (semi-gloss)', s.trimPaintPrice],
      ['primer', 'Primer', s.primerPrice]
    ];
    var materials = [];
    var paintCost = 0;
    products.forEach(function (p) {
      var g = totalGallons[p[0]];
      if (g <= 0) return;
      var qty = Math.max(1, Math.ceil(g - 0.05)); // tiny overages don't force an extra can
      var cost = round2(qty * num(p[2]));
      paintCost += cost;
      materials.push({ key: p[0], label: p[1], detail: qty + (qty === 1 ? ' gallon' : ' gallons'),
        qty: qty, cost: cost, price: round2(cost * mk) });
    });
    if (paintCost > 0 && num(s.suppliesPct) > 0) {
      var supCost = round2(paintCost * num(s.suppliesPct) / 100);
      materials.push({ key: 'supplies', label: 'Supplies', detail: 'Tape, plastic, caulk, patch, rollers',
        qty: 1, cost: supCost, price: round2(supCost * mk) });
    }

    var extras = (job.extras || []).filter(function (e) { return e && (e.label || num(e.price)); })
      .map(function (e) { return { label: e.label || 'Additional work', price: round2(num(e.price)) }; });

    var sum = function (arr, key) { return round2(arr.reduce(function (a, x) { return a + x[key]; }, 0)); };
    var roomsTotal = sum(rooms, 'price');
    var materialsTotal = sum(materials, 'price');
    var extrasTotal = sum(extras, 'price');
    var subtotal = round2(roomsTotal + materialsTotal + extrasTotal);
    var discount = Math.min(round2(num(job.discount)), subtotal);
    var afterDiscount = round2(subtotal - discount);
    var minimumAdj = 0;
    if (afterDiscount > 0 && afterDiscount < num(s.minimumJob)) {
      minimumAdj = round2(num(s.minimumJob) - afterDiscount);
    }
    var taxable = round2(afterDiscount + minimumAdj);
    var tax = round2(taxable * num(s.taxRate) / 100);
    var total = round2(taxable + tax);
    var deposit = round2(total * num(s.depositPct) / 100);

    var hours = sum(rooms, 'hours');
    var laborCost = sum(rooms, 'laborCost');
    var materialCost = sum(materials, 'cost');
    var cost = round2(laborCost + materialCost);
    var revenue = round2(total - tax);
    var profit = round2(revenue - cost);

    return {
      rooms: rooms,
      materials: materials,
      extras: extras,
      roomsTotal: roomsTotal,
      materialsTotal: materialsTotal,
      extrasTotal: extrasTotal,
      subtotal: subtotal,
      discount: discount,
      minimumAdj: minimumAdj,
      tax: tax,
      total: total,
      deposit: deposit,
      internal: {
        hours: hours,
        crewDays: round2(hours / 8),
        laborCost: laborCost,
        materialCost: materialCost,
        cost: cost,
        profit: profit,
        margin: revenue > 0 ? round2(profit / revenue * 100) : 0,
        gallons: totalGallons
      }
    };
  }

  var api = {
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    SIZES: SIZES,
    ROOM_TYPES: ROOM_TYPES,
    CONDITIONS: CONDITIONS,
    newRoom: newRoom,
    calcRoom: calcRoom,
    calcJob: calcJob,
    round2: round2
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.Pricing = api;
})(typeof window !== 'undefined' ? window : this);
