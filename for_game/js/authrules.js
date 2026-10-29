/* Client-side validation for the account form. Firebase still enforces its own rules on the server. */
var AuthRules = (function () {
  var COMMON = ['password', 'password1', 'qwerty123', '12345678', '123456789', '1234567890', 'qwertyui', 'qwerty12', 'iloveyou',
    'admin123', 'letmein1', 'welcome1', 'abc12345', '11111111', '00000000', 'zxcvbnm1', 'qazwsx12', 'йцукен123', 'пароль123', 'deadslayer'];
  var LABELS = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Надёжный'];
  var COLORS = ['#e0334c', '#e8693a', '#e8b83a', '#8fd13a', '#2fd47a'];

  function email(v) { return /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 254; }

  function nick(v) {
    if (v.length < 3) return 'Никнейм: минимум 3 символа.';
    if (v.length > 20) return 'Никнейм: максимум 20 символов.';
    if (!/^[A-Za-z0-9А-Яа-яЁё _.\-]+$/.test(v)) return 'Никнейм: только буквы, цифры, пробел, точка, дефис и подчёркивание.';
    return '';
  }

  function password(p, mail, name) {
    var low = p.toLowerCase(), local = (mail || '').split('@')[0].toLowerCase();
    var r = {
      len: p.length >= 8,
      letter: /[A-Za-zА-Яа-яЁё]/.test(p),
      digit: /\d/.test(p),
      common: COMMON.indexOf(low) < 0 && !/^(.)\1+$/.test(p),
      personal: !((local.length >= 4 && low.indexOf(local) >= 0) || (name && name.length >= 4 && low.indexOf(name.toLowerCase()) >= 0))
    };
    var s = 0;
    if (r.len) s++;
    if (p.length >= 12) s++;
    if (/[a-zа-яё]/.test(p) && /[A-ZА-ЯЁ]/.test(p)) s++;
    if (r.letter && r.digit) s++;
    if (/[^A-Za-zА-Яа-яЁё0-9]/.test(p)) s++;
    if (/(.)\1{2,}/.test(p) || /(0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf|zxcv)/.test(low)) s = Math.min(s, 2);
    if (!r.len || !r.common || !r.personal) s = Math.min(s, 1);
    s = Math.min(4, s);
    return { rules: r, score: s, label: LABELS[s], color: COLORS[s], ok: r.len && r.letter && r.digit && r.common && r.personal };
  }

  return { email: email, nick: nick, password: password };
}());
