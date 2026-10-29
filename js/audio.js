var Snd = {
  mv: 0.6, sv: 0.7, tr: {}, cur: null, ctx: null, last: {}, nb: null, duckF: false,
  init: function () {
    this.mv = Save.d.mv; this.sv = Save.d.sv;
    var f = { menu: 'MainMenu.mp3', shop: 'Magazine.mp3' }, s0 = this;
    for (var k in f) {
      var a = new Audio(f[k]); a.loop = true; a.preload = 'auto'; a.volume = 0;
      this.tr[k] = { a: a, v: 0, r: 0.12 };
    }
    this.PL.forEach(function (src, i) {
      var a = new Audio(src); a.loop = false; a.preload = 'auto'; a.volume = 0;
      a.addEventListener('ended', function () { if (s0.cur === 'g' + i) s0.next(); });
      s0.tr['g' + i] = { a: a, v: 0, r: 0.02 };
    });
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    var s = this; setInterval(function () { s.fade(); }, 40);
  },
  resume: function () { if (this.ctx && this.ctx.state !== 'running') this.ctx.resume(); },
  PL: ['ost1.mp3', 'ost2.mp3'], gi: 0, xf: 5,
  isG: function (k) { return typeof k === 'string' && /^g\d+$/.test(k); },
  play: function (k, restart) {
    if (k === 'game') {
      if (this.isG(this.cur) && !restart) k = this.cur;
      else { this.gi = Math.floor(Math.random() * this.PL.length); k = 'g' + this.gi; restart = true; }
    }
    this.cur = k; var t = this.tr[k]; if (!t) return;
    if (restart) t.a.currentTime = 0;
    if (t.a.paused) { var p = t.a.play(); if (p && p.catch) p.catch(function () {}); }
  },
  next: function () {
    var n = this.PL.length, j = this.gi;
    if (n > 1) while (j === this.gi) j = Math.floor(Math.random() * n);
    this.gi = j; this.play('g' + j, true);
  },
  duck: function (on) { this.duckF = on; },
  fade: function () {
    if (this.isG(this.cur)) {
      var ca = this.tr[this.cur].a;
      if (ca.duration && isFinite(ca.duration) && ca.duration - ca.currentTime < Math.min(this.xf, ca.duration * 0.2)) this.next();
    }
    for (var k in this.tr) {
      var t = this.tr[k], tg = k === this.cur ? this.mv * (this.duckF ? 0.35 : 1) : 0;
      t.v += (tg - t.v) * t.r;
      if (Math.abs(tg - t.v) < 0.002) t.v = tg;
      t.a.volume = Math.min(1, Math.max(0, t.v));
      if (k !== this.cur && t.v <= 0.003 && !t.a.paused) t.a.pause();
    }
  },
  tone: function (f, d, type, vol, slide, delay) {
    if (!this.ctx) return;
    var c = this.ctx, t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, (vol || 0.2) * this.sv), t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.02);
  },
  noise: function (d, f, vol, sw, delay) {
    if (!this.ctx) return;
    var c = this.ctx;
    if (!this.nb) {
      var b = c.createBuffer(1, c.sampleRate, c.sampleRate), a = b.getChannelData(0);
      for (var i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1;
      this.nb = b;
    }
    var t = c.currentTime + (delay || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.nb; fl.type = 'bandpass'; fl.frequency.setValueAtTime(f, t);
    if (sw) fl.frequency.exponentialRampToValueAtTime(Math.max(40, f * sw), t + d);
    g.gain.setValueAtTime(Math.max(0.0002, vol * this.sv), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl); fl.connect(g); g.connect(c.destination); s.start(t); s.stop(t + d + 0.02);
  },
  voice: function (pitch) {
    if (!this.ctx) return;
    var c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    var b = (pitch || 1) * (90 + Math.random() * 40);
    o.type = 'sawtooth'; o.frequency.setValueAtTime(b, t); o.frequency.linearRampToValueAtTime(b * (0.7 + Math.random() * 0.7), t + 0.09);
    f.type = 'lowpass'; f.frequency.value = 500 + Math.random() * 300;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16 * this.sv + 0.0002, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.connect(f); f.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.12);
  },
  sfx: function (n, a) {
    if (!this.ctx || this.sv <= 0) return;
    var now = performance.now();
    if (this.last[n] && now - this.last[n] < 45 && n !== 'tick' && n !== 'voice') return;
    this.last[n] = now;
    var T = this.tone.bind(this), N = this.noise.bind(this);
    switch (n) {
      case 'click': T(660, 0.07, 'square', 0.07, 1.4); break;
      case 'swing': N(0.14, 3000, 0.07, 0.3); break;
      case 'hit': T(180, 0.08, 'square', 0.09, 0.5); break;
      case 'crit': T(900, 0.14, 'sawtooth', 0.1, 0.6); T(160, 0.1, 'square', 0.1, 0.5); break;
      case 'kill': T(130, 0.16, 'sawtooth', 0.08, 0.4); N(0.12, 800, 0.08, 0.4); break;
      case 'hurt': T(110, 0.22, 'sawtooth', 0.16, 0.5); break;
      case 'boom': N(0.5, 400, 0.3, 0.15); T(70, 0.4, 'sine', 0.3, 0.3); break;
      case 'wave': T(220, 0.3, 'sawtooth', 0.1, 0.8); T(330, 0.4, 'sawtooth', 0.1, 0.8, 0.15); break;
      case 'boss': T(80, 1.0, 'sawtooth', 0.2, 0.5); T(60, 1.2, 'square', 0.15, 0.5, 0.2); break;
      case 'level': T(440, 0.12, 'triangle', 0.14); T(660, 0.12, 'triangle', 0.14, 0, 0.1); T(880, 0.2, 'triangle', 0.14, 0, 0.2); break;
      case 'tick': T(480 + (a || 0) * 25, 0.04, 'square', 0.06); break;
      case 'shot': T(420, 0.15, 'sine', 0.07, 0.5); break;
      case 'heal': T(700, 0.22, 'sine', 0.1, 1.6); break;
      case 'buy': T(1200, 0.07, 'triangle', 0.1); T(1700, 0.1, 'triangle', 0.1, 0, 0.07); break;
      case 'lose': T(330, 0.3, 'sawtooth', 0.15, 0.6); T(220, 0.4, 'sawtooth', 0.15, 0.6, 0.25); T(110, 0.8, 'sawtooth', 0.15, 0.5, 0.55); break;
      case 'voice': this.voice(a); break;
      case 'bell': T(1568, 0.9, 'sine', 0.12, 0.98); T(2349, 0.7, 'sine', 0.06, 0.98, 0.02); T(784, 1.1, 'triangle', 0.06); break;
      case 'bow': N(0.09, 2200, 0.08, 0.4); T(300, 0.12, 'triangle', 0.08, 0.4); break;
      case 'magic': T(600, 0.25, 'sine', 0.09, 1.8); T(900, 0.2, 'triangle', 0.05, 1.5, 0.03); break;
      case 'zap': N(0.2, 5000, 0.14, 0.2); T(1200, 0.18, 'sawtooth', 0.08, 0.2); break;
      case 'nova': N(0.45, 900, 0.2, 0.2); T(200, 0.4, 'sine', 0.2, 0.3); break;
      case 'coin': T(1400, 0.06, 'square', 0.06); T(2000, 0.12, 'square', 0.06, 0, 0.05); break;
      case 'door': N(0.7, 300, 0.12, 0.6); T(90, 0.6, 'sawtooth', 0.06, 0.7); break;
      case 'charge': T(120, 1.6, 'sawtooth', 0.07, 8); N(1.6, 300, 0.07, 10); break;
      case 'slam': N(0.6, 600, 0.25, 0.1); T(60, 0.5, 'sine', 0.3, 0.4); break;
      case 'win':
        var sc = [523, 659, 784, 1047, 1319, 1568, 2093], cnt = 3 + a;
        for (var i = 0; i < cnt; i++) {
          T(sc[i] || 2093, 0.35 + a * 0.08, 'triangle', 0.13, 0, i * 0.08);
          if (a >= 2) T((sc[i] || 2093) / 2, 0.4, 'sine', 0.1, 0, i * 0.08);
        }
        if (a >= 3) N(0.8, 4000, 0.1, 0.3, 0.1);
        break;
    }
  }
};
