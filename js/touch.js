/* Touch controls: floating move stick (left) and aim stick (right, manual mode). Each stick owns its own pointerId. */
var TouchCtl = (function () {
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || (window.matchMedia && matchMedia('(pointer:coarse)').matches);
  var DEAD = 0.28, RADIUS = 56;
  function el(id) { return document.getElementById(id); }

  function Stick(zoneId, baseId, knobId, onVec, onEnd) {
    var pid = null, cx = 0, cy = 0, zone = el(zoneId), base = el(baseId), knob = el(knobId);
    function vec(e) {
      var dx = e.clientX - cx, dy = e.clientY - cy, l = Math.sqrt(dx * dx + dy * dy);
      if (l > RADIUS) { dx = dx / l * RADIUS; dy = dy / l * RADIUS; }
      knob.style.transform = 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px))';
      onVec(dx / RADIUS, dy / RADIUS);
    }
    function end() { pid = null; base.classList.remove('act'); knob.style.transform = 'translate(-50%,-50%)'; onEnd(); }
    zone.addEventListener('pointerdown', function (e) {
      if (pid !== null || e.pointerType === 'mouse') return;
      pid = e.pointerId; try { zone.setPointerCapture(pid); } catch (x) {}
      cx = e.clientX; cy = e.clientY;
      base.style.left = cx + 'px'; base.style.top = cy + 'px'; base.classList.add('act');
      vec(e); e.preventDefault();
    });
    zone.addEventListener('pointermove', function (e) { if (e.pointerId === pid) { vec(e); e.preventDefault(); } });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) {
      zone.addEventListener(t, function (e) { if (e.pointerId === pid) end(); });
    });
    return { reset: function () { if (pid !== null) end(); }, active: function () { return pid !== null; } };
  }

  var mv, aim;
  function setKeys(dx, dz) {
    var k = G.keys;
    k.KeyA = dx < -DEAD; k.KeyD = dx > DEAD; k.KeyW = dz < -DEAD; k.KeyS = dz > DEAD;
  }
  function reset() { if (mv) mv.reset(); if (aim) aim.reset(); setKeys(0, 0); }

  function init() {
    if (!isTouch) return;
    document.body.classList.add('is-touch');
    mv = Stick('zoneL', 'joyBase', 'joyKnob', setKeys, function () { setKeys(0, 0); });
    aim = Stick('zoneR', 'aimBase', 'aimKnob', function (dx, dy) {
      var l = Math.sqrt(dx * dx + dy * dy), st = Input.stick;
      if (l > DEAD) { st.on = true; st.ang = Math.atan2(dx, dy); } else st.on = false;
    }, function () { Input.stick.on = false; });

    var ab = el('abilBtn');
    ab.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); if (window.Abil) Abil.cast(); });
    el('touchPause').addEventListener('click', function () { UI.pause(true); });

    ['gesturestart', 'gesturechange'].forEach(function (t) { document.addEventListener(t, function (e) { e.preventDefault(); }); });
    document.addEventListener('touchmove', function (e) {
      if (!e.target.closest('.menuCol, .leaderboardList, #shopBody, .box, #pBuffs')) e.preventDefault();
    }, { passive: false });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    function orient() { document.body.classList.toggle('portrait', innerHeight > innerWidth); }
    addEventListener('resize', orient); addEventListener('orientationchange', orient); orient();

    document.addEventListener('click', function once() {
      document.removeEventListener('click', once);
      if (window.Fs && Fs.pref()) { Fs.on(); Fs.sync(); }
    });
  }
  function tick() {
    var on = isTouch && G.state === 'play', t = el('touch');
    t.classList.toggle('on', on);
    t.classList.toggle('manual', Save.d.atk === 'manual');
    if (!on && mv && (mv.active() || aim.active())) reset();
  }
  return { init: init, reset: reset, tick: tick, isTouch: isTouch };
}());
