function buildZombie(type, def) {
  var g = new THREE.Group(), body = new THREE.Group(), z = { mats: [], g: g, body: body };
  g.add(body);
  var L = z.mats, sk = def.skin, cl = def.cloth;
  function leg(x) {
    var p = new THREE.Group(); p.position.set(x, 0.8, 0);
    p.add(M.mesh(0.3, 0.8, 0.3, cl, 0, -0.4, 0, null, L));
    body.add(p); return p;
  }
  var wide = type === 'brute' || type === 'armored' ? 1.25 : (type === 'runner' ? 0.8 : 1);
  z.legL = leg(-0.2); z.legR = leg(0.2);
  body.add(M.mesh(0.8 * wide, 0.75, 0.42, cl, 0, 1.18, 0, null, L));
  if (type === 'boomer') {
    body.add(M.mesh(1.0, 0.8, 0.8, 0xd05a1a, 0, 1.1, 0.1, 0x551100));
    body.add(M.mesh(0.12, 0.2, 0.12, 0xffee55, 0, 1.62, 0.1, 0xffcc00));
  }
  if (type === 'spitter') body.add(M.mesh(0.5, 0.4, 0.1, 0x9aff55, 0, 1.25, 0.25, 0x55cc22));
  if (type === 'armored') {
    body.add(M.mesh(0.95, 0.6, 0.5, 0x9aa2ac, 0, 1.25, 0, null, L));
    body.add(M.mesh(0.6, 0.18, 0.6, 0x9aa2ac, 0, 2.0, 0, null, L));
  }
  if (type === 'necro') {
    body.add(M.mesh(0.95, 0.9, 0.55, 0x2a1038, 0, 0.75, 0, 0x110022, L));
    body.add(M.mesh(0.1, 1.9, 0.1, 0x3a2a2a, 0.75, 1.0, 0.3));
    body.add(M.mesh(0.26, 0.26, 0.26, 0xb060ff, 0.75, 2.05, 0.3, 0x9933ee));
  }
  var head = new THREE.Group(); head.position.y = 1.85;
  head.add(M.mesh(0.5, 0.5, 0.5, sk, 0, 0, 0, null, L));
  if (type === 'necro') {
    head.add(M.mesh(0.62, 0.34, 0.62, 0x2a1038, 0, 0.2, -0.02, 0x110022));
    head.add(M.mesh(0.22, 0.3, 0.22, 0x2a1038, 0, 0.5, -0.05, 0x110022));
  }
  head.add(M.mesh(0.1, 0.08, 0.05, 0xff2222, -0.12, 0.05, 0.26, 0xff0000));
  head.add(M.mesh(0.1, 0.08, 0.05, 0xff2222, 0.12, 0.05, 0.26, 0xff0000));
  head.add(M.mesh(0.26, 0.07, 0.04, 0x2a0a0a, 0, -0.14, 0.26));
  if (def.boss) {
    for (var i = -2; i <= 2; i++) head.add(M.mesh(0.08, 0.22 + (2 - Math.abs(i)) * 0.08, 0.08, 0xffc933, i * 0.1, 0.35, 0, 0x886600));
    head.add(M.mesh(0.1, 0.35, 0.1, 0xddd, -0.3, 0.3, 0)); head.add(M.mesh(0.1, 0.35, 0.1, 0xddd, 0.3, 0.3, 0));
  }
  body.add(head); z.head = head;
  function arm(x) {
    var p = new THREE.Group(); p.position.set(x, 1.5, 0);
    p.add(M.mesh(0.22, 0.7, 0.22, sk, 0, -0.32, 0, null, L));
    p.rotation.x = -1.35; body.add(p); return p;
  }
  z.armL = arm(-0.55 * wide); z.armR = arm(0.55 * wide);
  g.add(M.shadow(0.7));
  g.scale.setScalar(def.scale);
  z.base = 0; z.float = type === 'wraith';
  if (type === 'wraith') {
    z.base = 0.22;
    L.forEach(function (m) { m.transparent = true; m.opacity = 0.62; m.emissive.setRGB(0.22, 0.22 * 0.9, 0.22 * 0.9); });
  }
  return z;
}

function animateZombie(z, t, ph, speed) {
  var s = Math.sin(t * (4 + speed * 1.6) + ph);
  z.legL.rotation.x = s * 0.7; z.legR.rotation.x = -s * 0.7;
  z.armL.rotation.x = -1.35 + s * 0.15; z.armR.rotation.x = -1.35 - s * 0.15;
  z.body.position.y = z.float ? 0.35 + Math.sin(t * 3 + ph) * 0.15 : Math.abs(s) * 0.06;
  z.head.rotation.z = Math.sin(t * 2 + ph) * 0.12;
}

function flashZombie(z, k) {
  var e = Math.max(k, z.base || 0);
  for (var i = 0; i < z.mats.length; i++) z.mats[i].emissive.setRGB(e, e * 0.9, e * 0.9);
}
