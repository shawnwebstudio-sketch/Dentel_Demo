/* Jyotish Lok site runtime. Everything visible is rendered from JL.data so the admin panel can change it live. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KEY = "jl_data_v2", BKEY = "jl_bookings_v2", TKEY = "jl_theme";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rupee = n => "₹" + Number(n || 0).toLocaleString("en-IN");
  const clone = o => JSON.parse(JSON.stringify(o));
  const pad = n => String(n).padStart(2, "0");
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtPhone = n => { const d = String(n).replace(/\D/g, "").slice(-10); return "+91 " + d.slice(0, 5) + " " + d.slice(5); };

  /* ---------- store ---------- */
  function load() {
    const d = clone(window.JL_DEFAULTS);
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s) { for (const k in s) d[k] = k === "biz" ? Object.assign(d.biz, s.biz) : s[k]; }
    } catch (e) { }
    return d;
  }
  function getBookings() { try { return JSON.parse(localStorage.getItem(BKEY) || "[]"); } catch (e) { return []; } }
  function setBookings(list) { try { localStorage.setItem(BKEY, JSON.stringify(list)); return true; } catch (e) { toast("Could not save. Browser storage is full."); return false; } }
  const JL = window.JL = {
    data: load(), esc, rupee, ymd, pad, fmtPhone,
    save() { try { localStorage.setItem(KEY, JSON.stringify(JL.data)); return true; } catch (e) { toast("Storage is full. Use smaller photos."); return false; } },
    reset() { try { localStorage.removeItem(KEY); } catch (e) { } JL.data = load(); renderAll(); },
    bookings: getBookings, setBookings, renderAll: () => renderAll(), toast: m => toast(m), modal: (h, c) => openModal(h, c), closeModal: () => closeModal()
  };

  const waUrl = msg => `https://wa.me/${JL.data.biz.whatsapp}?text=${encodeURIComponent(msg)}`;

  /* ---------- toast + modal ---------- */
  let tT;
  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => t.classList.remove("on"), 2600); }
  let lastFocus;
  function openModal(html, cls = "") {
    const m = $("#modal"); lastFocus = document.activeElement;
    m.className = "modal " + cls; $("#modalBody").innerHTML = html;
    requestAnimationFrame(() => m.classList.add("on")); document.body.classList.add("lock");
    setTimeout(() => $("#modalX").focus(), 50);
  }
  function closeModal() {
    const m = $("#modal"); m.classList.remove("on");
    if (!$("#adminRoot").classList.contains("on")) document.body.classList.remove("lock");
    lastFocus && lastFocus.focus && lastFocus.focus();
  }
  $("#modalX").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && $("#modal").classList.contains("on")) closeModal(); });

  /* ---------- business info ---------- */
  function renderBiz() {
    const b = JL.data.biz;
    $$("[data-biz]").forEach(el => { el.textContent = b[el.dataset.biz] || ""; });
    $$(".wa-link").forEach(a => { a.href = waUrl(a.dataset.msg || "Namaste Jyotish Lok"); });
    $$(".call-link").forEach(a => { a.href = "tel:+" + b.call; });
    $("#cWa").textContent = fmtPhone(b.whatsapp); $("#cCall").textContent = fmtPhone(b.call);
    $("#sIg").href = b.instagram; $("#sFb").href = b.facebook; $("#sYt").href = b.youtube; $("#playLink").href = b.playstore;
    const ann = $("#ann"); ann.hidden = !b.announcement; $("#annText").textContent = b.announcement || "";
    $("#yr").textContent = new Date().getFullYear();
  }
  $$(".copy").forEach(btn => btn.addEventListener("click", () => {
    const b = JL.data.biz, v = { wa: fmtPhone(b.whatsapp), call: fmtPhone(b.call), email: b.email }[btn.dataset.copy];
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast("Copied " + v), () => toast(v));
  }));

  /* ---------- stats with count-up ---------- */
  function renderStats() {
    $("#stats").innerHTML = JL.data.stats.map(s => `<div class="stat rv"><b data-to="${+s.value}" data-suf="${esc(s.suffix)}">0${esc(s.suffix)}</b><span>${esc(s.label)}</span></div>`).join("");
    $$("#stats b").forEach(b => countObs.observe(b));
  }
  const countObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; countObs.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, suf = el.dataset.suf, t0 = performance.now(), dur = reduce ? 1 : 1600;
    const step = t => { const p = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = v + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });

  /* ---------- services ---------- */
  function renderServices() {
    $("#svcGrid").innerHTML = JL.data.services.map((s, i) => `
      <article class="svc rv tiltable" style="transition-delay:${(i % 3) * .08}s">
        <div class="ph"><img src="${esc(s.img)}" alt="" loading="lazy"><div class="meta"><span class="chip gold">${s.price ? rupee(s.price) : "Ask"}</span><span class="chip">${+s.mins || 30} min</span></div></div>
        <span class="ico"><svg><use href="#i-${esc(s.icon || "kundli")}"/></svg></span>
        <div class="bd">
          <h3>${esc(s.title)}<small>${esc(s.hi)}</small></h3>
          <p>${esc(s.desc)}</p>
          <div class="act">
            <button class="btn btn-blue btn-sm" data-book="${esc(s.id)}"><svg><use href="#i-cal"/></svg>Book</button>
            <a class="btn btn-line btn-sm" href="${waUrl("Namaste, I would like to know about " + s.title + ".")}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Ask</a>
          </div>
        </div>
      </article>`).join("");
    $$("[data-book]").forEach(b => b.addEventListener("click", () => Booking.pick(b.dataset.book, true)));
  }

  /* ---------- pujas ---------- */
  function renderPujas() {
    $("#pujaTrack").innerHTML = JL.data.pujas.map(p => `
      <article class="puja">
        <div class="ph"><img src="${esc(p.img)}" alt="" loading="lazy">${p.tag ? `<span class="chip gold">${esc(p.tag)}</span>` : ""}</div>
        <div class="bd"><span class="sub">${esc(p.sub)}</span><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p>
          <div class="ft"><span class="price">${rupee(p.price)}<small>Dakshina included</small></span><button class="btn btn-gold btn-sm" data-puja="${esc(p.id)}">Book puja</button></div>
        </div>
      </article>`).join("");
    $$("[data-puja]").forEach(b => b.addEventListener("click", () => pujaForm(b.dataset.puja)));
    requestAnimationFrame(sizeHS);
  }
  function pujaForm(id) {
    const p = JL.data.pujas.find(x => x.id === id); if (!p) return;
    openModal(`<div class="article"><img src="${esc(p.img)}" alt=""><div class="bd light">
      <small style="color:var(--saffron-ink);font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:.78rem">${esc(p.sub)}</small>
      <h2>${esc(p.title)}</h2><p style="white-space:normal">${esc(p.desc)}</p>
      <form id="pForm" novalidate>
        <div class="row2"><div class="field"><label for="pName">Name for the sankalp</label><input class="inp" id="pName" autocomplete="name"></div>
        <div class="field"><label for="pGotra">Gotra (if known)</label><input class="inp" id="pGotra"></div></div>
        <div class="field"><label for="pPhone">WhatsApp number</label><input class="inp" id="pPhone" type="tel" inputmode="numeric" placeholder="10 digit number"></div>
        <div class="err" id="pErr" role="alert"></div>
        <button class="btn btn-gold" style="width:100%" type="submit">Book for ${rupee(p.price)}</button>
      </form></div></div>`);
    $("#pForm").addEventListener("submit", e => {
      e.preventDefault();
      const name = $("#pName").value.trim(), gotra = $("#pGotra").value.trim(), phone = $("#pPhone").value.replace(/\D/g, "").slice(-10);
      if (name.length < 2) return $("#pErr").textContent = "Please enter the name for the sankalp.";
      if (!/^[6-9]\d{9}$/.test(phone)) return $("#pErr").textContent = "Please enter a valid 10 digit mobile number.";
      const bk = saveBooking({ type: "Puja", service: p.title, price: p.price, date: "", slot: "", mode: "Puja", name, phone, note: gotra ? "Gotra: " + gotra : "" });
      const msg = `Namaste Jyotish Lok, I booked ${p.title} (${rupee(p.price)}).\nBooking ID: ${bk.id}\nName: ${name}${gotra ? "\nGotra: " + gotra : ""}\nMobile: ${phone}`;
      $("#modalBody .bd").innerHTML = `<div class="done"><div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" pathLength="30"/></svg></div>
        <h2 style="margin:0">Puja booked</h2><div class="bid">${bk.id}</div><p style="white-space:normal">Send this to the Acharya on WhatsApp to confirm the date and pay the dakshina.</p>
        <a class="btn btn-wa" href="${waUrl(msg)}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Confirm on WhatsApp</a></div>`;
      petals();
    });
  }

  /* ---------- products, testimonials, blog, gallery ---------- */
  function renderProducts() {
    $("#prodGrid").innerHTML = JL.data.products.map((p, i) => `
      <article class="prod rv" style="transition-delay:${(i % 4) * .07}s"><div class="ph"><img src="${esc(p.img)}" alt="" loading="lazy"></div>
        <div class="bd"><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p>
          <div class="ft"><span class="price">${p.price ? `<small>From</small>${rupee(p.price)}` : `<small>Price</small>On request`}</span>
          <a class="btn btn-line btn-sm" href="${waUrl("Namaste, I am interested in " + p.title + ". Which one suits my kundli?")}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Ask</a></div></div></article>`).join("");
  }
  function renderTestimonials() {
    const t = JL.data.testimonials;
    if (!t.length) { $("#tmTrack").closest("section").hidden = true; return; }
    $("#tmTrack").closest("section").hidden = false;
    const card = x => `<figure class="tcard" style="margin:0"><span class="st" aria-label="${+x.rating} out of 5">${"★".repeat(+x.rating || 5)}${"☆".repeat(5 - (+x.rating || 5))}</span>
      <blockquote style="margin:0"><p>${esc(x.text)}</p></blockquote>
      <figcaption class="who"><span class="av">${esc((x.name || "?")[0])}</span><span><b>${esc(x.name)}</b>${x.sample !== false ? `<span class="sample">Sample</span>` : ""}<small>${esc(x.city)}</small></span></figcaption></figure>`;
    const row = t.map(card).join("");
    $("#tmTrack").innerHTML = row + row.replace(/<figure /g, '<figure aria-hidden="true" ');
  }
  function renderBlog() {
    const posts = [...JL.data.blog].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    $("#blogGrid").innerHTML = posts.map(p => `<button class="post rv" data-post="${esc(p.id)}"><div class="ph"><img src="${esc(p.img)}" alt="" loading="lazy"></div>
      <div class="bd"><small>${p.date ? new Date(p.date + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}</small><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div></button>`).join("");
    $$("[data-post]").forEach(b => b.addEventListener("click", () => {
      const p = JL.data.blog.find(x => x.id === b.dataset.post);
      openModal(`<article class="article"><img src="${esc(p.img)}" alt=""><div class="bd"><small style="color:var(--saffron-ink);font-weight:700">${esc(p.date)}</small><h2>${esc(p.title)}</h2><p>${esc(p.body)}</p>
        <a class="btn btn-wa" href="${waUrl("Namaste, I read your article \"" + p.title + "\" and have a question.")}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Ask the Acharya</a></div></article>`);
    }));
  }
  function renderGallery() {
    $("#gal").innerHTML = JL.data.gallery.map((src, i) => `<button class="rv" data-g="${i}" aria-label="Open photo ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("");
    $$("[data-g]").forEach(b => b.addEventListener("click", () => openModal(`<img src="${esc(JL.data.gallery[+b.dataset.g])}" alt="">`, "lightbox")));
  }

  /* ---------- live panchang ---------- */
  function renderPanchang() {
    const now = new Date(), p = Astro.panchang(now), R = Astro.RASHI;
    $("#pClock").textContent = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    $("#pTithi").textContent = p.tithi; $("#pNak").textContent = p.nak;
    $("#pMoon").innerHTML = `${R[p.moonSign][0]}<em>${R[p.moonSign][2]}︎</em>`;
    $("#pSun").innerHTML = `${R[p.sunSign][0]}<em>${R[p.sunSign][2]}︎</em>`;
    const ph = p.phase, lit = Math.round((1 - Math.cos(ph * Math.PI / 180)) / 2 * 100);
    $("#pPhase").style.setProperty("--mx", (ph <= 180 ? 100 - ph / 180 * 100 : -(ph - 180) / 180 * 100) + "%");
    $("#pPhaseT").textContent = `${ph <= 180 ? "Waxing" : "Waning"} · ${lit}%`;
  }
  function greet() { const h = new Date().getHours(); $("#greet").textContent = h < 12 ? "Shubh prabhat" : h < 17 ? "Namaste" : "Shubh sandhya"; }

  /* ---------- kundli generator ---------- */
  const DCOL = { Ketu: "#B9A6F5", Venus: "#FFC9DE", Sun: "#FFB547", Moon: "#E3ECFF", Mars: "#FF8A70", Rahu: "#8FA7D9", Jupiter: "#FFE07A", Saturn: "#9DC1FF", Mercury: "#9EE6B8" };
  function initKundli() {
    const sel = $("#kCity");
    sel.innerHTML = Object.keys(Astro.CITIES).sort().map(c => `<option${c === "Udaipur" ? " selected" : ""}>${c}</option>`).join("");
    $("#kForm").addEventListener("submit", e => {
      e.preventDefault();
      const name = $("#kName").value.trim(), d = $("#kDate").value, t = $("#kTime").value, city = sel.value, err = $("#kErr");
      if (name.length < 2) return err.textContent = "Please enter your name.";
      if (!d) return err.textContent = "Please choose your date of birth.";
      if (!t) return err.textContent = "Please enter your time of birth. An approximate time is fine.";
      const [y, m, dd] = d.split("-").map(Number), [hh, mm] = t.split(":").map(Number);
      if (y < 1900 || new Date(d) > new Date()) return err.textContent = "Please check the date of birth.";
      err.textContent = "";
      const [lat, lon] = Astro.CITIES[city];
      const k = Astro.kundli({ y, m, d: dd, hh, mm, lat, lon, tz: 5.5 });
      showKundli(k, { name, d, t, city, gender: $("#kGender").value });
    });
  }
  function showKundli(k, f) {
    const R = Astro.RASHI, first = f.name.split(" ")[0];
    const total = k.dashas.reduce((a, x) => a + x.yrs, 0);
    const yr = x => x.getFullYear();
    const rows = k.planets.map((p, i) => `<tr style="animation-delay:${.9 + i * .06}s"><td><b>${p.hi}</b>${p.en}${p.retro && p.k !== "Ra" && p.k !== "Ke" ? " <small>(R)</small>" : ""}</td><td>${R[p.sign][0]}</td><td>${p.deg}</td><td>${p.house}</td><td>${p.nak.name}</td></tr>`).join("");
    const msg = `Namaste Jyotish Lok, please prepare my full kundli report.\nName: ${f.name}\nDate of birth: ${f.d}\nTime: ${f.t}\nPlace: ${f.city}\nLagna: ${R[k.lagnaSign][0]}, Rashi: ${R[k.rashi][0]}, Nakshatra: ${k.nak.name}`;
    $("#kRes").innerHTML = `<div class="kout">
      <div class="khead"><h3>${esc(first)}'s kundli</h3><div class="badges">
        <span class="bdg">Lagna <b>${R[k.lagnaSign][0]}</b></span><span class="bdg">Rashi <b>${R[k.rashi][0]} ${R[k.rashi][1]}</b></span>
        <span class="bdg">Nakshatra <b>${k.nak.name} ${k.nak.pada}</b></span><span class="bdg ${k.manglik ? "warn" : ""}">${k.manglik ? "Manglik" : "Not manglik"}</span></div></div>
      <div class="kchart">${Astro.chartSVG(k)}<div class="tscroll"><table class="ptable"><thead><tr><th>Planet</th><th>Sign</th><th>Degree</th><th>House</th><th>Nakshatra</th></tr></thead><tbody>${rows}</tbody></table></div></div>
      <div><p class="knote" style="margin-bottom:8px">Vimshottari dasha · now running <b style="color:var(--glow)">${k.current.lord}</b> mahadasha until ${yr(k.current.end)}</p>
        <div class="dasha">${k.dashas.map((x, i) => `<div class="${x === k.current ? "cur" : ""}" style="flex:${x.yrs.toFixed(2)};background:${DCOL[x.lord]};animation-delay:${1 + i * .07}s" title="${x.lord} ${yr(x.start)} to ${yr(x.end)}">${x.yrs / total > .07 ? x.lord : ""}</div>`).join("")}</div>
        <div class="dlegend"><span>${yr(k.dashas[0].start)}</span><span>${yr(k.dashas[8].end)}</span></div></div>
      <p class="knote">${k.manglik ? "Mars sits in house " + k.planets[2].house + ", so the chart shows Mangal dosh. Many charts cancel it through other placements, so ask before worrying. " : ""}Tithi at birth: ${k.tithi}. These positions are calculated in your browser and are close approximations.</p>
      <div class="hero-cta" style="margin-top:0"><a class="btn btn-wa" href="${waUrl(msg)}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Get full report on WhatsApp</a><a class="btn btn-ghost" href="#book" data-goto-svc="s1"><svg><use href="#i-cal"/></svg>Book a reading</a></div>
    </div>`;
    const go = $("[data-goto-svc]"); go && go.addEventListener("click", e => { e.preventDefault(); Booking.pick("s1", true); });
    if (innerWidth < 880) $("#kRes").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    try { localStorage.setItem("jl_rashi", k.rashi); } catch (e) { }
    Rashifal.select(k.rashi, false);
  }

  /* ---------- rashifal ---------- */
  const Rashifal = (() => {
    let sign = 0, tab = 0;
    try { const s = localStorage.getItem("jl_rashi"); if (s !== null) sign = +s; } catch (e) { }
    const OPEN = ["The Moon moves through your {h} house, bringing {theme} into focus.", "With the Moon in your {h} house, {theme} needs your attention.", "The Moon lights up your {h} house, and {theme} feels important."];
    const THEMES = ["your health and confidence", "money and family talk", "short trips, siblings and courage", "home, mother and peace of mind", "children, studies and romance", "daily work and health", "your partner and business deals", "hidden matters and research", "luck, elders and faith", "career and reputation", "income, friends and gains", "expenses, rest and spiritual practice"];
    const MID = ["A pending task finally moves forward, so finish what you started.", "Someone senior notices your effort. Speak calmly and clearly.", "Avoid lending money today, and read every paper before you sign.", "An old friend may get in touch with useful news.", "Good day to plan, but wait a day before a big purchase.", "Patience at work pays off by the evening.", "Family support is strong. Share your plans with them.", "Keep your words soft at home, and the day stays sweet.", "A small trip or call brings a fresh opportunity.", "Your hard work from last month starts to show results."];
    const TIP = ["Offer water to the Sun in the morning.", "Light a ghee diya near the tulsi in the evening.", "Chant Om Namah Shivaya 11 times before work.", "Feed green grass to a cow.", "Donate something white to someone in need.", "Recite the Hanuman Chalisa once today.", "Keep a little saffron with you.", "Wear a clean, light colour and smile first."];
    const COL = [["Red", "#D2462A"], ["White", "#F4F4F4"], ["Green", "#1E9E5A"], ["Silver", "#C9D1E0"], ["Saffron", "#F0961B"], ["Sky blue", "#7FB3FF"], ["Pink", "#F59AB8"], ["Maroon", "#7A1B2C"], ["Yellow", "#FFD23F"], ["Navy", "#1F3A93"], ["Purple", "#7B4BC4"], ["Cream", "#FFF1D0"]];
    const rng = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    function reading(s, t) {
      const base = new Date(); base.setHours(12, 0, 0, 0); if (t === 1) base.setDate(base.getDate() + 1);
      const key = t === 2 ? "W" + Math.floor(base.getTime() / 6048e5) : ymd(base);
      let seed = 7; for (const c of key + s) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
      const r = rng(seed), pick = a => a[Math.floor(r() * a.length)];
      const moon = Astro.panchang(base).moonSign, h = (moon - s + 12) % 12;
      const ord = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"][h];
      let text = pick(OPEN).replace("{h}", ord).replace("{theme}", THEMES[h]) + " " + pick(MID) + " " + (t === 2 ? "Over the week, " + pick(MID).charAt(0).toLowerCase() + pick(MID).slice(1) : pick(TIP));
      const ov = JL.data.rashifalOverride || {};
      if (t === 0 && ov.date === ymd(new Date()) && ov.signs && ov.signs[s]) text = ov.signs[s];
      const good = [1, 2, 4, 5, 9, 10, 11].includes(h + 1) ? 18 : 0;
      return { text, date: t === 2 ? "This week" : base.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }),
        love: 45 + Math.floor(r() * 40) + good / 2, career: 40 + Math.floor(r() * 42) + good, health: 50 + Math.floor(r() * 40),
        col: pick(COL), num: 1 + Math.floor(r() * 9), time: pick(["6–8 am", "9–11 am", "12–2 pm", "3–5 pm", "6–8 pm"]), own: t === 0 && text === (ov.signs || {})[s] };
    }
    function draw(flip) {
      const R = Astro.RASHI[sign], x = reading(sign, tab), card = $("#reading");
      card.innerHTML = `<div class="top"><span class="big">${R[2]}︎</span><div><h3>${R[0]} <span class="deva" style="font-size:.6em;color:var(--glow)">${R[1]}</span></h3><div class="date">${x.date}${x.own ? " · from the Acharya" : ""}</div></div></div>
        <div class="tabs" role="tablist">${["Today", "Tomorrow", "This week"].map((n, i) => `<button role="tab" aria-selected="${i === tab}" data-tab="${i}">${n}</button>`).join("")}</div>
        <p class="text">${esc(x.text)}</p>
        <div class="areas">${[["Love", x.love], ["Career", x.career], ["Health", x.health]].map(([n, v]) => `<div class="area"><small>${n}</small><b>${Math.min(98, v)}%</b><div class="meter"><i style="width:${Math.min(98, v)}%"></i></div></div>`).join("")}</div>
        <div class="lucky"><div><small>Lucky colour</small><b><i class="sw" style="background:${x.col[1]}"></i>${x.col[0]}</b></div><div><small>Lucky number</small><b>${x.num}</b></div><div><small>Good time</small><b>${x.time}</b></div></div>
        <a class="btn btn-gold" style="width:100%" href="${waUrl("Namaste, I want a personal reading for " + R[0] + " rashi.")}" target="_blank" rel="noopener">Get a personal reading</a>`;
      $$("[data-tab]", card).forEach(b => b.addEventListener("click", () => { tab = +b.dataset.tab; draw(true); }));
      if (flip && !reduce) { card.classList.remove("flip"); void card.offsetWidth; card.classList.add("flip"); }
    }
    function select(s, flip = true) { sign = s; $$(".rashi").forEach((b, i) => b.setAttribute("aria-pressed", i === s)); draw(flip); }
    function init() {
      $("#rashis").innerHTML = Astro.RASHI.map((r, i) => `<button class="rashi" aria-pressed="false"><span class="g">${r[2]}︎</span><b>${r[0]}</b><small>${r[1]}</small></button>`).join("");
      $$(".rashi").forEach((b, i) => b.addEventListener("click", () => { select(i); try { localStorage.setItem("jl_rashi", i); } catch (e) { } if (innerWidth < 880) $("#reading").scrollIntoView({ behavior: "smooth", block: "nearest" }); }));
      select(sign, false);
    }
    return { init, select, redraw: () => draw(false) };
  })();

  /* ---------- booking ---------- */
  function saveBooking(b) {
    const list = getBookings();
    const id = "JL-" + Date.now().toString(36).slice(-4).toUpperCase() + Math.floor(Math.random() * 90 + 10);
    const rec = Object.assign({ id, created: new Date().toISOString(), status: "New" }, b);
    list.unshift(rec); setBookings(list); return rec;
  }
  const Booking = (() => {
    let st = 1; const s = { svc: null, date: null, slot: null, mode: "Phone call" };
    const root = $("#bk"), next = $("#bkNext"), back = $("#bkBack");
    function svc() { return JL.data.services.find(x => x.id === s.svc); }
    function slotsFor(dateStr) {
      const c = JL.data.slots, out = [];
      const [sh, sm] = c.start.split(":").map(Number), [eh, em] = c.end.split(":").map(Number);
      const taken = getBookings().filter(b => b.date === dateStr && b.status !== "Cancelled").map(b => b.slot);
      const now = new Date(), isToday = dateStr === ymd(now), nowMin = now.getHours() * 60 + now.getMinutes() + 30;
      for (let m = sh * 60 + sm; m <= eh * 60 + em; m += +c.step || 30) {
        const lbl = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
        out.push({ lbl, nice: new Date(2000, 0, 1, Math.floor(m / 60), m % 60).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }), off: taken.includes(lbl) || (isToday && m < nowMin) });
      }
      return out;
    }
    function drawSvc() {
      $("#bkSvc").innerHTML = JL.data.services.map(x => `<button type="button" class="opt" aria-pressed="${x.id === s.svc}" data-s="${esc(x.id)}"><img src="${esc(x.img)}" alt=""><span><b>${esc(x.title)}</b><small>${x.price ? rupee(x.price) : "Ask"} · ${+x.mins || 30} min</small></span></button>`).join("");
      $$("#bkSvc .opt").forEach(b => b.addEventListener("click", () => { s.svc = b.dataset.s; drawSvc(); setTimeout(() => go(2), 260); }));
    }
    function drawDays() {
      const closed = (JL.data.slots.closed || []).map(Number), out = [];
      const d = new Date(); d.setHours(12, 0, 0, 0);
      for (let i = 0; i < 14; i++) {
        const x = new Date(d); x.setDate(d.getDate() + i);
        const key = ymd(x), off = closed.includes(x.getDay()) || !slotsFor(key).some(z => !z.off);
        out.push(`<button type="button" class="day" data-d="${key}" aria-pressed="${s.date === key}" ${off ? "disabled" : ""}><small>${x.toLocaleDateString("en-IN", { weekday: "short" })}</small><b>${x.getDate()}</b><small>${x.toLocaleDateString("en-IN", { month: "short" })}</small>${i === 0 ? '<span class="t">TODAY</span>' : i === 1 ? '<span class="t">TMRW</span>' : ""}</button>`);
        if (!s.date && !off) s.date = key;
      }
      $("#bkDays").innerHTML = out.join("");
      $$("#bkDays .day").forEach(b => b.addEventListener("click", () => { s.date = b.dataset.d; s.slot = null; drawDays(); }));
      drawSlots();
    }
    function drawSlots() {
      if (!s.date) { $("#bkSlots").innerHTML = "<p class='hint'>No open days in the next two weeks.</p>"; return; }
      $("#bkSlots").innerHTML = slotsFor(s.date).map(z => `<button type="button" class="slot" data-t="${z.lbl}" aria-pressed="${s.slot === z.lbl}" ${z.off ? "disabled" : ""}>${z.nice}</button>`).join("");
      $$("#bkSlots .slot").forEach(b => b.addEventListener("click", () => { s.slot = b.dataset.t; $$("#bkSlots .slot").forEach(x => x.setAttribute("aria-pressed", x === b)); }));
    }
    $$("#bkModes button").forEach(b => b.addEventListener("click", () => { s.mode = b.dataset.m; $$("#bkModes button").forEach(x => x.setAttribute("aria-pressed", x === b)); }));
    const niceDate = k => new Date(k + "T12:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
    const niceSlot = t => { const [h, m] = t.split(":").map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }); };
    function go(n) {
      if (n === 2 && !s.svc) return toast("Please choose a consultation first.");
      if (n === 3 && !s.slot) return toast("Please pick a time slot.");
      if (n === 4) {
        s.name = $("#bName").value.trim(); s.phone = $("#bPhone").value.replace(/\D/g, "").slice(-10); s.note = $("#bNote").value.trim();
        if (s.name.length < 2) return $("#bErr").textContent = "Please enter your name.";
        if (!/^[6-9]\d{9}$/.test(s.phone)) return $("#bErr").textContent = "Please enter a valid 10 digit mobile number.";
        $("#bErr").textContent = "";
        const x = svc();
        $("#bkSum").innerHTML = [["Service", x.title], ["Fee", x.price ? rupee(x.price) : "To be confirmed"], ["Date", niceDate(s.date)], ["Time", niceSlot(s.slot) + " IST"], ["Mode", s.mode], ["Name", s.name], ["Mobile", fmtPhone(s.phone)]].concat(s.note ? [["Question", s.note]] : []).map(([a, b]) => `<dt>${a}</dt><dd>${esc(b)}</dd>`).join("");
      }
      if (n === 5) {
        const x = svc(), bk = saveBooking({ type: "Consultation", service: x.title, price: x.price, date: s.date, slot: s.slot, mode: s.mode, name: s.name, phone: s.phone, note: s.note });
        const msg = `Namaste Jyotish Lok, I booked a consultation.\nBooking ID: ${bk.id}\nService: ${x.title}\nDate: ${niceDate(s.date)}, ${niceSlot(s.slot)}\nMode: ${s.mode}\nName: ${s.name}\nMobile: ${s.phone}${s.note ? "\nQuestion: " + s.note : ""}`;
        const st0 = s.date.replace(/-/g, "") + "T" + s.slot.replace(":", "") + "00", end = new Date(s.date + "T" + s.slot); end.setMinutes(end.getMinutes() + (+x.mins || 30));
        const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Jyotish Lok//EN\r\nBEGIN:VEVENT\r\nUID:${bk.id}@jyotishlok\r\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z\r\nDTSTART;TZID=Asia/Kolkata:${st0}\r\nDTEND;TZID=Asia/Kolkata:${ymd(end).replace(/-/g, "")}T${pad(end.getHours())}${pad(end.getMinutes())}00\r\nSUMMARY:${x.title} with Jyotish Lok\r\nDESCRIPTION:Booking ID ${bk.id} · ${s.mode}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
        $("#bkDone").innerHTML = `<div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" pathLength="30"/></svg></div>
          <h3>Your slot is reserved</h3><div class="bid">${bk.id}</div>
          <p class="hint" style="margin:0">${esc(x.title)} · ${niceDate(s.date)} at ${niceSlot(s.slot)}<br>Send it on WhatsApp so the Acharya can confirm.</p>
          <div class="hero-cta" style="justify-content:center;margin-top:6px"><a class="btn btn-wa" href="${waUrl(msg)}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Confirm on WhatsApp</a>
          <a class="btn btn-line" download="jyotish-lok-${bk.id}.ics" href="data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}"><svg><use href="#i-cal"/></svg>Add to calendar</a></div>
          <button class="btn btn-line btn-sm" type="button" id="bkAgain">Book another</button>`;
        $("#bkAgain").addEventListener("click", () => { Object.assign(s, { svc: null, date: null, slot: null }); ["#bName", "#bPhone", "#bNote"].forEach(q => $(q).value = ""); drawSvc(); go(1); });
        petals();
      }
      st = n;
      $$(".stage", root).forEach(x => x.classList.toggle("on", +x.dataset.st === n));
      $$(".steps span", root).forEach((x, i) => x.classList.toggle("done", i < Math.min(n, 4)));
      if (n === 2) drawDays();
      back.style.visibility = n === 1 || n === 5 ? "hidden" : "visible";
      $("#bkNav").hidden = n === 5;
      next.innerHTML = n === 4 ? 'Confirm booking<svg><use href="#i-check"/></svg>' : 'Continue<svg><use href="#i-arrow"/></svg>';
    }
    next.addEventListener("click", () => go(st + 1));
    back.addEventListener("click", () => go(Math.max(1, st - 1)));
    function pick(id, scroll) {
      s.svc = id; drawSvc(); go(2);
      if (scroll) $("#book").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }
    function init() { drawSvc(); go(1); }
    return { init, pick, refresh() { drawSvc(); if (st === 2) drawDays(); } };
  })();

  /* ---------- petals confetti ---------- */
  function petals() {
    if (reduce) return;
    const cols = ["#F0961B", "#FFC24F", "#D2462A", "#FFD27A", "#F7A93B", "#FF7A59"];
    for (let i = 0; i < 46; i++) {
      const p = document.createElement("i"); p.className = "petal-fx";
      p.style.left = Math.random() * 100 + "vw"; p.style.background = cols[i % cols.length];
      document.body.appendChild(p);
      const dx = (Math.random() - .5) * 220, rot = (Math.random() - .5) * 900, dur = 2200 + Math.random() * 1800;
      p.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${dx}px,${innerHeight + 60}px) rotate(${rot}deg)`, opacity: .9 }], { duration: dur, delay: Math.random() * 500, easing: "cubic-bezier(.25,.6,.4,1)", fill: "both" }).onfinish = () => p.remove();
    }
  }

  /* ---------- hero: zodiac ring, stars, tilt ---------- */
  function initHero() {
    $("#zod").innerHTML = Astro.RASHI.map((r, i) => { const a = i * 30 * Math.PI / 180; return `<span style="left:${50 + 50 * Math.sin(a)}%;top:${50 - 50 * Math.cos(a)}%">${r[2]}︎</span>`; }).join("");
    const cv = $("#stars"), cx = cv.getContext("2d"); let W, H, stars = [], shoot = null, vis = true, dpr = Math.min(2, devicePixelRatio || 1);
    function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); stars = Array.from({ length: Math.round(W * H / 5200) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + .2, p: Math.random() * 6.28, s: .6 + Math.random() * 1.6 })); }
    size(); addEventListener("resize", size);
    new IntersectionObserver(e => { vis = e[0].isIntersecting; if (vis) requestAnimationFrame(frame); }).observe(cv);
    function frame(t) {
      if (!vis) return;
      cx.clearRect(0, 0, W, H);
      for (const s of stars) { cx.globalAlpha = .35 + .65 * Math.abs(Math.sin(s.p + t / 1000 * s.s)); cx.fillStyle = "#FFF6DD"; cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.29); cx.fill(); }
      if (!shoot && Math.random() < .006) shoot = { x: Math.random() * W * .7, y: Math.random() * H * .4, l: 0 };
      if (shoot) { shoot.l += 14; const g = cx.createLinearGradient(shoot.x, shoot.y, shoot.x + shoot.l, shoot.y + shoot.l * .45); g.addColorStop(0, "rgba(255,210,122,0)"); g.addColorStop(1, "rgba(255,240,200,.9)"); cx.globalAlpha = 1; cx.strokeStyle = g; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(shoot.x, shoot.y); cx.lineTo(shoot.x + shoot.l, shoot.y + shoot.l * .45); cx.stroke(); if (shoot.l > 260) shoot = null; }
      if (!reduce) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    if (fine && !reduce) {
      const tilt = $("#tilt"), hero = $(".hero");
      hero.addEventListener("pointermove", e => { const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tilt.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`; });
      hero.addEventListener("pointerleave", () => tilt.style.transform = "");
    }
  }

  /* ---------- card tilt ---------- */
  function bindTilt() {
    if (!fine || reduce) return;
    $$(".tiltable").forEach(el => {
      if (el._t) return; el._t = 1;
      el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`; });
      el.addEventListener("pointerleave", () => el.style.transform = "");
    });
  }

  /* ---------- reveals ---------- */
  function splitHeads() {
    $$(".split:not([data-done])").forEach(h => {
      h.dataset.done = 1; let i = 0;
      [...h.childNodes].forEach(n => {
        if (n.nodeType === 3) { const frag = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) frag.append(w); else { const s = document.createElement("span"); s.className = "wd"; s.style.transitionDelay = (i++ * .06) + "s"; s.textContent = w; frag.append(s); } }); n.replaceWith(frag); }
        else if (n.nodeType === 1) { n.classList.add("wd"); n.style.transitionDelay = (i++ * .06) + "s"; if (n.classList.contains("deva")) n.style.display = "block"; }
      });
    });
  }
  const revObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); } }), { threshold: .14, rootMargin: "0px 0px -6% 0px" });
  function observeReveals() { splitHeads(); $$(".rv:not(.in),.rv-clip:not(.in),.split:not(.in)").forEach(el => revObs.observe(el)); }

  /* ---------- scroll: header, progress, parallax, pinned pujas ---------- */
  const hs = $("#puja"), track = $("#pujaTrack"), bar = $("#hsBar"), top = $("#top"), prog = $("#progress"), sky = $("#sky");
  let dist = 0, lastY = scrollY, ticking = false, pinned = false;
  function sizeHS() {
    pinned = innerWidth > 880 && !reduce;
    if (!pinned) { hs.style.height = ""; track.style.transform = ""; return; }
    dist = Math.max(0, track.scrollWidth - innerWidth + 40);
    hs.style.height = innerHeight + dist + "px"; onScroll();
  }
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    top.classList.toggle("solid", y > 40);
    top.classList.toggle("hide", y > 600 && y > lastY + 4 && !document.body.classList.contains("lock"));
    if (y < lastY - 4) top.classList.remove("hide");
    lastY = y;
    if (!reduce && y < innerHeight * 1.2) sky.style.transform = `translate3d(0,${y * .3}px,0) scale(1.08)`;
    if (pinned) { const p = Math.min(1, Math.max(0, (y - hs.offsetTop) / (dist || 1))); track.style.transform = `translate3d(${-p * dist}px,0,0)`; bar.style.transform = `scaleX(${p})`; }
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", () => requestAnimationFrame(sizeHS));

  /* mobile nav active */
  const navMap = { home: 0, kundli: 1, rashifal: 3, book: 4 };
  const mObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const i = navMap[e.target.id]; $$(".mnav a").forEach((a, j) => a.classList.toggle("on", j === i)); $$(".nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); } }), { rootMargin: "-45% 0px -50% 0px" });
  ["home", "services", "kundli", "rashifal", "puja", "book", "blog"].forEach(id => { const el = document.getElementById(id); el && mObs.observe(el); });

  /* ---------- cursor ---------- */
  function initCursor() {
    if (!fine || reduce) return;
    const c = $("#cursor"), d = $("#cursorDot"); let x = -100, y = -100, cxp = x, cyp = y;
    addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; d.style.transform = `translate(${x}px,${y}px)`; c.classList.add("on"); d.classList.add("on"); }, { passive: true });
    document.addEventListener("pointerover", e => c.classList.toggle("big", !!e.target.closest("a,button,.rashi,select,input")));
    (function loop() { cxp += (x - cxp) * .18; cyp += (y - cyp) * .18; c.style.transform = `translate(${cxp}px,${cyp}px)`; requestAnimationFrame(loop); })();
  }

  /* ---------- theme ---------- */
  function initTheme() {
    const root = document.documentElement;
    try { const t = localStorage.getItem(TKEY); if (t) root.dataset.theme = t; } catch (e) { }
    $("#themeBtn").addEventListener("click", () => {
      const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = dark ? "light" : "dark"; try { localStorage.setItem(TKEY, root.dataset.theme); } catch (e) { }
      toast(dark ? "Light mode" : "Dark mode");
    });
  }

  /* ---------- loader ---------- */
  function initLoader() {
    const L = $("#loader"), pc = $("#loadPc"), t0 = performance.now(), min = reduce ? 200 : 1500;
    let done = false, loaded = document.readyState === "complete";
    addEventListener("load", () => loaded = true);
    (function tick(t) {
      const e = t - t0, p = Math.min(100, Math.round(e / min * (loaded ? 100 : 86)));
      pc.textContent = p + "%";
      if ((p >= 100 && loaded) || e > 3800) return finish();
      requestAnimationFrame(tick);
    })(t0);
    function finish() {
      if (done) return; done = true; pc.textContent = "100%";
      L.classList.add("out"); document.body.classList.remove("lock"); document.body.classList.add("ready");
      setTimeout(() => L.remove(), 1200);
      if (location.hash && location.hash !== "#admin") { const el = document.querySelector(location.hash); el && el.scrollIntoView(); }
    }
  }

  /* ---------- render all ---------- */
  function renderAll() {
    renderBiz(); renderStats(); renderServices(); renderPujas(); renderProducts(); renderTestimonials(); renderBlog(); renderGallery();
    Rashifal.redraw && $("#rashis").children.length && Rashifal.redraw();
    Booking.refresh(); observeReveals(); bindTilt();
  }

  initTheme(); initLoader();
  renderBiz(); renderStats(); renderServices(); renderPujas(); renderProducts(); renderTestimonials(); renderBlog(); renderGallery();
  greet(); renderPanchang(); setInterval(renderPanchang, 1000);
  initHero(); initKundli(); Rashifal.init(); Booking.init(); initCursor();
  observeReveals(); bindTilt(); sizeHS(); onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeHS);
  addEventListener("load", sizeHS);
})();
