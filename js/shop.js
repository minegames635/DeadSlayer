var Thumbs = {
  cache: {}, rt: null, scene: null, cam: null, cv: null,
  get: function (def, renderer) {
    if (this.cache[def.id]) return this.cache[def.id];
    var S = 128;
    if (!this.rt) {
      this.rt = new THREE.WebGLRenderTarget(S, S);
      this.scene = new THREE.Scene();
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.85));
      var dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(2, 3, 4); this.scene.add(dl);
      this.cam = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
      this.cv = document.createElement('canvas'); this.cv.width = this.cv.height = S;
    }
    var w = buildWeapon(def), g = new THREE.Group(), inner = new THREE.Group();
    inner.add(w); g.add(inner);
    if (def.cls === 'knight') { inner.rotation.z = -Math.PI / 4; inner.rotation.x = -Math.PI / 2; w.position.z = -0.6 * def.len; g.scale.setScalar(1.0); }
    else if (def.cls === 'mage') { inner.rotation.z = -0.5; w.position.y = -0.55; }
    else { inner.rotation.y = -1.2; }
    this.scene.add(g);
    this.cam.position.set(0, 0.3, def.cls === 'knight' ? 5.2 : 5.6); this.cam.lookAt(0, 0.1, 0);
    var old = renderer.getRenderTarget();
    renderer.setRenderTarget(this.rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(this.scene, this.cam);
    var px = new Uint8Array(S * S * 4); renderer.readRenderTargetPixels(this.rt, 0, 0, S, S, px);
    renderer.setRenderTarget(old);
    this.scene.remove(g);
    var x = this.cv.getContext('2d'), im = x.createImageData(S, S);
    for (var y = 0; y < S; y++) for (var i = 0; i < S * 4; i++) im.data[y * S * 4 + i] = px[(S - 1 - y) * S * 4 + i];
    x.putImageData(im, 0, 0);
    return (this.cache[def.id] = this.cv.toDataURL());
  }
};

