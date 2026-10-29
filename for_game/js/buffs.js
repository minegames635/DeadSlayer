var R_REG = 0, R_SUP = 1, R_EPIC = 2, R_MYTH = 3, R_LEG = 4;
function pct(v) { return Math.round(v * 100) + '%'; }
function f1(v) { return (Math.round(v * 10) / 10).toString(); }

var BUFFS = [
  { id: 'dmg', ic: '⚔', n: 'Мощь', min: 0, d: function (m) { return '+' + pct(0.12 * m) + ' к урону'; }, ap: function (S, m) { S.dmgM += 0.12 * m; } },
  { id: 'rate', ic: '⚡', n: 'Ярость', min: 0, d: function (m) { return '+' + pct(0.09 * m) + ' к скорости атаки'; }, ap: function (S, m) { S.rateM += 0.09 * m; } },
  { id: 'hp', ic: '♥', n: 'Стойкость', min: 0, d: function (m) { return '+' + Math.round(18 * m) + ' макс. здоровья и лечение'; }, ap: function (S, m) { S.maxHp += Math.round(18 * m); S.hp += Math.round(18 * m); } },
  { id: 'spd', ic: '»', n: 'Ветер', min: 0, d: function (m) { return '+' + pct(0.07 * m) + ' к скорости бега'; }, ap: function (S, m) { S.spdM += 0.07 * m; } },
  { id: 'crit', ic: '✹', n: 'Меткость', min: 0, d: function (m) { return '+' + pct(0.06 * m) + ' шанса крита'; }, ap: function (S, m) { S.crit += 0.06 * m; } },
  { id: 'critd', ic: '☠', n: 'Беспощадность', min: 1, d: function (m) { return '+' + pct(0.2 * m) + ' урона крита'; }, ap: function (S, m) { S.critD += 0.2 * m; } },
  { id: 'luck', ic: '♣', n: 'Фортуна', min: 0, d: function (m) { return '+' + Math.round(3 * m) + ' удачи на этот забег'; }, ap: function (S, m) { S.luck += 3 * m; } },
  { id: 'armor', ic: '▣', n: 'Закалка', min: 0, d: function (m) { return '-' + pct(Math.min(0.5, 0.04 * m)) + ' входящего урона'; }, ap: function (S, m) { S.armor = Math.min(0.7, S.armor + 0.04 * m); } },
  { id: 'regen', ic: '✚', n: 'Живая вода', min: 0, d: function (m) { return '+' + f1(0.5 * m) + ' ХП в секунду'; }, ap: function (S, m) { S.regen += 0.5 * m; } },
  { id: 'steal', ic: '❖', n: 'Вампиризм', min: 1, d: function (m) { return 'Крадёт ' + f1(0.4 * m) + ' ХП за убийство'; }, ap: function (S, m) { S.steal += 0.4 * m; } },
  { id: 'magnet', ic: '◎', n: 'Магнит', min: 0, d: function (m) { return '+' + pct(0.25 * m) + ' радиус подбора'; }, ap: function (S, m) { S.magnet += 0.25 * m; } },
  { id: 'coin', ic: '●', n: 'Золотая жила', min: 0, d: function (m) { return '+' + pct(0.15 * m) + ' монет с врагов'; }, ap: function (S, m) { S.coinM += 0.15 * m; } },
  { id: 'range', ic: '↔', n: 'Размах', cls: ['knight'], min: 0, d: function (m) { return '+' + pct(0.07 * m) + ' дальности меча'; }, ap: function (S, m) { S.rangeM += 0.07 * m; } },
  { id: 'arc', ic: '◠', n: 'Широкий взмах', cls: ['knight'], min: 1, d: function (m) { return '+' + pct(0.1 * m) + ' угла удара'; }, ap: function (S, m) { S.arcM += 0.1 * m; } },
  { id: 'cleave', ic: '≋', n: 'Рассечение', cls: ['knight'], min: 2, d: function (m) { return 'Волна клинка летит вперёд (' + Math.round(40 * m) + '% урона)'; }, ap: function (S, m) { S.wave += 0.4 * m; } },
  { id: 'rrange', ic: '➳', n: 'Орлиный глаз', cls: ['mage', 'archer'], min: 0, d: function (m) { return '+' + pct(0.07 * m) + ' дальности выстрела'; }, ap: function (S, m) { S.rangeM += 0.07 * m; } },
  { id: 'psp', ic: '≫', n: 'Быстрый полёт', cls: ['mage', 'archer'], min: 0, d: function (m) { return '+' + pct(0.12 * m) + ' скорости снарядов'; }, ap: function (S, m) { S.psM += 0.12 * m; } },
  { id: 'multi', ic: '⁞', n: 'Мультизаряд', cls: ['mage', 'archer'], min: 1, d: function (m) { return '+' + (m >= 4 ? 2 : 1) + ' снаряд(а) за выстрел'; }, ap: function (S, m) { S.multi += (m >= 4 ? 2 : 1); } },
  { id: 'pierce', ic: '➶', n: 'Пронзание', cls: ['archer'], min: 0, d: function (m) { return 'Стрелы пробивают ещё ' + Math.max(1, Math.round(m)) + ' врагов'; }, ap: function (S, m) { S.pierce += Math.max(1, Math.round(m)); } },
  { id: 'aoe', ic: '✺', n: 'Взрывная магия', cls: ['mage'], min: 0, d: function (m) { return '+' + pct(0.12 * m) + ' радиуса взрыва'; }, ap: function (S, m) { S.aoeM += 0.12 * m; } },
  { id: 'burn', ic: '♨', n: 'Огненный след', cls: ['mage', 'archer'], min: 2, d: function (m) { return 'Поджигает врагов: ' + Math.round(8 * m) + ' урона/с'; }, ap: function (S, m) { S.burn += 8 * m; } },
  { id: 'blade', ic: '✠', n: 'Парящий клинок', min: 0, d: function (m) { return '+' + (m >= 4 ? 2 : 1) + ' клинок(а) вращаются вокруг тебя'; }, ap: function (S, m) { S.blades += (m >= 4 ? 2 : 1); } },
  { id: 'wisp', ic: '❂', n: 'Дух-хранитель', min: 1, d: function () { return 'Призывает духа, стреляющего по врагам'; }, ap: function (S) { addMinion('wisp'); } },
  { id: 'wolf', ic: '☾', n: 'Призрачный волк', min: 2, d: function () { return 'Призывает волка, рвущего врагов'; }, ap: function (S) { addMinion('wolf'); } },
  { id: 'aura', ic: '☢', n: 'Аура гнева', min: 1, d: function (m) { return 'Враги рядом получают ' + Math.round(10 * m) + ' урона/с'; }, ap: function (S, m) { S.aura += 10 * m; } },
  { id: 'nova', ic: '❂', n: 'Пульс', min: 2, d: function (m) { return 'Каждые ' + f1(Math.max(2.5, 6 - m * 0.5)) + ' с — взрыв вокруг героя'; }, ap: function (S, m) { S.nova = S.nova ? Math.max(2.5, S.nova - 1) : Math.max(2.5, 6 - m * 0.5); S.novaD += 1; } },
  { id: 'bolt', ic: '↯', n: 'Гнев небес', min: 2, d: function (m) { return 'Молния бьёт случайных врагов (' + Math.round(m) + ' за раз)'; }, ap: function (S, m) { S.bolt += Math.max(1, Math.round(m / 2)); } },
  { id: 'thorns', ic: '✱', n: 'Шипы', min: 1, d: function (m) { return 'Отражает ' + Math.round(40 * m) + '% полученного урона'; }, ap: function (S, m) { S.thorns += 0.4 * m; } },
  { id: 'frenzy', ic: '☄', n: 'Берсерк', min: 2, d: function (m) { return 'До +' + pct(0.15 * m) + ' урона и скорости при низком ХП'; }, ap: function (S, m) { S.frenzy += 0.15 * m; } },
  { id: 'revive', ic: '☥', n: 'Феникс', min: 3, d: function () { return 'Воскрешает один раз с 50% здоровья'; }, ap: function (S) { S.revive += 1; } },
  { id: 'titan', ic: '♛', n: 'Колосс', min: 4, d: function () { return '+40% урона, +60 здоровья, +15% скорости атаки'; }, ap: function (S) { S.dmgM += 0.4; S.rateM += 0.15; S.maxHp += 60; S.hp += 60; } }
];

