var LevelUp = {
  busy: false, res: 0, picks: [], t: 0, ph: '', raf: 0, last: 0, parts: [], rings: [], flash: 0, seq: [], tick: -1, STEPS: 14, CH: 3.2,
  open: function () {
    if (G.state !== 'play') return;
    G.state = 'levelup'; Snd.duck(true);
    var boss = G.wave % 5 === 0, res = this.res = rollRarity(S.luck, boss ? 2 : 0), i;
    this.seq = [];
    for (i = 0; i < this.STEPS; i++) this.seq.push({ t: 0.15 + 2.9 * Math.pow(i / (this.STEPS - 1), 2.2), c: (res + this.STEPS - 1 - i) % 5 });
    this.ph = 'charge'; this.t = 0; this.tick = -1; this.parts = []; this.rings = []; this.flash = 0; this.busy = true; this.picks = [];
    var cv = $('cine'); cv.width = innerWidth; cv.height = innerHeight;
    $('lvTitle').textContent = 'ВОЛНА ' + G.wave + ' ПРОЙДЕНА';
    $('lvRes').style.opacity = 0; $('cards').innerHTML = ''; $('cards').classList.remove('on');
    $('lvHint').textContent = 'Нажми, чтобы пропустить';
    UI.modal('levelup', true); Snd.sfx('charge');
    this.last = performance.now(); var self = this;
    cancelAnimationFrame(this.raf);
    (function lp(now) { self.raf = requestAnimationFrame(lp); var dt = Math.min(0.05, (now - self.last) / 1000); self.last = now; self.draw(dt); })(this.last);
  },
  skip: function () { if (this.ph === 'charge') this.t = this.CH; },
  curCol: function () {
    var c = 0;
    for (var i = 0; i < this.seq.length; i++) if (this.t >= this.seq[i].t) c = i;
    if (c !== this.tick) { this.tick = c; Snd.sfx('tick', c); }
    return RARITY[this.seq[c].c].c;
  },
  burst: function (x, y, n, col, sp) {
    for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = (0.3 + Math.random()) * sp; this.parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, d: 0.6 + Math.random() * 0.8, s: 2 + Math.random() * 4, c: col }); }
  },
  draw: function (dt) {
    var cv = $('cine'), c = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / 2, cy = H * 0.4, i, p, r = RARITY[this.res];
    this.t += dt; c.clearRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    if (this.ph === 'charge') {
      var k = Math.min(1, this.t / this.CH), col = this.curCol(), R = 50 + k * 60 - (k > 0.85 ? (k - 0.85) * 400 : 0);
      var g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 3); g.addColorStop(0, col); g.addColorStop(0.25, col + '88'); g.addColorStop(1, col + '00');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.strokeStyle = col; c.lineWidth = 3;
      for (i = 0; i < 3; i++) { c.setLineDash([14 + i * 8, 10]); c.beginPath(); c.arc(cx, cy, R * (1.3 + i * 0.35), this.t * (i % 2 ? -1 : 1) * (1 + i), this.t * (i % 2 ? -1 : 1) * (1 + i) + 6.28); c.stroke(); }
      c.setLineDash([]); c.fillStyle = '#fff'; c.beginPath(); c.arc(cx + (Math.random() - 0.5) * k * 6, cy + (Math.random() - 0.5) * k * 6, R * 0.35, 0, 7); c.fill();
      if (Math.random() < 0.6 + k) { var a = Math.random() * 6.283, d = Math.max(W, H) * 0.6; this.parts.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, vx: -Math.cos(a) * d * 1.6, vy: -Math.sin(a) * d * 1.6, l: 1, d: 0.6, s: 3, c: col, in: true }); }
      if (this.t >= this.CH) this.explode();
    } else {
      this.flash = Math.max(0, this.flash - dt * 2.2);
      if (this.flash > 0) { c.fillStyle = 'rgba(255,255,255,' + this.flash + ')'; c.fillRect(0, 0, W, H); }
      c.save(); c.translate(cx, cy);
      var rn = 10 + this.res * 4;
      for (i = 0; i < rn; i++) {
        var ra = i / rn * 6.283 + this.t * 0.25 * (this.res > 2 ? 1.6 : 1), wd = 0.05 + (i % 2) * 0.03, L = Math.max(W, H);
        var lg = c.createLinearGradient(0, 0, Math.cos(ra) * L, Math.sin(ra) * L); lg.addColorStop(0, r.c + 'aa'); lg.addColorStop(1, r.c + '00');
        c.fillStyle = lg; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(ra - wd) * L, Math.sin(ra - wd) * L); c.lineTo(Math.cos(ra + wd) * L, Math.sin(ra + wd) * L); c.fill();
      }
      c.restore();
      c.strokeStyle = r.c; for (i = 0; i < this.rings.length; i++) {
        var q = this.rings[i]; q.r += dt * 900; q.l -= dt * 1.1; if (q.l <= 0 || q.r <= 0) continue;
        c.globalAlpha = q.l; c.lineWidth = 8 * q.l; c.beginPath(); c.arc(cx, cy, q.r, 0, 7); c.stroke();
      }
      c.globalAlpha = 1; this.rings = this.rings.filter(function (q) { return q.l > 0; });
      if (this.res >= 2 && Math.random() < 0.3 + this.res * 0.12) this.burst(Math.random() * W, this.res === 4 ? -10 : cy + (Math.random() - 0.5) * 200, 1, this.res === 4 ? '#ffd54a' : r.c, this.res === 4 ? 60 : 120);
      if (this.res === 4) this.parts.forEach(function (q) { if (!q.in) q.vy += 400 * dt; });
    }
    for (i = this.parts.length - 1; i >= 0; i--) {
      p = this.parts[i]; p.l -= dt / p.d; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.l <= 0) { this.parts.splice(i, 1); continue; }
      c.globalAlpha = p.l; c.fillStyle = p.c; c.fillRect(p.x, p.y, p.s, p.s);
    }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  },
  explode: function () {
    this.ph = 'show'; this.t = 0; this.busy = false;
    var r = RARITY[this.res], ri = this.res, cx = innerWidth / 2, cy = innerHeight * 0.4, self = this;
    this.parts = []; this.flash = 1; this.rings = [{ r: 10, l: 1 }, { r: -80, l: 1 }, { r: -200, l: 1 }];
    this.burst(cx, cy, 120 + ri * 60, r.c, 500 + ri * 80); this.burst(cx, cy, 60, '#ffffff', 700);
    Snd.sfx('slam'); Snd.sfx('win', ri); World.shake = 0.6 + ri * 0.2;
    $('lvHint').textContent = '';
    var res = $('lvRes'); res.textContent = r.n.toUpperCase(); res.style.color = r.c;
    res.style.textShadow = '0 0 24px ' + r.c + ',0 0 60px ' + r.c;
    res.classList.remove('pop'); void res.offsetWidth; res.classList.add('pop'); res.style.opacity = 1;
    if (ri >= 2) { $('levelup').classList.add('shake'); setTimeout(function () { $('levelup').classList.remove('shake'); }, 500); }
    setTimeout(function () { self.cards(); }, 1500);
  },
  cards: function () {
    var res = this.res, taken = { revive: S.revive > 0 || G.revives > 0 };
    var picks = pickBuffs(3, res, S.cls, taken), h = '';
    picks.forEach(function (p, i) { if (i > 0) p.r = Math.max(p.b.min, Math.min(res, rollRarity(S.luck, 0))); });
    this.picks = picks;
    picks.forEach(function (p, i) {
      var rr = RARITY[p.r], cnt = G.applied.filter(function (a) { return a[0] === p.b.id; }).length;
      h += '<div class="card r' + p.r + '" data-i="' + i + '" style="--c:' + rr.c + ';animation-delay:' + (i * 0.18) + 's"><div class="cin"><i>' + (i + 1) + '</i><div class="ic">' + p.b.ic +
        '</div><h3>' + p.b.n + '</h3><p>' + p.b.d(rr.m) + '</p><em>' + rr.n + (cnt ? ' · ×' + (cnt + 1) : '') + '</em><u></u></div></div>';
    });
    $('cards').innerHTML = h; $('cards').classList.add('on'); Snd.sfx('level');
  },
  key: function (n) { if (G.state === 'levelup' && this.ph === 'show' && this.picks[n]) this.pick(this.picks[n]); },
  pick: function (p) {
    if (G.state !== 'levelup') return;
    applyBuff(p.b, p.r); Snd.sfx('buy');
    FX.ring(G.p.x, G.p.z, RARITY[p.r].c, 6, 0.7);
    UI.banner(p.b.n + ' · ' + RARITY[p.r].n);
    this.picks = []; this.ph = ''; cancelAnimationFrame(this.raf);
    UI.modal('levelup', false); $('cards').classList.remove('on'); $('lvRes').style.opacity = 0;
    Snd.duck(false); nextWave();
  }
};
