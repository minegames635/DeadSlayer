var Shop3D = {
  scene: null, cam: null, item: null, itemDef: null, keeper: null, eyes: [], lights: [], doors: [], dust: null,
  t: 0, tr: 0, trOn: false, say: { txt: '', i: 0, acc: 0, hold: 0, on: false }, react: 0, px: 0, kp: null, lamps: [],
  PH: ['Бубу... добро пожаловать...', 'Хе-хе... смотри, не торопись...', 'Бу-бу... сталь голодна...', 'Монеты звенят... бубу...',
    'Этот клинок помнит кровь...', 'Бубу-бу! Выбирай мудро...', 'Тени любят золото...', 'Я видел, как умирали короли... бубу'],
  BUY: ['Бубубу! Отличный выбор!', 'Хе-хе... он твой...', 'Бу-бу, монеты приятно звенят...'],
  POOR: ['Бубу... карманы пусты...', 'Приходи, когда разбогатеешь... бу'],
  EQ: ['Бубу... удачной охоты...', 'Хорошо смотрится... бу-бу'],
  mat: function (c, e) { return new THREE.MeshLambertMaterial({ color: c, emissive: e || 0x000000 }); },
  box: function (w, h, l, c, x, y, z, e, par) {
    var m = new THREE.Mesh(M.box(w, h, l), this.mat(c, e)); m.position.set(x, y, z); (par || this.scene).add(m); return m;
  },
  stoneTex: function () {
    var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d');
    x.fillStyle = '#3a3036'; x.fillRect(0, 0, 256, 256);
    for (var r = 0; r < 8; r++) for (var k = 0; k < 4; k++) {
      var v = 52 + Math.random() * 22, ox = (r % 2) * 32;
      x.fillStyle = 'rgb(' + v + ',' + (v - 6) + ',' + (v - 2) + ')'; x.fillRect(ox + k * 64 + 2, r * 32 + 2, 60, 28);
    }
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  },
  woodTex: function () {
    var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d');
    for (var i = 0; i < 8; i++) {
      var v = 70 + Math.random() * 30; x.fillStyle = 'rgb(' + v + ',' + (v * 0.62) + ',' + (v * 0.38) + ')'; x.fillRect(0, i * 32, 256, 31);
      x.fillStyle = 'rgba(0,0,0,.15)'; for (var j = 0; j < 6; j++) x.fillRect(Math.random() * 256, i * 32 + Math.random() * 30, 40 + Math.random() * 60, 1);
    }
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  },
  init: function () {
    var s = this.scene = new THREE.Scene(), self = this;
    s.background = new THREE.Color(0x120a10); s.fog = new THREE.Fog(0x160c12, 7, 22);
    this.cam = new THREE.PerspectiveCamera(50, 1.78, 0.1, 80);
    s.add(new THREE.AmbientLight(0x6a4a50, 0.9));
    s.add(new THREE.HemisphereLight(0xffc890, 0x201020, 0.5));
    var wt = this.woodTex(); wt.repeat.set(3, 3);
    var fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshLambertMaterial({ map: wt }));
    fl.rotation.x = -Math.PI / 2; s.add(fl);
    var st = this.stoneTex(); st.repeat.set(4, 1.5);
    var wm = this.wallMat = new THREE.MeshLambertMaterial({ map: st });
    var back = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wm); back.position.set(0, 3, -5); s.add(back);
    var lw = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wm); lw.rotation.y = Math.PI / 2; lw.position.set(-7, 3, 0); s.add(lw);
    var rw = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wm); rw.rotation.y = -Math.PI / 2; rw.position.set(7, 3, 0); s.add(rw);
    var ce = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), this.mat(0x1a1014)); ce.rotation.x = Math.PI / 2; ce.position.y = 5.2; s.add(ce);
    for (var i = -3; i <= 3; i++) this.box(0.35, 0.4, 14, 0x3a2416, i * 2, 5.0, 0);
    this.box(14, 0.4, 0.4, 0x3a2416, 0, 4.9, -4.8);
    this.buildCounter(); this.buildProps(); this.buildKeeper(); this.buildDoors(); this.decorate(); this.enrich();
    GFX.tag(this.scene, true);
    [this.shaft, this.runeRing, this.glowPlate].forEach(function (o) { o.castShadow = false; o.receiveShadow = false; });
    this.shift = { x: 0, y: 0 }; this.zf = 1; this.swap = 0; this.out = null;
  },
  lamp: function (x, y, z, col, inten) {
    var g = new THREE.Group(); g.position.set(x, y, z); this.scene.add(g);
    this.box(0.04, 0.8, 0.04, 0x222222, 0, 0.4, 0, null, g);
    this.box(0.3, 0.4, 0.3, 0xffcc66, 0, -0.1, 0, 0xffaa33, g);
    this.box(0.4, 0.08, 0.4, 0x222222, 0, 0.12, 0, null, g);
    this.box(0.4, 0.08, 0.4, 0x222222, 0, -0.34, 0, null, g);
    var pl = new THREE.PointLight(col || 0xffaa55, inten || 1.1, 11); pl.position.y = -0.1; g.add(pl);
    this.lamps.push({ l: pl, b: inten || 1.1, o: Math.random() * 9 });
  },
  buildCounter: function () {
    var wt = this.woodTex(); wt.repeat.set(2, 1);
    var cm = new THREE.MeshLambertMaterial({ map: wt, color: 0x9a7a60 });
    var body = new THREE.Mesh(M.box(6, 1.1, 1.3), cm); body.position.set(0, 0.55, 0.5); this.scene.add(body);
    var top = new THREE.Mesh(M.box(6.4, 0.14, 1.7), this.mat(0x3a2214)); top.position.set(0, 1.17, 0.5); this.scene.add(top);
    for (var i = -2; i <= 2; i++) this.box(0.8, 0.7, 0.06, 0x2a160c, i * 1.1, 0.55, 1.17, 0x0a0400);
    this.box(6.5, 0.1, 0.1, 0xd6a93a, 0, 1.0, 1.2, 0x332200);
    var ped = new THREE.Group(); ped.position.set(-1.4, 1.24, 0.7); this.scene.add(ped);
    this.box(1.1, 0.12, 1.1, 0x2a2a34, 0, 0.06, 0, null, ped);
    this.box(0.8, 0.1, 0.8, 0x555566, 0, 0.17, 0, 0x110022, ped);
    var glow = this.box(0.9, 0.02, 0.9, 0xffd070, 0, 0.23, 0, 0xcc8822, ped);
    glow.material.transparent = true; glow.material.opacity = 0.6; this.glowPlate = glow;
    this.itemPos = new THREE.Group(); this.itemPos.position.set(-1.4, 2.35, 0.7); this.scene.add(this.itemPos);
    var spot = this.spot = new THREE.SpotLight(0xffd9a0, 1.7, 14, 0.62, 0.55, 1); spot.position.set(-1.4, 4.3, 2.6);
    spot.target.position.set(-1.4, 1.2, 0.7); this.scene.add(spot); this.scene.add(spot.target);
    this.itemLight = new THREE.PointLight(0xffd9a0, 0.9, 5); this.itemLight.position.set(-1.4, 2.4, 1.3); this.scene.add(this.itemLight);
    this.box(0.5, 0.06, 0.4, 0xaa2233, 1.8, 1.27, 0.9, 0x220008);
    this.box(0.3, 0.3, 0.3, 0xd6a93a, 1.0, 1.4, 0.8, 0x553300);
    for (i = 0; i < 6; i++) this.box(0.2, 0.04, 0.2, 0xffcc33, 2.2 + (i % 2) * 0.05, 1.26 + i * 0.045, 0.7, 0x664400);
  },
  buildProps: function () {
    var i, cols = [0xff4466, 0x44ddff, 0x66ff88, 0xffcc33, 0xbb66ff];
    for (var r = 0; r < 3; r++) {
      this.box(5.2, 0.12, 0.6, 0x3a2214, 0, 1.6 + r * 1.05, -4.6);
      for (i = 0; i < 9; i++) {
        var c = cols[(i + r) % 5];
        this.box(0.22, 0.38 + (i % 3) * 0.08, 0.22, c, -2.3 + i * 0.58, 1.84 + r * 1.05, -4.55, c & 0x555555);
      }
    }
    this.lamp(-4.2, 4.3, -2.5, 0xffaa55, 1.2); this.lamp(4.2, 4.3, -2.5, 0xffaa55, 1.2); this.lamp(0, 4.4, 2.5, 0xffc080, 1.0);
    for (i = 0; i < 3; i++) {
      this.box(0.9, 1.1, 0.9, 0x4a2c18, -5.5 + (i % 2) * 0.7, 0.55 + Math.floor(i / 2) * 1.1, -3.5 + i * 0.1);
      this.box(0.95, 0.1, 0.95, 0x222222, -5.5 + (i % 2) * 0.7, 0.4 + Math.floor(i / 2) * 1.1, -3.5 + i * 0.1);
    }
    this.box(1.2, 0.7, 0.8, 0x5a3418, 5.3, 0.35, -3.6); this.box(1.25, 0.2, 0.85, 0xd6a93a, 5.3, 0.75, -3.6, 0x442800);
    for (i = 0; i < 4; i++) this.box(0.08, 1.4, 0.08, 0x777788, -6.8, 2.6, -1.8 + i * 0.9, 0x111122);
    this.box(0.1, 0.1, 3.6, 0x3a2214, -6.8, 3.4, -0.4);
    var skull = this.box(0.35, 0.3, 0.35, 0xe8e0d0, 2.6, 1.4, 0.9); this.box(0.08, 0.08, 0.04, 0x000000, 2.5, 1.43, 1.08);
    this.box(0.08, 0.08, 0.04, 0x000000, 2.7, 1.43, 1.08);
  },
  buildKeeper: function () {
    var self = this, k = this.keeper = new THREE.Group(); k.position.set(0.9, 0, -1.2); this.scene.add(k);
    var b = 0x050308, f = 0x0c0814, kp = this.kp = { hem: [], fing: [[], []], arms: [] }, i, s;
    var body = kp.body = new THREE.Group(); k.add(body);
    this.box(1.9, 0.5, 1.1, b, 0, 0.5, 0, null, body); this.box(1.7, 0.5, 1.0, b, 0, 1.0, 0, null, body);
    this.box(1.5, 0.6, 0.95, b, 0, 1.55, 0, null, body); this.box(1.3, 0.7, 0.85, b, 0, 2.0, 0, null, body);
    this.box(1.9, 0.32, 0.8, b, 0, 2.28, 0, null, body); this.box(1.1, 0.4, 0.7, b, 0, 2.5, -0.22, null, body);
    this.box(0.3, 1.7, 0.06, f, 0, 1.2, 0.55, null, body); this.box(1.5, 0.08, 0.1, f, 0, 1.0, 0.52, null, body);
    for (s = -1; s <= 1; s += 2) {
      this.box(0.22, 0.5, 0.34, f, s * 0.55, 2.55, 0.05, null, body).rotation.z = -s * 0.3;
      this.box(0.18, 1.5, 0.06, f, s * 0.62, 1.4, 0.5, null, body).rotation.z = s * 0.08;
    }
    for (i = 0; i < 8; i++) {
      var hg = new THREE.Group(); hg.position.set(-0.84 + i * 0.24, 0.3, 0.56 + (i % 2) * 0.03); body.add(hg);
      this.box(0.25, 0.4 + (i % 3) * 0.12, 0.08, b, 0, -0.2 - (i % 3) * 0.06, 0, null, hg); kp.hem.push({ g: hg, p: i * 0.9 });
      var hb = new THREE.Group(); hb.position.set(-0.84 + i * 0.24, 0.3, -0.56); body.add(hb);
      this.box(0.25, 0.45 + (i % 2) * 0.15, 0.08, b, 0, -0.22, 0, null, hb); kp.hem.push({ g: hb, p: i * 1.3 + 2 });
    }
    var head = kp.head = new THREE.Group(); head.position.set(0, 2.55, 0.02); body.add(head);
    this.box(0.95, 0.85, 0.85, b, 0, 0.2, 0, null, head).name = 'hood';
    this.box(0.7, 0.4, 0.7, b, 0, 0.78, -0.05, null, head);
    this.box(1.02, 0.1, 0.12, f, 0, 0.58, 0.4, null, head);
    for (s = -1; s <= 1; s += 2) this.box(0.1, 0.8, 0.12, f, s * 0.5, 0.2, 0.36, null, head);
    var tip = kp.tip = new THREE.Group(); tip.position.set(0, 0.95, -0.2); head.add(tip);
    this.box(0.4, 0.3, 0.4, b, 0, 0.1, 0, null, tip);
    var tip2 = kp.tip2 = new THREE.Group(); tip2.position.set(0, 0.2, -0.1); tip.add(tip2);
    this.box(0.28, 0.28, 0.28, b, 0, 0.1, -0.1, null, tip2);
    var tip3 = kp.tip3 = new THREE.Group(); tip3.position.set(0, 0.1, -0.2); tip2.add(tip3);
    this.box(0.16, 0.2, 0.2, b, 0, 0, -0.1, null, tip3);
    for (s = -1; s <= 1; s += 2) {
      var e = this.box(0.22, 0.1, 0.05, 0xfff0a0, s * 0.19, 0.12, 0.41, 0xffee88, head); this.eyes.push(e);
      var gl = this.box(0.34, 0.2, 0.02, 0xffdd66, s * 0.19, 0.12, 0.4, 0xffcc44, head);
      gl.material.transparent = true; gl.material.opacity = 0.35; gl.material.depthWrite = false; this.eyes.push(gl);
    }
    for (s = -1; s <= 1; s += 2) {
      var sh = new THREE.Group(); sh.position.set(s * 0.98, 2.3, 0.05); body.add(sh);
      this.box(0.34, 0.85, 0.34, b, 0, -0.38, 0, null, sh); this.box(0.4, 0.3, 0.4, f, 0, -0.05, 0, null, sh);
      var elb = new THREE.Group(); elb.position.y = -0.8; sh.add(elb);
      this.box(0.3, 0.75, 0.3, b, 0, -0.34, 0, null, elb); this.box(0.42, 0.34, 0.42, f, 0, -0.5, 0, null, elb);
      var wr = new THREE.Group(); wr.position.y = -0.72; elb.add(wr);
      this.box(0.24, 0.12, 0.3, 0x14101c, 0, -0.04, 0.03, null, wr);
      var fg = [];
      for (i = 0; i < 3; i++) {
        var fj = new THREE.Group(); fj.position.set((i - 1) * 0.08, -0.08, 0.16); wr.add(fj);
        this.box(0.04, 0.04, 0.2, 0x14101c, 0, 0, 0.08, null, fj); fg.push(fj);
      }
      kp.arms.push({ sh: sh, el: elb, wr: wr, fg: fg, s: s });
    }
    var el = new THREE.PointLight(0xffe080, 0.5, 3); el.position.set(0, 2.5, 0.8); k.add(el);
  },
  buildDoors: function () {
    var i, d;
    this.box(4.6, 5, 0.4, 0x2a1c20, -4.7, 2.5, 6.8); this.box(4.6, 5, 0.4, 0x2a1c20, 4.7, 2.5, 6.8);
    this.box(14, 1.2, 0.4, 0x2a1c20, 0, 4.4, 6.8);
    for (i = -1; i <= 1; i += 2) {
      var p = new THREE.Group(); p.position.set(i * 2.4, 0, 6.8); this.scene.add(p);
      this.box(2.4, 3.8, 0.2, 0x4a2c16, -i * 1.2, 1.9, 0, null, p);
      this.box(2.0, 0.12, 0.24, 0x1a1a22, -i * 1.2, 2.6, 0, null, p); this.box(2.0, 0.12, 0.24, 0x1a1a22, -i * 1.2, 1.2, 0, null, p);
      this.box(0.14, 0.14, 0.28, 0xd6a93a, -i * 2.1, 1.9, 0, 0x442200, p);
      this.doors.push({ p: p, s: i });
    }
    var pos = new Float32Array(150);
    for (i = 0; i < 50; i++) { pos[i * 3] = (Math.random() - 0.5) * 12; pos[i * 3 + 1] = Math.random() * 4.5; pos[i * 3 + 2] = (Math.random() - 0.5) * 10; }
    var gm = new THREE.BufferGeometry(); gm.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(gm, new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.05, transparent: true, opacity: 0.55 }));
    this.scene.add(this.dust);
  },
  runeTex: function () {
    var c = document.createElement('canvas'), x, i, q; c.width = c.height = 256; x = c.getContext('2d');
    x.strokeStyle = '#fff'; x.lineWidth = 5;
    [120, 98].forEach(function (r) { x.beginPath(); x.arc(128, 128, r, 0, 7); x.stroke(); });
    x.lineWidth = 4;
    for (i = 0; i < 16; i++) {
      q = i / 16 * Math.PI * 2; x.save(); x.translate(128 + Math.cos(q) * 109, 128 + Math.sin(q) * 109); x.rotate(q);
      x.strokeRect(-6, -6, 12, 12); x.beginPath(); x.moveTo(-6, 6); x.lineTo(6, -6); x.stroke(); x.restore();
    }
    x.beginPath(); for (i = 0; i < 6; i++) { q = i / 6 * Math.PI * 2 - 1.57; x.lineTo(128 + Math.cos(q) * 90, 128 + Math.sin(q) * 90); } x.closePath(); x.stroke();
    return new THREE.CanvasTexture(c);
  },
  decorate: function () {
    var s = this.scene, i, bx;
    this.box(2.8, 0.03, 9.5, 0x6a1522, 0.2, 0.02, 2.0, 0x1a0004);
    this.box(0.14, 0.04, 9.5, 0xd6a93a, -1.2, 0.03, 2.0, 0x332200); this.box(0.14, 0.04, 9.5, 0xd6a93a, 1.6, 0.03, 2.0, 0x332200);
    for (i = -1; i <= 1; i += 2) {
      bx = i * 3.3;
      this.box(0.9, 2.3, 0.05, 0x7a1a2a, bx, 3.55, -4.93, 0x1a0004);
      this.box(1.05, 0.1, 0.09, 0xd6a93a, bx, 4.75, -4.9, 0x332200);
      this.box(0.3, 0.3, 0.06, 0xd6a93a, bx, 3.7, -4.88, 0x553300);
      this.box(0.14, 0.5, 0.06, 0xd6a93a, bx, 3.2, -4.88, 0x553300);
    }
    this.box(0.12, 2.3, 1.8, 0x1a1a24, -6.94, 3.2, -3.6);
    this.box(0.06, 2.0, 1.5, 0x3a5a9a, -6.9, 3.2, -3.6, 0x6688cc);
    var moon = this.moon = new THREE.SpotLight(0x7a9aff, 1.3, 16, 0.5, 0.7, 1);
    moon.position.set(-6.7, 3.4, -3.6); moon.target.position.set(-2.5, 0, -1.2); s.add(moon); s.add(moon.target);
    var shaft = this.shaft = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 6), new THREE.MeshBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    shaft.position.set(-4.3, 1.9, -3.6); shaft.rotation.z = 1.08; s.add(shaft);
    var ch = this.chandelier = new THREE.Group(); ch.position.set(-0.25, 3.9, 0.9); s.add(ch);
    this.box(0.05, 1.3, 0.05, 0x222222, 0, 0.85, 0, null, ch);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 6, 22), this.mat(0x2a2a2e)); ring.rotation.x = Math.PI / 2; ch.add(ring);
    this.flames = [];
    for (i = 0; i < 6; i++) {
      var a = i / 6 * Math.PI * 2, cx = Math.cos(a) * 0.75, cz = Math.sin(a) * 0.75;
      this.box(0.08, 0.22, 0.08, 0xeee4cc, cx, 0.13, cz, null, ch);
      var fl = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 5), new THREE.MeshBasicMaterial({ color: 0xffbb44 }));
      fl.position.set(cx, 0.33, cz); ch.add(fl); this.flames.push(fl);
    }
    var rm = new THREE.MeshBasicMaterial({ map: this.runeTex(), transparent: true, color: 0xffd070, blending: THREE.AdditiveBlending, depthWrite: false });
    this.runeRing = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), rm); this.runeRing.rotation.x = -Math.PI / 2;
    this.runeRing.position.set(-1.4, 1.26, 0.7); s.add(this.runeRing);
    var N = 48, sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    this.spark = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffd070, size: 0.09, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.spark.frustumCulled = false; s.add(this.spark); this.sparkN = N;
  },
  enrich: function () {
    var i, j, cols = [0xaa3344, 0x3366aa, 0x44884a, 0xc9a23a, 0x7a4a9a], s = this.scene;
    // bookshelf on right wall
    this.box(0.5, 3.0, 2.6, 0x3a2214, 6.7, 1.5, -2.0);
    for (j = 0; j < 3; j++) {
      this.box(0.55, 0.08, 2.6, 0x2a160c, 6.65, 0.5 + j * 1.0, -2.0);
      for (i = 0; i < 8; i++) this.box(0.3, 0.55 + (i % 3) * 0.1, 0.22, cols[(i + j) % 5], 6.5, 0.8 + j * 1.0, -3.0 + i * 0.28);
    }
    // weapon rack on back wall
    this.box(0.1, 1.6, 0.1, 0x777788, -1.3, 3.6, -4.9); this.box(0.1, 1.6, 0.1, 0x777788, 1.3, 3.6, -4.9);
    this.box(0.4, 0.4, 0.1, 0x5a3418, 0, 3.5, -4.92);
    this.box(0.9, 1.1, 0.1, 0x7a1a2a, 0, 3.5, -4.9, 0x1a0004);
    // candles on counter
    var self = this;
    [[-0.3, 0.2], [0, 0.3], [0.3, 0.2]].forEach(function (p, k) {
      self.box(0.12, 0.3 + k * 0.1, 0.12, 0xeee4cc, 3.0 + p[0], 1.39 + k * 0.05, 0.1 + p[1] * 0.1);
      var fl = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 5), new THREE.MeshBasicMaterial({ color: 0xffbb44 }));
      fl.position.set(3.0 + p[0], 1.65 + k * 0.1, 0.1 + p[1] * 0.1); s.add(fl); self.flames.push(fl);
    });
    // crates
    this.box(0.9, 0.9, 0.9, 0x5a3a20, -5.6, 0.45, 2.6); this.box(0.7, 0.7, 0.7, 0x4a2c18, -5.4, 1.25, 2.6);
    this.box(0.95, 0.12, 0.95, 0x2a160c, -5.6, 0.45, 2.6);
    // cauldron
    var cd = new THREE.Group(); cd.position.set(4.6, 0, -1.0); s.add(cd);
    this.box(0.9, 0.7, 0.9, 0x1a1a20, 0, 0.55, 0, null, cd); this.box(1.05, 0.12, 1.05, 0x2a2a30, 0, 0.92, 0, null, cd);
    this.box(0.8, 0.04, 0.8, 0x66ff88, 0, 0.9, 0, 0x22cc55, cd);
    for (i = -1; i <= 1; i += 2) { this.box(0.1, 0.25, 0.1, 0x111111, i * 0.35, 0.12, 0.3, null, cd); this.box(0.1, 0.25, 0.1, 0x111111, i * 0.35, 0.12, -0.3, null, cd); }
    // herbs hanging from beams
    for (i = 0; i < 5; i++) { this.box(0.03, 0.5, 0.03, 0x333322, -2.6 + i * 1.3, 4.65, 3.0 + (i % 2)); this.box(0.2, 0.3, 0.2, [0x3a6a2a, 0x8a4a2a, 0x6a2a6a][i % 3], -2.6 + i * 1.3, 4.3, 3.0 + (i % 2)); }
  },
  setQuality: function (c, on) {
    GFX.light(this.spot, c.smap || 1024, 8);
    if (this.dust) this.dust.geometry.setDrawRange(0, Math.min(50, c.dust));
    if (this.moon) this.moon.visible = c.rs >= 0.85;
    this.scene.fog.near = c.fn - 2; this.scene.fog.far = c.ff;
  },
  layout: function () {
    var iw = window.innerWidth, ih = window.innerHeight, narrow = iw / ih <= 1.1, sx = 0, sy = 0, zf = 1;
    var unitsH = 2 * Math.tan(25 * Math.PI / 180) * 6.3;
    if (narrow) { sy = ih * 0.23; zf = Math.max(1, 5.2 / (unitsH * iw / ih)); }
    else {
      var pw = Math.min(560, iw * 0.5), left = iw * 0.03 + pw + 16, fw = iw - left;
      sx = left + fw / 2 - iw / 2; zf = Math.max(1, 5.0 / (unitsH * fw / ih));
    }
    this.shift = { x: sx, y: sy }; this.zf = Math.min(3, zf);
  },
  applyOffset: function (k) {
    var iw = window.innerWidth, ih = window.innerHeight, sh = this.shift || { x: 0, y: 0 };
    if (!sh.x && !sh.y) { this.cam.clearViewOffset(); return; }
    this.cam.setViewOffset(iw, ih, -sh.x * k, sh.y * k, iw, ih);
  },
  setItem: function (def) {
    if (this.item) this.itemPos.remove(this.item);
    var sp = new THREE.Group(), w = buildWeapon(def), inner = new THREE.Group();
    inner.add(w);
    if (def.cls === 'knight') { inner.rotation.x = -Math.PI / 2; w.position.z = -0.6 * def.len; inner.scale.setScalar(0.95); }
    else if (def.cls === 'mage') { w.position.y = -0.6; inner.scale.setScalar(0.9); }
    else { inner.scale.setScalar(1.0); }
    sp.add(inner); this.itemPos.add(sp); this.item = sp; this.itemDef = def; this.itemW = w;
    var gc = def.glow || def.color;
    this.glowPlate.material.emissive.setHex(gc); this.glowPlate.material.color.setHex(gc);
    this.itemLight.color.setHex(gc); this.spark.material.color.setHex(gc); this.runeRing.material.color.setHex(gc);
    GFX.tag(sp, false); this.swap = 1;
  },
  speak: function (txt, hold) {
    var s = this.say; s.txt = txt; s.i = 0; s.acc = 0; s.hold = hold || 3.2; s.on = true; this.react = 1;
    var b = this.bubble(); b.style.opacity = 1; b.textContent = '';
  },
  rnd: function (a) { return a[Math.floor(Math.random() * a.length)]; },
  bubble: function () {
    var b = document.getElementById('keeperBubble');
    if (!b) { b = document.createElement('div'); b.id = 'keeperBubble'; document.body.appendChild(b); }
    return b;
  },
  enter: function (done) {
    this.tr = 0; this.trOn = true; this.out = null; this.done = done; this.said = false; this.rang = false; this.bubble().style.opacity = 0;
    Snd.sfx('door');
  },
  BYE: ['Приходи ещё... бубу...', 'Береги себя... бу-бу', 'Удачной охоты, воин... бу'],
  leave: function (cb) {
    if (this.out) return;
    this.trOn = false; this.out = { t: 0, cb: cb, faded: false, shut: false };
    this.speak(this.rnd(this.BYE), 1.4); Snd.sfx('door');
  },
  view: function (aspect) { this.cam.aspect = aspect; this.layout(); this.applyOffset(1); this.cam.updateProjectionMatrix(); },
  update: function (dt) {
    this.t += dt; var t = this.t, i, cam = this.cam, p = 1;
    var Z = 6.3 * this.zf, lx = -0.25, ok = 1;
    if (this.out) {
      var o = this.out; o.t += dt / 1.9; var q = Math.min(1, o.t), eo = q * q * (3 - 2 * q);
      cam.position.set(0.9 * (1 - eo) + 0.3 * eo, 2.5 - 0.5 * eo, Z + (12.5 - Z) * eo);
      lx = -0.25 * (1 - eo); ok = 1 - eo;
      var cl = Math.max(0, Math.min(1, (q - 0.3) / 0.45));
      for (i = 0; i < this.doors.length; i++) this.doors[i].p.rotation.y = -this.doors[i].s * (1 - cl * cl * (3 - 2 * cl)) * 1.7;
      if (q > 0.72 && !o.faded) { o.faded = true; UI.fade(true, 520); }
      if (q > 0.78 && !o.shut) { o.shut = true; Snd.sfx('slam'); }
      if (q >= 1) { var cb = o.cb; this.out = null; if (cb) cb(); }
    } else if (this.trOn) {
      this.tr += dt / 3.0; p = Math.min(1, this.tr); var e = p * p * (3 - 2 * p);
      cam.position.set(0.3 * (1 - e) + 0.9 * e, 2.0 + 0.5 * e, 12 * (1 - e) + Z * e); lx = -0.25 * e + 0.3 * (1 - e); ok = e;
      for (i = 0; i < this.doors.length; i++) this.doors[i].p.rotation.y = -this.doors[i].s * Math.min(1, p / 0.45) * 1.7;
      if (p > 0.45 && !this.rang) { this.rang = true; Snd.sfx('bell'); }
      if (p > 0.8 && !this.said) { this.said = true; this.speak(this.rnd(this.PH)); }
      if (p >= 1) { this.trOn = false; if (this.done) this.done(); }
    } else cam.position.set(0.9 + Math.sin(t * 0.3) * 0.12, 2.5 + Math.sin(t * 0.4) * 0.05, Z);
    this.applyOffset(ok);
    cam.lookAt(lx, 1.9, 0);
    for (i = 0; i < this.lamps.length; i++) { var l = this.lamps[i]; l.l.intensity = l.b * (0.85 + Math.sin(t * 9 + l.o) * 0.08 + Math.sin(t * 23 + l.o) * 0.06); }
    this.swap = Math.max(0, this.swap - dt * 1.5);
    var sw = this.swap, kk = 1 - sw, ob = 1 + 2.7 * Math.pow(kk - 1, 3) + 1.7 * Math.pow(kk - 1, 2);
    if (this.item) {
      this.item.rotation.y = t * 0.9 + sw * sw * 7; this.item.scale.setScalar(Math.max(0.01, ob));
      this.itemPos.position.y = 2.35 + Math.sin(t * 1.6) * 0.07; if (this.itemW.userData.anim) this.itemW.userData.anim(t);
      this.itemLight.intensity = 0.9 + sw * 3 + Math.sin(t * 3) * 0.1;
    }
    this.runeRing.rotation.z += dt * 0.35; this.runeRing.material.opacity = 0.55 + sw * 0.45; this.runeRing.scale.setScalar(1 + sw * 0.5);
    var sa = this.spark.geometry.attributes.position.array;
    for (i = 0; i < this.sparkN; i++) {
      var ph = i * 2.399, rr = 0.55 + (i % 5) * 0.12 + sw * (0.8 + (i % 3) * 0.3), sp2 = t * (0.8 + (i % 4) * 0.2) + ph;
      sa[i * 3] = -1.4 + Math.cos(sp2) * rr; sa[i * 3 + 1] = 1.4 + ((t * 0.35 + i * 0.137) % 1) * 2.4; sa[i * 3 + 2] = 0.7 + Math.sin(sp2) * rr;
    }
    this.spark.geometry.attributes.position.needsUpdate = true;
    for (i = 0; i < this.flames.length; i++) { var fq = 1 + Math.sin(t * 11 + i * 2) * 0.16; this.flames[i].scale.set(fq, 0.9 + (fq - 1) * 2.5, fq); }
    this.shaft.material.opacity = 0.06 + Math.sin(t * 0.5) * 0.02;
    this.chandelier.rotation.y = Math.sin(t * 0.4) * 0.15;
    if (this.glowPlate) this.glowPlate.material.opacity = 0.45 + Math.sin(t * 2.4) * 0.2;
    this.react = Math.max(0, this.react - dt * 2.5);
    this.keeper.position.y = Math.sin(t * 1.3) * 0.03 + this.react * 0.12;
    this.keeper.rotation.y = Math.sin(t * 0.5) * 0.08;
    this.animKeeper(t, dt);
    var blink = (t % 4.2) < 0.12 ? 0.1 : 1 + this.react * 0.5;
    for (i = 0; i < this.eyes.length; i++) this.eyes[i].scale.y = blink;
    this.speakTick(dt);
  },
  animKeeper: function (t, dt) {
    var kp = this.kp, r = this.react, sp = this.say.on && this.say.i < this.say.txt.length ? 1 : 0, i, a, w, p;
    kp.sp = (kp.sp || 0) + (sp - (kp.sp || 0)) * Math.min(1, dt * 6);
    var br = Math.sin(t * 1.6);
    kp.body.scale.set(1 + br * 0.008, 1 + br * 0.012, 1 + br * 0.008);
    kp.body.rotation.x = 0.03 + r * 0.06 + br * 0.008; kp.body.rotation.z = Math.sin(t * 0.7) * 0.02;
    var look = Math.sin(t * 0.45) * 0.28 + Math.sin(t * 0.17) * 0.15;
    kp.head.rotation.y = look * (1 - kp.sp * 0.6) + this.px * 0.25;
    kp.head.rotation.x = 0.06 + Math.sin(t * 0.9) * 0.03 + r * 0.12 + kp.sp * Math.sin(t * 11) * 0.035;
    kp.head.rotation.z = Math.sin(t * 0.6) * 0.04;
    kp.tip.rotation.x = 0.5 + Math.sin(t * 1.5) * 0.12 - r * 0.2;
    kp.tip2.rotation.x = 0.5 + Math.sin(t * 1.5 - 0.7) * 0.14;
    kp.tip3.rotation.x = 0.5 + Math.sin(t * 1.5 - 1.4) * 0.18;
    for (i = 0; i < kp.hem.length; i++) { p = kp.hem[i]; p.g.rotation.x = Math.sin(t * 1.4 + p.p) * 0.08 + 0.02; p.g.rotation.z = Math.sin(t * 1.1 + p.p * 1.7) * 0.05; }
    for (i = 0; i < 2; i++) {
      a = kp.arms[i]; w = a.s;
      if (w > 0) {
        var gest = kp.sp * (0.5 + 0.5 * Math.sin(t * 3.2)), fl = Math.max(r, kp.sp * 0.5);
        a.sh.rotation.x = -0.75 - gest * 0.55 - r * 0.5; a.sh.rotation.z = -0.18 - gest * 0.15;
        a.el.rotation.x = -0.85 - gest * 0.35 + Math.sin(t * 1.3) * 0.04; a.wr.rotation.x = 0.2 + Math.sin(t * 6) * 0.1 * kp.sp;
        a.wr.rotation.z = Math.sin(t * 2.4) * 0.2 * fl;
      } else {
        a.sh.rotation.x = -0.95 + Math.sin(t * 1.6 + 1) * 0.015; a.sh.rotation.z = 0.2;
        a.el.rotation.x = -0.75; a.wr.rotation.x = 0.15; a.wr.rotation.z = 0;
      }
      for (var j = 0; j < 3; j++) a.fg[j].rotation.x = 0.15 + Math.sin(t * 2.2 + j * 0.8 + i) * 0.25 + (w < 0 ? Math.sin(t * 3 + j) * 0.2 * (t % 7 < 1.2 ? 1 : 0) : 0);
    }
  },
  speakTick: function (dt) {
    var s = this.say, b = this.bubble();
    if (!s.on) return;
    if (s.i < s.txt.length) {
      s.acc += dt * 22;
      while (s.acc >= 1 && s.i < s.txt.length) {
        s.acc--; var ch = s.txt.charAt(s.i++);
        if (ch !== ' ' && ch !== '.' && ch !== ',' && s.i % 2 === 0) Snd.sfx('voice', 0.85 + Math.random() * 0.5);
      }
      b.textContent = s.txt.slice(0, s.i);
    } else { s.hold -= dt; if (s.hold <= 0) { s.on = false; b.style.opacity = 0; } }
    var v = new THREE.Vector3(0.9, 4.15, -1.2).project(this.cam);
    b.style.left = ((v.x * 0.5 + 0.5) * innerWidth) + 'px'; b.style.top = ((-v.y * 0.5 + 0.5) * innerHeight) + 'px';
  }
};
