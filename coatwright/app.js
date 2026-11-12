/* Coatwright UI — plain JavaScript, no build step. */
(function () {
  'use strict';

  var P = window.Pricing;
  var app = document.getElementById('app');

  // ---------- Storage ----------
  function load(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { toast('Could not save — storage is full or blocked'); return false; }
  }

  var settings = Object.assign({}, P.DEFAULT_SETTINGS, load('pq.settings', {}));
  var jobs = load('pq.jobs', []);

  function saveSettings() { save('pq.settings', settings); }
  function saveJobs() { save('pq.jobs', jobs); }
  function findJob(id) { return jobs.find(function (j) { return j.id === id; }); }

  // ---------- Helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) {
    return '$' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function money0(n) {
    return '$' + Math.round(Number(n) || 0).toLocaleString('en-US');
  }
  function fmtDate(ts) {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  // Read/write nested values like "rooms.0.length"
  function getPath(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }
  function setPath(obj, path, value) {
    var keys = path.split('.');
    var last = keys.pop();
    var target = keys.reduce(function (o, k) { return o[k]; }, obj);
    target[last] = value;
  }

  function newJob(jobType, propertyType) {
    var job = {
      id: uid(),
      number: 'Q-' + settings.nextNumber,
      jobType: jobType,
      propertyType: propertyType,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      customer: { name: '', phone: '', email: '', address: '' },
      rooms: [],
      quick: P.newQuick((P.findProperty(jobType, propertyType) || {}).height),
      extras: [],
      discount: 0,
      notes: ''
    };
    settings.nextNumber = (Number(settings.nextNumber) || 1000) + 1;
    saveSettings();
    jobs.unshift(job);
    saveJobs();
    return job;
  }

  // ---------- Router ----------
  function route() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var view = parts[0] || 'home';
    var id = parts[1];
    var job = id ? findJob(id) : null;
    document.body.dataset.view = view;
    if ((view === 'job' || view === 'quote') && !job) { location.hash = '#/'; return; }
    if (view === 'job') renderJob(job);
    else if (view === 'quote') renderQuote(job);
    else if (view === 'new') renderNewJob(P.JOB_TYPES[id] ? id : null);
    else if (view === 'settings') renderSettings();
    else renderHome();
  }
  window.addEventListener('hashchange', function () { route(); window.scrollTo(0, 0); });

  // ---------- Home ----------
  function renderHome() {
    var needsSetup = !settings.businessName;
    var list = jobs.map(function (j) {
      var q = P.calcJob(j, settings);
      return '<a class="job-card" href="#/job/' + j.id + '">' +
        '<div><strong>' + esc(j.customer.name || 'New customer') + '</strong>' +
        '<div class="muted small">' + esc(j.customer.address || j.number) + ' · ' + fmtDate(j.updatedAt) + '</div>' +
        (P.propertyLabel(j) ? '<div class="tag">' + esc(P.propertyLabel(j)) + '</div>' : '') + '</div>' +
        '<div class="job-total">' + money0(q.total) + '</div></a>';
    }).join('');

    app.innerHTML =
      (needsSetup ? '<a class="setup-banner" href="#/settings"><span>👋</span><div><strong>Start here: add your business info</strong>' +
        '<div class="small">Your name, logo and rates go on every quote. Takes 1 minute.</div></div><span>›</span></a>' : '') +
      '<button class="btn btn-primary btn-xl" data-action="new-job">＋ New Quote</button>' +
      '<h2 class="section-title">Your quotes</h2>' +
      (list || '<div class="empty"><div class="empty-icon">🎨</div><p>No quotes yet.</p>' +
        '<p class="muted small">Tap <b>New Quote</b>, add rooms and send the customer a professional, itemized price in minutes.</p></div>');
  }

  // ---------- New quote: pick job type, then property ----------
  function renderNewJob(type) {
    if (!type) {
      app.innerHTML =
        '<div class="page-head"><a href="#/" class="back">‹ Quotes</a><span class="muted small">Step 1 of 2</span></div>' +
        '<h1 class="ask">What kind of job is it?</h1>' +
        '<div class="pick-list">' + Object.keys(P.JOB_TYPES).map(function (k) {
          var t = P.JOB_TYPES[k];
          return '<a class="pick big" href="#/new/' + k + '"><span class="pick-icon">' + t.icon + '</span>' +
            '<span><strong>' + t.label + '</strong><span class="muted small">' + t.desc + '</span></span><span class="chev">›</span></a>';
        }).join('') + '</div>';
      return;
    }
    var t = P.JOB_TYPES[type];
    app.innerHTML =
      '<div class="page-head"><a href="#/new" class="back">‹ Back</a><span class="muted small">Step 2 of 2</span></div>' +
      '<div class="tag">' + t.icon + ' ' + t.label + '</div>' +
      '<h1 class="ask">What type of property?</h1>' +
      '<div class="pick-list' + (t.properties.length > 6 ? ' grid' : '') + '">' + t.properties.map(function (p) {
        return '<button type="button" class="pick" data-action="create-job" data-type="' + type + '" data-prop="' + p.id + '">' +
          '<span class="pick-icon">' + p.icon + '</span><span><strong>' + p.label + '</strong><span class="muted small">' + p.desc + '</span></span>' +
          '<span class="chev">›</span></button>';
      }).join('') + '</div>';
  }

  function propertyPicker(job) {
    var type = P.JOB_TYPES[job.jobType] ? job.jobType : 'residential';
    return '<div class="label">Job type</div>' +
      '<div class="segmented">' + Object.keys(P.JOB_TYPES).map(function (k) {
        return '<button type="button" class="' + (k === job.jobType ? 'on' : '') + '" data-action="jobtype" data-v="' + k + '">' +
          P.JOB_TYPES[k].icon + ' ' + P.JOB_TYPES[k].label + '</button>';
      }).join('') + '</div>' +
      '<div class="chips prop-chips">' + P.JOB_TYPES[type].properties.map(function (p) {
        return '<button type="button" class="chip' + (p.id === job.propertyType ? ' on' : '') + '" data-action="prop" data-v="' + p.id + '">' +
          p.icon + ' ' + p.label + '</button>';
      }).join('') + '</div>';
  }

  // ---------- Job editor ----------
  function sizeChips(room, i) {
    var keys = ['S', 'M', 'L', 'custom'];
    return '<div class="chips" role="group" aria-label="Room size">' + keys.map(function (k) {
      var label = k === 'custom' ? 'Exact' : P.SIZES[k].label;
      var sub = k === 'custom' ? 'measure' : P.SIZES[k].length + '×' + P.SIZES[k].width;
      return '<button type="button" class="chip' + (room.size === k ? ' on' : '') + '" data-action="size" data-i="' + i + '" data-v="' + k + '">' +
        label + '<span>' + sub + '</span></button>';
    }).join('') + '</div>';
  }

  function surfaceChips(room, i) {
    var opts = [['walls', 'Walls'], ['ceiling', 'Ceiling'], ['trim', 'Trim'], ['doors', 'Doors']];
    return '<div class="chips" role="group" aria-label="What to paint">' + opts.map(function (o) {
      var on = room.surfaces[o[0]];
      return '<button type="button" class="chip toggle' + (on ? ' on' : '') + '" aria-pressed="' + !!on + '" data-action="surface" data-i="' + i + '" data-v="' + o[0] + '">' +
        (on ? '✓ ' : '') + o[1] + '</button>';
    }).join('') + '</div>';
  }

  function segmented(i, field, current, options) {
    return '<div class="segmented">' + options.map(function (o) {
      return '<button type="button" class="' + (String(current) === String(o[0]) ? 'on' : '') + '" data-action="seg" data-i="' + i +
        '" data-field="' + field + '" data-v="' + o[0] + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  }

  function stepper(i, field, value, label) {
    return '<div class="stepper"><span class="stepper-label">' + label + '</span>' +
      '<button type="button" data-action="step" data-i="' + i + '" data-field="' + field + '" data-d="-1" aria-label="Fewer ' + label + '">−</button>' +
      '<output data-out="rooms.' + i + '.' + field + '">' + value + '</output>' +
      '<button type="button" data-action="step" data-i="' + i + '" data-field="' + field + '" data-d="1" aria-label="More ' + label + '">＋</button></div>';
  }

  function numField(path, value, label, unit) {
    return '<label class="field num"><span>' + label + '</span><div class="with-unit">' +
      '<input type="number" inputmode="decimal" min="0" step="any" data-field="' + path + '" value="' + esc(value) + '">' +
      (unit ? '<em>' + unit + '</em>' : '') + '</div></label>';
  }

  function roomCard(room, i, calc) {
    var c = calc.rooms[i];
    return '<section class="card room-card" data-room="' + i + '">' +
      '<div class="room-head"><input class="room-name" data-field="rooms.' + i + '.name" value="' + esc(room.name) + '" aria-label="Room name">' +
      '<div class="room-price" data-out="room-price-' + i + '">' + money0(c.price) + '</div></div>' +
      '<div class="label">Size</div>' + sizeChips(room, i) +
      '<div class="dims' + (room.size === 'custom' ? '' : ' compact') + '">' +
      numField('rooms.' + i + '.length', room.length, 'Length', 'ft') +
      numField('rooms.' + i + '.width', room.width, 'Width', 'ft') +
      numField('rooms.' + i + '.height', room.height, 'Ceiling height', 'ft') + '</div>' +
      '<div class="label">What are we painting?</div>' + surfaceChips(room, i) +
      '<div class="row2">' + stepper(i, 'doors', room.doors, 'Doors') + stepper(i, 'windows', room.windows, 'Windows') + '</div>' +
      '<div class="row2"><div><div class="label">Coats</div>' + segmented(i, 'coats', room.coats, [[1, '1'], [2, '2'], [3, '3']]) + '</div>' +
      '<div><div class="label">Wall condition</div>' + segmented(i, 'condition', room.condition, [['good', 'Good'], ['fair', 'Fair'], ['poor', 'Rough']]) + '</div></div>' +
      '<div class="room-foot"><span class="muted small" data-out="room-meta-' + i + '">' + roomMeta(c) + '</span>' +
      '<span><button type="button" class="link" data-action="dup-room" data-i="' + i + '">Copy</button>' +
      '<button type="button" class="link danger" data-action="del-room" data-i="' + i + '">Remove</button></span></div>' +
      '</section>';
  }

  function roomMeta(c) {
    return Math.round(c.wallArea).toLocaleString('en-US') + ' sq ft walls · ' + Math.round(c.hours * 10) / 10 + ' hrs';
  }

  // Quick estimate: whole home/space from total square footage
  function quickCard(job, calc) {
    var q = job.quick, c = calc.rooms[0];
    var commercial = job.jobType === 'commercial';
    var opts = [['walls', 'Walls'], ['ceiling', 'Ceiling'], ['trim', 'Trim'], ['doors', 'Doors']];
    var qseg = function (field, current, options) {
      return '<div class="segmented">' + options.map(function (o) {
        return '<button type="button" class="' + (String(current) === String(o[0]) ? 'on' : '') + '" data-action="q-seg" data-field="' + field +
          '" data-v="' + o[0] + '">' + o[1] + '</button>';
      }).join('') + '</div>';
    };
    return '<section class="card room-card">' +
      '<div class="room-head"><strong class="room-name">' + (commercial ? 'Whole space' : 'Whole home') + '</strong>' +
      '<div class="room-price" data-out="room-price-0">' + money0(c.price) + '</div></div>' +
      '<label class="field sqft"><span>Total square footage ' + (commercial ? 'of the space' : 'of the home') + '</span>' +
      '<div class="with-unit"><input type="number" inputmode="numeric" min="0" step="1" data-field="quick.sqft" value="' + esc(q.sqft) +
      '" placeholder="e.g. 2000"><em>sq ft</em></div><small class="muted">Check Zillow, the listing or ask the customer.</small></label>' +
      '<div class="label">Ceiling height' + (commercial ? ' (ft)' : '') + '</div>' + qseg('height', q.height, commercial
        ? [[9, '9'], [10, '10'], [12, '12'], [16, '16'], [20, '20+']]
        : [[8, '8 ft'], [9, '9 ft'], [10, '10 ft'], [12, '12+ ft']]) +
      '<div class="label">What are we painting?</div><div class="chips">' + opts.map(function (o) {
        var on = q.surfaces[o[0]];
        return '<button type="button" class="chip toggle' + (on ? ' on' : '') + '" aria-pressed="' + !!on + '" data-action="q-surface" data-v="' + o[0] + '">' +
          (on ? '✓ ' : '') + o[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="row2"><div><div class="label">Coats</div>' + qseg('coats', q.coats, [[1, '1'], [2, '2'], [3, '3']]) + '</div>' +
      '<div><div class="label">Wall condition</div>' + qseg('condition', q.condition, [['good', 'Good'], ['fair', 'Fair'], ['poor', 'Rough']]) + '</div></div>' +
      '<div class="room-foot"><span class="muted small" data-out="room-meta-0">' + roomMeta(c) + '</span></div>' +
      '<p class="hint">💡 Ballpark price. Switch to <b>Room by room</b> after a walkthrough for an exact quote.</p>' +
      '</section>';
  }

  function renderJob(job) {
    if (!job.quick) job.quick = P.newQuick();
    var quick = job.mode === 'quick';
    var calc = P.calcJob(job, settings);
    var cu = job.customer;
    var commercial = job.jobType === 'commercial';
    var roomTypes = P.roomTypesFor(job.jobType, job.propertyType);
    var typeBtn = function (t, k) {
      return '<button type="button" data-action="add-room" data-k="' + k + '"><span>' + t.icon + '</span>' + esc(t.name) + '</button>';
    };
    var moreTypes = roomTypes.map(typeBtn).filter(function (_, k) { return roomTypes[k].more; });
    app.innerHTML =
      '<div class="page-head"><a href="#/" class="back">‹ Quotes</a><span class="muted">' + esc(job.number) + '</span></div>' +

      '<section class="card"><h2 class="card-title"><span class="step">1</span> Customer</h2>' +
      '<label class="field"><span>' + (commercial ? 'Business / contact name' : 'Name') + '</span><input data-field="customer.name" value="' + esc(cu.name) +
      '" placeholder="' + (commercial ? 'Acme Dental — Dr. Lee' : 'Jane Smith') + '" autocomplete="off"></label>' +
      '<label class="field"><span>Address</span><input data-field="customer.address" value="' + esc(cu.address) + '" placeholder="123 Main St" autocomplete="off"></label>' +
      '<div class="row2"><label class="field"><span>Phone</span><input type="tel" data-field="customer.phone" value="' + esc(cu.phone) + '" placeholder="(555) 555-5555"></label>' +
      '<label class="field"><span>Email</span><input type="email" data-field="customer.email" value="' + esc(cu.email) + '" placeholder="jane@email.com" autocapitalize="off"></label></div>' +
      propertyPicker(job) +
      '</section>' +

      '<h2 class="section-title"><span class="step">2</span> ' + (quick ? 'Size of the job' : 'Rooms') + '</h2>' +
      '<div class="segmented mode-switch">' +
      '<button type="button" class="' + (quick ? 'on' : '') + '" data-action="mode" data-v="quick">⚡ Quick (by sq ft)</button>' +
      '<button type="button" class="' + (quick ? '' : 'on') + '" data-action="mode" data-v="rooms">📐 Room by room</button></div>' +
      (quick ? quickCard(job, calc) :
        job.rooms.map(function (r, i) { return roomCard(r, i, calc); }).join('') +
        '<section class="card add-room"><div class="label">' + (job.rooms.length ? 'Add another room' : 'Tap a room to add it') + '</div>' +
        '<div class="room-types">' + roomTypes.map(typeBtn).filter(function (_, k) { return !roomTypes[k].more; }).join('') + '</div>' +
        (moreTypes.length ? '<details class="more-types"><summary>More area types (' + moreTypes.length + ')</summary>' +
          '<div class="room-types">' + moreTypes.join('') + '</div></details>' : '') +
        '</section>') +

      '<details class="card"' + (job.extras.length || job.discount || job.notes ? ' open' : '') + '><summary class="card-title"><span class="step">3</span> Extras, discount & notes <em class="muted small">(optional)</em></summary>' +
      job.extras.map(function (e, i) {
        return '<div class="extra-row"><input data-field="extras.' + i + '.label" value="' + esc(e.label) + '" placeholder="e.g. Drywall repair" aria-label="Extra item">' +
          '<div class="with-unit pre"><em>$</em><input type="number" inputmode="decimal" min="0" data-field="extras.' + i + '.price" value="' + esc(e.price) + '" aria-label="Price"></div>' +
          '<button type="button" class="icon-btn" data-action="del-extra" data-i="' + i + '" aria-label="Remove">✕</button></div>';
      }).join('') +
      '<button type="button" class="btn btn-ghost" data-action="add-extra">＋ Add extra item</button>' +
      '<div class="row2"><label class="field"><span>Discount</span><div class="with-unit pre"><em>$</em><input type="number" inputmode="decimal" min="0" data-field="discount" value="' + esc(job.discount || '') + '" placeholder="0"></div></label></div>' +
      '<label class="field"><span>Notes for customer</span><textarea data-field="notes" rows="3" placeholder="Colors, start date, anything special…">' + esc(job.notes) + '</textarea></label>' +
      '</details>' +

      '<button type="button" class="link danger center" data-action="del-job">Delete this quote</button>' +

      '<div class="totalbar"><div><div class="muted small">Total</div><div class="big" data-out="total">' + money(calc.total) + '</div></div>' +
      '<a class="btn btn-primary" href="#/quote/' + job.id + '">Review & Send ›</a></div>';
  }

  // Update just the numbers (keeps keyboard focus while typing)
  function refreshTotals(job) {
    var calc = P.calcJob(job, settings);
    calc.rooms.forEach(function (c, i) {
      var p = app.querySelector('[data-out="room-price-' + i + '"]');
      if (p) p.textContent = money0(c.price);
      var m = app.querySelector('[data-out="room-meta-' + i + '"]');
      if (m) m.textContent = roomMeta(c);
    });
    var t = app.querySelector('[data-out="total"]');
    if (t) t.textContent = money(calc.total);
  }

  function currentJob() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    return parts[0] === 'job' ? findJob(parts[1]) : null;
  }

  function touch(job) { job.updatedAt = Date.now(); saveJobs(); }

  // ---------- Quote view ----------
  var QUICK_NOTE = 'This is a ballpark estimate based on the total square footage. ' +
    'The final price will be confirmed after a walkthrough.';

  function lineRow(label, detail, amount, cls) {
    return '<tr class="' + (cls || '') + '"><td>' + esc(label) + (detail ? '<div class="muted small">' + esc(detail) + '</div>' : '') + '</td>' +
      '<td class="amt">' + amount + '</td></tr>';
  }

  function quoteDocument(job, q) {
    var s = settings, cu = job.customer;
    var valid = new Date(job.updatedAt + (Number(s.validDays) || 30) * 864e5);
    var rows = '';
    q.rooms.forEach(function (r) {
      if (!r.lines.length) return;
      rows += '<tr class="group"><td colspan="2">' + esc(r.name) + '<span class="muted small"> · ' +
        esc(r.summary) + '</span></td></tr>';
      r.lines.forEach(function (l) { rows += lineRow(l.label, l.detail, money(l.price)); });
    });
    if (q.materials.length) {
      rows += '<tr class="group"><td colspan="2">Paint & materials</td></tr>';
      q.materials.forEach(function (m) { rows += lineRow(m.label, m.detail, money(m.price)); });
    }
    if (q.extras.length) {
      rows += '<tr class="group"><td colspan="2">Additional work</td></tr>';
      q.extras.forEach(function (e) { rows += lineRow(e.label, '', money(e.price)); });
    }

    var totals = lineRow('Subtotal', '', money(q.subtotal), 'sub');
    if (q.discount) totals += lineRow('Discount', '', '−' + money(q.discount), 'sub');
    if (q.minimumAdj) totals += lineRow('Minimum job charge', '', money(q.minimumAdj), 'sub');
    if (q.tax) totals += lineRow('Tax (' + s.taxRate + '%)', '', money(q.tax), 'sub');
    totals += lineRow('Total', '', money(q.total), 'grand');
    if (q.deposit) totals += lineRow('Deposit to book (' + s.depositPct + '%)', '', money(q.deposit), 'sub');

    var biz = [s.ownerName, s.phone, s.email, s.website].filter(Boolean).map(esc).join('<br>');

    return '<article class="quote-doc">' +
      '<header class="doc-head"><div class="doc-biz">' +
      (s.logo ? '<img src="' + esc(s.logo) + '" alt="" class="logo">' : '') +
      '<div><div class="doc-bizname">' + esc(s.businessName || 'Your Painting Co.') + '</div><div class="muted small">' + biz + '</div></div></div>' +
      '<div class="doc-meta"><div class="doc-title">ESTIMATE</div><div>' + esc(job.number) + '</div>' +
      '<div class="muted small">' + fmtDate(job.updatedAt) + '<br>Valid until ' + fmtDate(valid) + '</div></div></header>' +
      '<div class="doc-to"><div><div class="label">Prepared for</div><strong>' + esc(cu.name || '—') + '</strong>' +
      '<div class="muted small">' + [cu.address, cu.phone, cu.email].filter(Boolean).map(esc).join('<br>') + '</div></div>' +
      (P.propertyLabel(job) ? '<div><div class="label">Property</div><strong>' + esc(P.propertyLabel(job)) + '</strong></div>' : '') + '</div>' +
      '<table class="lines"><tbody>' + (rows || '<tr><td class="muted">Add rooms to build the estimate.</td><td></td></tr>') + '</tbody>' +
      '<tfoot>' + totals + '</tfoot></table>' +
      (q.quick ? '<div class="doc-notes"><b>' + esc(QUICK_NOTE) + '</b></div>' : '') +
      (job.notes ? '<div class="doc-notes"><div class="label">Notes</div>' + esc(job.notes).replace(/\n/g, '<br>') + '</div>' : '') +
      (s.terms ? '<div class="doc-terms">' + esc(s.terms) + '</div>' : '') +
      '<div class="doc-sign"><div>Customer signature</div><div>Date</div></div>' +
      '<div class="doc-made">Estimate made with Coatwright</div>' +
      '</article>';
  }

  function quoteText(job, q) {
    var s = settings, cu = job.customer, out = [];
    var pad = function (label, amt) { return label + ': ' + amt; };
    out.push('Hi ' + (cu.name ? cu.name.split(' ')[0] : 'there') + ',', '');
    out.push('Thank you for the opportunity! Here is your painting estimate (' + job.number + ').');
    if (P.propertyLabel(job)) out.push('Property: ' + P.propertyLabel(job) + (cu.address ? ' — ' + cu.address : ''));
    out.push('');
    q.rooms.forEach(function (r) {
      if (!r.lines.length) return;
      out.push(r.name.toUpperCase() + ' — ' + money(r.price));
      r.lines.forEach(function (l) { out.push('  • ' + l.label + ' (' + l.detail + '): ' + money(l.price)); });
      out.push('');
    });
    if (q.materials.length) {
      out.push('PAINT & MATERIALS — ' + money(q.materialsTotal));
      q.materials.forEach(function (m) { out.push('  • ' + m.label + ' (' + m.detail + '): ' + money(m.price)); });
      out.push('');
    }
    if (q.extras.length) {
      out.push('ADDITIONAL WORK — ' + money(q.extrasTotal));
      q.extras.forEach(function (e) { out.push('  • ' + e.label + ': ' + money(e.price)); });
      out.push('');
    }
    out.push(pad('Subtotal', money(q.subtotal)));
    if (q.discount) out.push(pad('Discount', '-' + money(q.discount)));
    if (q.minimumAdj) out.push(pad('Minimum job charge', money(q.minimumAdj)));
    if (q.tax) out.push(pad('Tax', money(q.tax)));
    out.push(pad('TOTAL', money(q.total)));
    if (q.deposit) out.push(pad('Deposit to book', money(q.deposit)));
    out.push('');
    if (q.quick) out.push(QUICK_NOTE, '');
    if (job.notes) out.push('Notes: ' + job.notes, '');
    if (s.terms) out.push(s.terms, '');
    out.push('Reply to this email to accept or with any questions.', '');
    out.push([s.ownerName, s.businessName, s.phone, s.email].filter(Boolean).join('\n'));
    out.push('', '—', 'Estimate made with Coatwright');
    return out.join('\n');
  }

  function renderQuote(job) {
    var q = P.calcJob(job, settings);
    var i = q.internal;
    var g = i.gallons;
    var gal = ['wall', 'ceiling', 'trim', 'primer'].filter(function (k) { return g[k] > 0; })
      .map(function (k) { return k + ' ' + Math.round(g[k] * 10) / 10; }).join(', ') || '—';

    app.innerHTML =
      '<div class="page-head no-print"><a href="#/job/' + job.id + '" class="back">‹ Edit</a><span class="muted">' + esc(job.number) + '</span></div>' +
      '<div class="actions no-print">' +
      '<button class="btn btn-primary" data-action="email">✉️ Email</button>' +
      '<button class="btn" data-action="share">💬 Text / Share</button>' +
      '<button class="btn" data-action="print">📄 Save PDF</button>' +
      '<button class="btn" data-action="copy">📋 Copy</button></div>' +
      quoteDocument(job, q) +
      '<section class="card internal no-print"><h2 class="card-title" style="margin-bottom:2px">🔒 Your numbers</h2>' +
      '<p class="muted small" style="margin:0 0 12px">Only you see this — it\'s never sent to the customer.</p>' +
      '<div class="stats">' +
      stat('Labor hours', i.hours) + stat('Crew days', i.crewDays + ' <small>(1 painter)</small>') +
      stat('Your labor', money0(i.laborCost)) + stat('Materials cost', money0(i.materialCost)) +
      stat('Profit', money0(i.profit)) + stat('Margin', i.margin + '%') +
      '</div><div class="muted small">Exact paint needed (gal): ' + esc(gal) + '</div></section>';
  }
  function stat(label, value) {
    return '<div class="stat"><div class="muted small">' + label + '</div><div class="stat-v">' + value + '</div></div>';
  }

  // ---------- Settings ----------
  function setField(key, label, opts) {
    opts = opts || {};
    var v = settings[key];
    var input = opts.textarea
      ? '<textarea data-setting="' + key + '" rows="4">' + esc(v) + '</textarea>'
      : '<input data-setting="' + key + '" type="' + (opts.type || 'text') + '"' +
        (opts.type === 'number' ? ' inputmode="decimal" min="0" step="any"' : '') +
        (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') + ' value="' + esc(v) + '">';
    if (opts.pre || opts.unit) {
      input = '<div class="with-unit' + (opts.pre ? ' pre' : '') + '">' + (opts.pre ? '<em>' + opts.pre + '</em>' : '') + input +
        (opts.unit ? '<em>' + opts.unit + '</em>' : '') + '</div>';
    }
    return '<label class="field"><span>' + label + '</span>' + input + (opts.hint ? '<small class="muted">' + opts.hint + '</small>' : '') + '</label>';
  }

  function renderSettings() {
    app.innerHTML =
      '<div class="page-head"><a href="#/" class="back">‹ Quotes</a><span class="muted small" id="saved">Changes save automatically</span></div>' +
      '<section class="card"><h2 class="card-title">Your business</h2>' +
      '<div class="logo-row">' + (settings.logo ? '<img src="' + esc(settings.logo) + '" alt="Logo" class="logo">' : '<div class="logo placeholder">Logo</div>') +
      '<label class="btn btn-ghost">' + (settings.logo ? 'Change logo' : 'Add logo') + '<input type="file" accept="image/*" id="logo-input" hidden></label>' +
      (settings.logo ? '<button class="link danger" data-action="remove-logo">Remove</button>' : '') + '</div>' +
      setField('businessName', 'Business name', { placeholder: 'Smith Painting LLC' }) +
      setField('ownerName', 'Your name', { placeholder: 'John Smith' }) +
      '<div class="row2">' + setField('phone', 'Phone', { type: 'tel' }) + setField('email', 'Email', { type: 'email' }) + '</div>' +
      setField('website', 'Website (optional)') + '</section>' +

      '<section class="card"><h2 class="card-title">Your prices</h2>' +
      '<div class="row2">' + setField('laborRate', 'Labor rate', { type: 'number', pre: '$', unit: '/hr', hint: 'What an hour of painting is worth' }) +
      setField('markup', 'Markup', { type: 'number', unit: '%', hint: 'Overhead & profit added on top' }) + '</div>' +
      '<div class="row2">' + setField('minimumJob', 'Minimum job', { type: 'number', pre: '$' }) +
      setField('depositPct', 'Deposit', { type: 'number', unit: '%' }) + '</div>' +
      '<div class="row2">' + setField('taxRate', 'Sales tax', { type: 'number', unit: '%' }) +
      setField('validDays', 'Quote valid for', { type: 'number', unit: 'days' }) + '</div></section>' +

      '<section class="card"><h2 class="card-title">Paint cost <em class="muted small">(what you pay per gallon)</em></h2>' +
      '<div class="row2">' + setField('wallPaintPrice', 'Wall paint', { type: 'number', pre: '$' }) +
      setField('ceilingPaintPrice', 'Ceiling paint', { type: 'number', pre: '$' }) + '</div>' +
      '<div class="row2">' + setField('trimPaintPrice', 'Trim paint', { type: 'number', pre: '$' }) +
      setField('primerPrice', 'Primer', { type: 'number', pre: '$' }) + '</div>' +
      setField('suppliesPct', 'Supplies (tape, plastic, caulk…)', { type: 'number', unit: '% of paint' }) + '</section>' +

      '<details class="card"><summary class="card-title">How fast you work <em class="muted small">(advanced)</em></summary>' +
      '<p class="muted small">Per coat, for one painter. The defaults suit most painters — adjust once you\'ve timed a few jobs.</p>' +
      '<div class="row2">' + setField('wallRate', 'Walls', { type: 'number', unit: 'sq ft/hr' }) +
      setField('ceilingRate', 'Ceilings', { type: 'number', unit: 'sq ft/hr' }) + '</div>' +
      '<div class="row2">' + setField('trimRate', 'Trim', { type: 'number', unit: 'ft/hr' }) +
      setField('doorHours', 'Each door', { type: 'number', unit: 'hrs' }) + '</div>' +
      '<div class="row2">' + setField('coverage', 'Paint coverage', { type: 'number', unit: 'sq ft/gal' }) +
      setField('setupHours', 'Prep & cleanup', { type: 'number', unit: 'hrs/room' }) + '</div></details>' +

      '<section class="card"><h2 class="card-title">Quote fine print</h2>' +
      setField('terms', 'Terms shown on every quote', { textarea: true }) + '</section>' +
      '<button class="link danger center" data-action="reset-settings">Reset prices to defaults</button>';

    var input = document.getElementById('logo-input');
    if (input) input.addEventListener('change', onLogo);
  }

  function onLogo(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 240, scale = Math.min(1, max / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        settings.logo = canvas.toDataURL('image/png');
        saveSettings();
        renderSettings();
        toast('Logo saved');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // ---------- Events ----------
  app.addEventListener('input', function (e) {
    var el = e.target;
    if (el.dataset.setting) {
      var key = el.dataset.setting;
      settings[key] = el.type === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value;
      saveSettings();
      var s = document.getElementById('saved');
      if (s) s.textContent = 'Saved ✓';
      return;
    }
    var job = currentJob();
    if (!job || !el.dataset.field) return;
    var path = el.dataset.field;
    var val = el.type === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value;
    setPath(job, path, val);
    // Typing exact dimensions switches the size to "Exact"
    var m = path.match(/^rooms\.(\d+)\.(length|width)$/);
    if (m) {
      var room = job.rooms[+m[1]];
      if (room.size !== 'custom') {
        room.size = 'custom';
        var card = el.closest('.room-card');
        card.querySelectorAll('[data-action="size"]').forEach(function (b) { b.classList.toggle('on', b.dataset.v === 'custom'); });
      }
    }
    touch(job);
    refreshTotals(job);
  });

  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.dataset.action;
    var job = currentJob();
    var i = el.dataset.i != null ? +el.dataset.i : null;

    switch (action) {
      case 'new-job':
        location.hash = '#/new';
        return;
      case 'create-job':
        location.hash = '#/job/' + newJob(el.dataset.type, el.dataset.prop).id;
        return;
      case 'jobtype':
        if (job.jobType === el.dataset.v) return;
        job.jobType = el.dataset.v;
        job.propertyType = P.JOB_TYPES[job.jobType].properties[0].id;
        touch(job); renderJob(job);
        return;
      case 'prop':
        if (!job.jobType) job.jobType = 'residential';
        job.propertyType = el.dataset.v;
        touch(job); renderJob(job);
        return;
      case 'mode':
        job.mode = el.dataset.v;
        touch(job); renderJob(job);
        if (job.mode === 'quick') {
          var sq = app.querySelector('[data-field="quick.sqft"]');
          if (sq && !sq.value) sq.focus();
        }
        return;
      case 'q-surface':
        job.quick.surfaces[el.dataset.v] = !job.quick.surfaces[el.dataset.v];
        touch(job); renderJob(job);
        return;
      case 'q-seg': {
        var qf = el.dataset.field;
        job.quick[qf] = qf === 'condition' ? el.dataset.v : +el.dataset.v;
        touch(job); renderJob(job);
        return;
      }
      case 'add-room': {
        var room = P.newRoom(P.roomTypesFor(job.jobType, job.propertyType)[+el.dataset.k]);
        var same = job.rooms.filter(function (r) { return r.name.indexOf(room.name) === 0; }).length;
        if (same) room.name += ' ' + (same + 1);
        job.rooms.push(room);
        touch(job); renderJob(job);
        var cards = app.querySelectorAll('.room-card');
        cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        toast(room.name + ' added');
        return;
      }
      case 'dup-room': {
        var copy = JSON.parse(JSON.stringify(job.rooms[i]));
        copy.id = uid(); copy.name += ' (copy)';
        job.rooms.splice(i + 1, 0, copy);
        touch(job); renderJob(job);
        return;
      }
      case 'del-room':
        if (!confirm('Remove ' + job.rooms[i].name + '?')) return;
        job.rooms.splice(i, 1);
        touch(job); renderJob(job);
        return;
      case 'size': {
        var r = job.rooms[i], v = el.dataset.v;
        r.size = v;
        if (P.SIZES[v]) { r.length = P.SIZES[v].length; r.width = P.SIZES[v].width; }
        touch(job); renderJob(job);
        return;
      }
      case 'surface':
        job.rooms[i].surfaces[el.dataset.v] = !job.rooms[i].surfaces[el.dataset.v];
        touch(job); renderJob(job);
        return;
      case 'seg': {
        var f = el.dataset.field;
        job.rooms[i][f] = f === 'coats' ? +el.dataset.v : el.dataset.v;
        touch(job); renderJob(job);
        return;
      }
      case 'step': {
        var field = el.dataset.field;
        var n = Math.max(0, (Number(job.rooms[i][field]) || 0) + Number(el.dataset.d));
        job.rooms[i][field] = n;
        var out = app.querySelector('[data-out="rooms.' + i + '.' + field + '"]');
        if (out) out.textContent = n;
        touch(job); refreshTotals(job);
        return;
      }
      case 'add-extra':
        job.extras.push({ label: '', price: '' });
        touch(job); renderJob(job);
        var rows = app.querySelectorAll('.extra-row input');
        if (rows.length) rows[rows.length - 2].focus();
        return;
      case 'del-extra':
        job.extras.splice(i, 1);
        touch(job); renderJob(job);
        return;
      case 'del-job':
        if (!confirm('Delete this quote? This cannot be undone.')) return;
        jobs = jobs.filter(function (j) { return j !== job; });
        saveJobs();
        location.hash = '#/';
        return;
      case 'remove-logo':
        settings.logo = ''; saveSettings(); renderSettings();
        return;
      case 'reset-settings': {
        if (!confirm('Reset all prices and rates to the defaults? Your business info is kept.')) return;
        var keep = ['businessName', 'ownerName', 'phone', 'email', 'website', 'logo', 'nextNumber', 'terms'];
        var fresh = Object.assign({}, P.DEFAULT_SETTINGS);
        keep.forEach(function (k) { fresh[k] = settings[k]; });
        settings = fresh; saveSettings(); renderSettings(); toast('Prices reset');
        return;
      }
    }

    // Quote actions
    var qjob = findJob(location.hash.split('/')[2]);
    if (!qjob) return;
    var q = P.calcJob(qjob, settings);
    var text = quoteText(qjob, q);
    var subject = 'Painting estimate ' + qjob.number + (settings.businessName ? ' from ' + settings.businessName : '');
    if (action === 'email') {
      location.href = 'mailto:' + encodeURIComponent(qjob.customer.email || '') +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
    } else if (action === 'share') {
      if (navigator.share) navigator.share({ title: subject, text: text }).catch(function () {});
      else copyText(text);
    } else if (action === 'print') {
      toast('Choose "Save as PDF" as the printer');
      setTimeout(function () { window.print(); }, 300);
    } else if (action === 'copy') {
      copyText(text);
    }
  });

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Quote copied — paste it anywhere'); },
        function () { fallbackCopy(text); });
    } else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Quote copied'); } catch (e) { toast('Copy not supported'); }
    ta.remove();
  }

  route();
})();
