/* Isle of Crows — Final Chapter hero: the city of the sun, brought to life.
   The painting (uploads/ioc/shurima-ascension.webp) is drawn to cover the hero, and
   living layers sit on it, placed in the painting's own coordinates: light falling
   from the Sun Disc, a glint crossing its gold, clouds drifting in front of it, mist
   between the spires, the waterfall pouring into the chasm, dust on the wind and the
   flock of birds wheeling over the city. Now and then the disc's light turns crimson
   and a mirror image of it shivers beside it: an ascension, and an illusion.
   mount(canvas) → stop(). Reduced motion: the painting with its light, still. */
(function () {
  var TAU = Math.PI * 2, SRC = 'uploads/ioc/shurima-ascension-dark.webp?v=2';
  var IW = 1905, IH = 825;                                   // painting size
  var DISC = { x: 0.4953, y: 0.2, r: 0.1 };
  var CORE = { x: 0.4955, y: 0.198 };                         // the figure at the heart of the disc                // r as a share of the painting's width
  var FALL = { x: 0.4875, y: 0.68, y1: 0.9 };
  var BEAM = { y0: 0.36, y1: 0.54 };
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  function mount(canvas) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var img = new Image(), ready = false;
    var W = 0, H = 0, dpr = 1, raf = 0, last = 0, t = 0, alive = true, visible = true;
    var view = { s: 1, ox: 0, oy: 0 };                         // painting → screen
    var r = rng(907);
    var CLOUDS = [], MIST = [], DUST = [], BIRDS = [];
    for (var i = 0; i < 7; i++) CLOUDS.push({ x: r(), y: 0.04 + r() * 0.3, w: 0.12 + r() * 0.16, h: 0.035 + r() * 0.05, v: 0.004 + r() * 0.006, a: 0.35 + r() * 0.3 });
    for (i = 0; i < 6; i++) MIST.push({ x: r(), y: 0.5 + r() * 0.16, w: 0.2 + r() * 0.25, v: (r() < 0.5 ? -1 : 1) * (0.003 + r() * 0.004), a: 0.25 + r() * 0.2 });
    for (i = 0; i < 160; i++) DUST.push({ x: r(), y: 0.62 + r() * 0.38, v: 0.01 + r() * 0.03, s: 0.6 + r() * 1.6, a: 0.2 + r() * 0.45, p: r() * TAU });
    for (i = 0; i < 22; i++) BIRDS.push({ a: r() * TAU, rr: 0.03 + r() * 0.06, k: 0.8 + r() * 0.5, f: 4 + r() * 3, ph: r() * TAU, s: 0.6 + r() * 0.6, dy: (r() - 0.5) * 0.05 });
    var cloudSprite = document.createElement('canvas');

    function makeCloud() {
      cloudSprite.width = 512; cloudSprite.height = 160;
      var c = cloudSprite.getContext('2d'), rr = rng(5);
      c.filter = 'blur(14px)';
      for (var k = 0; k < 14; k++) {
        var x = 60 + rr() * 390, y = 60 + rr() * 50, rad = 28 + rr() * 46;
        var g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(20,12,9,0.75)'); g.addColorStop(0.7, 'rgba(70,36,18,0.25)'); g.addColorStop(1, 'rgba(20,12,9,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill();
      }
    }

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight; if (!W || !H) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      if (reduce && ready) frame(0, 4);
      return true;
    }
    // where a point of the painting lands on screen, with the slow camera drift applied
    function P(fx, fy) { return [view.ox + fx * IW * view.s, view.oy + fy * IH * view.s]; }

    function frame(dt, forceT) {
      t = forceT != null ? forceT : t + dt;
      var c = canvas.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      // cover the hero, keeping the disc in frame, with a very slow push-in
      var base = Math.max(W / IW, H / IH), zoom = 1 + 0.035 * (0.5 - 0.5 * Math.cos(t * TAU / 60));
      view.s = base * zoom;
      var fx = W < H ? DISC.x : 0.5;
      view.ox = W / 2 - fx * IW * view.s; view.oy = 0;                     // anchored at the top, so the disc is never cut further
      view.ox = Math.min(0, Math.max(W - IW * view.s, view.ox)); view.oy = Math.min(0, Math.max(H - IH * view.s, view.oy));
      c.drawImage(img, view.ox, view.oy, IW * view.s, IH * view.s);

      var d = P(DISC.x, DISC.y), dr = DISC.r * IW * view.s, S = view.s * IW / 1905;
      var crimson = (function () { var k = (t % 16) / 16; return k > 0.72 && k < 0.95 ? Math.sin((k - 0.72) / 0.23 * Math.PI) : 0; })();

      // light falling from the disc onto the city
      c.save(); c.globalCompositeOperation = 'screen';
      for (var k = 0; k < 6; k++) {
        var ang = Math.PI / 2 + (k - 2.5) * 0.11 + Math.sin(t * 0.13 + k) * 0.03, len = H * 1.1, w = dr * (0.22 + 0.1 * Math.sin(t * 0.4 + k * 1.7));
        var a = (0.045 + 0.035 * Math.sin(t * 0.35 + k * 2.1)) * (1 - crimson * 0.5);
        var ex = d[0] + Math.cos(ang) * len, ey = d[1] + Math.sin(ang) * len;
        var g = c.createLinearGradient(d[0], d[1], ex, ey);
        g.addColorStop(0, 'rgba(255,170,70,' + a + ')'); g.addColorStop(0.6, 'rgba(240,140,50,' + a * 0.4 + ')'); g.addColorStop(1, 'rgba(240,140,50,0)');
        c.fillStyle = g; c.beginPath();
        c.moveTo(d[0] - w * 0.3, d[1]); c.lineTo(ex - w * 2.2, ey); c.lineTo(ex + w * 2.2, ey); c.lineTo(d[0] + w * 0.3, d[1]); c.closePath(); c.fill();
      }
      // the disc's own glow, gold most of the time, crimson as it rises
      var halo = c.createRadialGradient(d[0], d[1], dr * 0.2, d[0], d[1], dr * 2.4);
      var hc = crimson > 0 ? [Math.round(255 - 40 * crimson), Math.round(160 - 120 * crimson), Math.round(60 - 20 * crimson)] : [255, 160, 60];
      halo.addColorStop(0, 'rgba(' + hc + ',' + (0.07 + 0.04 * Math.sin(t * 0.8) + crimson * 0.14) + ')'); halo.addColorStop(1, 'rgba(' + hc + ',0)');
      c.fillStyle = halo; c.fillRect(d[0] - dr * 2.3, d[1] - dr * 2.3, dr * 4.6, dr * 4.6);
      c.restore();

      // the disc's light turns crimson as the figure rises
      if (crimson > 0) { c.save(); c.globalCompositeOperation = 'multiply'; var cr = c.createRadialGradient(d[0], d[1], 0, d[0], d[1], dr * 1.15); cr.addColorStop(0, 'rgba(170,40,40,' + 0.3 * crimson + ')'); cr.addColorStop(1, 'rgba(170,40,40,0)'); c.fillStyle = cr; c.fillRect(d[0] - dr * 1.2, d[1] - dr * 1.2, dr * 2.4, dr * 2.4); c.restore(); }
      // the illusion: a mirror image of the disc shivers beside it, then is gone
      if (crimson > 0.05) {
        c.save(); c.globalAlpha = 0.07 * crimson * (0.7 + 0.3 * Math.sin(t * 31));
        var off = dr * 0.45 * crimson;
        [-1, 1].forEach(function (sgn) {
          c.save(); c.beginPath(); c.arc(d[0] + sgn * off, d[1] + sgn * 4 * S, dr, 0, TAU); c.clip();
          c.drawImage(img, view.ox + sgn * off, view.oy + sgn * 4 * S, IW * view.s, IH * view.s); c.restore();
        });
        c.restore();
      }

      // clouds drifting, some across the disc
      for (var ci = 0; ci < CLOUDS.length; ci++) {
        var C = CLOUDS[ci], u = (C.x + t * C.v) % 1.3 - 0.15, p = P(u, C.y);
        c.globalAlpha = C.a * clamp(Math.min(u + 0.15, 1.15 - u) * 4);
        c.drawImage(cloudSprite, p[0], p[1], C.w * IW * view.s, C.h * IH * view.s * 2.4);
      }
      // mist between the spires
      for (var mi = 0; mi < MIST.length; mi++) {
        var M = MIST[mi], mu = ((M.x + t * M.v) % 1 + 1) % 1, mp = P(mu - M.w / 2, M.y);
        c.globalAlpha = M.a; c.drawImage(cloudSprite, mp[0], mp[1], M.w * IW * view.s, 0.06 * IH * view.s);
      }
      c.globalAlpha = 1;

      // the waterfall pouring into the chasm
      var f0 = P(FALL.x, FALL.y), f1 = P(FALL.x, FALL.y1), fw = 0.006 * IW * view.s;
      c.save(); c.globalCompositeOperation = 'screen';
      for (var s = 0; s < 14; s++) {
        var sx = f0[0] + (s / 13 - 0.5) * fw * 1.6, ph = (t * (0.9 + (s % 4) * 0.15) + s * 0.37) % 1;
        var y0 = f0[1] + (f1[1] - f0[1]) * ph, len2 = (f1[1] - f0[1]) * 0.18;
        var wg = c.createLinearGradient(0, y0, 0, y0 + len2); wg.addColorStop(0, 'rgba(240,244,240,0)'); wg.addColorStop(0.5, 'rgba(255,190,100,0.38)'); wg.addColorStop(1, 'rgba(240,244,240,0)');
        c.fillStyle = wg; c.fillRect(sx, y0, 1.2 * S + 0.6, len2);
      }
      var sp = c.createRadialGradient(f1[0], f1[1], 0, f1[0], f1[1], 60 * S); sp.addColorStop(0, 'rgba(255,170,80,' + (0.14 + 0.05 * Math.sin(t * 2)) + ')'); sp.addColorStop(1, 'rgba(255,170,80,0)');
      c.fillStyle = sp; c.fillRect(f1[0] - 60 * S, f1[1] - 60 * S, 120 * S, 120 * S);
      c.restore();

      // dust on the wind over the plateaus
      for (var di = 0; di < DUST.length; di++) {
        var D = DUST[di];
        if (di % 3 === 0) {                                     // embers climbing the beam of light
          var eu = (D.x + t * D.v * 1.6) % 1, ex2 = CORE.x + Math.sin(t * 0.9 + D.p) * 0.012 * (1 + eu * 2), ey2 = BEAM.y1 + 0.06 - eu * (BEAM.y1 - BEAM.y0 + 0.12);
          var ep = P(ex2, ey2);
          c.fillStyle = 'rgba(255,' + (150 + Math.round(60 * D.a)) + ',70,' + (D.a + 0.3) * Math.sin(eu * Math.PI) + ')';
          c.fillRect(ep[0], ep[1], D.s * S + 0.6, D.s * S + 0.6);
        } else {                                                // ash and sparks on the wind
          var du = (D.x + t * D.v) % 1.05, dp = P(du, D.y - (t * D.v * 0.6) % 0.2 + Math.sin(t + D.p) * 0.004);
          c.fillStyle = (di % 5 === 0 ? 'rgba(255,140,60,' : 'rgba(120,96,80,') + D.a * clamp(Math.min(du, 1.05 - du) * 10) + ')';
          c.fillRect(dp[0], dp[1], D.s * 1.4 * S + 0.5, D.s * 0.8 * S + 0.5);
        }
      }

      // the flock wheeling over the city
      var fc = P(0.72 + Math.sin(t * 0.05) * 0.05, 0.13 + Math.sin(t * 0.07) * 0.03);
      c.strokeStyle = 'rgba(8,5,4,0.9)'; c.lineCap = 'round';
      for (var bi = 0; bi < BIRDS.length; bi++) {
        var B = BIRDS[bi], ba = B.a + t * 0.16 * B.k;
        var bx = fc[0] + Math.cos(ba) * B.rr * IW * view.s, by = fc[1] + (Math.sin(ba) * B.rr * 0.45 + B.dy) * IW * view.s;
        var flap = Math.sin(t * B.f + B.ph), bw = 6 * B.s * S + 1.5;
        c.lineWidth = 1.1 * S + 0.4; c.beginPath();
        c.moveTo(bx - bw, by - flap * bw * 0.55); c.quadraticCurveTo(bx - bw * 0.4, by - bw * 0.2, bx, by); c.quadraticCurveTo(bx + bw * 0.4, by - bw * 0.2, bx + bw, by - flap * bw * 0.55);
        c.stroke();
      }

      // the figure at the heart of the disc: a slow, uneven pulse, and the beam it pours down
      var cp = P(CORE.x, CORE.y), pulse = 0.55 + 0.25 * Math.sin(t * 1.3) + 0.2 * Math.sin(t * 3.7 + 1);
      c.save(); c.globalCompositeOperation = 'screen';
      var cg = c.createRadialGradient(cp[0], cp[1], 0, cp[0], cp[1], dr * 0.5);
      cg.addColorStop(0, 'rgba(255,' + Math.round(200 - 140 * crimson) + ',120,' + 0.42 * pulse + ')'); cg.addColorStop(0.4, 'rgba(255,140,50,' + 0.14 * pulse + ')'); cg.addColorStop(1, 'rgba(255,140,50,0)');
      c.fillStyle = cg; c.fillRect(cp[0] - dr * 0.5, cp[1] - dr * 0.5, dr, dr);
      var b0 = P(CORE.x, BEAM.y0), b1 = P(CORE.x, BEAM.y1), bw = (2.5 + 2 * pulse) * S;
      var bg2 = c.createLinearGradient(0, b0[1], 0, b1[1]); bg2.addColorStop(0, 'rgba(255,190,100,' + 0.35 * pulse + ')'); bg2.addColorStop(1, 'rgba(255,150,60,' + 0.1 * pulse + ')');
      c.fillStyle = bg2; c.fillRect(b0[0] - bw * 3, b0[1], bw * 6, b1[1] - b0[1]);
      c.restore();

      // red heat in the clouds, now and then
      var heat = Math.max(0, Math.sin(t * 0.23) * Math.sin(t * 0.61 + 1)) ;
      if (heat > 0.05) { var hp = P(0.82, 0.18), hr = 0.25 * IW * view.s; var hg = c.createRadialGradient(hp[0], hp[1], 0, hp[0], hp[1], hr); hg.addColorStop(0, 'rgba(150,30,20,' + 0.16 * heat + ')'); hg.addColorStop(1, 'rgba(150,30,20,0)'); c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = hg; c.fillRect(hp[0] - hr, hp[1] - hr, hr * 2, hr * 2); c.restore(); }

      // texture: painted canvas weave, film grain that never sits still, a heavy vignette
      c.save();
      c.globalCompositeOperation = 'soft-light'; c.globalAlpha = 0.4;
      c.fillStyle = weavePat; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.13;
      var gx2 = Math.floor(Math.random() * 256), gy2 = Math.floor(Math.random() * 256);
      c.translate(-gx2, -gy2); c.fillStyle = grainPat; c.fillRect(gx2, gy2, W, H);
      c.restore();
      var vg = c.createRadialGradient(W / 2, H * 0.42, Math.min(W, H) * 0.35, W / 2, H * 0.45, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    }

    // a tile of film grain and a tile of canvas weave, made once
    var grainPat = null, weavePat = null;
    (function () {
      var g = document.createElement('canvas'); g.width = g.height = 256; var gc = g.getContext('2d'), id = gc.createImageData(256, 256), rr = rng(77);
      for (var q = 0; q < id.data.length; q += 4) { var v = 128 + (rr() + rr() + rr() - 1.5) * 80; id.data[q] = id.data[q + 1] = id.data[q + 2] = v; id.data[q + 3] = 255; }
      gc.putImageData(id, 0, 0); grainPat = gc.createPattern(g, 'repeat');
      var w = document.createElement('canvas'); w.width = w.height = 192; var wc = w.getContext('2d'), r2 = rng(31);
      wc.fillStyle = 'rgb(128,128,128)'; wc.fillRect(0, 0, 192, 192);
      for (var y = 0; y < 192; y += 3) { wc.fillStyle = 'rgba(' + (r2() < 0.5 ? '255,255,255' : '0,0,0') + ',' + (0.05 + r2() * 0.08) + ')'; wc.fillRect(0, y, 192, 1.4); }
      for (var x = 0; x < 192; x += 3) { wc.fillStyle = 'rgba(' + (r2() < 0.5 ? '255,255,255' : '0,0,0') + ',' + (0.04 + r2() * 0.07) + ')'; wc.fillRect(x, 0, 1.4, 192); }
      for (var k = 0; k < 900; k++) { wc.fillStyle = 'rgba(' + (r2() < 0.5 ? '255,255,255' : '0,0,0') + ',' + r2() * 0.12 + ')'; wc.fillRect(r2() * 192, r2() * 192, 1 + r2() * 3, 1); }
      weavePat = wc.createPattern(w, 'repeat');
    })();

    function loop(now) {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (ready && visible && !document.hidden && W) frame(dt);
    }
    makeCloud();
    img.onload = function () { ready = true; if (resize() && reduce) frame(0, 4); };
    img.src = SRC;
    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null; if (ro) ro.observe(canvas);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }) : null; if (io) io.observe(canvas);
    resize();
    if (!reduce) raf = requestAnimationFrame(loop);
    var stop = function () { alive = false; cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); };
    stop.renderAt = function (sec) { if (ready) frame(0, sec); };
    return stop;
  }

  window.IOCAscension = { mount: mount };
})();
