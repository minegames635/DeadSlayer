var G = { state: 'menu', wave: 1, phase: 'intro', phaseT: 0, total: 1, spawned: 0, killedW: 0, time: 0, kills: 0, coins: 0, p: null, enemies: [], shots: [], projs: [], minions: [], picks: [], keys: {}, spawnT: 1, boss: null, hero: null, blades: null, bladeN: 0, bladeA: 0, banked: true, t: 0, ts: 1, applied: [], bankedCoins: 0, aim: { ang: 0, fire: false, on: false, stick: false } };
var S = {};

function derive() {
  var w = S.w, U = Save.d.up;
  S.dmg = w.dmg * (1 + 0.1 * U.dmg) * S.dmgM;
  S.cd = w.cd / ((1 + 0.06 * U.rate) * S.rateM);
  S.range = w.range * (1 + 0.05 * (w.cls === 'knight' ? U.mrange : U.rrange)) * S.rangeM;
  S.arc = (w.arc || 0) * S.arcM;
  S.spd = 5.2 * (1 + 0.04 * U.spd) * S.spdM;
  S.coin = (1 + 0.1 * U.coin) * S.coinM;
  var C = Cheat.v; S.dmg *= C.dmg; S.cd /= C.rate; S.spd *= C.pspd;
}

function calcStats() {
  var w = WP(Save.d.eq[Save.d.cls]), U = Save.d.up;
  S = {
    w: w, cls: w.cls, dmgM: 1, rateM: 1, spdM: 1, rangeM: 1, arcM: 1, coinM: 1, psM: 1, aoeM: 1, maxHp: Math.round(100 * (1 + 0.1 * U.hp)), hp: 0,
    crit: 0.05, critD: 0.5, luck: 4 * U.luck, armor: 0.03 * U.armor, regen: 0.3 * U.regen, steal: 0, magnet: 1, wave: 0, multi: 0, pierce: 0, burn: 0,
    blades: U.blades, aura: 0, nova: 0, novaD: 0, bolt: 0, thorns: 0, frenzy: 0, revive: U.revive
  };
  G.minionTypes = [];
  if (U.minion >= 1) G.minionTypes.push('wisp');
  if (U.minion >= 2) G.minionTypes.push('wolf');
  if (U.minion >= 3) G.minionTypes.push('wisp');
  G.applied.forEach(function (a) { var b = buffById(a[0]); if (b && b.id !== 'wisp' && b.id !== 'wolf') b.ap(S, RARITY[a[1]].m); else if (b) G.minionTypes.push(b.id); });
  derive();
}

function applyBuff(b, r) {
  var old = S.maxHp; G.applied.push([b.id, r]);
  if (b.id === 'wisp' || b.id === 'wolf') { G.minionTypes.push(b.id); addMinion(b.id); }
  else b.ap(S, RARITY[r].m);
  if (S.maxHp > old) G.p.hp += S.maxHp - old;
  derive();
}

function clearGame() {
  var i, sc = World.scene;
  G.enemies.forEach(function (e) { sc.remove(e.m.g); }); G.shots.forEach(function (s) { sc.remove(s.m); });
  G.projs.forEach(function (s) { sc.remove(s.m); }); G.picks.forEach(function (s) { sc.remove(s.m); });
  G.minions.forEach(function (m) { sc.remove(m.g); });
  G.enemies = []; G.shots = []; G.projs = []; G.picks = []; G.minions = []; G.boss = null;
  if (G.hero) { sc.remove(G.hero.g); G.hero = null; }
  if (G.blades) { sc.remove(G.blades); G.blades = null; }
  G.bladeN = 0; G.ts = 1;
}

function startGame(cont) {
  if (window.Online) Online.beginRun(!!(cont && Save.d.run && Save.d.run.cheated));
  clearGame(); G.applied = [];
  var run = cont && Save.d.run;
  if (run) { G.applied = run.applied.slice(); }
  calcStats();
  G.time = run ? run.time : 0; G.kills = run ? run.kills : 0; G.coins = run ? run.coins : 0; G.bankedCoins = 0;
  G.banked = false; G.t = 0; G.revives = S.revive;
  if (run) G.revives = run.rev;
  G.p = { x: 0, z: 0, hp: run ? Math.min(S.maxHp, run.hp) : S.maxHp, face: 0, swing: -1, ang: 0, hit: false, atkT: 0.3, hurtT: 0, moving: false };
  G.hero = buildHero(S.cls, S.w); G.hero.g.scale.setScalar(1.25); World.scene.add(G.hero.g);
  if (window.Abil) Abil.reset();
  if (window.Season) Season.dress(G.hero, 'hero');
  G.minionTypes.forEach(function (t) { addMinion(t); });
  G.state = 'play'; Save.d.stats.runs += run ? 0 : 1;
  beginWave(run ? run.wave : 1);
}