function buffById(id) { for (var i = 0; i < BUFFS.length; i++) if (BUFFS[i].id === id) return BUFFS[i]; return null; }

function rollRarity(luck, minIdx) {
  var ws = RARITY.map(function (r, i) { return i === 0 ? r.w : r.w * (1 + luck * 0.035 * i); });
  var tot = 0; ws.forEach(function (w, i) { if (i >= (minIdx || 0)) tot += w; });
  var x = Math.random() * tot;
  for (var i = (minIdx || 0); i < ws.length; i++) { x -= ws[i]; if (x <= 0) return i; }
  return RARITY.length - 1;
}

function pickBuffs(n, rarIdx, cls, taken) {
  var pool = BUFFS.filter(function (b) {
    if (b.cls && b.cls.indexOf(cls) < 0) return false;
    if (b.id === 'revive' && taken.revive) return false;
    return true;
  });
  var out = [];
  while (out.length < n && pool.length) {
    var i = Math.floor(Math.random() * pool.length), b = pool.splice(i, 1)[0];
    var r = Math.max(rarIdx, b.min);
    if (b.min > rarIdx && Math.random() < 0.6) continue;
    out.push({ b: b, r: r });
  }
  while (out.length < n) {
    var fb = buffById('dmg'); out.push({ b: fb, r: rarIdx });
  }
  return out;
}
