(function () {
  "use strict";

  var LAUNCH_DATE = "2026-10-26"; // Case #1
  var STAGE_POINTS = [100, 60, 30]; // points for solving on try 1, 2, 3
  var MAX_TRIES = STAGE_POINTS.length;
  var RANKS = [
    { min: 680, title: "Chief of Detectives", note: "Every clue, first try. The squad room wants to know how." },
    { min: 560, title: "Homicide Lieutenant", note: "You'd have closed this case years early." },
    { min: 420, title: "Detective Sergeant", note: "Sharp instincts. A couple of leads needed a second look." },
    { min: 280, title: "Detective", note: "You worked the file and got your suspect." },
    { min: 140, title: "Patrol Officer", note: "You followed the trail, with help from the hints." },
    { min: 0, title: "Records Clerk", note: "The file is filed. Tomorrow's case is a fresh start." }
  ];

  var cases = window.COLD_READ_CASES || [];
  var app = document.getElementById("app");

  // ---------- dates ----------
  function localKey(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }
  function dayNumber(d) {
    var p = LAUNCH_DATE.split("-").map(Number);
    var start = new Date(p[0], p[1] - 1, p[2]);
    var today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.max(1, Math.round((today - start) / 86400000) + 1);
  }
  var now = new Date();
  var todayKey = localKey(now);
  var caseNo = dayNumber(now);
  var theCase = cases[(caseNo - 1) % cases.length];

  // ---------- storage ----------
  var storeKey = "coldread:" + todayKey;
  function load(key) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  var state = load(storeKey) || { caseId: theCase.id, screen: "intro", stage: 0, guesses: [], results: [] };
  if (state.caseId !== theCase.id) state = { caseId: theCase.id, screen: "intro", stage: 0, guesses: [], results: [] };
  var stats = load("coldread:stats") || { played: 0, streak: 0, best: 0, lastDay: null };
  function persist() { save(storeKey, state); }

  // ---------- matching ----------
  function norm(s) {
    return String(s).toLowerCase().replace(/['’`]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  }
  function lev(a, b) {
    if (a === b) return 0;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }
  function isMatch(guess, answers) {
    var g = norm(guess);
    if (!g) return false;
    var gNoArticle = g.replace(/^(the|a|an) /, "");
    for (var i = 0; i < answers.length; i++) {
      var a = norm(answers[i]);
      if (g === a || gNoArticle === a) return true;
      var allowed = a.length >= 12 ? 2 : a.length >= 5 ? 1 : 0;
      if (allowed && lev(gNoArticle, a) <= allowed) return true;
    }
    return false;
  }

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function total() { return state.results.reduce(function (s, r) { return s + r.points; }, 0); }
  function maxScore() { return theCase.stages.length * STAGE_POINTS[0]; }
  function rankFor(score) {
    var scaled = Math.round(score * 700 / maxScore());
    for (var i = 0; i < RANKS.length; i++) if (scaled >= RANKS[i].min) return RANKS[i];
    return RANKS[RANKS.length - 1];
  }
  function tagClass(r) {
    if (!r) return "";
    if (r.points === STAGE_POINTS[0]) return "is-clean";
    if (r.points > 0) return "is-partial";
    return "is-missed";
  }

  function header() {
    return (
      '<header class="mast">' +
        '<div class="mast-row">' +
          '<span class="brand">Cold Read</span>' +
          '<span class="caseno">Case No. ' + String(caseNo).padStart(3, "0") + "</span>" +
        "</div>" +
        '<div class="mast-sub">' + esc(theCase.place) + " · " + esc(theCase.span) + "</div>" +
      "</header>"
    );
  }

  function tags() {
    var html = '<ol class="tags" aria-label="Evidence progress">';
    theCase.stages.forEach(function (_, i) {
      var r = state.results[i];
      var cls = tagClass(r);
      if (!r && i === state.stage && state.screen === "stage") cls = "is-current";
      var label = r ? (r.points + " points") : (i === state.stage ? "current" : "not yet opened");
      html += '<li class="tag ' + cls + '" aria-label="Exhibit ' + (i + 1) + ": " + label + '"><span>' + (i + 1) + "</span></li>";
    });
    return html + "</ol>";
  }

  // ---------- screens ----------
  function renderIntro() {
    app.innerHTML =
      header() +
      '<section class="sheet intro">' +
        '<p class="eyebrow">Today\'s file</p>' +
        "<h1>" + esc(theCase.title) + "</h1>" +
        '<p class="open-for">Open for <strong>' + theCase.yearsOpen + " years</strong></p>" +
        '<p class="lede">' + esc(theCase.summary) + "</p>" +
        '<ul class="rules">' +
          "<li><b>" + theCase.stages.length + " exhibits.</b> Each one is a real piece of the investigation, in the order detectives found it.</li>" +
          "<li><b>Type your answer.</b> Small typos are fine.</li>" +
          "<li><b>" + STAGE_POINTS.join(" / ") + " points</b> for solving on your first, second or third try. A hint unlocks after each miss.</li>" +
          "<li><b>Your score sets your rank,</b> from Records Clerk to Chief of Detectives.</li>" +
        "</ul>" +
        '<p class="cw">This is a real case with real victims. Details are factual and kept non-graphic.</p>' +
        '<button class="btn primary" id="start" type="button">Open the file</button>' +
      "</section>" +
      statsBar();
    document.getElementById("start").onclick = function () {
      state.screen = "stage"; persist(); render();
    };
  }

  function renderStage() {
    var i = state.stage;
    var st = theCase.stages[i];
    var result = state.results[i];
    var guesses = state.guesses[i] || [];
    var misses = guesses.length - (result && result.solved ? 1 : 0);
    var hintHtml = "";
    for (var h = 0; h < Math.min(misses, st.hints.length); h++) {
      hintHtml += '<p class="hint"><span>Hint ' + (h + 1) + "</span>" + esc(st.hints[h]) + "</p>";
    }
    var wrong = guesses.filter(function (g, idx) { return !(result && result.solved && idx === guesses.length - 1); });
    var wrongHtml = wrong.length
      ? '<ul class="misses">' + wrong.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") + "</ul>"
      : "";

    var body;
    if (result) {
      body =
        '<div class="closed ' + tagClass(result) + '">' +
          '<p class="verdict">' + (result.solved ? "Logged" : "Missed") + ' <span class="pts">+' + result.points + "</span></p>" +
          '<p class="reveal">' + esc(st.reveal) + "</p>" +
        "</div>" +
        wrongHtml +
        '<button class="btn primary" id="next" type="button">' +
          (i + 1 < theCase.stages.length ? "Next exhibit" : "Close the case") +
        "</button>";
    } else {
      var triesLeft = MAX_TRIES - guesses.length;
      body =
        hintHtml + wrongHtml +
        '<form class="answer" id="answer" autocomplete="off">' +
          '<label for="guess" class="q">' + esc(st.question) + "</label>" +
          '<div class="field">' +
            '<input id="guess" name="guess" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="Type your answer" required>' +
            '<button class="btn primary" type="submit">Submit</button>' +
          "</div>" +
          '<p class="tries">Worth <b>' + STAGE_POINTS[guesses.length] + "</b> · " + triesLeft + (triesLeft === 1 ? " try" : " tries") + " left</p>" +
        "</form>";
    }

    app.innerHTML =
      header() + tags() +
      '<section class="sheet stage">' +
        '<div class="exhibit-head">' +
          '<span class="exhibit">Exhibit ' + (i + 1) + " of " + theCase.stages.length + "</span>" +
          '<span class="when">' + esc(st.date) + "</span>" +
        "</div>" +
        '<p class="briefing">' + esc(st.briefing) + "</p>" +
        body +
      "</section>" +
      '<p class="running">Running score <b>' + total() + "</b> / " + maxScore() + "</p>";

    if (result) {
      var next = document.getElementById("next");
      next.focus({ preventScroll: true });
      next.onclick = function () {
        if (i + 1 < theCase.stages.length) { state.stage = i + 1; }
        else { state.screen = "result"; recordStats(); }
        persist(); render(); window.scrollTo(0, 0);
      };
    } else {
      var input = document.getElementById("guess");
      if (window.matchMedia("(hover: hover)").matches) input.focus();
      document.getElementById("answer").onsubmit = function (e) {
        e.preventDefault();
        var g = input.value.trim();
        if (!g) return;
        var list = state.guesses[i] || (state.guesses[i] = []);
        var tryIdx = list.length;
        list.push(g);
        if (isMatch(g, st.answers)) {
          state.results[i] = { points: STAGE_POINTS[tryIdx], solved: true };
        } else if (list.length >= MAX_TRIES) {
          state.results[i] = { points: 0, solved: false };
        } else {
          persist(); render();
          var sheet = document.querySelector(".sheet");
          sheet.classList.add("shake");
          return;
        }
        persist(); render();
      };
    }
  }

  function recordStats() {
    if (stats.lastDay === todayKey) return;
    var y = new Date(now); y.setDate(y.getDate() - 1);
    stats.streak = stats.lastDay === localKey(y) ? stats.streak + 1 : 1;
    stats.played += 1;
    stats.best = Math.max(stats.best, total());
    stats.lastDay = todayKey;
    save("coldread:stats", stats);
  }

  function shareText() {
    var grid = state.results.map(function (r) {
      return r.points === STAGE_POINTS[0] ? "🟩" : r.points === STAGE_POINTS[1] ? "🟨" : r.points > 0 ? "🟧" : "⬛";
    }).join("");
    return "Cold Read #" + caseNo + " — " + rankFor(total()).title + "\n" + grid + " " + total() + "/" + maxScore();
  }

  function renderResult() {
    var score = total();
    var rank = rankFor(score);
    var rows = theCase.stages.map(function (st, i) {
      var r = state.results[i] || { points: 0 };
      return '<li class="' + tagClass(r) + '"><span class="n">' + (i + 1) + '</span><span class="d">' + esc(st.date) +
        '</span><span class="p">' + r.points + "</span></li>";
    }).join("");

    app.innerHTML =
      header() + tags() +
      '<section class="sheet result">' +
        '<div class="stamp" aria-hidden="true">Case Closed</div>' +
        '<p class="eyebrow">Detective rating</p>' +
        '<h1 class="rank">' + esc(rank.title) + "</h1>" +
        '<p class="score"><span>' + score + "</span> / " + maxScore() + "</p>" +
        '<p class="rank-note">' + esc(rank.note) + "</p>" +
        '<ol class="ledger">' + rows + "</ol>" +
        '<div class="share">' +
          '<pre id="share-text">' + esc(shareText()) + "</pre>" +
          '<button class="btn primary" id="copy" type="button">Copy result</button>' +
          '<span class="copied" id="copied" role="status"></span>' +
        "</div>" +
        '<p class="next-case">Next case in <b id="countdown">--:--:--</b></p>' +
      "</section>" +
      statsBar() +
      '<section class="sheet aftermath">' +
        "<h2>What happened next</h2>" +
        '<ul class="epilogue">' + theCase.epilogue.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>" +
        "<h2>In memory</h2>" +
        '<ul class="memorial">' + theCase.victims.map(function (v) {
          return '<li><span>' + esc(v.name) + '</span><span class="yr">' + v.year + "</span></li>";
        }).join("") + "</ul>" +
        "<h2>Sources</h2>" +
        '<ul class="sources">' + theCase.sources.map(function (s) {
          return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + "</a></li>";
        }).join("") + "</ul>" +
      "</section>";

    document.getElementById("copy").onclick = function () {
      var text = shareText();
      var done = function (msg) { document.getElementById("copied").textContent = msg; };
      try {
        navigator.clipboard.writeText(text).then(function () { done("Copied"); }, function () { selectShare(); done("Select and copy the text above"); });
      } catch (e) { selectShare(); done("Select and copy the text above"); }
    };
    tick();
  }

  function selectShare() {
    var el = document.getElementById("share-text");
    var range = document.createRange(); range.selectNodeContents(el);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  }

  function statsBar() {
    if (!stats.played) return "";
    return '<dl class="stats">' +
      "<div><dt>Cases</dt><dd>" + stats.played + "</dd></div>" +
      "<div><dt>Streak</dt><dd>" + stats.streak + "</dd></div>" +
      "<div><dt>Best</dt><dd>" + stats.best + "</dd></div>" +
    "</dl>";
  }

  var timer;
  function tick() {
    clearInterval(timer);
    var el = document.getElementById("countdown");
    if (!el) return;
    function upd() {
      var n = new Date();
      var mid = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
      var s = Math.max(0, Math.floor((mid - n) / 1000));
      if (s === 0) { location.reload(); return; }
      var hh = String(Math.floor(s / 3600)).padStart(2, "0");
      var mm = String(Math.floor(s % 3600 / 60)).padStart(2, "0");
      var ss = String(s % 60).padStart(2, "0");
      el.textContent = hh + ":" + mm + ":" + ss;
    }
    upd(); timer = setInterval(upd, 1000);
  }

  function render() {
    if (!theCase) { app.innerHTML = "<p>No cases loaded.</p>"; return; }
    if (state.screen === "stage") renderStage();
    else if (state.screen === "result") renderResult();
    else renderIntro();
  }

  window.__coldRead = { isMatch: isMatch, rankFor: rankFor };
  render();
})();