function snapshotRun() {
  if (!G.p || G.state === 'over') return;
  Save.d.run = { wave: G.wave, time: G.time, kills: G.kills, coins: G.coins, hp: G.p.hp, applied: G.applied, rev: G.revives, cheated: !!(window.Online && Online.isCheated()) };
}

function beginWave(w) {
  G.wave = w; G.total = waveTotal(w); G.spawned = 0; G.killedW = 0; G.phase = 'intro'; G.phaseT = 2.4;
  var boss = w % 5 === 0;
  UI.banner(boss ? 'ВОЛНА ' + w + ' · БОСС' : 'ВОЛНА ' + w + ' · ' + G.total + ' врагов');
  Snd.sfx(boss ? 'boss' : 'wave'); World.mood(w);
  FX.ring(G.p.x, G.p.z, boss ? 0xff2255 : 0xb65cff, 14, 0.9); World.shake = Math.max(World.shake, 0.5);
  snapshotRun(); Save.save();
}

function nextWave() {
  var p = G.p; p.hp = Math.min(S.maxHp, p.hp + S.maxHp * 0.3);
  G.state = 'play'; beginWave(G.wave + 1);
}

function clearWave() {
  G.phase = 'clear'; G.phaseT = 1.8; G.ts = 0.3;
  for (var i = G.enemies.length - 1; i >= 0; i--) if (G.enemies[i].extra) killEnemy(G.enemies[i], true);
  G.shots.forEach(function (s) { World.scene.remove(s.m); }); G.shots = [];
  UI.banner('ВОЛНА ПРОЙДЕНА'); Snd.sfx('level'); FX.ring(G.p.x, G.p.z, 0xffc933, 16, 1.0);
  Save.d.stats.bosses += G.wave % 5 === 0 ? 1 : 0;
}

function hurtPlayer(d, src) {
  var p = G.p; if (p.hurtT > 0 || G.state !== 'play') return;
  d *= (1 - S.armor);
  p.hp -= d; p.hurtT = 0.3; UI.flash(); World.shake = Math.max(World.shake, 0.4); Snd.sfx('hurt');
  FX.burst(p.x, 1.2, p.z, 0xcc2233, 8, 4);
  if (S.thorns > 0 && src) damageEnemy(src, d * S.thorns + 4, src.x - p.x, src.z - p.z, 3);
  if (p.hp <= 0) {
    if (G.revives > 0) {
      G.revives--; p.hp = S.maxHp * 0.5; p.hurtT = 2; FX.ring(p.x, p.z, 0xffc933, 14, 0.9); Snd.sfx('win', 3); UI.banner('ВОСКРЕШЕНИЕ');
      G.enemies.forEach(function (e) { var dx = e.x - p.x, dz = e.z - p.z, n = Math.sqrt(dx * dx + dz * dz) || 1; if (n < 7) { e.kx += dx / n * 14; e.kz += dz / n * 14; } });
    } else { p.hp = 0; UI.gameOver(); }
  }
}

