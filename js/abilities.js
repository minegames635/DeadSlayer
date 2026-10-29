var ABIL = {
  knight: { id: 'whirl', ic: '✺', n: 'Вихрь клинков', t: 'Круговой удар по всем врагам вокруг', cd: 12, base: 500, mult: 1.9, max: 6 },
  mage: { id: 'meteor', ic: '☄', n: 'Метеоритный дождь', t: 'Метеориты падают на врагов', cd: 16, base: 500, mult: 1.9, max: 6 },
  archer: { id: 'storm', ic: '➶', n: 'Буря стрел', t: 'Кольцо пронзающих стрел во все стороны', cd: 13, base: 500, mult: 1.9, max: 6 }
};
function abilLevel(cls) { return (Save.d.abil && Save.d.abil[cls]) || 0; }
function abilCost(cls, l) { var a = ABIL[cls]; return Math.round(a.base * Math.pow(a.mult, l)); }

var Abil = {
  cd: 0, q: [], cls: null, lastPct: -1, lastRdy: null,
  reset: function () { this.cd = 3; this.q = []; this.cls = S.cls; this.lastPct = -1; this.lastRdy = null; this.ui(true); },
  lv: function () { return abilLevel(S.cls); },
  has: function () { return this.lv() > 0; },
  cdMax: function () { return ABIL[S.cls].cd * Math.pow(0.92, this.lv() - 1); },
  dmgM: function () { return 2.2 + 0.7 * (this.lv() - 1); },
  later: function (t, fn) { this.q.push({ t: t, fn: fn }); },
  cast: function () {
    if (G.state !== 'play' || !G.p || !this.has() || this.cd > 0 || G.phase === 'clear') return;
    this.cd = this.cdMax();
    var p = G.p, l = this.lv(), self = this, dm = S.dmg * this.dmgM(), i;
    if (S.cls === 'knight') {
      var R = 4.2 + S.range * 0.3 + 0.35 * l;
      Snd.sfx('boom'); World.shake = Math.max(World.shake, 0.5);
      FX.ring(p.x, p.z, 0xffc933, R * 1.2, 0.5);
      for (i = 0; i < 4; i++) FX.slash(p.x, p.z, i * Math.PI / 2, R, 2.4, S.w.glow || S.w.color);
      p.swing = 0; p.hit = true; p.atkT = Math.max(p.atkT, 0.35);
      for (i = G.enemies.length - 1; i >= 0; i--) {
        var e = G.enemies[i], dx = e.x - p.x, dz = e.z - p.z, d = Math.sqrt(dx * dx + dz * dz);
        if (d > R + e.def.r) continue;
        var n = d || 1; damageEnemy(e, dm * (0.9 + Math.random() * 0.2), dx / n, dz / n, 9);
      }
    } else if (S.cls === 'mage') {
      var cnt = 5 + l * 2, rad = 2.2 + 0.2 * l, man = Save.d.atk === 'manual';
      Snd.sfx('magic');
      for (i = 0; i < cnt; i++) {
        (function (k) {
          var tg = null, x, z;
          if (!man) tg = G.enemies.length ? G.enemies[Math.floor(Math.random() * G.enemies.length)] : null;
          if (tg) { x = tg.x; z = tg.z; }
          else { var a = (man ? G.aim.ang : Math.random() * 6.283) + (Math.random() - 0.5) * 1.2, r = 3 + Math.random() * 6; x = p.x + Math.sin(a) * r; z = p.z + Math.cos(a) * r; }
          FX.ring(x, z, 0xff5522, rad, 0.7);
          self.later(0.35 + k * 0.12, function () {
            projBlast({ aoe: rad, dmg: dm * 0.55, color: 0xff7a30 }, x, z);
          });
        }(i));
      }
    } else {
      var n2 = 12 + l * 2;
      Snd.sfx('bow');
      for (var w = 0; w < 2; w++) {
        (function (wv) {
          self.later(wv * 0.18, function () {
            if (!G.p) return;
            for (var j = 0; j < n2; j++) {
              var a = j / n2 * 6.283 + wv * 0.13;
              fireProj(G.p.x + Math.sin(a) * 0.8, G.p.z + Math.cos(a) * 0.8, a, dm * 0.5, 22, S.range * 1.2, 6, 0, 0xfff0a0);
            }
          });
        }(w));
      }
      FX.ring(p.x, p.z, 0xfff0a0, 8, 0.6);
    }
    this.ui(true);
  },
  update: function (dt) {
    if (this.cd > 0) this.cd = Math.max(0, this.cd - dt);
    for (var i = this.q.length - 1; i >= 0; i--) {
      var o = this.q[i]; o.t -= dt;
      if (o.t <= 0) { this.q.splice(i, 1); if (G.state === 'play' && G.p) o.fn(); }
    }
    this.ui(false);
  },
  ui: function (force) {
    var has = this.has(), pct = has ? Math.round((1 - this.cd / this.cdMax()) * 100) : 0, rdy = has && this.cd <= 0;
    if (!force && pct === this.lastPct && rdy === this.lastRdy) return;
    this.lastPct = pct; this.lastRdy = rdy;
    ['abilBtn', 'abilHud'].forEach(function (id) {
      var e = document.getElementById(id); if (!e) return;
      e.style.display = has ? '' : 'none'; e.style.setProperty('--p', pct + '%'); e.classList.toggle('rdy', rdy);
    });
    var ic = document.getElementById('abilIc'); if (ic && S.cls && ABIL[S.cls]) ic.textContent = ABIL[S.cls].ic;
    var ic2 = document.getElementById('abilBtnIc'); if (ic2 && S.cls && ABIL[S.cls]) ic2.textContent = ABIL[S.cls].ic;
  }
};
