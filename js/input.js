var Input = (function () {
  var mx = 0, my = 0, hasMouse = false, down = false, v0 = null, v1 = null;
  var stick = { on: false, ang: 0 };

  function isUi(t) { return t && t.closest && t.closest('button, .modal, .box, #touch, #hud button'); }

  function mouseAngle(px, pz) {
    if (!v0) { v0 = new THREE.Vector3(); v1 = new THREE.Vector3(); }
    var cam = World.cam; cam.updateMatrixWorld();
    var nx = mx / innerWidth * 2 - 1, ny = -(my / innerHeight) * 2 + 1;
    v0.set(nx, ny, -1).unproject(cam); v1.set(nx, ny, 1).unproject(cam);
    var dy = v1.y - v0.y; if (Math.abs(dy) < 1e-6) return null;
    var k = -v0.y / dy, wx = v0.x + (v1.x - v0.x) * k, wz = v0.z + (v1.z - v0.z) * k;
    var dx = wx - px, dz = wz - pz;
    if (dx * dx + dz * dz < 0.01) return null;
    return Math.atan2(dx, dz);
  }

  function tick() {
    var A = G.aim, p = G.p;
    if (Save.d.atk !== 'manual' || !p) { A.on = false; A.fire = false; return; }
    if (stick.on) { A.on = true; A.fire = true; A.ang = stick.ang; return; }
    if (hasMouse) {
      var a = mouseAngle(p.x, p.z);
      if (a !== null) { A.ang = a; A.on = true; }
      A.fire = down && G.state === 'play';
    } else { A.fire = false; }
  }

  function clear() { down = false; stick.on = false; if (G.aim) { G.aim.fire = false; G.aim.on = false; } }

  function init() {
    addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      mx = e.clientX; my = e.clientY; hasMouse = true;
    });
    addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || G.state !== 'play' || isUi(e.target)) return;
      mx = e.clientX; my = e.clientY; hasMouse = true;
      if (e.button === 0) down = true;
      else if (e.button === 2) { e.preventDefault(); if (window.Abil) Abil.cast(); }
    });
    addEventListener('pointerup', function (e) { if (e.button === 0) down = false; });
    addEventListener('contextmenu', function (e) { if (G.state === 'play' || G.state === 'pause') e.preventDefault(); });
    addEventListener('blur', clear);
  }

  return { init: init, tick: tick, clear: clear, stick: stick };
}());
