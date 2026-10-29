var M = {
  gc: {},
  box: function (w, h, l) {
    var k = w + '_' + h + '_' + l;
    return this.gc[k] || (this.gc[k] = new THREE.BoxGeometry(w, h, l));
  },
  mesh: function (w, h, l, color, x, y, z, emi, list) {
    var m = new THREE.MeshLambertMaterial({ color: color });
    if (emi !== undefined && emi !== null) m.emissive = new THREE.Color(emi);
    var o = new THREE.Mesh(this.box(w, h, l), m);
    o.position.set(x || 0, y || 0, z || 0);
    o.castShadow = true;
    if (list) list.push(m);
    return o;
  },
  shadowGeo: null, shadowMat: null, blobOn: true,
  setShadowBlobs: function (on) { this.blobOn = on; if (this.shadowMat) this.shadowMat.visible = on; },
  shadow: function (r) {
    if (!this.shadowGeo) {
      this.shadowGeo = new THREE.CircleGeometry(1, 20); this.shadowGeo.rotateX(-Math.PI / 2);
      this.shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38, depthWrite: false }); this.shadowMat.visible = this.blobOn;
    }
    var s = new THREE.Mesh(this.shadowGeo, this.shadowMat);
    s.scale.set(r, 1, r); s.position.y = 0.03;
    return s;
  }
};

function buildHero(cls, wdef) {
  var g = new THREE.Group(), body = new THREE.Group(), h = { cls: cls };
  g.add(body);
  var pal = {
    knight: { main: 0x8c97a8, dark: 0x2e3442, acc: 0xd6a93a, cl: 0xb02a3a },
    mage: { main: 0x5a2fa0, dark: 0x2a1850, acc: 0xe8c850, cl: 0x3a1c78 },
    archer: { main: 0x3f7a42, dark: 0x3a2a1c, acc: 0xb08a50, cl: 0x2c5a30 }
  }[cls];
  function leg(x) {
    var p = new THREE.Group(); p.position.set(x, 0.85, 0);
    p.add(M.mesh(0.3, 0.55, 0.3, pal.dark, 0, -0.27, 0));
    p.add(M.mesh(0.34, 0.3, 0.36, cls === 'knight' ? pal.main : 0x4a3220, 0, -0.7, 0.03));
    body.add(p); return p;
  }
  h.legL = leg(-0.2); h.legR = leg(0.2);
  var torso = new THREE.Group();
  torso.add(M.mesh(0.8, 0.7, 0.46, pal.main, 0, 1.2, 0));
  torso.add(M.mesh(0.82, 0.14, 0.5, 0x5a3a24, 0, 0.88, 0));
  torso.add(M.mesh(0.2, 0.18, 0.52, pal.acc, 0, 0.88, 0));
  if (cls === 'knight') torso.add(M.mesh(0.4, 0.4, 0.06, pal.cl, 0, 1.2, 0.26, 0x330008));
  if (cls === 'mage') {
    torso.add(M.mesh(0.95, 0.5, 0.6, pal.main, 0, 0.62, 0));
    torso.add(M.mesh(0.99, 0.08, 0.64, pal.acc, 0, 0.4, 0, 0x443300));
    torso.add(M.mesh(0.12, 0.5, 0.06, pal.acc, 0, 1.2, 0.26, 0x443300));
  }
  if (cls === 'archer') {
    torso.add(M.mesh(0.12, 0.8, 0.5, 0x5a3a24, 0.1, 1.2, 0.01).rotateZ(0.6));
    torso.add(M.mesh(0.2, 0.55, 0.16, 0x4a3220, 0.15, 1.35, -0.34));
    for (var i = 0; i < 3; i++) torso.add(M.mesh(0.03, 0.22, 0.03, 0xdddddd, 0.1 + i * 0.05, 1.7, -0.34));
  }
  body.add(torso);
  var head = new THREE.Group(); head.position.y = 1.78;
  head.add(M.mesh(0.46, 0.46, 0.46, 0xe0b090, 0, 0, 0));
  if (cls === 'knight') {
    head.add(M.mesh(0.52, 0.28, 0.52, pal.main, 0, 0.14, 0));
    head.add(M.mesh(0.52, 0.12, 0.1, pal.main, 0, -0.02, 0.22));
    head.add(M.mesh(0.34, 0.07, 0.04, 0x66e8ff, 0, 0.0, 0.26, 0x33ccee));
    head.add(M.mesh(0.08, 0.3, 0.5, pal.cl, 0, 0.36, -0.02, 0x330008));
  } else if (cls === 'mage') {
    head.add(M.mesh(0.8, 0.07, 0.8, pal.dark, 0, 0.22, 0));
    head.add(M.mesh(0.5, 0.3, 0.5, pal.main, 0, 0.4, 0));
    head.add(M.mesh(0.32, 0.3, 0.32, pal.main, 0, 0.68, 0));
    head.add(M.mesh(0.15, 0.25, 0.15, pal.main, 0, 0.92, 0));
    head.add(M.mesh(0.06, 0.06, 0.04, 0x88ffff, -0.1, 0.0, 0.24, 0x44ddff));
    head.add(M.mesh(0.06, 0.06, 0.04, 0x88ffff, 0.1, 0.0, 0.24, 0x44ddff));
    head.add(M.mesh(0.4, 0.2, 0.1, 0xdddddd, 0, -0.28, 0.2));
  } else {
    head.add(M.mesh(0.54, 0.34, 0.54, pal.main, 0, 0.14, -0.02));
    head.add(M.mesh(0.5, 0.5, 0.2, pal.main, 0, -0.04, -0.2));
    head.add(M.mesh(0.2, 0.2, 0.2, pal.main, 0, 0.36, -0.05));
    head.add(M.mesh(0.06, 0.06, 0.04, 0x222222, -0.1, 0.0, 0.24));
    head.add(M.mesh(0.06, 0.06, 0.04, 0x222222, 0.1, 0.0, 0.24));
  }
  body.add(head); h.head = head;
  function shoulder(x) {
    var p = new THREE.Group(); p.position.set(x, 1.45, 0);
    if (cls === 'knight') p.add(M.mesh(0.3, 0.2, 0.4, pal.acc, x > 0 ? 0.05 : -0.05, 0.02, 0));
    p.add(M.mesh(0.22, 0.65, 0.22, cls === 'knight' ? pal.main : pal.cl, 0, -0.35, 0));
    p.add(M.mesh(0.24, 0.16, 0.24, cls === 'mage' ? 0xe0b090 : pal.dark, 0, -0.72, 0));
    body.add(p); return p;
  }
  h.armL = shoulder(-0.55); h.armR = shoulder(0.55);
  h.hand = new THREE.Group(); h.hand.position.set(0, -0.72, 0.05);
  h.handL = new THREE.Group(); h.handL.position.set(0, -0.72, 0.05);
  if (cls === 'archer') h.armL.add(h.handL); else h.armR.add(h.hand);
  h.cape = new THREE.Group(); h.cape.position.set(0, 1.5, -0.27);
  h.cape.add(M.mesh(0.7, 1.1, 0.05, pal.cl, 0, -0.55, -0.03, 0x110010));
  body.add(h.cape);
  h.body = body; h.g = g; h.weapon = null;
  g.add(M.shadow(0.7));
  setHeroWeapon(h, wdef);
  return h;
}

