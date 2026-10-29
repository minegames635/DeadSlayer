var Intro = (function () {
  var KEY = 'deadslayer_consent_v1';
  function el(id) { return document.getElementById(id); }
  function accepted() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }

  function logoSplash(next) {
    var box = el('intro'), done = false;
    function end() {
      if (done) return; done = true;
      box.classList.remove('show'); box.classList.add('out');
      setTimeout(function () { box.style.display = 'none'; next(); }, 700);
    }
    box.style.display = 'flex';
    void box.offsetWidth;
    box.classList.add('show');
    setTimeout(end, 3600);
    setTimeout(function () { box.addEventListener('click', end); }, 900);
  }

  function consent(next) {
    if (accepted()) return next();
    var ids = ['cAge', 'cBoard', 'cRights'], ok = el('consentOk');
    function sync() { ok.disabled = !ids.every(function (i) { return el(i).checked; }); }
    ids.forEach(function (i) { el(i).checked = false; el(i).onchange = sync; });
    sync();
    ok.onclick = function () {
      if (ok.disabled) return;
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      el('consent').classList.remove('on');
      next();
    };
    el('consent').classList.add('on');
  }

  function start(done) {
    logoSplash(function () {
      consent(function () {
        if (window.Online) Online.requireLogin(done); else done();
      });
    });
  }
  return { start: start };
}());
