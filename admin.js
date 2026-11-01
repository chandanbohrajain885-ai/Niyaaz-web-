/* NIYAAZ — Management Console logic */
(function () {
  "use strict";
  const D = window.NIYAAZ, C = D.config, S = window.NStore;
  const root = document.getElementById("root");
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const bName = id => ((D.branches.find(b => b.id === id) || {}).name || id || "—");
  const day = iso => (iso || "").slice(0, 10);
  const ago = iso => { const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000); return m < 60 ? m + "m" : m < 1440 ? Math.round(m / 60) + "h" : Math.round(m / 1440) + "d"; };
  const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2200); };
  const wa = (phone, text) => "https://wa.me/91" + String(phone).replace(/\D/g, "").slice(-10) + "?text=" + encodeURIComponent(text);

  const ui = { tab: "overview", branch: "all", range: 30 };
  let data = { order: [], reservation: [], catering: [], feedback: [], member: [] };
  let settings = {};

  /* ---------------- Auth ---------------- */
  async function start() {
    if (await S.isAdmin()) return boot();
    root.innerHTML = '<div class="login"><form id="lf"><h1>Niyaaz<br>Management</h1><small>' + (S.mode === "cloud" ? "Sign in with your manager account." : "Demo mode — PIN is set in data.js (default 1989). Replace with cloud login before go-live.") + '</small>' +
      (S.mode === "cloud" ? '<input class="s" name="u" type="email" placeholder="Email" required autocomplete="username">' : "") +
      '<input class="s" name="p" type="password" placeholder="' + (S.mode === "cloud" ? "Password" : "PIN") + '" required autocomplete="current-password">' +
      '<button class="b p" type="submit">Sign in</button><a href="index.html" style="font-size:.8rem;color:#6f625a">← Back to website</a></form></div>';
    let tries = 0;
    $("#lf").addEventListener("submit", async e => {
      e.preventDefault(); if (tries >= 5) return toast("Too many attempts. Reload the page.");
      const fd = new FormData(e.target);
      try {
        const ok = S.mode === "cloud" ? await S.adminLogin(fd.get("u"), fd.get("p")) : await S.adminLogin(fd.get("p"));
        if (ok) boot(); else { tries++; toast("Wrong PIN"); }
      } catch (err) { tries++; toast(err.message || "Login failed"); }
    });
  }

  /* ---------------- Shell ---------------- */
  const TABS = [["overview", "📊 Overview"], ["orders", "🛍 Live Orders"], ["reservations", "🪑 Reservations"], ["catering", "🎊 Catering Leads"], ["menu", "🍚 Menu & Profit"], ["offers", "🏷 Offers"], ["customers", "👥 Customers"], ["feedback", "⭐ Feedback"], ["settings", "⚙ Settings"]];
  async function boot() {
    root.innerHTML = '<div class="mobtop"><button id="mt" aria-label="Menu">☰</button><b>Niyaaz Console</b></div><div class="app"><aside class="side" id="side"><div class="brand">NIYAAZ<small>MANAGEMENT CONSOLE</small></div>' +
      TABS.map(t => '<button data-tab="' + t[0] + '"><span>' + t[1] + '</span><span class="pill" id="pill-' + t[0] + '" hidden></span></button>').join("") +
      '<div class="foot">' + (S.mode === "cloud" ? "☁ Cloud sync on" : "⚠ Demo mode (this browser only)") + '<br><a href="index.html" target="_blank" style="color:#f3d79b">Open website ↗</a> · <a href="#" id="logout" style="color:#f3d79b">Sign out</a></div></aside><main class="main" id="main"></main></div>';
    $$("[data-tab]").forEach(b => b.addEventListener("click", () => { ui.tab = b.dataset.tab; $("#side").classList.remove("open"); render(); }));
    $("#mt").addEventListener("click", () => $("#side").classList.toggle("open"));
    $("#logout").addEventListener("click", async e => { e.preventDefault(); await S.adminLogout(); location.reload(); });
    await load(); render();
    setInterval(async () => { const before = data.order.length; await load(); if (data.order.length > before) { toast("🔔 New order received"); beep(); } if (["overview", "orders"].includes(ui.tab)) render(); else pills(); }, 20000);
  }
  function beep() { try { const a = new (window.AudioContext || window.webkitAudioContext)(); const o = a.createOscillator(); o.frequency.value = 880; o.connect(a.destination); o.start(); setTimeout(() => { o.stop(); a.close(); }, 250); } catch (e) {} }
  async function load() {
    for (const k of Object.keys(data)) { try { data[k] = await S.list(k); } catch (e) { data[k] = []; } }
    try { settings = await S.getSettings() || {}; } catch (e) { settings = {}; }
  }
  function pills() {
    const n = { orders: data.order.filter(o => ["new", "preparing", "ready"].includes(o.status)).length, reservations: data.reservation.filter(r => r.status === "requested").length,
      catering: data.catering.filter(c => c.status === "new").length, feedback: data.feedback.filter(f => f.status === "needs-action").length };
    TABS.forEach(([k]) => { const p = $("#pill-" + k); if (!p) return; p.hidden = !n[k]; p.textContent = n[k] || ""; });
    document.title = (n.orders ? "(" + n.orders + ") " : "") + "Niyaaz — Management Console";
  }
  function filt(list, dateKey) {
    const since = Date.now() - ui.range * 864e5;
    return list.filter(x => (ui.branch === "all" || x.branch === ui.branch) && new Date(x[dateKey || "createdAt"]).getTime() >= since);
  }
  function header(title, extra) {
    return '<div class="top"><h2>' + title + '</h2><span class="mode ' + S.mode + '">' + (S.mode === "cloud" ? "Cloud" : "Demo data") + '</span>' +
      '<select class="s" id="fBranch" aria-label="Branch"><option value="all">All branches</option>' + D.branches.map(b => '<option value="' + b.id + '"' + (ui.branch === b.id ? " selected" : "") + '>' + esc(b.city + " · " + b.name) + '</option>').join("") + '</select>' +
      '<select class="s" id="fRange" aria-label="Date range">' + [[1, "Today"], [7, "7 days"], [30, "30 days"], [90, "90 days"], [365, "12 months"]].map(r => '<option value="' + r[0] + '"' + (ui.range === r[0] ? " selected" : "") + '>' + r[1] + '</option>').join("") + '</select>' + (extra || "") + '</div>';
  }
  function bindHeader() {
    const fb = $("#fBranch"), fr = $("#fRange");
    if (fb) fb.addEventListener("change", e => { ui.branch = e.target.value; render(); });
    if (fr) fr.addEventListener("change", e => { ui.range = +e.target.value; render(); });
  }
  function render() {
    $$("[data-tab]").forEach(b => b.setAttribute("aria-current", b.dataset.tab === ui.tab));
    const m = $("#main"); m.innerHTML = (VIEWS[ui.tab] || VIEWS.overview)(); bindHeader(); (BIND[ui.tab] || (() => {}))(); pills();
  }

  /* ---------------- Charts (single-series, hover tooltips) ---------------- */
  function barChart(el, rows, opts) {
    const W = el.clientWidth || 600, H = el.clientHeight || 220, pl = 46, pb = 26, pt = 8;
    const max = Math.max(1, ...rows.map(r => r.v)), nice = Math.pow(10, Math.floor(Math.log10(max))), top = Math.ceil(max / nice) * nice;
    const bw = (W - pl) / rows.length, w = Math.max(2, Math.min(28, bw - 2));
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.label) + '">';
    for (let i = 0; i <= 4; i++) { const y = pt + (H - pb - pt) * (1 - i / 4); s += '<line x1="' + pl + '" x2="' + W + '" y1="' + y + '" y2="' + y + '" stroke="#ece4d8"/><text x="' + (pl - 6) + '" y="' + (y + 4) + '" text-anchor="end" font-size="10" fill="#6f625a">' + opts.fmt(top * i / 4, true) + '</text>'; }
    rows.forEach((r, i) => {
      const h = (H - pb - pt) * r.v / top, x = pl + i * bw + (bw - w) / 2, y = H - pb - h;
      s += '<path d="M' + x + ',' + (H - pb) + 'V' + (y + Math.min(4, h)) + 'q0,-' + Math.min(4, h) + ' ' + Math.min(4, w / 2) + ',-' + Math.min(4, h) + 'H' + (x + w - Math.min(4, w / 2)) + 'q' + Math.min(4, w / 2) + ',0 ' + Math.min(4, w / 2) + ',' + Math.min(4, h) + 'V' + (H - pb) + 'Z" fill="#7a1c2c"/>';
      s += '<rect x="' + (pl + i * bw) + '" y="' + pt + '" width="' + bw + '" height="' + (H - pb - pt) + '" fill="transparent" data-i="' + i + '"/>';
      if (rows.length <= 12 || i % Math.ceil(rows.length / 10) === 0) s += '<text x="' + (x + w / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="10" fill="#6f625a">' + esc(r.k) + '</text>';
    });
    s += '</svg><div class="tip"></div>';
    el.innerHTML = s;
    const tip = el.querySelector(".tip");
    el.querySelectorAll("rect[data-i]").forEach(rc => {
      rc.addEventListener("mouseenter", () => { const r = rows[+rc.dataset.i]; tip.innerHTML = "<b>" + esc(r.full || r.k) + "</b> · " + opts.fmt(r.v) + (r.extra ? " · " + esc(r.extra) : ""); tip.style.left = (+rc.getAttribute("x") + bw / 2) / W * 100 + "%"; tip.style.top = "20%"; tip.style.opacity = 1; });
      rc.addEventListener("mouseleave", () => { tip.style.opacity = 0; });
    });
  }
  const short = v => v >= 1e5 ? "₹" + (v / 1e5).toFixed(1) + "L" : v >= 1e3 ? "₹" + (v / 1e3).toFixed(v >= 1e4 ? 0 : 1) + "k" : "₹" + Math.round(v);

  /* ---------------- Views ---------------- */
  const VIEWS = {}, BIND = {};

  VIEWS.overview = function () {
    const orders = filt(data.order).filter(o => o.status !== "cancelled");
    const rev = orders.reduce((a, o) => a + (o.total || 0), 0);
    const aov = orders.length ? rev / orders.length : 0;
    const res = filt(data.reservation), cat = filt(data.catering), fb = filt(data.feedback);
    const pipe = cat.filter(c => !["lost"].includes(c.status)).reduce((a, c) => a + (+c.estimate || 0), 0);
    const avg = fb.length ? (fb.reduce((a, f) => a + (+f.rating || 0), 0) / fb.length) : 0;
    const repeatPhones = {}; data.order.forEach(o => { repeatPhones[o.phone] = (repeatPhones[o.phone] || 0) + 1; });
    const custs = Object.keys(repeatPhones).length, repeat = Object.values(repeatPhones).filter(n => n > 1).length;
    const urgent = data.feedback.filter(f => f.status === "needs-action").length, late = data.order.filter(o => o.status === "new" && Date.now() - new Date(o.createdAt) > 10 * 60000).length;
    const items = {}; orders.forEach(o => (o.items || []).forEach(i => { items[i.name] = items[i.name] || { q: 0, r: 0 }; items[i.name].q += i.qty; items[i.name].r += i.qty * i.price; }));
    const top = Object.entries(items).sort((a, b) => b[1].r - a[1].r).slice(0, 6);
    const coupons = orders.filter(o => o.coupon).length;
    return header("Overview") +
      (late ? '<div class="alert">⏱ <b>' + late + ' order(s) waiting over 10 minutes</b> without being accepted. <button class="b sm" data-go="orders">Open live orders</button></div>' : "") +
      (urgent ? '<div class="alert">⚠ <b>' + urgent + ' unhappy guest(s)</b> need a call back. Fix it before it becomes a 1-star Google review. <button class="b sm" data-go="feedback">Open feedback</button></div>' : "") +
      (!data.order.length ? '<div class="alert info">No data yet. Go to <b>Settings → Load demo data</b> to see the console with 60 days of sample activity, or place a test order on the website.</div>' : "") +
      '<div class="kpis">' +
      kpi("Online revenue", inr(rev), orders.length + " orders") + kpi("Average order value", inr(aov), "Up-sells & handis raise this") +
      kpi("Catering pipeline", inr(pipe), cat.length + " leads") + kpi("Guest rating", avg ? avg.toFixed(2) + " ★" : "—", fb.length + " responses") +
      kpi("Reservations", res.length, res.filter(r => r.status === "requested").length + " awaiting confirmation") + kpi("Repeat customers", custs ? Math.round(repeat / custs * 100) + "%" : "—", repeat + " of " + custs + " ordered 2+ times") +
      kpi("Coupon usage", orders.length ? Math.round(coupons / orders.length * 100) + "%" : "—", "of orders used a code") + kpi("Royal members", new Set(data.member.map(m => m.phone).concat(Object.keys(repeatPhones))).size, "phone numbers you own") +
      '</div><div class="grid2"><div class="card"><h3>Revenue by day <small>online orders</small></h3><div class="chart" id="c1"></div></div>' +
      '<div class="card"><h3>Revenue by branch</h3><div class="chart" id="c2"></div></div></div>' +
      '<div class="grid2"><div class="card"><h3>Top dishes by revenue</h3><div class="tablewrap"><table><thead><tr><th>Dish</th><th class="num">Qty</th><th class="num">Revenue</th></tr></thead><tbody>' +
      (top.length ? top.map(([n, v]) => '<tr><td>' + esc(n) + '</td><td class="num">' + v.q + '</td><td class="num">' + inr(v.r) + '</td></tr>').join("") : '<tr><td colspan="3" class="empty">No orders in range</td></tr>') +
      '</tbody></table></div></div><div class="card"><h3>Orders by hour <small>staff your kitchen to this</small></h3><div class="chart" id="c3"></div></div></div>';
  };
  function kpi(l, v, s) { return '<div class="kpi"><small>' + l + '</small><b>' + v + '</b><span>' + s + '</span></div>'; }
  BIND.overview = function () {
    $$("[data-go]").forEach(b => b.addEventListener("click", () => { ui.tab = b.dataset.go; render(); }));
    const orders = filt(data.order).filter(o => o.status !== "cancelled");
    const days = Math.min(ui.range, 60), byDay = [];
    for (let i = days - 1; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10); byDay.push({ k: d.slice(8), full: d, v: 0, n: 0 }); }
    orders.forEach(o => { const r = byDay.find(x => x.full === day(o.createdAt)); if (r) { r.v += o.total; r.n++; } });
    byDay.forEach(r => r.extra = r.n + " orders");
    barChart($("#c1"), byDay, { label: "Revenue by day", fmt: short });
    const byB = D.branches.map(b => ({ k: b.name.split(" ")[0], full: b.city + " · " + b.name, v: orders.filter(o => o.branch === b.id).reduce((a, o) => a + o.total, 0) }));
    barChart($("#c2"), byB, { label: "Revenue by branch", fmt: short });
    const byH = []; for (let h = 11; h <= 23; h++) byH.push({ k: (h % 12 || 12) + (h < 12 ? "a" : "p"), full: (h % 12 || 12) + ":00 " + (h < 12 ? "AM" : "PM"), v: 0 });
    orders.forEach(o => { const h = new Date(o.createdAt).getHours(); const r = byH[h - 11]; if (r) r.v++; });
    barChart($("#c3"), byH, { label: "Orders by hour", fmt: v => Math.round(v) + "" });
  };

  // ---- Live orders (kanban)
  const FLOW = { new: ["preparing", "Accept"], preparing: ["ready", "Mark ready"], ready: ["completed", "Complete"] };
  VIEWS.orders = function () {
    const list = data.order.filter(o => ui.branch === "all" || o.branch === ui.branch);
    const col = (st, title) => { const L = list.filter(o => o.status === st).slice(0, 40); return '<div class="col"><h4>' + title + '<span>' + L.length + '</span></h4>' + (L.map(ticket).join("") || '<div class="empty">—</div>') + '</div>'; };
    return header("Live Orders", '<button class="b" id="csvO">Export CSV</button>') + '<div class="kanban">' + col("new", "New") + col("preparing", "On dum") + col("ready", "Ready / Out") +
      '<div class="col"><h4>Recently completed</h4>' + (list.filter(o => o.status === "completed" || o.status === "cancelled").slice(0, 8).map(ticket).join("") || '<div class="empty">—</div>') + '</div></div>';
  };
  function ticket(o) {
    const mins = (Date.now() - new Date(o.createdAt)) / 60000, late = o.status === "new" && mins > 10;
    const nx = FLOW[o.status];
    return '<div class="ticket"><div style="display:flex;justify-content:space-between"><b>' + esc(o.id) + '</b><span class="age' + (late ? " late" : "") + '">' + ago(o.createdAt) + '</span></div>' +
      '<div class="meta">' + esc(bName(o.branch)) + ' · ' + esc({ pickup: "Pickup", delivery: "Delivery", dinein: "Dine-in" }[o.mode] || o.mode) + ' · ' + inr(o.total) + '</div>' +
      '<div>' + esc(o.name) + ' · <a href="tel:+91' + esc(o.phone) + '">' + esc(o.phone) + '</a></div>' +
      '<ul>' + (o.items || []).map(i => '<li>' + i.qty + ' × ' + esc(i.name) + '</li>').join("") + '</ul>' +
      (o.address ? '<div class="meta">📍 ' + esc(o.address) + '</div>' : "") + (o.note ? '<div class="meta">📝 ' + esc(o.note) + '</div>' : "") +
      '<div class="acts">' + (nx ? '<button class="b sm g" data-ost="' + nx[0] + '" data-id="' + esc(o.id) + '">' + nx[1] + '</button>' : "") +
      '<a class="b sm" target="_blank" rel="noopener" href="' + esc(wa(o.phone, "Hi " + o.name + ", your Niyaaz order " + o.id + " is " + ({ new: "received", preparing: "being prepared on dum", ready: o.mode === "delivery" ? "out for delivery" : "ready for pickup", completed: "complete. Thank you!" }[o.status] || o.status) + ".")) + '">WhatsApp</a>' +
      (["new", "preparing"].includes(o.status) ? '<button class="b sm d" data-ost="cancelled" data-id="' + esc(o.id) + '">Cancel</button>' : "") + '</div></div>';
  }
  BIND.orders = function () {
    $$("[data-ost]").forEach(b => b.addEventListener("click", async () => {
      if (b.dataset.ost === "cancelled" && !confirm("Cancel this order?")) return;
      await S.update("order", b.dataset.id, { status: b.dataset.ost }); await load(); render(); toast("Order updated");
    }));
    $("#csvO").addEventListener("click", () => csv("niyaaz-orders.csv", data.order.map(o => ({ id: o.id, date: o.createdAt, branch: bName(o.branch), mode: o.mode, name: o.name, phone: o.phone, items: (o.items || []).map(i => i.qty + "x " + i.name).join("; "), subtotal: o.subtotal, discount: o.discount, coupon: o.coupon, gst: o.gst, total: o.total, status: o.status }))));
  };

  // ---- Reservations
  VIEWS.reservations = function () {
    const list = data.reservation.filter(r => ui.branch === "all" || r.branch === ui.branch).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const t = new Date().toISOString().slice(0, 10);
    const upcoming = list.filter(r => r.date >= t), todayN = list.filter(r => r.date === t);
    const covers = todayN.filter(r => r.status !== "cancelled").reduce((a, r) => a + (parseInt(r.guests, 10) || 0), 0);
    return header("Reservations") + '<div class="kpis">' + kpi("Today", todayN.length, covers + " covers expected") + kpi("Awaiting confirmation", list.filter(r => r.status === "requested").length, "Confirm on WhatsApp") +
      kpi("Upcoming", upcoming.length, "next 60 days") + kpi("No-show rate", list.length ? Math.round(list.filter(r => r.status === "noshow").length / list.length * 100) + "%" : "—", "track and reduce") + '</div>' +
      '<div class="card tablewrap"><table><thead><tr><th>Date</th><th>Time</th><th>Guest</th><th>Branch</th><th class="num">Pax</th><th>Occasion</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
      (upcoming.length ? upcoming.map(r => '<tr><td>' + esc(r.date) + '</td><td>' + esc(r.time) + '</td><td>' + esc(r.name) + '<br><small>' + esc(r.phone) + '</small>' + (r.notes ? '<br><small>📝 ' + esc(r.notes) + '</small>' : "") + '</td><td>' + esc(bName(r.branch)) + '</td><td class="num">' + esc(r.guests) + '</td><td>' + esc(r.occasion || "—") + '</td><td><span class="st ' + esc(r.status) + '">' + esc(r.status) + '</span></td><td>' +
        '<button class="b sm g" data-rst="confirmed" data-id="' + esc(r.id) + '">Confirm</button> <button class="b sm" data-rst="seated" data-id="' + esc(r.id) + '">Seated</button> <button class="b sm d" data-rst="noshow" data-id="' + esc(r.id) + '">No-show</button> ' +
        '<a class="b sm" target="_blank" rel="noopener" href="' + esc(wa(r.phone, "Hi " + r.name + ", your table for " + r.guests + " at Niyaaz " + bName(r.branch) + " on " + r.date + " at " + r.time + " is confirmed. Ref " + r.id + ". See you soon!")) + '">WhatsApp</a></td></tr>').join("")
        : '<tr><td colspan="8" class="empty">No upcoming reservations</td></tr>') + '</tbody></table></div>';
  };
  BIND.reservations = () => $$("[data-rst]").forEach(b => b.addEventListener("click", async () => { await S.update("reservation", b.dataset.id, { status: b.dataset.rst }); await load(); render(); toast("Updated"); }));

  // ---- Catering
  const CST = ["new", "contacted", "quoted", "won", "lost"];
  VIEWS.catering = function () {
    const list = data.catering;
    const won = list.filter(c => c.status === "won"), open = list.filter(c => !["won", "lost"].includes(c.status));
    return header("Catering Leads") + '<div class="kpis">' + kpi("Open pipeline", inr(open.reduce((a, c) => a + (+c.estimate || 0), 0)), open.length + " leads") + kpi("Won", inr(won.reduce((a, c) => a + (+c.estimate || 0), 0)), won.length + " events") +
      kpi("Win rate", list.length ? Math.round(won.length / Math.max(1, list.filter(c => ["won", "lost"].includes(c.status)).length) * 100) + "%" : "—", "of closed leads") + kpi("Uncontacted", list.filter(c => c.status === "new").length, "call within 2 hours") + '</div>' +
      '<div class="card tablewrap"><table><thead><tr><th>Received</th><th>Client</th><th>Event</th><th>Date</th><th class="num">Guests</th><th>Package</th><th class="num">Estimate</th><th>Stage</th></tr></thead><tbody>' +
      (list.length ? list.map(c => '<tr><td>' + ago(c.createdAt) + ' ago</td><td>' + esc(c.name) + '<br><small><a href="tel:+91' + esc(c.phone) + '">' + esc(c.phone) + '</a></small></td><td>' + esc(c.event) + '<br><small>' + esc(c.city) + '</small>' + (c.notes ? '<br><small>📝 ' + esc(c.notes) + '</small>' : "") + '</td><td>' + esc(c.date) + '</td><td class="num">' + esc(c.guests) + '</td><td>' + esc(c.package) + '</td><td class="num">' + inr(c.estimate) + '</td><td><select class="s" data-cst="' + esc(c.id) + '">' + CST.map(s => '<option' + (c.status === s ? " selected" : "") + '>' + s + '</option>').join("") + '</select></td></tr>').join("")
        : '<tr><td colspan="8" class="empty">No catering leads yet</td></tr>') + '</tbody></table></div>';
  };
  BIND.catering = () => $$("[data-cst]").forEach(s => s.addEventListener("change", async () => { await S.update("catering", s.dataset.cst, { status: s.value }); await load(); render(); toast("Stage updated"); }));

  // ---- Menu & menu engineering
  VIEWS.menu = function () {
    const ov = settings.menu || {};
    const orders = filt(data.order).filter(o => o.status !== "cancelled");
    const sold = {}; orders.forEach(o => (o.items || []).forEach(i => { sold[i.id] = (sold[i.id] || 0) + i.qty; }));
    const rows = D.menu.map(m => { const e = Object.assign({}, m, ov[m.id] || {}); const margin = e.price * (1 - e.cost); return { m: e, q: sold[m.id] || 0, margin }; });
    const avgQ = rows.reduce((a, r) => a + r.q, 0) / rows.length * 0.7; // Kasavana-Smith 70% rule
    const avgM = rows.reduce((a, r) => a + r.margin * r.q, 0) / Math.max(1, rows.reduce((a, r) => a + r.q, 0));
    const cls = r => r.q >= avgQ ? (r.margin >= avgM ? "star" : "plow") : (r.margin >= avgM ? "puzzle" : "dog");
    const groups = { star: [], plow: [], puzzle: [], dog: [] }; rows.forEach(r => groups[cls(r)].push(r));
    const Q = (k, t, d, col) => '<div class="q4" style="border-left:4px solid ' + col + '"><h5>' + t + ' (' + groups[k].length + ')</h5><p>' + d + '</p><ul>' + groups[k].slice(0, 6).map(r => '<li>' + esc(r.m.name) + '</li>').join("") + '</ul></div>';
    return header("Menu & Profit") +
      '<div class="alert info">ℹ Food-cost % values in data.js are <b>assumptions</b>. Replace them with real recipe costing to make this analysis decision-grade.</div>' +
      '<div class="card" style="margin-bottom:1rem"><h3>Menu engineering <small>popularity × contribution margin</small></h3><div class="quad">' +
      Q("star", "★ Stars — protect", "Popular and profitable. Keep quality, feature at top, never discount.", "#2f6b3a") +
      Q("plow", "🐂 Plowhorses — re-price", "Popular, low margin. Raise price ₹10–20 or reduce portion cost.", "#b7791f") +
      Q("puzzle", "🧩 Puzzles — promote", "Profitable but under-ordered. Push via up-sells, staff and photos.", "#2b5c8a") +
      Q("dog", "✗ Dogs — fix or drop", "Neither popular nor profitable. Rework or remove from the menu.", "#c0392b") +
      '</div></div><div class="card tablewrap"><h3>Items <small>changes go live on the website instantly</small></h3><table><thead><tr><th>Dish</th><th>Category</th><th class="num">Sold</th><th class="num">Price ₹</th><th class="num">Food cost</th><th class="num">Margin/plate</th><th>Class</th><th>Available</th></tr></thead><tbody>' +
      rows.map(r => '<tr><td>' + esc(r.m.name) + (r.m.verify ? ' <small style="color:#b7791f">(price to verify)</small>' : "") + '</td><td>' + esc(r.m.cat) + '</td><td class="num">' + r.q + '</td><td class="num"><input class="s" type="number" min="0" step="5" value="' + r.m.price + '" data-price="' + r.m.id + '" style="width:84px;text-align:right"></td><td class="num">' + Math.round(r.m.cost * 100) + '%</td><td class="num">' + inr(r.margin) + '</td><td>' + { star: "★ Star", plow: "Plowhorse", puzzle: "Puzzle", dog: "Dog" }[cls(r)] + '</td><td><label class="toggle"><input type="checkbox" data-avail="' + r.m.id + '"' + (r.m.available === false ? "" : " checked") + ' aria-label="Available"><span></span></label></td></tr>').join("") +
      '</tbody></table></div>';
  };
  BIND.menu = function () {
    const save = async (id, patch) => { settings.menu = settings.menu || {}; settings.menu[id] = Object.assign({}, settings.menu[id] || {}, patch); await S.saveSettings(settings); toast("Saved — live on website"); };
    $$("[data-avail]").forEach(i => i.addEventListener("change", () => save(i.dataset.avail, { available: i.checked })));
    $$("[data-price]").forEach(i => i.addEventListener("change", () => { const v = Math.max(0, Math.round(+i.value || 0)); save(i.dataset.price, { price: v }).then(render); }));
  };

  // ---- Offers
  VIEWS.offers = function () {
    const offers = settings.offers || D.offers;
    const orders = data.order.filter(o => o.status !== "cancelled");
    return header("Offers & Coupons") + '<div class="card tablewrap"><table><thead><tr><th>Code</th><th>Type</th><th class="num">Value</th><th class="num">Min order</th><th class="num">Uses</th><th class="num">Revenue driven</th><th class="num">Discount given</th><th>Active</th><th></th></tr></thead><tbody>' +
      offers.map((o, i) => { const u = orders.filter(x => x.coupon === o.code); return '<tr><td><b>' + esc(o.code) + '</b><br><small>' + esc(o.label) + '</small></td><td>' + esc(o.type) + '</td><td class="num">' + (o.type === "percent" ? o.value + "%" : inr(o.value)) + '</td><td class="num">' + inr(o.minOrder) + '</td><td class="num">' + u.length + '</td><td class="num">' + inr(u.reduce((a, x) => a + x.total, 0)) + '</td><td class="num">' + inr(u.reduce((a, x) => a + (x.discount || 0), 0)) + '</td><td><label class="toggle"><input type="checkbox" data-oact="' + i + '"' + (o.active ? " checked" : "") + '><span></span></label></td><td><button class="b sm d" data-odel="' + i + '">Delete</button></td></tr>'; }).join("") +
      '</tbody></table></div><form class="card" id="newOffer" style="margin-top:1rem;display:grid;grid-template-columns:repeat(5,1fr) auto;gap:.6rem;align-items:end"><h3 style="grid-column:1/-1">Create a coupon</h3>' +
      '<input class="s" name="code" placeholder="CODE" required maxlength="20" pattern="[A-Za-z0-9]+"><select class="s" name="type"><option value="percent">% off</option><option value="flat">₹ off</option></select><input class="s" name="value" type="number" min="1" placeholder="Value" required><input class="s" name="minOrder" type="number" min="0" placeholder="Min order ₹" required><input class="s" name="label" placeholder="Shown to customers" maxlength="80"><button class="b p">Add</button></form>' +
      '<p style="color:#6f625a;margin-top:.8rem;font-size:.85rem">Rule of thumb: never discount Stars. Use coupons on Puzzles and on slow hours (see Overview → Orders by hour).</p>';
  };
  BIND.offers = function () {
    const offers = () => (settings.offers = (settings.offers || D.offers.map(o => Object.assign({}, o))));
    $$("[data-oact]").forEach(i => i.addEventListener("change", async () => { offers()[+i.dataset.oact].active = i.checked; await S.saveSettings(settings); toast("Saved"); }));
    $$("[data-odel]").forEach(b => b.addEventListener("click", async () => { if (!confirm("Delete coupon?")) return; offers().splice(+b.dataset.odel, 1); await S.saveSettings(settings); render(); }));
    $("#newOffer").addEventListener("submit", async e => {
      e.preventDefault(); const f = Object.fromEntries(new FormData(e.target).entries()); const code = f.code.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!code) return toast("Code must be letters/numbers");
      if (offers().some(o => o.code === code)) return toast("Code already exists");
      offers().push({ code, type: f.type, value: +f.value, minOrder: +f.minOrder, active: true, label: f.label || code });
      await S.saveSettings(settings); render(); toast("Coupon created");
    });
  };

  // ---- Customers (CRM)
  VIEWS.customers = function () {
    const m = {};
    data.order.filter(o => o.status !== "cancelled").forEach(o => {
      const c = m[o.phone] = m[o.phone] || { phone: o.phone, name: o.name, n: 0, spend: 0, last: o.createdAt, fav: {} };
      c.n++; c.spend += o.total; if (o.createdAt > c.last) { c.last = o.createdAt; c.name = o.name; }
      (o.items || []).forEach(i => { c.fav[i.name] = (c.fav[i.name] || 0) + i.qty; });
    });
    const list = Object.values(m).map(c => Object.assign(c, { days: Math.floor((Date.now() - new Date(c.last)) / 864e5), favd: Object.entries(c.fav).sort((a, b) => b[1] - a[1])[0] })).sort((a, b) => b.spend - a.spend);
    const seg = c => c.days > 45 && c.n >= 2 ? "lapsed" : c.n >= 5 ? "loyal" : c.n === 1 ? "one-time" : "regular";
    const lapsed = list.filter(c => seg(c) === "lapsed");
    return header("Customers", '<button class="b" id="csvC">Export CSV</button>') +
      '<div class="kpis">' + kpi("Customers", list.length, "unique mobile numbers") + kpi("Loyal (5+ orders)", list.filter(c => seg(c) === "loyal").length, "your best marketing") + kpi("One-time", list.filter(c => seg(c) === "one-time").length, "convert with 2nd-order offer") + kpi("Lapsed (45d+)", lapsed.length, "win back on WhatsApp") + '</div>' +
      (lapsed.length ? '<div class="alert info">💡 <b>' + lapsed.length + ' regulars haven\'t ordered in 45+ days.</b> A personal WhatsApp with their favourite dish typically brings a meaningful share back. Use the Win-back button.</div>' : "") +
      '<div class="card tablewrap"><table><thead><tr><th>Customer</th><th class="num">Orders</th><th class="num">Lifetime ₹</th><th>Favourite</th><th class="num">Last order</th><th>Segment</th><th></th></tr></thead><tbody>' +
      (list.length ? list.slice(0, 200).map(c => '<tr><td>' + esc(c.name) + '<br><small>' + esc(c.phone) + '</small></td><td class="num">' + c.n + '</td><td class="num">' + inr(c.spend) + '</td><td>' + esc(c.favd ? c.favd[0] : "—") + '</td><td class="num">' + c.days + 'd ago</td><td><span class="st ' + (seg(c) === "lapsed" ? "needs-action" : seg(c) === "loyal" ? "ok" : "new") + '">' + seg(c) + '</span></td><td><a class="b sm" target="_blank" rel="noopener" href="' + esc(wa(c.phone, "Hi " + c.name + "! We miss you at Niyaaz 🍚 Your " + (c.favd ? c.favd[0] : "favourite biryani") + " is waiting — use code COMEBACK15 for 15% off this week. Order: https://niyaaz.in/#menu")) + '">' + (seg(c) === "lapsed" ? "Win-back" : "WhatsApp") + '</a></td></tr>').join("")
        : '<tr><td colspan="7" class="empty">No customers yet</td></tr>') + '</tbody></table></div>' +
      '<p style="color:#6f625a;margin-top:.8rem;font-size:.82rem">Only message customers who ordered from you. Create the COMEBACK15 coupon in Offers before sending win-backs.</p>';
  };
  BIND.customers = () => $("#csvC").addEventListener("click", () => {
    const m = {}; data.order.forEach(o => { const c = m[o.phone] = m[o.phone] || { name: o.name, phone: o.phone, orders: 0, spend: 0, last: o.createdAt }; c.orders++; c.spend += o.total; if (o.createdAt > c.last) c.last = o.createdAt; });
    csv("niyaaz-customers.csv", Object.values(m));
  });

  // ---- Feedback
  VIEWS.feedback = function () {
    const list = filt(data.feedback);
    const dist = [1, 2, 3, 4, 5].map(n => list.filter(f => +f.rating === n).length);
    const avg = list.length ? list.reduce((a, f) => a + +f.rating, 0) / list.length : 0;
    const promoters = list.filter(f => +f.rating === 5).length, detractors = list.filter(f => +f.rating <= 3).length;
    return header("Guest Feedback") + '<div class="kpis">' + kpi("Average", avg ? avg.toFixed(2) + " ★" : "—", list.length + " ratings") + kpi("Net sentiment", list.length ? Math.round((promoters - detractors) / list.length * 100) : "—", "% 5★ minus % ≤3★") +
      kpi("Need action", data.feedback.filter(f => f.status === "needs-action").length, "call these guests today") + kpi("5-star", dist[4], "ask them for Google reviews") + '</div>' +
      '<div class="card tablewrap"><table><thead><tr><th>When</th><th>Rating</th><th>Branch</th><th>Comment</th><th>Guest</th><th>Status</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(f => '<tr><td>' + ago(f.createdAt) + '</td><td style="color:#e39b2d;white-space:nowrap">' + "★".repeat(+f.rating) + '<span style="color:#d9cdb8">' + "★".repeat(5 - +f.rating) + '</span></td><td>' + esc(bName(f.branch)) + '</td><td>' + esc(f.comment || "—") + '</td><td>' + esc(f.phone || "—") + '</td><td><span class="st ' + esc(f.status) + '">' + esc(f.status) + '</span></td><td>' +
        (f.status === "needs-action" ? '<button class="b sm g" data-fres="' + esc(f.id) + '">Resolved</button>' : "") + (f.phone ? ' <a class="b sm" target="_blank" rel="noopener" href="' + esc(wa(f.phone, "Hi, this is the Niyaaz management team. Thank you for your feedback — we'd like to make it right.")) + '">Reply</a>' : "") + '</td></tr>').join("")
        : '<tr><td colspan="7" class="empty">No feedback in range</td></tr>') + '</tbody></table></div>';
  };
  BIND.feedback = () => $$("[data-fres]").forEach(b => b.addEventListener("click", async () => { await S.update("feedback", b.dataset.fres, { status: "ok", resolvedAt: new Date().toISOString() }); await load(); render(); }));

  // ---- Settings
  VIEWS.settings = function () {
    return '<div class="top"><h2>Settings</h2><span class="mode ' + S.mode + '">' + (S.mode === "cloud" ? "Cloud" : "Demo data") + '</span></div>' +
      '<div class="grid2"><form class="card" id="ribbonF"><h3>Website announcement bar</h3><input class="s" name="ribbon" maxlength="140" style="width:100%" placeholder="e.g. Biryani Festival this weekend — 14 biryanis, one price!" value="' + esc(settings.ribbon || "") + '"><p style="color:#6f625a;font-size:.8rem;margin:.4rem 0 .8rem">Leave empty to show the default first-order offer.</p><button class="b p">Save</button></form>' +
      '<div class="card"><h3>Data</h3><p style="color:#6f625a;margin-bottom:.8rem">' + (S.mode === "cloud" ? "Connected to Supabase. Data is shared across all devices." : "Demo mode stores data in <b>this browser only</b>. Connect Supabase (see README) before real customers use it.") + '</p>' +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="b p" id="seed"' + (S.mode === "cloud" ? " disabled" : "") + '>Load 60 days of demo data</button><button class="b" id="backup">Download full backup (JSON)</button><button class="b d" id="wipe"' + (S.mode === "cloud" ? " disabled" : "") + '>Wipe demo data</button></div></div></div>' +
      '<div class="card"><h3>Go-live checklist</h3><ol style="padding-left:1.2rem;line-height:1.9">' +
      ['Replace <code>orderWhatsApp</code> in data.js with the official WhatsApp Business number', 'Add each branch phone number in data.js', 'Confirm every menu price flagged “to verify”', 'Replace food-cost % with real recipe costing', 'Add real dish photos (set <code>img</code> on menu items)', 'Create Supabase project, run supabase-schema.sql, add manager users, paste keys, uncomment the Supabase script tag', 'Replace the illustrative guest quotes with real, permissioned reviews', 'Set the Google review link to the exact Google Business Profile', 'Connect domain niyaaz.in in Vercel'].map(x => '<li>' + x + '</li>').join("") + '</ol></div>';
  };
  BIND.settings = function () {
    $("#ribbonF").addEventListener("submit", async e => { e.preventDefault(); settings.ribbon = new FormData(e.target).get("ribbon").trim(); await S.saveSettings(settings); toast("Saved"); });
    $("#seed").addEventListener("click", async () => { if (!confirm("Add sample orders, bookings, leads and feedback?")) return; seed(); await load(); toast("Demo data loaded"); ui.tab = "overview"; render(); });
    $("#wipe").addEventListener("click", async () => { if (!confirm("Delete ALL demo data in this browser?")) return; S.wipeDemo(); await load(); render(); toast("Wiped"); });
    $("#backup").addEventListener("click", () => { const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data, settings }, null, 2)], { type: "application/json" }); dl("niyaaz-backup.json", blob); });
  };

  /* ---------------- Utilities ---------------- */
  function dl(name, blob) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function csv(name, rows) {
    if (!rows.length) return toast("Nothing to export");
    const keys = Object.keys(rows[0]);
    const cell = v => { let s = String(v == null ? "" : v); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }; // blocks CSV formula injection
    dl(name, new Blob(["﻿" + [keys.join(",")].concat(rows.map(r => keys.map(k => cell(r[k])).join(","))).join("\n")], { type: "text/csv" }));
  }

  // Demo data generator (local mode only)
  function seed() {
    const names = ["Ayesha Khan", "Rahul Patil", "Sameer Mulla", "Priya Kulkarni", "Imran Shaikh", "Sneha Desai", "Faizan Sayyed", "Vikram Naik", "Zoya Attar", "Rohan Joshi", "Meera Hegde", "Arif Bepari", "Kiran Jadhav", "Nikhil Kamat", "Sana Momin", "Aditya Pawar", "Rizwan Nadaf", "Pooja Shetty", "Tanvir Pathan", "Ganesh Gawde"];
    const phones = names.map((_, i) => String(9000000000 + i * 7919 + 1234567).slice(0, 10).replace(/^./, "9"));
    const r = (a) => a[Math.floor(Math.random() * a.length)];
    const weights = { b1: 30, b2: 34, b7: 8, b8: 6, b4: 7, b5: 3, b6: 6, b3: 2, k1: 12, k2: 7, k3: 5, k4: 6, k5: 4, k6: 4, m1: 8, m2: 4, m3: 3, m4: 5, m5: 4, r1: 10, r2: 9, r3: 4, p1: 3, p2: 2, c1: 5, c2: 4, c3: 3, d1: 14, d2: 5, d3: 6, d4: 5, x1: 10, x2: 4, x3: 5 };
    const pool = []; Object.entries(weights).forEach(([id, w]) => { for (let i = 0; i < w; i++) pool.push(id); });
    const bw = ["khade-bazaar", "khade-bazaar", "khade-bazaar", "tilakwadi", "tilakwadi", "nehru-nagar", "food-plaza", "azam-nagar", "goa-bambolim", "kolhapur", "kolhapur"];
    const hours = [12, 13, 13, 14, 14, 15, 17, 19, 20, 20, 21, 21, 21, 22];
    const orders = [], res = [], cat = [], fb = [];
    for (let d = 59; d >= 0; d--) {
      const n = 6 + Math.floor(Math.random() * 8) + ([5, 6, 0].includes(new Date(Date.now() - d * 864e5).getDay()) ? 6 : 0);
      for (let k = 0; k < n; k++) {
        const t = new Date(Date.now() - d * 864e5); t.setHours(r(hours), Math.floor(Math.random() * 60), 0, 0); if (t > new Date()) t.setTime(Date.now() - Math.random() * 3600e3);
        const ci = Math.random() < 0.55 ? Math.floor(Math.random() * 8) : Math.floor(Math.random() * names.length);
        const items = {}; const cnt = 1 + Math.floor(Math.random() * 4); for (let j = 0; j < cnt; j++) { const id = r(pool); items[id] = (items[id] || 0) + 1; }
        const lines = Object.entries(items).map(([id, q]) => { const m = D.menu.find(x => x.id === id); return { id, name: m.name, price: m.price, qty: q, cat: m.cat }; });
        const sub = lines.reduce((a, l) => a + l.price * l.qty, 0);
        const cp = Math.random() < 0.18 ? r(D.offers) : null; const disc = cp && sub >= cp.minOrder ? (cp.type === "percent" ? Math.round(sub * cp.value / 100) : cp.value) : 0;
        const mode = r(["pickup", "pickup", "delivery", "delivery", "dinein"]); const fee = mode === "delivery" && sub < C.freeDeliveryAbove ? C.deliveryFee : 0;
        const gst = Math.round((sub - disc) * C.gstRate);
        const recent = d === 0 && k >= n - 4;
        const oneTime = Math.random() < 0.45; // realistic mix of one-time and repeat guests
        const nm = oneTime ? r(names).split(" ")[0] + " " + r(["K", "S", "M", "P", "D"]) + "." : names[ci];
        const ph = oneTime ? "9" + String(Math.floor(1e8 + Math.random() * 9e8)) : phones[ci];
        orders.push({ id: "O" + t.getTime().toString(36).toUpperCase().slice(-6) + k, kind: "order", createdAt: t.toISOString(), name: nm, phone: ph, branch: r(bw), mode, items: lines, subtotal: sub, discount: disc, coupon: disc ? cp.code : "", fee, gst, total: sub - disc + gst + fee, status: recent ? r(["new", "preparing", "ready"]) : (Math.random() < 0.03 ? "cancelled" : "completed"), source: "website", demo: true, address: mode === "delivery" ? "Demo address, Belagavi" : "" });
      }
      if (Math.random() < 0.7) { const ci = Math.floor(Math.random() * names.length); const dt = new Date(Date.now() + (Math.floor(Math.random() * 10) - 3) * 864e5).toISOString().slice(0, 10); res.push({ id: "R" + d + Math.random().toString(36).slice(2, 6).toUpperCase(), kind: "reservation", createdAt: new Date(Date.now() - d * 864e5).toISOString(), name: names[ci], phone: phones[ci], branch: r(bw), date: dt, time: r(["13:00", "13:30", "20:00", "20:30", "21:00"]), guests: r(["2", "4", "4", "6", "8"]), occasion: r(["", "", "Birthday", "Family gathering", "Anniversary"]), status: dt >= new Date().toISOString().slice(0, 10) ? r(["requested", "confirmed"]) : r(["seated", "seated", "seated", "noshow"]), demo: true }); }
      if (Math.random() < 0.25) { const p = r(D.cateringPackages); const g = r([60, 100, 150, 250, 400]); cat.push({ id: "C" + d + Math.random().toString(36).slice(2, 6).toUpperCase(), kind: "catering", createdAt: new Date(Date.now() - d * 864e5).toISOString(), name: r(names), phone: r(phones), event: r(["Wedding / Nikah", "Iftar / Eid", "Corporate", "Birthday"]), city: r(["Belagavi", "Belagavi", "Kolhapur", "Goa"]), date: new Date(Date.now() + 864e5 * (10 + Math.floor(Math.random() * 60))).toISOString().slice(0, 10), guests: g, package: p.name, perPlate: p.perPlate, estimate: g * p.perPlate, status: d > 20 ? r(["won", "lost", "won"]) : r(["new", "contacted", "quoted"]), demo: true }); }
      if (Math.random() < 0.6) { const rt = r([5, 5, 5, 4, 4, 4, 3, 2, 5, 1]); fb.push({ id: "F" + d + Math.random().toString(36).slice(2, 6).toUpperCase(), kind: "feedback", createdAt: new Date(Date.now() - d * 864e5).toISOString(), rating: rt, branch: r(bw), phone: Math.random() < .6 ? r(phones) : "", comment: rt >= 4 ? r(["Mutton biryani was perfect.", "Loved the kebab platter.", "Phirni is the best.", "Quick pickup, hot food.", ""]) : r(["Waited 40 min for pickup.", "Less chicken pieces than before.", "Biryani was cold on delivery.", "Staff was rude about parking."]), status: rt <= 3 ? (d > 5 ? "ok" : "needs-action") : "ok", demo: true }); }
    }
    S.local.set("order", (S.local.get("order", [])).concat(orders));
    S.local.set("reservation", (S.local.get("reservation", [])).concat(res));
    S.local.set("catering", (S.local.get("catering", [])).concat(cat));
    S.local.set("feedback", (S.local.get("feedback", [])).concat(fb));
  }

  start();
})();
