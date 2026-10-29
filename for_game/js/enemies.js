function pickType() {
  var list = [], tot = 0, k;
  for (k in ENEMIES) {
    var d = ENEMIES[k];
    if (d.boss || d.from > G.wave) continue;
    var w = d.w * (k === 'walker' ? Math.max(0.4, 1.4 - G.wave * 0.08) : 1);
    list.push([k, w]); tot += w;
  }
  var r = Math.random() * tot;
  for (var i = 0; i < list.length; i++) { r -= list[i][1]; if (r <= 0) return list[i][0]; }
  return 'walker';
}

function edgePos() {
  var hw = World.hw, hd = World.hd, p = G.p, t = Math.random() * (hw + hd) * 2, x, z;
  if (t < hw * 2) { x = t - hw; z = Math.random() < 0.5 ? -hd : hd; }
  else { z = t - hw * 2 - hd; x = Math.random() < 0.5 ? -hw : hw; }
  return [p.x + x + (Math.random() - 0.5) * 2, p.z + z + (Math.random() - 0.5) * 2];
}

function spawnEnemy(type, x, z, extra) {
  var d = ENEMIES[type], w = G.wave;
  if (x === undefined) { var q = edgePos(); x = q[0]; z = q[1]; }
  var hp = d.hp * (1 + (w - 1) * 0.22) * (d.boss ? 1 + w * 0.12 : 1);
  var m = buildZombie(type, d);
  var e = {
    m: m, def: d, type: type, x: x, z: z, hp: hp, max: hp,
    spd: d.spd * (1 + Math.min(0.5, (w - 1) * 0.025)) * (0.9 + Math.random() * 0.2),
    dmg: d.dmg * (1 + (w - 1) * 0.1), atkT: 0, kx: 0, kz: 0, flash: 0, ph: Math.random() * 6,
    bt: 0, shootT: 1 + Math.random() * 2, sumT: 6, face: 0, extra: !!extra, burnT: 0, burnD: 0
  };
  if (extra) FX.ring(x, z, 0xaa44ff, 2, 0.4);
  m.g.position.set(x, 0, z); World.scene.add(m.g); G.enemies.push(e);
  return e;
}

function spawnBoss() {
  var q = edgePos(); G.boss = spawnEnemy('boss', q[0], q[1]);
  FX.ring(q[0], q[1], 0xff2255, 8, 0.8);
}

function removeEnemy(e) {
  var i = G.enemies.indexOf(e); if (i < 0) return;
  G.enemies.splice(i, 1); World.scene.remove(e.m.g);
  for (var j = 0; j < e.m.mats.length; j++) e.m.mats[j].dispose();
  if (G.boss === e) G.boss = null;
}

