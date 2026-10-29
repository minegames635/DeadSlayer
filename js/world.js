var World = {
  scene: null, cam: null, aspect: 1.78, VH: 10, shake: 0, ground: null, decor: [], dl: null, pl: null, hw: 10, hd: 8,
  OFF: new THREE.Vector3(0, 14, 11),
  init: function () {
    var s = this.scene = new THREE.Scene();
    s.background = new THREE.Color(0x0b0812);
    s.fog = new THREE.Fog(0x0b0812, 18, 46);
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 120);
    s.add(new THREE.AmbientLight(0x6a5a90, 0.9));
    s.add(new THREE.HemisphereLight(0x8a7ab0, 0x201830, 0.5));
    var d = this.dl = new THREE.DirectionalLight(0xffe6c8, 0.8); d.position.set(6, 12, 5); s.add(d); s.add(d.target);
    this.pl = new THREE.PointLight(0xffb070, 1.0, 14); this.pl.position.y = 3; s.add(this.pl);
    var c = document.createElement('canvas'); c.width = c.height = 256;
    var x = c.getContext('2d');
    for (var i = 0; i < 4; i++) {
      var bx = (i % 2) * 128, by = Math.floor(i / 2) * 128, v = 40 + Math.random() * 18;
      x.fillStyle = 'rgb(' + v + ',' + (v - 4) + ',' + (v + 10) + ')'; x.fillRect(bx, by, 128, 128);
      for (var j = 0; j < 40; j++) { var w = 8 + Math.random() * 20; x.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '0,0,0' : '255,255,255') + ',0.05)'; x.fillRect(bx + Math.random() * 120, by + Math.random() * 120, w, w); }
    }
    x.strokeStyle = '#0d0a14'; x.lineWidth = 4; x.strokeRect(2, 2, 252, 252);
    x.beginPath(); x.moveTo(128, 0); x.lineTo(128, 256); x.moveTo(0, 128); x.lineTo(256, 128); x.stroke();
    x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 2;
    for (i = 0; i < 4; i++) { x.beginPath(); var px = Math.random() * 256, py = Math.random() * 256; x.moveTo(px, py); for (j = 0; j < 4; j++) { px += (Math.random() - 0.5) * 40; py += (Math.random() - 0.5) * 40; x.lineTo(px, py); } x.stroke(); }
    for (i = 0; i < 10; i++) { x.fillStyle = 'rgba(60,110,50,' + (0.12 + Math.random() * 0.15) + ')'; x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 9, 0, 7); x.fill(); }
    var tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(40, 40);
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshLambertMaterial({ map: tex }));
    this.ground.rotation.x = -Math.PI / 2; s.add(this.ground);
    for (i = 0; i < 110; i++) this.mkDecor();
    var sc = d.shadow.camera; sc.near = 1; sc.far = 40;
    this.decor.forEach(function (o) { GFX.tag(o.g, true); });
    this.ground.receiveShadow = true;
    this.resize(1.78);
  },
  mkDecor: function () {
    var g = new THREE.Group(), r = Math.random(), L = [];
    if (r < 0.3) { g.add(M.mesh(0.7, 1.1, 0.25, 0x5a5a68, 0, 0.55, 0)); g.add(M.mesh(0.4, 0.2, 0.28, 0x6a6a78, 0, 1.2, 0)); }
    else if (r < 0.52) { var rk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.4, 0), new THREE.MeshLambertMaterial({ color: 0x4a4658 })); rk.position.y = 0.3; g.add(rk); }
    else if (r < 0.7) { g.add(M.mesh(0.3, 2.2, 0.3, 0x3a2a22, 0, 1.1, 0)); g.add(M.mesh(0.12, 1.0, 0.12, 0x3a2a22, 0.4, 1.8, 0)); g.children[1].rotation.z = -0.9; g.add(M.mesh(0.12, 0.8, 0.12, 0x3a2a22, -0.35, 1.5, 0)); g.children[2].rotation.z = 0.8; }
    else if (r < 0.85) { var cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), new THREE.MeshLambertMaterial({ color: 0x8a5cff, emissive: 0x4a22aa })); cr.scale.y = 1.8; cr.position.y = 0.9; g.add(cr); }
    else { g.add(M.mesh(0.9, 1.8, 0.9, 0x4a4658, 0, 0.9, 0)); g.add(M.mesh(1.1, 0.2, 1.1, 0x5a5668, 0, 1.85, 0)); }
    g.rotation.y = Math.random() * 6;
    this.scene.add(g);
    this.decor.push({ g: g, x: (Math.random() - 0.5) * 90, z: (Math.random() - 0.5) * 90 });
  },
  setQuality: function (c, on) {
    this.dcount = c.dc;
    GFX.light(this.dl, c.smap || 1024, 17);
    this.scene.fog.near = c.fn; this.scene.fog.far = c.ff;
  },
  mood: function (w) {
    var k = Math.min(1, (w - 1) / 14), c = new THREE.Color(0x0b0812).lerp(new THREE.Color(0x200810), k);
    this.scene.background.copy(c); this.scene.fog.color.copy(c);
  },
  resize: function (a) {
    this.aspect = a; var h = this.VH, w = h * a, c = this.cam;
    c.left = -w; c.right = w; c.top = h; c.bottom = -h; c.updateProjectionMatrix();
    this.hw = w * 1.1 + 2; this.hd = h * 1.5 + 2;
  },
  update: function (dt, px, pz) {
    var c = this.cam, o = this.OFF;
    this.shake = Math.max(0, this.shake - dt * 2.5);
    var sx = (Math.random() - 0.5) * this.shake, sz = (Math.random() - 0.5) * this.shake;
    c.position.set(px + o.x + sx, o.y, pz + o.z + sz);
    c.lookAt(px + sx, 0, pz + sz);
    this.ground.position.set(Math.round(px / 4) * 4, 0, Math.round(pz / 4) * 4);
    this.dl.position.set(px + 6, 12, pz + 5); this.dl.target.position.set(px, 0, pz);
    this.pl.position.x = px; this.pl.position.z = pz + 1;
    var dn = Math.min(this.decor.length, this.dcount || 90);
    for (var i = 0; i < this.decor.length; i++) {
      var d = this.decor[i]; d.g.visible = i < dn; if (i >= dn) continue;
      var dx = ((d.x - px + 45) % 90 + 90) % 90 - 45, dz = ((d.z - pz + 45) % 90 + 90) % 90 - 45;
      d.g.position.set(px + dx, 0, pz + dz);
    }
  }
};
