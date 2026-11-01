/* NIYAAZ — customer site logic */
(function () {
  "use strict";
  const D = window.NIYAAZ, C = D.config, S = window.NStore;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const PHONE = /^[6-9]\d{9}$/;
  const EMOJI = { biryani: "🍚", kebab: "🍢", main: "🍛", bread: "🫓", rice: "🥘", chinese: "🥢", dessert: "🍮", drinks: "🥤" };
  const BG = { biryani: "#f6e3bf", kebab: "#f3d2c4", main: "#f4dcc3", bread: "#efe5d2", rice: "#f1e7cf", chinese: "#f3dccf", dessert: "#f5e4ea", drinks: "#e3efe6" };

  let settings = {};          // admin overrides
  let MENU = D.menu.slice();  // effective menu
  let OFFERS = D.offers.slice();
  const state = { cat: "all", q: "", veg: false, sig: false, city: "all", rating: 0, mode: "pickup", coupon: null, redeem: false };
  let cart = S.local.get("cart", {});

  /* ---------------- i18n (key UI strings) ---------------- */
  const T = {
    kn: { nav_menu: "ಮೆನು", nav_reserve: "ಟೇಬಲ್ ಬುಕ್", nav_catering: "ಕ್ಯಾಟರಿಂಗ್", nav_royal: "ರಾಯಲ್ ಕ್ಲಬ್", nav_branches: "ಶಾಖೆಗಳು", nav_track: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್", cart: "ಕಾರ್ಟ್",
      hero_eyebrow: "1989 ರಿಂದ · ಬೆಳಗಾವಿ", hero_title: "<em>ಮೂಲ</em><br>ಬೆಳಗಾವಿ ಬಿರಿಯಾನಿ.", hero_lead: "ಹಂಡಿಯಲ್ಲಿ ಮುಚ್ಚಿ, ದಮ್‌ನಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೇಯಿಸಿ — ಮೂರು ದಶಕಗಳಿಂದ ಅದೇ ರುಚಿ. ಆನ್‌ಲೈನ್ ಆರ್ಡರ್ ಮಾಡಿ, ಟೇಬಲ್ ಬುಕ್ ಮಾಡಿ.",
      cta_order: "ಆನ್‌ಲೈನ್ ಆರ್ಡರ್", cta_reserve: "ಟೇಬಲ್ ಕಾಯ್ದಿರಿಸಿ", q_order: "ಆರ್ಡರ್ & ಪಿಕಪ್", q_reserve: "ಟೇಬಲ್ ಬುಕ್", q_catering: "ಕ್ಯಾಟರಿಂಗ್", q_royal: "ರಾಯಲ್ ಕ್ಲಬ್", sig_eyebrow: "ವಿಶೇಷ ಖಾದ್ಯಗಳು", sig_title: "ಬೆಳಗಾವಿ ಮತ್ತೆ ಮತ್ತೆ ಬರುವುದು ಇದಕ್ಕಾಗಿ", menu_title: "ಸಂಪೂರ್ಣ ಮೆನು" },
    mr: { nav_menu: "मेनू", nav_reserve: "टेबल बुक", nav_catering: "केटरिंग", nav_royal: "रॉयल क्लब", nav_branches: "शाखा", nav_track: "ऑर्डर ट्रॅक", cart: "कार्ट",
      hero_eyebrow: "1989 पासून · बेळगाव", hero_title: "<em>मूळ</em><br>बेळगाव बिर्याणी.", hero_lead: "हंडीत बंद करून, दमवर हळूहळू शिजवलेली — तीन दशकांपासून तीच चव. ऑनलाइन ऑर्डर करा, टेबल बुक करा.",
      cta_order: "ऑनलाइन ऑर्डर", cta_reserve: "टेबल राखून ठेवा", q_order: "ऑर्डर & पिकअप", q_reserve: "टेबल बुक", q_catering: "केटरिंग", q_royal: "रॉयल क्लब", sig_eyebrow: "खास पदार्थ", sig_title: "बेळगाव पुन्हा पुन्हा याच्यासाठी येतं", menu_title: "संपूर्ण मेनू" },
    hi: { nav_menu: "मेन्यू", nav_reserve: "टेबल बुक", nav_catering: "कैटरिंग", nav_royal: "रॉयल क्लब", nav_branches: "शाखाएँ", nav_track: "ऑर्डर ट्रैक", cart: "कार्ट",
      hero_eyebrow: "1989 से · बेलगाम", hero_title: "<em>असली</em><br>बेलगाम बिरयानी.", hero_lead: "हांडी में बंद, दम पर धीमी आँच में पकी — तीन दशकों से वही स्वाद। ऑनलाइन ऑर्डर करें, टेबल बुक करें।",
      cta_order: "ऑनलाइन ऑर्डर", cta_reserve: "टेबल बुक करें", q_order: "ऑर्डर & पिकअप", q_reserve: "टेबल बुक", q_catering: "कैटरिंग", q_royal: "रॉयल क्लब", sig_eyebrow: "खास व्यंजन", sig_title: "बेलगाम बार-बार इसी के लिए आता है", menu_title: "पूरा मेन्यू" }
  };
  const EN = {};
  $$("[data-i18n]").forEach(el => { EN[el.dataset.i18n] = el.textContent; });
  $$("[data-i18n-html]").forEach(el => { EN[el.dataset.i18nHtml] = el.innerHTML; });
  function setLang(l) {
    const dict = T[l] || {};
    $$("[data-i18n]").forEach(el => { el.textContent = dict[el.dataset.i18n] || EN[el.dataset.i18n]; });
    $$("[data-i18n-html]").forEach(el => { el.innerHTML = dict[el.dataset.i18nHtml] || EN[el.dataset.i18nHtml]; }); // trusted, static strings only
    document.documentElement.lang = l;
    S.local.set("lang", l);
  }

  /* ---------------- helpers ---------------- */
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2600); }
  const item = id => MENU.find(m => m.id === id);
  const branch = id => D.branches.find(b => b.id === id);
  const spice = n => n ? '<span class="spice" aria-label="spice level ' + n + '">' + "🌶".repeat(n) + "</span>" : "";
  const vg = m => '<span class="vg' + (m.veg ? "" : " nv") + '" title="' + (m.veg ? "Veg" : "Non-veg") + '"></span>';
  function istNow() { const d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 330) * 60000); }
  function isOpen(b) { const n = istNow(); const m = n.getHours() * 60 + n.getMinutes(); const [oh, om] = b.open.split(":").map(Number); const [ch, cm] = b.close.split(":").map(Number); return m >= oh * 60 + om && m < ch * 60 + cm; }
  function waLink(num, text) { return "https://wa.me/" + String(num).replace(/\D/g, "") + "?text=" + encodeURIComponent(text); }
  function fmt12(hm) { let [h, m] = hm.split(":").map(Number); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return h + ":" + String(m).padStart(2, "0") + " " + ap; }
  function today(offsetDays) { const d = istNow(); d.setDate(d.getDate() + (offsetDays || 0)); return d.toISOString().slice(0, 10); }

  /* ---------------- settings overrides from admin ---------------- */
  function applySettings() {
    const ov = settings.menu || {};
    MENU = D.menu.map(m => Object.assign({}, m, ov[m.id] || {}));
    if (Array.isArray(settings.offers)) OFFERS = settings.offers;
    if (settings.ribbon) { const r = $("#ribbon"); r.textContent = settings.ribbon + " "; const b = document.createElement("button"); b.type = "button"; b.dataset.open = "cart"; b.textContent = "Order now"; r.appendChild(b); }
  }

  /* ---------------- Signature + menu ---------------- */
  function qtyCtl(m) {
    if (m.available === false) return '<span class="soldout">Sold out today</span>';
    const q = cart[m.id] || 0;
    return q ? '<span class="qty"><button type="button" data-dec="' + m.id + '" aria-label="Remove one">−</button><span>' + q + '</span><button type="button" data-inc="' + m.id + '" aria-label="Add one">+</button></span>'
      : '<button class="add" type="button" data-inc="' + m.id + '">Add</button>';
  }
  function renderSig() {
    const sig = MENU.filter(m => m.signature).slice(0, 4);
    $("#sigGrid").innerHTML = sig.map(m => '<article class="dish reveal"><div class="art" style="background:' + BG[m.cat] + '">' +
      (m.img ? '<img src="' + esc(m.img) + '" alt="' + esc(m.name) + '" loading="lazy">' : EMOJI[m.cat]) +
      '<span class="badge">SIGNATURE</span></div><div class="body"><h3>' + esc(m.name) + '</h3><p>' + esc(m.desc) + '</p><div class="row"><span class="price">' + inr(m.price) + '</span>' + qtyCtl(m) + '</div></div></article>').join("");
  }
  function renderCats() {
    const all = [{ id: "all", name: "All", icon: "✦" }].concat(D.categories);
    $("#cats").innerHTML = all.map(c => '<button class="chip" type="button" data-cat="' + c.id + '" aria-pressed="' + (state.cat === c.id) + '">' + c.icon + " " + esc(c.name) + "</button>").join("");
  }
  function renderMenu() {
    const q = state.q.trim().toLowerCase();
    const list = MENU.filter(m => (state.cat === "all" || m.cat === state.cat) && (!state.veg || m.veg) && (!state.sig || m.signature) &&
      (!q || (m.name + " " + m.desc).toLowerCase().includes(q)));
    $("#menuList").innerHTML = list.length ? list.map(m => '<div class="mi"><div class="emo" style="background:' + BG[m.cat] + '">' + EMOJI[m.cat] + '</div><div class="info">' +
      (m.signature ? '<div class="tag">★ Signature</div>' : "") + '<h4>' + vg(m) + esc(m.name) + '</h4><p>' + esc(m.desc) + '</p>' + spice(m.spice) + '</div><div class="act"><span class="price">' + inr(m.price) + '</span>' + qtyCtl(m) + '</div></div>').join("")
      : '<div class="empty">No dishes match. Try another search.</div>';
  }

  /* ---------------- Cart ---------------- */
  function saveCart() { S.local.set("cart", cart); const n = Object.values(cart).reduce((a, b) => a + b, 0); $("#cartCount").textContent = n; $("#mCount").textContent = n; }
  function change(id, d) {
    const m = item(id); if (!m || m.available === false) return;
    cart[id] = Math.max(0, Math.min(50, (cart[id] || 0) + d)); if (!cart[id]) delete cart[id];
    saveCart(); renderSig(); renderMenu(); if ($("#cart").classList.contains("show")) renderCart();
    if (d > 0) toast("Added " + m.name);
  }
  function totals(memberPts) {
    const lines = Object.keys(cart).map(id => ({ m: item(id), q: cart[id] })).filter(l => l.m);
    const sub = lines.reduce((a, l) => a + l.m.price * l.q, 0);
    let disc = 0, couponMsg = "";
    if (state.coupon) {
      const o = OFFERS.find(x => x.active && x.code === state.coupon);
      if (!o) { couponMsg = "Invalid code"; }
      else if (sub < o.minOrder) { couponMsg = "Add " + inr(o.minOrder - sub) + " more to use " + o.code; }
      else { disc = o.type === "percent" ? Math.round(sub * o.value / 100) : o.value; couponMsg = o.code + " applied"; }
    }
    const fee = state.mode === "delivery" && sub > 0 && sub < C.freeDeliveryAbove ? C.deliveryFee : 0;
    let redeem = 0;
    if (state.redeem && memberPts) redeem = Math.min(Math.floor(memberPts * C.pointValue), Math.round((sub - disc) * 0.2)); // max 20% via points
    const taxable = Math.max(0, sub - disc - redeem);
    const gst = Math.round(taxable * C.gstRate);
    return { lines, sub, disc, fee, gst, redeem, total: taxable + gst + fee, couponMsg };
  }
  let memberPtsCache = 0;
  function renderCart() {
    const t = totals(memberPtsCache);
    if (!t.lines.length) {
      $("#cartBody").innerHTML = '<div class="empty" style="padding:3rem 1rem"><div style="font-size:3rem">🍚</div><p>Your handi is empty.</p><a href="#menu" class="btn btn-maroon btn-sm" data-close style="margin-top:1rem">Browse menu</a></div>';
      $("#cartFoot").innerHTML = ""; return;
    }
    const cats = new Set(t.lines.map(l => l.m.cat));
    const ups = [...new Set([].concat(...[...cats].map(c => D.pairings[c] || [])))].filter(id => !cart[id] && item(id) && item(id).available !== false).slice(0, 3);
    const opts = D.branches.map(b => '<option value="' + b.id + '"' + (S.local.get("branch") === b.id ? " selected" : "") + '>' + esc(b.city + " — " + b.name) + (isOpen(b) ? "" : " (closed now — schedule)") + '</option>').join("");
    $("#cartBody").innerHTML = t.lines.map(l => '<div class="line"><div><div class="nm">' + vg(l.m) + " " + esc(l.m.name) + '</div><small>' + inr(l.m.price) + ' each</small></div><span class="qty"><button type="button" data-dec="' + l.m.id + '">−</button><span>' + l.q + '</span><button type="button" data-inc="' + l.m.id + '">+</button></span></div>').join("") +
      (ups.length ? '<div class="upsell"><h5>Goes perfectly with</h5>' + ups.map(id => '<div class="u"><span>' + esc(item(id).name) + " · " + inr(item(id).price) + '</span><button class="add" type="button" data-inc="' + id + '">+ Add</button></div>').join("") + '</div>' : "") +
      '<div class="seg" role="group" aria-label="Order type">' + ["pickup", "delivery", "dinein"].map(m => '<button type="button" data-mode="' + m + '" aria-pressed="' + (state.mode === m) + '">' + { pickup: "Pickup", delivery: "Delivery", dinein: "Dine-in" }[m] + '</button>').join("") + '</div>' +
      '<form id="checkout" class="form" style="margin-top:1rem" novalidate>' +
      '<label class="f full">Branch<select name="branch" required>' + opts + '</select></label>' +
      '<label class="f">Name<input name="name" required maxlength="60" value="' + esc(S.local.get("name", "")) + '"></label>' +
      '<label class="f">Mobile<input name="phone" required inputmode="numeric" maxlength="10" value="' + esc(S.local.get("phone", "")) + '"></label>' +
      (state.mode === "delivery" ? '<label class="f full">Delivery address<textarea name="address" rows="2" required maxlength="250"></textarea></label>' : "") +
      '<label class="f full">Time<select name="when"><option value="asap">As soon as possible</option><option>In 30 min</option><option>In 1 hour</option><option>In 2 hours</option></select></label>' +
      '<label class="f full">Note for kitchen<input name="note" maxlength="150" placeholder="Less spicy, extra raita…"></label></form>' +
      '<div class="coupon"><input id="couponIn" placeholder="Coupon code" value="' + esc(state.coupon || "") + '" aria-label="Coupon code"><button class="btn btn-ghost btn-sm" type="button" id="applyCoupon" style="color:var(--maroon)">Apply</button></div>' +
      (t.couponMsg ? '<p class="hint">' + esc(t.couponMsg) + '</p>' : '<p class="hint">Try ' + OFFERS.filter(o => o.active).map(o => esc(o.code)).join(", ") + '</p>') +
      (memberPtsCache > 0 ? '<label style="display:flex;gap:.5rem;align-items:center;margin-top:.6rem;font-size:.88rem"><input type="checkbox" id="redeem"' + (state.redeem ? " checked" : "") + '> Use Royal Points (' + memberPtsCache + ' pts available)</label>' : "");
    $("#cartFoot").innerHTML = '<div class="sum"><span>Subtotal</span><span>' + inr(t.sub) + '</span></div>' +
      (t.disc ? '<div class="sum" style="color:var(--leaf)"><span>Discount</span><span>−' + inr(t.disc) + '</span></div>' : "") +
      (t.redeem ? '<div class="sum" style="color:var(--leaf)"><span>Royal Points</span><span>−' + inr(t.redeem) + '</span></div>' : "") +
      (state.mode === "delivery" ? '<div class="sum"><span>Delivery' + (t.fee ? "" : " (free)") + '</span><span>' + inr(t.fee) + '</span></div>' : "") +
      '<div class="sum"><span>GST (5%)</span><span>' + inr(t.gst) + '</span></div>' +
      '<div class="sum total"><span>Total</span><span>' + inr(t.total) + '</span></div>' +
      (state.mode === "delivery" && t.sub < C.freeDeliveryAbove ? '<p class="hint" style="margin:.3rem 0">Add ' + inr(C.freeDeliveryAbove - t.sub) + ' for free delivery</p>' : "") +
      '<button class="btn btn-gold btn-block" type="button" id="placeOrder" style="margin-top:.8rem">Place Order · ' + inr(t.total) + '</button>' +
      '<p class="hint" style="text-align:center;margin-top:.4rem">You earn ' + Math.floor(t.total / C.loyaltyRate) + ' Royal Points on this order</p>';
    const ph = $("#checkout [name=phone]"); if (ph && PHONE.test(ph.value)) refreshPoints(ph.value);
  }
  async function refreshPoints(phone) {
    try { const m = await memberSummary(phone); if (m.points !== memberPtsCache) { memberPtsCache = m.points; renderCart(); } } catch (e) { /* ignore */ }
  }
  async function placeOrder() {
    const f = $("#checkout"); const fd = Object.fromEntries(new FormData(f).entries());
    if (!fd.name || fd.name.trim().length < 2) return toast("Please enter your name");
    if (!PHONE.test(fd.phone || "")) return toast("Enter a valid 10-digit mobile number");
    if (state.mode === "delivery" && (!fd.address || fd.address.trim().length < 8)) return toast("Enter your delivery address");
    const t = totals(memberPtsCache); if (!t.lines.length) return;
    const b = branch(fd.branch);
    S.local.set("name", fd.name.trim()); S.local.set("phone", fd.phone); S.local.set("branch", fd.branch);
    const order = {
      id: S.uid("O"), name: fd.name.trim(), phone: fd.phone, branch: fd.branch, mode: state.mode, address: fd.address || "", when: fd.when, note: fd.note || "",
      items: t.lines.map(l => ({ id: l.m.id, name: l.m.name, price: l.m.price, qty: l.q, cat: l.m.cat })),
      subtotal: t.sub, discount: t.disc, coupon: t.disc ? state.coupon : "", pointsRedeemed: t.redeem ? Math.ceil(t.redeem / C.pointValue) : 0,
      fee: t.fee, gst: t.gst, total: t.total, status: "new", source: "website"
    };
    const btn = $("#placeOrder"); btn.disabled = true; btn.textContent = "Placing order…";
    try {
      const saved = await S.add("order", order);
      const msg = "🍚 *New Niyaaz order " + saved.id + "*\n" + b.city + " — " + b.name + "\n" + { pickup: "Pickup", delivery: "Delivery", dinein: "Dine-in" }[state.mode] + " · " + (fd.when === "asap" ? "ASAP" : fd.when) + "\n\n" +
        order.items.map(i => i.qty + " × " + i.name + " — " + inr(i.price * i.qty)).join("\n") + "\n\nTotal: " + inr(order.total) + "\nName: " + order.name + "\nMobile: " + order.phone + (order.address ? "\nAddress: " + order.address : "") + (order.note ? "\nNote: " + order.note : "");
      cart = {}; saveCart(); state.coupon = null; state.redeem = false; memberPtsCache = 0; closeAll(); renderSig(); renderMenu();
      modal('<div style="text-align:center"><div style="font-size:3rem">✅</div><h3 id="modalTitle">Order placed!</h3><p>Your order ID is</p><p style="font-family:var(--display);font-size:2.2rem;color:var(--maroon);font-weight:700;letter-spacing:.05em">' + esc(saved.id) + '</p>' +
        '<p class="hint" style="margin:.6rem 0 1.2rem">Tap below to send it to the branch on WhatsApp for instant confirmation. You earned <b>' + Math.floor(order.total / C.loyaltyRate) + ' Royal Points</b>.</p>' +
        '<a class="btn btn-gold btn-block" target="_blank" rel="noopener" href="' + esc(waLink(C.orderWhatsApp, msg)) + '">Confirm on WhatsApp</a>' +
        '<button class="btn btn-ghost btn-block" type="button" data-close style="margin-top:.6rem;color:var(--maroon)">Done</button></div>');
    } catch (e) { console.error(e); toast("Could not place order. Please call the branch."); btn.disabled = false; btn.textContent = "Place Order"; }
  }

  /* ---------------- Royal Club ---------------- */
  async function memberSummary(phone) {
    if (S.mode === "cloud" && S.memberSummary) return S.memberSummary(phone);
    const orders = (await S.list("order")).filter(o => o.phone === phone && o.status !== "cancelled");
    const spend = orders.reduce((a, o) => a + (o.total || 0), 0);
    const redeemed = orders.reduce((a, o) => a + (o.pointsRedeemed || 0), 0);
    const tier = spend >= 15000 ? "Badshah" : spend >= 5000 ? "Nawab" : "Shehzada";
    const mult = tier === "Badshah" ? 1.5 : tier === "Nawab" ? 1.25 : 1;
    const points = Math.max(0, Math.floor(orders.reduce((a, o) => a + Math.floor((o.total || 0) / C.loyaltyRate), 0) * mult) - redeemed);
    return { phone, orders: orders.length, spend, tier, points, next: tier === "Badshah" ? 0 : (tier === "Nawab" ? 15000 : 5000) - spend };
  }

  /* ---------------- Branches ---------------- */
  function renderBranches() {
    const cities = ["all"].concat([...new Set(D.branches.map(b => b.city))]);
    $("#cityTabs").innerHTML = cities.map(c => '<button class="chip" type="button" data-city="' + esc(c) + '" aria-pressed="' + (state.city === c) + '">' + (c === "all" ? "All cities" : esc(c)) + '</button>').join("");
    $("#brGrid").innerHTML = D.branches.filter(b => state.city === "all" || b.city === state.city).map(b => {
      const open = isOpen(b);
      const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Niyaaz Restaurant " + b.address);
      return '<article class="br"><span class="city">' + esc(b.city) + '</span><h3>' + esc(b.name) + (b.flagship ? '<span class="flag">FLAGSHIP</span>' : "") + '</h3>' +
        '<span class="status ' + (open ? "open" : "closed") + '">' + (open ? "Open now" : "Closed") + " · " + fmt12(b.open) + "–" + fmt12(b.close) + '</span>' +
        '<p class="addr">' + esc(b.address) + '</p><div class="acts">' +
        '<a class="btn btn-maroon btn-sm" target="_blank" rel="noopener" href="' + esc(maps) + '">Directions</a>' +
        (b.phone ? '<a class="btn btn-ghost btn-sm" href="tel:' + esc(b.phone) + '" style="color:var(--maroon)">Call</a>' : "") +
        '<button class="btn btn-ghost btn-sm" type="button" data-orderfrom="' + b.id + '" style="color:var(--maroon)">Order here</button></div></article>';
    }).join("");
  }

  /* ---------------- Modal / drawer ---------------- */
  function openCart() { renderCart(); $("#cart").classList.add("show"); $("#cart").setAttribute("aria-hidden", "false"); $("#scrim").classList.add("show"); }
  function modal(html) { $("#modalBody").innerHTML = html; $("#modal").classList.add("show"); $("#scrim").classList.add("show"); const b = $("#modal a, #modal button"); if (b) b.focus(); }
  function closeAll() { $("#cart").classList.remove("show"); $("#cart").setAttribute("aria-hidden", "true"); $("#modal").classList.remove("show"); $("#scrim").classList.remove("show"); }

  /* ---------------- Forms ---------------- */
  function fillBranchSelects() {
    const opts = D.branches.map(b => '<option value="' + b.id + '">' + esc(b.city + " — " + b.name) + '</option>').join("");
    $("#resBranch").innerHTML = opts; $("#fbBranch").innerHTML = opts;
  }
  function timeSlots() {
    const out = []; for (let h = 12; h <= 22; h++) for (const m of [0, 30]) { if (h === 22 && m === 30) continue; out.push(String(h).padStart(2, "0") + ":" + (m ? "30" : "00")); }
    $("#resTime").innerHTML = out.map(t => '<option value="' + t + '">' + fmt12(t) + '</option>').join("");
    $("#resDate").min = today(0); $("#resDate").value = today(0); $("#resDate").max = today(60);
    $("#catDate").min = today(1);
  }
  let pkg = D.cateringPackages[1].id;
  function renderCatering() {
    $("#pkgGrid").innerHTML = D.cateringPackages.map(p => '<button type="button" class="pkg" data-pkg="' + p.id + '" aria-pressed="' + (pkg === p.id) + '"><b>' + esc(p.name) + ' · ' + inr(p.perPlate) + '/plate</b><small>' + esc(p.includes) + '</small></button>').join("");
    const g = +$("#guests").value, p = D.cateringPackages.find(x => x.id === pkg);
    const disc = g >= 500 ? 0.12 : g >= 250 ? 0.08 : g >= 150 ? 0.05 : 0;
    const est = Math.round(g * p.perPlate * (1 - disc));
    $("#guestsOut").textContent = g + " guests"; $("#estOut").textContent = inr(est);
    $("#estNote").textContent = disc ? "Includes " + Math.round(disc * 100) + "% volume discount" : "Volume discounts from 150 guests";
    return { guests: g, pkg: p, estimate: est };
  }

  function bind() {
    document.addEventListener("click", e => {
      const t = e.target.closest("[data-inc],[data-dec],[data-cat],[data-city],[data-open],[data-close],[data-mode],[data-pkg],[data-orderfrom],#placeOrder,#applyCoupon,#vegOnly,#sigOnly");
      if (!t) return;
      if (t.dataset.inc) change(t.dataset.inc, 1);
      else if (t.dataset.dec) change(t.dataset.dec, -1);
      else if (t.dataset.cat) { state.cat = t.dataset.cat; renderCats(); renderMenu(); }
      else if (t.dataset.city) { state.city = t.dataset.city; renderBranches(); }
      else if (t.dataset.open === "cart") openCart();
      else if (t.hasAttribute("data-close")) closeAll();
      else if (t.dataset.mode) { state.mode = t.dataset.mode; renderCart(); }
      else if (t.dataset.pkg) { pkg = t.dataset.pkg; renderCatering(); }
      else if (t.dataset.orderfrom) { S.local.set("branch", t.dataset.orderfrom); document.getElementById("menu").scrollIntoView(); toast("Ordering from " + branch(t.dataset.orderfrom).name); }
      else if (t.id === "placeOrder") placeOrder();
      else if (t.id === "applyCoupon") { state.coupon = ($("#couponIn").value || "").trim().toUpperCase() || null; renderCart(); }
      else if (t.id === "vegOnly") { state.veg = !state.veg; t.setAttribute("aria-pressed", state.veg); renderMenu(); }
      else if (t.id === "sigOnly") { state.sig = !state.sig; t.setAttribute("aria-pressed", state.sig); renderMenu(); }
    });
    $("#scrim").addEventListener("click", closeAll);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });
    document.addEventListener("change", e => {
      if (e.target.id === "redeem") { state.redeem = e.target.checked; renderCart(); }
      if (e.target.name === "phone" && e.target.closest("#checkout") && PHONE.test(e.target.value)) refreshPoints(e.target.value);
    });
    $("#q").addEventListener("input", e => { state.q = e.target.value; renderMenu(); });
    $("#guests").addEventListener("input", renderCatering);
    $("#lang").addEventListener("change", e => setLang(e.target.value));
    $("#menuToggle").addEventListener("click", () => { const o = $("#navLinks").classList.toggle("open"); $("#menuToggle").setAttribute("aria-expanded", o); });
    $$("#navLinks a").forEach(a => a.addEventListener("click", () => $("#navLinks").classList.remove("open")));
    $$("footer [data-city]").forEach(a => a.addEventListener("click", () => { state.city = a.dataset.city; renderBranches(); }));

    $("#resForm").addEventListener("submit", async e => {
      e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target).entries());
      if (!fd.name || !PHONE.test(fd.phone) || !fd.date) return toast("Please fill name, valid mobile and date");
      const b = branch(fd.branch);
      try {
        const r = await S.add("reservation", Object.assign(fd, { status: "requested" }));
        e.target.reset(); timeSlots();
        const msg = "🪑 Table request " + r.id + "\n" + b.city + " — " + b.name + "\n" + fd.date + " at " + fmt12(fd.time) + " · " + fd.guests + " guests" + (fd.occasion ? " · " + fd.occasion : "") + "\nName: " + fd.name + " (" + fd.phone + ")";
        modal('<div style="text-align:center"><div style="font-size:3rem">🪑</div><h3 id="modalTitle">Table requested</h3><p>Booking reference <b>' + esc(r.id) + '</b></p><p class="hint" style="margin:.6rem 0 1.2rem">' + esc(b.name) + ' · ' + esc(fd.date) + ' · ' + esc(fmt12(fd.time)) + ' · ' + esc(fd.guests) + ' guests</p><a class="btn btn-gold btn-block" target="_blank" rel="noopener" href="' + esc(waLink(C.orderWhatsApp, msg)) + '">Get WhatsApp confirmation</a><button class="btn btn-ghost btn-block" type="button" data-close style="margin-top:.6rem;color:var(--maroon)">Done</button></div>');
      } catch (err) { toast("Could not save booking. Please call the branch."); }
    });

    $("#catForm").addEventListener("submit", async e => {
      e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target).entries());
      if (!fd.name || !PHONE.test(fd.phone) || !fd.date) return toast("Please fill name, valid mobile and event date");
      const c = renderCatering();
      try {
        const r = await S.add("catering", Object.assign(fd, { guests: c.guests, package: c.pkg.name, perPlate: c.pkg.perPlate, estimate: c.estimate, status: "new" }));
        e.target.reset();
        modal('<div style="text-align:center"><div style="font-size:3rem">🎊</div><h3 id="modalTitle">Request received</h3><p>Reference <b>' + esc(r.id) + '</b></p><p class="hint" style="margin:.6rem 0 1.2rem">Our events team will call you within 2 hours with a final quote for ' + c.guests + ' guests (' + esc(c.pkg.name) + ', est. ' + inr(c.estimate) + ').</p><button class="btn btn-maroon btn-block" type="button" data-close>Done</button></div>');
      } catch (err) { toast("Could not send. Please call us."); }
    });

    $("#memberForm").addEventListener("submit", async e => {
      e.preventDefault(); const phone = new FormData(e.target).get("phone");
      if (!PHONE.test(phone)) return toast("Enter a valid 10-digit mobile number");
      const m = await memberSummary(phone);
      if (!m.orders) { try { await S.add("member", { phone, joined: new Date().toISOString() }); } catch (err) {} }
      $("#memberOut").innerHTML = '<div class="member-card"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-family:var(--display);font-size:1.5rem">NIYAAZ ROYAL</b><span style="font-weight:800;letter-spacing:.1em">' + esc(m.tier.toUpperCase()) + '</span></div>' +
        '<div style="margin:1.2rem 0 .3rem;font-size:.8rem">Points balance</div><div class="pts">' + m.points + '</div><div style="font-size:.82rem;margin-top:.6rem">' +
        (m.orders ? m.orders + " orders · " + inr(m.spend) + " lifetime" : "Welcome! You're in. Place your first order to start earning.") +
        (m.next > 0 && m.orders ? "<br>" + inr(m.next) + " more to the next tier" : "") + '</div><div style="margin-top:1rem;font-size:.78rem;letter-spacing:.2em">•••• ' + esc(phone.slice(-4)) + '</div></div>';
    });

    $("#trackForm").addEventListener("submit", async e => {
      e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target).entries());
      const id = (fd.id || "").trim().toUpperCase();
      if (!id || !/^\d{4}$/.test(fd.last4 || "")) return toast("Enter order ID and last 4 digits");
      let o = null; try { o = await S.findOrder(id, fd.last4); } catch (err) {}
      if (!o) { $("#trackOut").innerHTML = '<p class="hint" style="color:var(--chili)">No order found. Check the ID and number.</p>'; return; }
      const steps = ["new", "preparing", "ready", "completed"], labels = ["Received", "On dum", o.mode === "delivery" ? "Out for delivery" : "Ready", "Done"];
      const idx = o.status === "cancelled" ? -1 : steps.indexOf(o.status);
      $("#trackOut").innerHTML = '<p><b>' + esc(o.id) + '</b> · ' + esc((branch(o.branch) || {}).name || "") + ' · ' + inr(o.total) + '</p>' +
        (idx < 0 ? '<p style="color:var(--chili);font-weight:700">This order was cancelled.</p>' :
          '<div class="track-steps">' + labels.map((l, i) => '<div class="' + (i <= idx ? "done" : "") + '"><i>' + (i <= idx ? "✓" : i + 1) + '</i>' + l + '</div>').join("") + '</div>');
    });

    $("#fbForm").addEventListener("submit", async e => {
      e.preventDefault(); if (!state.rating) return toast("Tap a star rating first");
      const fd = Object.fromEntries(new FormData(e.target).entries());
      if (fd.phone && !PHONE.test(fd.phone)) return toast("Mobile number looks wrong");
      try {
        await S.add("feedback", Object.assign(fd, { rating: state.rating, status: state.rating <= 3 ? "needs-action" : "ok" }));
        e.target.reset(); const r = state.rating; state.rating = 0; renderStars();
        // Ask EVERYONE for a public review (review-gating violates Google policy)
        modal('<div style="text-align:center"><div style="font-size:3rem">' + (r >= 4 ? "🙏" : "🤝") + '</div><h3 id="modalTitle">' + (r >= 4 ? "Thank you!" : "Thank you for telling us") + '</h3><p class="hint" style="margin:.6rem 0 1.2rem">' +
          (r >= 4 ? "Would you share it on Google? It helps other families find the original." : "A manager will personally look into this. If you wish, you can also leave a public review.") + '</p>' +
          '<a class="btn btn-gold btn-block" target="_blank" rel="noopener" href="' + esc(C.googleReviewUrl) + '">Review on Google</a><button class="btn btn-ghost btn-block" type="button" data-close style="margin-top:.6rem;color:var(--maroon)">Close</button></div>');
      } catch (err) { toast("Could not send feedback."); }
    });
  }

  function renderStars() {
    $("#stars").innerHTML = [1, 2, 3, 4, 5].map(n => '<button type="button" role="radio" aria-checked="' + (state.rating === n) + '" aria-label="' + n + ' star" class="' + (n <= state.rating ? "on" : "") + '" data-star="' + n + '">★</button>').join("");
    $$("#stars [data-star]").forEach(b => b.addEventListener("click", () => { state.rating = +b.dataset.star; renderStars(); }));
  }
  function renderQuotes() {
    // Illustrative placeholders — replace with REAL, permissioned guest quotes before launch.
    const q = [["The dum biryani is exactly how I remember it from childhood.", "Guest, Belagavi"], ["Ordered a family handi for Eid — the whole family asked where it was from.", "Guest, Kolhapur"], ["Kebab platter and phirni. Every single visit.", "Guest, Goa"]];
    $("#quotes").innerHTML = q.map(x => '<blockquote class="quote"><p>“' + esc(x[0]) + '”</p><span>— ' + esc(x[1]) + '</span></blockquote>').join("");
  }
  function renderTimeline() { $("#timeline").innerHTML = D.timeline.map(t => '<li><b>' + esc(t.year) + '</b>' + esc(t.text) + '</li>').join(""); }

  function seo() {
    const ld = { "@context": "https://schema.org", "@graph": D.branches.map(b => ({
      "@type": "Restaurant", name: "Niyaaz — " + b.name, servesCuisine: ["Biryani", "Mughlai", "Awadhi", "North Indian"], priceRange: "₹₹", foundingDate: "1989",
      address: { "@type": "PostalAddress", streetAddress: b.address, addressLocality: b.city, addressCountry: "IN" },
      geo: { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng }, telephone: b.phone || undefined,
      openingHours: "Mo-Su " + b.open + "-" + b.close, url: "https://niyaaz.in/", acceptsReservations: true, hasMenu: "https://niyaaz.in/#menu" })) };
    $("#ld").textContent = JSON.stringify(ld);
  }
  function reveal() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach(el => el.classList.add("in")); return; }
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .12 });
    $$(".reveal:not(.in)").forEach(el => io.observe(el));
  }

  async function init() {
    try { settings = await S.getSettings() || {}; } catch (e) { settings = {}; }
    applySettings();
    $("#yr").textContent = new Date().getFullYear();
    $("#yrs").textContent = new Date().getFullYear() - C.since;
    $("#brCount").textContent = D.branches.length;
    renderSig(); renderCats(); renderMenu(); renderTimeline(); renderBranches(); fillBranchSelects(); timeSlots(); renderCatering(); renderStars(); renderQuotes(); seo(); saveCart(); bind();
    const l = S.local.get("lang", "en"); $("#lang").value = l; if (l !== "en") setLang(l);
    reveal(); new MutationObserver(reveal).observe($("#sigGrid"), { childList: true });
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
    setInterval(renderBranches, 60000);
  }
  init();
})();
