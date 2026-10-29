// Вступительный ролик: 9 планов, около 2 минут 10 секунд.
// Звук: файлы sfx/cut_<имя>.mp3 (если их нет, играет синтезированная замена).
function stClamp(x, a, b) { return Math.max(0, Math.min(1, (x - a) / (b - a))); }
function stEase(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
function stLerp(a, b, k) { return a + (b - a) * k; }
function stQ() { var c = window.GFX && GFX.cur ? GFX.cur() : null; return c ? Math.max(0.4, Math.min(1, c.pm)) : 1; }
function stBox(g, w, h, l, c, x, y, z, e) { var m = M.mesh(w, h, l, c, x, y, z, e); m.castShadow = false; g.add(m); return m; }
function stMat(c, op, add) { return new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false }); }
var stGlow = null;
function stGlowTex() {
  if (stGlow) return stGlow;
  var c = document.createElement('canvas'); c.width = c.height = 128;
  var x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return (stGlow = new THREE.CanvasTexture(c));
}
function stSprite(g, color, s, x, y, z, op) {
  var m = new THREE.Sprite(new THREE.SpriteMaterial({ map: stGlowTex(), color: color, transparent: true, opacity: op === undefined ? 1 : op, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.scale.set(s, s, 1); m.position.set(x, y, z); g.add(m); return m;
}
function stGround(g, s, c) {
  var m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshLambertMaterial({ color: c }));
  m.rotation.x = -Math.PI / 2; g.add(m); return m;
}
function stStars(g, n, R) {
  var a = new Float32Array(n * 3), i, u, v;
  for (i = 0; i < n; i++) {
    u = Math.random() * 6.283; v = Math.random() * 1.35;
    a[i * 3] = Math.cos(u) * Math.cos(v) * R; a[i * 3 + 1] = Math.sin(v) * R + 2; a[i * 3 + 2] = Math.sin(u) * Math.cos(v) * R;
  }
  var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(a, 3));
  var p = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, fog: false, transparent: true, opacity: 0.9, sizeAttenuation: false }));
  g.add(p); return p;
}
function stMoon(g, x, y, z, r) {
  var m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), new THREE.MeshBasicMaterial({ color: 0xf2f0e0, fog: false }));
  m.position.set(x, y, z); g.add(m); stSprite(g, 0x9ab0ff, r * 6, x, y, z, 0.5); return m;
}
function stTree(g, x, z, s, c) {
  c = c || 0x1a3a26; stBox(g, 0.5 * s, 2.2 * s, 0.5 * s, 0x3a2616, x, 1.1 * s, z);
  stBox(g, 2.6 * s, 1.4 * s, 2.6 * s, c, x, 2.6 * s, z); stBox(g, 2 * s, 1.3 * s, 2 * s, c, x, 3.7 * s, z); stBox(g, 1.2 * s, 1.1 * s, 1.2 * s, c, x, 4.7 * s, z);
}
function stDead(g, x, z, s) {
  stBox(g, 0.5 * s, 4 * s, 0.5 * s, 0x1a1210, x, 2 * s, z);
  stBox(g, 0.25 * s, 2 * s, 0.25 * s, 0x1a1210, x + 0.8 * s, 3.4 * s, z).rotation.z = -0.7;
  stBox(g, 0.25 * s, 1.6 * s, 0.25 * s, 0x1a1210, x - 0.7 * s, 3.0 * s, z).rotation.z = 0.8;
}
function stHouse(g, x, z, ry, s, lit, wall) {
  var h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; s = s || 1;
  stBox(h, 4 * s, 2.6 * s, 3.4 * s, wall || 0x5a4634, 0, 1.3 * s, 0);
  stBox(h, 4.6 * s, 0.5 * s, 4 * s, 0x3a2418, 0, 2.85 * s, 0);
  stBox(h, 3.4 * s, 0.5 * s, 3.2 * s, 0x4a2c1c, 0, 3.3 * s, 0);
  stBox(h, 2 * s, 0.5 * s, 2.4 * s, 0x4a2c1c, 0, 3.75 * s, 0);
  stBox(h, 0.6 * s, 1.2 * s, 0.6 * s, 0x2a2622, 1.2 * s, 3.9 * s, 0.6 * s);
  stBox(h, 0.8 * s, 1.5 * s, 0.1, 0x2a1a10, 0, 0.75 * s, 1.72 * s);
  if (lit) { stBox(h, 0.7 * s, 0.7 * s, 0.1, 0xffc060, -1.3 * s, 1.5 * s, 1.72 * s, 0xffa030); stBox(h, 0.7 * s, 0.7 * s, 0.1, 0xffc060, 1.3 * s, 1.5 * s, 1.72 * s, 0xffa030); }
  g.add(h); return h;
}
var stFlames = [], stParts = [];
function stFlame(g, x, y, z, s, col) {
  var f = new THREE.Group(); f.position.set(x, y, z);
  var o = new THREE.Mesh(new THREE.ConeGeometry(0.5 * s, 1.4 * s, 6), stMat(col || 0xff6a10, 0.85, true)); o.position.y = 0.7 * s;
  var i = new THREE.Mesh(new THREE.ConeGeometry(0.28 * s, 0.9 * s, 6), stMat(0xffe070, 0.9, true)); i.position.y = 0.45 * s;
  f.add(o); f.add(i); g.add(f); stFlames.push({ f: f, p: Math.random() * 6.28 }); return f;
}
function stPoints(g, n, color, size, box, vel, op) {
  n = Math.max(6, Math.round(n * stQ()));
  var a = new Float32Array(n * 3), v = new Float32Array(n * 3), i;
  for (i = 0; i < n; i++) {
    a[i * 3] = (Math.random() - 0.5) * box[0]; a[i * 3 + 1] = Math.random() * box[1]; a[i * 3 + 2] = (Math.random() - 0.5) * box[2];
    v[i * 3] = (Math.random() - 0.5) * vel[0]; v[i * 3 + 1] = vel[1] * (0.5 + Math.random()); v[i * 3 + 2] = (Math.random() - 0.5) * vel[2];
  }
  var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(a, 3));
  var p = new THREE.Points(geo, new THREE.PointsMaterial({ color: color, size: size, map: stGlowTex(), transparent: true, opacity: op || 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  p.frustumCulled = false; g.add(p); stParts.push({ p: p, v: v, box: box, n: n }); return p;
}
function stFx(dt) {
  var t = performance.now() / 1000, i, k, e, a, b;
  for (i = 0; i < stFlames.length; i++) {
    e = stFlames[i]; if (!e.f.parent || !e.f.parent.visible) continue;
    k = 1 + Math.sin(t * 13 + e.p) * 0.18 + Math.sin(t * 7.3 + e.p * 2) * 0.12;
    e.f.scale.set(1 + (1 - k) * 0.6, k, 1 + (1 - k) * 0.6);
  }
  for (i = 0; i < stParts.length; i++) {
    e = stParts[i]; if (!e.p.visible || !e.p.parent || !e.p.parent.visible) continue;
    a = e.p.geometry.attributes.position.array; b = e.box;
    for (k = 0; k < e.n; k++) {
      a[k * 3] += e.v[k * 3] * dt; a[k * 3 + 1] += e.v[k * 3 + 1] * dt; a[k * 3 + 2] += e.v[k * 3 + 2] * dt;
      if (a[k * 3 + 1] > b[1]) { a[k * 3 + 1] = 0; a[k * 3] = (Math.random() - 0.5) * b[0]; a[k * 3 + 2] = (Math.random() - 0.5) * b[2]; }
      if (a[k * 3 + 1] < 0) a[k * 3 + 1] = b[1];
    }
    e.p.geometry.attributes.position.needsUpdate = true;
  }
}
function stCastle(g, x, z, s, glow) {
  var c = new THREE.Group(); c.position.set(x, 0, z); c.scale.setScalar(s || 1);
  var st = 0x4a4a58, i, tx, tz, w = glow ? 0x66ff88 : 0xffc060, we = glow ? 0x33ff66 : 0xffa030;
  stBox(c, 12, 9, 8, st, 0, 4.5, 0); stBox(c, 13, 1, 9, 0x3a3a46, 0, 9.5, 0);
  for (i = 0; i < 7; i++) stBox(c, 1, 1, 1, st, -6 + i * 2, 10.5, 4.3);
  for (i = 0; i < 4; i++) {
    tx = i % 2 ? 7.5 : -7.5; tz = i < 2 ? 3.5 : -3.5;
    stBox(c, 3.4, 13, 3.4, st, tx, 6.5, tz);
    var r = new THREE.Mesh(new THREE.ConeGeometry(2.8, 4, 4), new THREE.MeshLambertMaterial({ color: glow ? 0x2a2a3e : 0x6a2a2a })); r.position.set(tx, 15, tz); r.rotation.y = Math.PI / 4; c.add(r);
    stBox(c, 0.6, 1, 0.2, w, tx, 9, tz + 1.75, we);
  }
  stBox(c, 3, 4.5, 0.3, 0x1a1210, 0, 2.25, 4.05);
  for (i = 0; i < 3; i++) stBox(c, 0.9, 1.6, 0.2, w, -3.5 + i * 3.5, 6.5, 4.05, we);
  g.add(c); return c;
}
var Story = {
  scene: null, cam: null, L: {}, S: [], i: -1, lt: 0, on: false, skipping: false, done: null,
  flash: 0, shake: 0, ci: 0, si: 0, sx: 0, heroHolder: null, loops: {}, aud: {}, ok: {}, el: {},
  NAMES: ['music', 'night', 'whoosh', 'impact', 'crystal', 'steps', 'hall', 'cough', 'gulp', 'heart', 'crack', 'roar', 'bell', 'thunder', 'groans', 'scream', 'fire', 'sword', 'dawn', 'title'],
  mk: function (tag, id, cls, par) { var e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; (par || document.body).appendChild(e); return e; },
  init: function () {
    var s = this.scene = new THREE.Scene(); this.cam = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 400);
    s.background = new THREE.Color(0x05060c); s.fog = new THREE.Fog(0x05060c, 20, 120);
    var L = this.L;
    L.amb = new THREE.AmbientLight(0xffffff, 0.3); L.hemi = new THREE.HemisphereLight(0x8899ff, 0x221108, 0.4);
    L.key = new THREE.DirectionalLight(0xffffff, 0.6); L.p1 = new THREE.PointLight(0xffffff, 0, 30); L.p2 = new THREE.PointLight(0xffffff, 0, 30);
    s.add(L.amb); s.add(L.hemi); s.add(L.key); s.add(L.key.target); s.add(L.p1); s.add(L.p2);
    this.heroHolder = new THREE.Group();
    this.build(); this.dom();
    var self = this; this.NAMES.forEach(function (n) {
      var a = new Audio('sfx/cut_' + n + '.mp3'); a.preload = 'auto';
      a.addEventListener('canplaythrough', function () { self.ok[n] = true; }); a.addEventListener('error', function () { self.ok[n] = false; });
      self.aud[n] = a;
    });
    this.warm();
  },
  dom: function () {
    var r = this.el.root = this.mk('div', 'story'), m = this.mk;
    this.el.top = m('div', null, 'stBar top', r); this.el.bot = m('div', null, 'stBar bot', r);
    this.el.sub = m('div', 'stSub', null, r); this.el.fade = m('div', 'stFade', null, r); this.el.flash = m('div', 'stFlash', null, r);
    this.el.title = m('div', 'stTitle', null, r); this.el.title.innerHTML = '<b>DEAD SLAYER</b><span>Выживи. Отомсти. Уничтожь.</span>';
    this.el.hint = m('div', 'stHint', null, r); this.el.hint.textContent = 'Enter — пропустить';
  },
  warm: function () {
    var self = this, r = window.renderer; if (!r || !r.compile) return;
    this.S.forEach(function (sh) {
      self.S.forEach(function (o) { o.g.visible = o.g === sh.g; });
      try { self.apply(sh); r.compile(self.scene, self.cam); } catch (e) {}
    });
    this.S.forEach(function (o) { o.g.visible = false; });
  },
  apply: function (sh) {
    var L = this.L, s = this.scene, b = sh.bg;
    s.background.setHex(b); s.fog.color.setHex(sh.fog[0]); s.fog.near = sh.fog[1]; s.fog.far = sh.fog[2];
    L.amb.color.setHex(sh.amb[0]); L.amb.intensity = sh.amb[1];
    L.hemi.color.setHex(sh.hemi[0]); L.hemi.groundColor.setHex(sh.hemi[1]); L.hemi.intensity = sh.hemi[2];
    L.key.color.setHex(sh.key[0]); L.key.intensity = sh.key[1]; L.key.position.set(sh.key[2], sh.key[3], sh.key[4]);
    L.p1.color.setHex(sh.p1[0]); L.p1.intensity = sh.p1[1]; L.p1.position.set(sh.p1[2], sh.p1[3], sh.p1[4]);
    L.p2.color.setHex(sh.p2[0]); L.p2.intensity = sh.p2[1]; L.p2.position.set(sh.p2[2], sh.p2[3], sh.p2[4]);
  },
  view: function (a) { if (this.cam) { this.cam.aspect = a; this.cam.updateProjectionMatrix(); } },
  rehero: function () {
    var h = this.heroHolder; while (h.children.length) h.remove(h.children[0]);
    this.hero = buildHero(Save.d.cls, Flow.curWeapon()); h.add(this.hero.g);
  },
  say: function (txt) {
    var e = this.el.sub; e.classList.remove('on'); void e.offsetWidth; e.textContent = txt; e.classList.add('on');
  },
  hit: function (f, sh) { this.flash = Math.max(this.flash, f); this.shake = Math.max(this.shake, sh || 0); },
  loopSynth: function (n, vol) {
    var c = Snd.ctx; if (!c) return { stop: function () {} };
    var g = c.createGain(), fl = c.createBiquadFilter(), src = [], t = c.currentTime;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + 2);
    fl.type = 'lowpass'; fl.frequency.value = 700; fl.connect(g); g.connect(c.destination);
    var drone = { music: [55, 82.4, 110.2], crystal: [440, 660.5, 880], groans: [48, 51], hall: [73, 110] }[n];
    if (drone) drone.forEach(function (f) {
      var o = c.createOscillator(); o.type = n === 'crystal' ? 'sine' : 'sawtooth'; o.frequency.value = f; o.connect(fl); o.start(); src.push(o);
    });
    if (!drone || n === 'hall' || n === 'night' || n === 'fire') {
      if (!Snd.nb) Snd.noise(0.01, 100, 0);
      var s = c.createBufferSource(), bp = c.createBiquadFilter(), lfo = c.createOscillator(), lg = c.createGain();
      s.buffer = Snd.nb; s.loop = true; bp.type = n === 'fire' ? 'highpass' : 'bandpass'; bp.frequency.value = n === 'fire' ? 2500 : 380;
      lfo.frequency.value = 0.18; lg.gain.value = 140; lfo.connect(lg); if (n !== 'fire') lg.connect(bp.frequency);
      s.connect(bp); bp.connect(fl); s.start(); lfo.start(); src.push(s, lfo);
    }
    return { stop: function () {
      var u = c.currentTime; g.gain.cancelScheduledValues(u); g.gain.setValueAtTime(Math.max(0.0002, g.gain.value), u);
      g.gain.exponentialRampToValueAtTime(0.0001, u + 1.2);
      setTimeout(function () { src.forEach(function (o) { try { o.stop(); } catch (e) {} }); }, 1400);
    } };
  },
  oneSynth: function (n) {
    var T = function (f, d, ty, v, sl, de) { Snd.tone(f, d, ty, v, sl, de); }, N = function (d, f, v, sw, de) { Snd.noise(d, f, v, sw, de); }, i;
    switch (n) {
      case 'whoosh': N(3, 300, 0.25, 6); T(180, 3, 'sawtooth', 0.05, 0.3); break;
      case 'impact': N(2.5, 200, 0.6, 0.2); T(90, 2.5, 'sine', 0.6, 0.2); T(45, 3, 'sine', 0.5, 0.5); break;
      case 'steps': for (i = 0; i < 9; i++) N(0.12, 260, 0.2, 0.6, i * 0.62); break;
      case 'cough': for (i = 0; i < 3; i++) { N(0.15, 700, 0.25, 0.5, i * 0.28); T(160, 0.15, 'square', 0.08, 0.6, i * 0.28); } break;
      case 'gulp': T(220, 0.15, 'sine', 0.2, 0.5); T(180, 0.2, 'sine', 0.2, 0.5, 0.35); break;
      case 'heart': for (i = 0; i < 8; i++) { T(60, 0.2, 'sine', 0.5, 0.5, i * 0.7); T(55, 0.2, 'sine', 0.4, 0.5, i * 0.7 + 0.22); } break;
      case 'crack': N(0.12, 1500, 0.4, 0.3); T(120, 0.12, 'square', 0.2, 0.4); break;
      case 'roar': N(2.5, 500, 0.45, 0.4); T(110, 2.5, 'sawtooth', 0.35, 0.5); T(75, 2.5, 'square', 0.2, 0.6); break;
      case 'bell': for (i = 0; i < 4; i++) { T(196, 3, 'sine', 0.35, 0.98, i * 2.2); T(392, 2.5, 'sine', 0.15, 0.98, i * 2.2); } break;
      case 'thunder': N(3.5, 120, 0.7, 0.4); T(50, 3, 'sine', 0.4, 0.6); break;
      case 'scream': for (i = 0; i < 4; i++) T(700 + i * 90, 0.9, 'sawtooth', 0.07, 1.5, i * 0.7); break;
      case 'sword': N(0.9, 3000, 0.3, 0.5); T(1500, 0.9, 'triangle', 0.1, 1.6); break;
      case 'title': N(2.5, 150, 0.7, 0.3); T(70, 3, 'sine', 0.7, 0.4); T(140, 2, 'sawtooth', 0.2, 0.5); break;
    }
  },
  cue: function (n, loop, vol) {
    var isM = n === 'music', v = (isM ? Snd.mv : Snd.sv) * (vol || 1), a = this.aud[n];
    if (this.ok[n] && a) {
      var p = loop ? a : a.cloneNode(); p.loop = !!loop; p.volume = Math.min(1, v); p.currentTime = 0;
      var r = p.play(); if (r && r.catch) r.catch(function () {});
      if (loop) this.loops[n] = { stop: function () { p.pause(); } };
    } else if (loop) {
      this.loops[n] = this.loopSynth(n, isM ? 0.05 * Snd.mv : 0.04 * Snd.sv);
    } else this.oneSynth(n);
  },
  stopLoops: function (keepMusic) {
    for (var k in this.loops) if (!(keepMusic && k === 'music')) { try { this.loops[k].stop(); } catch (e) {} delete this.loops[k]; }
  },
  cam_: function (px, py, pz, lx, ly, lz) { this.cam.position.set(px, py, pz); this.cam.lookAt(lx, ly, lz); },
  go: function (i) {
    var self = this, sh = this.S[i]; this.i = i; this.lt = 0; this.ci = 0; this.si = 0;
    this.S.forEach(function (o) { o.g.visible = o.g === sh.g; });
    this.stopLoops(true); this.apply(sh); this.el.sub.classList.remove('on');
    this.el.title.className = ''; this.el.hint.style.opacity = i > 0 || this.hintT > 1.5 ? 1 : 0;
    if (sh.enter) sh.enter();
    if (sh.upd) sh.upd(0, 0, 0);
  },
  update: function (dt) {
    if (!this.on) return;
    dt = Math.min(dt, 0.05); this.lt += dt; this.hintT = (this.hintT || 0) + dt;
    var sh = this.S[this.i], k = this.lt / sh.dur, e = this.el, o = 0, a, b;
    while (this.ci < sh.cues.length && sh.cues[this.ci][0] <= this.lt) { a = sh.cues[this.ci++]; this.cue(a[1], a[2], a[3]); }
    while (this.si < sh.subs.length && sh.subs[this.si][0] <= this.lt) this.say(sh.subs[this.si++][1]);
    if (sh.upd) sh.upd(this.lt, Math.min(1, k), dt);
    if (this.shake > 0.001) {
      this.cam.position.x += (Math.random() - 0.5) * this.shake; this.cam.position.y += (Math.random() - 0.5) * this.shake;
      this.shake *= Math.pow(0.04, dt);
    }
    a = sh.fi === undefined ? 0.8 : sh.fi; b = sh.fo === undefined ? 0.7 : sh.fo;
    if (a > 0) o = Math.max(o, 1 - stClamp(this.lt, 0, a));
    if (b > 0) o = Math.max(o, stClamp(this.lt, sh.dur - b, sh.dur));
    if (this.skipping) { this.skT += dt; o = Math.max(o, Math.min(1, this.skT / 0.5)); if (this.skT >= 0.5) { this.finish(); return; } }
    e.fade.style.opacity = o;
    this.flash *= Math.pow(0.02, dt); e.flash.style.opacity = this.flash > 0.01 ? this.flash : 0;
    if (this.hintT > 1.5) e.hint.style.opacity = 1;
    stFx(dt);
    if (this.lt >= sh.dur && !this.skipping) { if (this.i + 1 < this.S.length) this.go(this.i + 1); else this.finish(); }
  },
  skip: function () { if (!this.on || this.skipping) return; this.skipping = true; this.skT = 0; },
  finish: function () {
    if (!this.on) return;
    this.on = false; this.stopLoops(); this.el.root.style.display = 'none';
    this.S.forEach(function (o) { o.g.visible = false; });
    var d = this.done; this.done = null; G.state = 'menu';
    if (d) d();
  },
  play: function (done) {
    this.done = done; this.skipping = false; this.on = true; this.hintT = 0; this.flash = 0; this.shake = 0;
    this.rehero(); this.el.root.style.display = 'block'; this.el.fade.style.opacity = 1;
    G.state = 'story'; Snd.resume(); Snd.cur = null; this.stopLoops();
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    this.cue('music', true); this.go(0);
  },
  build: function () {
    var self = this, s = this.scene;
    [this.b1, this.b2, this.b3, this.b4, this.b5, this.b6, this.b7, this.b8, this.b9].forEach(function (f) { f.call(self); });
    this.S.forEach(function (sh) { s.add(sh.g); sh.g.visible = false; });
  },
  shot: function (g, dur, o) {
    o.g = g; o.dur = dur; o.cues = o.cues || []; o.subs = o.subs || []; this.S.push(o); return o;
  },
  b1: function () {
    var self = this, g = new THREE.Group(), i, a, sm;
    stGround(g, 300, 0x14221c); var rd = stBox(g, 5, 0.1, 120, 0x2a2420, 0, 0.05, 0);
    [[-9, -4, 0.3], [9, 2, -0.4], [-10, 12, 0.2], [10, 14, -0.2], [-8, -16, 0.1], [9, -12, -0.3], [-12, 4, 1.3], [13, -4, -1.2]].forEach(function (h, n) {
      stHouse(g, h[0], h[1], h[2], 1 + (n % 3) * 0.1, n % 2 === 0, [0x5a4634, 0x6a5440, 0x4e3e30][n % 3]);
    });
    for (i = 0; i < 26; i++) { a = i * 0.5; var tx = Math.cos(a * 2.3) * (22 + (i % 5) * 6), tz = Math.sin(a * 2.3) * (30 + (i % 4) * 6) - 10; if (Math.abs(tx) > 6) stTree(g, tx, tz, 1 + (i % 3) * 0.25); }
    stCastle(g, 0, -70, 1.6, false); stMoon(g, -40, 55, -120, 7); stStars(g, 600, 180);
    stPoints(g, 40, 0xffe890, 1.2, [40, 4, 50], [1, 0.3, 1], 0.9).position.set(0, 0.5, 0);
    sm = stPoints(g, 30, 0x888899, 3, [3, 14, 3], [0.2, 1.2, 0.2], 0.25); sm.position.set(-9, 4, -4);
    this.shot(g, 18, {
      bg: 0x070b18, fog: [0x0a1226, 20, 120], amb: [0x4a5a9a, 0.5], hemi: [0x7a8aff, 0x1a1208, 0.5], key: [0xaabbff, 0.55, -30, 40, -20],
      p1: [0xffa040, 1.2, -9, 3, 0], p2: [0xffa040, 1, 9, 3, 6],
      cues: [[0, 'night', true, 1], [11, 'bell', false, 0.5]],
      subs: [[1, 'Королевство Ардемор. Год 1347.'], [7, 'Тихая ночь над деревней у королевского замка...'], [13, 'Никто не знал, что она станет последней.']],
      upd: function (t, k) {
        var e = stEase(k); self.cam_(stLerp(-30, -6, e) + Math.sin(t * 0.4), stLerp(40, 6, e), stLerp(60, 22, e), 0, stLerp(4, 3, e), -20);
      }
    });
  },
  b2: function () {
    var self = this, g = new THREE.Group(), i, hl, co = new THREE.Group(), tr = [];
    stGround(g, 400, 0x0e1812);
    for (i = 0; i < 14; i++) stBox(g, 10 + Math.random() * 14, 3 + Math.random() * 8, 10 + Math.random() * 10, 0x0c1410, -80 + i * 12, 1.5, -70 - Math.random() * 20);
    [[-8, -6, 0.3], [6, -10, -0.2], [14, -4, 0.5]].forEach(function (h) { stHouse(g, h[0], h[1], h[2], 1.1, true); });
    stTree(g, -16, -2, 1.4); stTree(g, 18, 0, 1.3); stTree(g, -3, 4, 1.1);
    stMoon(g, 30, 60, -150, 8); stStars(g, 700, 200);
    var head = stSprite(co, 0xaaffcc, 9, 0, 0, 0, 1);
    for (i = 1; i < 16; i++) tr.push(stSprite(co, 0x66ff99, 7 - i * 0.35, 0, 0, 0, 0.6 - i * 0.035));
    g.add(co);
    var P0 = new THREE.Vector3(-110, 110, -140), P1 = new THREE.Vector3(8, 4, -75);
    var ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.2, 40), stMat(0xaaffcc, 0.9, true)); ring.rotation.x = -Math.PI / 2; ring.position.copy(P1); ring.visible = false; g.add(ring);
    var glow = stSprite(g, 0x55ff88, 60, P1.x, 8, P1.z, 0); var dust = stPoints(g, 60, 0x99ffbb, 3, [14, 40, 14], [4, 6, 4], 0.7); dust.position.set(P1.x, 0, P1.z); dust.visible = false;
    var hit = false, pos = new THREE.Vector3(), look = new THREE.Vector3(-40, 70, -100);
    this.shot(g, 15, {
      bg: 0x04060e, fog: [0x070c18, 60, 260], amb: [0x3a4a8a, 0.4], hemi: [0x6a7aff, 0x101808, 0.4], key: [0x99aaff, 0.4, -30, 40, 20],
      p1: [0xffa040, 1.2, -8, 3, -3], p2: [0x55ff88, 0, 8, 6, -75],
      cues: [[0, 'night', true, 0.7], [3.6, 'whoosh', false, 1], [8.4, 'impact', false, 1], [9.5, 'thunder', false, 0.6]],
      subs: [[1.5, 'В ту ночь с неба упала звезда.'], [9.5, 'Она оставила в земле зелёный свет...']],
      enter: function () { hit = false; ring.visible = false; dust.visible = false; glow.material.opacity = 0; ring.scale.setScalar(1); co.visible = true; },
      upd: function (t, k, dt) {
        var q = stClamp(t, 3.6, 8.4), p = q * q;
        pos.lerpVectors(P0, P1, p); co.position.copy(pos); co.visible = t < 8.4;
        for (var i = 0; i < tr.length; i++) tr[i].position.set(-(P1.x - P0.x) * 0.012 * (i + 1) * 2, (i + 1) * 2.4, -(P1.z - P0.z) * 0.012 * (i + 1) * 2);
        if (t >= 8.4 && !hit) { hit = true; self.hit(1, 1.2); ring.visible = true; dust.visible = true; }
        if (hit) { var r = t - 8.4; ring.scale.setScalar(1 + r * 22); ring.material.opacity = Math.max(0, 0.9 - r * 0.25); glow.material.opacity = Math.min(0.8, r * 0.8) * (0.8 + Math.sin(t * 6) * 0.2); self.L.p2.intensity = 3 + Math.sin(t * 5); }
        else self.L.p2.intensity = 0;
        var tgt = hit ? P1 : pos; look.lerp(tgt, 0.05);
        self.cam_(-2 + stLerp(0, 3, k), 2.2, 14 - k * 3, look.x, hit ? 8 : look.y, look.z);
      }
    });
  },
  actor: function (cls, noWeapon) {
    var h = buildHero(cls, WP(Save.d.eq[cls])); if (noWeapon && h.weapon) h.weapon.visible = false; return h;
  },
  b3: function () {
    var self = this, g = new THREE.Group(), i, cr = new THREE.Group(), al = this.actor('mage', true);
    stGround(g, 200, 0x0e1410);
    var ringM = new THREE.Mesh(new THREE.RingGeometry(3, 9, 24), new THREE.MeshLambertMaterial({ color: 0x1a120c })); ringM.rotation.x = -Math.PI / 2; ringM.position.y = 0.03; g.add(ringM);
    var disc = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24), stMat(0x33ff77, 0.45, true)); disc.rotation.x = -Math.PI / 2; disc.position.y = 0.06; g.add(disc);
    [[0, 1.6, 0, 0.9, 3.4], [0.8, 1.1, 0.4, 0.6, 2.2], [-0.8, 0.9, -0.3, 0.55, 1.9], [0.2, 0.8, -0.9, 0.5, 1.6]].forEach(function (c, n) {
      var m = new THREE.Mesh(new THREE.OctahedronGeometry(c[3], 0), new THREE.MeshBasicMaterial({ color: n ? 0x55ff99 : 0xaaffcc })); m.scale.y = c[4] / c[3] * 0.5; m.position.set(c[0], c[1], c[2]); m.rotation.z = (n - 1.5) * 0.25; cr.add(m);
    });
    g.add(cr); var cg = stSprite(g, 0x44ff88, 14, 0, 2, 0, 0.8);
    stPoints(g, 70, 0x77ffaa, 1.6, [10, 10, 10], [0.6, 1.2, 0.6], 0.8);
    for (i = 0; i < 9; i++) stDead(g, Math.cos(i * 0.7) * (14 + (i % 3) * 5), Math.sin(i * 0.7) * (14 + (i % 3) * 5) - 4, 1 + (i % 3) * 0.2);
    stStars(g, 400, 180);
    var lan = stSprite(al.g, 0xffaa40, 1.6, 0.6, 1.2, 0.5, 0.9); al.g.rotation.y = Math.PI; g.add(al.g);
    this.shot(g, 14, {
      bg: 0x03060a, fog: [0x060d0e, 12, 70], amb: [0x2a4a3a, 0.4], hemi: [0x66ffaa, 0x0a0a08, 0.35], key: [0x8899cc, 0.3, -20, 30, 20],
      p1: [0x33ff77, 3, 0, 3, 0], p2: [0xffa040, 1.2, 0, 2, 12],
      cues: [[0, 'crystal', true, 1], [0.3, 'steps', false, 0.8]],
      subs: [[1.5, 'Придворный алхимик Марк первым нашёл осколок.'], [8, 'Он не знал, что держит в руках проклятие.']],
      enter: function () { al.g.position.set(0, 0, 14); },
      upd: function (t, k) {
        var w = stClamp(t, 0, 7), kn = stEase(stClamp(t, 7, 9.5)), moving = w > 0 && w < 1;
        al.g.position.z = stLerp(14, 4, stEase(w));
        animateHero(al, t, moving, 0);
        al.g.position.y = -kn * 0.45; al.armR.rotation.x = -1.2 * kn; al.armL.rotation.x = -0.9 * kn;
        al.legL.rotation.x = -1.3 * kn; al.legR.rotation.x = 0.4 * kn;
        cr.rotation.y = t * 0.6; cr.position.y = Math.sin(t * 1.5) * 0.2;
        var pu = 1 + Math.sin(t * 3) * 0.2; cg.scale.set(14 * pu, 14 * pu, 1); self.L.p1.intensity = 3 * pu + (t > 9 ? (t - 9) : 0);
        self.L.p2.position.set(al.g.position.x + 0.6, 1.5, al.g.position.z - 0.5);
        var an = stLerp(0.5, -0.9, stEase(k)), r = stLerp(14, 8, stEase(k));
        self.cam_(Math.sin(an) * r, stLerp(3.5, 1.6, k), Math.cos(an) * r + 2, 0, 1.8, 2);
      }
    });
  },
  b4: function () {
    var self = this, g = new THREE.Group(), i, W = 11, kg = this.actor('knight', true), al = this.actor('mage', true);
    var fl = stBox(g, 24, 0.3, 50, 0x23232c, 0, -0.15, -5);
    stBox(g, 4, 0.05, 50, 0x7a1a24, 0, 0.03, -5);
    stBox(g, 24, 14, 0.5, 0x2a2a36, 0, 7, -28); stBox(g, 0.5, 14, 50, 0x2a2a36, -W, 7, -5); stBox(g, 0.5, 14, 50, 0x2a2a36, W, 7, -5); stBox(g, 24, 0.5, 50, 0x1a1a22, 0, 14, -5);
    for (i = 0; i < 6; i++) [-1, 1].forEach(function (sd) {
      var z = 14 - i * 8; stBox(g, 1.4, 14, 1.4, 0x3c3c4a, sd * 8, 7, z);
      stBox(g, 1.2, 4, 0.1, 0x8a1a28, sd * 8, 8, z + 0.8); stBox(g, 0.5, 0.5, 0.12, 0xd6a93a, sd * 8, 9.4, z + 0.85, 0x886620);
      stBox(g, 0.2, 0.7, 0.2, 0x222, sd * 7.2, 5, z); stFlame(g, sd * 7.2, 5.4, z, 0.5);
    });
    stBox(g, 6, 8, 0.3, 0x3a66ff, 0, 8, -27.6, 0x2a44aa); stBox(g, 0.3, 8, 0.4, 0x222230, 0, 8, -27.4); stBox(g, 6, 0.3, 0.4, 0x222230, 0, 8, -27.4);
    stBox(g, 9, 1, 6, 0x3a3a46, 0, 0.5, -22); stBox(g, 6, 0.6, 2, 0x44444f, 0, 0.3, -18);
    stBox(g, 2.4, 0.4, 2, 0xd6a93a, 0, 1.2, -23, 0x553a10); stBox(g, 2.4, 3.6, 0.5, 0x7a1a24, 0, 3, -24.2); stBox(g, 2.8, 4.2, 0.3, 0xd6a93a, 0, 3.1, -24.6);
    [-1, 1].forEach(function (sd) { for (i = 0; i < 3; i++) { var gd = self.actor('knight'); gd.g.position.set(sd * 5, 0, 8 - i * 6); gd.g.rotation.y = -sd * Math.PI / 2; g.add(gd.g); (self.guards = self.guards || []).push(gd); } });
    kg.g.position.set(0, 1, -22); g.add(kg.g);
    kg.head.children.slice(1).forEach(function (c) { c.visible = false; });
    stBox(kg.head, 0.54, 0.16, 0.54, 0xf0c040, 0, 0.3, 0, 0x886620); stBox(kg.head, 0.12, 0.18, 0.12, 0xf0c040, 0, 0.45, 0.2, 0x886620); stBox(kg.head, 0.12, 0.18, 0.12, 0xf0c040, 0, 0.45, -0.2, 0x886620);
    stBox(kg.head, 0.5, 0.12, 0.5, 0x7a1a24, 0, 0.18, 0);
    var eyes = [-0.12, 0.12].map(function (x) { var e = stBox(kg.head, 0.1, 0.07, 0.04, 0x44ff66, x, 0.03, 0.25, 0x44ff66); e.visible = false; return e; });
    this.kSkin = kg.head.children[0].material;
    al.g.position.set(0, 0, 18); al.g.rotation.y = Math.PI; g.add(al.g);
    var vial = new THREE.Group(); stBox(vial, 0.18, 0.35, 0.18, 0x44ff77, 0, 0, 0, 0x33ff66); stSprite(vial, 0x44ff88, 1.2, 0, 0, 0, 0.8); g.add(vial);
    this.hall = { kg: kg, al: al, eyes: eyes, vial: vial, head: kg.head };
    this.shot(g, 18, {
      bg: 0x06060a, fog: [0x0a0a12, 25, 70], amb: [0x4a4a6a, 0.45], hemi: [0x6677ff, 0x201008, 0.35], key: [0x8899ff, 0.35, 0, 30, -10],
      p1: [0xff9a40, 1.4, -7, 5, -5], p2: [0xff9a40, 1.4, 7, 5, -15],
      cues: [[0, 'hall', true, 1], [7, 'cough', false, 0.7], [15.2, 'gulp', false, 1]],
      subs: [[1, 'Король Эдвин умирал от неизвестной болезни.'], [7, 'Лекари разводили руками. Алхимик предложил последнее средство.'], [13, '«Выпейте, Ваше Величество. Это спасёт вас».']],
      enter: function () {
        self.hall.al.g.position.set(0, 0, 18); self.kReset();
      },
      upd: function (t, k) {
        var H = self.hall, w = stEase(stClamp(t, 1, 9)), z = stLerp(18, -17, w);
        H.al.g.position.z = z; animateHero(H.al, t, w > 0 && w < 1, 0);
        animateHero(H.kg, t, false, 0); H.kg.body.rotation.x = 0.25 + Math.sin(t * 0.8) * 0.03; H.head.rotation.x = 0.25;
        var cg = (t > 7 && t < 8) ? Math.sin((t - 7) * 25) * 0.05 : 0; H.kg.body.position.y = cg;
        var ex = stEase(stClamp(t, 11.5, 13)); H.al.armR.rotation.x = -1.4 * ex;
        var dr = stEase(stClamp(t, 13.5, 15.2));
        var ax = H.al.g.position.x, az = H.al.g.position.z;
        H.vial.position.set(stLerp(ax + 0.4, 0, dr), stLerp(1.4, 2.7, dr), stLerp(az - 0.9, -21.6, dr)); H.vial.visible = t < 15.5;
        self.L.p1.intensity = 1.4 + Math.sin(t * 9) * 0.2; self.L.p2.intensity = 1.4 + Math.sin(t * 7 + 2) * 0.2;
        var w1 = stEase(stClamp(t, 0, 10)), m = stEase(stClamp(t, 9.5, 11));
        var ax1 = stLerp(0, -3, w1), az1 = stLerp(24, 2, w1);
        var px = stLerp(ax1, 3.2, m), py = stLerp(5, 3.2, m), pz = stLerp(az1, -12 + (t - 11) * 0.15, m);
        self.cam_(px, py, pz, 0, stLerp(3, 2.6, m), stLerp(-18, -21, m));
      }
    });
  },
  kReset: function () {
    var H = this.hall; this.kSkin.color.setHex(0xc9b8a0); this.kSkin.emissive.setHex(0x000000);
    H.eyes.forEach(function (e) { e.visible = false; e.scale.setScalar(1); });
    H.kg.body.rotation.set(0.25, 0, 0); H.kg.body.position.set(0, 0, 0); H.head.rotation.set(0.25, 0, 0);
    if (this.hallFx) this.hallFx.visible = false;
    (this.guards || []).forEach(function (gd, n) {
      var sd = n < 3 ? -1 : 1, i = n % 3; gd.g.position.set(sd * 5, 0, 8 - i * 6); gd.g.rotation.y = -sd * Math.PI / 2;
    });
  },
  b5: function () {
    var self = this, g = this.S[3].g, H = this.hall, pg = new THREE.Group(), pts = stPoints(pg, 80, 0x55ff88, 1.6, [3, 4, 3], [1.5, 2, 1.5], 0.9);
    pg.position.set(0, 1, -22); pg.visible = false; g.add(pg); this.hallFx = pg;
    this.shot(g, 16, {
      fi: 0, bg: 0x040806, fog: [0x061008, 20, 60], amb: [0x2a5a3a, 0.4], hemi: [0x55ff88, 0x101008, 0.3], key: [0x55ff88, 0.3, 0, 30, -10],
      p1: [0x33ff77, 1.5, 0, 4, -20], p2: [0xff9a40, 0.8, 0, 5, -10],
      cues: [[0.2, 'hall', true, 0.7], [0.5, 'heart', false, 1], [6.5, 'crack', false, 1], [8, 'crack', false, 1], [10, 'crack', false, 1], [11.5, 'roar', false, 1]],
      subs: [[1.5, 'Яд оказался сильнее болезни.'], [6, 'Король умер... и поднялся снова.'], [12.5, 'С голодом, который невозможно утолить.']],
      enter: function () { self.kReset(); pg.visible = true; },
      upd: function (t, k, dt) {
        var sk = stClamp(t, 2, 9), eyes = stEase(stClamp(t, 4, 6)), sh = 0.02 + stClamp(t, 3, 11) * 0.12;
        self.kSkin.color.setHex(0xc9b8a0).lerp(new THREE.Color(0x55aa55), sk);
        self.kSkin.emissive.setHex(0x113311).multiplyScalar(sk * (1 + Math.sin(t * 8) * 0.3));
        H.eyes.forEach(function (e) { e.visible = eyes > 0.1; e.scale.setScalar(1 + Math.sin(t * 9) * 0.2); });
        var rg = stEase(stClamp(t, 11, 11.6));
        H.kg.body.rotation.set(0.25 - rg * 0.7, 0, Math.sin(t * 22) * sh * (t < 11 ? 1 : 0.3));
        H.kg.body.position.set(Math.sin(t * 31) * sh * 0.4, 0, 0);
        H.head.rotation.set(0.25 - rg * 0.9, Math.sin(t * 3) * 0.2 * (1 - rg), 0);
        animateHero(H.kg, t, false, 0);
        H.kg.armL.rotation.x = -1.2 * sk; H.kg.armR.rotation.x = -1.2 * sk;
        self.L.p1.intensity = 1.5 + sk * 2 + Math.sin(t * 12) * 0.5;
        var f = stEase(stClamp(t, 8.5, 11)), fl = stEase(stClamp(t, 7.5, 11.5));
        (self.guards || []).forEach(function (gd, n) {
          var sd = n < 3 ? -1 : 1, i = n % 3;
          gd.g.position.x = sd * (5 + fl * 3); gd.g.position.z = 8 - i * 6 + fl * 22;
          gd.g.rotation.y = fl > 0.05 ? (sd < 0 ? 0.6 : -0.6) + Math.PI : -sd * Math.PI / 2;
          animateHero(gd, t + n, fl > 0.05 && fl < 1, 0);
        });
        H.al.g.position.z = -17 + f * 3;
        animateHero(H.al, t, false, 0); H.al.armL.rotation.x = -2.6 * f; H.al.armR.rotation.x = -2.6 * f;
        H.vial.visible = false;
        if (t > 11.4 && !self.rg) { self.rg = true; self.hit(0.8, 1.0); } if (t < 1) self.rg = false;
        var d = stEase(k);
        self.cam_(stLerp(3.5, 0.4, d), stLerp(4.2, 3.4, d), stLerp(-12, -17.2, d), 0, stLerp(2.6, 3.1, d), -22);
      }
    });
  },
  zom: function (g, type, x, z, sc) {
    var d = ENEMIES[type] || ENEMIES.walker, z0 = buildZombie(type, { skin: d.skin, cloth: d.cloth, scale: (d.scale || 1) * (sc || 1) });
    z0.g.position.set(x, 0, z); g.add(z0.g); return z0;
  },
  b6: function () {
    var self = this, g = new THREE.Group(), i, zs = [], lt = 0;
    stGround(g, 300, 0x0c120e); stBox(g, 6, 0.1, 120, 0x1e1a18, 0, 0.05, -10);
    stCastle(g, 0, -45, 1.7, true); stMoon(g, 40, 50, -120, 6); stStars(g, 400, 180);
    for (i = 0; i < 12; i++) stDead(g, (i % 2 ? 1 : -1) * (10 + i * 2), -10 - i * 4, 1.1);
    stPoints(g, 70, 0x55ff88, 4, [60, 3, 60], [2, 0.2, 1.5], 0.35).position.set(0, 0.5, -20);
    for (i = 0; i < 9; i++) zs.push({ z: self.zom(g, i % 3 === 2 ? 'runner' : 'walker', (i - 4) * 2.2, -30 - (i % 3) * 3, 1), x: (i - 4) * 2.2, z0: -30 - (i % 3) * 3, ph: i });
    this.shot(g, 17, {
      bg: 0x080612, fog: [0x0c0a1a, 15, 110], amb: [0x4a3a6a, 0.45], hemi: [0x9a77ff, 0x101008, 0.4], key: [0xaa99ff, 0.45, 20, 40, 20],
      p1: [0x33ff77, 3, 0, 8, -38], p2: [0xff7a30, 0.8, 0, 3, 10],
      cues: [[0, 'night', true, 0.6], [0.2, 'groans', true, 0.8], [3, 'thunder', false, 0.9], [6, 'bell', false, 0.8], [11, 'thunder', false, 1]],
      subs: [[1.5, 'Мёртвый король вернулся к своему двору.'], [7, 'Первыми пали стражи. Затем слуги. Затем весь замок.'], [12.5, 'Армия мёртвых росла с каждым часом.']],
      upd: function (t, k, dt) {
        zs.forEach(function (o) {
          var p = stClamp(t, 0, 17);
          o.z.g.position.set(o.x * (1 + p * 1.8), 0, o.z0 + p * 52); animateZombie(o.z, t, o.ph, 2);
        });
        var fl = (t > 2.9 && t < 3.3) || (t > 10.9 && t < 11.4) ? 0.6 : 0;
        if (fl && Math.random() < 0.5) self.hit(fl, 0.15);
        self.L.p1.intensity = 3 + Math.sin(t * 4);
        var e = stEase(k); self.cam_(stLerp(-6, 4, e), stLerp(2, 3, e), stLerp(24, 12, e), 0, stLerp(8, 5, e), -30);
      }
    });
  },
  b7: function () {
    var self = this, g = new THREE.Group(), i, hs = [], vs = [], zs = [];
    stGround(g, 300, 0x1a1210); stBox(g, 7, 0.1, 160, 0x2a2018, 0, 0.05, 0);
    for (i = 0; i < 6; i++) {
      var hx = (i % 2 ? 1 : -1) * 9, hz = -50 + i * 18, hh = stHouse(g, hx, hz, i % 2 ? -Math.PI / 2 : Math.PI / 2, 1.2, false, 0x3a2a22);
      stFlame(g, hx, 4.5, hz, 2.2); stFlame(g, hx + 1, 3.8, hz - 1, 1.5);
    }
    stPoints(g, 90, 0xff9a40, 1.6, [30, 14, 100], [1, 4, 1], 0.9);
    stPoints(g, 50, 0x555555, 3.5, [30, 16, 100], [1, 3, 1], 0.3);
    var cl = ['archer', 'knight', 'mage', 'archer', 'mage', 'knight', 'archer'];
    for (i = 0; i < 7; i++) { var v = this.actor(cl[i], false); v.g.rotation.y = Math.PI / 2; g.add(v.g); vs.push({ h: v, x: -60 + i * 9, z: -2 + (i % 3) * 1.6 }); }
    for (i = 0; i < 8; i++) zs.push({ z: this.zom(g, i % 3 ? 'walker' : 'runner', 0, 0, 1), x: -85 + i * 7, z0: -2.5 + (i % 4) * 1.3, ph: i });
    for (i = 0; i < zs.length; i++) zs[i].z.g.rotation.y = Math.PI / 2;
    stStars(g, 200, 180);
    this.shot(g, 16, {
      bg: 0x1a0a06, fog: [0x2a1008, 15, 90], amb: [0x6a3a2a, 0.5], hemi: [0xff8a50, 0x100804, 0.5], key: [0xff9a60, 0.4, 20, 30, 10],
      p1: [0xff7a20, 2.5, 0, 6, 0], p2: [0xff5a10, 2, 0, 6, 10],
      cues: [[0, 'fire', true, 1], [0.2, 'groans', true, 0.6], [1, 'scream', false, 1], [6, 'bell', false, 0.7], [9, 'scream', false, 0.9]],
      subs: [[1.5, 'Чума расползлась по деревням быстрее огня.'], [7, 'К рассвету от королевства Ардемор'], [10.5, 'не осталось ничего живого.']],
      upd: function (t, k) {
        vs.forEach(function (o, n) { o.h.g.position.set(-45 + ((o.x + 45 + t * 7) % 90 + 90) % 90 - 45 + 0, 0, o.z); animateHero(o.h, t * 1.8 + n, true, 0); });
        zs.forEach(function (o) { o.z.g.position.set(((o.x + 45 + t * 6.2) % 90 + 90) % 90 - 45 - 20, 0, o.z0); animateZombie(o.z, t, o.ph, 3); });
        var cx = stLerp(-18, 12, k), fl = Math.sin(t * 11) * 0.5 + Math.sin(t * 17) * 0.4;
        self.L.p1.position.set(cx - 4, 6, -4); self.L.p2.position.set(cx + 8, 6, 6); self.L.p1.intensity = 2.5 + fl; self.L.p2.intensity = 2 - fl * 0.8;
        self.cam_(cx, 2.4, 11, cx + 8, 2.2, 0);
      }
    });
  },
  b8: function () {
    var self = this, g = new THREE.Group(), i, zs = [], hero;
    stGround(g, 400, 0x20201a).position.y = -8;
    stBox(g, 40, 4, 40, 0x2c2c22, 0, -6, 0); stBox(g, 20, 3, 20, 0x38382a, 0, -2.5, 0); stBox(g, 9, 1.6, 9, 0x42422e, 0, -0.8, 0);
    for (i = 0; i < 14; i++) stBox(g, 0.1, 0.5, 0.1, 0x3a5a2a, Math.cos(i) * 3.5, 0.25, Math.sin(i * 1.7) * 3.5);
    this.rehero(); hero = this.heroHolder; hero.position.set(0, 0, 0); hero.rotation.y = 0; g.add(hero);
    for (i = 0; i < 6; i++) { var hx = -50 + i * 20, hz = -60 - (i % 3) * 12; stHouse(g, hx, hz - 4, i, 1.5, false, 0x2a2018).position.y = -8; stFlame(g, hx, -2, hz - 4, 2); }
    stPoints(g, 40, 0x666666, 6, [120, 40, 60], [1, 3, 1], 0.2).position.set(0, -8, -70);
    for (i = 0; i < 30; i++) { var o = this.zom(g, 'walker', (Math.random() - 0.5) * 120, -35 - Math.random() * 45, 1.4); o.g.position.y = -8; zs.push({ z: o, bx: o.g.position.x, bz: o.g.position.z, ph: i }); }
    var sun = new THREE.Mesh(new THREE.CircleGeometry(12, 28), new THREE.MeshBasicMaterial({ color: 0xffb060, fog: false })); sun.position.set(0, 4, -140); g.add(sun);
    var sg = stSprite(g, 0xff8a40, 120, 0, 4, -138, 0.7); sg.material.fog = false;
    stSprite(g, 0xff5a20, 260, 0, 0, -139, 0.35).material.fog = false;
    this.shot(g, 20, {
      bg: 0x3a1a1a, fog: [0x7a3a2a, 40, 190], amb: [0x8a5a4a, 0.55], hemi: [0xffaa70, 0x201410, 0.5], key: [0xffa060, 0.8, 0, 8, -60],
      p1: [0xffc090, 1.2, 0, 4, 10], p2: [0xff7a30, 0.6, 0, 3, -10],
      cues: [[0, 'dawn', true, 1], [0.2, 'groans', true, 0.35], [9, 'sword', false, 1], [11, 'sword', false, 0.5]],
      subs: [[1.5, 'Но один воин выжил.'], [6.5, 'Тот, кто не боится темноты.'], [12, 'Последний охотник на мёртвых.']],
      upd: function (t, k) {
        var tn = stEase(stClamp(t, 5, 8)), lift = stEase(stClamp(t, 9, 11.5));
        animateHero(self.hero, t, false, 0);
        self.hero.head.rotation.y = tn * 0.9;
        if (self.hero.cape) self.hero.cape.rotation.x = 0.2 + Math.sin(t * 2) * 0.08;
        var arm = Save.d.cls === 'archer' ? self.hero.armL : self.hero.armR; arm.rotation.x = -3.0 * lift;
        zs.forEach(function (o) { o.z.g.position.z = o.bz + t * 0.5; animateZombie(o.z, t, o.ph, 1); });
        var an = stLerp(Math.PI, 0.5, stEase(k)), r = stLerp(9, 6, stEase(k));
        self.cam_(Math.sin(an) * r + 0.0, stLerp(2.2, 1.0, k), Math.cos(an) * r, 0, stLerp(1.7, 2.6, k), 0);
      }
    });
  },
  b9: function () {
    var self = this, g = new THREE.Group(), shown = false;
    stPoints(g, 90, 0xff7a20, 2.2, [30, 20, 20], [1, 2, 1], 0.9).position.set(0, -4, -4);
    var gl = stSprite(g, 0xff4a10, 30, 0, 0, -8, 0.25);
    this.shot(g, 9, {
      fi: 0.2, fo: 1.2, bg: 0x040202, fog: [0x040202, 30, 80], amb: [0x000000, 0], hemi: [0x000000, 0x000000, 0], key: [0x000000, 0, 0, 1, 0],
      p1: [0x000000, 0, 0, 0, 0], p2: [0x000000, 0, 0, 0, 0],
      cues: [[1, 'title', false, 1]],
      enter: function () { shown = false; },
      upd: function (t) {
        self.cam_(0, 0, 10, 0, 0, 0);
        if (t > 1 && !shown) { shown = true; self.el.title.className = 'on'; self.hit(0.9, 0.6); }
        gl.material.opacity = 0.2 + (shown ? 0.2 : 0) + Math.sin(t * 5) * 0.05;
      }
    });
  }
};
Story.CUES = Story.NAMES;

