var Wpn = {
  add: function (g, w, h, l, c, x, y, z, e) { var m = M.mesh(w, h, l, c, x, y, z, e); g.add(m); return m; },
  glowMat: function (m, op) { m.material.transparent = true; m.material.opacity = op; m.material.depthWrite = false; m.material.blending = THREE.AdditiveBlending; return m; },
  rot: function (m, x, y, z) { m.rotation.set(x || 0, y || 0, z || 0); return m; },
  swordBase: function (d, g, L, bw) {
    this.add(g, 0.08, 0.08, 0.34, d.guard, 0, 0, -0.18);
    this.add(g, 0.1, 0.1, 0.1, d.guard, 0, 0, -0.34);
    this.add(g, 0.1, 0.42, 0.08, d.guard, 0, 0, 0.03);
    var seg = 5, i;
    for (i = 0; i < seg; i++) {
      var k = i / seg, w = bw * (1 - k * 0.45), sl = L / seg;
      this.add(g, 0.05, w, sl + 0.005, d.color, 0, 0, 0.1 + sl * (i + 0.5), d.glow || null);
    }
    this.add(g, 0.04, bw * 0.4, 0.2, d.color, 0, 0, 0.1 + L + 0.08, d.glow || null);
    var fl = this.add(g, 0.06, 0.04, L * 0.92, 0xffffff, 0, 0, 0.1 + L / 2, d.glow ? 0xffffff : null);
    fl.material.transparent = true; fl.material.opacity = 0.4;
  },
  sword: function (d) {
    var g = new THREE.Group(), L = 1.2 * d.len, i, a = [];
    this.swordBase(d, g, L, 0.22);
    var id = d.id;
    if (id === 'rusty') {
      for (i = 0; i < 4; i++) this.add(g, 0.06, 0.07, 0.07, 0x7a3a1a, 0, (i % 2 ? 0.06 : -0.06), 0.3 + i * 0.25);
      this.add(g, 0.1, 0.1, 0.34, 0x4a3020, 0, 0, -0.18);
    } else if (id === 'iron') {
      this.add(g, 0.12, 0.12, 0.3, 0x3a2a1a, 0, 0, -0.18);
      this.add(g, 0.06, 0.07, 0.07, 0xe0c060, 0, 0, 0.1);
    } else if (id === 'steel') {
      this.add(g, 0.12, 0.12, 0.3, 0x2a3a6a, 0, 0, -0.18);
      this.add(g, 0.13, 0.13, 0.13, 0x44aaff, 0, 0, 0.0, 0x2288ff);
      this.add(g, 0.12, 0.12, 0.12, 0x44aaff, 0, 0, -0.38, 0x2288ff);
    } else if (id === 'flame') {
      for (i = 0; i < 5; i++) {
        var c = this.add(g, 0.1, 0.12, 0.12, 0xffd040, 0, (i % 2 ? 0.08 : -0.08), 0.35 + i * (L / 6), 0xff8800);
        a.push(c);
      }
      var fire = this.add(g, 0.14, 0.34, L, 0xff5500, 0, 0, 0.1 + L / 2, 0xff4400); this.glowMat(fire, 0.22); a.push(fire);
      this.add(g, 0.06, 0.4, 0.14, 0xff4400, 0, 0.0, 0.08, 0xff2200);
    } else if (id === 'frost') {
      for (i = 0; i < 4; i++) {
        var s = this.add(g, 0.06, 0.16, 0.16, 0xd8f6ff, 0, (i % 2 ? 0.16 : -0.16), 0.4 + i * 0.32, 0x66ccff);
        s.rotation.x = (i % 2 ? 0.7 : -0.7);
      }
      this.add(g, 0.1, 0.5, 0.1, 0x66ccff, 0, 0, 0.0, 0x2299ff);
      var ic = this.add(g, 0.12, 0.3, L, 0x88ddff, 0, 0, 0.1 + L / 2, 0x22aaff); this.glowMat(ic, 0.2); a.push(ic);
    } else if (id === 'shadow') {
      var sw = g.children; sw.forEach(function (m, n) { if (n > 2) m.rotation.x = 0; });
      for (i = 0; i < 4; i++) {
        var sh = this.add(g, 0.1, 0.1, 0.1, 0xb070ff, 0, 0, 0, 0xaa44ff);
        sh.userData.o = i; a.push(sh);
      }
      var au = this.add(g, 0.2, 0.34, L + 0.2, 0x6622cc, 0, 0, 0.1 + L / 2, 0x5511aa); this.glowMat(au, 0.2); a.push(au);
      this.add(g, 0.14, 0.14, 0.14, 0xff3355, 0, 0, 0.0, 0xff2244);
    } else if (id === 'excal') {
      for (i = -1; i <= 1; i += 2) {
        this.add(g, 0.08, 0.18, 0.22, 0xffd23f, 0, i * 0.3, -0.08, 0x886600).rotation.x = i * 0.4;
        this.add(g, 0.08, 0.2, 0.2, 0xffe680, 0, i * 0.46, 0.0, 0x997700).rotation.x = i * 0.6;
      }
      this.add(g, 0.15, 0.15, 0.15, 0x33aaff, 0, 0, 0.05, 0x1188ff);
      var hl = this.add(g, 0.2, 0.4, L + 0.3, 0xffe088, 0, 0, 0.1 + L / 2, 0xffcc44); this.glowMat(hl, 0.25); a.push(hl);
    }
    g.userData.L = L; g.userData.anim = function (t) {
      a.forEach(function (m, n) {
        if (id === 'shadow' && m.userData.o !== undefined) {
          var an = t * 2.2 + m.userData.o * 1.57;
          m.position.set(Math.cos(an) * 0.28, Math.sin(an) * 0.28, 0.5 + m.userData.o * 0.28); m.rotation.set(an, an, 0);
        } else if (m.material.transparent) m.material.opacity = 0.2 + Math.sin(t * 5 + n) * 0.07;
        else if (id === 'flame') m.scale.y = 1 + Math.sin(t * 9 + n * 2) * 0.35;
      });
    };
    return g;
  }
};

