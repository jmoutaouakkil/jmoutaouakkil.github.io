/* =============================================================
   Jamal Moutaouakkil · site personnel
   Tout est écrit à la main, sans bibliothèque : canevas 2D,
   IntersectionObserver et une seule boucle d'animation.
   ============================================================= */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = {
    blue:  '#58c4dd',
    yellow:'#f5cd54',
    green: '#7ec96b',
    red:   '#fc6255',
    violet:'#9b7ff0',
    ink:   '#eef2f9',
    muted: '#8290a8',
    line:  '#222e42'
  };

  /* ---------- utilitaires ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  // Prépare un canevas pour les écrans à haute densité.
  function surface(canvas) {
    var s = { canvas: canvas, ctx: canvas.getContext('2d'), w: 0, h: 0 };
    s.fit = function () {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width) return false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.w = rect.width;
      s.h = rect.height;
      return true;
    };
    s.fit();
    return s;
  }

  // Boucle d'animation unique : chaque module s'y abonne et peut se mettre en pause.
  var frames = [];
  function onFrame(fn) { frames.push(fn); }
  function tick(t) {
    for (var i = 0; i < frames.length; i++) frames[i](t / 1000);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Un module ne s'anime que s'il est visible à l'écran.
  function visibility(el) {
    var state = { seen: true };
    if ('IntersectionObserver' in window) {
      state.seen = false;
      new IntersectionObserver(function (entries) {
        state.seen = entries[0].isIntersecting;
      }, { threshold: 0.01 }).observe(el);
    }
    return state;
  }

  function nf(x, d) {
    return x.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  /* =========================================================
     Navigation, progression, apparitions
     ========================================================= */
  (function chrome() {
    var nav = $('#nav'), bar = $('#progress'), burger = $('#burger'), links = $('.nav__links');

    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle('is-stuck', y > 12);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    if ('IntersectionObserver' in window) {
      // Apparition progressive des blocs
      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); reveal.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
      $$('.reveal').forEach(function (el) { reveal.observe(el); });

      // Lien actif dans la barre de navigation
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var link = $('.nav__links a[href="#' + e.target.id + '"]');
          if (link) link.classList.toggle('is-active', e.isIntersecting);
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      $$('section[id]').forEach(function (s) { spy.observe(s); });
    } else {
      $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    }
  })();

  /* =========================================================
     01 · Hero : le cercle trigonométrique déroule son sinus
     ========================================================= */
  (function heroViz() {
    var cv = $('#c-hero'); if (!cv) return;
    var s = surface(cv), vis = visibility(cv), phase = 0, last = null;

    window.addEventListener('resize', s.fit);

    function draw() {
      var ctx = s.ctx, W = s.w, H = s.h;
      var cx = W * 0.19, cy = H * 0.5, R = Math.min(H * 0.3, W * 0.17);
      var x0 = cx + R + W * 0.06, x1 = W - W * 0.05;
      var span = x1 - x0, k = span / (Math.PI * 4); // 2 périodes visibles

      ctx.clearRect(0, 0, W, H);

      // repères
      ctx.strokeStyle = 'rgba(130,144,168,.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.35, cy); ctx.lineTo(x1, cy);
      ctx.moveTo(cx, cy - R * 1.35); ctx.lineTo(cx, cy + R * 1.35);
      ctx.stroke();

      // cercle
      ctx.strokeStyle = 'rgba(88,196,221,.45)';
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      // sinusoïde déjà déroulée
      ctx.strokeStyle = C.blue;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (var i = 0; i <= 240; i++) {
        var x = x0 + (span * i) / 240;
        var y = cy - Math.sin(phase - (x - x0) / k) * R;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();

      // rayon + point mobile
      var px = cx + Math.cos(phase) * R, py = cy - Math.sin(phase) * R;
      ctx.strokeStyle = 'rgba(245,205,84,.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();

      // trait de projection vers la courbe
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = 'rgba(245,205,84,.45)';
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x0, py); ctx.stroke();
      ctx.setLineDash([]);

      [[px, py], [x0, py]].forEach(function (p, idx) {
        ctx.fillStyle = idx ? C.yellow : C.yellow;
        ctx.beginPath(); ctx.arc(p[0], p[1], idx ? 4.5 : 4, 0, Math.PI * 2); ctx.fill();
      });

      // légendes
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(130,144,168,.85)';
      ctx.fillText('cos θ , sin θ', cx - R * 0.6, cy + R * 1.35 + 18);
      ctx.fillStyle = 'rgba(88,196,221,.85)';
      ctx.fillText('y = sin θ', x0 + 8, cy - R - 14);
    }

    onFrame(function (t) {
      if (last === null) last = t;
      var dt = Math.min(t - last, 0.05); last = t;
      if (!vis.seen) return;
      if (!REDUCED) phase += dt * 0.7;
      draw();
    });
    draw();
  })();

  /* =========================================================
     02 · Pythagore : quatre triangles qui glissent
     Les triangles ne subissent que des translations : l'aire
     laissée libre passe de c² à a² + b².
     ========================================================= */
  (function pythagore() {
    var cv = $('#c-pyth'); if (!cv) return;
    var s = surface(cv);
    var range = $('#pyth-t'), playBtn = $('#pyth-play');
    var t = 0, playing = false, dir = 1, last = null;

    window.addEventListener('resize', function () { s.fit(); draw(); });

    // Géométrie en coordonnées normalisées (côté du grand carré = 1)
    var A = 0.38, B = 0.62;              // a + b = 1
    // Chaque triangle : sommets de départ, vecteur de translation, et le
    // moment où il se met en mouvement (les glissements sont décalés pour
    // qu'on puisse suivre chaque pièce à l'œil).
    var TRI = [
      { p: [[1, 0], [1, A], [A, 0]], d: [0, 0],     t0: 0.00 },
      { p: [[0, 0], [A, 0], [0, B]], d: [0, A],     t0: 0.02 },
      { p: [[1, 1], [B, 1], [1, A]], d: [-B, 0],    t0: 0.30 },
      { p: [[0, 1], [0, B], [B, 1]], d: [A, -B],    t0: 0.58 }
    ];
    var DUR = 0.42;

    function smooth(u) { return u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u); }

    // Contours : le carré penché de côté c, puis les carrés a² et b².
    var TILTED = [[A, 0], [1, A], [B, 1], [0, B]];
    var SQ_A = [[0, 0], [A, 0], [A, A], [0, A]];
    var SQ_B = [[A, A], [1, A], [1, 1], [A, 1]];

    function draw() {
      var ctx = s.ctx, W = s.w, H = s.h;
      var pad = Math.min(W, H) * 0.09;
      var side = Math.min(W, H) - pad * 2;
      var ox = (W - side) / 2, oy = (H - side) / 2;
      // repère mathématique : y vers le haut
      function X(u) { return ox + u * side; }
      function Y(v) { return oy + (1 - v) * side; }

      function poly(pts, dx, dy) {
        ctx.beginPath();
        pts.forEach(function (pt, i) {
          var x = X(pt[0] + (dx || 0)), y = Y(pt[1] + (dy || 0));
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.closePath();
      }

      ctx.clearRect(0, 0, W, H);

      // aire libre = tout le carré, peinte en jaune puis recouverte
      ctx.fillStyle = 'rgba(245,205,84,.22)';
      ctx.fillRect(X(0), Y(1), side, side);
      ctx.strokeStyle = 'rgba(245,205,84,.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(X(0), Y(1), side, side);

      var fadeC = Math.max(0, 1 - t * 3);
      var fadeAB = Math.max(0, (t - 0.88) / 0.12);

      // contour du carré de côté c (au départ)
      if (fadeC > 0.01) {
        ctx.strokeStyle = 'rgba(245,205,84,' + (0.75 * fadeC) + ')';
        ctx.lineWidth = 2;
        poly(TILTED); ctx.stroke();
      }

      // les quatre triangles, chacun avec son propre départ
      TRI.forEach(function (tr) {
        var u = smooth((t - tr.t0) / DUR);
        poly(tr.p, tr.d[0] * u, tr.d[1] * u);
        ctx.fillStyle = '#4fb8d0';
        ctx.fill();
        ctx.strokeStyle = '#0a0d14';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // contours des carrés a² et b² (à l'arrivée)
      if (fadeAB > 0.01) {
        ctx.strokeStyle = 'rgba(245,205,84,' + (0.8 * fadeAB) + ')';
        ctx.lineWidth = 2;
        poly(SQ_A); ctx.stroke();
        poly(SQ_B); ctx.stroke();
      }

      // étiquettes des aires
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var fs = Math.max(16, side * 0.075);
      ctx.font = '500 ' + fs + 'px Newsreader, Georgia, serif';

      if (fadeC > 0.01) {
        ctx.fillStyle = 'rgba(245,205,84,' + fadeC + ')';
        ctx.fillText('c²', X(0.5), Y(0.5));
      }
      if (fadeAB > 0.01) {
        ctx.fillStyle = 'rgba(245,205,84,' + fadeAB + ')';
        ctx.fillText('a²', X(A / 2), Y(A / 2));
        ctx.fillText('b²', X(A + B / 2), Y(A + B / 2));
      }

      // côtés a et b sur l'arête du bas, au départ
      if (fadeC > 0.01) {
        ctx.font = '500 ' + (fs * 0.6) + 'px Newsreader, Georgia, serif';
        ctx.fillStyle = 'rgba(130,144,168,' + fadeC + ')';
        ctx.fillText('a', X(A / 2), Y(0) + pad * 0.55);
        ctx.fillText('b', X(A + B / 2), Y(0) + pad * 0.55);
      }
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    }

    range.addEventListener('input', function () {
      t = range.value / 1000; playing = false;
      playBtn.textContent = 'Faire glisser';
      draw();
    });
    playBtn.addEventListener('click', function () {
      if (t >= 0.999) dir = -1; else if (t <= 0.001) dir = 1;
      playing = !playing;
      playBtn.textContent = playing ? 'Pause' : 'Faire glisser';
    });

    onFrame(function (now) {
      if (last === null) last = now;
      var dt = Math.min(now - last, 0.05); last = now;
      if (!playing) return;
      t += dir * dt * 0.34;
      if (t >= 1) { t = 1; playing = false; dir = -1; playBtn.textContent = 'Rejouer à l\'envers'; }
      if (t <= 0) { t = 0; playing = false; dir = 1; playBtn.textContent = 'Faire glisser'; }
      range.value = Math.round(t * 1000);
      draw();
    });

    draw();
  })();

  /* =========================================================
     03 · Monte-Carlo : estimer π au hasard
     ========================================================= */
  (function monteCarlo() {
    var cv = $('#c-mc'); if (!cv) return;
    var s = surface(cv), vis = visibility(cv);
    var elTotal = $('#mc-total'), elIn = $('#mc-in'), elPi = $('#mc-pi');
    var btn = $('#mc-toggle'), reset = $('#mc-reset');
    var pts = [], total = 0, inside = 0, running = false;
    var MAX_KEPT = 5000;

    function frame() {
      var ctx = s.ctx, W = s.w, H = s.h;
      var pad = Math.min(W, H) * 0.07, side = Math.min(W, H) - pad * 2;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(130,144,168,.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(pad, pad, side, side);
      // quart de disque
      ctx.strokeStyle = 'rgba(245,205,84,.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pad, pad + side, side, -Math.PI / 2, 0);
      ctx.stroke();
      return { pad: pad, side: side };
    }

    function plot(g, p) {
      var ctx = s.ctx;
      ctx.fillStyle = p[2] ? 'rgba(88,196,221,.75)' : 'rgba(252,98,85,.7)';
      ctx.beginPath();
      ctx.arc(g.pad + p[0] * g.side, g.pad + (1 - p[1]) * g.side, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }

    function redrawAll() {
      var g = frame();
      for (var i = 0; i < pts.length; i++) plot(g, pts[i]);
      return g;
    }

    function refresh() {
      elTotal.textContent = total.toLocaleString('fr-FR');
      elIn.textContent = inside.toLocaleString('fr-FR');
      elPi.textContent = total ? nf(4 * inside / total, 4) : '·';
    }

    window.addEventListener('resize', function () { s.fit(); redrawAll(); });

    btn.addEventListener('click', function () {
      running = !running;
      btn.textContent = running ? 'Pause' : (total ? 'Continuer' : 'Lancer');
    });
    reset.addEventListener('click', function () {
      pts = []; total = 0; inside = 0; running = false;
      btn.textContent = 'Lancer'; refresh(); frame();
    });

    var geom = null;
    onFrame(function () {
      if (!running || !vis.seen) return;
      if (!geom) geom = frame();
      for (var i = 0; i < 40; i++) {
        var x = Math.random(), y = Math.random();
        var hit = x * x + y * y <= 1;
        total++; if (hit) inside++;
        if (pts.length < MAX_KEPT) { pts.push([x, y, hit]); plot(geom, [x, y, hit]); }
      }
      refresh();
    });

    frame(); refresh();
  })();

  /* =========================================================
     04 · Monty Hall
     ========================================================= */
  (function monty() {
    var wrap = $('#monty'); if (!wrap) return;
    var doors = $$('.door', wrap);
    var msg = $('#monty-msg');
    var choice = $('#monty-choice'), again = $('#monty-again');
    var car = -1, picked = -1, opened = -1;

    function reset() {
      car = Math.floor(Math.random() * 3);
      picked = -1; opened = -1;
      doors.forEach(function (d) {
        d.className = 'door';
        d.disabled = false;
        $('.door__prize', d).textContent = '';
      });
      choice.hidden = true; again.hidden = true;
      msg.textContent = 'Choisissez une porte pour commencer.';
    }

    function open(i) {
      var d = doors[i];
      $('.door__prize', d).textContent = (i === car ? '🚗' : '🐐');
      d.classList.add('is-open');
    }

    doors.forEach(function (d, i) {
      d.addEventListener('click', function () {
        if (picked !== -1) return;
        picked = i;
        d.classList.add('is-picked');
        // le présentateur ouvre une porte à chèvre, différente du choix
        var options = [0, 1, 2].filter(function (k) { return k !== picked && k !== car; });
        opened = options[Math.floor(Math.random() * options.length)];
        open(opened);
        doors[opened].disabled = true;
        var rest = [0, 1, 2].filter(function (k) { return k !== picked && k !== opened; })[0];
        msg.innerHTML = 'La porte <b>' + (opened + 1) + '</b> cachait une chèvre. ' +
                        'Vous gardez la <b>' + (picked + 1) + '</b> ou vous passez à la <b>' + (rest + 1) + '</b>&nbsp;?';
        choice.hidden = false;
        doors.forEach(function (x) { x.disabled = true; });
      });
    });

    function finish(sw) {
      var rest = [0, 1, 2].filter(function (k) { return k !== picked && k !== opened; })[0];
      var final = sw ? rest : picked;
      doors.forEach(function (d, i) { open(i); d.classList.remove('is-picked'); });
      doors[final].classList.add(final === car ? 'is-win' : 'is-picked');
      msg.innerHTML = final === car
        ? '🎉 Gagné&nbsp;! La voiture était bien derrière la porte <b>' + (final + 1) + '</b>.'
        : 'Perdu, la voiture était derrière la porte <b>' + (car + 1) + '</b>.';
      choice.hidden = true; again.hidden = false;
    }

    $('#monty-stay').addEventListener('click', function () { finish(false); });
    $('#monty-switch').addEventListener('click', function () { finish(true); });
    $('#monty-replay').addEventListener('click', reset);

    // --- simulation de 10 000 parties ---
    var runBtn = $('#sim-run');
    runBtn.addEventListener('click', function () {
      var N = 10000, stay = 0, sw = 0;
      for (var i = 0; i < N; i++) {
        var c = Math.floor(Math.random() * 3), p = Math.floor(Math.random() * 3);
        // garder gagne si le premier choix était bon ; changer gagne sinon
        if (p === c) stay++; else sw++;
      }
      var ps = stay / N, pw = sw / N;
      $('#bar-stay').style.width = (ps * 100) + '%';
      $('#bar-switch').style.width = (pw * 100) + '%';
      $('#pct-stay').textContent = nf(ps * 100, 1) + ' %';
      $('#pct-switch').textContent = nf(pw * 100, 1) + ' %';
      runBtn.textContent = 'Rejouer 10 000 parties';
    });

    reset();
  })();

  /* =========================================================
     05 · Paradoxe des anniversaires
     ========================================================= */
  (function birthday() {
    var cv = $('#c-bd'); if (!cv) return;
    var s = surface(cv), range = $('#bd-range');
    var elN = $('#bd-n'), elP = $('#bd-p');

    function proba(n) {
      var q = 1;
      for (var k = 1; k < n; k++) q *= (1 - k / 365);
      return 1 - q;
    }

    function draw() {
      var ctx = s.ctx, W = s.w, H = s.h;
      var L = 46, R = 14, T = 16, Bm = 30;
      var pw = W - L - R, ph = H - T - Bm;
      var NMAX = 70;
      ctx.clearRect(0, 0, W, H);

      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.strokeStyle = 'rgba(34,46,66,.9)';
      ctx.fillStyle = 'rgba(130,144,168,.85)';
      ctx.lineWidth = 1;
      for (var p = 0; p <= 100; p += 25) {
        var y = T + ph * (1 - p / 100);
        ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + pw, y); ctx.stroke();
        ctx.fillText(p + '%', 6, y + 4);
      }
      for (var n = 0; n <= NMAX; n += 10) {
        var x = L + pw * (n / NMAX);
        ctx.fillText(String(n), x - (n > 9 ? 8 : 3), H - 10);
      }

      // courbe
      ctx.strokeStyle = C.blue; ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (var i = 1; i <= NMAX; i++) {
        var xx = L + pw * (i / NMAX), yy = T + ph * (1 - proba(i));
        i === 1 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
      }
      ctx.stroke();

      // point courant
      var cur = +range.value;
      var cx = L + pw * (cur / NMAX), cy = T + ph * (1 - proba(cur));
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = 'rgba(245,205,84,.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, T + ph); ctx.lineTo(cx, cy); ctx.lineTo(L, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.yellow;
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    }

    function update() {
      var n = +range.value;
      elN.textContent = n;
      elP.textContent = nf(proba(n) * 100, 1) + ' %';
      draw();
    }
    range.addEventListener('input', update);
    window.addEventListener('resize', function () { s.fit(); draw(); });
    update();
  })();

  /* =========================================================
     06 · Suite de Syracuse (conjecture de Collatz)
     ========================================================= */
  (function syracuse() {
    var cv = $('#c-syr'); if (!cv) return;
    var s = surface(cv), vis = visibility(cv);
    var input = $('#syr-n'), btn = $('#syr-run');
    var elSteps = $('#syr-steps'), elMax = $('#syr-max');
    var seq = [], shown = 0, animating = false;

    function compute(n) {
      var out = [n], guard = 0;
      while (n !== 1 && guard++ < 20000) {
        n = (n % 2 === 0) ? n / 2 : 3 * n + 1;
        out.push(n);
      }
      return out;
    }

    function draw() {
      var ctx = s.ctx, W = s.w, H = s.h;
      var L = 52, R = 16, T = 20, Bm = 28;
      var pw = W - L - R, ph = H - T - Bm;
      ctx.clearRect(0, 0, W, H);
      if (seq.length < 2) return;

      var max = Math.max.apply(null, seq);
      var nx = seq.length - 1;

      // grille
      ctx.strokeStyle = 'rgba(34,46,66,.85)';
      ctx.fillStyle = 'rgba(130,144,168,.8)';
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.lineWidth = 1;
      for (var i = 0; i <= 4; i++) {
        var y = T + ph * (i / 4);
        ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + pw, y); ctx.stroke();
        var v = Math.round(max * (1 - i / 4));
        ctx.fillText(v.toLocaleString('fr-FR'), 6, y + 4);
      }

      function X(i) { return L + pw * (i / nx); }
      function Y(v) { return T + ph * (1 - v / max); }

      var upto = Math.min(shown, nx);

      // aire sous la courbe
      ctx.beginPath();
      ctx.moveTo(X(0), T + ph);
      for (var k = 0; k <= upto; k++) ctx.lineTo(X(k), Y(seq[k]));
      ctx.lineTo(X(upto), T + ph);
      ctx.closePath();
      var grad = ctx.createLinearGradient(0, T, 0, T + ph);
      grad.addColorStop(0, 'rgba(88,196,221,.28)');
      grad.addColorStop(1, 'rgba(88,196,221,0)');
      ctx.fillStyle = grad; ctx.fill();

      // trajectoire
      ctx.strokeStyle = C.blue; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var j = 0; j <= upto; j++) {
        var x = X(j), y = Y(seq[j]);
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();

      // sommet atteint
      var peak = seq.indexOf(max);
      if (upto >= peak) {
        ctx.fillStyle = C.yellow;
        ctx.beginPath(); ctx.arc(X(peak), Y(max), 4, 0, Math.PI * 2); ctx.fill();
      }
      // tête de lecture
      ctx.fillStyle = upto >= nx ? C.green : C.ink;
      ctx.beginPath(); ctx.arc(X(upto), Y(seq[upto]), 3.5, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = 'rgba(130,144,168,.8)';
      ctx.fillText('étapes →', L + pw - 58, H - 8);
    }

    function run() {
      var n = Math.max(1, Math.min(999999, Math.floor(+input.value) || 1));
      input.value = n;
      seq = compute(n);
      elSteps.textContent = (seq.length - 1).toLocaleString('fr-FR');
      elMax.textContent = Math.max.apply(null, seq).toLocaleString('fr-FR');
      shown = REDUCED ? seq.length : 0;
      animating = !REDUCED;
      draw();
    }

    btn.addEventListener('click', run);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
    window.addEventListener('resize', function () { s.fit(); draw(); });

    var last = null;
    onFrame(function (t) {
      if (last === null) last = t;
      var dt = Math.min(t - last, 0.05); last = t;
      if (!animating || !vis.seen) return;
      shown += dt * Math.max(20, seq.length / 1.6);
      if (shown >= seq.length - 1) { shown = seq.length - 1; animating = false; }
      draw();
    });

    run();
  })();

})();