function nearest(x, z, r, skip) {
  var best = null, bd = r * r;
  for (var i = 0; i < G.enemies.length; i++) {
    var e = G.enemies[i]; if (skip && skip.indexOf(e) >= 0) continue;
    var dx = e.x - x, dz = e.z - z, d = dx * dx + dz * dz;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function angDiff(a, b) { var d = a - b; while (d > Math.PI) d -= 6.283; while (d < -Math.PI) d += 6.283; return d; }

function applySwing() {
  var p = G.p, fz = 1 + S.frenzy * (1 - p.hp / S.maxHp);
  for (var i = G.enemies.length - 1; i >= 0; i--) {
    var e = G.enemies[i], dx = e.x - p.x, dz = e.z - p.z, d = Math.sqrt(dx * dx + dz * dz);
    if (d > S.range + e.def.r) continue;
    if (d > e.def.r + 0.9 && Math.abs(angDiff(Math.atan2(dx, dz), p.ang)) > S.arc / 2) continue;
    var n = d || 1;
    damageEnemy(e, S.dmg * fz * (0.9 + Math.random() * 0.2), dx / n, dz / n, 6);
  }
  if (S.wave > 0) fireProj(p.x, p.z, p.ang, S.dmg * S.wave, 14, S.range * 1.4, 99, 0, 0xbfe8ff, true);
}

function updateGame(dt, t) {
  G.ts += (1 - G.ts) * Math.min(1, dt * 2.5); dt *= G.ts;
  var p = G.p, k = G.keys, fz = 1 + S.frenzy * (1 - p.hp / S.maxHp);
  G.t += dt; G.time += dt; Save.d.stats.time += dt;
  var ix = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
  var iz = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0);
  var l = Math.sqrt(ix * ix + iz * iz); p.moving = l > 0;
  if (l > 0) { p.x += ix / l * S.spd * fz * dt; p.z += iz / l * S.spd * fz * dt; p.mang = Math.atan2(ix, iz); }
  p.hurtT -= dt; p.hp = Math.min(S.maxHp, p.hp + S.regen * dt); p.atkT -= dt;
  var man = Save.d.atk === 'manual', A = G.aim;
  if (window.Input) Input.tick();
  if (p.swing < 0 && p.atkT <= 0 && G.phase !== 'clear') {
    var tg = man ? (A.fire ? p : null) : nearest(p.x, p.z, S.cls === 'knight' ? S.range + 1.5 : S.range);
    if (tg) {
      p.ang = man ? A.ang : Math.atan2(tg.x - p.x, tg.z - p.z); p.swing = 0; p.hit = false; p.atkT = S.cd / fz;
      if (S.cls === 'knight') { Snd.sfx('swing'); FX.slash(p.x, p.z, p.ang, S.range, S.arc, S.w.glow || S.w.color); }
    }
  }
  if (p.swing >= 0) {
    p.swing += dt / Math.min(0.28, S.cd * 0.75);
    if (!p.hit && p.swing >= 0.5) { p.hit = true; var rp = Math.max(1, Math.min(100, Math.floor(dt / S.cd))); for (var q = 0; q < rp; q++) { if (S.cls === 'knight') applySwing(); else fireVolley(); } }
    if (p.swing >= 1) p.swing = -1;
  }
  var tf = p.swing >= 0 ? p.ang : (man && A.on ? A.ang : (p.moving ? p.mang : p.face));
  p.face += angDiff(tf, p.face) * Math.min(1, dt * (p.swing >= 0 ? 25 : 12));
  G.hero.g.position.set(p.x, 0, p.z); G.hero.g.rotation.y = p.face;
  animateHero(G.hero, t, p.moving, p.swing);
  updateWaveFlow(dt);
  updateEnemies(dt, t); updateShots(dt); updatePicks(dt, t); updateBlades(dt);
  updateProjs(dt); updateMinions(dt, t); updatePassives(dt);
  if (window.Abil) Abil.update(dt);
  if (G.state === 'play') UI.hud();
}

function updateWaveFlow(dt) {
  if (G.phase === 'intro') {
    G.phaseT -= dt;
    if (G.phaseT <= 0) { G.phase = 'fight'; G.spawnT = 0.2; if (G.wave % 5 === 0) { spawnBoss(); G.spawned++; } }
  } else if (G.phase === 'fight') {
    G.spawnT -= dt;
    var live = G.enemies.filter(function (e) { return !e.extra; }).length;
    if (G.spawnT <= 0 && G.spawned < G.total) {
      G.spawnT = Math.max(0.22, 1.0 - G.wave * 0.05);
      var cnt = Math.min(G.total - G.spawned, 1 + Math.floor(G.wave / 3));
      for (var i = 0; i < cnt && live + i < 60; i++) { spawnEnemy(pickType()); G.spawned++; }
    }
    if (G.killedW >= G.total) clearWave();
  } else if (G.phase === 'clear') {
    G.phaseT -= dt;
    if (G.phaseT <= 0 && G.state === 'play') { G.phase = 'reward'; LevelUp.open(); }
  }
}
