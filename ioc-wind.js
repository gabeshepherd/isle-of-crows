/* Isle of Crows — the poster, brought to life for the gateway.
   Same language as the Isle of Crows homescreen: ink-dark sand carried by the
   wind, crow feathers tumbling down, pale bands of light sweeping across.
   Drawn on a canvas laid over the poster art. setGust(n) strengthens the wind. */
(function () {
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function mount(canvas) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var r = rng((Math.random() * 4294967296) >>> 0);
    var W = 0, H = 0, dpr = 1, raf = 0, last = 0, t = 0, alive = true, visible = true;
    var gust = 1, gustTarget = 1;

    var GRAINS = 260, gx = [], gy = [], gv = [], gs = [], ga = [], gp = [];
    for (var i = 0; i < GRAINS; i++) {
      gx.push(r()); gy.push(0.3 + Math.pow(r(), 0.7) * 0.72); gv.push(0.06 + r() * 0.16);
      gs.push(0.7 + Math.pow(r(), 2) * 1.8); ga.push(0.22 + r() * 0.5); gp.push(r() * 6.28);
    }
    var FEATHERS = [];
    for (i = 0; i < 6; i++) FEATHERS.push({ x: 0.12 + r() * 0.76, p: r(), v: 0.035 + r() * 0.03, s: 0.8 + r() * 0.6, sw: r() * 6.28, rot: r() * 6.28 });
    var BANDS = [{ y: 0.46, h: 0.07, v: 0.05, p: 0.1 }, { y: 0.6, h: 0.1, v: 0.038, p: 0.55 }, { y: 0.74, h: 0.12, v: 0.03, p: 0.85 }];

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight; if (!W || !H) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      return true;
    }

    function feather(c, x, y, len, rot, a) {
      c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = a;
      var g = c.createLinearGradient(-len / 2, 0, len / 2, 0);
      g.addColorStop(0, 'rgba(26,21,18,1)'); g.addColorStop(0.6, 'rgba(42,34,29,0.95)'); g.addColorStop(1, 'rgba(26,21,18,0.15)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(-len / 2, 0);
      c.quadraticCurveTo(-len * 0.1, -len * 0.16, len / 2, 0);
      c.quadraticCurveTo(-len * 0.1, len * 0.12, -len / 2, 0);
      c.fill();
      c.strokeStyle = 'rgba(20,16,14,0.7)'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(-len * 0.62, 0); c.lineTo(len * 0.45, 0); c.stroke();
      c.restore();
    }

    function frame(dt) {
      t += dt;
      gust += (gustTarget - gust) * Math.min(1, dt * 1.5);
      var c = canvas.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);

      // bands of light carried across
      c.globalCompositeOperation = 'lighter';
      for (var b = 0; b < BANDS.length; b++) {
        var B = BANDS[b], ph = (B.p + t * B.v * (0.6 + gust * 0.4)) % 1;
        var bx = -0.6 * W + ph * 2.2 * W, bw = W * 0.55, by = B.y * H, bh = B.h * H;
        var lg = c.createLinearGradient(bx, 0, bx + bw, 0);
        lg.addColorStop(0, 'rgba(237,227,214,0)'); lg.addColorStop(0.5, 'rgba(237,227,214,0.12)'); lg.addColorStop(1, 'rgba(237,227,214,0)');
        var vg = c.createLinearGradient(0, by, 0, by + bh);
        c.fillStyle = lg; c.globalAlpha = 1;
        c.save(); c.beginPath(); c.rect(bx, by, bw, bh); c.clip();
        c.fillRect(bx, by, bw, bh);
        c.restore();
      }
      c.globalCompositeOperation = 'source-over';

      // sand
      c.fillStyle = 'rgb(26,21,18)';
      for (var i = 0; i < GRAINS; i++) {
        var u = (gx[i] + t * gv[i] * gust) % 1.1 - 0.05;
        var x = u * W, y = gy[i] * H + Math.sin(t * 1.3 + gp[i]) * 3 - u * 6;
        var edge = Math.min(1, Math.min(u + 0.05, 1.05 - u) * 8);
        c.globalAlpha = ga[i] * edge;
        var sx = gs[i] * (1.25 + gust * 0.45), sy = gs[i] * 0.8;
        c.fillRect(x, y, sx, sy);
      }
      // feathers
      for (var f = 0; f < FEATHERS.length; f++) {
        var F = FEATHERS[f], v = (F.p + t * F.v) % 1;
        var fx = (F.x + Math.sin(v * 9 + F.sw) * 0.05 + v * 0.08 * gust) * W;
        var fy = (-0.06 + v * 1.12) * H;
        var fa = Math.sin(v * Math.PI) * 0.85;
        feather(c, fx, fy, 18 * F.s * (W / 360), F.rot + Math.sin(t * 1.4 + F.sw) * 0.9 + v * 3, fa);
      }
      c.globalAlpha = 1;
    }

    function loop(now) {
      if (!alive) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (visible && !document.hidden) frame(dt);
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (!alive) return;
      if (!resize()) { raf = requestAnimationFrame(start); return; }
      if (!reduce) raf = requestAnimationFrame(loop);
    }
    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null; if (ro) ro.observe(canvas);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }) : null; if (io) io.observe(canvas);
    start();

    var stop = function () { alive = false; cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); };
    stop.setGust = function (v) { gustTarget = v; };
    return stop;
  }

  window.IOCWind = { mount: mount };
})();
