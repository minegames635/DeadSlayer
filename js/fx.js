var GFX = {
  P: {
    low:   { rs: 0.6,  sh: 0, smap: 0,    st: 0, fn: 9,  ff: 24, dc: 25,  pm: 0.3, ep: 30,  dust: 12, aniso: 1, fov: 0 },
    med:   { rs: 0.85, sh: 1, smap: 1024, st: 0, fn: 13, ff: 34, dc: 55,  pm: 0.65, ep: 70, dust: 28, aniso: 2, fov: 0 },
    high:  { rs: 1,    sh: 1, smap: 2048, st: 1, fn: 18, ff: 46, dc: 90,  pm: 1,   ep: 120, dust: 50, aniso: 4, fov: 0 },
    ultra: { rs: 1.35, sh: 1, smap: 4096, st: 2, fn: 24, ff: 64, dc: 110, pm: 1.5, ep: 200, dust: 50, aniso: 8, fov: 0 }
  },
  scenes: function () { return [World, Menu, Shop3D]; },
  cur: function () { return this.P[Save.d.gfx.q] || this.P.high; },
  shadowsOn: function () { return !!(this.cur().sh && Save.d.gfx.shadows); },
  // light shadow setup shared by all scenes
  light: function (l, size, area) {
    var c = this.cur(), on = this.shadowsOn();
    l.castShadow = on;
    if (!on) return;
    var sh = l.shadow;
    if (sh.mapSize.x !== size) { sh.mapSize.set(size, size); if (sh.map) { sh.map.dispose(); sh.map = null; } }
    sh.bias = -0.0006; sh.normalBias = 0.03; sh.radius = c.st === 0 ? 1 : 2.5;
    if (area && sh.camera.isOrthographicCamera) { var sc = sh.camera; sc.left = -area; sc.right = area; sc.top = area; sc.bottom = -area; sc.updateProjectionMatrix(); }
  },
  // every static Lambert mesh casts/receives; dynamic game meshes cast via M.mesh
  tag: function (root, recvAll) {
    root.traverse(function (o) {
      if (!o.isMesh || !o.material || !o.material.isMeshLambertMaterial || o.material.transparent) return;
      o.castShadow = true; if (recvAll) o.receiveShadow = true;
    });
  },
  refresh: function (scene) {
    scene.traverse(function (o) {
      if (!o.material) return;
      if (Array.isArray(o.material)) o.material.forEach(function (m) { m.needsUpdate = true; }); else o.material.needsUpdate = true;
    });
  },
  apply: function () {
    var c = this.cur(), g = Save.d.gfx, on = this.shadowsOn();
    renderer.setPixelRatio(Math.max(0.5, Math.min(2, devicePixelRatio) * c.rs));
    var type = [THREE.BasicShadowMap, THREE.PCFShadowMap, THREE.PCFSoftShadowMap][c.st];
    var changed = renderer.shadowMap.enabled !== on || renderer.shadowMap.type !== type;
    renderer.shadowMap.enabled = on; renderer.shadowMap.type = type;
    M.setShadowBlobs(!on);
    this.scenes().forEach(function (s) { if (s.setQuality) s.setQuality(c, on); });
    if (changed) this.scenes().forEach(function (s) { if (s.scene) GFX.refresh(s.scene); });
    var maxA = renderer.capabilities.getMaxAnisotropy();
    this.scenes().forEach(function (s) { if (s.scene) s.scene.traverse(function (o) { var m = o.material; if (m && m.map && m.map.anisotropy !== Math.min(c.aniso, maxA)) { m.map.anisotropy = Math.min(c.aniso, maxA); m.map.needsUpdate = true; } }); });
    $('vig').style.display = g.vig ? '' : 'none';
    $('fps').style.display = g.fps ? '' : 'none';
    resize();
  }
};

