var projGeo = null;

function fireProj(x, z, ang, dmg, speed, range, pierce, aoe, color, noHome, target) {
  speed *= Cheat.v.psp;
  if (!projGeo) projGeo = new THREE.SphereGeometry(0.2, 8, 8);
  var m = new THREE.Group();
  var core = new THREE.Mesh(projGeo, new THREE.MeshBasicMaterial({ color: color }));
  var glow = new THREE.Mesh(projGeo, new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.setScalar(2.2); m.add(core); m.add(glow);
  if (!aoe) { core.scale.set(0.45, 0.45, 2.4); core.rotation.y = ang; glow.scale.set(1, 1, 3.5); glow.rotation.y = ang; }
  m.position.set(x, 1.2, z); m.scale.setScalar(Cheat.v.size); World.scene.add(m);
  G.projs.push({ m: m, x: x, z: z, vx: Math.sin(ang) * speed, vz: Math.cos(ang) * speed, sp: speed, dmg: dmg, left: range, pierce: pierce, aoe: aoe, color: color, hit: [], tg: target || null, trail: 0 });
}

function fireVolley() {
  var p = G.p, w = S.w, n = 1 + S.multi + Cheat.v.multi, sp = w.ps * S.psM, i;
  var man = Save.d.atk === 'manual', tg0 = man ? null : nearest(p.x, p.z, S.range); if (!man && !tg0) return;
  if (S.cls === 'mage') {
    Snd.sfx('magic'); var used = [];
    for (i = 0; i < n; i++) {
      var t = man ? null : (i === 0 ? tg0 : (nearest(p.x, p.z, S.range, used) || tg0)); used.push(t);
      var a = man ? p.ang + (i - (n - 1) / 2) * 0.22 : Math.atan2(t.x - p.x, t.z - p.z) + (i && t === tg0 ? (i % 2 ? 0.3 : -0.3) : 0);
      fireProj(p.x + Math.sin(a) * 0.8, p.z + Math.cos(a) * 0.8, a, S.dmg, sp, S.range * 1.3, 0, w.aoe * S.aoeM, w.color, false, t);
    }
  } else {
    Snd.sfx('bow'); var a0 = man ? p.ang : Math.atan2(tg0.x - p.x, tg0.z - p.z);
    for (i = 0; i < n; i++) {
      var a = a0 + (i - (n - 1) / 2) * 0.18;
      fireProj(p.x + Math.sin(a) * 0.8, p.z + Math.cos(a) * 0.8, a, S.dmg, sp, S.range * 1.15, (w.pierce || 1) + S.pierce, 0, w.color);
    }
  }
}

function projBlast(pr, x, z) {
  FX.ring(x, z, pr.color, pr.aoe * 1.6, 0.4); FX.burst(x, 1, z, pr.color, 16, 6);
  Snd.sfx('boom'); World.shake = Math.max(World.shake, 0.12);
  for (var i = G.enemies.length - 1; i >= 0; i--) {
    var e = G.enemies[i], dx = e.x - x, dz = e.z - z, r = pr.aoe + e.def.r;
    if (dx * dx + dz * dz < r * r) { var n = Math.sqrt(dx * dx + dz * dz) || 1; hitBurn(e); damageEnemy(e, pr.dmg * (0.9 + Math.random() * 0.2), dx / n, dz / n, 4); }
  }
}

function hitBurn(e) { if (S.burn > 0) { e.burnT = 3; e.burnD = S.burn; } }

function updateProjs(dt) {
  for (var i = G.projs.length - 1; i >= 0; i--) {
    var pr = G.projs[i], m = pr.m, dead = false;
    if (pr.aoe && pr.tg) {
      if (G.enemies.indexOf(pr.tg) < 0) pr.tg = nearest(pr.x, pr.z, 14);
      if (pr.tg) {
        var ta = Math.atan2(pr.tg.x - pr.x, pr.tg.z - pr.z), ca = Math.atan2(pr.vx, pr.vz), na = ca + angDiff(ta, ca) * Math.min(1, dt * 6);
        pr.vx = Math.sin(na) * pr.sp; pr.vz = Math.cos(na) * pr.sp;
      }
    }
    var sx = pr.vx * dt, sz = pr.vz * dt;
    pr.x += sx; pr.z += sz; pr.left -= pr.sp * dt; m.position.x = pr.x; m.position.z = pr.z;
    pr.trail -= dt; if (pr.trail <= 0) { pr.trail = 0.05; FX.burst(pr.x, 1.2, pr.z, pr.color, 1, 0.6); }
    for (var j = G.enemies.length - 1; j >= 0 && !dead; j--) {
      var e = G.enemies[j]; if (pr.hit.indexOf(e) >= 0) continue;
      var dx = e.x - pr.x, dz = e.z - pr.z, r = e.def.r + 0.35 * Cheat.v.size;
      if (dx * dx + dz * dz < r * r) {
        if (pr.aoe) { projBlast(pr, pr.x, pr.z); dead = true; }
        else {
          pr.hit.push(e); hitBurn(e); var n = Math.sqrt(dx * dx + dz * dz) || 1;
          damageEnemy(e, pr.dmg * (0.9 + Math.random() * 0.2), pr.vx / pr.sp, pr.vz / pr.sp, 3);
          if (--pr.pierce < 0) dead = true;
        }
      }
    }
    if (pr.left <= 0) { if (pr.aoe) projBlast(pr, pr.x, pr.z); dead = true; }
    if (dead) { World.scene.remove(m); G.projs.splice(i, 1); }
  }
}

function updateBlades(dt) {
  if (S.blades !== G.bladeN) {
    if (G.blades) World.scene.remove(G.blades);
    G.blades = new THREE.Group();
    for (var i = 0; i < S.blades; i++) {
      var b = new THREE.Group();
      b.add(M.mesh(0.12, 0.16, 1.0, 0xbfe8ff, 0, 0, 0, 0x3388cc));
      b.add(M.mesh(0.3, 0.1, 0.1, 0xd6a93a, 0, 0, -0.5));
      G.blades.add(b);
    }
    World.scene.add(G.blades); G.bladeN = S.blades;
  }
  if (!G.blades) return;
  G.bladeA += dt * 3.2;
  var n = S.blades, R = 2.3, p = G.p;
  for (var i = 0; i < n; i++) {
    var a = G.bladeA + i / n * 6.283, b = G.blades.children[i];
    b.position.set(p.x + Math.cos(a) * R, 0.9, p.z + Math.sin(a) * R); b.rotation.y = -a;
    for (var j = G.enemies.length - 1; j >= 0; j--) {
      var e = G.enemies[j]; if (e.bt > G.t) continue;
      var dx = e.x - b.position.x, dz = e.z - b.position.z;
      if (dx * dx + dz * dz < (0.8 + e.def.r) * (0.8 + e.def.r)) {
        e.bt = G.t + 0.4; var d = Math.sqrt(dx * dx + dz * dz) || 1;
        damageEnemy(e, S.dmg * 0.55, dx / d, dz / d, 3);
      }
    }
  }
}

function addMinion(type) {
  var g = new THREE.Group();
  if (type === 'wisp') {
    g.add(M.mesh(0.34, 0.34, 0.34, 0x9affff, 0, 0, 0, 0x33ccee));
    var h = M.mesh(0.7, 0.7, 0.7, 0x66ddff, 0, 0, 0, 0x22aacc); h.material.transparent = true; h.material.opacity = 0.25; h.material.depthWrite = false; g.add(h);
  } else {
    g.add(M.mesh(0.5, 0.45, 1.0, 0x8aa8ff, 0, 0.5, 0, 0x2244aa)); g.add(M.mesh(0.4, 0.4, 0.4, 0xaac4ff, 0, 0.75, 0.6, 0x3355bb));
    g.add(M.mesh(0.1, 0.1, 0.05, 0xff4444, -0.1, 0.8, 0.82, 0xff0000)); g.add(M.mesh(0.1, 0.1, 0.05, 0xff4444, 0.1, 0.8, 0.82, 0xff0000));
    g.add(M.mesh(0.12, 0.2, 0.12, 0x8aa8ff, -0.15, 1.0, 0.55)); g.add(M.mesh(0.12, 0.2, 0.12, 0x8aa8ff, 0.15, 1.0, 0.55));
    g.add(M.mesh(0.12, 0.12, 0.5, 0x8aa8ff, 0, 0.7, -0.7, 0x2244aa));
  }
  var p = G.p; g.position.set(p.x, 0, p.z); World.scene.add(g);
  G.minions.push({ g: g, type: type, x: p.x, z: p.z, cd: 0.5 + Math.random(), ph: Math.random() * 6, face: 0, idx: G.minions.length });
}

function updateMinions(dt, t) {
  var p = G.p, n = G.minions.length;
  for (var i = 0; i < n; i++) {
    var m = G.minions[i]; m.cd -= dt;
    if (m.type === 'wisp') {
      var a = t * 1.6 + i * 6.283 / Math.max(1, n), tx = p.x + Math.cos(a) * 2.8, tz = p.z + Math.sin(a) * 2.8;
      m.x += (tx - m.x) * Math.min(1, dt * 4); m.z += (tz - m.z) * Math.min(1, dt * 4);
      m.g.position.set(m.x, 1.6 + Math.sin(t * 3 + m.ph) * 0.2, m.z);
      if (m.cd <= 0) {
        var e = nearest(m.x, m.z, 10);
        if (e) { m.cd = 1.1; fireProj(m.x, m.z, Math.atan2(e.x - m.x, e.z - m.z), S.dmg * 0.45, 16, 12, 0, 0, 0x9affff); }
      }
    } else {
      var e2 = nearest(p.x, p.z, 9), gx = p.x + 1.5, gz = p.z + 1.5;
      if (e2) { gx = e2.x; gz = e2.z; }
      var dx = gx - m.x, dz = gz - m.z, d = Math.sqrt(dx * dx + dz * dz) || 1, sp = e2 ? 7.5 : 5;
      if (d > 1.0) { m.x += dx / d * sp * dt; m.z += dz / d * sp * dt; }
      m.face += angDiff(Math.atan2(dx, dz), m.face) * Math.min(1, dt * 10);
      m.g.position.set(m.x, Math.abs(Math.sin(t * 12)) * 0.12, m.z); m.g.rotation.y = m.face;
      if (e2 && d < 1.4 + e2.def.r && m.cd <= 0) { m.cd = 0.55; damageEnemy(e2, S.dmg * 0.55, dx / d, dz / d, 3); }
    }
  }
}

function updatePassives(dt) {
  var p = G.p, i, e;
  G.pt = G.pt || { aura: 0, nova: 0, bolt: 0, burn: 0 };
  var T = G.pt;
  if (S.aura > 0) {
    FX.auraRing && FX.auraRing(p.x, p.z, dt);
    T.aura -= dt;
    if (T.aura <= 0) {
      T.aura = 0.5;
      for (i = G.enemies.length - 1; i >= 0; i--) { e = G.enemies[i]; var dx = e.x - p.x, dz = e.z - p.z; if (dx * dx + dz * dz < 12) damageEnemy(e, S.aura * 0.5, 0, 0, 0, true); }
      FX.ring(p.x, p.z, 0xff6a3a, 3.5, 0.5);
    }
  }
  if (S.nova > 0) {
    T.nova -= dt;
    if (T.nova <= 0) {
      T.nova = S.nova; FX.ring(p.x, p.z, 0xb65cff, 9, 0.5); FX.burst(p.x, 1, p.z, 0xb65cff, 20, 8); Snd.sfx('nova');
      for (i = G.enemies.length - 1; i >= 0; i--) {
        e = G.enemies[i]; var ax = e.x - p.x, az = e.z - p.z, d = Math.sqrt(ax * ax + az * az) || 1;
        if (d < 5) damageEnemy(e, S.dmg * (1.2 + 0.3 * S.novaD), ax / d, az / d, 8);
      }
    }
  }
  if (S.bolt > 0) {
    T.bolt -= dt;
    if (T.bolt <= 0 && G.enemies.length) {
      T.bolt = 2.2;
      for (var k = 0; k < S.bolt; k++) {
        e = G.enemies[Math.floor(Math.random() * G.enemies.length)]; if (!e) break;
        FX.bolt(e.x, e.z); Snd.sfx('zap'); damageEnemy(e, S.dmg * 2.5, 0, 0, 2);
      }
    }
  }
  if (S.burn > 0) {
    T.burn -= dt;
    if (T.burn <= 0) {
      T.burn = 0.5;
      for (i = G.enemies.length - 1; i >= 0; i--) { e = G.enemies[i]; if (e.burnT > 0) { e.burnT -= 0.5; FX.burst(e.x, 1.5, e.z, 0xff7a20, 3, 2); damageEnemy(e, e.burnD * 0.5, 0, 0, 0, true); } }
    }
  }
}
