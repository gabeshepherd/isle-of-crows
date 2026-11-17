/* The Seventh Veil — living hourglass.
   Geometry and tones measured from the official poster (1025×1535); drawing
   space is the poster cropped to x 130–895, y 90–1150 (765×1060).

   The stars are sand: each one drifts toward the neck, passes through it and
   falls as light toward the doorway. Time is a single value (flow) that every
   particle reads, so time can stop, skip or run backwards and the field follows.

   Interaction: the pointer stirs the stars; pressing and holding rewinds time;
   hovering the doorway brightens it. Holding for five seconds or more tears
   the moment open: the sand escapes the hourglass and spirals backwards across
   the whole hero (drawn on the [data-fx] canvas; the root gets .is-veil).
   Every visit is different: a new arrangement of stars, and one of four
   Descompassos (a clock exactly one minute late that sometimes slips back,
   time skipping, time stalling, time echoing). The sand always falls;
   only a held press sends it back. */
(function () {
  var VX = 130, VY = 90, VW = 765, VH = 1060;
  var BG = '#090609';
  var APEX = { x: 513, y: 643 };
  var TOP = { y: 112, l: 205, r: 822 };
  var BEAM = { y0: 649, y1: 1050, l: 297, r: 730 };
  var HZ = 1050.5;
  var DOOR = { x0: 503, x1: 525, ytl: 893, ytr: 912 };
  var VARIANTS = ['late', 'skip', 'stall', 'echo'];

  function mix(a, b) {
    var h = Math.imul(a ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul(b + 0x632BE5AB, 0xC2B2AE35);
    h ^= h >>> 15; h = Math.imul(h, 0x2C1B3C6D); h ^= h >>> 12; h = Math.imul(h, 0x297A2D39); h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function store(key, val) {
    try { if (val === undefined) return window.localStorage.getItem(key); window.localStorage.setItem(key, val); } catch (e) {}
    return null;
  }
  function pickVisit() {
    var last = parseInt(store('tsv:v') || '-1', 10), n = VARIANTS.length;
    var i = Math.floor(Math.random() * n);
    if (i === last) i = (i + 1 + Math.floor(Math.random() * (n - 1))) % n;
    store('tsv:v', String(i));
    return { variant: VARIANTS[i], seed: (Math.random() * 4294967296) >>> 0 };
  }
  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  // ——— static layer: beam, water, horizon, door, dust ———
  function drawStatic(ctx, k, seed) {
    var r = rng(seed ^ 0xA5A5), i;   // transparent: the page's black shows through
    ctx.fillStyle = '#efe8de';
    var dot = Math.max(0.7, 1 / k);
    for (i = 0; i < 2400; i++) {
      var a = Math.sqrt(r()), b = r();
      var x = (1 - a) * TOP.l + a * (1 - b) * TOP.r + a * b * APEX.x;
      var y = (1 - a) * TOP.y + a * (1 - b) * TOP.y + a * b * APEX.y;
      ctx.globalAlpha = (0.04 + r() * 0.1) * (0.2 + 0.8 * smooth(TOP.y, TOP.y + 120, y));
      ctx.fillRect(x, y, dot, dot);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.beginPath(); ctx.moveTo(APEX.x, BEAM.y0); ctx.lineTo(BEAM.r, BEAM.y1); ctx.lineTo(BEAM.l, BEAM.y1); ctx.closePath(); ctx.clip();
    var vg = ctx.createLinearGradient(0, BEAM.y0, 0, BEAM.y1);
    vg.addColorStop(0, 'rgb(222,210,200)'); vg.addColorStop(0.12, 'rgb(176,166,158)');
    vg.addColorStop(0.5, 'rgb(130,123,117)'); vg.addColorStop(1, 'rgb(100,95,90)');
    ctx.fillStyle = vg; ctx.fillRect(BEAM.l, BEAM.y0, BEAM.r - BEAM.l, BEAM.y1 - BEAM.y0);
    if (ctx.createConicGradient) {
      var half = Math.atan2((BEAM.r - BEAM.l) / 2, BEAM.y1 - BEAM.y0) / (2 * Math.PI);
      var cg = ctx.createConicGradient(0, APEX.x, BEAM.y0);
      [[-1.05, 128], [-0.84, 156], [-0.58, 204], [0, 255], [0.58, 204], [0.84, 156], [1.05, 128]].forEach(function (s) {
        cg.addColorStop(0.25 + half * s[0], 'rgb(' + s[1] + ',' + s[1] + ',' + s[1] + ')');
      });
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = cg; ctx.fillRect(BEAM.l, BEAM.y0, BEAM.r - BEAM.l, BEAM.y1 - BEAM.y0);
      ctx.globalCompositeOperation = 'source-over';
    }
    var rg = ctx.createLinearGradient(0, BEAM.y0, 0, BEAM.y1);
    rg.addColorStop(0, 'rgba(255,248,240,0.45)'); rg.addColorStop(0.4, 'rgba(255,248,240,0.08)'); rg.addColorStop(1, 'rgba(255,248,240,0.02)');
    ctx.fillStyle = rg; ctx.fillRect(APEX.x - 0.8, BEAM.y0, 1.6, BEAM.y1 - BEAM.y0);
    var rw = ctx.createLinearGradient(APEX.x - 16, 0, APEX.x + 16, 0);
    rw.addColorStop(0, 'rgba(255,248,240,0)'); rw.addColorStop(0.5, 'rgba(255,248,240,0.12)'); rw.addColorStop(1, 'rgba(255,248,240,0)');
    ctx.fillStyle = rw; ctx.fillRect(APEX.x - 16, BEAM.y0, 32, BEAM.y1 - BEAM.y0);
    var pg = ctx.createRadialGradient(514, 1050, 0, 514, 1050, 150);
    pg.addColorStop(0, 'rgba(255,244,232,0.28)'); pg.addColorStop(1, 'rgba(255,244,232,0)');
    ctx.fillStyle = pg; ctx.fillRect(BEAM.l, 880, BEAM.r - BEAM.l, 180);
    ctx.restore();

    ctx.save();
    ctx.beginPath(); ctx.rect(VX, HZ, VW, VY + VH - HZ); ctx.clip();
    ctx.translate(514, HZ); ctx.scale(1, 0.2);
    var wg = ctx.createRadialGradient(0, 0, 0, 0, 0, 420);
    wg.addColorStop(0, 'rgba(92,87,83,1)'); wg.addColorStop(0.5, 'rgba(48,45,43,0.8)'); wg.addColorStop(1, 'rgba(9,6,9,0)');
    ctx.fillStyle = wg; ctx.fillRect(-420, 0, 840, 460);
    ctx.restore();
    var wr = rng(311), y2, gap;
    for (y2 = HZ + 2, gap = 2.2; y2 < 1146; y2 += gap, gap *= 1.035) {
      var depth = (y2 - HZ) / 95, span = 300 * (1 - depth * 0.35);
      ctx.globalAlpha = 0.05 + wr() * 0.07 * (1 - depth);
      ctx.fillStyle = wr() < 0.5 ? '#000' : '#cfc6bc';
      ctx.fillRect(514 - span + wr() * 30, y2, span * 2 - wr() * 60, 0.8);
    }
    ctx.globalAlpha = 1;

    var hg = ctx.createLinearGradient(258, 0, 740, 0);
    hg.addColorStop(0, 'rgba(240,234,228,0)'); hg.addColorStop(0.12, 'rgba(240,234,228,0.35)');
    hg.addColorStop(0.4, 'rgba(240,234,228,0.7)'); hg.addColorStop(0.53, 'rgba(255,250,244,1)');
    hg.addColorStop(0.66, 'rgba(240,234,228,0.7)'); hg.addColorStop(0.88, 'rgba(240,234,228,0.35)'); hg.addColorStop(1, 'rgba(240,234,228,0)');
    ctx.fillStyle = hg; ctx.fillRect(258, HZ - 0.9, 482, 1.8);
    ctx.save(); ctx.filter = 'blur(' + (3 * k) + 'px)'; ctx.globalAlpha = 0.5; ctx.fillRect(258, HZ - 2, 482, 4); ctx.restore();

    ctx.save();
    ctx.shadowColor = 'rgba(255,240,224,0.65)'; ctx.shadowBlur = 22 * k;
    var dg = ctx.createLinearGradient(0, DOOR.ytl, 0, HZ);
    dg.addColorStop(0, 'rgb(222,211,201)'); dg.addColorStop(0.6, 'rgb(238,228,217)'); dg.addColorStop(1, 'rgb(250,243,234)');
    ctx.fillStyle = dg;
    ctx.beginPath(); ctx.moveTo(DOOR.x0, DOOR.ytl); ctx.lineTo(DOOR.x1, DOOR.ytr); ctx.lineTo(DOOR.x1, HZ); ctx.lineTo(DOOR.x0, HZ); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(150,141,134,0.9)';
    ctx.beginPath(); ctx.moveTo(DOOR.x1, DOOR.ytr); ctx.lineTo(DOOR.x1 + 3.5, DOOR.ytr + 2); ctx.lineTo(DOOR.x1 + 3.5, HZ); ctx.lineTo(DOOR.x1, HZ); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(514, HZ); ctx.scale(1, 0.22);
    var fg = ctx.createRadialGradient(0, 0, 0, 0, 0, 70);
    fg.addColorStop(0, 'rgba(255,250,244,0.95)'); fg.addColorStop(0.4, 'rgba(255,250,244,0.3)'); fg.addColorStop(1, 'rgba(255,250,244,0)');
    ctx.fillStyle = fg; ctx.fillRect(-70, -70, 140, 140);
    ctx.restore();
  }

  function reflectionOfDoor(ctx, cx, strength, seed) {
    var wr = rng(seed), y, gap;
    for (y = HZ + 1, gap = 1.6; y < 1140; y += gap, gap *= 1.04) {
      var d = (y - HZ) / 90, a = Math.max(0, Math.pow(1 - d, 1.8)) * strength;
      var w = 14 + d * 34 + wr() * 10;
      var g = ctx.createLinearGradient(cx - w, 0, cx + w, 0);
      g.addColorStop(0, 'rgba(240,230,218,0)'); g.addColorStop(0.5, 'rgba(240,230,218,1)'); g.addColorStop(1, 'rgba(240,230,218,0)');
      ctx.globalAlpha = a * (0.55 + wr() * 0.45);
      ctx.fillStyle = g; ctx.fillRect(cx - w, y, w * 2, 1.1);
    }
    ctx.globalAlpha = 1;
  }

  function Hourglass(root, opts) {
    var canvas = root.querySelector('canvas');
    var clockEl = root.querySelector('[data-clock]');
    var hintEl = root.querySelector('[data-hint]');
    // passive: a poster (the gateway card) — no clock, no pointer, no Descompasso, and the
    // visit's variant is left untouched for the real page.
    var passive = !!(opts && opts.passive);
    var visit = passive ? { variant: 'calm', seed: (Math.random() * 4294967296) >>> 0 } : pickVisit();
    if (opts && opts.variant) visit.variant = opts.variant;
    var V = visit.variant, SEED = visit.seed;
    root.setAttribute('data-variant', V);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var N = passive ? 2000 : (canvas.clientWidth < 420 ? 2600 : 3600);
    var phase = new Float32Array(N), rate = new Float32Array(N), size = new Float32Array(N), bright = new Float32Array(N);
    var cyc = new Int32Array(N), hx = new Float32Array(N), hy = new Float32Array(N), ox = new Float32Array(N), oy = new Float32Array(N), wob = new Float32Array(N);
    var r = rng(SEED), i;
    for (i = 0; i < N; i++) {
      phase[i] = r() * 50; rate[i] = 0.008 + r() * 0.012;
      size[i] = 0.45 + Math.pow(r(), 3.2) * 1.45; bright[i] = 0.55 + r() * 0.45; wob[i] = r() * 6.28; cyc[i] = -2147483647;
    }
    var SPARK = [];
    for (i = 0; i < 6; i++) {
      var a = Math.sqrt(0.08 + r() * 0.45), b = 0.15 + r() * 0.7;
      var e = TOP.l + (APEX.x - TOP.l) * a, f = TOP.r + (APEX.x - TOP.r) * a;
      SPARK.push({ x: e + (f - e) * b, y: TOP.y + a * (APEX.y - TOP.y), s: 0.45 + r() * 0.55, p: r() * 6.28 });
    }
    var MOTES = 16, mPhase = [], mRate = [];
    for (i = 0; i < MOTES; i++) { mPhase.push(r()); mRate.push(0.04 + r() * 0.05); }

    var layer = document.createElement('canvas'), k = 1, dpr = 1, W = 0, H = 0;
    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight; if (!W || !H) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = layer.width = Math.round(W * dpr); canvas.height = layer.height = Math.round(H * dpr);
      k = canvas.width / VW;
      var lc = layer.getContext('2d');
      lc.setTransform(k, 0, 0, k, -VX * k, -VY * k);
      drawStatic(lc, k, SEED);
      if (V === 'echo') reflectionOfDoor(lc, 548, 0.45, 99); // a second doorway that isn't there
      reflectionOfDoor(lc, 514, 1, 77);
      fxResize();
      return true;
    }

    // ——— time ———
    var flow = 0, speed = 1, base = 1, holding = false, held = false, slipUntil = 0;
    var clock = Date.now() / 1000 - (V === 'late' ? 60 : 0), clockRate = base, lastShown = '', stallUntil = 0, nextGlitch = 4 + Math.random() * 4, t = 0;
    var ptr = { x: -1e4, y: -1e4, on: false }, doorGlow = 0, flash = 0;
    var holdTime = 0, veilOn = false, veilV = 0, fxAngle = 0, fxClear = true;
    var fx = root.querySelector('[data-fx]'), fxW = 0, fxH = 0, fdpr = 1, fcx = 0, fcy = 0;
    var FXN = 1400, fF = new Float32Array(FXN), fT = new Float32Array(FXN), fS = new Float32Array(FXN), fA = new Float32Array(FXN);
    var fr = rng(SEED ^ 0x51ED);
    for (i = 0; i < FXN; i++) { fF[i] = Math.sqrt(fr()); fT[i] = fr() * 6.2832; fS[i] = 0.9 + Math.pow(fr(), 3) * 2.2; fA[i] = 0.45 + fr() * 0.55; }
    function fxResize() {
      if (!fx) return;
      fxW = fx.clientWidth; fxH = fx.clientHeight; fdpr = Math.min(window.devicePixelRatio || 1, 1.5);
      fx.width = Math.round(fxW * fdpr); fx.height = Math.round(fxH * fdpr);
      var rf = fx.getBoundingClientRect(), rc = canvas.getBoundingClientRect();
      fcx = rc.left - rf.left + (APEX.x - VX) / VW * rc.width; fcy = rc.top - rf.top + (APEX.y - VY) / VH * rc.height;
      fxClear = false;
    }
    function drawFx(dt) {
      if (!fx) return;
      var c = fx.getContext('2d');
      if (veilV < 0.003) { if (!fxClear) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, fx.width, fx.height); fxClear = true; } return; }
      fxClear = false;
      fxAngle -= dt * (0.25 + veilV * 0.55);
      c.setTransform(fdpr, 0, 0, fdpr, 0, 0); c.clearRect(0, 0, fxW, fxH);
      var maxR = Math.sqrt(fxW * fxW + fxH * fxH) * 0.72, grow = Math.pow(veilV, 0.8);
      for (var q = 0; q < 4; q++) {                     // rings of time, collapsing inward
        var ph = 1 - ((t * 0.18 + q / 4) % 1), rr = ph * maxR * grow;
        c.globalAlpha = 0.12 * veilV * ph; c.strokeStyle = '#ece4d8'; c.lineWidth = 1;
        c.beginPath(); c.ellipse(fcx, fcy, rr, rr * 0.82, 0, 0, 6.2832); c.stroke();
      }
      c.strokeStyle = '#f3ede4'; c.lineCap = 'round';
      for (var j = 0; j < FXN; j++) {
        var f = fF[j], r = f * maxR * grow, w = (0.35 + 0.65 / (0.22 + f)), th = fT[j] + fxAngle * w;
        var x = fcx + Math.cos(th) * r, y = fcy + Math.sin(th) * r * 0.82;
        if (x < -40 || y < -40 || x > fxW + 40 || y > fxH + 40) continue;
        var tail = Math.min(0.5, 0.05 * w * veilV + 0.004);          // a short streak along its backward orbit
        var x2 = fcx + Math.cos(th + tail) * r, y2 = fcy + Math.sin(th + tail) * r * 0.82;
        c.globalAlpha = fA[j] * veilV * (0.4 + 0.6 * f);
        c.lineWidth = fS[j];
        c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
      }
      c.globalAlpha = 1;
    }

    function pos(i, F, out) {
      var u = phase[i] + F * rate[i], c = Math.floor(u); u -= c;
      if (c !== cyc[i]) {
        cyc[i] = c;
        var a = Math.sqrt(mix(i * 2 + 1, c ^ SEED)), b = mix(i * 2 + 2, c ^ SEED);
        hx[i] = (1 - a) * TOP.l + a * (1 - b) * TOP.r + a * b * APEX.x;
        hy[i] = TOP.y + a * b * (APEX.y - TOP.y);
      }
      var d = Math.pow(1 - u, 0.62);
      out.x = APEX.x + (hx[i] - APEX.x) * d + Math.sin(t * 0.35 + wob[i]) * 0.9 * d;
      out.y = APEX.y - 3 + (hy[i] - APEX.y + 3) * d;
      out.d = d; out.u = u;
      out.a = bright[i] * smooth(0, 0.06, u) * (1 - smooth(0.93, 1, u)) * (0.3 + 0.7 * smooth(TOP.y - 10, TOP.y + 70, hy[i])) * (0.6 + 0.4 * (1 - d));
    }

    var P = { x: 0, y: 0, d: 0, u: 0, a: 0 };
    function drawStars(ctx, F, alphaMul, interact, dt) {
      var min = 0.55 / k, R = 64, R2 = R * R;
      ctx.fillStyle = '#f3ede4';
      for (var i = 0; i < N; i++) {
        pos(i, F, P);
        if (P.a <= 0.01) continue;
        var x = P.x, y = P.y;
        if (interact) {
          if (ptr.on) {
            var dx = x + ox[i] - ptr.x, dy = y + oy[i] - ptr.y, q = dx * dx + dy * dy;
            if (q < R2 && q > 0.01) {
              var dist = Math.sqrt(q), f = (1 - dist / R); f = f * f * 2.4 * dt * 60;
              ox[i] += (dx / dist * 0.55 - dy / dist * 0.9) * f; oy[i] += (dy / dist * 0.55 + dx / dist * 0.9) * f;
            }
          }
          var damp = Math.pow(0.955, dt * 60); ox[i] *= damp; oy[i] *= damp;
          x += ox[i]; y += oy[i];
        }
        var s = size[i] * (0.55 + 0.45 * P.d), rr = Math.max(s, min);
        ctx.globalAlpha = P.a * alphaMul;
        if (rr * k < 1.3) ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
        else { ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }

    function frame(dt) {
      t += dt;
      // time control
      holdTime = holding ? holdTime + dt : 0;
      var nowVeil = holdTime >= 5;
      if (nowVeil !== veilOn) { veilOn = nowVeil; root.classList.toggle('is-veil', veilOn); }
      veilV += ((veilOn ? 1 : 0) - veilV) * Math.min(1, dt * (veilOn ? 0.7 : 1.3));
      var target = holding ? (veilOn ? -7 : -3.2) : base;
      if (V === 'stall' && t < stallUntil && !holding) target = 0;
      if (V === 'late' && t < slipUntil && !holding) target = -1.3;
      speed += (target - speed) * Math.min(1, dt * (holding ? 3 : 1.6));
      if (!holding && t > nextGlitch) {
        if (V === 'skip') { flow += 2.2; clock += 2; flash = 1; nextGlitch = t + 6 + Math.random() * 5; }
        else if (V === 'stall') { stallUntil = t + 1.6; nextGlitch = t + 7 + Math.random() * 5; }
        else if (V === 'late') { slipUntil = t + 1.4; nextGlitch = t + 9 + Math.random() * 6; }
        else nextGlitch = t + 1e9;
      }
      flow += dt * speed;
      var cr = veilOn ? -900 : holding ? -9 : (V === 'stall' && t < stallUntil ? 0 : (V === 'late' && t < slipUntil ? -1 : base));
      clockRate += (cr - clockRate) * Math.min(1, dt * (veilOn ? 0.6 : 3));
      clock += dt * clockRate;
      flash = Math.max(0, flash - dt * 3);
      var overDoor = ptr.on && ptr.x > 470 && ptr.x < 560 && ptr.y > 860 && ptr.y < 1100;
      doorGlow += ((overDoor ? 1 : 0) - doorGlow) * Math.min(1, dt * 2.5);

      var ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(layer, 0, 0);
      ctx.setTransform(k, 0, 0, k, -VX * k, -VY * k);

      if (V === 'echo') drawStars(ctx, flow - 7, 0.32, false, dt);
      drawStars(ctx, flow, 1 - flash * 0.5, true, dt);

      // sparkles
      for (var j = 0; j < SPARK.length; j++) {
        var sp = SPARK[j], tw = 0.55 + 0.45 * Math.sin(t * 0.7 + sp.p), L = 9 * sp.s * (0.8 + 0.25 * tw);
        ctx.save(); ctx.translate(sp.x, sp.y); ctx.globalAlpha = tw;
        var g = ctx.createRadialGradient(0, 0, 0, 0, 0, L);
        g.addColorStop(0, 'rgba(255,252,246,0.95)'); g.addColorStop(1, 'rgba(255,252,246,0)');
        ctx.fillStyle = g; ctx.beginPath();
        ctx.moveTo(0, -L); ctx.quadraticCurveTo(0.35, -0.35, L, 0); ctx.quadraticCurveTo(0.35, 0.35, 0, L);
        ctx.quadraticCurveTo(-0.35, 0.35, -L, 0); ctx.quadraticCurveTo(-0.35, -0.35, 0, -L); ctx.fill();
        ctx.fillStyle = '#fffaf2'; ctx.beginPath(); ctx.arc(0, 0, 1.3 * sp.s + 0.4, 0, 6.2832); ctx.fill();
        ctx.restore();
      }

      ctx.globalCompositeOperation = 'lighter';
      // neck
      var neckA = 0.32 + 0.1 * Math.sin(t * 0.9) + Math.min(0.25, Math.abs(speed) * 0.06);
      var ng = ctx.createRadialGradient(APEX.x, APEX.y - 4, 0, APEX.x, APEX.y - 4, 40);
      ng.addColorStop(0, 'rgba(255,250,242,' + neckA + ')'); ng.addColorStop(0.3, 'rgba(255,248,238,' + neckA * 0.2 + ')'); ng.addColorStop(1, 'rgba(255,248,238,0)');
      ctx.fillStyle = ng; ctx.fillRect(APEX.x - 50, APEX.y - 54, 100, 100);
      // light falling through the neck toward the doorway
      for (var m = 0; m < MOTES; m++) {
        var v = mPhase[m] + flow * mRate[m]; v -= Math.floor(v);
        var my = BEAM.y0 + 6 + v * (DOOR.ytl - BEAM.y0 - 10);
        var ma = Math.sin(v * Math.PI) * 0.55;
        var mg = ctx.createRadialGradient(APEX.x, my, 0, APEX.x, my, 3.2);
        mg.addColorStop(0, 'rgba(255,250,242,' + ma + ')'); mg.addColorStop(1, 'rgba(255,250,242,0)');
        ctx.fillStyle = mg; ctx.fillRect(APEX.x - 4, my - 4, 8, 8);
      }
      // doorway breath + hover
      var da = 0.1 + 0.06 * Math.sin(t * 0.7) + doorGlow * 0.32 + (holding ? 0.12 : 0);
      ctx.save(); ctx.translate(514, 980); ctx.scale(1, 2.2);
      var dgl = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
      dgl.addColorStop(0, 'rgba(255,244,230,' + da + ')'); dgl.addColorStop(1, 'rgba(255,244,230,0)');
      ctx.fillStyle = dgl; ctx.fillRect(-60, -60, 120, 120);
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';

      drawFx(dt);

      // clock
      if (clockEl) {
        var s = Math.floor(clock), dte = new Date(s * 1000);
        var txt = [dte.getHours(), dte.getMinutes(), dte.getSeconds()].map(function (n) { return (n < 10 ? '0' : '') + n; }).join(':');
        if (txt !== lastShown) { clockEl.textContent = txt; lastShown = txt; }
      }
    }

    // ——— interaction ———
    function toLocal(e) {
      var rc = canvas.getBoundingClientRect();
      ptr.x = VX + (e.clientX - rc.left) / rc.width * VW; ptr.y = VY + (e.clientY - rc.top) / rc.height * VH;
    }
    function onMove(e) { toLocal(e); ptr.on = true; }
    function onLeave() { ptr.on = false; holding = false; root.classList.remove('is-holding'); }
    function onWinResize() { fxResize(); }
    window.addEventListener('resize', onWinResize);
    function onDown(e) {
      toLocal(e); ptr.on = true; holding = true; root.classList.add('is-holding');
      if (!held) { held = true; if (hintEl) hintEl.classList.add('is-used'); }
    }
    function onUp(e) { holding = false; root.classList.remove('is-holding'); if (e.pointerType !== 'mouse') ptr.on = false; }
    function onKey(e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (e.type === 'keydown') onDown({ clientX: -1e5, clientY: -1e5 }); else onUp({ pointerType: 'key' }); }
    }
    function noMenu(e) { e.preventDefault(); }
    if (!passive) {
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointerleave', onLeave);
      canvas.addEventListener('pointercancel', onLeave);
      canvas.addEventListener('contextmenu', noMenu);
      canvas.addEventListener('keydown', onKey);
      canvas.addEventListener('keyup', onKey);
    }

    // ——— loop ———
    var raf = 0, last = 0, visible = true, alive = true;
    function loop(now) {
      if (!alive) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (visible && !document.hidden) frame(dt);
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (!resize()) { raf = requestAnimationFrame(start); return; }
      if (reduce) { frame(0); var iv = setInterval(function () { clock += 1; frame(0); }, 1000); stopReduce = function () { clearInterval(iv); }; }
      else raf = requestAnimationFrame(loop);
    }
    var stopReduce = null;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { if (resize() && reduce) frame(0); }) : null;
    if (ro) ro.observe(canvas);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }) : null;
    if (io) io.observe(canvas);
    start();
    if (hintEl) setTimeout(function () { if (!held) hintEl.classList.add('is-shown'); }, 3500);

    var stop = function () {
      alive = false; cancelAnimationFrame(raf); if (stopReduce) stopReduce();
      if (ro) ro.disconnect(); if (io) io.disconnect();
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointercancel', onLeave); canvas.removeEventListener('contextmenu', noMenu);
      canvas.removeEventListener('keydown', onKey); canvas.removeEventListener('keyup', onKey);
      window.removeEventListener('resize', onWinResize); root.classList.remove('is-veil', 'is-holding');
    };
    stop.setBase = function (v) { base = v; };   // the gateway speeds the sand up on hover
    return stop;
  }


  /* ——— "Talvez não.": a fractured line that crumbles into sand and gathers again ———
     The text is sampled into grains drawn on a canvas laid over the (still
     present, screen-reader readable) DOM text. Cycle: whole → crumbles left to
     right and falls → gone → rewinds back into the word. */
  function Dust(el) {
    var txt = el.querySelector('[data-dust-text]') || el;
    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.className = 'tsv-dust-cv';
    el.appendChild(cv);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var PADL = 24, PADT = 24, PADR = 150, PADB = 150;
    var gx, gy, go, gr, n = 0, W = 0, H = 0, tw = 0, th = 0, dpr = 1, ready = false, raf = 0, alive = true;
    var t0 = -1, last = 0, glitch = 0, nextGlitch = 2;
    var revealHost = el.closest('.tsv-r');

    function sample() {
      var cs = getComputedStyle(txt);
      var rect = txt.getBoundingClientRect();
      tw = Math.ceil(rect.width); th = Math.ceil(rect.height);
      if (!tw || !th) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = tw + PADL + PADR; H = th + PADT + PADB;
      cv.style.left = -PADL + 'px'; cv.style.top = -PADT + 'px';
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      var off = document.createElement('canvas'); off.width = cv.width; off.height = cv.height;
      var o = off.getContext('2d');
      o.scale(dpr, dpr);
      o.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      o.textBaseline = 'alphabetic'; o.fillStyle = '#fff';
      var m = o.measureText(txt.textContent);
      var asc = m.actualBoundingBoxAscent || parseFloat(cs.fontSize) * 0.8;
      var desc = m.actualBoundingBoxDescent || parseFloat(cs.fontSize) * 0.2;
      var base = PADT + (th - (asc + desc)) / 2 + asc;
      o.fillText(txt.textContent, PADL, base);
      var data = o.getImageData(0, 0, off.width, off.height).data;
      var step = Math.max(1, Math.round(dpr * 1.1)), r = rng(4242), xs = [], ys = [], os = [], rs = [];
      // two cracks run through the word; grains on them are missing
      var c1 = { a: 0.35, b: PADT + th * 0.15, k: 0.9 }, c2 = { a: 0.72, b: PADT + th * 0.95, k: -1.3 };
      for (var y = 0; y < off.height; y += step) {
        for (var x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] < 110) continue;
          var px = x / dpr, py = y / dpr;
          var l1 = Math.abs((py - c1.b) - c1.k * (px - (PADL + tw * c1.a))) / Math.sqrt(1 + c1.k * c1.k);
          var l2 = Math.abs((py - c2.b) - c2.k * (px - (PADL + tw * c2.a))) / Math.sqrt(1 + c2.k * c2.k);
          if (l1 < 0.9 || l2 < 0.9) continue;
          if (r() < 0.06) continue;
          // the word is split into fragments that sit slightly out of place
          var shift = (px - PADL > tw * c1.a + (py - c1.b) / c1.k) ? 1.4 : 0;
          shift += (px - PADL > tw * c2.a + (py - c2.b) / c2.k) ? -1.1 : 0;
          xs.push(px + shift); ys.push(py + (shift > 0 ? 0.8 : shift < 0 ? -0.6 : 0));
          var u = (px - PADL) / tw;
          os.push(u * 1.4 + r() * 0.45); rs.push(r());
        }
      }
      n = xs.length; gx = new Float32Array(xs); gy = new Float32Array(ys); go = new Float32Array(os); gr = new Float32Array(rs);
      el.classList.add('is-dust');
      ready = true; return true;
    }

    function dclock(tc) {           // seconds into the 11 s cycle → how far the crumbling has gone
      if (tc < 3.8) return 0;
      if (tc < 7.6) return tc - 3.8;
      if (tc < 8.6) return 3.8;
      return 3.8 * Math.max(0, (11 - tc) / 2.4);
    }

    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (!ready) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      var shown = !revealHost || revealHost.classList.contains('is-in') || !document.querySelector('.js-reveal');
      if (!shown) return;
      if (t0 < 0) t0 = now / 1000 + 2.6;            // let the line settle in first
      var T = now / 1000 - t0;
      var d = T < 0 ? 0 : (reduce ? 0 : dclock(T % 11));
      if (!reduce && T > nextGlitch) { glitch = 0.14; nextGlitch = T + 1.8 + Math.random() * 2.6; }
      glitch = Math.max(0, glitch - dt);
      var ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#f6f1e8';
      var sz = Math.max(1, 1.1);
      var gj = glitch > 0 ? 2.2 : 0, band = PADT + th * 0.5;
      for (var i = 0; i < n; i++) {
        var p = Math.max(0, Math.min(1, (d - go[i]) / 1.7));
        var x = gx[i], y = gy[i], a = 0.94;
        if (p > 0) {
          var e = p * p;
          x += e * (16 + gr[i] * 46) + Math.sin(p * 6 + gr[i] * 9) * 2.5 * p;
          y += e * (40 + gr[i] * 90) - Math.sin(p * 3.1) * 6 * (1 - p);
          a = 0.94 * (1 - p) * (1 - p * 0.3);
          if (a < 0.02) continue;
        } else if (gj && y < band) x += gj;
        ctx.globalAlpha = a;
        ctx.fillRect(x, y, sz, sz);
      }
      ctx.globalAlpha = 1;
    }

    function start() {
      if (!alive) return;
      if (!sample()) { setTimeout(start, 300); return; }
      raf = requestAnimationFrame(frame);
    }
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(start, start);
    var ro = window.ResizeObserver ? new ResizeObserver(function () { if (ready) sample(); }) : null;
    if (ro) ro.observe(txt);
    return function () { alive = false; cancelAnimationFrame(raf); if (ro) ro.disconnect(); el.classList.remove('is-dust'); if (cv.parentNode) cv.parentNode.removeChild(cv); };
  }

  window.TSVHourglass = { mount: Hourglass };
  window.TSVDust = { mount: Dust };
})();
