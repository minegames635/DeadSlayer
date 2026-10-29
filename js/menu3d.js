var Menu = {
  scene: null, cam: null, hero: null, stage: null, rune: null, torches: [], embers: null, ep: null,
  mx: 0, my: 0, mode: 'menu', aspect: 1.78, atk: 0, tx: 0,
  glowTex: function (c1, c2) {
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  },
  init: function () {
    var s = this.scene = new THREE.Scene();
    s.fog = new THREE.FogExp2(0x120a22, 0.012);
    this.cam = new THREE.PerspectiveCamera(40, 1.78, 0.1, 400);
    var sky = new THREE.Mesh(new THREE.SphereGeometry(180, 24, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying float h;void main(){vec3 a=vec3(.16,.05,.22),b=vec3(.03,.03,.10),c=vec3(.01,.01,.04);float k=clamp(h,0.,1.);vec3 col=mix(a,b,smoothstep(0.,.35,k));col=mix(col,c,smoothstep(.3,.9,k));gl_FragColor=vec4(col,1.);}'
    }));
    s.add(sky);
    var sp = new Float32Array(900 * 3);
    for (var i = 0; i < 900; i++) {
      var a = Math.random() * Math.PI * 2, e = Math.random() * 1.3 + 0.1, r = 170;
      sp[i * 3] = Math.cos(a) * Math.cos(e) * r; sp[i * 3 + 1] = Math.sin(e) * r; sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
    }
    var sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    s.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, sizeAttenuation: false, fog: false })));
    var moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex('rgba(255,240,210,1)', 'rgba(255,200,150,0)'), fog: false, blending: THREE.AdditiveBlending, depthWrite: false }));
    moon.scale.set(40, 40, 1); moon.position.set(-22, 22, -90); s.add(moon);
    var disc = new THREE.Mesh(new THREE.CircleGeometry(6, 32), new THREE.MeshBasicMaterial({ color: 0xfff1d6, fog: false }));
    disc.position.set(-22, 22, -89); s.add(disc);
    var mm = new THREE.MeshBasicMaterial({ color: 0x1a1030 });
    for (i = 0; i < 16; i++) {
      var an = -Math.PI * (0.1 + 0.8 * i / 15), R = 70 + Math.random() * 15, hh = 14 + Math.random() * 20;
      var m = new THREE.Mesh(new THREE.ConeGeometry(9 + Math.random() * 7, hh, 5), mm);
      m.position.set(Math.cos(an) * R, hh / 2 - 3, Math.sin(an) * R); s.add(m);
    }
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ color: 0x15101f }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.52; s.add(ground);
    var st = this.stage = new THREE.Group(); s.add(st);
    var plat = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.6, 0.5, 40), new THREE.MeshLambertMaterial({ color: 0x3a3548 }));
    plat.position.y = -0.25; st.add(plat);
    var rc = document.createElement('canvas'); rc.width = rc.height = 256;
    var x = rc.getContext('2d'); x.strokeStyle = '#9a6bff'; x.lineWidth = 4;
    [120, 100, 70].forEach(function (r) { x.beginPath(); x.arc(128, 128, r, 0, 7); x.stroke(); });
    for (i = 0; i < 12; i++) {
      var q = i / 12 * Math.PI * 2; x.save(); x.translate(128 + Math.cos(q) * 110, 128 + Math.sin(q) * 110); x.rotate(q);
      x.strokeRect(-7, -7, 14, 14); x.beginPath(); x.moveTo(-7, 7); x.lineTo(7, -7); x.stroke(); x.restore();
    }
    x.beginPath(); for (i = 0; i < 6; i++) { var b = i / 6 * Math.PI * 2 - 1.57; x.lineTo(128 + Math.cos(b) * 70, 128 + Math.sin(b) * 70); } x.closePath(); x.stroke();
    this.rune = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(rc), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.rune.rotation.x = -Math.PI / 2; this.rune.position.y = 0.02; st.add(this.rune);
    this.torches = [];
    [-3.9, 3.9].forEach(function (px) {
      var p = new THREE.Group(); p.position.set(px, 0, -1.2);
      p.add(M.mesh(0.22, 2.2, 0.22, 0x3a2a20, 0, 1.1, 0));
      p.add(M.mesh(0.4, 0.2, 0.4, 0x222, 0, 2.25, 0));
      var f = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 6), new THREE.MeshBasicMaterial({ color: 0xff8a2a }));
      f.position.y = 2.65; p.add(f);
      var l = new THREE.PointLight(0xff8a3a, 1.6, 12); l.position.y = 2.7; p.add(l);
      st.add(p); Menu.torches.push({ f: f, l: l });
    });
    s.add(new THREE.AmbientLight(0x5a4a80, 0.9));
    var dl = this.sun = new THREE.DirectionalLight(0xffe2c0, 0.9); dl.position.set(3, 7, 6); st.add(dl); st.add(dl.target);
    dl.shadow.camera.near = 1; dl.shadow.camera.far = 30;
    var rim = new THREE.DirectionalLight(0x8a5cff, 1.2); rim.position.set(-4, 3, -5); s.add(rim);
    var up = new THREE.PointLight(0x9a6bff, 1.2, 10); up.position.set(0, 0.4, 1.5); st.add(up);
    this.setHero(Save.d.cls, WP(Save.d.eq[Save.d.cls]));
    this.extras(s);
    var N = 200; this.ep = []; var pp = new Float32Array(N * 3);
    for (i = 0; i < N; i++) { this.ep.push({ x: (Math.random() - 0.5) * 16, y: Math.random() * 8, z: (Math.random() - 0.5) * 10 - 2, v: 0.3 + Math.random() * 0.8 }); }
    var eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    eg.setDrawRange(0, 120);
    this.embers = new THREE.Points(eg, new THREE.PointsMaterial({ color: 0xffa04a, size: 0.12, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.add(this.embers);
    ground.receiveShadow = true; plat.receiveShadow = true; GFX.tag(this.stage, true);
    this.introT = 0;
    window.addEventListener('mousemove', function (e) { Menu.mx = e.clientX / innerWidth - 0.5; Menu.my = e.clientY / innerHeight - 0.5; });
  },
  setHero: function (cls, def) {
    if (this.hero) this.stage.remove(this.hero.g);
    this.hero = buildHero(cls, def); this.hero.g.scale.setScalar(1.7); this.stage.add(this.hero.g); this.pop = 0.4;
  },
  extras: function (s) {
    var cm = new THREE.MeshBasicMaterial({ color: 0x0d0818 }), c = new THREE.Group(), wm = new THREE.MeshBasicMaterial({ color: 0xffc66a });
    c.position.set(26, -2, -75);
    [[0, 0, 14, 22], [-11, 0, 7, 30], [11, 0, 7, 34], [0, 0, 5, 38]].forEach(function (t) {
      var b = new THREE.Mesh(new THREE.BoxGeometry(t[2], t[3], t[2]), cm); b.position.set(t[0], t[3] / 2, t[1]); c.add(b);
      var r = new THREE.Mesh(new THREE.ConeGeometry(t[2] * 0.75, t[2] * 1.2, 4), cm); r.position.set(t[0], t[3] + t[2] * 0.5, t[1]); r.rotation.y = 0.78; c.add(r);
      var w = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.2), wm); w.position.set(t[0], t[3] * 0.65, t[2] / 2 + 0.1); c.add(w);
    });
    s.add(c);
    this.bats = [];
    var bm = new THREE.MeshBasicMaterial({ color: 0x050308, side: THREE.DoubleSide });
    for (var i = 0; i < 7; i++) {
      var g = new THREE.Group(), l = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.35), bm), r = l.clone();
      l.position.x = -0.45; r.position.x = 0.45; g.add(l); g.add(r); g.l = l; g.r = r; g.ph = Math.random() * 6; g.rad = 7 + Math.random() * 8; g.hy = 5 + Math.random() * 6; g.sp = 0.4 + Math.random() * 0.5;
      s.add(g); this.bats.push(g);
    }
    var rm = new THREE.MeshBasicMaterial({ color: 0x9a6bff, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    this.rays = [];
    for (i = 0; i < 4; i++) {
      var ry = new THREE.Mesh(new THREE.PlaneGeometry(1.6 + i * 0.5, 16), rm.clone()); ry.position.set(-6 + i * 4, 7, -5 - i); ry.rotation.z = 0.35; s.add(ry); this.rays.push(ry);
    }
    this.grave(s);
    this.ltn = 0; this.ltT = 4; this.amb = s.children.filter(function (o) { return o.isAmbientLight; })[0];
  },
  setQuality: function (c, on) {
    this.q = c;
    GFX.light(this.sun, c.smap || 1024, 7);
    this.scene.fog.density = c.rs < 0.7 ? 0.02 : 0.012;
    if (this.embers) this.embers.geometry.setDrawRange(0, c.ep);
    if (this.mist) this.mist.forEach(function (m, i) { m.visible = i < (c.rs < 0.7 ? 3 : c.rs < 1 ? 6 : 10); });
  },
  intro: function () { this.introT = 0; },
  grave: function (s) {
    var self = this, stone = new THREE.MeshLambertMaterial({ color: 0x3c3a4a }), dark = new THREE.MeshLambertMaterial({ color: 0x1b1626 });
    function rnd(a, b) { return a + Math.random() * (b - a); }
    var G = new THREE.Group(); s.add(G);
    for (var i = 0; i < 26; i++) {
      var x = rnd(-17, 17), z = rnd(-16, 2);
      if (Math.abs(x) < 5.2 && z > -4) { i--; continue; }
      var g = new THREE.Group(), k = Math.random();
      if (k < 0.55) {
        var b = new THREE.Mesh(M.box(0.9, 1.3, 0.24), stone); b.position.y = 0.65; g.add(b);
        var t = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.24, 14, 1, false, 0, Math.PI), stone); t.rotation.set(Math.PI / 2, 0, Math.PI / 2); t.position.y = 1.3; t.rotation.x = Math.PI / 2; g.add(t);
      } else if (k < 0.85) {
        g.add(M.mesh(0.22, 1.7, 0.2, 0x4a4658, 0, 0.85, 0)); g.add(M.mesh(0.9, 0.22, 0.2, 0x4a4658, 0, 1.25, 0));
      } else {
        g.add(M.mesh(1.3, 0.35, 0.7, 0x35323f, 0, 0.17, 0)); g.add(M.mesh(1.0, 0.25, 0.5, 0x3c3a4a, 0, 0.45, 0));
      }
      g.position.set(x, -0.5, z); g.rotation.y = rnd(-0.5, 0.5); g.rotation.z = rnd(-0.12, 0.12); G.add(g);
    }
    for (i = 0; i < 9; i++) {
      var tr = new THREE.Group(), h = rnd(5, 9), tx = rnd(-30, 30), tz = rnd(-34, -14);
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.4, h, 6), dark); trunk.position.y = h / 2; tr.add(trunk);
      for (var j = 0; j < 4; j++) {
        var br = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.14, rnd(2, 3.4), 5), dark);
        br.position.set(rnd(-0.5, 0.5), h * rnd(0.5, 0.9), 0); br.rotation.z = rnd(0.6, 1.1) * (j % 2 ? 1 : -1); br.rotation.y = rnd(0, 6); tr.add(br);
      }
      tr.position.set(tx, -0.5, tz); G.add(tr);
    }
    GFX.tag(G, true);
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d');
    var fg = x.createRadialGradient(64, 64, 0, 64, 64, 64); fg.addColorStop(0, 'rgba(150,130,190,.55)'); fg.addColorStop(1, 'rgba(150,130,190,0)');
    x.fillStyle = fg; x.fillRect(0, 0, 128, 128);
    var ft = new THREE.CanvasTexture(c);
    this.mist = [];
    for (i = 0; i < 10; i++) {
      var m = new THREE.Sprite(new THREE.SpriteMaterial({ map: ft, transparent: true, opacity: rnd(0.12, 0.26), depthWrite: false, fog: false, color: i % 3 ? 0x8a78b8 : 0x6a8ab0 }));
      m.scale.set(rnd(12, 20), rnd(2.5, 4), 1); m.position.set(rnd(-22, 22), rnd(0.2, 1.2), rnd(-14, 3)); m.userData.sp = rnd(0.15, 0.4) * (i % 2 ? 1 : -1);
      s.add(m); this.mist.push(m);
    }
  },
  setSword: function () {},
  setMode: function (m) { this.mode = m; this.layout(); },
  resize: function (a) { this.aspect = a; this.cam.aspect = a; this.cam.updateProjectionMatrix(); this.layout(); },
  layout: function () {
    var hw = Math.tan(20 * Math.PI / 180) * 9.5 * this.aspect;
    this.tx = this.aspect < 1 ? 0 : hw * (this.mode === 'shop' ? 0.56 : 0.42);
  },
  update: function (dt, t) {
    var st = this.stage;
    st.position.x += (this.tx - st.position.x) * Math.min(1, dt * 4);
    this.rune.rotation.z += dt * 0.25;
    this.torches.forEach(function (o, i) {
      var k = 1 + Math.sin(t * 13 + i * 2) * 0.12 + Math.sin(t * 7.3 + i) * 0.08;
      o.l.intensity = 1.6 * k; o.f.scale.set(k, 0.9 + (k - 1) * 3, k);
    });
    this.atk -= dt; var sw = -1;
    var per = this.mode === 'shop' ? 2.4 : 4;
    if (this.atk < -per) this.atk = 0.9;
    if (this.atk > 0) sw = 1 - this.atk / 0.9;
    var hero = this.hero;
    animateHero(hero, t, false, sw);
    hero.g.position.y = 0.0;
    hero.g.rotation.y += ((this.mx * -1.4 + 0.25) - hero.g.rotation.y) * Math.min(1, dt * 3);
    var pos = this.embers.geometry.attributes.position.array;
    for (var i = 0; i < this.ep.length; i++) {
      var e = this.ep[i]; e.y += e.v * dt; e.x += Math.sin(t + i) * dt * 0.3;
      if (e.y > 8) { e.y = 0; e.x = (Math.random() - 0.5) * 16; }
      pos[i * 3] = e.x; pos[i * 3 + 1] = e.y; pos[i * 3 + 2] = e.z;
    }
    this.embers.geometry.attributes.position.needsUpdate = true;
    var self = this;
    this.bats.forEach(function (g, i) {
      var a = t * g.sp + g.ph; g.position.set(Math.cos(a) * g.rad, g.hy + Math.sin(t * 2 + i) * 0.8, -4 + Math.sin(a) * g.rad * 0.6 - 8);
      g.rotation.y = -a; var f = Math.sin(t * 14 + i) * 0.7; g.l.rotation.z = f; g.r.rotation.z = -f;
    });
    this.rays.forEach(function (r, i) { r.material.opacity = 0.05 + 0.04 * Math.sin(t * 0.6 + i * 1.7); });
    this.ltT -= dt; if (this.ltT < 0) { this.ltT = 4 + Math.random() * 6; this.ltn = 1; }
    this.ltn = Math.max(0, this.ltn - dt * 3); this.amb.intensity = 0.9 + this.ltn * 1.6 * (Math.random() > 0.3 ? 1 : 0.4);
    if (this.pop > 0) { this.pop -= dt; this.hero.g.scale.setScalar(1.7 * (1 + Math.sin(Math.max(0, this.pop) / 0.4 * 3.14) * 0.12)); }
    if (this.mist) for (i = 0; i < this.mist.length; i++) { var mm = this.mist[i]; mm.position.x += mm.userData.sp * dt; if (mm.position.x > 26) mm.position.x = -26; if (mm.position.x < -26) mm.position.x = 26; }
    this.introT += dt;
    var ik = Math.min(1, this.introT / 2.4), ie = 1 - Math.pow(1 - ik, 3);
    var c = this.cam;
    c.position.x += (this.mx * 1.2 - c.position.x) * Math.min(1, dt * 2);
    c.position.y = 2.4 - this.my * 0.8 + (1 - ie) * 1.8; c.position.z = 9.5 + (1 - ie) * 7;
    c.lookAt(0, 1.7 + (1 - ie) * 0.8, 0);
  }
};