Wpn.staff = function (d) {
  var g = new THREE.Group(), a = [], id = d.id, c = d.color, i;
  var shaft = Wpn.add(g, 0.09, 1.7, 0.09, id === 'void' ? 0x2a1a3a : id === 'glacier' ? 0x9ac8e0 : 0x5a3a22, 0, 0.55, 0);
  Wpn.add(g, 0.14, 0.12, 0.14, 0xd6a93a, 0, -0.25, 0);
  Wpn.add(g, 0.13, 0.1, 0.13, 0xd6a93a, 0, 0.9, 0);
  if (id === 'twig') {
    for (i = 0; i < 3; i++) Wpn.rot(Wpn.add(g, 0.06, 0.34, 0.06, 0x4a2e18, Math.cos(i * 2.1) * 0.12, 1.1, Math.sin(i * 2.1) * 0.12), Math.sin(i * 2.1) * 0.5, 0, -Math.cos(i * 2.1) * 0.5);
    a.push(Wpn.add(g, 0.2, 0.26, 0.2, c, 0, 1.15, 0, 0x22aa55));
  } else if (id === 'ember') {
    for (i = 0; i < 3; i++) Wpn.rot(Wpn.add(g, 0.07, 0.4, 0.07, 0x3a2a2a, Math.cos(i * 2.1) * 0.17, 1.05, Math.sin(i * 2.1) * 0.17), Math.sin(i * 2.1) * 0.4, 0, -Math.cos(i * 2.1) * 0.4);
    a.push(Wpn.add(g, 0.26, 0.26, 0.26, 0xff8a30, 0, 1.12, 0, 0xff4400));
    a.push(Wpn.glowMat(Wpn.add(g, 0.5, 0.5, 0.5, 0xff6600, 0, 1.12, 0, 0xff4400), 0.22));
  } else if (id === 'glacier') {
    a.push(Wpn.rot(Wpn.add(g, 0.26, 0.5, 0.26, 0xaee8ff, 0, 1.2, 0, 0x2299dd), 0, 0.78, 0));
    for (i = 0; i < 4; i++) Wpn.rot(Wpn.add(g, 0.08, 0.3, 0.08, 0xddf6ff, Math.cos(i * 1.57) * 0.22, 1.05, Math.sin(i * 1.57) * 0.22, 0x44aaee), Math.sin(i * 1.57) * 0.5, 0, -Math.cos(i * 1.57) * 0.5);
    Wpn.glowMat(Wpn.add(g, 0.6, 0.6, 0.6, 0x66ccff, 0, 1.2, 0, 0x2299dd), 0.15);
  } else if (id === 'storm') {
    a.push(Wpn.add(g, 0.24, 0.24, 0.24, 0xfff066, 0, 1.15, 0, 0xddbb00));
    for (i = 0; i < 2; i++) { var r = Wpn.add(g, 0.6, 0.05, 0.6, 0xffee55, 0, 1.15, 0, 0xccaa00); Wpn.glowMat(r, 0.55); r.userData.r = i; a.push(r); }
  } else {
    a.push(Wpn.add(g, 0.3, 0.3, 0.3, 0x2a0a4a, 0, 1.15, 0, 0x9933ee));
    Wpn.glowMat(Wpn.add(g, 0.66, 0.66, 0.66, 0x8833cc, 0, 1.15, 0, 0x7722bb), 0.18);
    for (i = 0; i < 4; i++) { var s = Wpn.add(g, 0.1, 0.1, 0.1, 0xd090ff, 0, 1.15, 0, 0xaa55ff); s.userData.o = i; a.push(s); }
  }
  g.userData.anim = function (t) {
    a.forEach(function (m, n) {
      if (m.userData.o !== undefined) { var an = t * 2 + m.userData.o * 1.57; m.position.set(Math.cos(an) * 0.45, 1.15 + Math.sin(an * 1.3) * 0.15, Math.sin(an) * 0.45); m.rotation.set(an, an, 0); }
      else if (m.userData.r !== undefined) { m.rotation.set(t * 3 + m.userData.r * 1.4, t * 2, m.userData.r * 1.5); }
      else if (m.material.transparent) m.material.opacity = 0.16 + Math.sin(t * 5) * 0.06;
      else { m.position.y += Math.sin(t * 3 + n) * 0.0015; }
    });
  };
  return g;
};

