/* Cold Read — illustrations: suspect portraits, chapter scenes, the score curve. */
(function () {
  "use strict";

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function c(v) { return Math.max(0, Math.min(255, Math.round(v + amt))); }
    return "#" + ((1 << 24) + (c(r) << 16) + (c(g) << 8) + c(b)).toString(16).slice(1);
  }

  /* ---------- suspect portraits (booking-photo style) ---------- */
  var OUTFITS = {
    denim: { main: "#4b6d93", trim: "#33506f", inner: "#e7e1d3" },
    work: { main: "#6d7b61", trim: "#4f5b45", inner: "#5f6c54", patch: true },
    polo: { main: "#8c3340", trim: "#6c2430", inner: "#8c3340", collar: true },
    tee: { main: "#e6e1d6", trim: "#c8c2b5", inner: "#e6e1d6" },
    cardigan: { main: "#7b6449", trim: "#5d4a34", inner: "#dcd6c8", buttons: true },
    tie: { main: "#3b4048", trim: "#2a2e34", inner: "#eef0f2", tie: "#5b2531" }
  };
  var HAIR = {
    shaggy: "M34 66 Q30 30 60 28 Q90 30 86 66 Q84 54 80 50 Q76 60 74 50 Q66 42 58 46 Q50 42 44 50 Q42 60 38 50 Q35 56 34 66Z",
    short: "M38 58 Q37 33 60 32 Q83 33 82 58 Q79 45 70 43 Q60 41 50 43 Q41 45 38 58Z",
    feathered: "M36 62 Q34 31 62 31 Q87 33 84 62 Q82 47 72 42 Q64 47 54 44 Q44 47 40 52 Q38 56 36 62Z",
    buzz: "M39 52 Q40 35 60 34 Q80 35 81 52 Q74 41 60 40 Q46 41 39 52Z",
    bald: "M37 62 Q36 52 40 47 L42 47 Q40 54 41 64Z M83 62 Q84 52 80 47 L78 47 Q80 54 79 64Z",
    parted: "M38 57 Q37 34 56 33 Q84 33 82 57 Q80 45 72 42 L54 41 Q44 43 38 57Z"
  };

  function portrait(id, look, label) {
    look = look || {};
    var h = hash(id);
    var o = OUTFITS[look.outfit] || OUTFITS.tee;
    var w = look.build === "heavy" ? 25 : look.build === "slim" ? 20 : 22.5;
    var skin = look.skin || "#e0b58f";
    var skinD = shade(skin, -28);
    var hairC = look.hairColor || "#3a2a1c";
    var old = (look.age || 30) >= 50;
    var cx = 60, cy = 62;
    var sh = look.build === "heavy" ? 10 : look.build === "slim" ? 20 : 15;
    var num = label || String(1000 + (h % 9000));
    var svg = '<svg class="mug" viewBox="0 0 120 140" role="img" aria-label="Illustrated booking photo">' +
      '<rect width="120" height="140" class="mug-bg"/>';
    var TICKS = ["7'", "6'6", "6'", "5'6", "5'", "4'6", "4'", "3'6", "3'"];
    for (var y = 14, k = 0; y < 140; y += 14, k++) {
      svg += '<line x1="0" x2="120" y1="' + y + '" y2="' + y + '" class="mug-line"/>' +
        '<text x="3" y="' + (y - 3) + '" class="mug-tick">' + TICKS[k] + "</text>";
    }
    // shoulders / outfit
    svg += '<path d="M' + sh + ' 140 Q' + (sh + 4) + ' 104 60 99 Q' + (120 - sh - 4) + ' 104 ' + (120 - sh) + ' 140Z" fill="' + o.main + '"/>';
    svg += '<path d="M48 101 L60 120 L72 101 Q66 99 60 99 Q54 99 48 101Z" fill="' + o.inner + '"/>';
    if (o.tie) svg += '<path d="M57 104 L63 104 L65 128 L60 134 L55 128Z" fill="' + o.tie + '"/><path d="M48 101 L60 106 L72 101 L74 104 L60 112 L46 104Z" fill="#fff" opacity=".9"/>';
    if (o.collar) svg += '<path d="M47 100 L60 110 L55 116 L44 104Z M73 100 L60 110 L65 116 L76 104Z" fill="' + o.trim + '"/>';
    if (o.buttons) svg += '<path d="M50 102 L58 140 M70 102 L62 140" stroke="' + o.trim + '" stroke-width="3"/><circle cx="58" cy="122" r="1.6" fill="#2a2018"/><circle cx="59" cy="132" r="1.6" fill="#2a2018"/>';
    if (o.patch) svg += '<rect x="74" y="114" width="16" height="9" rx="2" fill="#e8e3d2"/><line x1="77" x2="87" y1="118.5" y2="118.5" stroke="#9a3a2a" stroke-width="1.6"/>';
    if (look.outfit === "denim") svg += '<path d="M44 104 L52 128 M76 104 L68 128" stroke="' + o.trim + '" stroke-width="2" fill="none"/><circle cx="50" cy="118" r="1.4" fill="#c9b27a"/><circle cx="70" cy="118" r="1.4" fill="#c9b27a"/>';
    // neck
    svg += '<path d="M52 86 L52 101 Q60 106 68 101 L68 86Z" fill="' + skinD + '"/>';
    // ears
    svg += '<ellipse cx="' + (cx - w) + '" cy="' + (cy + 2) + '" rx="3.6" ry="6" fill="' + skinD + '"/><ellipse cx="' + (cx + w) + '" cy="' + (cy + 2) + '" rx="3.6" ry="6" fill="' + skinD + '"/>';
    // head
    var jaw = look.build === "heavy" ? 30 : 27;
    svg += '<path d="M' + (cx - w) + " " + (cy - 4) + " Q" + (cx - w) + " " + (cy - 30) + " " + cx + " " + (cy - 30) + " Q" + (cx + w) + " " + (cy - 30) + " " + (cx + w) + " " + (cy - 4) +
      " Q" + (cx + w) + " " + (cy + jaw - 6) + " " + cx + " " + (cy + jaw) + " Q" + (cx - w) + " " + (cy + jaw - 6) + " " + (cx - w) + " " + (cy - 4) + 'Z" fill="' + skin + '"/>';
    // stubble
    if (look.facial === "stubble") svg += '<path d="M' + (cx - w + 3) + " " + (cy + 6) + " Q" + cx + " " + (cy + jaw + 8) + " " + (cx + w - 3) + " " + (cy + 6) + " Q" + cx + " " + (cy + 16) + " " + (cx - w + 3) + " " + (cy + 6) + 'Z" fill="' + hairC + '" opacity=".28"/>';
    // age lines
    if (old) svg += '<path d="M50 44 Q60 41 70 44 M52 48 Q60 46 68 48" stroke="' + skinD + '" stroke-width="1" fill="none"/>' +
      '<path d="M48 70 Q46 78 50 82 M72 70 Q74 78 70 82" stroke="' + skinD + '" stroke-width="1.2" fill="none"/>';
    // eyes + brows (blink group)
    svg += '<path d="M44 53 Q50 50 55 53 M65 53 Q70 50 76 53" stroke="' + shade(hairC, old ? 40 : 0) + '" stroke-width="2.4" stroke-linecap="round" fill="none"/>';
    svg += '<g class="eyes"><ellipse cx="50" cy="60" rx="3.6" ry="2.6" fill="#fff"/><ellipse cx="70" cy="60" rx="3.6" ry="2.6" fill="#fff"/>' +
      '<circle cx="50.5" cy="60" r="1.8" fill="#2b2420"/><circle cx="70.5" cy="60" r="1.8" fill="#2b2420"/></g>';
    // nose & mouth
    svg += '<path d="M60 60 Q58 70 56 72 Q60 74 63 72" stroke="' + skinD + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    if (look.facial === "mustache") svg += '<path d="M50 77 Q55 73 60 75 Q65 73 70 77 Q65 79 60 78 Q55 79 50 77Z" fill="' + hairC + '"/>';
    svg += '<path d="M53 81 Q60 ' + (old ? 80 : 83) + ' 67 81" stroke="#8a4a3e" stroke-width="2" fill="none" stroke-linecap="round"/>';
    // hair
    var hp = HAIR[look.hair] || HAIR.short;
    svg += '<path d="' + hp + '" fill="' + hairC + '"' + (look.hair === "buzz" ? ' opacity=".85"' : "") + "/>";
    if (look.hair === "parted") svg += '<path d="M54 41 Q55 37 57 34" stroke="' + shade(hairC, -30) + '" stroke-width="1.2" fill="none"/>';
    // glasses
    if (look.glasses) svg += '<g fill="none" stroke="#2a2a2a" stroke-width="1.8"><rect x="42" y="54" width="15" height="11" rx="3"/><rect x="63" y="54" width="15" height="11" rx="3"/><path d="M57 59 Q60 57 63 59 M42 58 L38 57 M78 58 L82 57"/></g>';
    // placard
    svg += '<rect x="30" y="112" width="60" height="22" rx="1" class="mug-plate"/>' +
      '<text x="60" y="121" class="mug-dept">WICHITA PD</text><text x="60" y="131" class="mug-num">' + num + "</text>";
    return svg + "</svg>";
  }

  /* ---------- chapter scenes ---------- */
  var SCENES = {
    house:
      '<rect width="320" height="160" class="sc-sky"/>' +
      '<circle cx="262" cy="34" r="14" class="sc-moon"/>' +
      '<path d="M0 132 L320 132 L320 160 L0 160Z" class="sc-ground"/>' +
      '<path d="M70 132 L70 82 L130 46 L190 82 L190 132Z" class="sc-house"/>' +
      '<path d="M62 86 L130 40 L198 86" class="sc-roof"/>' +
      '<rect x="88" y="96" width="22" height="18" class="sc-win"/><rect x="150" y="96" width="22" height="18" class="sc-win lit"/>' +
      '<rect x="120" y="104" width="20" height="28" class="sc-door"/>' +
      '<path d="M216 132 L216 70" class="sc-pole"/><path d="M200 74 L232 74" class="sc-pole"/><path d="M216 74 Q190 90 160 82" class="sc-wire cut"/>' +
      '<rect x="236" y="116" width="44" height="16" rx="5" class="sc-car"/><circle cx="246" cy="132" r="5" class="sc-tire"/><circle cx="270" cy="132" r="5" class="sc-tire"/>',
    phonebooth:
      '<rect width="320" height="160" class="sc-sky"/>' +
      '<path d="M0 134 L320 134 L320 160 L0 160Z" class="sc-ground"/>' +
      '<path d="M220 134 L220 30 M220 30 Q236 22 250 30" class="sc-pole"/>' +
      '<path d="M236 32 L274 134 L190 134Z" class="sc-beam"/>' +
      '<circle cx="250" cy="32" r="5" class="sc-bulb"/>' +
      '<rect x="120" y="50" width="56" height="84" rx="3" class="sc-booth"/>' +
      '<rect x="127" y="62" width="42" height="52" class="sc-glass"/>' +
      '<rect x="128" y="52" width="40" height="8" class="sc-sign"/>' +
      '<rect x="150" y="76" width="12" height="18" rx="2" class="sc-phone"/><path d="M152 80 Q140 90 150 100" class="sc-cord"/>',
    files:
      '<rect width="320" height="160" class="sc-wall"/>' +
      '<path d="M0 128 L320 128 L320 160 L0 160Z" class="sc-desk"/>' +
      '<rect x="40" y="78" width="70" height="50" class="sc-box"/><rect x="48" y="90" width="54" height="14" class="sc-boxlabel"/>' +
      '<rect x="56" y="38" width="64" height="40" class="sc-box b2"/><rect x="64" y="50" width="48" height="12" class="sc-boxlabel"/>' +
      '<rect x="128" y="96" width="70" height="32" class="sc-box"/><rect x="136" y="104" width="54" height="12" class="sc-boxlabel"/>' +
      '<path d="M236 128 L250 78 L270 78" class="sc-lamp"/><path d="M262 70 L290 70 L298 90 L254 90Z" class="sc-shade"/>' +
      '<path d="M256 90 L296 90 L320 128 L232 128Z" class="sc-beam"/>' +
      '<rect x="218" y="116" width="58" height="10" rx="1" class="sc-paper"/>',
    disk:
      '<rect width="320" height="160" class="sc-wall"/>' +
      '<path d="M0 124 L320 124 L320 160 L0 160Z" class="sc-desk"/>' +
      '<rect x="40" y="40" width="96" height="74" rx="4" class="sc-monitor"/><rect x="48" y="48" width="80" height="56" class="sc-screen"/>' +
      '<rect x="78" y="114" width="20" height="10" class="sc-monitor"/>' +
      '<path d="M54 60 L110 60 M54 70 L98 70 M54 80 L104 80" class="sc-text"/>' +
      '<g class="sc-floppy"><rect x="176" y="72" width="52" height="52" rx="3" class="sc-fl"/><rect x="190" y="72" width="24" height="16" class="sc-flshut"/><rect x="184" y="98" width="36" height="22" class="sc-fllabel"/></g>' +
      '<rect x="240" y="96" width="56" height="28" class="sc-env"/><path d="M240 96 L268 112 L296 96" class="sc-envflap"/>'
  };
  function scene(name) {
    if (!SCENES[name]) return "";
    return '<svg class="scene sc-' + name + '" viewBox="0 0 320 160" aria-hidden="true">' + SCENES[name] + "</svg>";
  }

  /* ---------- estimated score distribution ---------- */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function simulate(seedStr, sim, scoreFn) {
    var r = rng(hash(seedStr)), out = [];
    function gauss() { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v); }
    for (var i = 0; i < 4000; i++) {
      var x = r();
      if (x < sim.wrong + sim.cold) { out.push(0); continue; }
      var steps = Math.max(0, Math.round(Math.abs(gauss()) * sim.extraSteps * 0.9 + r() * sim.extraSteps * 0.5));
      var days = Math.max(0, Math.round(Math.abs(gauss()) * sim.extraDays * 0.9 + r() * sim.extraDays * 0.4));
      out.push(scoreFn(steps, days));
    }
    return out;
  }
  function percentile(list, v) {
    var below = 0, eq = 0;
    list.forEach(function (s) { if (s < v) below++; else if (s === v) eq++; });
    return Math.max(1, Math.min(99, Math.round((below + eq / 2) / list.length * 100)));
  }
  function curveSVG(list, mine) {
    var W = 600, H = 230, L = 34, R = 24, T = 30, B = 38;
    var pw = W - L - R, ph = H - T - B;
    var solved = list.filter(function (s) { return s > 0; });
    var zeros = list.length - solved.length;
    // kernel density over 0..1000
    var pts = [], bw = 55, max = 0;
    for (var x = 0; x <= 1000; x += 10) {
      var d = 0;
      for (var i = 0; i < solved.length; i += 2) { var z = (x - solved[i]) / bw; d += Math.exp(-0.5 * z * z); }
      pts.push([x, d]); if (d > max) max = d;
    }
    function sx(x) { return L + x / 1000 * pw; }
    function sy(d) { return T + ph - d / max * ph * 0.92; }
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + sx(p[0]).toFixed(1) + " " + sy(p[1]).toFixed(1); }).join(" ");
    var area = line + " L" + sx(1000) + " " + (T + ph) + " L" + sx(0) + " " + (T + ph) + "Z";
    var zeroH = Math.min(ph * 0.92, zeros / list.length * ph * 2.4);
    var mx = sx(Math.max(0, Math.min(1000, mine)));
    var my = mine > 0 ? sy(pts[Math.round(Math.min(1000, mine) / 10)][1]) : T + ph - zeroH;
    var svg = '<svg class="curve" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Estimated score distribution with your score marked">' +
      '<defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" class="cg-a"/><stop offset="1" class="cg-b"/></linearGradient></defs>';
    [0, 250, 500, 750, 1000].forEach(function (t) {
      svg += '<line x1="' + sx(t) + '" x2="' + sx(t) + '" y1="' + T + '" y2="' + (T + ph) + '" class="cv-grid"/>' +
        '<text x="' + sx(t) + '" y="' + (H - 10) + '" class="cv-tick">' + t + "</text>";
    });
    svg += '<rect x="' + (sx(0) - 7) + '" y="' + (T + ph - zeroH) + '" width="14" height="' + zeroH + '" class="cv-zero"/>';
    svg += '<path d="' + area + '" class="cv-area"/><path d="' + line + '" class="cv-line" pathLength="1"/>';
    svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (T + ph) + '" y2="' + (T + ph) + '" class="cv-axis"/>';
    svg += '<g class="cv-me" style="--mx:' + mx + 'px"><line x1="' + mx + '" x2="' + mx + '" y1="' + (T + 4) + '" y2="' + (T + ph) + '" class="cv-meline"/>' +
      '<circle cx="' + mx + '" cy="' + my + '" r="7" class="cv-medot"/>' +
      '<text x="' + Math.min(W - R - 18, Math.max(L + 18, mx)) + '" y="' + (T - 8) + '" class="cv-melabel">You</text></g>';
    return svg + "</svg>";
  }

  window.ColdArt = { portrait: portrait, scene: scene, simulate: simulate, percentile: percentile, curveSVG: curveSVG };
})();
