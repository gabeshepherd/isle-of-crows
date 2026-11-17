/* The Seventh Veil — Regiões: one quiet, living atmosphere per region.
   Ivory on black with the faintest tint of each land. Each canvas only animates
   while it is on screen; with reduced motion it draws a single still frame. */
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
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  var TAU = Math.PI * 2;

  var MODES = {

    // Demacia — shafts of light falling on white stone, motes rising like dust in a cathedral
    demacia: {
      tint: [226, 216, 190],
      init: function (r) { var a = []; for (var i = 0; i < 70; i++) a.push({ x: r(), y: r(), v: 0.015 + r() * 0.03, s: 0.8 + r() * 2, sp: r() * TAU }); return a; },
      draw: function (c, S, t, W, H, tint) {
        for (var k = 0; k < 5; k++) {
          var x0 = W * (0.3 + k * 0.14) + Math.sin(t * 0.15 + k) * 30, w = W * (0.05 + (k % 2) * 0.04);
          var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, rgba(tint, 0.13 + 0.05 * Math.sin(t * 0.5 + k))); g.addColorStop(1, rgba(tint, 0));
          c.fillStyle = g; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + w, 0); c.lineTo(x0 + w * 2.6 + W * 0.08, H); c.lineTo(x0 + W * 0.08, H); c.closePath(); c.fill();
        }
        for (var i = 0; i < S.length; i++) {
          var p = S[i], y = 1 - ((p.y + t * p.v) % 1), x = p.x + Math.sin(t * 0.5 + p.sp) * 0.015;
          c.fillStyle = rgba([250, 244, 228], (0.3 + 0.5 * Math.abs(Math.sin(t + p.sp))) * Math.min(1, y * 3));
          c.fillRect(x * W, y * H, p.s, p.s);
        }
        c.strokeStyle = rgba(tint, 0.12); c.lineWidth = 1;
        for (var b = 0; b < 3; b++) { var bx = W * (0.55 + b * 0.12); c.beginPath(); c.moveTo(bx, H); c.lineTo(bx, H * (0.62 - b * 0.06)); c.stroke(); }
      }
    },
    // Freljord — snow driven by the wind under a slow aurora
    freljord: {
      tint: [184, 214, 230],
      init: function (r) { var a = []; for (var i = 0; i < 200; i++) a.push({ x: r(), y: r(), v: 0.04 + r() * 0.08, s: 0.8 + Math.pow(r(), 2) * 2.6, sp: r() * TAU }); return a; },
      draw: function (c, S, t, W, H, tint) {
        for (var band = 0; band < 2; band++) {
          c.beginPath();
          for (var x = 0; x <= W; x += 12) {
            var y = H * (0.18 + band * 0.08) + Math.sin(x * 0.004 + t * 0.25 + band) * 40 + Math.sin(x * 0.011 - t * 0.18) * 16;
            if (!x) c.moveTo(x, y); else c.lineTo(x, y);
          }
          c.save(); c.filter = 'blur(14px)'; c.strokeStyle = band ? 'rgba(200,226,236,0.10)' : 'rgba(170,224,210,0.16)'; c.lineWidth = 34 + band * 18; c.stroke(); c.restore();
        }
        for (var i = 0; i < S.length; i++) {
          var p = S[i], y = (p.y + t * p.v) % 1.05, x = (p.x + t * 0.025 * (1 + p.s * 0.3) + Math.sin(t * 0.8 + p.sp) * 0.01) % 1;
          c.fillStyle = 'rgba(240,246,250,' + (0.35 + p.s * 0.18) + ')';
          c.beginPath(); c.arc(x * W, y * H, p.s, 0, TAU); c.fill();
        }
        var gnd = c.createLinearGradient(0, H * 0.75, 0, H); gnd.addColorStop(0, 'rgba(220,234,240,0)'); gnd.addColorStop(1, 'rgba(220,234,240,0.08)');
        c.fillStyle = gnd; c.fillRect(0, H * 0.75, W, H * 0.25);
      }
    },
    // Noxus — embers and iron shards rising from a battlefield
    noxus: {
      tint: [232, 168, 150],
      init: function (r) { var a = []; for (var i = 0; i < 130; i++) a.push({ x: r(), y: r(), v: 0.03 + r() * 0.06, s: 1.6 + r() * 4, sp: r() * TAU, rot: r() * TAU, k: r() }); return a; },
      draw: function (c, S, t, W, H, tint) {
        for (var i = 0; i < S.length; i++) {
          var p = S[i], y = 1 - ((p.y + t * p.v) % 1.15), x = p.x + Math.sin(t * 0.6 + p.sp) * 0.02 + (1 - y) * 0.08;
          var a = Math.max(0, Math.min(1, y * 3)) * (0.45 + 0.5 * Math.abs(Math.sin(t * 3 + p.sp)));
          c.save(); c.translate(x * W, y * H); c.rotate(p.rot + t * (p.k - 0.5));
          c.fillStyle = rgba(p.k > 0.6 ? tint : [236, 228, 216], a);
          c.beginPath(); c.moveTo(0, -p.s * 1.6); c.lineTo(p.s * 0.5, p.s); c.lineTo(-p.s * 0.5, p.s); c.closePath(); c.fill();
          c.restore();
        }
        var g = c.createLinearGradient(0, H, 0, H * 0.55); g.addColorStop(0, rgba(tint, 0.09)); g.addColorStop(1, rgba(tint, 0));
        c.fillStyle = g; c.fillRect(0, H * 0.55, W, H * 0.45);
      }
    },
    // Ionia — petals on the wind, spirit lights drifting upward
    ionia: {
      tint: [238, 206, 214],
      init: function (r) { var a = []; for (var i = 0; i < 46; i++) a.push({ x: r(), y: r(), v: 0.02 + r() * 0.03, s: 3 + r() * 4, sp: r() * TAU, w: r() < 0.25 }); return a; },
      draw: function (c, S, t, W, H, tint) {
        for (var i = 0; i < S.length; i++) {
          var p = S[i];
          if (p.w) {
            var y = 1 - ((p.y + t * p.v * 0.6) % 1.1), x = p.x + Math.sin(t * 0.4 + p.sp) * 0.04;
            var g = c.createRadialGradient(x * W, y * H, 0, x * W, y * H, p.s * 3);
            g.addColorStop(0, 'rgba(240,236,226,0.55)'); g.addColorStop(1, 'rgba(240,236,226,0)');
            c.fillStyle = g; c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.2 + p.sp); c.fillRect(x * W - p.s * 3, y * H - p.s * 3, p.s * 6, p.s * 6); c.globalAlpha = 1;
          } else {
            var u = (p.x + t * p.v) % 1.2 - 0.1, yy = (p.y + Math.sin(t * 0.7 + p.sp) * 0.04 + u * 0.25) % 1;
            c.save(); c.translate(u * W, yy * H); c.rotate(t * 0.8 + p.sp); c.scale(1, 0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + p.sp)));
            c.fillStyle = rgba(tint, 0.55); c.beginPath(); c.ellipse(0, 0, p.s, p.s * 0.6, 0, 0, TAU); c.fill(); c.restore();
          }
        }
      }
    },
    // Piltover — clockwork rings turning, glints of hextech light
    piltover: {
      tint: [232, 212, 172],
      init: function () { return [{ r: 0.42, n: 48, v: 0.05 }, { r: 0.3, n: 36, v: -0.08 }, { r: 0.19, n: 24, v: 0.13 }, { r: 0.09, n: 12, v: -0.2 }]; },
      draw: function (c, S, t, W, H, tint) {
        var cx = W * 0.62, cy = H * 0.5, R = Math.min(W, H);
        c.strokeStyle = 'rgba(236,228,216,0.05)'; c.lineWidth = 1;
        for (var gx = 0; gx < W; gx += 48) { c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx, H); c.stroke(); }
        for (var gy = 0; gy < H; gy += 48) { c.beginPath(); c.moveTo(0, gy); c.lineTo(W, gy); c.stroke(); }
        for (var i = 0; i < S.length; i++) {
          var g = S[i], rr = g.r * R, a0 = t * g.v * TAU;
          c.strokeStyle = rgba(tint, 0.22); c.lineWidth = 1;
          c.beginPath(); c.arc(cx, cy, rr, 0, TAU); c.stroke();
          for (var k = 0; k < g.n; k++) {
            var a = a0 + k / g.n * TAU, l = k % 4 === 0 ? 10 : 5;
            c.beginPath(); c.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); c.lineTo(cx + Math.cos(a) * (rr + l), cy + Math.sin(a) * (rr + l)); c.stroke();
          }
          var ga = a0 * 1.7 + i, gl = c.createRadialGradient(cx + Math.cos(ga) * rr, cy + Math.sin(ga) * rr, 0, cx + Math.cos(ga) * rr, cy + Math.sin(ga) * rr, 14);
          gl.addColorStop(0, 'rgba(255,246,226,0.8)'); gl.addColorStop(1, 'rgba(255,246,226,0)');
          c.fillStyle = gl; c.fillRect(cx + Math.cos(ga) * rr - 14, cy + Math.sin(ga) * rr - 14, 28, 28);
        }
      }
    },
    // Zaun — chemical haze and bubbles rising out of the undercity
    zaun: {
      tint: [168, 212, 182],
      init: function (r) { var a = []; for (var i = 0; i < 60; i++) a.push({ x: r(), y: r(), v: 0.03 + r() * 0.05, s: 2 + r() * 7, sp: r() * TAU, fog: i < 8 }); return a; },
      draw: function (c, S, t, W, H, tint) {
        for (var i = 0; i < S.length; i++) {
          var p = S[i];
          if (p.fog) {
            var fx = (p.x + Math.sin(t * 0.05 + p.sp) * 0.2) * W, fy = H * (0.6 + p.y * 0.4), fr = W * 0.35;
            var g = c.createRadialGradient(fx, fy, 0, fx, fy, fr); g.addColorStop(0, rgba(tint, 0.08)); g.addColorStop(1, rgba(tint, 0));
            c.fillStyle = g; c.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
          } else {
            var y = 1.05 - ((p.y + t * p.v) % 1.1), x = p.x + Math.sin(t * 1.1 + p.sp) * 0.012;
            c.strokeStyle = rgba(tint, 0.5 * Math.min(1, y * 2)); c.lineWidth = 1;
            c.beginPath(); c.arc(x * W, y * H, p.s, 0, TAU); c.stroke();
            c.fillStyle = 'rgba(240,250,240,0.35)'; c.fillRect(x * W - p.s * 0.4, y * H - p.s * 0.5, 1.5, 1.5);
          }
        }
      }
    },
    // Bilgewater — the restless sea, foam catching the light
    bilgewater: {
      tint: [168, 206, 212],
      init: function (r) { var a = []; for (var i = 0; i < 70; i++) a.push({ x: r(), l: Math.floor(r() * 9), sp: r() * TAU }); return a; },
      draw: function (c, S, t, W, H, tint) {
        for (var l = 0; l < 9; l++) {
          var base = H * (0.45 + l * 0.065), amp = 6 + l * 2.2, k = 0.008 - l * 0.0004;
          c.strokeStyle = rgba(l % 3 === 0 ? tint : [236, 228, 216], 0.1 + l * 0.03); c.lineWidth = 1;
          c.beginPath();
          for (var x = 0; x <= W; x += 8) {
            var y = base + Math.sin(x * k + t * (0.5 + l * 0.08) + l) * amp + Math.sin(x * k * 2.3 - t * 0.7) * amp * 0.3;
            if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
          }
          c.stroke();
        }
        for (var i = 0; i < S.length; i++) {
          var p = S[i], px = ((p.x + t * 0.02) % 1) * W, L = p.l;
          var py = H * (0.45 + L * 0.065) + Math.sin(px * (0.008 - L * 0.0004) + t * (0.5 + L * 0.08) + L) * (6 + L * 2.2);
          c.fillStyle = 'rgba(240,244,244,' + (0.25 + 0.4 * Math.abs(Math.sin(t * 2 + p.sp))) + ')';
          c.fillRect(px, py - 1, 2, 2);
        }
      }
    },
    // Ixtal — leaves adrift and elemental motes circling in the green dark
    ixtal: {
      tint: [190, 214, 170],
      init: function (r) { var a = []; for (var i = 0; i < 54; i++) a.push({ x: r(), y: r(), s: 3 + r() * 5, sp: r() * TAU, o: 0.03 + r() * 0.1, e: Math.floor(r() * 4), leaf: r() < 0.5 }); return a; },
      draw: function (c, S, t, W, H, tint) {
        var E = [[214, 190, 150], [170, 200, 222], [232, 176, 150], [222, 230, 226]];
        for (var i = 0; i < S.length; i++) {
          var p = S[i], x = (p.x + Math.cos(t * p.o + p.sp) * 0.06) * W, y = (p.y + Math.sin(t * p.o * 1.3 + p.sp) * 0.05) * H;
          if (p.leaf) {
            c.save(); c.translate(x, y); c.rotate(Math.sin(t * 0.5 + p.sp) * 1.2);
            c.fillStyle = rgba(tint, 0.4); c.beginPath(); c.moveTo(-p.s * 1.4, 0); c.quadraticCurveTo(0, -p.s, p.s * 1.4, 0); c.quadraticCurveTo(0, p.s, -p.s * 1.4, 0); c.fill();
            c.strokeStyle = rgba(tint, 0.6); c.lineWidth = 0.6; c.beginPath(); c.moveTo(-p.s * 1.4, 0); c.lineTo(p.s * 1.4, 0); c.stroke(); c.restore();
          } else {
            var g = c.createRadialGradient(x, y, 0, x, y, p.s * 2.4); g.addColorStop(0, rgba(E[p.e], 0.7)); g.addColorStop(1, rgba(E[p.e], 0));
            c.fillStyle = g; c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.6 + p.sp); c.fillRect(x - p.s * 2.4, y - p.s * 2.4, p.s * 4.8, p.s * 4.8); c.globalAlpha = 1;
          }
        }
      }
    },
    // Shurima — a sun disc turning above the dunes, sand on the wind
    shurima: {
      tint: [232, 202, 146],
      init: function (r) { var a = []; for (var i = 0; i < 160; i++) a.push({ x: r(), y: 0.45 + r() * 0.55, v: 0.04 + r() * 0.1, s: 0.8 + r() * 1.6, sp: r() * TAU }); return a; },
      draw: function (c, S, t, W, H, tint) {
        var cx = W * 0.66, cy = H * 0.34, R = Math.min(W, H) * 0.16;
        var g = c.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 3); g.addColorStop(0, rgba(tint, 0.14)); g.addColorStop(1, rgba(tint, 0));
        c.fillStyle = g; c.fillRect(cx - R * 3, cy - R * 3, R * 6, R * 6);
        c.strokeStyle = rgba(tint, 0.45); c.lineWidth = 1.2; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
        c.strokeStyle = rgba(tint, 0.18); c.beginPath(); c.arc(cx, cy, R * 0.72, 0, TAU); c.stroke();
        for (var k = 0; k < 24; k++) {
          var a = t * 0.04 + k / 24 * TAU, l = k % 2 ? R * 0.35 : R * 0.6;
          c.strokeStyle = rgba(tint, k % 2 ? 0.16 : 0.28);
          c.beginPath(); c.moveTo(cx + Math.cos(a) * R * 1.12, cy + Math.sin(a) * R * 1.12); c.lineTo(cx + Math.cos(a) * (R * 1.12 + l), cy + Math.sin(a) * (R * 1.12 + l)); c.stroke();
        }
        for (var d = 0; d < 3; d++) {
          c.strokeStyle = rgba(tint, 0.1 + d * 0.05); c.beginPath();
          for (var x = 0; x <= W; x += 10) { var y = H * (0.74 + d * 0.08) + Math.sin(x * 0.006 + d * 2) * 18 + Math.sin(x * 0.015 + d) * 6; if (!x) c.moveTo(x, y); else c.lineTo(x, y); }
          c.stroke();
        }
        for (var i = 0; i < S.length; i++) {
          var p = S[i], u = (p.x + t * p.v) % 1.1 - 0.05;
          c.fillStyle = rgba(tint, 0.25 + 0.35 * Math.abs(Math.sin(p.sp)));
          c.fillRect(u * W, p.y * H + Math.sin(t + p.sp) * 3, p.s * 2, p.s * 0.8);
        }
      }
    },
    // Targon — the night sky over the mountain, a falling star now and then
    targon: {
      tint: [200, 214, 240],
      init: function (r) { var a = []; for (var i = 0; i < 220; i++) a.push({ x: r(), y: Math.pow(r(), 1.3) * 0.8, s: 0.5 + Math.pow(r(), 4) * 2, sp: r() * TAU }); return { stars: a, next: 3, m: null, r: r }; },
      draw: function (c, S, t, W, H, tint) {
        for (var i = 0; i < S.stars.length; i++) {
          var p = S.stars[i]; c.globalAlpha = 0.25 + 0.6 * Math.abs(Math.sin(t * 0.8 + p.sp));
          c.fillStyle = 'rgb(240,242,250)'; c.fillRect(p.x * W, p.y * H, p.s, p.s);
        }
        c.globalAlpha = 1;
        if (t > S.next && !S.m) { S.m = { x: 0.2 + S.r() * 0.6, y: 0.05 + S.r() * 0.25, t0: t }; S.next = t + 5 + S.r() * 6; }
        if (S.m) {
          var k = (t - S.m.t0) / 1.1; if (k > 1) S.m = null; else {
            var x0 = S.m.x * W, y0 = S.m.y * H, x1 = x0 + k * W * 0.25, y1 = y0 + k * H * 0.15;
            var lg = c.createLinearGradient(x1 - W * 0.08, y1 - H * 0.05, x1, y1); lg.addColorStop(0, 'rgba(240,242,250,0)'); lg.addColorStop(1, 'rgba(240,242,250,' + (0.8 * (1 - k)) + ')');
            c.strokeStyle = lg; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x1 - W * 0.08, y1 - H * 0.05); c.lineTo(x1, y1); c.stroke();
          }
        }
        var px = W * 0.6;
        var mg = c.createLinearGradient(0, H * 0.3, 0, H); mg.addColorStop(0, rgba(tint, 0.18)); mg.addColorStop(1, rgba(tint, 0.02));
        c.strokeStyle = mg; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(px - W * 0.55, H); c.lineTo(px - W * 0.12, H * 0.52); c.lineTo(px - W * 0.05, H * 0.56); c.lineTo(px, H * 0.3); c.lineTo(px + W * 0.07, H * 0.5); c.lineTo(px + W * 0.12, H * 0.46); c.lineTo(px + W * 0.5, H); c.stroke();
        var beam = c.createLinearGradient(0, 0, 0, H * 0.3); beam.addColorStop(0, 'rgba(240,242,250,0)'); beam.addColorStop(1, 'rgba(240,242,250,' + (0.12 + 0.05 * Math.sin(t)) + ')');
        c.fillStyle = beam; c.fillRect(px - 1, 0, 2, H * 0.3);
      }
    },
    // Vastaya — feathers falling slowly, fireflies blinking in a wild wood
    vastaya: {
      tint: [214, 196, 236],
      init: function (r) { var a = []; for (var i = 0; i < 44; i++) a.push({ x: r(), y: r(), v: 0.015 + r() * 0.025, s: 8 + r() * 10, sp: r() * TAU, fly: i >= 14 }); return a; },
      draw: function (c, S, t, W, H, tint) {
        for (var i = 0; i < S.length; i++) {
          var p = S[i];
          if (p.fly) {
            var x = (p.x + Math.sin(t * 0.3 + p.sp) * 0.05) * W, y = (p.y + Math.cos(t * 0.25 + p.sp) * 0.05) * H, a = Math.max(0, Math.sin(t * 1.4 + p.sp * 3));
            var g = c.createRadialGradient(x, y, 0, x, y, 8); g.addColorStop(0, 'rgba(246,240,214,' + (0.8 * a) + ')'); g.addColorStop(1, 'rgba(246,240,214,0)');
            c.fillStyle = g; c.fillRect(x - 8, y - 8, 16, 16);
          } else {
            var v = (p.y + t * p.v) % 1.15 - 0.08, fx = (p.x + Math.sin(v * 8 + p.sp) * 0.04) * W;
            c.save(); c.translate(fx, v * H); c.rotate(Math.sin(t * 0.9 + p.sp) * 0.9 + 0.6);
            var fg = c.createLinearGradient(-p.s / 2, 0, p.s / 2, 0); fg.addColorStop(0, rgba(tint, 0.65)); fg.addColorStop(1, rgba(tint, 0.05));
            c.fillStyle = fg; c.beginPath(); c.moveTo(-p.s / 2, 0); c.quadraticCurveTo(0, -p.s * 0.2, p.s / 2, 0); c.quadraticCurveTo(0, p.s * 0.16, -p.s / 2, 0); c.fill();
            c.restore();
          }
        }
      }
    },
    // Bandópolis — a whimsical spiral portal, turning and breathing
    bandopolis: {
      tint: [236, 204, 176],
      init: function () { return { n: 420 }; },
      draw: function (c, S, t, W, H, tint) {
        var cx = W * 0.62, cy = H * 0.5, R = Math.min(W, H) * 0.42, ga = Math.PI * (3 - Math.sqrt(5));
        var breathe = 1 + 0.06 * Math.sin(t * 0.7);
        for (var i = 0; i < S.n; i++) {
          var f = i / S.n, r = Math.sqrt(f) * R * breathe, a = i * ga + t * (0.25 - f * 0.18);
          var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
          var col = i % 7 === 0 ? [214, 196, 236] : i % 5 === 0 ? tint : [240, 234, 222];
          c.fillStyle = rgba(col, (0.25 + 0.6 * (1 - f)) * (0.6 + 0.4 * Math.sin(t * 2 + i)));
          var s = 0.8 + (1 - f) * 2.2; c.fillRect(x - s / 2, y - s / 2, s, s);
        }
        var g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 0.35); g.addColorStop(0, 'rgba(250,244,232,0.22)'); g.addColorStop(1, 'rgba(250,244,232,0)');
        c.fillStyle = g; c.fillRect(cx - R, cy - R, R * 2, R * 2);
      }
    }
  };


  /* ——— Landscapes: an original silhouette illustration of each land, drawn once
     behind its atmosphere. Far layers are lit by the region's tint, near layers fall
     into the page's black, and a few lit windows and rim-lights bring them to life. */
  function ridge(c, W, H, y0, amp, f, seed, fill, jag) {
    var r = rng(seed); var ph = r() * 10, ph2 = r() * 10;
    c.beginPath(); c.moveTo(0, H);
    for (var x = 0; x <= W + 8; x += 8) {
      var y = y0 * H + Math.sin(x * f + ph) * amp * H + Math.sin(x * f * 2.7 + ph2) * amp * 0.45 * H;
      if (jag) y += (r() - 0.5) * jag * H;
      c.lineTo(x, y);
    }
    c.lineTo(W, H); c.closePath(); c.fillStyle = fill; c.fill();
  }
  function fog(c, W, H, y, tint, a) { var g = c.createLinearGradient(0, y * H - H * 0.12, 0, y * H + H * 0.1); g.addColorStop(0, rgba(tint, 0)); g.addColorStop(0.5, rgba(tint, a)); g.addColorStop(1, rgba(tint, 0)); c.fillStyle = g; c.fillRect(0, y * H - H * 0.12, W, H * 0.22); }
  function ink(a) { return 'rgba(10,7,10,' + a + ')'; }
  function windows(c, r, x, y, w, h, n, tint) { for (var i = 0; i < n; i++) { if (r() < 0.45) continue; c.fillStyle = rgba([255, 226, 170], 0.35 + r() * 0.5); c.fillRect(x + r() * w, y + r() * h, 1.6, 2.4); } }
  function tower(c, x, base, w, h, roof, fill) { c.fillStyle = fill; c.fillRect(x - w / 2, base - h, w, h); c.beginPath(); c.moveTo(x - w / 2 - w * 0.12, base - h); c.lineTo(x, base - h - roof); c.lineTo(x + w / 2 + w * 0.12, base - h); c.closePath(); c.fill(); }
  function pine(c, x, base, h, fill) { c.fillStyle = fill; c.beginPath(); c.moveTo(x, base - h); for (var k = 0; k < 4; k++) { var y = base - h + (k + 1) * h / 4.4, w = h * 0.12 * (k + 1); c.lineTo(x + w, y); c.lineTo(x + w * 0.4, y); } c.lineTo(x + h * 0.05, base); c.lineTo(x - h * 0.05, base); for (k = 3; k >= 0; k--) { var y2 = base - h + (k + 1) * h / 4.4, w2 = h * 0.12 * (k + 1); c.lineTo(x - w2 * 0.4, y2); c.lineTo(x - w2, y2); } c.closePath(); c.fill(); }
  function tree(c, x, base, h, fill, r) { c.fillStyle = fill; c.fillRect(x - h * 0.03, base - h * 0.55, h * 0.06, h * 0.55); for (var k = 0; k < 6; k++) { c.beginPath(); c.arc(x + (r() - 0.5) * h * 0.4, base - h * 0.6 - r() * h * 0.35, h * (0.14 + r() * 0.12), 0, TAU); c.fill(); } }

  var SCENES = {
    demacia: function (c, W, H, t) {
      var r = rng(11);
      ridge(c, W, H, 0.62, 0.04, 0.004, 1, rgba(t, 0.16)); fog(c, W, H, 0.64, t, 0.1);
      ridge(c, W, H, 0.72, 0.03, 0.006, 2, ink(0.75));
      var cx = W * 0.58, base = H * 0.66, s = Math.min(W, H) / 700, wall = 'rgba(214,206,186,0.22)';
      c.fillStyle = wall; c.fillRect(cx - 150 * s, base - 70 * s, 300 * s, 70 * s);
      for (var k = -4; k <= 4; k++) c.fillRect(cx + k * 34 * s - 6 * s, base - 82 * s, 12 * s, 12 * s);
      tower(c, cx, base - 60 * s, 46 * s, 150 * s, 70 * s, 'rgba(226,218,198,0.3)');
      tower(c, cx - 105 * s, base - 50 * s, 30 * s, 110 * s, 46 * s, wall); tower(c, cx + 105 * s, base - 50 * s, 30 * s, 110 * s, 46 * s, wall);
      tower(c, cx - 175 * s, base, 22 * s, 90 * s, 34 * s, 'rgba(214,206,186,0.16)'); tower(c, cx + 175 * s, base, 22 * s, 90 * s, 34 * s, 'rgba(214,206,186,0.16)');
      c.strokeStyle = 'rgba(240,232,210,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, base - 280 * s); c.lineTo(cx, base - 320 * s); c.stroke();
      c.fillStyle = 'rgba(230,214,170,0.55)'; c.beginPath(); c.moveTo(cx, base - 320 * s); c.lineTo(cx + 26 * s, base - 312 * s); c.lineTo(cx, base - 304 * s); c.fill();
      windows(c, r, cx - 140 * s, base - 60 * s, 280 * s, 40 * s, 30, t);
      ridge(c, W, H, 0.84, 0.02, 0.008, 3, ink(0.95));
    },
    freljord: function (c, W, H, t) {
      var r = rng(12);
      c.fillStyle = rgba(t, 0.16); c.beginPath(); c.moveTo(0, H * 0.7);
      var peaks = [[0.08, 0.5], [0.22, 0.36], [0.36, 0.52], [0.52, 0.3], [0.66, 0.46], [0.8, 0.34], [0.95, 0.5], [1.05, 0.45]];
      peaks.forEach(function (p) { c.lineTo(p[0] * W, p[1] * H); }); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      c.fillStyle = 'rgba(240,246,250,0.35)';
      peaks.forEach(function (p) { c.beginPath(); c.moveTo(p[0] * W, p[1] * H); c.lineTo(p[0] * W - W * 0.035, p[1] * H + H * 0.06); c.lineTo(p[0] * W - W * 0.01, p[1] * H + H * 0.05); c.lineTo(p[0] * W + W * 0.01, p[1] * H + H * 0.07); c.lineTo(p[0] * W + W * 0.035, p[1] * H + H * 0.06); c.closePath(); c.fill(); });
      fog(c, W, H, 0.66, t, 0.14);
      ridge(c, W, H, 0.74, 0.025, 0.006, 4, ink(0.8));
      for (var i = 0; i < 26; i++) pine(c, r() * W, H * (0.78 + r() * 0.12), H * (0.06 + r() * 0.1), ink(0.92));
      ridge(c, W, H, 0.9, 0.01, 0.01, 5, 'rgba(226,236,242,0.08)');
    },
    noxus: function (c, W, H, t) {
      var g = c.createRadialGradient(W * 0.6, H * 0.55, 0, W * 0.6, H * 0.55, W * 0.6); g.addColorStop(0, rgba(t, 0.16)); g.addColorStop(1, rgba(t, 0)); c.fillStyle = g; c.fillRect(0, 0, W, H);
      ridge(c, W, H, 0.7, 0.03, 0.007, 6, rgba(t, 0.1), 0.01);
      var cx = W * 0.6, base = H * 0.74, s = Math.min(W, H) / 700, f = ink(0.92);
      c.fillStyle = f; c.beginPath(); c.moveTo(cx - 70 * s, base); c.lineTo(cx - 30 * s, base - 380 * s); c.lineTo(cx, base - 460 * s); c.lineTo(cx + 30 * s, base - 380 * s); c.lineTo(cx + 70 * s, base); c.fill();
      for (var k = 0; k < 9; k++) { var y = base - 60 * s - k * 36 * s, w = 70 * s - k * 5 * s, d = k % 2 ? 1 : -1; c.beginPath(); c.moveTo(cx + d * w * 0.6, y); c.lineTo(cx + d * (w + 40 * s), y - 30 * s); c.lineTo(cx + d * w * 0.6, y - 12 * s); c.fill(); }
      [[-180, 160], [170, 200], [-290, 110], [290, 120]].forEach(function (b) { c.beginPath(); c.moveTo(cx + b[0] * s - 18 * s, base); c.lineTo(cx + b[0] * s, base - b[1] * s); c.lineTo(cx + b[0] * s + 18 * s, base); c.fill(); });
      c.strokeStyle = rgba(t, 0.45); c.lineWidth = 1; c.beginPath(); c.moveTo(cx, base - 460 * s); c.lineTo(cx - 30 * s, base - 380 * s); c.stroke();
      c.fillStyle = rgba(t, 0.7); for (var w2 = 0; w2 < 7; w2++) c.fillRect(cx - 3 * s + (w2 % 2 ? 10 : -14) * s, base - 100 * s - w2 * 40 * s, 3 * s, 6 * s);
      ridge(c, W, H, 0.86, 0.015, 0.012, 7, ink(1), 0.01);
    },
    ionia: function (c, W, H, t) {
      var r = rng(14);
      ridge(c, W, H, 0.55, 0.06, 0.005, 8, rgba(t, 0.12)); fog(c, W, H, 0.58, t, 0.12);
      ridge(c, W, H, 0.66, 0.05, 0.007, 9, rgba(t, 0.07));
      [[0.32, 0.3, 90], [0.72, 0.22, 70], [0.55, 0.42, 50]].forEach(function (is, j) {
        var x = is[0] * W, y = is[1] * H, w = is[2] * Math.min(W, H) / 400;
        c.fillStyle = rgba(t, 0.22 - j * 0.04); c.beginPath(); c.ellipse(x, y, w, w * 0.18, 0, 0, Math.PI); c.fill();
        c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x, y + w * 1.2, x + w, y); c.fill();
        tree(c, x - w * 0.3, y, w * 0.9, rgba(t, 0.26 - j * 0.04), r);
      });
      var px = W * 0.66, pb = H * 0.7, s = Math.min(W, H) / 700, f = ink(0.88);
      ridge(c, W, H, 0.74, 0.02, 0.006, 10, ink(0.85));
      for (var k = 0; k < 3; k++) { var yy = pb - k * 46 * s, ww = (90 - k * 22) * s; c.fillStyle = f; c.fillRect(px - ww * 0.55, yy - 30 * s, ww * 1.1, 30 * s); c.beginPath(); c.moveTo(px - ww - 10 * s, yy - 26 * s); c.quadraticCurveTo(px - ww * 0.4, yy - 36 * s, px, yy - 52 * s); c.quadraticCurveTo(px + ww * 0.4, yy - 36 * s, px + ww + 10 * s, yy - 26 * s); c.fill(); }
      c.fillStyle = rgba([255, 226, 190], 0.6); c.fillRect(px - 4 * s, pb - 20 * s, 8 * s, 10 * s);
      c.strokeStyle = ink(0.95); c.lineWidth = 3 * s; c.beginPath(); c.moveTo(W * 0.2, H); c.quadraticCurveTo(W * 0.22, H * 0.78, W * 0.3, H * 0.7); c.stroke();
      for (var b = 0; b < 40; b++) { c.fillStyle = rgba(t, 0.25 + r() * 0.3); c.beginPath(); c.arc(W * (0.24 + r() * 0.14), H * (0.62 + r() * 0.12), 2 + r() * 5, 0, TAU); c.fill(); }
      ridge(c, W, H, 0.9, 0.01, 0.01, 11, ink(1));
    },
    piltover: function (c, W, H, t) {
      var r = rng(15), s = Math.min(W, H) / 700;
      var sea = c.createLinearGradient(0, H * 0.72, 0, H); sea.addColorStop(0, rgba(t, 0.12)); sea.addColorStop(1, rgba(t, 0)); c.fillStyle = sea; c.fillRect(0, H * 0.72, W, H * 0.28);
      c.fillStyle = ink(0.9); c.beginPath(); c.moveTo(W * 0.15, H); c.lineTo(W * 0.2, H * 0.72); c.lineTo(W, H * 0.7); c.lineTo(W, H); c.fill();
      var base = H * 0.72;
      for (var i = 0; i < 26; i++) { var x = W * (0.22 + r() * 0.78), w = (18 + r() * 34) * s, h = (60 + r() * 190) * s; var fl = r() < 0.5 ? rgba(t, 0.18) : rgba(t, 0.1); c.fillStyle = fl; c.fillRect(x - w / 2, base - h, w, h); if (r() < 0.4) { c.beginPath(); c.arc(x, base - h, w / 2, Math.PI, 0); c.fill(); } windows(c, r, x - w / 2, base - h, w, h, 10, t); }
      var cx = W * 0.62; c.fillStyle = rgba(t, 0.3); c.fillRect(cx - 16 * s, base - 300 * s, 32 * s, 300 * s);
      c.beginPath(); c.moveTo(cx - 22 * s, base - 300 * s); c.lineTo(cx, base - 360 * s); c.lineTo(cx + 22 * s, base - 300 * s); c.fill();
      c.strokeStyle = 'rgba(255,240,206,0.7)'; c.lineWidth = 1.2; c.beginPath(); c.arc(cx, base - 262 * s, 11 * s, 0, TAU); c.stroke();
      c.strokeStyle = rgba(t, 0.35); c.lineWidth = 2 * s; c.beginPath(); c.moveTo(W * 0.28, base - 70 * s); c.quadraticCurveTo(W * 0.45, base - 140 * s, W * 0.62, base - 70 * s); c.stroke();
      ridge(c, W, H, 0.92, 0.006, 0.02, 12, ink(1));
    },
    zaun: function (c, W, H, t) {
      var r = rng(16), s = Math.min(W, H) / 700;
      var glow = c.createLinearGradient(0, H * 0.5, 0, H); glow.addColorStop(0, rgba(t, 0)); glow.addColorStop(1, rgba(t, 0.2)); c.fillStyle = glow; c.fillRect(0, H * 0.5, W, H * 0.5);
      for (var i = 0; i < 18; i++) { var x = r() * W, w = (24 + r() * 60) * s, top = H * (0.35 + r() * 0.3); c.fillStyle = r() < 0.5 ? ink(0.85) : rgba(t, 0.09); c.fillRect(x, top, w, H - top); windows(c, r, x, top, w, H - top, 14, [200, 240, 200]); }
      c.strokeStyle = rgba(t, 0.3); c.lineWidth = 6 * s;
      for (var p = 0; p < 5; p++) { var px = r() * W; c.beginPath(); c.moveTo(px, 0); c.lineTo(px, H * (0.3 + r() * 0.4)); c.lineTo(px + (r() - 0.5) * 200 * s, H * (0.5 + r() * 0.3)); c.stroke(); }
      c.fillStyle = ink(0.95); c.fillRect(0, H * 0.22, W, 14 * s);
      for (var a = 0; a < 6; a++) { var ax = W * a / 5; c.beginPath(); c.moveTo(ax - 30 * s, H * 0.22 + 14 * s); c.quadraticCurveTo(ax, H * 0.22 + 60 * s, ax + 30 * s, H * 0.22 + 14 * s); c.fill(); }
      for (var m = 0; m < 4; m++) { var mx = W * (0.15 + m * 0.24), mh = H * (0.25 + r() * 0.15); c.fillStyle = ink(0.92); c.fillRect(mx, H - mh, 14 * s, mh); }
      ridge(c, W, H, 0.93, 0.008, 0.02, 13, ink(1));
    },
    bilgewater: function (c, W, H, t) {
      var r = rng(17), s = Math.min(W, H) / 700;
      ridge(c, W, H, 0.5, 0.05, 0.006, 14, rgba(t, 0.1)); fog(c, W, H, 0.52, t, 0.08);
      c.fillStyle = ink(0.9); c.fillRect(W * 0.05, H * 0.58, W * 0.9, 10 * s);
      for (var i = 0; i < 18; i++) c.fillRect(W * (0.06 + i * 0.05), H * 0.58, 4 * s, H * 0.1);
      [[0.3, 1], [0.58, 1.3], [0.82, 0.9]].forEach(function (sh) {
        var x = sh[0] * W, k = sh[1] * s, y = H * 0.57;
        c.fillStyle = ink(0.92); c.beginPath(); c.moveTo(x - 90 * k, y - 20 * k); c.lineTo(x + 100 * k, y - 20 * k); c.lineTo(x + 70 * k, y + 10 * k); c.lineTo(x - 70 * k, y + 10 * k); c.closePath(); c.fill();
        for (var m = -1; m <= 1; m++) { var mx = x + m * 55 * k; c.fillRect(mx - 1.5 * k, y - 220 * k, 3 * k, 200 * k); c.fillStyle = rgba(t, 0.2); c.beginPath(); c.moveTo(mx + 3 * k, y - 200 * k); c.quadraticCurveTo(mx + 45 * k, y - 150 * k, mx + 3 * k, y - 80 * k); c.fill(); c.fillStyle = ink(0.92); }
        c.fillStyle = rgba([255, 214, 150], 0.7); c.fillRect(x + 80 * k, y - 34 * k, 3 * k, 4 * k);
      });
      for (var l = 0; l < 12; l++) { c.fillStyle = rgba([255, 214, 150], 0.4 + r() * 0.4); c.beginPath(); c.arc(W * (0.08 + r() * 0.84), H * (0.55 + r() * 0.02), 1.6 * s, 0, TAU); c.fill(); }
    },
    ixtal: function (c, W, H, t) {
      var r = rng(18), s = Math.min(W, H) / 700;
      ridge(c, W, H, 0.6, 0.04, 0.008, 15, rgba(t, 0.12)); fog(c, W, H, 0.62, t, 0.1);
      var cx = W * 0.6, base = H * 0.68;
      for (var k = 0; k < 6; k++) { var w = (220 - k * 34) * s; c.fillStyle = k % 2 ? rgba(t, 0.2) : rgba(t, 0.14); c.fillRect(cx - w / 2, base - (k + 1) * 26 * s, w, 26 * s); }
      c.fillStyle = rgba(t, 0.24); c.fillRect(cx - 18 * s, base - 186 * s, 36 * s, 30 * s);
      c.fillStyle = rgba(t, 0.18); c.beginPath(); c.moveTo(cx - 70 * s, base - 300 * s); c.lineTo(cx + 70 * s, base - 300 * s); c.lineTo(cx + 30 * s, base - 250 * s); c.lineTo(cx, base - 230 * s); c.lineTo(cx - 34 * s, base - 252 * s); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(214,240,214,0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx - 70 * s, base - 300 * s); c.lineTo(cx + 70 * s, base - 300 * s); c.stroke();
      for (var i = 0; i < 40; i++) { var x = r() * W, y = H * (0.7 + r() * 0.15); c.fillStyle = ink(0.75 + r() * 0.2); c.beginPath(); c.arc(x, y, (30 + r() * 60) * s, Math.PI, 0); c.fill(); }
      for (var j = 0; j < 8; j++) { var vx = r() * W; c.strokeStyle = ink(0.9); c.lineWidth = 1.5 * s; c.beginPath(); c.moveTo(vx, 0); c.quadraticCurveTo(vx + 30 * s, H * 0.15, vx - 10 * s, H * (0.25 + r() * 0.2)); c.stroke(); }
      ridge(c, W, H, 0.9, 0.02, 0.012, 16, ink(1));
    },
    shurima: function (c, W, H, t) {
      var s = Math.min(W, H) / 700;
      ridge(c, W, H, 0.66, 0.03, 0.004, 17, rgba(t, 0.14));
      var cx = W * 0.66, base = H * 0.68;
      c.fillStyle = rgba(t, 0.2); c.beginPath(); c.moveTo(cx - 170 * s, base); c.lineTo(cx, base - 190 * s); c.lineTo(cx + 170 * s, base); c.fill();
      c.fillStyle = rgba(t, 0.12); c.beginPath(); c.moveTo(cx + 120 * s, base); c.lineTo(cx + 230 * s, base - 110 * s); c.lineTo(cx + 340 * s, base); c.fill();
      c.strokeStyle = 'rgba(250,236,200,0.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, base - 190 * s); c.lineTo(cx + 170 * s, base); c.stroke();
      for (var k = 0; k < 7; k++) { var x = W * 0.12 + k * 46 * s, h = (60 + (k * 37 % 50)) * s; c.fillStyle = ink(0.8); c.fillRect(x, base + 20 * s - h, 12 * s, h); c.fillRect(x - 4 * s, base + 20 * s - h, 20 * s, 6 * s); }
      ridge(c, W, H, 0.78, 0.035, 0.005, 18, ink(0.75));
      ridge(c, W, H, 0.88, 0.03, 0.007, 19, ink(0.95));
    },
    targon: function (c, W, H, t) {
      var s = Math.min(W, H) / 700, px = W * 0.6;
      c.fillStyle = rgba(t, 0.1); c.beginPath(); c.moveTo(0, H); c.lineTo(W * 0.2, H * 0.62); c.lineTo(W * 0.32, H * 0.7); c.lineTo(px, H * 0.3); c.lineTo(W * 0.82, H * 0.6); c.lineTo(W, H * 0.55); c.lineTo(W, H); c.fill();
      c.fillStyle = ink(0.85); c.beginPath(); c.moveTo(W * 0.08, H); c.lineTo(px - W * 0.1, H * 0.48); c.lineTo(px, H * 0.3); c.lineTo(px + W * 0.06, H * 0.46); c.lineTo(W * 0.95, H); c.fill();
      c.fillStyle = 'rgba(236,240,250,0.28)'; c.beginPath(); c.moveTo(px, H * 0.3); c.lineTo(px - W * 0.035, H * 0.37); c.lineTo(px - W * 0.01, H * 0.36); c.lineTo(px + W * 0.02, H * 0.39); c.lineTo(px + W * 0.03, H * 0.36); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,226,170,0.35)'; c.setLineDash([2, 5]); c.lineWidth = 1; c.beginPath(); c.moveTo(W * 0.3, H); c.lineTo(px - W * 0.05, H * 0.75); c.lineTo(px + W * 0.03, H * 0.6); c.lineTo(px - W * 0.03, H * 0.47); c.lineTo(px, H * 0.32); c.stroke(); c.setLineDash([]);
      fog(c, W, H, 0.7, t, 0.12);
    },
    vastaya: function (c, W, H, t) {
      var r = rng(20), s = Math.min(W, H) / 700;
      c.fillStyle = 'rgba(240,236,246,0.16)'; c.beginPath(); c.arc(W * 0.7, H * 0.28, 46 * s, 0, TAU); c.fill();
      fog(c, W, H, 0.6, t, 0.1);
      for (var i = 0; i < 14; i++) { var x = r() * W, h = H * (0.3 + r() * 0.35); c.fillStyle = rgba(t, 0.06 + r() * 0.06); c.fillRect(x, H - h, (6 + r() * 10) * s, h); c.beginPath(); c.arc(x + 5 * s, H - h, (40 + r() * 50) * s, 0, TAU); c.fill(); }
      for (var j = 0; j < 9; j++) { var x2 = r() * W, h2 = H * (0.4 + r() * 0.45); c.fillStyle = ink(0.9); c.fillRect(x2, H - h2, (10 + r() * 14) * s, h2); for (var k = 0; k < 4; k++) { c.beginPath(); c.arc(x2 + (r() - 0.5) * 80 * s, H - h2 + (r() - 0.3) * 40 * s, (30 + r() * 40) * s, 0, TAU); c.fill(); } }
      ridge(c, W, H, 0.9, 0.02, 0.01, 21, ink(1));
    },
    bandopolis: function (c, W, H, t) {
      var r = rng(22), s = Math.min(W, H) / 700, cx = W * 0.62, base = H * 0.86;
      fog(c, W, H, 0.7, t, 0.08);
      c.fillStyle = rgba(t, 0.16);
      c.beginPath(); c.moveTo(cx - 70 * s, base); c.bezierCurveTo(cx - 40 * s, base - 160 * s, cx - 120 * s, base - 260 * s, cx - 60 * s, base - 380 * s); c.lineTo(cx + 60 * s, base - 380 * s); c.bezierCurveTo(cx + 110 * s, base - 260 * s, cx + 40 * s, base - 160 * s, cx + 80 * s, base); c.fill();
      for (var k = 0; k < 9; k++) { c.beginPath(); c.arc(cx + (r() - 0.5) * 360 * s, base - 400 * s - r() * 120 * s, (60 + r() * 60) * s, 0, TAU); c.fill(); }
      c.strokeStyle = rgba(t, 0.4); c.lineWidth = 1.2; c.beginPath(); c.moveTo(cx - 70 * s, base); c.bezierCurveTo(cx - 40 * s, base - 160 * s, cx - 120 * s, base - 260 * s, cx - 60 * s, base - 380 * s); c.stroke();
      c.fillStyle = rgba(t, 0.24); for (var l = 0; l < 6; l++) { c.beginPath(); c.arc(cx + (r() - 0.5) * 380 * s, base - 380 * s - r() * 140 * s, (30 + r() * 30) * s, 0, TAU); c.fill(); }
      var g = c.createRadialGradient(cx, base - 70 * s, 0, cx, base - 70 * s, 70 * s); g.addColorStop(0, 'rgba(255,236,200,0.85)'); g.addColorStop(0.5, rgba(t, 0.35)); g.addColorStop(1, rgba(t, 0));
      c.fillStyle = g; c.beginPath(); c.arc(cx, base - 70 * s, 70 * s, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,240,214,0.7)'; c.beginPath(); c.ellipse(cx, base - 50 * s, 22 * s, 34 * s, 0, 0, TAU); c.fill();
      [[-220, 40], [-170, 26], [190, 34], [250, 22]].forEach(function (m) { var mx = cx + m[0] * s, mh = m[1] * s; c.fillStyle = ink(0.9); c.fillRect(mx - 3 * s, base - mh, 6 * s, mh); c.fillStyle = rgba(t, 0.3); c.beginPath(); c.ellipse(mx, base - mh, mh * 0.7, mh * 0.35, 0, Math.PI, 0); c.fill(); });
      for (var f = 0; f < 10; f++) { c.fillStyle = 'rgba(255,224,170,' + (0.4 + r() * 0.5) + ')'; c.beginPath(); c.arc(cx + (r() - 0.5) * 500 * s, base - 200 * s - r() * 300 * s, 2.2 * s, 0, TAU); c.fill(); }
      ridge(c, W, H, 0.9, 0.01, 0.01, 23, ink(1));
    }
  };

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(canvas, key) {
    var M = MODES[key]; if (!M) return function () {};
    var S = M.init(rng(key.length * 7919 + 13));
    var W = 0, H = 0, dpr = 1, raf = 0, last = 0, t = Math.random() * 20, alive = true, visible = false;
    var scene = document.createElement('canvas');
    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight; if (!W || !H) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = scene.width = Math.round(W * dpr); canvas.height = scene.height = Math.round(H * dpr);
      var sc = scene.getContext('2d'); sc.setTransform(dpr, 0, 0, dpr, 0, 0); sc.clearRect(0, 0, W, H);
      if (SCENES[key]) SCENES[key](sc, W, H, M.tint);
      if (reduce || !visible) paint(0);
      return true;
    }
    function paint(dt) {
      var c = canvas.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height);
      c.drawImage(scene, 0, 0);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      M.draw(c, S, t, W, H, M.tint);
    }
    function loop(now) {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (!visible || document.hidden || !W) return;
      t += dt; paint(dt);
    }
    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null; if (ro) ro.observe(canvas);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { rootMargin: '100px' }) : null;
    if (io) io.observe(canvas); else visible = true;
    resize();
    if (!reduce) raf = requestAnimationFrame(loop);
    return function () { alive = false; cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); };
  }

  window.RegionFX = { mount: mount, keys: Object.keys(MODES) };
})();
