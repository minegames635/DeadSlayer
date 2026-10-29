/* Virtual joystick for phones/tablets. Feeds the same G.keys flags the keyboard uses. */
var TouchCtl = (function () {
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || (window.matchMedia && matchMedia('(pointer:coarse)').matches);
  var DEAD = 0.28, RADIUS = 56, pid = null, cx = 0, cy = 0;
  function el(id) { return document.getElementById(id); }

  function setKeys(dx, dz) {
    var k = G.keys;
    k.KeyA = dx < -DEAD; k.KeyD = dx > DEAD; k.KeyW = dz < -DEAD; k.KeyS = dz > DEAD;
  }
  function reset() {
    pid = null; setKeys(0, 0);
    var kn = el('joyKnob'); if (kn) kn.style.transform = 'translate(-50%,-50%)';
  }
  function move(e) {
    var dx = e.clientX - cx, dy = e.clientY - cy, l = Math.sqrt(dx * dx + dy * dy);
    if (l > RADIUS) { dx = dx / l * RADIUS; dy = dy / l * RADIUS; }
    el('joyKnob').style.transform = 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px))';
    setKeys(dx / RADIUS, dy / RADIUS);
  }
  function init() {
    if (!isTouch) return;
    document.body.classList.add('is-touch');
    var base = el('joyBase');
    base.addEventListener('pointerdown', function (e) {
      if (pid !== null) return;
      pid = e.pointerId; base.setPointerCapture(pid);
      var r = base.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      move(e); e.preventDefault();
    });
    base.addEventListener('pointermove', function (e) { if (e.pointerId === pid) { move(e); e.preventDefault(); } });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) {
      base.addEventListener(t, function (e) { if (e.pointerId === pid) reset(); });
    });
    el('touchPause').addEventListener('click', function () { UI.pause(true); });

    // block iOS pinch/double-tap zoom and rubber-band scrolling
    ['gesturestart', 'gesturechange'].forEach(function (t) { document.addEventListener(t, function (e) { e.preventDefault(); }); });
    document.addEventListener('touchmove', function (e) {
      if (!e.target.closest('.menuCol, .leaderboardList, #shopBody, .box, #pBuffs')) e.preventDefault();
    }, { passive: false });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    function orient() { document.body.classList.toggle('portrait', innerHeight > innerWidth); }
    addEventListener('resize', orient); addEventListener('orientationchange', orient); orient();

    // iOS Safari has no fullscreen API on iPhone; request it where available (Android, iPad)
    document.addEventListener('click', function once() {
      var d = document.documentElement, f = d.requestFullscreen || d.webkitRequestFullscreen;
      if (f) { try { var p = f.call(d); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
      document.removeEventListener('click', once);
    });
  }
  function tick() {
    var on = isTouch && G.state === 'play';
    el('touch').classList.toggle('on', on);
    if (!on && pid !== null) reset();
  }
  return { init: init, reset: reset, tick: tick, isTouch: isTouch };
}());