function updateEnemies(dt, t) {
  var p = G.p, i, j, e;
  for (i = G.enemies.length - 1; i >= 0; i--) {
    e = G.enemies[i];
    var dx = p.x - e.x, dz = p.z - e.z, d = Math.sqrt(dx * dx + dz * dz) || 0.001, nx = dx / d, nz = dz / d, sp = e.spd * Cheat.v.espd;
    if (e.def.ranged) {
      if (d < 6) sp = -sp * 0.6; else if (d < 9) sp = 0;
      e.shootT -= dt;
      if (e.shootT <= 0 && d < 12) { e.shootT = 2.2; spawnShot(e.x, e.z, nx, nz, e.dmg); }
    }
    e.x += (nx * sp + e.kx) * dt; e.z += (nz * sp + e.kz) * dt;
    var kd = Math.exp(-dt * 8); e.kx *= kd; e.kz *= kd;
    e.face += angDiff(Math.atan2(nx, nz), e.face) * Math.min(1, dt * 8);
    if (e.def.boss) {
      e.sumT -= dt;
      if (e.sumT <= 0) {
        e.sumT = 8; FX.ring(e.x, e.z, 0xaa44ff, 6, 0.6);
        for (j = 0; j < 3 && G.enemies.length < 90; j++) spawnEnemy('walker', e.x + (Math.random() - 0.5) * 4, e.z + (Math.random() - 0.5) * 4, true);
      }
    }
    if (e.def.summon) {
      e.sumT -= dt;
      if (e.sumT <= 0 && G.enemies.length < 80) {
        e.sumT = 7; for (j = 0; j < 2; j++) spawnEnemy('walker', e.x + (Math.random() - 0.5) * 3, e.z + (Math.random() - 0.5) * 3, true);
      }
    }
    e.atkT -= dt;
    var rr = e.def.r * e.def.scale * 0.5 + 0.55;
    if (e.def.boom) {
      if (d < rr + 0.9) { explode(e); continue; }
    } else if (d < rr + (e.def.boss ? 1.2 : 0.3) && e.atkT <= 0) {
      e.atkT = 0.9; hurtPlayer(e.dmg, e);
    }
  }
  for (i = 0; i < G.enemies.length; i++) {
    e = G.enemies[i];
    for (j = i + 1; j < G.enemies.length; j++) {
      var o = G.enemies[j], ax = o.x - e.x, az = o.z - e.z, md = (e.def.r + o.def.r) * 0.8;
      if (ax > md || ax < -md || az > md || az < -md) continue;
      var dd = Math.sqrt(ax * ax + az * az) || 0.01;
      if (dd < md) { var push = (md - dd) * 0.5; ax /= dd; az /= dd; e.x -= ax * push; e.z -= az * push; o.x += ax * push; o.z += az * push; }
    }
  }
  for (i = 0; i < G.enemies.length; i++) {
    e = G.enemies[i]; var m = e.m;
    m.g.position.set(e.x, 0, e.z); m.g.rotation.y = e.face;
    animateZombie(m, t, e.ph, e.spd);
    if (e.flash > 0) { e.flash -= dt; flashZombie(m, Math.max(0, e.flash / 0.12) * 0.9); }
    if (e.def.boom) { var pl = 0.5 + Math.sin(t * 10) * 0.5; m.body.scale.setScalar(1 + pl * 0.06); }
  }
}

function damageEnemy(e, dmg, dx, dz, kb, dot) {
  var crit = !dot && Math.random() < S.crit;
  if (crit) dmg *= 1.5 + S.critD;
  if (!dot && G.p && S.frenzy) dmg *= 1 + S.frenzy * (1 - G.p.hp / S.maxHp);
  e.hp -= dmg; if (!dot) e.flash = 0.12;
  if (dot) { UI.dmg(e.x, 2.2 * e.def.scale, e.z, Math.round(dmg), false, '#ff9a4a'); if (e.hp <= 0) killEnemy(e); return; }
  var k = kb / (e.def.boss ? 4 : Math.max(0.8, e.def.scale));
  e.kx += dx * k * 2.2; e.kz += dz * k * 2.2;
  UI.dmg(e.x, 2.2 * e.def.scale, e.z, Math.round(dmg), crit);
  FX.burst(e.x, 1.2, e.z, e.def.boom ? 0xffaa33 : 0x7acb5a, crit ? 8 : 4, 3.5);
  Snd.sfx(crit ? 'crit' : 'hit');
  if (e.hp <= 0) killEnemy(e);
}