var Shop = {
  tab: 'knight', renderer: null, sel: null,
  tabs: [['knight', '⚔ Рыцарь'], ['mage', '✦ Маг'], ['archer', '➶ Лучник'], ['abil', '✺ Умения'], ['up', '▲ Прокачка']],
  col: function (n) { return '#' + ('000000' + n.toString(16)).slice(-6); },
  render: function () {
    var d = Save.d, h = '', self = this;
    $('shopCoins').textContent = d.coins;
    $('shopTabs').innerHTML = this.tabs.map(function (t) { return '<button data-tab="' + t[0] + '"' + (t[0] === self.tab ? ' class="act"' : '') + '>' + t[1] + '</button>'; }).join('');
    if (this.tab === 'abil') {
      ['knight', 'mage', 'archer'].forEach(function (c) {
        var a = ABIL[c], l = abilLevel(c), max = l >= a.max, cost = abilCost(c, l), pips = '';
        for (var i = 0; i < a.max; i++) pips += '<b class="' + (i < l ? 'f' : '') + '"></b>';
        h += '<div class="item" style="--c:#ffc933"><div class="sic">' + a.ic + '</div><div class="inf"><h4>' + a.n + ' <small>' + CLASSES[c].n + ' · ур. ' + l + '</small></h4><p>' + a.t +
          '. Перезарядка ' + (a.cd * Math.pow(0.92, Math.max(0, l - 1))).toFixed(1) + ' с. ПКМ / E на ПК, кнопка на телефоне.</p><div class="pips">' + pips + '</div></div>' +
          (max ? '<button disabled>МАКС</button>' : '<button data-a="abil" data-id="' + c + '"' + (d.coins < cost ? ' class="no"' : '') + '>' + (l ? 'Улучшить' : 'Купить') + ' · ' + cost + '</button>') + '</div>';
      });
    } else if (this.tab !== 'up') {
      var mx = { dmg: 80, spd: 2.6, range: 12.5 };
      WEAPONS.filter(function (w) { return w.cls === self.tab; }).forEach(function (s) {
        var own = d.owned.indexOf(s.id) >= 0, eq = d.eq[s.cls] === s.id;
        var btn = eq ? '<button disabled>Надето</button>' : own ? '<button data-a="equip" data-id="' + s.id + '">Надеть</button>' :
          '<button data-a="buy" data-id="' + s.id + '"' + (d.coins < s.cost ? ' class="no"' : '') + '>Купить · ' + s.cost + '</button>';
        var rg = s.cls === 'knight' ? s.range / 4.2 : s.range / mx.range;
        h += '<div class="item' + (eq ? ' eq' : '') + '" data-prev="' + s.id + '" style="--c:' + self.col(s.glow || s.color) + '"><img class="thumb" src="' + Thumbs.get(s, self.renderer) + '"><div class="inf"><h4>' + s.n + '</h4><p>' + s.d + '</p>' +
          '<div class="bars"><span>Урон<i style="width:' + s.dmg / mx.dmg * 100 + '%"></i></span><span>Скорость<i style="width:' + (1 / s.cd) / mx.spd * 100 + '%"></i></span><span>Дальность<i style="width:' + rg * 100 + '%"></i></span></div></div>' + btn + '</div>';
      });
    } else {
      UPG.forEach(function (u) {
        var l = d.up[u.id], max = l >= u.max, c = upCost(u, l), pips = '';
        for (var i = 0; i < u.max; i++) pips += '<b class="' + (i < l ? 'f' : '') + '"></b>';
        h += '<div class="item" style="--c:#b65cff"><div class="sic">' + u.ic + '</div><div class="inf"><h4>' + u.n + ' <small>ур. ' + l + '</small></h4><p>' + u.t + '</p><div class="pips">' + pips + '</div></div>' +
          (max ? '<button disabled>МАКС</button>' : '<button data-a="up" data-id="' + u.id + '"' + (d.coins < c ? ' class="no"' : '') + '>Улучшить · ' + c + '</button>') + '</div>';
      });
    }
    $('shopBody').innerHTML = h;
  },
  show: function (def) { this.sel = def; Shop3D.setItem(def); },
  click: function (e) {
    var tb = e.target.closest('button[data-tab]');
    if (tb) { this.tab = tb.dataset.tab; Snd.sfx('click'); this.render(); return; }
    var b = e.target.closest('button[data-a]'); if (!b) return;
    var d = Save.d, id = b.dataset.id, a = b.dataset.a;
    if (a === 'buy') {
      var s = WP(id);
      if (d.coins < s.cost) { Shop3D.speak(Shop3D.rnd(Shop3D.POOR)); return; }
      d.coins -= s.cost; d.owned.push(id); d.eq[s.cls] = id; d.cls = s.cls;
      Shop3D.speak(Shop3D.rnd(Shop3D.BUY)); Snd.sfx('coin');
    } else if (a === 'equip') {
      var w = WP(id); d.eq[w.cls] = id; d.cls = w.cls; Shop3D.speak(Shop3D.rnd(Shop3D.EQ));
    } else if (a === 'abil') {
      var ac = abilCost(id, abilLevel(id));
      if (d.coins < ac || abilLevel(id) >= ABIL[id].max) { Shop3D.speak(Shop3D.rnd(Shop3D.POOR)); return; }
      d.coins -= ac; d.abil[id] = abilLevel(id) + 1; Shop3D.speak(Shop3D.rnd(Shop3D.BUY)); Snd.sfx('coin');
    } else if (a === 'up') {
      var u = UPG.filter(function (x) { return x.id === id; })[0], c = upCost(u, d.up[id]);
      if (d.coins < c || d.up[id] >= u.max) { Shop3D.speak(Shop3D.rnd(Shop3D.POOR)); return; }
      d.coins -= c; d.up[id]++; Shop3D.speak(Shop3D.rnd(Shop3D.BUY)); Snd.sfx('coin');
    }
    Snd.sfx('buy'); Save.save(); this.render();
  },
  init: function (renderer) {
    var self = this; this.renderer = renderer;
    $('shopBody').addEventListener('click', function (e) { self.click(e); });
    $('shopTabs').addEventListener('click', function (e) { self.click(e); });
    $('shopBody').addEventListener('mouseover', function (e) {
      var it = e.target.closest('[data-prev]');
      if (it && (!self.sel || self.sel.id !== it.dataset.prev)) self.show(WP(it.dataset.prev));
    });
    this.show(WP(Save.d.eq.knight));
  }
};
