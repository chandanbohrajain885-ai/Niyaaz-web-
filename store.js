/* =========================================================================
   NIYAAZ — DATA LAYER
   One API, two engines:
   • DEMO  (default): browser localStorage. Works offline, zero setup. Data is
     per-device — an order placed on a phone is NOT visible on the manager's laptop.
   • CLOUD: Supabase (set supabaseUrl + supabaseAnonKey in data.js and run
     supabase-schema.sql). Orders from any device reach the dashboard.
   ========================================================================= */
(function () {
  const CFG = window.NIYAAZ.config;
  const LS = "niyaaz_v1_";
  const KINDS = ["order", "reservation", "catering", "feedback", "member", "settings"];
  const cloud = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase);
  const sb = cloud ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey) : null;

  function safeGet(k, fallback) {
    try { const v = localStorage.getItem(LS + k); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function safeSet(k, v) {
    try { localStorage.setItem(LS + k, JSON.stringify(v)); return true; }
    catch (e) { console.warn("Storage unavailable", e); return false; }
  }

  function uid(prefix) {
    const rnd = (crypto && crypto.getRandomValues)
      ? Array.from(crypto.getRandomValues(new Uint8Array(3))).map(b => b.toString(16).padStart(2, "0")).join("")
      : Math.random().toString(16).slice(2, 8);
    return (prefix || "N") + Date.now().toString(36).slice(-4).toUpperCase() + rnd.toUpperCase();
  }

  // Strip anything that is not plain data, and cap lengths (defence in depth).
  function clean(obj) {
    if (typeof obj === "string") return obj.slice(0, 1000);
    if (Array.isArray(obj)) return obj.slice(0, 200).map(clean);
    if (obj && typeof obj === "object") {
      const out = {};
      Object.keys(obj).slice(0, 60).forEach(k => { out[k] = clean(obj[k]); });
      return out;
    }
    return obj;
  }

  const Store = {
    mode: cloud ? "cloud" : "demo",
    uid,

    async add(kind, data) {
      if (!KINDS.includes(kind)) throw new Error("Unknown kind");
      const rec = clean(Object.assign({}, data, { id: data.id || uid(kind[0].toUpperCase()), kind, createdAt: data.createdAt || new Date().toISOString() }));
      if (cloud) {
        const { error } = await sb.from("niyaaz_records").insert({ id: rec.id, kind, data: rec });
        if (error) throw error;
      } else {
        const all = safeGet(kind, []); all.push(rec); safeSet(kind, all);
      }
      return rec;
    },

    async list(kind) {
      if (cloud) {
        const { data, error } = await sb.from("niyaaz_records").select("data").eq("kind", kind).order("created_at", { ascending: false }).limit(2000);
        if (error) throw error;
        return data.map(r => r.data);
      }
      return safeGet(kind, []).slice().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    },

    async update(kind, id, patch) {
      if (cloud) {
        const { data, error } = await sb.from("niyaaz_records").select("data").eq("id", id).single();
        if (error) throw error;
        const next = clean(Object.assign({}, data.data, patch, { updatedAt: new Date().toISOString() }));
        const r = await sb.from("niyaaz_records").update({ data: next }).eq("id", id);
        if (r.error) throw r.error;
        return next;
      }
      const all = safeGet(kind, []);
      const i = all.findIndex(r => r.id === id);
      if (i < 0) return null;
      all[i] = clean(Object.assign({}, all[i], patch, { updatedAt: new Date().toISOString() }));
      safeSet(kind, all);
      return all[i];
    },

    async remove(kind, id) {
      if (cloud) { const { error } = await sb.from("niyaaz_records").delete().eq("id", id); if (error) throw error; return; }
      safeSet(kind, safeGet(kind, []).filter(r => r.id !== id));
    },

    // Public order tracking (customer knows the ID + phone last 4)
    async findOrder(id, phoneLast4) {
      if (cloud) {
        const { data, error } = await sb.rpc("niyaaz_track_order", { p_id: id, p_last4: phoneLast4 });
        if (error) throw error;
        return data;
      }
      const o = safeGet("order", []).find(r => r.id === id);
      if (!o || String(o.phone || "").slice(-4) !== String(phoneLast4)) return null;
      return { id: o.id, status: o.status, branch: o.branch, total: o.total, createdAt: o.createdAt, mode: o.mode };
    },

    // Royal Club balance (cloud mode uses a server function; demo mode computed in app.js)
    memberSummary: cloud ? async function (phone) {
      const { data, error } = await sb.rpc("niyaaz_member", { p_phone: phone });
      if (error) throw error;
      return data;
    } : null,

    // Settings overrides set by admin (menu availability/price, offers)
    async getSettings() {
      if (cloud) {
        const { data } = await sb.from("niyaaz_records").select("data").eq("id", "settings").maybeSingle();
        return (data && data.data) || {};
      }
      return safeGet("settings_obj", {});
    },
    async saveSettings(s) {
      const rec = clean(Object.assign({}, s, { id: "settings", kind: "settings" }));
      if (cloud) {
        const { error } = await sb.from("niyaaz_records").upsert({ id: "settings", kind: "settings", data: rec });
        if (error) throw error;
      } else safeSet("settings_obj", rec);
      return rec;
    },

    // Local-only conveniences (cart, member phone) — never sent anywhere
    local: { get: safeGet, set: safeSet },

    // Admin auth
    async adminLogin(emailOrPin, password) {
      if (cloud) {
        const { error } = await sb.auth.signInWithPassword({ email: emailOrPin, password });
        if (error) throw error;
        return true;
      }
      const ok = await sha256(emailOrPin) === await sha256(CFG.demoAdminPin);
      if (ok) sessionStorage.setItem(LS + "admin", "1");
      return ok;
    },
    async isAdmin() {
      if (cloud) { const { data } = await sb.auth.getSession(); return !!(data && data.session); }
      try { return sessionStorage.getItem(LS + "admin") === "1"; } catch (e) { return false; }
    },
    async adminLogout() {
      if (cloud) await sb.auth.signOut();
      try { sessionStorage.removeItem(LS + "admin"); } catch (e) {}
    },

    wipeDemo() { KINDS.concat(["settings_obj"]).forEach(k => { try { localStorage.removeItem(LS + k); } catch (e) {} }); }
  };

  async function sha256(s) {
    if (!(crypto && crypto.subtle)) return String(s);
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(s)));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // Shared helpers
  window.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  };
  window.inr = function (n) { return "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN"); };
  window.NStore = Store;
})();
