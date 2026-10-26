/* Owner admin panel. Opens at #admin. Edits JL.data and re-renders the site live.
   Demo storage is this browser only; a launch build swaps JL.save for a real database. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { esc, rupee } = JL;
  const PKEY = "jl_admin_pin", SKEY = "jl_admin_ok";
  const root = $("#adminRoot");
  let tab = "dash", dirty = false;

  const ICONS = ["kundli", "rings", "hand", "house", "brief", "cal", "lotus", "planet", "moon", "sun", "shield"];
  const SCHEMA = {
    services: { label: "Services", one: "service", fields: [["title", "Title"], ["hi", "Hindi name"], ["desc", "Description", "area"], ["price", "Fee (₹)", "num"], ["mins", "Minutes", "num"], ["icon", "Icon", "icon"], ["img", "Photo", "img"]] },
    pujas: { label: "Pujas", one: "puja", fields: [["title", "Title"], ["sub", "Subtitle / date"], ["desc", "Description", "area"], ["price", "Dakshina (₹)", "num"], ["tag", "Badge (e.g. Popular)"], ["img", "Photo", "img"]] },
    products: { label: "Remedies", one: "item", fields: [["title", "Title"], ["desc", "Description", "area"], ["price", "Starting price (₹, 0 = on request)", "num"], ["img", "Photo", "img"]] },
    blog: { label: "Blog", one: "article", fields: [["title", "Title"], ["date", "Date", "date"], ["excerpt", "Short summary", "area"], ["body", "Full article", "long"], ["img", "Cover photo", "img"]] },
    testimonials: { label: "Reviews", one: "review", fields: [["name", "Client name"], ["city", "City"], ["rating", "Stars (1 to 5)", "num"], ["text", "Review", "area"], ["sample", "Mark as sample", "bool"]] }
  };
  const TABS = [["dash", "Overview"], ["bookings", "Bookings"], ["services", "Services"], ["pujas", "Pujas"], ["products", "Remedies"], ["rashifal", "Rashifal"], ["blog", "Blog"], ["testimonials", "Reviews"], ["gallery", "Gallery"], ["biz", "Business info"], ["slots", "Timings"], ["data", "Backup"]];

  function pin() { try { return localStorage.getItem(PKEY) || "1234"; } catch (e) { return "1234"; } }
  function authed() { try { return sessionStorage.getItem(SKEY) === "1"; } catch (e) { return false; } }

  function open() { root.classList.add("on"); document.body.classList.add("lock"); authed() ? shell() : login(); }
  function close() { root.classList.remove("on"); root.innerHTML = ""; if (!$("#modal").classList.contains("on")) document.body.classList.remove("lock"); if (location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search); }
  function route() { location.hash === "#admin" ? open() : root.classList.contains("on") && close(); }
  addEventListener("hashchange", route);

  function login() {
    root.innerHTML = `<div class="ad-login"><form class="ad-card" id="adLogin">
      <img src="img/logo.png" alt="" width="64" height="64"><h2>Owner login</h2><p>Manage bookings, services, pujas, rashifal and photos.</p>
      <label for="adPin">PIN</label><input id="adPin" class="inp" type="password" inputmode="numeric" maxlength="8" autocomplete="current-password" placeholder="Demo PIN is 1234">
      <div class="err" id="adErr" role="alert"></div>
      <button class="btn btn-blue" style="width:100%">Open dashboard</button>
      <a href="#" class="ad-link" id="adBack">Back to website</a></form></div>`;
    setTimeout(() => $("#adPin").focus(), 50);
    $("#adBack").onclick = e => { e.preventDefault(); close(); };
    $("#adLogin").onsubmit = e => {
      e.preventDefault();
      if ($("#adPin").value === pin()) { try { sessionStorage.setItem(SKEY, "1"); } catch (x) { } shell(); }
      else { $("#adErr").textContent = "That PIN is not right."; $(".ad-card").animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }], { duration: 300 }); }
    };
  }

  function shell() {
    root.innerHTML = `<div class="ad">
      <aside class="ad-side"><div class="ad-brand"><img src="img/logo.png" alt=""><div><b>Jyotish Lok</b><small>Owner dashboard</small></div></div>
        <nav class="ad-tabs">${TABS.map(([k, n]) => `<button data-tab="${k}" aria-current="${k === tab}">${n}${k === "bookings" ? `<span class="ad-count" id="adBkCount"></span>` : ""}</button>`).join("")}</nav>
        <a class="btn btn-line btn-sm" href="#" id="adExit">View website</a></aside>
      <section class="ad-main"><header class="ad-head"><h2 id="adTitle"></h2><div class="ad-acts" id="adActs"></div></header><div id="adBody"></div>
      <p class="ad-note">Demo mode: changes are saved in this browser only. The live version connects to a secure online database so edits show for every visitor.</p></section></div>`;
    $$(".ad-tabs button").forEach(b => b.onclick = () => { tab = b.dataset.tab; $$(".ad-tabs button").forEach(x => x.setAttribute("aria-current", x === b)); draw(); });
    $("#adExit").onclick = e => { e.preventDefault(); close(); };
    draw();
  }

  function count() { const n = JL.bookings().filter(b => b.status === "New").length; const el = $("#adBkCount"); if (el) el.textContent = n || ""; }
  function acts(html) { $("#adActs").innerHTML = html || ""; }
  function commit(msg) { if (JL.save()) { JL.renderAll(); JL.toast(msg || "Saved. The website is updated."); } }

  function draw() {
    const T = TABS.find(t => t[0] === tab); $("#adTitle").textContent = T[1]; acts(""); count();
    const body = $("#adBody");
    if (tab === "dash") return dash(body);
    if (tab === "bookings") return bookings(body);
    if (SCHEMA[tab]) return list(body, tab);
    if (tab === "rashifal") return rashifal(body);
    if (tab === "gallery") return gallery(body);
    if (tab === "biz") return biz(body);
    if (tab === "slots") return slots(body);
    if (tab === "data") return backup(body);
  }

  /* overview */
  function dash(body) {
    const bk = JL.bookings(), today = JL.ymd(new Date());
    const up = bk.filter(b => b.date && b.date >= today && b.status !== "Cancelled").sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));
    const value = bk.filter(b => b.status !== "Cancelled").reduce((a, b) => a + (+b.price || 0), 0);
    body.innerHTML = `<div class="ad-kpis">
      ${[["New requests", bk.filter(b => b.status === "New").length], ["Today", bk.filter(b => b.date === today).length], ["Upcoming", up.length], ["Booking value", rupee(value)]].map(([a, b]) => `<div class="ad-kpi"><small>${a}</small><b>${b}</b></div>`).join("")}</div>
      <h3 class="ad-h3">Next appointments</h3>
      ${up.length ? `<div class="ad-list">${up.slice(0, 6).map(row).join("")}</div>` : `<div class="ad-empty">No upcoming appointments yet. Bookings made on the website appear here instantly.</div>`}
      <h3 class="ad-h3">Quick actions</h3>
      <div class="ad-quick">${[["rashifal", "Write today's rashifal"], ["pujas", "Add a new puja"], ["blog", "Publish an article"], ["biz", "Change announcement"]].map(([k, n]) => `<button class="btn btn-line" data-go="${k}">${n}</button>`).join("")}</div>`;
    $$("[data-go]", body).forEach(b => b.onclick = () => $(`.ad-tabs [data-tab="${b.dataset.go}"]`).click());
    bindRows(body);
  }
  const nice = b => b.date ? new Date(b.date + "T12:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + (b.slot ? " · " + b.slot : "") : "Date to confirm";
  function row(b) {
    return `<div class="ad-row" data-id="${esc(b.id)}"><div class="ad-row-main"><b>${esc(b.name)}</b><span>${esc(b.service)} · ${esc(b.mode)}</span><small>${esc(b.id)} · ${nice(b)}${b.note ? " · " + esc(b.note) : ""}</small></div>
      <div class="ad-row-acts"><select class="inp ad-status" aria-label="Status">${["New", "Confirmed", "Done", "Cancelled"].map(s => `<option${s === b.status ? " selected" : ""}>${s}</option>`).join("")}</select>
      <a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="https://wa.me/91${esc(b.phone)}?text=${encodeURIComponent("Namaste " + b.name + ", this is Jyotish Lok about your booking " + b.id + " (" + b.service + ", " + nice(b) + ").")}">WhatsApp</a>
      <button class="btn btn-line btn-sm ad-del" aria-label="Delete booking">Delete</button></div></div>`;
  }
  function bindRows(body) {
    $$(".ad-row", body).forEach(r => {
      const id = r.dataset.id;
      $(".ad-status", r).onchange = e => { const l = JL.bookings(); const b = l.find(x => x.id === id); b.status = e.target.value; JL.setBookings(l); count(); JL.toast("Status updated"); };
      $(".ad-del", r).onclick = () => { if (!confirm("Delete this booking?")) return; JL.setBookings(JL.bookings().filter(x => x.id !== id)); draw(); };
    });
  }

  /* bookings */
  function bookings(body) {
    acts(`<button class="btn btn-line btn-sm" id="adCsv">Download CSV</button>`);
    const all = JL.bookings();
    body.innerHTML = `<div class="ad-filter"><input class="inp" id="adQ" placeholder="Search name, phone or booking ID"><select class="inp" id="adF"><option value="">All</option><option>New</option><option>Confirmed</option><option>Done</option><option>Cancelled</option></select></div><div class="ad-list" id="adRows"></div>`;
    const paint = () => {
      const q = $("#adQ").value.toLowerCase(), f = $("#adF").value;
      const l = all.filter(b => (!f || b.status === f) && (!q || (b.name + b.phone + b.id + b.service).toLowerCase().includes(q)));
      $("#adRows").innerHTML = l.length ? l.map(row).join("") : `<div class="ad-empty">No bookings yet. Try booking a slot on the website, then come back here.</div>`;
      bindRows($("#adRows"));
    };
    $("#adQ").oninput = paint; $("#adF").onchange = paint; paint();
    $("#adCsv").onclick = () => {
      const cols = ["id", "type", "service", "price", "date", "slot", "mode", "name", "phone", "note", "status", "created"];
      const csv = [cols.join(",")].concat(JL.bookings().map(b => cols.map(c => `"${String(b[c] == null ? "" : b[c]).replace(/"/g, '""')}"`).join(","))).join("\n");
      dl("jyotish-lok-bookings.csv", "text/csv", csv);
    };
  }

  /* generic collection editor */
  function list(body, key) {
    const S = SCHEMA[key], items = JL.data[key];
    acts(`<button class="btn btn-blue btn-sm" id="adAdd">Add ${S.one}</button>`);
    body.innerHTML = `<div class="ad-items">${items.map((it, i) => item(S, it, i, items.length)).join("")}</div>`;
    $("#adAdd").onclick = () => {
      const blank = { id: key[0] + Date.now().toString(36) }; S.fields.forEach(([f, , t]) => blank[f] = t === "num" ? 0 : t === "bool" ? false : t === "img" ? "img/diya.jpg" : t === "date" ? JL.ymd(new Date()) : t === "icon" ? "kundli" : "");
      if (key === "testimonials") blank.rating = 5;
      items.unshift(blank); commit("Added. Fill in the details below."); draw();
    };
    $$(".ad-item", body).forEach(card => {
      const i = +card.dataset.i, it = items[i];
      $$("[data-f]", card).forEach(inp => inp.addEventListener(inp.type === "checkbox" || inp.tagName === "SELECT" ? "change" : "input", () => {
        const t = inp.dataset.t; it[inp.dataset.f] = t === "num" ? Number(inp.value) : t === "bool" ? inp.checked : inp.value; schedule();
      }));
      $$("input[type=file]", card).forEach(fi => fi.onchange = () => readImg(fi.files[0], url => { it[fi.dataset.img] = url; $(`img[data-prev="${fi.dataset.img}"]`, card).src = url; commit("Photo updated"); }));
      $(".ad-up", card).onclick = () => { if (i > 0) { [items[i - 1], items[i]] = [items[i], items[i - 1]]; commit("Moved"); draw(); } };
      $(".ad-down", card).onclick = () => { if (i < items.length - 1) { [items[i + 1], items[i]] = [items[i], items[i + 1]]; commit("Moved"); draw(); } };
      $(".ad-rm", card).onclick = () => { if (confirm("Remove this " + S.one + "?")) { items.splice(i, 1); commit("Removed"); draw(); } };
    });
  }
  function item(S, it, i, n) {
    const f = S.fields.map(([k, label, t]) => {
      const v = it[k] == null ? "" : it[k];
      if (t === "img") return `<div class="ad-img"><img data-prev="${k}" src="${esc(v)}" alt=""><label class="btn btn-line btn-sm">Change photo<input type="file" accept="image/*" data-img="${k}" hidden></label></div>`;
      if (t === "area" || t === "long") return `<label class="ad-f ad-wide"><span>${label}</span><textarea class="inp" rows="${t === "long" ? 8 : 3}" data-f="${k}">${esc(v)}</textarea></label>`;
      if (t === "icon") return `<label class="ad-f"><span>${label}</span><select class="inp" data-f="${k}">${ICONS.map(x => `<option${x === v ? " selected" : ""}>${x}</option>`).join("")}</select></label>`;
      if (t === "bool") return `<label class="ad-f ad-check"><input type="checkbox" data-f="${k}" data-t="bool" ${v !== false ? "checked" : ""}><span>${label}</span></label>`;
      return `<label class="ad-f"><span>${label}</span><input class="inp" ${t === "num" ? 'type="number" min="0"' : t === "date" ? 'type="date"' : ""} data-f="${k}" data-t="${t || ""}" value="${esc(v)}"></label>`;
    }).join("");
    return `<article class="ad-item" data-i="${i}"><div class="ad-item-bar"><b>${esc(it.title || it.name || "Untitled")}</b><span><button class="ad-ic ad-up" ${i === 0 ? "disabled" : ""} aria-label="Move up">↑</button><button class="ad-ic ad-down" ${i === n - 1 ? "disabled" : ""} aria-label="Move down">↓</button><button class="ad-ic ad-rm" aria-label="Remove">✕</button></span></div><div class="ad-grid">${f}</div></article>`;
  }
  let sT; function schedule() { clearTimeout(sT); sT = setTimeout(() => commit("Saved. The website is updated."), 700); }

  /* rashifal */
  function rashifal(body) {
    const ov = JL.data.rashifalOverride || {}, today = JL.ymd(new Date()), cur = ov.date === today ? ov.signs || {} : {};
    body.innerHTML = `<p class="ad-p">Write today's reading for any rashi. Signs you leave empty use the automatic reading based on today's Moon. Your text shows from now until midnight.</p>
      <div class="ad-rf">${Astro.RASHI.map((r, i) => `<label class="ad-f"><span><b class="ad-glyph">${r[2]}︎</b> ${r[0]} · ${r[1]}</span><textarea class="inp" rows="3" data-s="${i}" placeholder="Automatic reading is on">${esc(cur[i] || "")}</textarea></label>`).join("")}</div>`;
    acts(`<button class="btn btn-blue btn-sm" id="adRfSave">Publish today's rashifal</button>`);
    $("#adRfSave").onclick = () => {
      const signs = {}; $$("[data-s]", body).forEach(t => { if (t.value.trim()) signs[t.dataset.s] = t.value.trim(); });
      JL.data.rashifalOverride = { date: today, signs }; commit("Rashifal published for today");
    };
  }

  /* gallery */
  function gallery(body) {
    const g = JL.data.gallery;
    acts(`<label class="btn btn-blue btn-sm">Add photos<input type="file" accept="image/*" multiple hidden id="adGal"></label>`);
    body.innerHTML = `<div class="ad-gal">${g.map((s, i) => `<figure><img src="${esc(s)}" alt=""><button class="ad-ic" data-rm="${i}" aria-label="Remove photo">✕</button></figure>`).join("")}</div>`;
    $$("[data-rm]", body).forEach(b => b.onclick = () => { g.splice(+b.dataset.rm, 1); commit("Photo removed"); draw(); });
    $("#adGal").onchange = e => { const files = [...e.target.files]; let left = files.length; files.forEach(f => readImg(f, url => { g.unshift(url); if (--left === 0) { commit("Photos added"); draw(); } })); };
  }

  /* business */
  function biz(body) {
    const b = JL.data.biz, F = [["name", "Brand name"], ["legal", "Legal name"], ["astrologer", "Astrologer"], ["announcement", "Top announcement (leave empty to hide)", "area"], ["whatsapp", "WhatsApp number with 91"], ["call", "Call number with 91"], ["email", "Email"], ["address", "Address", "area"], ["hours", "Opening hours"], ["instagram", "Instagram link"], ["facebook", "Facebook link"], ["youtube", "YouTube link"], ["playstore", "Play Store link"]];
    body.innerHTML = `<div class="ad-item"><div class="ad-grid">${F.map(([k, l, t]) => t === "area" ? `<label class="ad-f ad-wide"><span>${l}</span><textarea class="inp" rows="2" data-k="${k}">${esc(b[k])}</textarea></label>` : `<label class="ad-f"><span>${l}</span><input class="inp" data-k="${k}" value="${esc(b[k])}"></label>`).join("")}</div></div>
      <h3 class="ad-h3">Numbers on the homepage</h3><div class="ad-item"><div class="ad-grid">${JL.data.stats.map((s, i) => `<label class="ad-f"><span>Stat ${i + 1}</span><span class="ad-inline"><input class="inp" type="number" data-st="${i}" data-p="value" value="${s.value}"><input class="inp" data-st="${i}" data-p="suffix" value="${esc(s.suffix)}" style="max-width:80px"><input class="inp" data-st="${i}" data-p="label" value="${esc(s.label)}"></span></label>`).join("")}</div></div>
      <h3 class="ad-h3">Change PIN</h3><div class="ad-item ad-inline"><input class="inp" id="adNewPin" type="password" inputmode="numeric" maxlength="8" placeholder="New PIN, 4 to 8 digits"><button class="btn btn-line btn-sm" id="adPinSave">Update PIN</button></div>`;
    $$("[data-k]", body).forEach(i => i.oninput = () => { b[i.dataset.k] = i.value; schedule(); });
    $$("[data-st]", body).forEach(i => i.oninput = () => { const s = JL.data.stats[+i.dataset.st]; s[i.dataset.p] = i.dataset.p === "value" ? Number(i.value) : i.value; schedule(); });
    $("#adPinSave").onclick = () => { const v = $("#adNewPin").value; if (!/^\d{4,8}$/.test(v)) return JL.toast("Use 4 to 8 digits"); try { localStorage.setItem(PKEY, v); } catch (e) { } $("#adNewPin").value = ""; JL.toast("PIN updated"); };
  }

  /* timings */
  function slots(body) {
    const c = JL.data.slots, days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    body.innerHTML = `<div class="ad-item"><div class="ad-grid">
      <label class="ad-f"><span>First slot</span><input class="inp" type="time" id="adS" value="${c.start}"></label>
      <label class="ad-f"><span>Last slot</span><input class="inp" type="time" id="adE" value="${c.end}"></label>
      <label class="ad-f"><span>Slot length</span><select class="inp" id="adStep">${[15, 20, 30, 45, 60].map(m => `<option value="${m}"${+c.step === m ? " selected" : ""}>${m} minutes</option>`).join("")}</select></label>
      <div class="ad-f ad-wide"><span>Closed on</span><div class="ad-days">${days.map((d, i) => `<label><input type="checkbox" value="${i}" ${(c.closed || []).map(Number).includes(i) ? "checked" : ""}> ${d}</label>`).join("")}</div></div></div></div>`;
    const save = () => { c.start = $("#adS").value; c.end = $("#adE").value; c.step = +$("#adStep").value; c.closed = $$(".ad-days input:checked", body).map(x => +x.value); commit("Timings updated"); };
    $$("input,select", body).forEach(i => i.onchange = save);
  }

  /* backup */
  function backup(body) {
    body.innerHTML = `<div class="ad-item"><p class="ad-p">Download everything (content and bookings) as one file, or restore from a file.</p>
      <div class="ad-quick"><button class="btn btn-blue" id="adExp">Download backup</button><label class="btn btn-line">Restore backup<input type="file" accept="application/json" hidden id="adImp"></label><button class="btn btn-line" id="adReset">Reset to original content</button></div></div>`;
    $("#adExp").onclick = () => dl("jyotish-lok-backup.json", "application/json", JSON.stringify({ data: JL.data, bookings: JL.bookings() }, null, 2));
    $("#adImp").onchange = e => { const r = new FileReader(); r.onload = () => { try { const j = JSON.parse(r.result); if (j.data) { JL.data = Object.assign(JL.data, j.data); } if (j.bookings) JL.setBookings(j.bookings); commit("Backup restored"); } catch (x) { JL.toast("That file is not a Jyotish Lok backup"); } }; r.readAsText(e.target.files[0]); };
    $("#adReset").onclick = () => { if (confirm("Reset all content to the original? Bookings are kept.")) { JL.reset(); JL.toast("Content reset"); } };
  }

  /* helpers */
  function dl(name, type, text) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function readImg(file, cb) {
    if (!file) return; const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 1100 / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL("image/jpeg", .8)); }; im.src = r.result; };
    r.readAsDataURL(file);
  }

  route();
})();