Wpn.bow = function (d) {
  var g = new THREE.Group(), id = d.id, c = d.color, i, N = 7, H = 0.95;
  var wood = id === 'hunter' ? 0x5a3a1c : id === 'elven' ? 0xe8dcc0 : id === 'blaze' ? 0x2a1a1a : id === 'celest' ? 0xffe9a0 : 0x9a6a3a;
  var emi = id === 'elven' ? 0x2a6a3a : id === 'blaze' ? 0xcc3300 : id === 'celest' ? 0xaa8800 : null;
  for (i = 0; i < N; i++) {
    var y0 = -H + (2 * H * i) / N, y1 = -H + (2 * H * (i + 1)) / N, ym = (y0 + y1) / 2;
    var z = 0.35 * (1 - (ym / H) * (ym / H)), z0 = 0.35 * (1 - (y0 / H) * (y0 / H)), z1 = 0.35 * (1 - (y1 / H) * (y1 / H));
    var seg = Wpn.add(g, 0.07, 0.07, Math.sqrt(Math.pow(y1 - y0, 2) + Math.pow(z1 - z0, 2)) + 0.02, wood, 0, ym, z, emi);
    seg.rotation.x = Math.atan2(-(y1 - y0), z1 - z0);
  }
  Wpn.add(g, 0.1, 0.3, 0.1, id === 'hunter' ? 0x2a1a0a : 0xd6a93a, 0, 0, 0.36);
  Wpn.add(g, 0.012, 2 * H, 0.012, id === 'celest' ? 0xffffcc : 0xeeeeee, 0, 0, 0, id === 'celest' ? 0xffee88 : null);
  if (id === 'elven') for (i = -1; i <= 1; i += 2) Wpn.add(g, 0.04, 0.2, 0.12, 0x66dd77, 0, i * (H + 0.08), 0.02, 0x229944);
  if (id === 'blaze') for (i = -1; i <= 1; i += 2) Wpn.glowMat(Wpn.add(g, 0.12, 0.3, 0.12, 0xff5500, 0, i * (H - 0.1), 0.05, 0xff4400), 0.5);
  if (id === 'celest') for (i = -1; i <= 1; i += 2) for (var k = 0; k < 3; k++) Wpn.add(g, 0.03, 0.06, 0.3 - k * 0.07, 0xfff2a8, 0, i * (0.5 + k * 0.1), -0.05 - k * 0.06, 0xffcc44);
  g.userData.anim = function (t) {};
  return g;
};

function buildWeapon(d) { return d.cls === 'knight' ? Wpn.sword(d) : d.cls === 'mage' ? Wpn.staff(d) : Wpn.bow(d); }