function killEnemy(e, silent) {
  var d = e.def;
  if (silent) { FX.burst(e.x, 1, e.z, d.skin, 8, 4); removeEnemy(e); return; }
  FX.burst(e.x, 1, e.z, d.skin, d.boss ? 40 : 12, 5); FX.decal(e.x, e.z, 0x3a0a14, 0.6 + d.scale * 0.4);
  Snd.sfx('kill');
  var c = Math.max(1, Math.round(d.coin * S.coin * (0.7 + Math.random() * 0.6)));
  if (e.extra) c = 0;
  G.coins += c;
  if (S.steal > 0 && G.p) G.p.hp = Math.min(S.maxHp, G.p.hp + S.steal);
  if (d.boss) { UI.dmg(e.x, 3, e.z, '+' + c + ' монет', true); FX.ring(e.x, e.z, 0xffc933, 10, 0.8); World.shake = 0.8; }
  if (!e.extra && Math.random() < (d.boss ? 1 : 0.025)) spawnPick(e.x, e.z);
  removeEnemy(e);
  if (!e.extra) { G.kills++; Save.d.stats.kills++; G.killedW++; }
}

function explode(e) {
  var p = G.p, dx = p.x - e.x, dz = p.z - e.z;
  if (dx * dx + dz * dz < 3.8 * 3.8) hurtPlayer(e.dmg, e);
  FX.ring(e.x, e.z, 0xff7a22, 8, 0.5); FX.burst(e.x, 1, e.z, 0xff8833, 30, 8);
  Snd.sfx('boom'); World.shake = Math.max(World.shake, 0.6);
  for (var i = G.enemies.length - 1; i >= 0; i--) {
    var o = G.enemies[i]; if (o === e) continue;
    var ax = o.x - e.x, az = o.z - e.z;
    if (ax * ax + az * az < 9) damageEnemy(o, 30, ax, az, 5);
  }
  FX.decal(e.x, e.z, 0x1a1a1a, 1.6);
  removeEnemy(e);
  if (!e.extra) { G.kills++; Save.d.stats.kills++; G.killedW++; }
}

var shotGeo = null, shotMat = null;
function spawnShot(x, z, nx, nz, dmg) {
  if (!shotGeo) { shotGeo = new THREE.SphereGeometry(0.28, 8, 8); shotMat = new THREE.MeshBasicMaterial({ color: 0xb6ff4a }); }
  var m = new THREE.Mesh(shotGeo, shotMat); m.position.set(x, 1.3, z); World.scene.add(m);
  G.shots.push({ m: m, vx: nx * 7, vz: nz * 7, life: 4, dmg: dmg }); Snd.sfx('shot');
}

function updateShots(dt) {
  var p = G.p;
  for (var i = G.shots.length - 1; i >= 0; i--) {
    var s = G.shots[i]; s.life -= dt;
    s.m.position.x += s.vx * dt; s.m.position.z += s.vz * dt;
    var dx = p.x - s.m.position.x, dz = p.z - s.m.position.z, hit = dx * dx + dz * dz < 0.6;
    if (hit) hurtPlayer(s.dmg);
    if (hit || s.life <= 0) { World.scene.remove(s.m); G.shots.splice(i, 1); }
  }
}

function spawnPick(x, z) {
  var m = M.mesh(0.45, 0.45, 0.45, 0xff3355, 0, 0.8, 0, 0xaa0022);
  var g = new THREE.Group(); g.add(m); g.position.set(x, 0, z); World.scene.add(g);
  G.picks.push({ m: g, x: x, z: z, life: 15 });
}

function updatePicks(dt, t) {
  var p = G.p;
  for (var i = G.picks.length - 1; i >= 0; i--) {
    var k = G.picks[i]; k.life -= dt; k.m.rotation.y += dt * 3; k.m.position.y = Math.sin(t * 4) * 0.12;
    var dx = p.x - k.x, dz = p.z - k.z, got = dx * dx + dz * dz < 1.6 * S.magnet * S.magnet;
    if (got) { p.hp = Math.min(S.maxHp, p.hp + S.maxHp * 0.2); Snd.sfx('heal'); FX.ring(p.x, p.z, 0xff3355, 3, 0.4); UI.dmg(p.x, 2.8, p.z, '+' + Math.round(S.maxHp * 0.2), false, '#ff6b81'); }
    if (got || k.life <= 0) { World.scene.remove(k.m); G.picks.splice(i, 1); }
  }
}
