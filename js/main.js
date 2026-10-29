var renderer, clock = { last: 0, t: 0 }, fpsA = { n: 0, t: 0 };

function resize() {
  var vv = window.visualViewport, w = Math.round(innerWidth), h = Math.round(innerHeight);
  if (vv && vv.scale === 1 && vv.height > 0) { h = Math.round(vv.height); w = Math.round(vv.width); }
  document.documentElement.style.setProperty('--vh', h * 0.01 + 'px');
  renderer.setSize(w, h); World.resize(w / h); Menu.resize(w / h); Shop3D.view(w / h); Story.view(w / h);
}

var Fs = (function () {
  var de = document.documentElement;
  var req = de.requestFullscreen || de.webkitRequestFullscreen;
  var KEY = 'deadslayer_fs_v1';
  function cur() { return document.fullscreenElement || document.webkitFullscreenElement; }
  function pref() { try { return localStorage.getItem(KEY) !== '0'; } catch (e) { return true; } }
  function setPref(v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {} }
  function sync() { var c = $('optFs'); if (c) c.checked = !!cur(); }
  function on() {
    if (!req || cur()) return;
    try { var p = req.call(de); if (p && p.catch) p.catch(function () { sync(); }); } catch (e) {}
  }
  function off() {
    var x = document.exitFullscreen || document.webkitExitFullscreen;
    if (x && cur()) { try { var p = x.call(document); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
  }
  function init() {
    var c = $('optFs'); if (!c) return;
    if (!req) {
      c.disabled = true; c.checked = false; $('fsRow').style.opacity = .55;
      if (/iPhone|iPod/.test(navigator.userAgent)) $('fsHint').style.display = '';
      return;
    }
    c.onchange = function () { setPref(c.checked); if (c.checked) on(); else off(); };
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (t) {
      document.addEventListener(t, function () {
        if (!cur()) setPref(false);
        sync(); setTimeout(resize, 120);
      });
    });
    sync();
  }
  return { init: init, on: on, pref: pref, sync: sync };
}());

function frame(now) {
  requestAnimationFrame(frame);
  var dt = Math.min(0.05, (now - clock.last) / 1000); clock.last = now; clock.t += dt;
  var st = G.state, t = clock.t;
  if (st === 'menu' || st === 'splash') {
    Menu.update(dt, t); renderer.render(Menu.scene, Menu.cam);
  } else if (st === 'story') {
    Story.update(dt); if (G.state === 'story') renderer.render(Story.scene, Story.cam);
  } else if (st === 'shop' || st === 'shopIn' || st === 'shopOut') {
    Shop3D.update(dt); renderer.render(Shop3D.scene, Shop3D.cam);
  } else {
    if (st === 'play') { var sd = dt * Cheat.v.ts, ns = Math.max(1, Math.min(300, Math.ceil(sd / 0.05))); for (var si = 0; si < ns && G.state === 'play'; si++) updateGame(sd / ns, t); }
    if (G.p) World.update(dt, G.p.x, G.p.z);
    FX.update(st === 'play' ? dt : 0);
    renderer.render(World.scene, World.cam);
  }
  if (window.Season) Season.update(dt, st, G.p && G.p.x, G.p && G.p.z);
  TouchCtl.tick();
  fpsA.n++; fpsA.t += dt;
  if (fpsA.t >= 0.5) { if (Save.d.gfx.fps) $('fps').textContent = Math.round(fpsA.n / fpsA.t) + ' FPS'; fpsA.n = 0; fpsA.t = 0; }
}

function fmtTime(s) { var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? h + ' ч ' + m + ' мин' : m + ' мин'; }

function renderSettings() {
  var g = Save.d.gfx, st = Save.d.stats;
  document.querySelectorAll('#gfxQ button').forEach(function (b) { b.classList.toggle('act', b.dataset.q === g.q); });
  document.querySelectorAll('input[data-g]').forEach(function (i) { i.checked = !!g[i.dataset.g]; });
  document.querySelectorAll('#atkSel button').forEach(function (b) { b.classList.toggle('act', b.dataset.atk === Save.d.atk); });
  $('statsBox').innerHTML = [['Забегов', st.runs], ['Смертей', st.deaths], ['Убито зомби', st.kills], ['Лучшая волна', st.best],
    ['Боссов', st.bosses], ['Заработано монет', st.earned], ['Время в игре', fmtTime(st.time)]].map(function (r) { return '<div>' + r[0] + '<b>' + r[1] + '</b></div>'; }).join('');
}

function openSettings() { UI.syncVol(); renderSettings(); UI.modal('settings', true); }

function boot() {
  Save.load();
  if (window.Online) Online.wire();
  renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: true });
  World.init(); Menu.init(); Shop3D.init(); FX.init(World.scene); Shop.init(renderer);
  Story.init(); Story.view(innerWidth / innerHeight);
  Snd.mv = Save.d.mv; Snd.sv = Save.d.sv;
  GFX.apply();
  G.state = 'splash'; UI.screen('none');
  Input.init(); TouchCtl.init();
  if (window.Season) Season.init();
  if (window.Intro) Intro.start(function () { UI.screen('splash'); }); else UI.screen('splash');
  addEventListener('resize', resize);
  addEventListener('orientationchange', function () { setTimeout(resize, 150); setTimeout(resize, 500); });
  if (window.visualViewport) visualViewport.addEventListener('resize', resize);
  Fs.init(); resize();

  $('splash').addEventListener('click', function () { Snd.init(); Snd.resume(); Flow.menu(); Menu.intro(); });
  document.addEventListener('click', function (e) { if (e.target.closest('button')) { Snd.resume(); Snd.sfx('click'); } });

  function askAtk(next) {
    $('atkManualHint').textContent = TouchCtl.isTouch ? 'второй стик справа' : 'мышь + ЛКМ';
    function pick(m) { Save.d.atk = m; Save.save(); UI.modal('atkModal', false); next(); }
    $('atkAuto').onclick = function () { pick('auto'); };
    $('atkManual').onclick = function () { pick('manual'); };
    UI.modal('atkModal', true);
  }
  $('btnPlay').onclick = function () { askAtk(function () { Flow.play(false); }); };
  $('btnCont').onclick = function () { Flow.play(true); };
  $('btnShop').onclick = function () { Flow.shop(); };
  $('btnSet').onclick = openSettings;
  $('btnStory').onclick = function () { Flow.story(function () { Flow.menu(); if (Menu.intro) Menu.intro(); UI.fade(false, 900); }); };
  $('btnAccount').onclick = function () { if (window.Online) Online.openAccount(); };
  $('btnLeaderboard').onclick = function () { if (window.Online) Online.openLeaderboard(); };
  $('setBack').onclick = function () { UI.modal('settings', false); Save.save(); };
  $('shopBack').onclick = Flow.shopBack;
  $('btnPause').onclick = function () { UI.pause(true); };
  $('resume').onclick = function () { UI.pause(false); };
  $('pSet').onclick = openSettings;
  $('pQuit').onclick = Flow.quit;
  $('retry').onclick = function () { askAtk(function () { Flow.play(false); }); };
  document.querySelectorAll('#atkSel button').forEach(function (b) {
    b.onclick = function () { Save.d.atk = b.dataset.atk; Save.save(); renderSettings(); };
  });
  $('overMenu').onclick = Flow.quit;
  $('cine').onclick = function () { LevelUp.skip(); };
  $('cards').addEventListener('click', function (e) {
    var c = e.target.closest('.card'); if (c && LevelUp.picks[+c.dataset.i]) LevelUp.pick(LevelUp.picks[+c.dataset.i]);
  });
  document.querySelectorAll('#clsSel button').forEach(function (b) {
    b.onclick = function () {
      if (!clsUnlocked(b.dataset.c)) { UI.banner('Купи оружие этого класса в магазине'); return; }
      Save.d.cls = b.dataset.c; Save.d.run = null; Save.save(); Flow.menu();
    };
  });
  document.querySelectorAll('#setTabs button').forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll('#setTabs button').forEach(function (x) { x.classList.toggle('act', x === b); });
      document.querySelectorAll('.spane').forEach(function (p) { p.style.display = p.id === 'sp_' + b.dataset.t ? '' : 'none'; });
    };
  });
  document.querySelectorAll('#gfxQ button').forEach(function (b) {
    b.onclick = function () { Save.d.gfx.q = b.dataset.q; GFX.apply(); renderSettings(); Save.save(); };
  });
  document.querySelectorAll('input[data-g]').forEach(function (i) {
    i.onchange = function () { Save.d.gfx[i.dataset.g] = i.checked; GFX.apply(); Save.save(); if (window.Season) Season.refresh(true); };
  });
  document.querySelectorAll('input[data-v]').forEach(function (i) {
    i.addEventListener('input', function () { Snd[i.dataset.v] = i.value / 100; Save.d[i.dataset.v] = i.value / 100; UI.rng(i); });
    i.addEventListener('change', function () { Save.save(); });
  });

  addEventListener('keydown', function (e) {
    var typing = e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
    if (typing) { if (e.code === 'Escape' && !(window.Online && Online.isGate())) { var am = $('accountModal'); if (am.classList.contains('on')) am.classList.remove('on'); } return; }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) >= 0) e.preventDefault();
    if (G.state === 'story') {
      if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Escape') { e.preventDefault(); Story.skip(); }
      return;
    }
    G.keys[e.code] = true;
    if (e.code === 'KeyE' && window.Abil) Abil.cast();
    if (e.code === 'Escape' || e.code === 'KeyP') {
      var openTop = ['accountModal', 'leaderboardModal', 'settings'].filter(function (m) { return $(m).classList.contains('on'); })[0];
      if (openTop === 'accountModal' && window.Online && Online.isGate()) { /* login is mandatory */ }
      else if (openTop) { if (e.code === 'Escape') { UI.modal(openTop, false); if (openTop === 'settings') Save.save(); } }
      else if (G.state === 'shop' && e.code === 'Escape') Flow.shopBack();
      else if (G.state === 'play') UI.pause(true); else if (G.state === 'pause') UI.pause(false);
    }
    if (e.code === 'Digit1') LevelUp.key(0);
    if (e.code === 'Digit2') LevelUp.key(1);
    if (e.code === 'Digit3') LevelUp.key(2);
    if ((e.code === 'Space' || e.code === 'Enter') && G.state === 'levelup') LevelUp.skip();
  });
  addEventListener('keyup', function (e) { G.keys[e.code] = false; });
  addEventListener('blur', function () { G.keys = {}; if (G.state === 'play') UI.pause(true); });
  addEventListener('beforeunload', function () { Save.save(); Save.flush(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { Save.save(); Save.flush(); } });

  requestAnimationFrame(frame);
}
boot();
