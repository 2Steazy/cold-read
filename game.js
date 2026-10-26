(function () {
  "use strict";

  var LAUNCH_DATE = "2026-10-26"; // Case #1
  var RANKS = [
    { min: 900, title: "Chief of Detectives" },
    { min: 750, title: "Homicide Lieutenant" },
    { min: 600, title: "Detective Sergeant" },
    { min: 400, title: "Detective" },
    { min: 200, title: "Patrol Officer" },
    { min: 0, title: "Records Clerk" }
  ];
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var cases = window.COLD_READ_CASES || [];
  var app = document.getElementById("app");
  var overlay = document.getElementById("overlay");

  /* ================= dates ================= */
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function parse(s) { var p = s.split("-").map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); }
  function iso(t) { var d = new Date(t); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function addDays(s, n) { return iso(parse(s) + n * 86400000); }
  function diffDays(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
  function fmt(s) { var d = new Date(parse(s)); return MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear(); }
  function span(a, b) {
    var da = new Date(parse(a)), db = new Date(parse(b));
    var m = (db.getUTCFullYear() - da.getUTCFullYear()) * 12 + db.getUTCMonth() - da.getUTCMonth();
    if (db.getUTCDate() < da.getUTCDate()) m--;
    var y = Math.floor(m / 12), mo = m % 12, out = [];
    if (y) out.push(y + (y === 1 ? " yr" : " yrs"));
    if (mo) out.push(mo + (mo === 1 ? " mo" : " mos"));
    return out.length ? out.join(" ") : diffDays(a, b) + " days";
  }
  function localKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  var now = new Date();
  var todayKey = localKey(now);
  var caseNo = Math.max(1, diffDays(LAUNCH_DATE, todayKey) + 1);
  var C = cases[(caseNo - 1) % cases.length];

  /* ================= storage ================= */
  function load(k) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var storeKey = "coldread3:" + todayKey;
  function fresh() {
    return { caseId: C.id, screen: "intro", tab: "evidence", ch: 0, clock: C.chapters[0].start,
      fired: [], sched: {}, flags: [], files: [], seen: [], suspects: [], done: [], steps: 0, days: 0,
      accused: null, accuseDate: null, hasDna: false, log: [], outcome: null };
  }
  var S = load(storeKey);
  if (!S || S.caseId !== C.id) S = fresh();
  var stats = load("coldread:stats2") || { played: 0, solved: 0, streak: 0, best: 0, lastDay: null };
  function persist() { save(storeKey, S); }

  /* ================= helpers ================= */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function has(arr, x) { return arr.indexOf(x) !== -1; }
  function add(arr, xs) { (xs || []).forEach(function (x) { if (!has(arr, x)) arr.push(x); }); }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function chapter() { return C.chapters[S.ch]; }
  function chIndex(id) { for (var i = 0; i < C.chapters.length; i++) if (C.chapters[i].id === id) return i; return 0; }

  /* ================= engine ================= */
  function eventDate(ev) {
    if (ev.date) return ev.date;
    return S.sched[ev.id] || null;
  }
  function setFlags(fl) {
    (fl || []).forEach(function (f) {
      if (has(S.flags, f)) return;
      S.flags.push(f);
      C.events.forEach(function (ev) {
        if (ev.after && ev.after.flag === f && !S.sched[ev.id]) S.sched[ev.id] = addDays(S.clock, ev.after.days);
      });
    });
  }
  function fireDue() {
    var fired = [];
    var due = C.events.filter(function (ev) {
      var d = eventDate(ev);
      return d && !has(S.fired, ev.id) && chIndex(ev.chapter) <= S.ch && parse(d) <= parse(S.clock);
    }).sort(function (a, b) { return parse(eventDate(a)) - parse(eventDate(b)); });
    due.forEach(function (ev) {
      S.fired.push(ev.id);
      add(S.files, ev.files); add(S.suspects, ev.suspects); setFlags(ev.flags);
      fired.push(ev);
    });
    return fired;
  }
  function nextPending() {
    var list = C.events.filter(function (ev) {
      var d = eventDate(ev);
      return d && !has(S.fired, ev.id) && chIndex(ev.chapter) === S.ch;
    }).sort(function (a, b) { return parse(eventDate(a)) - parse(eventDate(b)); });
    return list[0] || null;
  }

  /* ================= command interpreter ================= */
  var SYN = {
    interview: ["question", "talk", "speak", "ask", "interrogate", "quiz", "chat", "meet", "reinterview", "depose"],
    child: ["children", "kid", "kids", "youngster"],
    neighbor: ["neighbour", "neighborhood", "neighbourhood"],
    canvass: ["canvas"],
    car: ["automobile", "auto", "sedan"],
    tip: ["tipster", "lead"],
    video: ["videotape"],
    camera: ["cam"],
    ad: ["advertisement", "advertise", "advert"],
    newspaper: ["paper", "press"],
    husband: ["hubby"],
    fingerprint: ["prints"],
    church: ["churches"],
    floppy: ["diskette"],
    disk: ["disc"],
    parole: ["parolee"]
  };
  var GENERIC = [
    { id: "polygraph", words: ["polygraph", "lie detector"], days: 3, text: "The polygraph results come back inconclusive. Nothing you can take to court." },
    { id: "profile", words: ["profile", "profiler", "fbi", "psychologist", "psychic", "behavioral"], days: 21, text: "A behavioral profile comes back. It describes a type of man, not a name." },
    { id: "footage", words: ["footage", "video", "camera", "cctv", "security"], days: 3, text: "There's no footage that shows anything useful." },
    { id: "public", words: ["newspaper", "ad", "classified", "conference", "appeal", "tv", "television", "radio", "media", "reward", "poster", "flyer", "announce", "public", "warn"], days: 7, text: "The story runs. Calls come in for days. None of them go anywhere." },
    { id: "surveil", words: ["stakeout", "surveil", "surveillance", "tail", "follow", "watch", "monitor", "undercover", "patrol"], days: 7, text: "A week of surveillance. Nobody suspicious comes or goes." },
    { id: "canvass", words: ["canvass", "door", "knock"], days: 3, text: "Officers knock on doors for three days. Nobody saw anything useful." },
    { id: "interview", words: ["interview", "witness", "statement"], days: 2, text: "Interviews take two days. Nobody tells you anything that moves the case." },
    { id: "lab", words: ["fingerprint", "print", "dust", "fiber", "hair", "blood", "lab", "test", "analyze", "analyse", "examine", "forensic", "evidence", "sample", "serology", "rope", "cord", "knot"], days: 10, text: "The lab takes ten days. The results don't point to anyone." },
    { id: "mail", words: ["postmark", "stamp", "handwriting", "typewriter", "ink", "envelope"], days: 7, text: "The materials are ordinary. They could have come from anywhere in Wichita." },
    { id: "search", words: ["search", "raid", "warrant", "dig", "inspect", "sweep", "comb", "scene"], days: 3, text: "The search turns up nothing new." },
    { id: "records", words: ["record", "background", "database", "check", "lookup", "research", "history", "registry", "file", "list", "employee", "employer", "phone", "trace", "track", "locate", "find", "look"], days: 2, text: "Two days in the records room. Nothing useful." }
  ];
  var ERA = [
    { words: ["genealogy", "ancestry", "23andme", "gedmatch", "family tree"], before: "2018-04-01", text: "Genetic genealogy won't be used to catch a killer until 2018." },
    { words: ["dna", "genetic", "genome"], before: "1987-01-01", text: "DNA profiling doesn't exist yet. It won't reach American crime labs until the late 1980s." },
    { words: ["facebook", "myspace", "instagram", "twitter", "social media"], before: "2006-09-01", text: "Social media doesn't exist yet." },
    { words: ["internet", "google", "online", "website", "web", "email", "e mail"], before: "1995-01-01", text: "There's no public internet yet." },
    { words: ["cell", "cellphone", "mobile", "gps", "text message"], before: "1990-01-01", text: "Cell phones aren't in common use yet. There are no records to pull." },
    { words: ["metadata", "floppy", "computer forensic", "digital forensic"], before: "1985-01-01", text: "There's nothing digital to examine in this era." }
  ];
  var META = [
    { words: ["arrest", "charge", "accuse", "convict", "jail him", "lock up"], text: "Arrests are made from the Suspects tab." },
    { words: ["hint", "help", "solution"], text: "No hints. Everything you need is in the files." },
    { words: ["wait", "time pass", "skip"], text: "Use Let time pass at the top when you want time to move." }
  ];
  var COMMON = ("the a an to at in of for and with on his her their its who what where when from about any all get go run see them him " +
    "man men woman women people house home again more other new old into up out over by this that these those some find check look make " +
    "do did does done have has had be is was were are will would could should can may might please then there here my our your " +
    "process pull place put take send bring give call visit review read study open show tell compare collect gather request obtain contact " +
    "notify photograph measure map write publish release issue hold keep start begin try use need want every everyone everybody anyone someone " +
    "named name local nearby area city wichita kansas office station work job school friend relative daughter son mother wife " +
    "footage security video camera newspaper paper ad ads saying say says said ok okay yes no not him them whose which how why").split(" ");

  function stem(w) {
    if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + "y";
    if (w.length > 5 && /ing$/.test(w)) return w.slice(0, -3);
    if (w.length > 4 && /ed$/.test(w)) return w.slice(0, -2);
    if (w.length > 4 && /(ch|sh|x|ss)es$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }
  var CANON = {};
  Object.keys(SYN).forEach(function (k) { SYN[k].concat([k]).forEach(function (w) { CANON[stem(w)] = stem(k); CANON[w] = stem(k); }); });
  function forms(w) {
    var st = stem(w);
    return [w, st, st + "e"].map(function (x) { return CANON[x] || x; });
  }
  function norm(s) { return " " + String(s).toLowerCase().replace(/'s\b/g, "").replace(/[^a-z0-9]+/g, " ").trim() + " "; }

  var VOCAB = null;
  function vocab() {
    if (VOCAB) return VOCAB;
    var v = {};
    function addW(t) { t.split(" ").forEach(function (w) { if (w) v[w] = 1; }); }
    C.actions.concat(C.deadEnds || []).forEach(function (a) { a.keys.forEach(function (p) { p.forEach(addW); }); });
    GENERIC.concat(ERA, META).forEach(function (g) { g.words.forEach(addW); });
    Object.keys(SYN).forEach(function (k) { addW(k); SYN[k].forEach(addW); });
    Object.keys(C.suspects).forEach(function (k) { addW(C.suspects[k].name.toLowerCase()); });
    COMMON.forEach(addW);
    "interview canvass neighbor victim body scene killer suspect family brother sister wife mother father police detective records tape recording voice letter note".split(" ").forEach(addW);
    VOCAB = Object.keys(v);
    return VOCAB;
  }
  function lev(a, b) {
    if (a === b) return 0;
    var prev = [], pp = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], pp[j - 2] + 1);
      }
      pp = prev; prev = cur;
    }
    return prev[b.length];
  }
  function correct(raw) {
    var words = norm(raw).trim().split(" ").filter(Boolean);
    var V = vocab(), stems = {};
    V.forEach(function (w) { stems[stem(w)] = 1; });
    var changed = false;
    var out = words.map(function (w) {
      if (w.length < 4 || V.indexOf(w) !== -1 || stems[stem(w)] || /\d/.test(w)) return w;
      var best = null, bd = 99, lim = w.length >= 7 ? 2 : 1, sw = stem(w), plural = sw !== w ? w.slice(sw.length) : "";
      V.forEach(function (c) {
        var d = Math.abs(c.length - w.length) <= lim ? lev(w, c) : 99;
        if (d < bd) { bd = d; best = c; }
        if (plural && Math.abs(c.length - sw.length) <= lim) {
          var d2 = lev(sw, c);
          if (d2 < bd) { bd = d2; best = c + plural; }
        }
      });
      if (best && bd <= lim) { changed = true; return best; }
      return w;
    });
    return { text: out.join(" "), words: out, changed: changed };
  }
  function tokenSet(words) {
    var set = {};
    words.forEach(function (w) { forms(w).forEach(function (f) { set[f] = 1; }); });
    return set;
  }
  function termHit(term, set, sentence) {
    if (term.indexOf(" ") !== -1) return sentence.indexOf(" " + term + " ") !== -1;
    return forms(term).some(function (f) { return set[f]; });
  }
  function patternScore(keys, set, sentence) {
    var best = 0;
    keys.forEach(function (p) {
      if (p.every(function (t) { return termHit(t, set, sentence); })) best = Math.max(best, p.join(" ").split(" ").length);
    });
    return best;
  }
  function wordHit(words, set, sentence) {
    return words.some(function (w) { return termHit(w, set, sentence); });
  }

  function interpret(raw) {
    var cor = correct(raw);
    var sentence = " " + cor.text + " ";
    var set = tokenSet(cor.words);
    var res = { readAs: cor.changed ? cor.text : null };
    function out(o) { for (var k in o) res[k] = o[k]; return res; }

    for (var m = 0; m < META.length; m++) if (wordHit(META[m].words, set, sentence)) return out({ kind: "meta", text: META[m].text, days: 0, steps: 0 });
    for (var e = 0; e < ERA.length; e++) {
      if (wordHit(ERA[e].words, set, sentence) && parse(S.clock) < parse(ERA[e].before)) return out({ kind: "era", text: ERA[e].text, days: 0, steps: 0 });
    }
    // real leads
    var best = null, bs = 0, doneBest = null, dbs = 0;
    C.actions.forEach(function (a) {
      if (chIndex(a.chapter) !== S.ch) return;
      if (!a.requires.every(function (f) { return has(S.flags, f); })) return;
      var sc = patternScore(a.keys, set, sentence);
      if (!sc) return;
      if (has(S.done, a.id)) { if (sc > dbs) { dbs = sc; doneBest = a; } }
      else if (sc > bs) { bs = sc; best = a; }
    });
    // case-specific dead ends
    var dead = null, ds = 0;
    (C.deadEnds || []).forEach(function (d) {
      if (d.chapter && chIndex(d.chapter) !== S.ch) return;
      var sc = patternScore(d.keys, set, sentence);
      if (sc > ds) { ds = sc; dead = d; }
    });
    if (best && bs >= ds) return out({ kind: "lead", action: best, days: best.days, steps: 1 });
    if (doneBest && dbs >= ds && dbs >= bs) return out({ kind: "repeat", text: "You've already done that. The results are on the board.", days: 0, steps: 0 });
    if (dead) return out({ kind: "dead", text: dead.text, days: dead.days, steps: 1 });
    if (best) return out({ kind: "lead", action: best, days: best.days, steps: 1 });
    for (var g = 0; g < GENERIC.length; g++) {
      if (wordHit(GENERIC[g].words, set, sentence)) return out({ kind: "dead", text: GENERIC[g].text, days: GENERIC[g].days, steps: 1 });
    }
    return out({ kind: "gibberish", text: "Your sergeant doesn't follow. A day goes by.", days: 1, steps: 1 });
  }

  function runCommand(raw) {
    raw = String(raw || "").trim().slice(0, 140);
    if (!raw) return;
    var r = interpret(raw);
    var before = S.clock;
    var entry = { date: S.clock, cmd: raw, readAs: r.readAs, kind: r.kind, days: r.days, files: [] };
    if (r.steps) { S.steps += r.steps; S.days += r.days; S.clock = addDays(S.clock, r.days); }
    if (r.kind === "lead") {
      var a = r.action;
      S.done.push(a.id);
      add(S.files, a.files); add(S.suspects, a.suspects); setFlags(a.flags);
      if (has(S.flags, "dna")) S.hasDna = true;
      entry.files = (a.files || []).slice();
      entry.text = (a.files || []).length === 1 ? "New file pinned to the board." : (a.files || []).length + " new files pinned to the board.";
      if ((a.suspects || []).length) entry.text += " A new name goes on the suspect list.";
    } else entry.text = r.text;
    S.log.push(entry);
    var fired = fireDue();
    persist();
    if (checkCold()) return;
    afterChange(before, fired, entry.files, r.kind === "lead" ? (r.action.suspects || []) : [], true);
  }

  function checkCold() {
    if (parse(S.clock) <= parse(C.coldDate)) return false;
    S.outcome = "cold"; S.screen = "end"; persist(); recordStats(); closeOverlay(); renderEnd(true); window.scrollTo(0, 0);
    return true;
  }

  function passTime() {
    var before = S.clock;
    var ev = nextPending();
    var fired;
    if (ev) {
      S.clock = eventDate(ev);
      fired = fireDue();
    } else if (S.ch < C.chapters.length - 1) {
      S.ch += 1;
      var st = chapter().start;
      if (parse(st) > parse(S.clock)) S.clock = st;
      fired = fireDue();
      persist();
      showChapterCard(before, fired);
      return;
    } else {
      S.clock = addDays(S.clock, 182);
      fired = [];
      persist();
      if (checkCold()) return;
      toast("Six months pass. Nothing new comes in.");
      renderPlay({ clockFrom: before });
      return;
    }
    persist();
    afterChange(before, fired, [], []);
  }

  /* ================= scoring ================= */
  function score() {
    if (S.outcome === "cold" || S.accused !== C.culprit) return 0;
    return scoreFor(Math.max(0, S.steps - C.par.steps), Math.max(0, S.days - C.par.days));
  }
  function scoreFor(extraSteps, extraDays) {
    return Math.max(50, Math.min(1000, 1000 - 15 * extraSteps - 2 * extraDays));
  }
  function rank(sc) {
    if (S.outcome === "cold" || S.accused !== C.culprit) return RANKS[RANKS.length - 1];
    for (var i = 0; i < RANKS.length; i++) if (sc >= RANKS[i].min) return RANKS[i];
    return RANKS[RANKS.length - 1];
  }

  /* ================= rendering: shared ================= */
  function clockHTML(date) {
    var d = new Date(parse(date));
    var parts = [MONTHS[d.getUTCMonth()].toUpperCase(), pad(d.getUTCDate()), String(d.getUTCFullYear())];
    return '<div class="clock" role="timer" aria-label="Case clock: ' + fmt(date) + '">' +
      parts.map(function (p, i) { return '<span class="flap f' + i + '" data-v="' + p + '">' + p + "</span>"; }).join("") +
      "</div>";
  }
  function hud() {
    var pend = nextPending();
    var last = S.ch >= C.chapters.length - 1;
    var waitLabel = pend ? "Let time pass" : (!last ? "Jump to " + new Date(parse(C.chapters[S.ch + 1].start)).getUTCFullYear() : "Let the case sit 6 months");
    return '<header class="hud">' +
      '<div class="hud-top"><span class="brand">Cold Read</span><span class="caseno">Case ' + pad3(caseNo) + " · " + esc(C.place) + "</span></div>" +
      '<div class="hud-main">' + clockHTML(S.clock) +
        '<div class="meters">' +
          '<div class="meter"><b id="m-steps">' + S.steps + "</b><span>steps</span></div>" +
          '<div class="meter"><b id="m-days">' + S.days + "</b><span>days worked</span></div>" +
        "</div>" +
        '<button class="btn time" id="pass" type="button"' + '><span class="hourglass" aria-hidden="true"></span>' + esc(waitLabel) + "</button>" +
      "</div>" +
    "</header>";
  }
  function pad3(n) { return String(n).padStart(3, "0"); }

  function fileCard(id, isNew) {
    var f = C.files[id];
    var r = (hash(id) % 7) - 3;
    return '<button class="card t-' + f.type + (isNew ? " is-new" : "") + (has(S.seen, id) ? "" : " unread") + '" data-file="' + id + '" style="--r:' + r * 0.6 + 'deg" type="button">' +
      '<span class="pin" aria-hidden="true"></span>' +
      '<span class="card-type">' + typeLabel(f.type) + "</span>" +
      '<span class="card-title">' + esc(f.title) + "</span>" +
      '<span class="card-date">' + fmt(f.date) + "</span>" +
      (has(S.seen, id) ? "" : '<span class="new-tag">New</span>') +
    "</button>";
  }
  function typeLabel(t) {
    return { report: "Police report", statement: "Interview", lab: "Lab result", clipping: "News clipping", letter: "Letter", phone: "Phone record",
      memo: "Internal memo", note: "Recovered note", video: "Video still", disk: "Digital forensics", web: "Web page" }[t] || t;
  }

  function mug(id) {
    var p = C.suspects[id];
    return window.ColdArt ? ColdArt.portrait(id, p.look) : "";
  }

  /* ================= screens ================= */
  function renderIntro() {
    app.innerHTML =
      '<section class="intro">' +
        '<div class="folder" id="folder">' +
          '<div class="folder-inside">' +
            '<p class="eyebrow">Case ' + pad3(caseNo) + " · Open " + C.yearsOpen + " years</p>" +
            '<h1 class="case-title">' + esc(C.title) + "</h1>" +
            '<p class="tagline">' + esc(C.tagline) + "</p>" +
            '<p class="summary">' + esc(C.summary) + "</p>" +
            '<ol class="howto">' +
              "<li><b>Read the files.</b> Reading is free. Every detail is from the real investigation.</li>" +
              "<li><b>Type what you want to do</b> in your notebook: \u201cinterview the neighbors,\u201d \u201ctest the envelope.\u201d Anything goes. Each move costs a step and days. Some go nowhere. No hints.</li>" +
              "<li><b>Let time pass</b> when you're stuck. History keeps moving: new crimes, new letters.</li>" +
              "<li><b>Make one arrest.</b> Anyone on your suspect list, any time. It goes all the way to sentencing. No take-backs.</li>" +
              "<li><b>Fewer steps and days</b> means a higher rank. Arrest the wrong person, or let the case go cold past " + new Date(parse(C.coldDate)).getUTCFullYear() + ", and you score zero.</li>" +
            "</ol>" +
            '<p class="cw">A real case with real victims. Files are reconstructed from public reporting and kept non-graphic.</p>' +
            '<button class="btn primary big" id="begin" type="button">Begin the investigation</button>' +
          "</div>" +
          '<button class="folder-cover" id="cover" type="button" aria-label="Open the case file">' +
            '<span class="tab-label">' + esc(C.place) + "</span>" +
            '<span class="cover-no">Case No. ' + pad3(caseNo) + "</span>" +
            '<span class="cover-title">' + esc(C.title) + "</span>" +
            '<span class="cover-stamp">Unsolved</span>' +
            '<dl class="cover-sheet"><div><dt>Victims</dt><dd>' + C.victims.length + '</dd></div><div><dt>Years open</dt><dd>' + C.yearsOpen + '</dd></div><div><dt>Chapters</dt><dd>' + C.chapters.length + '</dd></div><div><dt>Arrests allowed</dt><dd>1</dd></div></dl>' +
            '<span class="cover-hint">Tap to open</span>' +
          "</button>" +
        "</div>" +
      "</section>" + statsBar();
    var folder = document.getElementById("folder");
    document.getElementById("cover").onclick = function () { folder.classList.add("open"); setTimeout(function () { document.getElementById("begin").focus({ preventScroll: true }); }, 700); };
    document.getElementById("begin").onclick = function () {
      S.screen = "play"; S.clock = C.chapters[0].start;
      var fired = fireDue(); persist();
      showChapterCard(null, fired);
    };
  }

  function renderPlay(highlight) {
    highlight = highlight || {};
    var ch = chapter();
    var files = S.files.slice().sort(function (a, b) { return parse(C.files[b].date) - parse(C.files[a].date); });
    var unread = S.files.filter(function (f) { return !has(S.seen, f); }).length;
    var tab = S.tab;

    var evidence = files.length
      ? '<div class="board">' + files.map(function (id) { return fileCard(id, has(highlight.files || [], id)); }).join("") + "</div>"
      : '<p class="empty">No files yet.</p>';

    var notebook = notebookHTML(highlight.logNew);
    var sus = S.suspects.length
      ? '<div class="suspects">' + S.suspects.map(function (id) {
          var p = C.suspects[id];
          return '<article class="suspect' + (has(highlight.suspects || [], id) ? " is-new" : "") + '">' + mug(id) +
            '<div class="sus-body"><h3>' + esc(p.name) + "</h3><p>" + esc(p.note) + "</p>" +
            '<button class="btn danger" data-accuse="' + id + '" type="button">Arrest and charge</button></div></article>';
        }).join("") + "</div>"
      : '<p class="empty">No suspects yet. Keep working the case.</p>';

    app.innerHTML =
      hud() +
      '<div class="chapter-bar"><div class="cb-scene">' + (window.ColdArt ? ColdArt.scene(ch.scene) : "") + '</div><div class="cb-text"><span>Chapter ' + ch.n + " of " + C.chapters.length + '</span><b>' + esc(ch.title) + "</b></div></div>" +
      '<nav class="tabs" role="tablist">' +
        tabBtn("evidence", "Evidence", unread) + tabBtn("notebook", "Notebook", 0) + tabBtn("suspects", "Suspects", S.suspects.length) +
      "</nav>" +
      '<section class="panel" id="panel">' +
        (tab === "evidence" ? evidence : tab === "notebook" ? notebook : sus) +
      "</section>";

    bindPlay();
    if (highlight.clockFrom && highlight.clockFrom !== S.clock) animateClock(highlight.clockFrom);
    if (highlight.meters) bumpMeters(highlight.meters);
    if (S.tab === "notebook" && highlight.focusInput !== false) {
      var inp = document.getElementById("cmd");
      if (inp && (highlight.logNew || window.matchMedia("(hover: hover)").matches)) inp.focus({ preventScroll: true });
    }
  }

  function notebookHTML(isNew) {
    var entries = S.log.slice().reverse();
    return '<div class="notebook">' +
      '<form class="cmd-form" id="cmd-form" autocomplete="off">' +
        '<label for="cmd" class="cmd-label">What do you want to do?</label>' +
        '<div class="cmd-row"><input id="cmd" name="cmd" type="text" maxlength="140" autocapitalize="off" spellcheck="false" enterkeyhint="go" placeholder="e.g. interview the neighbors">' +
        '<button class="btn primary" type="submit">Do it</button></div>' +
        '<p class="cmd-note">Every move costs a step and time. Moves that weren\u2019t possible yet cost nothing.</p>' +
      "</form>" +
      (entries.length ? '<ol class="log">' + entries.map(function (e, i) {
        var cost = e.kind === "era" || e.kind === "meta" || e.kind === "repeat" ? "No time spent" : "+" + e.days + (e.days === 1 ? " day" : " days");
        return '<li class="entry k-' + e.kind + (i === 0 && isNew ? " is-new" : "") + '">' +
          '<div class="e-top"><span class="e-date">' + fmt(e.date) + '</span><span class="e-cost">' + cost + "</span></div>" +
          '<p class="e-cmd">' + esc(e.cmd) + "</p>" +
          (e.readAs ? '<p class="e-read">Read as: ' + esc(e.readAs) + "</p>" : "") +
          '<p class="e-res">' + esc(e.text) + "</p>" +
          (e.files && e.files.length ? '<div class="e-files">' + e.files.map(function (f) { return '<button class="e-file" type="button" data-file="' + f + '">' + esc(C.files[f].title) + "</button>"; }).join("") + "</div>" : "") +
        "</li>";
      }).join("") + "</ol>" : '<p class="log-empty">Your notebook is empty. Read the files, then decide your first move.</p>') +
    "</div>";
  }
  function tabBtn(id, label, n) {
    return '<button role="tab" type="button" class="tab' + (S.tab === id ? " on" : "") + '" data-tab="' + id + '" aria-selected="' + (S.tab === id) + '">' +
      label + (n ? ' <span class="badge">' + n + "</span>" : "") + "</button>";
  }
  function bindPlay() {
    var pass = document.getElementById("pass");
    if (pass) pass.onclick = passTime;
    [].forEach.call(document.querySelectorAll("[data-tab]"), function (b) {
      b.onclick = function () { S.tab = b.getAttribute("data-tab"); persist(); renderPlay(); };
    });
    [].forEach.call(document.querySelectorAll("[data-file]"), function (b) {
      b.onclick = function () { openDoc(b.getAttribute("data-file")); };
    });
    var form = document.getElementById("cmd-form");
    if (form) form.onsubmit = function (e) {
      e.preventDefault();
      var inp = document.getElementById("cmd");
      var v = inp.value;
      if (!v.trim()) return;
      form.classList.add("working");
      inp.disabled = true;
      setTimeout(function () { runCommand(v); }, reduceMotion ? 0 : 420);
    };
    [].forEach.call(document.querySelectorAll("[data-accuse]"), function (b) {
      b.onclick = function () { confirmAccuse(b.getAttribute("data-accuse")); };
    });
  }

  function afterChange(clockFrom, fired, newFiles, newSus, fromCmd) {
    var allNew = newFiles.slice(); var allSus = newSus.slice();
    fired.forEach(function (ev) { add(allNew, ev.files); add(allSus, ev.suspects); });
    persist();
    renderPlay({ files: allNew, suspects: allSus, clockFrom: clockFrom, meters: true, logNew: fromCmd, focusInput: !fired.length });
    if (fired.length) showNews(fired.slice(), allNew, function () {});
    else if (newFiles.length) toast(newFiles.length === 1 ? "New file: " + C.files[newFiles[0]].title : newFiles.length + " new files on the board");
  }

  /* ================= animations ================= */
  function animateClock(from) {
    var flaps = document.querySelectorAll(".clock .flap");
    var d0 = new Date(parse(from));
    var old = [MONTHS[d0.getUTCMonth()].toUpperCase(), pad(d0.getUTCDate()), String(d0.getUTCFullYear())];
    [].forEach.call(flaps, function (el, i) {
      if (old[i] !== el.getAttribute("data-v") && !reduceMotion) {
        var v = el.getAttribute("data-v");
        el.textContent = old[i];
        el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip");
        setTimeout(function () { el.textContent = v; }, 200);
      }
    });
  }
  function bumpMeters() {
    [].forEach.call(document.querySelectorAll(".meter b"), function (el) {
      el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
    });
  }
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ================= overlays ================= */
  function openOverlay(html, cls) {
    overlay.className = "overlay" + (cls ? " ov-" + cls : "");
    overlay.innerHTML = '<div class="ov-inner">' + html + "</div>";
    overlay.hidden = false;
    document.body.classList.add("locked");
    var f = overlay.querySelector("[data-focus]") || overlay.querySelector("button");
    if (f) f.focus({ preventScroll: true });
  }
  function closeOverlay() {
    overlay.hidden = true; overlay.innerHTML = ""; document.body.classList.remove("locked");
  }
  overlay.addEventListener("click", function (e) { if (e.target === overlay || e.target.classList.contains("ov-inner")) { if (overlay.dataset.dismiss !== "no") closeOverlay(); } });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !overlay.hidden && overlay.dataset.dismiss !== "no") closeOverlay(); });

  function showNews(queue, newFiles, done) {
    if (!queue.length) { closeOverlay(); renderPlay({ files: newFiles }); return; }
    var ev = queue.shift();
    overlay.dataset.dismiss = "no";
    openOverlay(
      '<article class="paper-spin">' +
        '<div class="np-mast"><span>Wichita Evening Report</span><span>' + fmt(eventDate(ev)) + "</span></div>" +
        '<div class="np-extra">Extra</div>' +
        '<h2 class="np-head">' + esc(ev.headline) + "</h2>" +
        '<div class="np-cols"><span></span><span></span><span></span></div>' +
        '<div class="np-actions">' +
          '<button class="btn primary" id="np-read" type="button" data-focus>Read the file</button>' +
          '<button class="btn ghost" id="np-next" type="button">' + (queue.length ? "Next headline" : "Back to the board") + "</button>" +
        "</div>" +
      "</article>", "news");
    document.getElementById("np-read").onclick = function () {
      overlay.dataset.dismiss = "";
      var fid = (ev.files || [])[0];
      S.tab = "evidence"; persist();
      openDoc(fid, function () { if (queue.length) showNews(queue, newFiles, done); else { closeOverlay(); renderPlay({ files: newFiles }); } });
    };
    document.getElementById("np-next").onclick = function () { overlay.dataset.dismiss = ""; showNews(queue, newFiles, done); };
  }

  function showChapterCard(clockFrom, fired) {
    var ch = chapter();
    overlay.dataset.dismiss = "no";
    openOverlay(
      '<div class="chapter-card">' + (window.ColdArt ? '<div class="cc-scene">' + ColdArt.scene(ch.scene) + "</div>" : "") +
        '<p class="cc-n">Chapter ' + ch.n + "</p>" +
        '<h2 class="cc-title">' + esc(ch.title) + "</h2>" +
        '<p class="cc-date">' + fmt(S.clock) + "</p>" +
        '<p class="cc-intro">' + esc(ch.intro) + "</p>" +
        '<button class="btn primary" id="cc-go" type="button" data-focus>Continue</button>' +
      "</div>", "chapter");
    document.getElementById("cc-go").onclick = function () {
      overlay.dataset.dismiss = "";
      S.tab = "evidence"; persist();
      var nf = []; fired.forEach(function (ev) { add(nf, ev.files); });
      renderPlay({ files: nf, clockFrom: clockFrom });
      if (fired.length) showNews(fired.slice(), nf, function () {});
      else closeOverlay();
    };
  }

  /* ================= documents ================= */
  function openDoc(id, onClose) {
    var f = C.files[id];
    if (!f) return;
    var firstRead = !has(S.seen, id);
    add(S.seen, [id]); persist();
    overlay.dataset.dismiss = "";
    openOverlay(
      '<div class="doc-wrap">' + docHTML(id, f) +
        '<div class="doc-foot"><span>Reconstructed from public reporting</span>' +
        '<button class="btn primary" id="doc-close" type="button" data-focus>Back to the board</button></div>' +
      "</div>", "doc");
    var close = function () { if (onClose) onClose(); else { closeOverlay(); renderPlay(); } };
    document.getElementById("doc-close").onclick = close;
    overlay.onclick = null;
    if (firstRead && !reduceMotion) typeIn(overlay.querySelector(".doc-body"));
    if (f.type === "video") startNoise();
  }

  function fieldsHTML(f) {
    if (!f.fields) return "";
    return '<dl class="fields">' + f.fields.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>";
  }
  function bodyHTML(f) {
    return '<div class="doc-body">' + f.body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>";
  }
  function docHTML(id, f) {
    var t = f.type;
    if (t === "clipping") {
      return '<article class="doc doc-clipping"><div class="clip-mast">' + esc(f.from) + " · " + fmt(f.date) + "</div>" +
        "<h2>" + esc(f.title) + "</h2>" + bodyHTML(f) + "</article>";
    }
    if (t === "letter" || t === "note") {
      return '<article class="doc doc-' + t + '"><div class="ev-stamp">Evidence copy</div>' +
        '<div class="doc-meta">' + esc(f.from) + " · Received " + fmt(f.date) + "</div><h2>" + esc(f.title) + "</h2>" + fieldsHTML(f) + bodyHTML(f) + "</article>";
    }
    if (t === "phone") {
      var wave = "";
      if (id === "fox_call") {
        wave = '<div class="wave" aria-hidden="true">' + Array.apply(null, Array(36)).map(function (_, i) {
          return '<i style="--h:' + (20 + (hash(id + i) % 70)) + "%;--d:" + (i * 0.04).toFixed(2) + 's"></i>';
        }).join("") + '</div><p class="wave-cap">Recording on file · 0:14</p>';
      }
      return '<article class="doc doc-phone"><div class="form-head"><span>' + esc(f.from) + "</span><span>" + fmt(f.date) + "</span></div><h2>" + esc(f.title) + "</h2>" + wave + fieldsHTML(f) + bodyHTML(f) + "</article>";
    }
    if (t === "video") {
      return '<article class="doc doc-video"><div class="crt"><canvas id="noise" width="160" height="90"></canvas>' +
        '<svg class="jeep" viewBox="0 0 200 90" aria-hidden="true"><rect x="0" y="70" width="200" height="20" class="lot"/>' +
        '<path d="M48 64 L54 36 Q56 30 64 30 L132 30 Q140 30 144 38 L152 50 L160 52 Q166 54 166 60 L166 66 L40 66 Q40 64 48 64Z" class="body"/>' +
        '<rect x="62" y="35" width="28" height="13" class="glass"/><rect x="96" y="35" width="34" height="13" class="glass"/>' +
        '<circle cx="70" cy="68" r="10" class="wheel"/><circle cx="144" cy="68" r="10" class="wheel"/>' +
        '<rect x="10" y="40" width="30" height="26" class="truck"/></svg>' +
        '<span class="rec">● REC</span><span class="ts">CAM 3 · 01/2005</span></div>' +
        '<div class="doc-meta">' + esc(f.from) + "</div><h2>" + esc(f.title) + "</h2>" + bodyHTML(f) + "</article>";
    }
    if (t === "disk") {
      return '<article class="doc doc-disk"><div class="disk-row">' +
        '<svg class="floppy" viewBox="0 0 100 100" aria-hidden="true"><rect x="6" y="6" width="88" height="88" rx="4" class="fl-body"/>' +
        '<rect x="28" y="6" width="44" height="28" class="fl-shutter"/><rect x="54" y="10" width="10" height="20" class="fl-hole"/>' +
        '<rect x="18" y="50" width="64" height="40" rx="2" class="fl-label"/><line x1="24" x2="76" y1="62" y2="62" class="fl-line"/><line x1="24" x2="70" y1="72" y2="72" class="fl-line"/></svg>' +
        '<div class="win"><div class="win-bar"><span>Properties</span><span class="x">×</span></div>' + fieldsHTML(f) + "</div></div>" +
        '<div class="doc-meta">' + esc(f.from) + " · " + fmt(f.date) + "</div><h2>" + esc(f.title) + "</h2>" + bodyHTML(f) + "</article>";
    }
    if (t === "web") {
      return '<article class="doc doc-web"><div class="browser"><div class="br-bar"><i></i><i></i><i></i><span class="url">' + esc(f.from) + "</span></div>" +
        '<div class="br-page"><h2>' + esc(f.title) + "</h2>" + fieldsHTML(f) + bodyHTML(f) + "</div></div></article>";
    }
    // report, statement, lab, memo
    return '<article class="doc doc-report doc-' + t + '"><div class="letterhead"><span class="seal" aria-hidden="true">★</span><div><b>' + esc(f.from) + "</b><span>" + typeLabel(t) + " · " + fmt(f.date) + "</span></div></div>" +
      "<h2>" + esc(f.title) + "</h2>" + fieldsHTML(f) + bodyHTML(f) +
      (t === "lab" ? '<div class="barcode" aria-hidden="true"></div>' : "") + "</article>";
  }

  function typeIn(el) {
    if (!el) return;
    var ps = [].slice.call(el.querySelectorAll("p"));
    var texts = ps.map(function (p) { return p.textContent; });
    ps.forEach(function (p) { p.textContent = ""; p.classList.add("typing"); });
    var pi = 0, ci = 0, stop = false;
    function skip() { stop = true; ps.forEach(function (p, i) { p.textContent = texts[i]; p.classList.remove("typing"); }); }
    el.addEventListener("click", skip, { once: true });
    (function step() {
      if (stop || pi >= ps.length) { ps.forEach(function (p) { p.classList.remove("typing"); }); return; }
      ci += 3;
      ps[pi].textContent = texts[pi].slice(0, ci);
      if (ci >= texts[pi].length) { ps[pi].classList.remove("typing"); pi++; ci = 0; }
      setTimeout(step, 12);
    })();
  }
  function startNoise() {
    var cv = document.getElementById("noise");
    if (!cv) return;
    var ctx = cv.getContext("2d"), img = ctx.createImageData(160, 90);
    (function frame() {
      if (!document.getElementById("noise")) return;
      for (var i = 0; i < img.data.length; i += 4) { var v = Math.random() * 255 | 0; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 60; }
      ctx.putImageData(img, 0, 0);
      if (!reduceMotion) setTimeout(function () { requestAnimationFrame(frame); }, 60);
    })();
  }

  /* ================= accusation ================= */
  function confirmAccuse(id) {
    var p = C.suspects[id];
    overlay.dataset.dismiss = "";
    openOverlay(
      '<div class="confirm">' + mug(id) +
        '<h2>Arrest ' + esc(p.name) + "?</h2>" +
        "<p>This ends your investigation on " + fmt(S.clock) + ". The case goes to court and plays out to sentencing. You can't take it back.</p>" +
        '<div class="confirm-actions"><button class="btn danger big" id="yes" type="button">Make the arrest</button>' +
        '<button class="btn ghost" id="no" type="button" data-focus>Keep investigating</button></div>' +
      "</div>", "confirm-ov");
    document.getElementById("no").onclick = closeOverlay;
    document.getElementById("yes").onclick = function () {
      S.accused = id; S.accuseDate = S.clock; S.screen = "trial"; persist();
      closeOverlay(); recordStats(); renderTrial(true);
    };
  }

  function outcomeSteps() {
    var right = S.accused === C.culprit;
    var name = C.suspects[S.accused].name;
    var list = right ? C.culpritOutcome : C.wrongOutcome;
    return list.map(function (s) {
      var text = s.text.replace(/\{name\}/g, name);
      if (right && s.title === "Interrogation" && !S.hasDna) text = "His DNA is tested after the arrest and matches the crime scenes. He confesses.";
      return { date: addDays(S.accuseDate, s.offset), title: s.title, text: text };
    });
  }

  function renderTrial(animate) {
    var steps = outcomeSteps();
    var p = C.suspects[S.accused];
    app.innerHTML =
      '<section class="trial">' +
        '<div class="trial-head">' + mug(S.accused) + '<div><p class="eyebrow">The State of Kansas v.</p><h1>' + esc(p.name) + "</h1></div></div>" +
        '<ol class="docket">' + steps.map(function (s, i) {
          return '<li style="--i:' + i + '"><span class="dk-date">' + fmt(s.date) + '</span><b>' + esc(s.title) + "</b><p>" + esc(s.text) + "</p></li>";
        }).join("") + "</ol>" +
        '<button class="btn primary big" id="truth" type="button">See what really happened</button>' +
      "</section>";
    var docket = app.querySelector(".docket");
    var btn = document.getElementById("truth");
    if (animate && !reduceMotion) {
      docket.classList.add("play");
      btn.classList.add("wait");
      setTimeout(function () { btn.classList.remove("wait"); btn.focus({ preventScroll: true }); }, steps.length * 900 + 400);
    }
    btn.onclick = function () { S.screen = "end"; persist(); renderEnd(true); window.scrollTo(0, 0); };
  }

  function recordStats() {
    if (stats.lastDay === todayKey) return;
    var y = new Date(now); y.setDate(y.getDate() - 1);
    stats.streak = stats.lastDay === localKey(y) ? stats.streak + 1 : 1;
    stats.played += 1;
    if (S.outcome !== "cold" && S.accused === C.culprit) stats.solved += 1;
    stats.best = Math.max(stats.best, score());
    stats.lastDay = todayKey;
    save("coldread:stats2", stats);
  }

  function shareText() {
    var cold = S.outcome === "cold";
    var right = !cold && S.accused === C.culprit;
    var sc = score();
    var pct = ColdArt.percentile(simulated(), sc);
    return "Cold Read #" + caseNo + " 🗂️\n" +
      (cold ? "🧊 Case went cold" : right ? "✅ Right suspect · " + rank(sc).title + " (" + sc + ")" : "❌ Arrested the wrong person") + "\n" +
      "👣 " + S.steps + " steps · ⏱️ " + S.days + " days worked\n" +
      (cold ? "" : "📅 Arrest: " + MONTHS[new Date(parse(S.accuseDate)).getUTCMonth()] + " " + new Date(parse(S.accuseDate)).getUTCFullYear() + "\n") +
      (right ? "📈 Better than " + pct + "% of detectives" : "");
  }
  var SIM = null;
  function simulated() {
    if (!SIM) SIM = ColdArt.simulate(C.id, C.simulation || { wrong: 0.3, cold: 0.08, extraSteps: 10, extraDays: 60 }, scoreFor);
    return SIM;
  }

  function renderEnd(animate) {
    var cold = S.outcome === "cold";
    var right = !cold && S.accused === C.culprit;
    var sc = score(); var rk = rank(sc);
    var p = cold ? null : C.suspects[S.accused];
    var realDiff = cold ? 0 : diffDays(S.accuseDate, C.realArrest);
    var later = cold ? [] : C.victims.filter(function (v) { return parse(v.date) > parse(S.accuseDate); });
    var sims = simulated();
    var pct = ColdArt.percentile(sims, sc);
    var failShare = Math.round(sims.filter(function (x) { return x === 0; }).length / sims.length * 100);
    var curveNote = right ? "Better than <b>" + pct + "%</b> of detectives." : "You're in the <b>" + failShare + "%</b> of detectives who didn't close the case.";
    var compare = right
      ? (realDiff > 0 ? "You arrested him " + realDiff + (realDiff === 1 ? " day" : " days") + " before the real task force did."
        : realDiff === 0 ? "Same day as the real arrest." : "The real task force got there " + (-realDiff) + (realDiff === -1 ? " day" : " days") + " before you.")
      : "";

    app.innerHTML =
      '<section class="end' + (right ? " right" : " wrong") + (cold ? " cold" : "") + (animate && !reduceMotion ? " anim" : "") + '">' +
        '<div class="verdict-stamp">' + (cold ? "Gone cold" : right ? "Case closed" : "Wrong person") + "</div>" +
        '<p class="eyebrow">Detective rating</p>' +
        '<h1 class="rank">' + esc(rk.title) + "</h1>" +
        '<p class="score"><b>' + sc + "</b> / 1000</p>" +
        '<dl class="end-stats">' +
          "<div><dt>Steps</dt><dd>" + S.steps + "</dd></div>" +
          "<div><dt>Days worked</dt><dd>" + S.days + "</dd></div>" +
          "<div><dt>" + (cold ? "Went cold" : "Arrest") + "</dt><dd>" + fmt(cold ? C.coldDate : S.accuseDate) + "</dd></div>" +
          "<div><dt>Case open</dt><dd>" + span(C.caseStart, cold ? C.coldDate : S.accuseDate) + "</dd></div>" +
        "</dl>" +
        '<figure class="curve-wrap"><figcaption><span>How you compare</span><span class="est">Estimated</span></figcaption>' +
          ColdArt.curveSVG(sims, sc) +
          '<p class="curve-note">' + curveNote + ' <span class="muted">Based on thousands of simulated investigations, not real players.</span></p></figure>' +
        (compare ? '<p class="compare">' + esc(compare) + "</p>" : "") +
        (cold ? '<div class="wrong-box"><p><b>The case went cold.</b> Without an arrest, the files went back in their boxes.</p></div>' : "") +
        (!right && !cold ? '<div class="wrong-box"><p><b>' + esc(p.name) + " was innocent.</b> " + esc(p.innocent || "") + "</p>" +
          (later.length ? '<p class="toll">After your arrest, the real killer took ' + later.length + (later.length === 1 ? " more life." : " more lives.") + "</p>" : "") + "</div>" : "") +
        '<div class="truth"><h2>' + (right ? "You got him" : "Who it really was") + "</h2>" +
          C.truth.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") +
          '<p class="missed"><b>The clue nobody caught:</b> ' + esc(C.missed) + "</p></div>" +
        '<div class="share"><pre id="share-text">' + esc(shareText()) + "</pre>" +
          '<button class="btn primary" id="copy" type="button">Copy result</button><span class="copied" id="copied" role="status"></span></div>' +
        '<p class="next-case">Next case in <b id="countdown">--:--:--</b></p>' +
      "</section>" + statsBar() +
      '<section class="aftermath">' +
        "<h2>In memory</h2>" +
        '<ul class="memorial">' + C.victims.map(function (v) { return "<li><span>" + esc(v.name) + '</span><span class="yr">' + new Date(parse(v.date)).getUTCFullYear() + "</span></li>"; }).join("") + "</ul>" +
        "<h2>Sources</h2>" +
        '<ul class="sources">' + C.sources.map(function (s) { return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + "</a></li>"; }).join("") + "</ul>" +
        '<p class="disclose">Names of people who were investigated and cleared have been changed. Tip-line suspects are composites. The trial of a wrongly accused suspect is fictional.</p>' +
      "</section>";

    document.getElementById("copy").onclick = function () {
      var text = shareText();
      var msg = function (m) { document.getElementById("copied").textContent = m; };
      try { navigator.clipboard.writeText(text).then(function () { msg("Copied"); }, function () { selectShare(); msg("Select the text above to copy"); }); }
      catch (e) { selectShare(); msg("Select the text above to copy"); }
    };
    tick();
  }
  function selectShare() {
    var el = document.getElementById("share-text"), r = document.createRange();
    r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  function statsBar() {
    if (!stats.played) return "";
    return '<dl class="stats"><div><dt>Cases</dt><dd>' + stats.played + "</dd></div><div><dt>Solved</dt><dd>" + stats.solved +
      "</dd></div><div><dt>Streak</dt><dd>" + stats.streak + "</dd></div><div><dt>Best</dt><dd>" + stats.best + "</dd></div></dl>";
  }
  var timer;
  function tick() {
    clearInterval(timer);
    var el = document.getElementById("countdown"); if (!el) return;
    function upd() {
      var n = new Date(), mid = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
      var s = Math.max(0, Math.floor((mid - n) / 1000));
      if (s === 0) { location.reload(); return; }
      el.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s % 3600 / 60)) + ":" + pad(s % 60);
    }
    upd(); timer = setInterval(upd, 1000);
  }

  /* ================= dust motes ================= */
  (function dust() {
    var cv = document.getElementById("dust"); if (!cv || reduceMotion) return;
    var ctx = cv.getContext("2d"), motes = [], w, h;
    function size() { w = cv.width = window.innerWidth; h = cv.height = window.innerHeight; }
    size(); window.addEventListener("resize", size);
    for (var i = 0; i < 40; i++) motes.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.4, v: Math.random() * 0.00025 + 0.00008, o: Math.random() * 0.5 + 0.2 });
    (function f() {
      ctx.clearRect(0, 0, w, h);
      motes.forEach(function (m) {
        m.y -= m.v; m.x += Math.sin(m.y * 20) * 0.0002;
        if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
        var dx = m.x - 0.5, glow = Math.max(0, 1 - Math.abs(dx) * 1.6);
        ctx.fillStyle = "rgba(255,226,170," + (m.o * glow) + ")";
        ctx.beginPath(); ctx.arc(m.x * w, m.y * h, m.r, 0, 6.283); ctx.fill();
      });
      requestAnimationFrame(f);
    })();
  })();

  /* ================= boot ================= */
  function render() {
    var t = document.getElementById("toast"); if (t) t.classList.remove("show");
    if (!C) { app.innerHTML = "<p>No cases loaded.</p>"; return; }
    if (S.screen === "play") renderPlay();
    else if (S.screen === "trial") renderTrial(false);
    else if (S.screen === "end") renderEnd(false);
    else renderIntro();
  }
  window.__coldRead = { state: function () { return S; }, run: runCommand, interpret: function (t) { var r = interpret(t); return { kind: r.kind, action: r.action && r.action.id, readAs: r.readAs, text: r.text, days: r.days }; }, passTime: passTime, score: score };
  render();
})();