function setHeroWeapon(h, def) {
  var hand = h.cls === 'archer' ? h.handL : h.hand;
  if (h.weapon) hand.remove(h.weapon);
  h.weapon = buildWeapon(def); hand.add(h.weapon);
  h.wdef = def;
}

function animateHero(h, t, moving, swing) {
  var s = moving ? Math.sin(t * 11) : 0, cls = h.cls;
  h.legL.rotation.x = s * 0.8; h.legR.rotation.x = -s * 0.8;
  h.body.position.y = moving ? Math.abs(Math.sin(t * 11)) * 0.07 : Math.sin(t * 2) * 0.02;
  h.cape.rotation.x = moving ? 0.35 + Math.sin(t * 9) * 0.12 : 0.08 + Math.sin(t * 2) * 0.05;
  h.head.rotation.y = moving ? 0 : Math.sin(t * 0.8) * 0.15;
  if (h.weapon && h.weapon.userData.anim) h.weapon.userData.anim(t);
  var e = swing >= 0 ? swing * swing * (3 - 2 * swing) : 0;
  if (cls === 'knight') {
    h.armL.rotation.x = -s * 0.7;
    if (swing >= 0) {
      h.armR.rotation.x = -2.7 + 3.1 * e; h.armR.rotation.z = -0.15 * (1 - e); h.body.rotation.y = 0.35 - 0.7 * e;
    } else { h.armR.rotation.x = -0.6 + s * 0.4 + Math.sin(t * 2) * 0.04; h.armR.rotation.z = 0; h.body.rotation.y *= 0.8; }
  } else if (cls === 'mage') {
    h.armL.rotation.x = -s * 0.7;
    h.armR.rotation.x = -0.9 - (swing >= 0 ? Math.sin(e * Math.PI) * 0.7 : 0) + Math.sin(t * 2) * 0.03;
    h.hand.rotation.x = -h.armR.rotation.x + 0.15;
    h.body.rotation.y *= 0.8;
  } else {
    h.armL.rotation.x = -1.45; h.armL.rotation.z = 0.1;
    h.handL.rotation.x = 1.45;
    h.armR.rotation.x = swing >= 0 ? -1.2 - Math.sin(e * Math.PI) * 0.5 : -0.5 + s * 0.4;
    h.body.rotation.y = swing >= 0 ? -0.25 * Math.sin(e * Math.PI) : h.body.rotation.y * 0.8;
  }
}
