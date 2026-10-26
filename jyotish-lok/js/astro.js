/* Vedic astrology calculations: low-precision ephemeris (Schlyter's method),
   Lahiri ayanamsa, ascendant, North Indian chart, Vimshottari dasha. Accuracy ~1°. */
(function () {
  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const n360 = x => ((x % 360) + 360) % 360;
  const sin = x => Math.sin(x * rad), cos = x => Math.cos(x * rad);

  const RASHI = [
    ["Aries", "मेष", "♈"], ["Taurus", "वृषभ", "♉"], ["Gemini", "मिथुन", "♊"], ["Cancer", "कर्क", "♋"],
    ["Leo", "सिंह", "♌"], ["Virgo", "कन्या", "♍"], ["Libra", "तुला", "♎"], ["Scorpio", "वृश्चिक", "♏"],
    ["Sagittarius", "धनु", "♐"], ["Capricorn", "मकर", "♑"], ["Aquarius", "कुंभ", "♒"], ["Pisces", "मीन", "♓"]];
  const LORD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
  const NAK = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
  const DASHA = [["Ketu", 7], ["Venus", 20], ["Sun", 6], ["Moon", 10], ["Mars", 7], ["Rahu", 18], ["Jupiter", 16], ["Saturn", 19], ["Mercury", 17]];
  const TITHI = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi"];
  const PL = [
    { k: "Su", en: "Sun", hi: "सू" }, { k: "Mo", en: "Moon", hi: "चं" }, { k: "Ma", en: "Mars", hi: "मं" },
    { k: "Me", en: "Mercury", hi: "बु" }, { k: "Ju", en: "Jupiter", hi: "गु" }, { k: "Ve", en: "Venus", hi: "शु" },
    { k: "Sa", en: "Saturn", hi: "श" }, { k: "Ra", en: "Rahu", hi: "रा" }, { k: "Ke", en: "Ketu", hi: "के" }];

  const CITIES = {
    "Udaipur": [24.585, 73.712], "Chittorgarh": [24.888, 74.627], "Bari Sadri": [24.413, 74.473], "Ujjain": [23.179, 75.785],
    "Jaipur": [26.912, 75.787], "Jodhpur": [26.238, 73.024], "Ajmer": [26.449, 74.639], "Kota": [25.213, 75.865],
    "Bhilwara": [25.347, 74.641], "Indore": [22.720, 75.858], "Bhopal": [23.260, 77.413], "Ahmedabad": [23.023, 72.571],
    "Surat": [21.170, 72.831], "Vadodara": [22.307, 73.181], "Mumbai": [19.076, 72.878], "Pune": [18.520, 73.857],
    "Delhi": [28.704, 77.102], "Gurugram": [28.459, 77.027], "Noida": [28.535, 77.391], "Chandigarh": [30.733, 76.779],
    "Lucknow": [26.847, 80.947], "Kanpur": [26.449, 80.332], "Varanasi": [25.318, 82.974], "Prayagraj": [25.436, 81.846],
    "Patna": [25.594, 85.138], "Kolkata": [22.573, 88.364], "Bhubaneswar": [20.296, 85.825], "Hyderabad": [17.385, 78.487],
    "Bengaluru": [12.972, 77.595], "Chennai": [13.083, 80.271], "Kochi": [9.931, 76.267], "Nagpur": [21.146, 79.088],
    "Raipur": [21.251, 81.630], "Ranchi": [23.344, 85.310], "Guwahati": [26.144, 91.736], "Dehradun": [30.317, 78.032],
    "Amritsar": [31.634, 74.872], "Ludhiana": [30.901, 75.857], "Agra": [27.177, 78.008], "Mathura": [27.492, 77.674],
    "Haridwar": [29.946, 78.164], "Nashik": [19.998, 73.790], "Rajkot": [22.303, 70.802], "Gwalior": [26.218, 78.183]
  };

  const EL = {
    Me: d => [48.3313 + 3.24587e-5 * d, 7.0047 + 5.00e-8 * d, 29.1241 + 1.01444e-5 * d, 0.387098, 0.205635 + 5.59e-10 * d, 168.6562 + 4.0923344368 * d],
    Ve: d => [76.6799 + 2.46590e-5 * d, 3.3946 + 2.75e-8 * d, 54.8910 + 1.38374e-5 * d, 0.723330, 0.006773 - 1.302e-9 * d, 48.0052 + 1.6021302244 * d],
    Ma: d => [49.5574 + 2.11081e-5 * d, 1.8497 - 1.78e-8 * d, 286.5016 + 2.92961e-5 * d, 1.523688, 0.093405 + 2.516e-9 * d, 18.6021 + 0.5240207766 * d],
    Ju: d => [100.4542 + 2.76854e-5 * d, 1.3030 - 1.557e-7 * d, 273.8777 + 1.64505e-5 * d, 5.20256, 0.048498 + 4.469e-9 * d, 19.8950 + 0.0830853001 * d],
    Sa: d => [113.6634 + 2.38980e-5 * d, 2.4886 - 1.081e-7 * d, 339.3939 + 2.97661e-5 * d, 9.55475, 0.055546 - 9.499e-9 * d, 316.9670 + 0.0334442282 * d]
  };
  function kepler(M, e) { let E = M + deg * e * sin(M) * (1 + e * cos(M)); for (let i = 0; i < 8; i++) E = E - (E - deg * e * sin(E) - M) / (1 - e * cos(E)); return E; }
  function helio([N, i, w, a, e, M]) {
    M = n360(M); const E = kepler(M, e);
    const xv = a * (cos(E) - e), yv = a * Math.sqrt(1 - e * e) * sin(E);
    const v = Math.atan2(yv, xv) * deg, r = Math.hypot(xv, yv), u = v + w;
    return [r * (cos(N) * cos(u) - sin(N) * sin(u) * cos(i)), r * (sin(N) * cos(u) + cos(N) * sin(u) * cos(i)), r * sin(u) * sin(i)];
  }
  function sunPos(d) {
    const w = 282.9404 + 4.70935e-5 * d, e = 0.016709 - 1.151e-9 * d, M = n360(356.0470 + 0.9856002585 * d);
    const E = kepler(M, e), xv = cos(E) - e, yv = Math.sqrt(1 - e * e) * sin(E);
    const v = Math.atan2(yv, xv) * deg, r = Math.hypot(xv, yv), lon = n360(v + w);
    return { lon, r, M, x: r * cos(lon), y: r * sin(lon) };
  }
  function moonLon(d, sun) {
    const N = 125.1228 - 0.0529538083 * d, i = 5.1454, w = 318.0634 + 0.1643573223 * d, e = 0.054900, M = n360(115.3654 + 13.0649929509 * d);
    const [x, y] = helio([N, i, w, 60.2666, e, M]);
    let lon = Math.atan2(y, x) * deg;
    const Ls = n360(sun.M + 282.9404 + 4.70935e-5 * d), Lm = n360(M + w + N), D = Lm - Ls, F = Lm - N, Ms = sun.M;
    lon += -1.274 * sin(M - 2 * D) + 0.658 * sin(2 * D) - 0.186 * sin(Ms) - 0.059 * sin(2 * M - 2 * D) - 0.057 * sin(M - 2 * D + Ms)
      + 0.053 * sin(M + 2 * D) + 0.046 * sin(2 * D - Ms) + 0.041 * sin(M - Ms) - 0.035 * sin(D) - 0.031 * sin(M + Ms)
      - 0.015 * sin(2 * F - 2 * D) + 0.011 * sin(M - 4 * D);
    return n360(lon);
  }
  function dayNum(date) { return (date.getTime() / 864e5 + 2440587.5) - 2451543.5; } // Schlyter epoch 2000 Jan 0.0 UT
  function ayanamsa(date) { const y = date.getUTCFullYear() + date.getUTCMonth() / 12; return 23.853 + (y - 2000) * 0.0139697; }

  function tropical(date) {
    const d = dayNum(date), sun = sunPos(d), out = { Su: sun.lon, Mo: moonLon(d, sun) };
    const Mj = n360(19.8950 + 0.0830853001 * d), Ms = n360(316.9670 + 0.0334442282 * d);
    for (const k of ["Me", "Ve", "Ma", "Ju", "Sa"]) {
      const [x, y] = helio(EL[k](d));
      let lon = Math.atan2(y + sun.y, x + sun.x) * deg;
      if (k === "Ju") lon += -0.332 * sin(2 * Mj - 5 * Ms - 67.6) - 0.056 * sin(2 * Mj - 2 * Ms + 21) + 0.042 * sin(3 * Mj - 5 * Ms + 21);
      if (k === "Sa") lon += 0.812 * sin(2 * Mj - 5 * Ms - 67.6) - 0.229 * cos(2 * Mj - 4 * Ms - 2) + 0.119 * sin(Mj - 2 * Ms - 3);
      out[k] = n360(lon);
    }
    out.Ra = n360(125.1228 - 0.0529538083 * d); out.Ke = n360(out.Ra + 180);
    return out;
  }
  function sidereal(date) { const t = tropical(date), a = ayanamsa(date), o = {}; for (const k in t) o[k] = n360(t[k] - a); return o; }

  function ascendant(date, lat, lon) {
    const jd = date.getTime() / 864e5 + 2440587.5, d = jd - 2451545.0;
    const ramc = n360(280.46061837 + 360.98564736629 * d + lon);
    const eps = 23.4393 - 3.563e-7 * d;
    const asc = Math.atan2(cos(ramc), -(sin(ramc) * cos(eps) + Math.tan(lat * rad) * sin(eps))) * deg;
    return n360(n360(asc) - ayanamsa(date));
  }

  function fmtDeg(x) { const r = x % 30, dd = Math.floor(r), mm = Math.floor((r - dd) * 60); return `${dd}°${String(mm).padStart(2, "0")}′`; }
  function nakOf(l) { const i = Math.floor(l / (360 / 27)); return { i, name: NAK[i], pada: Math.floor((l % (360 / 27)) / (360 / 108)) + 1 }; }

  function dashas(moonSid, birth) {
    const nk = moonSid / (360 / 27), idx = Math.floor(nk) % 9, frac = nk - Math.floor(nk);
    const list = []; let t = birth.getTime();
    for (let j = 0; j < 9; j++) {
      const [lord, yrs] = DASHA[(idx + j) % 9], span = j === 0 ? yrs * (1 - frac) : yrs;
      const end = t + span * 365.25 * 864e5; list.push({ lord, start: new Date(t), end: new Date(end), yrs: span }); t = end;
    }
    return list;
  }

  /* birth: {y,m,d,hh,mm,lat,lon,tz} local time */
  function kundli(b) {
    const utc = new Date(Date.UTC(b.y, b.m - 1, b.d, b.hh, b.mm) - b.tz * 3600e3);
    const sid = sidereal(utc), later = sidereal(new Date(utc.getTime() + 864e5));
    const lagna = ascendant(utc, b.lat, b.lon), lagnaSign = Math.floor(lagna / 30);
    const planets = PL.map(p => {
      const l = sid[p.k], sign = Math.floor(l / 30);
      let diff = later[p.k] - l; if (diff > 180) diff -= 360; if (diff < -180) diff += 360;
      const retro = p.k === "Ra" || p.k === "Ke" ? true : (p.k !== "Su" && p.k !== "Mo" && diff < 0);
      return { ...p, lon: l, sign, house: (sign - lagnaSign + 12) % 12 + 1, deg: fmtDeg(l), nak: nakOf(l), retro };
    });
    const moon = planets[1], mars = planets[2];
    const now = Date.now(), ds = dashas(moon.lon, utc), cur = ds.find(x => x.start.getTime() <= now && x.end.getTime() > now) || ds[ds.length - 1];
    const tithi = Math.floor(n360(tropical(utc).Mo - tropical(utc).Su) / 12);
    return {
      utc, lagna, lagnaSign, lagnaDeg: fmtDeg(lagna), lagnaNak: nakOf(lagna), planets,
      rashi: moon.sign, nak: moon.nak, sunSign: planets[0].sign,
      manglik: [1, 2, 4, 7, 8, 12].includes(mars.house), dashas: ds, current: cur,
      tithi: (tithi < 15 ? "Shukla " : "Krishna ") + (tithi % 15 === 14 ? (tithi < 15 ? "Purnima" : "Amavasya") : TITHI[tithi % 15])
    };
  }

  function panchang(date) {
    const t = tropical(date), a = ayanamsa(date), mo = n360(t.Mo - a), su = n360(t.Su - a), ti = Math.floor(n360(t.Mo - t.Su) / 12);
    return {
      tithi: (ti < 15 ? "Shukla " : "Krishna ") + (ti % 15 === 14 ? (ti < 15 ? "Purnima" : "Amavasya") : TITHI[ti % 15]),
      moonSign: Math.floor(mo / 30), sunSign: Math.floor(su / 30), nak: NAK[Math.floor(mo / (360 / 27))],
      yoga: Math.floor(n360(mo + su) / (360 / 27)) + 1, phase: n360(t.Mo - t.Su)
    };
  }

  /* North Indian chart SVG, 400×400 */
  const HC = [[200, 100], [100, 38], [38, 100], [100, 200], [38, 300], [100, 362], [200, 300], [300, 362], [362, 300], [300, 200], [362, 100], [300, 38]];
  const HL = [[200, 182], [100, 84], [84, 100], [182, 200], [84, 300], [100, 316], [200, 218], [300, 316], [316, 300], [218, 200], [316, 100], [300, 84]];
  function chartSVG(k, opts = {}) {
    const ink = opts.ink || "#2453B3", acc = opts.acc || "#C2381E", fg = opts.fg || "#0E1B45";
    let s = `<svg viewBox="-6 -6 412 412" class="nchart" role="img" aria-label="North Indian birth chart"><g fill="none" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round">
      <rect class="cl" pathLength="1" x="0" y="0" width="400" height="400" rx="6"/><path class="cl" pathLength="1" d="M0 0 400 400M400 0 0 400"/><path class="cl" pathLength="1" d="M200 0 400 200 200 400 0 200Z"/></g>`;
    for (let h = 0; h < 12; h++) {
      const sign = (k.lagnaSign + h) % 12 + 1;
      s += `<text x="${HL[h][0]}" y="${HL[h][1] + 4}" text-anchor="middle" font-size="13" font-weight="700" fill="${acc}" class="cn" style="animation-delay:${0.6 + h * 0.05}s">${sign}</text>`;
      const here = k.planets.filter(p => p.house === h + 1);
      const tri = [1, 2, 4, 5, 7, 8, 10, 11].includes(h);
      const lines = [];
      if (h === 0) lines.push(`<tspan fill="${acc}">La</tspan>`);
      here.forEach(p => lines.push(`${p.k}${p.retro && p.k !== "Ra" && p.k !== "Ke" ? "ᴿ" : ""}`));
      const per = tri ? 2 : 3, rows = [];
      for (let i = 0; i < lines.length; i += per) rows.push(lines.slice(i, i + per).join(" "));
      const y0 = HC[h][1] - (rows.length - 1) * 8 + 4;
      rows.forEach((r, i) => { s += `<text x="${HC[h][0]}" y="${y0 + i * 16}" text-anchor="middle" font-size="${tri ? 12 : 14}" font-weight="600" fill="${fg}" class="cp" style="animation-delay:${1 + h * 0.06}s">${r}</text>`; });
    }
    return s + "</svg>";
  }

  window.Astro = { RASHI, LORD, NAK, CITIES, PL, kundli, panchang, chartSVG, sidereal, n360 };
})();
