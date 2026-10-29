/* Firebase client integration. See FIREBASE_SETUP.md before enabling online writes. */
var Online = (function () {
  var app, auth, db, ready = false, busy = false, authKnown = false;
  var cheated = false, runStart = 0, runId = '';
  var mode = 'login', gate = false, required = false, gateCb = null, pendingNick = '';
  var fails = 0, lockUntil = 0, working = false;
  var config = {
    apiKey: 'AIzaSyC2SrEOB00Lr3nZrMEjX71VG3NAXZEf2LA',
    authDomain: 'deadslayer-72004.firebaseapp.com',
    projectId: 'deadslayer-72004',
    storageBucket: 'deadslayer-72004.firebasestorage.app',
    messagingSenderId: '1052275804721',
    appId: '1:1052275804721:web:428dbb2e8aad096215e310',
    measurementId: 'G-7V48PQN8YZ'
  };
  function el(id) { return document.getElementById(id); }
  function message(id, text, bad) {
    var n = el(id); n.textContent = text;
    if (id === 'accountMessage') n.classList.toggle('bad', !!bad);
  }
  function user() { return ready && auth.currentUser; }
  function isGoogle(u) { return !!u && u.providerData.some(function (p) { return p.providerId === 'google.com'; }); }
  function show(id, on) { el(id).style.display = on ? '' : 'none'; }
  function safeError(err) {
    var codes = {
      'auth/email-already-in-use': 'Эта почта уже зарегистрирована. Перейди на вкладку «Вход».',
      'auth/invalid-email': 'Проверь адрес электронной почты.',
      'auth/weak-password': 'Пароль слишком простой. Нужно минимум 8 символов.',
      'auth/user-not-found': 'Неверная почта или пароль.',
      'auth/wrong-password': 'Неверная почта или пароль.',
      'auth/invalid-credential': 'Неверная почта или пароль.',
      'auth/user-disabled': 'Этот аккаунт заблокирован.',
      'auth/too-many-requests': 'Слишком много попыток. Подожди несколько минут и повтори.',
      'auth/network-request-failed': 'Нет соединения с интернетом.',
      'auth/popup-closed-by-user': 'Окно Google было закрыто.',
      'auth/cancelled-popup-request': 'Окно Google было закрыто.',
      'auth/popup-blocked': 'Браузер заблокировал окно Google. Разреши всплывающие окна для сайта.',
      'auth/unauthorized-domain': 'Этот домен не добавлен в Firebase (Authorized domains).',
      'auth/operation-not-allowed': 'Этот способ входа выключен в Firebase.'
    };
    return codes[err && err.code] || 'Не удалось выполнить запрос. Попробуй ещё раз.';
  }
  function nick() { return (el('authNick').value || '').trim().replace(/\s+/g, ' ').slice(0, 20); }
  function waitSession(uid) {
    return new Promise(function (res) {
      var t0 = Date.now();
      (function poll() { if (Save.uid === uid || Date.now() - t0 > 6000) res(); else setTimeout(poll, 50); }());
    });
  }
  function saveNick(n, u) {
    pendingNick = n;
    return waitSession(u.uid).then(function () {
      if (Save.uid === u.uid) { if (!Save.d.playerNick) { Save.d.playerNick = n; Save.save(); } n = Save.d.playerNick; }
      if (u.displayName !== n) return u.updateProfile({ displayName: n });
    });
  }
  function pull(uid, retry) {
    return db.collection('saves').doc(uid).get().then(function (s) { Save.cloudSafe = true; return s.exists ? s.data() : null; }, function (e) {
      if (retry) return pull(uid, false);
      console.warn('Cloud save unavailable, using local copy:', e);
      Save.cloudSafe = false; return null;
    });
  }
  var sessionUid = null, sessionP = Promise.resolve(), lastApplied = undefined;
  function loadSession(u) {
    if (!u) { if (Save.uid) Save.detach(); sessionUid = null; sessionP = Promise.resolve(); return sessionP; }
    if (sessionUid === u.uid) return sessionP;
    sessionUid = u.uid;
    sessionP = pull(u.uid, true).then(function (cloud) {
      Save.attach(u.uid, cloud);
      if (!Save.d.playerNick) Save.d.playerNick = pendingNick || u.displayName || '';
      pendingNick = '';
      Save.writeLocal();
    });
    return sessionP;
  }
  function applySession(u) {
    var id = u ? u.uid : null;
    if (id === lastApplied) return;
    lastApplied = id;
    if (window.Snd) { Snd.mv = Save.d.mv; Snd.sv = Save.d.sv; }
    if (window.renderer && window.GFX) GFX.apply();
    if (window.renderer && G.state !== 'splash' && G.state !== 'story') { UI.closeModals(); Flow.menu(); if (Menu.intro) Menu.intro(); }
  }
  function logout() {
    if (!auth) return;
    UI.modal('settings', false);
    Save.save();
    var done = false;
    function go() { if (!done) { done = true; auth.signOut(); } }
    Save.flush().then(go, go);
    setTimeout(go, 3000);
  }
  function txt(id, t) { var n = el(id); if (n) n.textContent = t; }
  function record(reason) {
    if (!cheated) { cheated = true; }
    try {
      var items = JSON.parse(localStorage.getItem('deadslayer_flagged_runs') || '[]');
      items.push({ id: runId, reason: reason, at: Date.now() });
      localStorage.setItem('deadslayer_flagged_runs', JSON.stringify(items.slice(-50)));
    } catch (e) {}
  }
  function setAccount(u) {
    var g = isGoogle(u);
    var name = u ? (Save.d.playerNick || u.displayName || 'Игрок') : 'Не выполнен вход';
    txt('accountStatus', name);
    txt('accountSub', u ? 'Прогресс сохраняется в аккаунте' : 'Вход / регистрация');
    txt('accountAvatar', u ? name.charAt(0).toUpperCase() : '?');
    txt('setAccName', u ? name : 'Гость');
    txt('setAccMail', u ? (u.email || 'Google-аккаунт') : 'Войди, чтобы сохранять прогресс');
    show('btnSetLogout', !!u);
    ['authTabs', 'authForm'].forEach(function (id) { show(id, !u); });
    show('authAlt', !u && mode !== 'reset');
    show('authSigned', !!u);
    show('btnVerify', !!u && !g && !u.emailVerified);
    show('accountBack', !gate);
    if (u) {
      el('authTitle').textContent = 'Аккаунт';
      el('signedInfo').textContent = (u.displayName || '') + (u.email ? ' · ' + u.email : '') + (!g && !u.emailVerified ? ' · почта не подтверждена' : '');
    } else setMode(mode);
  }
  function setMode(m) {
    mode = m;
    var reg = m === 'register', rst = m === 'reset';
    el('authTitle').textContent = rst ? 'Сброс пароля' : reg ? 'Регистрация' : 'Вход в аккаунт';
    show('nickRow', reg); show('pass2Row', reg); show('pwMeter', reg);
    show('passwordRow', !rst); show('btnForgot', m === 'login');
    show('authAlt', !user() && !rst);
    el('btnSubmit').textContent = rst ? 'Отправить письмо' : reg ? 'Создать аккаунт' : 'Войти';
    el('tabLogin').classList.toggle('act', !reg && !rst);
    el('tabRegister').classList.toggle('act', reg);
    el('authPassword').autocomplete = reg ? 'new-password' : 'current-password';
    el('authPassword').placeholder = reg ? 'Не менее 8 символов, буквы и цифры' : 'Пароль';
    message('accountMessage', rst ? 'Укажи почту, и мы пришлём ссылку для смены пароля.'
      : reg ? 'Создай аккаунт. Никнейм увидят все игроки в таблице лидеров.' : (gate ? 'Чтобы играть, войди в аккаунт.' : 'Войди, чтобы отправлять результаты в таблицу лидеров.'));
    updateMeter();
  }
  function updateMeter() {
    var p = el('authPassword').value, r = AuthRules.password(p, el('authEmail').value.trim(), nick());
    el('pwFill').style.width = p ? (r.score + 1) * 20 + '%' : '0';
    el('pwFill').style.background = r.color;
    el('pwLabel').textContent = p ? r.label : '';
    el('pwLabel').style.color = r.color;
    Array.prototype.forEach.call(el('pwRules').children, function (li) { li.classList.toggle('ok', !!p && r.rules[li.dataset.r]); });
  }
  function init() {
    if (ready) return;
    try {
      if (!window.firebase) throw new Error('Firebase SDK недоступен. Проверь подключение к интернету.');
      app = firebase.apps.length ? firebase.app() : firebase.initializeApp(config);
      auth = firebase.auth(); db = firebase.firestore(); ready = true;
      Save.pushFn = function (uid, json, savedAt) {
        if (!Save.cloudSafe) return Promise.resolve();
        return db.collection('saves').doc(uid).set({ json: json, savedAt: savedAt, updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
          .catch(function (e) { console.warn('Cloud save failed:', e); });
      };
      auth.onAuthStateChanged(function (u) {
        loadSession(u).then(function () {
          authKnown = true;
          setAccount(u);
          applySession(u);
          if (!working) evaluate();
        });
      });
    } catch (e) {
      message('accountMessage', e.message || 'Не удалось подключить Firebase.', true);
    }
  }
  function openGate() {
    gate = true;
    if (window.G && G.state === 'play') UI.pause(true);
    el('accountModal').classList.add('on');
    if (!ready) {
      show('authTabs', false); show('authForm', false); show('authAlt', false); show('authSigned', false);
      show('btnForgot', false); show('accountBack', false); show('authRetry', true);
      el('authTitle').textContent = 'Нет соединения';
      message('accountMessage', 'Не удалось загрузить сервис входа. Проверь интернет и нажми «Повторить».', true);
      return;
    }
    show('authRetry', false);
    setAccount(null);
  }
  function evaluate() {
    if (!required) return;
    if (!ready) return openGate();
    if (!authKnown) return;
    if (user()) {
      gate = false; el('accountModal').classList.remove('on');
      var cb = gateCb; gateCb = null; if (cb) cb();
    } else openGate();
  }
  function requireLogin(cb) {
    gateCb = cb; gate = true; required = true;
    if (!ready) init();
    if (!ready) return openGate();
    if (authKnown) evaluate();
  }
  function openAccount() {
    if (!ready) init();
    show('authRetry', false);
    el('authNick').value = Save.d.playerNick || (user() && user().displayName) || '';
    setAccount(user() || null);
    if (!user()) setMode('login');
    el('accountModal').classList.add('on');
  }
  function closeAccount() { if (!gate) el('accountModal').classList.remove('on'); }

  function lockMsg() {
    var s = Math.ceil((lockUntil - Date.now()) / 1000);
    return s > 0 ? 'Слишком много неудачных попыток. Подожди ' + s + ' с.' : '';
  }
  function finish(okText) {
    working = false; el('btnSubmit').disabled = false;
    el('authPassword').value = ''; el('authPassword2').value = ''; updateMeter();
    if (okText) message('accountMessage', okText);
    evaluate();
  }
  function fail(e) {
    working = false; el('btnSubmit').disabled = false;
    message('accountMessage', typeof e === 'string' ? e : safeError(e), true);
  }
  function submit(ev) {
    if (ev) ev.preventDefault();
    if (working) return;
    if (!ready) { init(); if (!ready) return message('accountMessage', 'Firebase не подключён.', true); }
    var email = el('authEmail').value.trim().toLowerCase(), pass = el('authPassword').value;
    if (!AuthRules.email(email)) return message('accountMessage', 'Проверь адрес электронной почты.', true);
    if (mode === 'reset') {
      working = true; el('btnSubmit').disabled = true;
      auth.sendPasswordResetEmail(email).then(function () {}, function () {}).then(function () {
        finish('Если такой аккаунт есть, мы отправили письмо со ссылкой для смены пароля.');
      });
      return;
    }
    if (mode === 'login') {
      var lm = lockMsg(); if (lm) return message('accountMessage', lm, true);
      if (!pass) return message('accountMessage', 'Введи пароль.', true);
      working = true; el('btnSubmit').disabled = true;
      auth.signInWithEmailAndPassword(email, pass).then(function (cred) {
        fails = 0;
        var n = cred.user.displayName || Save.d.playerNick || email.split('@')[0].slice(0, 20);
        return saveNick(n, cred.user);
      }).then(function () { finish('Вход выполнен.'); }, function (e) {
        fails++; if (fails >= 5) lockUntil = Date.now() + Math.min(300, 30 * (fails - 4)) * 1000;
        fail(e);
      });
      return;
    }
    var n = nick(), ne = AuthRules.nick(n);
    if (ne) return message('accountMessage', ne, true);
    var pr = AuthRules.password(pass, email, n);
    if (!pr.ok) {
      return message('accountMessage', !pr.rules.len ? 'Пароль: минимум 8 символов.' : !pr.rules.letter || !pr.rules.digit ? 'Пароль должен содержать буквы и цифры.'
        : !pr.rules.common ? 'Этот пароль слишком простой.' : 'Пароль не должен содержать почту или никнейм.', true);
    }
    if (pass !== el('authPassword2').value) return message('accountMessage', 'Пароли не совпадают.', true);
    working = true; el('btnSubmit').disabled = true;
    var exists = function () { setMode('login'); fail('Эта почта уже зарегистрирована. Войди в аккаунт или нажми «Забыли пароль?».'); };
    auth.fetchSignInMethodsForEmail(email).catch(function () { return []; }).then(function (methods) {
      if (methods && methods.length) return exists();
      pendingNick = n;
      return auth.createUserWithEmailAndPassword(email, pass).then(function (cred) {
        return saveNick(n, cred.user).then(function () { return cred.user.sendEmailVerification().catch(function () {}); });
      }).then(function () { finish('Аккаунт создан. Мы отправили письмо для подтверждения почты.'); }, function (e) {
        if (e && e.code === 'auth/email-already-in-use') return exists();
        fail(e);
      });
    });
  }
  function google() {
    if (!ready) { init(); if (!ready) return message('accountMessage', 'Firebase не подключён.', true); }
    var provider = new firebase.auth.GoogleAuthProvider();
    working = true;
    auth.signInWithPopup(provider).then(function (cred) {
      var n = (Save.d.playerNick || cred.user.displayName || (cred.user.email || 'Игрок').split('@')[0]).trim().slice(0, 20);
      return saveNick(n, cred.user);
    }).then(function () { finish('Вход через Google выполнен.'); }, function (e) {
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
        working = false; return auth.signInWithRedirect(provider);
      }
      fail(e);
    });
  }
  function beginRun(wasCheated) {
    cheated = !!wasCheated; runStart = Date.now(); runId = Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  function markCheat(reason) { record(reason); }
  function submitRun() {
    var u = user();
    if (!u || cheated || !G || !G.wave || busy) return;
    var n = (Save.d.playerNick || u.displayName || '').trim().slice(0, 20);
    if (!n) return;
    busy = true;
    var ref = db.collection('leaderboard').doc(u.uid);
    db.runTransaction(function (tx) {
      return tx.get(ref).then(function (old) {
        var wave = Math.max(0, Math.floor(G.wave)), kills = Math.max(0, Math.floor(G.kills)), time = Math.max(0, Math.floor(G.time));
        var prev = old.exists ? old.data() : {};
        if (Number(prev.wave || 0) > wave) { wave = Number(prev.wave); kills = Number(prev.kills || 0); time = Number(prev.time || 0); }
        tx.set(ref, {
          uid: u.uid, nickname: n, wave: wave, kills: kills, time: time,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
    }).catch(function (e) {
      console.warn('Leaderboard submission failed:', e);
    }).then(function () { busy = false; });
  }
  function openLeaderboard() {
    el('leaderboardModal').classList.add('on');
    el('leaderboardList').textContent = '';
    if (!ready) init();
    if (!ready) return message('leaderboardMessage', 'Firebase SDK не загружен.');
    message('leaderboardMessage', 'Загрузка таблицы…');
    db.collection('leaderboard').orderBy('wave', 'desc').limit(50).get().then(function (snap) {
      var rows = [];
      snap.forEach(function (doc) { rows.push(doc.data()); });
      el('leaderboardList').innerHTML = rows.map(function (r, i) {
        var row = document.createElement('div'); row.className = 'leaderboardRow';
        var left = document.createElement('span'); left.textContent = (i + 1) + '. ' + String(r.nickname || 'Игрок').slice(0, 20);
        var right = document.createElement('b'); right.textContent = 'Волна ' + Math.max(0, Math.floor(r.wave || 0)) + ' · ☠ ' + Math.max(0, Math.floor(r.kills || 0));
        row.appendChild(left); row.appendChild(right); return row.outerHTML;
      }).join('');
      message('leaderboardMessage', rows.length ? 'Топ игроков по лучшей волне' : 'Пока нет результатов.');
    }).catch(function (e) { message('leaderboardMessage', safeError(e)); });
  }
  function wire() {
    el('authForm').addEventListener('submit', submit);
    el('tabLogin').onclick = function () { setMode('login'); };
    el('tabRegister').onclick = function () { setMode('register'); };
    el('btnForgot').onclick = function () { setMode('reset'); };
    el('btnGoogle').onclick = google;
    el('btnRetry').onclick = function () { location.reload(); };
    el('btnLogout').onclick = logout;
    el('btnSetLogout').onclick = logout;
    el('btnSetAccount').onclick = function () { UI.modal('settings', false); openAccount(); };
    el('btnVerify').onclick = function () {
      var u = user(); if (!u) return;
      u.sendEmailVerification().then(function () { el('signedInfo').textContent = 'Письмо отправлено. Проверь почту.'; }, function (e) { el('signedInfo').textContent = safeError(e); });
    };
    el('pwToggle').onclick = function () {
      var t = el('authPassword').type === 'password' ? 'text' : 'password';
      el('authPassword').type = t; el('authPassword2').type = t;
      el('pwToggle').textContent = t === 'text' ? 'Скрыть' : 'Показать';
    };
    ['authPassword', 'authEmail', 'authNick'].forEach(function (id) { el(id).addEventListener('input', updateMeter); });
    el('accountBack').onclick = closeAccount;
    el('leaderboardBack').onclick = function () { el('leaderboardModal').classList.remove('on'); };
    el('authNick').value = Save.d.playerNick || '';
    init();
  }
  return {
    wire: wire, openAccount: openAccount, openLeaderboard: openLeaderboard, requireLogin: requireLogin, closeAccount: closeAccount,
    isGate: function () { return gate; }, beginRun: beginRun, markCheat: markCheat, isCheated: function () { return cheated; }, submitRun: submitRun
  };
}());