var FX = {
  parts: [], rings: [], slashes: [], beams: [], decals: [], arcGeo: {}, pg: null,
  init: function (scene) {
    this.pg = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    for (var i = 0; i < 260; i++) {
      var m = new THREE.Mesh(this.pg, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      m.visible = false; scene.add(m); this.parts.push({ m: m, life: 0, max: 1, vx: 0, vy: 0, vz: 0 });
    }
    var rg = new THREE.RingGeometry(0.85, 1, 40); rg.rotateX(-Math.PI / 2);
    for (i = 0; i < 12; i++) {
      var r = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      r.visible = false; scene.add(r); this.rings.push({ m: r, life: 0, max: 1, R: 1 });
    }
    var bg = new THREE.BoxGeometry(0.25, 12, 0.25);
    for (i = 0; i < 5; i++) {
      var b = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: 0xfff7a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      b.visible = false; scene.add(b); this.beams.push({ m: b, life: 0 });
    }
    var dg = new THREE.CircleGeometry(1, 10); dg.rotateX(-Math.PI / 2);
    for (i = 0; i < 40; i++) {
      var d = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ color: 0x3a0a14, transparent: true, opacity: 0.5, depthWrite: false }));
      d.visible = false; d.position.y = 0.02; scene.add(d); this.decals.push({ m: d, life: 0 });
    }
    for (i = 0; i < 6; i++) {
      var g = new THREE.Group(), s = new THREE.Mesh(this.arc(2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      s.rotation.x = -Math.PI / 2; g.add(s); g.visible = false; g.position.y = 0.6; scene.add(g);
      this.slashes.push({ g: g, s: s, life: 0, max: 0.25 });
    }
  },
  arc: function (a) {
    var k = Math.round(a * 10);
    return this.arcGeo[k] || (this.arcGeo[k] = new THREE.RingGeometry(0.45, 1, 28, 1, -a / 2, a));
  },
  bolt: function (x, z, color) {
    for (var i = 0; i < this.beams.length; i++) {
      var b = this.beams[i]; if (b.life > 0) continue;
      b.life = 0.28; b.m.material.color.set(color || 0xfff7a0); b.m.position.set(x, 6, z); b.m.visible = true; break;
    }
    this.ring(x, z, color || 0xfff7a0, 3, 0.35); this.burst(x, 0.5, z, color || 0xfff7a0, 12, 5);
  },
  decal: function (x, z, color, r) {
    var d = this.decals[this.dci = ((this.dci || 0) + 1) % this.decals.length];
    d.life = 14; d.m.material.color.set(color); d.m.scale.setScalar(r); d.m.position.x = x; d.m.position.z = z; d.m.rotation.y = Math.random() * 6; d.m.visible = true;
  },
  burst: function (x, y, z, color, n, spd) {
    n = Math.max(1, Math.round(n * GFX.cur().pm));
    var c = new THREE.Color(color);
    for (var i = 0, k = 0; i < this.parts.length && k < n; i++) {
      var p = this.parts[i]; if (p.life > 0) continue;
      var a = Math.random() * 6.283, s = (0.4 + Math.random()) * spd;
      p.vx = Math.cos(a) * s; p.vz = Math.sin(a) * s; p.vy = 2 + Math.random() * spd * 0.7;
      p.life = p.max = 0.4 + Math.random() * 0.4; p.m.position.set(x, y, z);
      p.m.material.color.copy(c); p.m.visible = true; k++;
    }
  },
  ring: function (x, z, color, R, dur) {
    for (var i = 0; i < this.rings.length; i++) {
      var r = this.rings[i]; if (r.life > 0) continue;
      r.life = r.max = dur || 0.45; r.R = R; r.m.material.color.set(color);
      r.m.position.set(x, 0.08, z); r.m.visible = true; return;
    }
  },
  slash: function (x, z, ang, range, arc, color) {
    for (var i = 0; i < this.slashes.length; i++) {
      var q = this.slashes[i]; if (q.life > 0) continue;
      q.life = q.max; q.s.geometry = this.arc(arc); q.s.scale.set(range, range, 1);
      q.s.material.color.set(color); q.g.position.x = x; q.g.position.z = z;
      q.g.rotation.y = ang - Math.PI / 2; q.g.visible = true; return;
    }
  },
  update: function (dt) {
    var i, p;
    for (i = 0; i < this.parts.length; i++) {
      p = this.parts[i]; if (p.life <= 0) continue;
      p.life -= dt; var m = p.m;
      if (p.life <= 0) { m.visible = false; continue; }
      p.vy -= 14 * dt; m.position.x += p.vx * dt; m.position.z += p.vz * dt; m.position.y = Math.max(0.05, m.position.y + p.vy * dt);
      m.scale.setScalar(p.life / p.max);
    }
    for (i = 0; i < this.rings.length; i++) {
      p = this.rings[i]; if (p.life <= 0) continue;
      p.life -= dt; if (p.life <= 0) { p.m.visible = false; continue; }
      var k = 1 - p.life / p.max; p.m.scale.setScalar(0.3 + k * p.R); p.m.material.opacity = 1 - k;
    }
    for (i = 0; i < this.beams.length; i++) {
      p = this.beams[i]; if (p.life <= 0) continue;
      p.life -= dt; if (p.life <= 0) { p.m.visible = false; continue; }
      p.m.material.opacity = p.life / 0.28; p.m.scale.x = p.m.scale.z = 0.6 + Math.random() * 0.8;
    }
    for (i = 0; i < this.decals.length; i++) {
      p = this.decals[i]; if (p.life <= 0) continue;
      p.life -= dt; if (p.life <= 0) p.m.visible = false; else if (p.life < 3) p.m.material.opacity = p.life / 6;
    }
    for (i = 0; i < this.slashes.length; i++) {
      p = this.slashes[i]; if (p.life <= 0) continue;
      p.life -= dt; if (p.life <= 0) { p.g.visible = false; continue; }
      p.s.material.opacity = (p.life / p.max) * 0.85;
    }
  }
};
