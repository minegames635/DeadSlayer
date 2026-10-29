var Season = {
  cur: null, force: null, t: 0, chk: 0, parts: {}, wDecor: [], mGroup: null, sGroup: null, deco: [],
  id: function () {
    if (window.Save && Save.d && Save.d.gfx && Save.d.gfx.season === false) return null;
    if (this.force) return this.force === 'none' ? null : this.force;
    var q = /[?&]season=(\w+)/.exec(location.search || '');
    if (q) return q[1] === 'none' ? null : q[1];
    var d = new Date(), v = (d.getMonth() + 1) * 100 + d.getDate();
    if (v >= 1015 && v <= 1107) return 'halloween';
    if (v >= 1201 || v <= 115) return 'winter';
    return null;
  },
  mesh: function (w, h, l, c, x, y, z, e, par) {
    var m = new THREE.Mesh(M.box(w, h, l), new THREE.MeshLambertMaterial({ color: c, emissive: e || 0 }));
    m.position.set(x, y, z); if (par) par.add(m); return m;
  },
  pumpkin: function (sc) {
    var g = new THREE.Group(), o = 0xe8731a, e = 0x7a2a00, S = this;
    S.mesh(0.8, 0.62, 0.7, o, 0, 0.31, 0, e, g); S.mesh(0.6, 0.62, 0.8, o, 0, 0.31, 0, e, g);
    S.mesh(0.12, 0.2, 0.12, 0x3a6a22, 0, 0.72, 0, null, g);
    S.mesh(0.14, 0.12, 0.05, 0xffe070, -0.18, 0.4, 0.36, 0xffcc33, g); S.mesh(0.14, 0.12, 0.05, 0xffe070, 0.18, 0.4, 0.36, 0xffcc33, g);
    S.mesh(0.34, 0.1, 0.05, 0xffe070, 0, 0.2, 0.36, 0xffcc33, g);
    g.scale.setScalar(sc || 1); return g;
  },
  snowman: function (sc) {
    var g = new THREE.Group(), S = this;
    S.mesh(0.9, 0.7, 0.9, 0xf2f6ff, 0, 0.35, 0, 0x222a33, g); S.mesh(0.7, 0.6, 0.7, 0xf2f6ff, 0, 0.98, 0, 0x222a33, g);
    S.mesh(0.5, 0.5, 0.5, 0xf2f6ff, 0, 1.52, 0, 0x222a33, g); S.mesh(0.1, 0.1, 0.3, 0xff7a1a, 0, 1.52, 0.35, null, g);
    S.mesh(0.08, 0.08, 0.04, 0x111111, -0.12, 1.62, 0.26, null, g); S.mesh(0.08, 0.08, 0.04, 0x111111, 0.12, 1.62, 0.26, null, g);
    S.mesh(0.74, 0.12, 0.74, 0xcc2233, 0, 1.28, 0, 0x330008, g);
    g.scale.setScalar(sc || 1); return g;
  },
  pine: function (sc) {
    var g = new THREE.Group(), S = this;
    S.mesh(0.3, 0.8, 0.3, 0x4a2c18, 0, 0.4, 0, null, g);
    for (var i = 0; i < 4; i++) {
      var w = 2.0 - i * 0.45;
      S.mesh(w, 0.55, w, 0x1f5a3a, 0, 1.0 + i * 0.5, 0, 0x04140a, g);
      S.mesh(w * 0.8, 0.12, w * 0.8, 0xf4f8ff, 0, 1.25 + i * 0.5, 0, 0x222a33, g);
    }
    g.scale.setScalar(sc || 1); return g;
  },
  witchHat: function () {
    var g = new THREE.Group(), S = this;
    S.mesh(0.9, 0.06, 0.9, 0x1a1024, 0, 0, 0, null, g); S.mesh(0.5, 0.3, 0.5, 0x2a1838, 0, 0.18, 0, null, g);
    S.mesh(0.52, 0.08, 0.52, 0xe8731a, 0, 0.1, 0, 0x7a2a00, g); S.mesh(0.32, 0.3, 0.32, 0x2a1838, 0, 0.45, 0, null, g);
    S.mesh(0.16, 0.26, 0.16, 0x2a1838, 0.04, 0.7, 0, null, g); return g;
  },
  pumpkinHat: function () {
    var g = this.pumpkin(0.62); g.children.forEach(function (c) { if (c.position.z > 0.3) c.position.z += 0.0; }); return g;
  },
  santaHat: function () {
    var g = new THREE.Group(), S = this;
    S.mesh(0.58, 0.12, 0.58, 0xf4f4f4, 0, 0, 0, 0x222222, g); S.mesh(0.46, 0.3, 0.46, 0xcc1c2c, 0, 0.2, 0, 0x300006, g);
    S.mesh(0.3, 0.26, 0.3, 0xcc1c2c, 0.05, 0.45, 0, 0x300006, g); S.mesh(0.14, 0.14, 0.14, 0xf4f4f4, 0.12, 0.62, 0, 0x333333, g);
    return g;
  },
  hatFor: function (id, kind) {
    if (id === 'winter') return this.santaHat();
    return kind === 'pumpkin' ? this.pumpkinHat() : this.witchHat();
  },
  clearHat: function (head) {
    for (var i = head.children.length - 1; i >= 0; i--) if (head.children[i].userData.sHat) head.remove(head.children[i]);
  },
  dress: function (h, kind, cls) {
    if (!h || !h.head) return;
    this.clearHat(h.head);
    var id = this.id(); if (!id) return;
    cls = cls || h.cls || (window.Save && Save.d.cls) || 'knight';
    var hat;
    if (cls === 'knight') { hat = this.hatFor(id, 'pumpkin'); hat.position.set(0, id === 'winter' ? 0.46 : 0.5, 0); if (id === 'winter') hat = this.santaHat(), hat.position.set(0, 0.5, 0); }
    else if (cls === 'mage') {
      if (id === 'winter') { hat = this.mesh(0.16, 0.16, 0.16, 0xf4f4f4, 0, 1.12, 0, 0x333333); }
      else hat = this.mesh(0.52, 0.08, 0.52, 0xe8731a, 0, 0.5, 0, 0x7a2a00);
    } else { hat = this.hatFor(id, 'witch'); hat.position.set(0, 0.3, 0); }
    hat.userData.sHat = true; h.head.add(hat);
  },
  zombie: function (z, def, type) {
    if (!z || !z.head) return;
    var id = this.id(); if (!id || def.boss || type === 'necro' || Math.random() > 0.55) return;
    var hat = this.hatFor(id, Math.random() < 0.5 ? 'pumpkin' : 'witch');
    hat.position.set(0, id === 'halloween' && hat.children.length > 4 && hat.scale.x < 0.7 ? 0.55 : 0.3, 0);
    hat.userData.sHat = true; z.head.add(hat);
    if (id === 'winter') z.mats.forEach(function (m) { m.color.lerp(new THREE.Color(0xaad0ff), 0.35); });
  },
  wrap: function (v, b) { return ((v + b / 2) % b + b) % b - b / 2; },
  mkParts: function (n, col, size, bx, by, bz, fall, sway, yo) {
    var geo = new THREE.BufferGeometry(), arr = new Float32Array(n * 3), base = [], i;
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    for (i = 0; i < n; i++) base.push([Math.random() * bx, Math.random() * by, Math.random() * bz, Math.random() * 6]);
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: col, size: size, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false, fog: false }));
    pts.frustumCulled = false;
    return { pts: pts, n: n, base: base, bx: bx, by: by, bz: bz, fall: fall, sway: sway, yo: yo || 0 };
  },
  tickParts: function (p, cx, cz) {
    if (!p) return;
    var a = p.pts.geometry.attributes.position.array, i, b, t = this.t;
    for (i = 0; i < p.n; i++) {
      b = p.base[i];
      a[i * 3] = this.wrap(b[0] + Math.sin(t * 0.7 + b[3]) * p.sway - cx, p.bx);
      a[i * 3 + 1] = (((b[1] - p.fall * t) % p.by) + p.by) % p.by;
      a[i * 3 + 2] = this.wrap(b[2] + Math.cos(t * 0.6 + b[3]) * p.sway - cz, p.bz);
    }
    p.pts.geometry.attributes.position.needsUpdate = true;
    p.pts.position.set(cx, p.yo, cz);
  },
  dropParts: function (k, scene) {
    if (this.parts[k]) { scene.remove(this.parts[k].pts); this.parts[k].pts.geometry.dispose(); this.parts[k] = null; }
  },
  skyMat: function (a, b, c) {
    function v(x) { return 'vec3(' + x.join(',') + ')'; }
    return new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying float h;void main(){vec3 a=' + v(a) + ',b=' + v(b) + ',c=' + v(c) + ';float k=clamp(h,0.,1.);vec3 col=mix(a,b,smoothstep(0.,.35,k));col=mix(col,c,smoothstep(.3,.9,k));gl_FragColor=vec4(col,1.);}'
    });
  },
  WT: {
    none: { bg: 0x0b0812, end: 0x200810, amb: 0x6a5a90, pl: 0xffb070, gr: [1, 1, 1] },
    halloween: { bg: 0x140a14, end: 0x2e0c08, amb: 0x9a6a80, pl: 0xff8a30, gr: [1.25, 0.95, 0.9] },
    winter: { bg: 0x1c2840, end: 0x2c3c5e, amb: 0xa8bce0, pl: 0xb0d0ff, gr: [3.0, 3.3, 3.8] }
  },
  applyWorld: function (id) {
    if (!window.World || !World.scene) return;
    var S = this, th = this.WT[id || 'none'], sc = World.scene, i;
    World.mA = th.bg; World.mB = th.end;
    sc.background.setHex(th.bg); sc.fog.color.setHex(th.bg);
    sc.children.forEach(function (o) { if (o.isAmbientLight) o.color.setHex(th.amb); });
    World.pl.color.setHex(th.pl);
    World.ground.material.color.setRGB(th.gr[0], th.gr[1], th.gr[2]);
    World.decor = World.decor.filter(function (d) { if (d.s) { sc.remove(d.g); return false; } return true; });
    var ex = [];
    function put(g, r) { g.rotation.y = Math.random() * 6; sc.add(g); if (window.GFX) GFX.tag(g, true); ex.push({ g: g, x: (Math.random() - 0.5) * 90, z: (Math.random() - 0.5) * 90, s: true }); }
    if (id === 'halloween') for (i = 0; i < 20; i++) put(S.pumpkin(0.9 + Math.random() * 0.6));
    if (id === 'winter') { for (i = 0; i < 14; i++) put(S.pine(0.9 + Math.random() * 0.7)); for (i = 0; i < 6; i++) put(S.snowman(0.9 + Math.random() * 0.3)); }
    World.decor = ex.concat(World.decor);
    this.dropParts('w', sc);
    if (id === 'halloween') this.parts.w = this.mkParts(70, 0xff9a40, 4, 40, 9, 34, -0.5, 1, 0);
    if (id === 'winter') this.parts.w = this.mkParts(260, 0xffffff, 3.5, 40, 14, 34, 2.2, 1.2, 0);
    if (this.parts.w) sc.add(this.parts.w.pts);
    if (World.mood) World.mood((window.G && G.wave) || 1);
  },
  applyMenu: function (id) {
    if (!window.Menu || !Menu.scene) return;
    var S = this, sc = Menu.scene, i;
    if (!this.mo) {
      this.mo = { fog: sc.fog.color.getHex(), den: sc.fog.density };
      sc.children.forEach(function (o) {
        if (o.material && o.material.type === 'ShaderMaterial') { S.mo.sky = o; S.mo.skyMat = o.material; }
        else if (o.isSprite) { S.mo.moon = o; }
        else if (o.geometry && o.geometry.type === 'CircleGeometry') { S.mo.disc = o; S.mo.discC = o.material.color.getHex(); }
        else if (o.geometry && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 400) { S.mo.ground = o; S.mo.groundC = o.material.color.getHex(); }
      });
      this.mo.torch = Menu.torches.map(function (t) { return t.f.material.color.getHex(); });
      this.mo.amb = Menu.amb ? Menu.amb.color.getHex() : 0x5a4a80;
    }
    var m = this.mo, th = {
      none: { fog: m.fog, ground: m.groundC, disc: m.discC, moon: 0xffffff, ms: 40, torch: null, amb: m.amb, sky: m.skyMat },
      halloween: { fog: 0x1c0c12, ground: 0x1c1218, disc: 0xffa040, moon: 0xff8a30, ms: 62, torch: 0x66ff44, amb: 0x8a5a70, sky: this.skyMat([0.40, 0.13, 0.04], [0.12, 0.04, 0.13], [0.02, 0.01, 0.05]) },
      winter: { fog: 0x2a3a58, ground: 0xc4d2e8, disc: 0xeaf4ff, moon: 0xcfe8ff, ms: 40, torch: 0xaaddff, amb: 0x8aa0d0, sky: this.skyMat([0.36, 0.46, 0.64], [0.10, 0.16, 0.34], [0.03, 0.05, 0.15]) }
    }[id || 'none'];
    if (m.sky) m.sky.material = th.sky;
    sc.fog.color.setHex(th.fog);
    if (m.ground) m.ground.material.color.setHex(th.ground);
    if (m.disc) m.disc.material.color.setHex(th.disc);
    if (m.moon) { m.moon.material.color.setHex(th.moon); m.moon.scale.set(th.ms, th.ms, 1); }
    Menu.torches.forEach(function (t, k) { t.f.material.color.setHex(th.torch === null ? m.torch[k] : th.torch); });
    if (Menu.amb) Menu.amb.color.setHex(th.amb);
    if (Menu.embers) Menu.embers.visible = id !== 'winter';
    if (this.mGroup) { sc.remove(this.mGroup); this.mGroup = null; }
    if (id) {
      var g = this.mGroup = new THREE.Group(); sc.add(g);
      function spot() { var x, z; do { x = (Math.random() - 0.5) * 36; z = -16 + Math.random() * 18; } while (Math.abs(x) < 5.2 && z > -4); return [x, z]; }
      function add(o, p, y) { o.position.set(p[0], y === undefined ? -0.5 : y, p[1]); o.rotation.y = Math.random() * 6; g.add(o); }
      if (id === 'halloween') {
        for (i = 0; i < 22; i++) add(S.pumpkin(0.9 + Math.random() * 1.1), spot());
        add(S.pumpkin(1.0), [2.7, 2.1], 0); add(S.pumpkin(0.8), [-2.7, 2.3], 0); g.children[g.children.length - 2].rotation.y = -0.3; g.children[g.children.length - 1].rotation.y = 0.3;
      } else {
        for (i = 0; i < 14; i++) add(S.pine(1.0 + Math.random() * 1.2), spot());
        for (i = 0; i < 5; i++) add(S.snowman(1.0 + Math.random() * 0.5), spot());
        add(S.snowman(1.0), [2.9, 2.0], 0); g.children[g.children.length - 1].rotation.y = -0.4;
      }
      if (window.GFX) GFX.tag(g, false);
    }
    this.dropParts('m', sc);
    if (id === 'winter') this.parts.m = this.mkParts(220, 0xffffff, 3.5, 34, 16, 30, 1.8, 1.2, -0.5);
    if (id === 'halloween') this.parts.m = this.mkParts(40, 0xff9a40, 4, 30, 10, 26, -0.4, 1, -0.5);
    if (this.parts.m) sc.add(this.parts.m.pts);
  },
  signTex: function (txt, fg, bg) {
    var c = document.createElement('canvas'); c.width = 512; c.height = 128; var x = c.getContext('2d');
    x.fillStyle = bg; x.fillRect(0, 0, 512, 128); x.strokeStyle = fg; x.lineWidth = 6; x.strokeRect(6, 6, 500, 116);
    x.fillStyle = fg; x.font = 'bold 54px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 256, 68);
    return new THREE.CanvasTexture(c);
  },
  webTex: function () {
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d'), i, r;
    x.strokeStyle = 'rgba(230,230,240,.8)'; x.lineWidth = 1.5;
    for (i = 0; i <= 4; i++) { var a = i / 4 * Math.PI / 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * 128, Math.sin(a) * 128); x.stroke(); }
    for (r = 20; r <= 120; r += 25) { x.beginPath(); x.arc(0, 0, r, 0, Math.PI / 2); x.stroke(); }
    return new THREE.CanvasTexture(c);
  },
  applyShop: function (id) {
    if (!window.Shop3D || !Shop3D.scene) return;
    var S = this, sh = Shop3D, sc = sh.scene, i;
    if (!this.so) this.so = { bg: sc.background.getHex(), fog: sc.fog.color.getHex(), wall: sh.wallMat ? sh.wallMat.color.getHex() : 0xffffff, lamp: sh.lamps.map(function (l) { return l.l.color.getHex(); }) };
    var o = this.so;
    if (this.sGroup) { sc.remove(this.sGroup); this.sGroup = null; }
    this.deco = [];
    var bg = id === 'halloween' ? 0x160a18 : id === 'winter' ? 0x141c2c : o.bg;
    sc.background.setHex(bg); sc.fog.color.setHex(id === 'halloween' ? 0x1a0c1a : id === 'winter' ? 0x182234 : o.fog);
    if (sh.wallMat) sh.wallMat.color.setHex(id === 'halloween' ? 0xc8a0d8 : id === 'winter' ? 0xb8c8e8 : o.wall);
    sh.lamps.forEach(function (l, k) { l.l.color.setHex(id === 'halloween' ? (k % 2 ? 0x9a5cff : 0xff7a22) : id === 'winter' ? 0xffd9a0 : o.lamp[k]); });
    if (sh.moon) sh.moon.color.setHex(id === 'halloween' ? 0xff9a50 : id === 'winter' ? 0xbfe0ff : 0x7a9aff);
    if (!id) return;
    var g = this.sGroup = new THREE.Group(); sc.add(g);
    function m(w, h, l, c, x, y, z, e, p) { return S.mesh(w, h, l, c, x, y, z, e, p || g); }
    function place(o2, x, y, z, s) { o2.position.set(x, y, z); if (s) o2.scale.setScalar(s); g.add(o2); }
    if (id === 'halloween') {
      var pp = [[-3.0, 1.27, 1.0, 0.45], [3.3, 1.27, 0.8, 0.4], [-1.9, 1.27, 0.3, 0.3]];
      pp.forEach(function (p) { place(S.pumpkin(), p[0], p[1], p[2], p[3]); });
      [[-3.6, 0, 3.5, 1.0], [3.8, 0, 3.8, 0.8], [-5.6, 0, -1.5, 0.9], [5.6, 0, 1.0, 0.7], [-4.4, 0, 1.5, 0.6]].forEach(function (p) { place(S.pumpkin(), p[0], p[1], p[2], p[3]); });
      var wt = S.webTex(), wmat = new THREE.MeshBasicMaterial({ map: wt, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      var w1 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), wmat); w1.position.set(-5.8, 4.7, -4.85); w1.scale.set(1, -1, 1); g.add(w1);
      var w2 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), wmat); w2.position.set(5.8, 4.7, -4.85); w2.scale.set(-1, -1, 1); g.add(w2);
      for (i = 0; i < 5; i++) {
        var b = new THREE.Group(); b.position.set(-4 + i * 2, 4.4 - (i % 2) * 0.3, -1.5 + (i % 3));
        m(0.1, 0.3, 0.1, 0x050308, 0, 0.2, 0, null, b); m(0.5, 0.05, 0.2, 0x050308, -0.28, 0.08, 0, null, b); m(0.5, 0.05, 0.2, 0x050308, 0.28, 0.08, 0, null, b);
        g.add(b); this.deco.push({ k: 'bat', o: b, y: b.position.y, p: i });
      }
      for (i = 0; i < 14; i++) {
        var lx = -6 + i * 12 / 13, c = i % 2 ? 0xa060ff : 0xff8a22;
        this.deco.push({ k: 'lt', o: m(0.16, 0.16, 0.16, c, lx, 4.5 - Math.sin(i / 13 * Math.PI) * 0.5, -4.7, c, g), p: i });
      }
      var sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: S.signTex('С ХЭЛЛОУИНОМ!', '#ff9a30', '#1a0a14') }));
      sg.position.set(0, 3.9, -4.88); g.add(sg);
    } else {
      var tr = new THREE.Group(); tr.position.set(5.2, 0, 2.0); g.add(tr);
      m(0.4, 0.7, 0.4, 0x4a2c18, 0, 0.35, 0, null, tr);
      for (i = 0; i < 4; i++) { var w = 2.0 - i * 0.45; m(w, 0.6, w, 0x1f6a3a, 0, 0.9 + i * 0.55, 0, 0x04180c, tr); }
      m(0.3, 0.3, 0.3, 0xffd34a, 0, 3.25, 0, 0xffbb22, tr);
      for (i = 0; i < 12; i++) {
        var a = i * 2.1, rr = 0.8 - (i % 4) * 0.18, cc = [0xff3355, 0x44ddff, 0xffd34a, 0x66ff88][i % 4];
        this.deco.push({ k: 'lt', o: m(0.1, 0.1, 0.1, cc, Math.cos(a) * rr, 1.0 + (i % 4) * 0.55, Math.sin(a) * rr + 0.2, cc, tr), p: i });
      }
      [[4.2, 0.2, 0xcc2233], [4.8, 0.2, 0x2a8a4a], [6.0, 0.2, 0xe8c040]].forEach(function (b2, k) {
        m(0.5, 0.4, 0.5, b2[2], b2[0], 0.2, 3.1 + (k % 2) * 0.4, 0x100000); m(0.1, 0.42, 0.52, 0xf4f4f4, b2[0], 0.2, 3.1 + (k % 2) * 0.4);
      });
      place(S.snowman(0.8), 3.9, 0, 1.9);
      for (i = 0; i < 14; i++) {
        var gx = -6 + i * 12 / 13, gc = [0xff3355, 0x44ddff, 0xffd34a, 0x66ff88][i % 4];
        m(0.4, 0.1, 0.1, 0x1f6a3a, gx, 4.55 - Math.sin(i / 13 * Math.PI) * 0.45, -4.7);
        this.deco.push({ k: 'lt', o: m(0.12, 0.12, 0.12, gc, gx, 4.42 - Math.sin(i / 13 * Math.PI) * 0.45, -4.66, gc, g), p: i });
      }
      m(0.2, 0.16, 2.0, 0xf4f8ff, -6.85, 2.05, -3.6, 0x222a33);
      for (i = 0; i < 6; i++) m(0.08, 0.2 + (i % 3) * 0.1, 0.08, 0xdff0ff, -6.85, 4.2 - (i % 3) * 0.05, -4.4 + i * 0.32, 0x445566);
      var sg2 = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: S.signTex('С НОВЫМ ГОДОМ!', '#ffffff', '#7a1522') }));
      sg2.position.set(0, 3.9, -4.88); g.add(sg2);
    }
  },
  tickShop: function () {
    var t = this.t;
    this.deco.forEach(function (d) {
      if (d.k === 'lt') d.o.material.emissiveIntensity = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 3 + d.p * 1.7));
      else { d.o.rotation.z = Math.sin(t * 1.4 + d.p) * 0.25; d.o.position.y = d.y + Math.sin(t * 2 + d.p) * 0.08; }
    });
  },
  redress: function () {
    if (window.Menu && Menu.hero) this.dress(Menu.hero, 'hero', Save.d.cls);
    if (window.G && G.hero) this.dress(G.hero, 'hero', Save.d.cls);
  },
  refresh: function (force) {
    var id = this.id();
    if (!force && id === this.cur && this.inited) return;
    this.cur = id; this.inited = true;
    document.body.classList.toggle('season-halloween', id === 'halloween');
    document.body.classList.toggle('season-winter', id === 'winter');
    this.applyWorld(id); this.applyMenu(id); this.applyShop(id); this.redress();
  },
  update: function (dt, st, px, pz) {
    this.t += dt; this.chk += dt;
    if (this.chk > 30) { this.chk = 0; this.refresh(false); }
    if (st === 'menu' || st === 'splash') this.tickParts(this.parts.m, 0, 6);
    else if (st === 'shop' || st === 'shopIn' || st === 'shopOut') this.tickShop();
    else if (st !== 'story') this.tickParts(this.parts.w, px || 0, pz || 0);
  },
  init: function () {
    var S = this;
    document.addEventListener('visibilitychange', function () { if (!document.hidden) S.refresh(false); });
    this.refresh(true);
  }
};
