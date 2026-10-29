var Save = {
  d: null,
  def: function () {
    var up = {}; UPG.forEach(function (u) { up[u.id] = 0; });
    return {
      coins: 0, owned: ['rusty'], cls: 'knight', eq: { knight: 'rusty', mage: 'twig', archer: 'short' }, up: up,
      stats: { kills: 0, runs: 0, time: 0, best: 0, bosses: 0, earned: 0, deaths: 0 },
      gfx: { q: 'high', shadows: true, shake: true, dmg: true, vig: true, fps: false },
      mv: 0.6, sv: 0.7, run: null, introSeen: false
    };
  },
  uid: null, key: null, timer: null, pushFn: null, cloudSafe: true,
  DEVKEY: 'deadslayer_device_v1',
  fill: function (s) {
    var def = this.def();
    for (var key in def) {
      if (s[key] === undefined) s[key] = def[key];
      else if (def[key] && typeof def[key] === 'object' && !Array.isArray(def[key])) for (var q in def[key]) if (s[key][q] === undefined) s[key][q] = def[key][q];
    }
    return s;
  },
  applyDevice: function () {
    var v = null;
    try { v = JSON.parse(localStorage.getItem(this.DEVKEY)); } catch (e) {}
    if (!v) return;
    if (v.gfx) for (var k in v.gfx) this.d.gfx[k] = v.gfx[k];
    if (typeof v.mv === 'number') this.d.mv = v.mv;
    if (typeof v.sv === 'number') this.d.sv = v.sv;
  },
  /* Guest state: blank progress, nothing is written to disk. Real progress lives in attach()ed accounts. */
  load: function () { this.uid = null; this.key = null; this.d = this.def(); this.applyDevice(); },
  attach: function (uid, cloud) {
    var local = null, c = null;
    this.uid = uid; this.key = 'deadslayer_save_v3_' + uid;
    try { local = JSON.parse(localStorage.getItem(this.key)); } catch (e) {}
    if (cloud && cloud.json) { try { c = JSON.parse(cloud.json); } catch (e) {} }
    var pick = local;
    if (c && (!local || (c.savedAt || 0) > (local.savedAt || 0))) pick = c;
    this.d = pick ? this.fill(pick) : this.def();
    this.applyDevice();
  },
  detach: function () {
    this.writeLocal();
    clearTimeout(this.timer);
    this.uid = null; this.key = null; this.d = this.def(); this.applyDevice();
  },
  writeLocal: function () {
    try { localStorage.setItem(this.DEVKEY, JSON.stringify({ gfx: this.d.gfx, mv: this.d.mv, sv: this.d.sv })); } catch (e) {}
    if (!this.uid) return;
    this.d.savedAt = Date.now();
    try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch (e) {}
  },
  save: function () {
    this.writeLocal();
    if (!this.uid || !this.pushFn) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(function () { Save.flush(); }, 3000);
  },
  flush: function () {
    clearTimeout(this.timer);
    if (!this.uid || !this.pushFn) return Promise.resolve();
    return this.pushFn(this.uid, JSON.stringify(this.d), this.d.savedAt || Date.now());
  }
};

var RARITY = [
  { id: 'rare', n: 'Редкий', c: '#3fa7ff', m: 1, w: 52 },
  { id: 'super', n: 'Сверхредкий', c: '#37e0a0', m: 1.8, w: 28 },
  { id: 'epic', n: 'Эпический', c: '#b65cff', m: 3, w: 13 },
  { id: 'mythic', n: 'Мифический', c: '#ff4d6d', m: 4.6, w: 5.5 },
  { id: 'legend', n: 'Легендарный', c: '#ffc933', m: 7, w: 1.5 }
];

var CLASSES = {
  knight: { n: 'Рыцарь', ic: '⚔', d: 'Ближний бой. Крушит всех вокруг широкими ударами.' },
  mage: { n: 'Маг', ic: '✦', d: 'Самонаводящиеся шары, которые взрываются по площади.' },
  archer: { n: 'Лучник', ic: '➶', d: 'Пронзающие стрелы с большой дальностью.' }
};

var WEAPONS = [
  { id: 'rusty', cls: 'knight', n: 'Ржавый клинок', d: 'Старый меч для первых шагов.', dmg: 10, cd: 0.7, range: 2.6, arc: 2.0, len: 1.0, color: 0x9a8f86, glow: 0, guard: 0x6a4a30, cost: 0 },
  { id: 'iron', cls: 'knight', n: 'Железный меч', d: 'Надёжная солдатская сталь.', dmg: 15, cd: 0.64, range: 2.8, arc: 2.1, len: 1.1, color: 0xc4ccd6, glow: 0, guard: 0x8a6a40, cost: 150 },
  { id: 'steel', cls: 'knight', n: 'Закалённый меч', d: 'Острый и быстрый, с синим камнем.', dmg: 21, cd: 0.58, range: 3.0, arc: 2.2, len: 1.2, color: 0xe6f0ff, glow: 0x223344, guard: 0xb89a40, cost: 420 },
  { id: 'flame', cls: 'knight', n: 'Пылающий клинок', d: 'Волнистое лезвие, раскалённое добела.', dmg: 30, cd: 0.55, range: 3.2, arc: 2.4, len: 1.3, color: 0xff7a20, glow: 0xff4400, guard: 0x502010, cost: 950 },
  { id: 'frost', cls: 'knight', n: 'Ледяной разрез', d: 'Кристальный клинок вечной зимы.', dmg: 40, cd: 0.5, range: 3.5, arc: 2.6, len: 1.4, color: 0x7fd8ff, glow: 0x2299ee, guard: 0x3a6a9a, cost: 1900 },
  { id: 'shadow', cls: 'knight', n: 'Клинок теней', d: 'Изогнутая тьма с парящими осколками.', dmg: 52, cd: 0.42, range: 3.7, arc: 2.6, len: 1.5, color: 0x8a4aff, glow: 0x7a2aff, guard: 0x2a1a44, cost: 3600 },
  { id: 'excal', cls: 'knight', n: 'Экскалибур', d: 'Легендарный меч королей.', dmg: 78, cd: 0.4, range: 4.2, arc: 3.0, len: 1.7, color: 0xfff0b0, glow: 0xffb820, guard: 0xffd23f, cost: 8000 },
  { id: 'twig', cls: 'mage', n: 'Посох ученика', d: 'Кривая ветвь с зелёным кристаллом.', dmg: 12, cd: 0.85, range: 9, ps: 11, aoe: 1.3, color: 0x6cff9a, cost: 250 },
  { id: 'ember', cls: 'mage', n: 'Посох углей', d: 'Огненный шар и три когтя.', dmg: 20, cd: 0.75, range: 9.5, ps: 12, aoe: 1.7, color: 0xff7a30, cost: 700 },
  { id: 'glacier', cls: 'mage', n: 'Ледяной скипетр', d: 'Кристалл льда с осколками.', dmg: 30, cd: 0.7, range: 10, ps: 12, aoe: 2.0, color: 0x7fd8ff, cost: 1500 },
  { id: 'storm', cls: 'mage', n: 'Громовой жезл', d: 'Два вращающихся кольца молний.', dmg: 44, cd: 0.62, range: 10.5, ps: 14, aoe: 2.3, color: 0xffee55, cost: 3000 },
  { id: 'void', cls: 'mage', n: 'Посох Бездны', d: 'Тёмная сфера и орбитальные осколки.', dmg: 64, cd: 0.55, range: 11.5, ps: 15, aoe: 2.8, color: 0xc070ff, cost: 6500 },
  { id: 'short', cls: 'archer', n: 'Короткий лук', d: 'Лёгкий лук для начинающих.', dmg: 11, cd: 0.6, range: 10, ps: 20, pierce: 1, color: 0xd8b080, cost: 250 },
  { id: 'hunter', cls: 'archer', n: 'Охотничий лук', d: 'Тёмное дерево и кожаная обмотка.', dmg: 17, cd: 0.55, range: 10.5, ps: 21, pierce: 1, color: 0xb0804a, cost: 650 },
  { id: 'elven', cls: 'archer', n: 'Эльфийский лук', d: 'Листья на концах и тихое сияние.', dmg: 26, cd: 0.48, range: 11, ps: 23, pierce: 2, color: 0x9aff9a, cost: 1400 },
  { id: 'blaze', cls: 'archer', n: 'Лук огня', d: 'Стрелы горят на лету.', dmg: 38, cd: 0.44, range: 11.5, ps: 24, pierce: 2, color: 0xff6a2a, cost: 2900 },
  { id: 'celest', cls: 'archer', n: 'Небесный лук', d: 'Золотые крылья и светящаяся тетива.', dmg: 58, cd: 0.38, range: 12.5, ps: 26, pierce: 3, color: 0xfff0a0, cost: 6200 }
];
function WP(id) { for (var i = 0; i < WEAPONS.length; i++) if (WEAPONS[i].id === id) return WEAPONS[i]; return WEAPONS[0]; }
function clsUnlocked(c) { return Save.d.owned.some(function (id) { return WP(id).cls === c; }); }

var UPG = [
  { id: 'hp', ic: '♥', n: 'Живучесть', t: '+10% здоровья за уровень', base: 60, max: 10 },
  { id: 'dmg', ic: '⚔', n: 'Сила', t: '+10% урона за уровень', base: 80, max: 10 },
  { id: 'rate', ic: '⚡', n: 'Скорость атаки', t: '+6% скорости атаки за уровень', base: 90, max: 10 },
  { id: 'spd', ic: '»', n: 'Проворство', t: '+4% скорости бега за уровень', base: 70, max: 10 },
  { id: 'luck', ic: '♣', n: 'Удача', t: '+4 удачи: чаще высокие редкости', base: 100, max: 10 },
  { id: 'coin', ic: '●', n: 'Жадность', t: '+10% монет за уровень', base: 75, max: 10 },
  { id: 'mrange', ic: '↔', n: 'Длинный клинок', t: '+5% дальности меча за уровень', base: 85, max: 10 },
  { id: 'rrange', ic: '➳', n: 'Дальний прицел', t: '+5% дальности выстрела (маг, лучник)', base: 85, max: 10 },
  { id: 'armor', ic: '▣', n: 'Броня', t: '-3% входящего урона за уровень', base: 110, max: 10 },
  { id: 'regen', ic: '✚', n: 'Регенерация', t: '+0.3 ХП в секунду за уровень', base: 120, max: 10 },
  { id: 'blades', ic: '✠', n: 'Парящие клинки', t: '+1 клинок вокруг героя с начала забега', base: 400, mult: 2.2, max: 4 },
  { id: 'minion', ic: '❂', n: 'Помощники', t: '1: дух · 2: волк · 3: второй дух', base: 600, mult: 2.8, max: 3 },
  { id: 'revive', ic: '☥', n: 'Второй шанс', t: 'Одно воскрешение за забег', base: 2500, mult: 1, max: 1 }
];
function upCost(u, l) { return Math.round(u.base * Math.pow(u.mult || 1.55, l)); }

var ENEMIES = {
  walker: { n: 'Зомби', hp: 24, spd: 2.0, dmg: 8, r: 0.5, scale: 1, coin: 1, from: 1, w: 10, skin: 0x5f9150, cloth: 0x3b4a6a },
  runner: { n: 'Бегун', hp: 14, spd: 3.9, dmg: 6, r: 0.42, scale: 0.85, coin: 1, from: 2, w: 6, skin: 0x9ab866, cloth: 0x8a2a2a },
  brute: { n: 'Громила', hp: 90, spd: 1.4, dmg: 18, r: 0.8, scale: 1.4, coin: 4, from: 3, w: 4, skin: 0x6b7a3c, cloth: 0x4a3426 },
  spitter: { n: 'Плевун', hp: 22, spd: 1.8, dmg: 9, r: 0.5, scale: 1, coin: 3, from: 4, w: 4, skin: 0x7a5a9a, cloth: 0x2a3a2a, ranged: true },
  boomer: { n: 'Подрывник', hp: 36, spd: 2.3, dmg: 30, r: 0.7, scale: 1.15, coin: 3, from: 5, w: 3, skin: 0xb86a2a, cloth: 0xcc3a1a, boom: true },
  wraith: { n: 'Призрак', hp: 30, spd: 3.0, dmg: 12, r: 0.5, scale: 1, coin: 3, from: 6, w: 4, skin: 0x9ad8ff, cloth: 0x2a3a6a },
  armored: { n: 'Латник', hp: 160, spd: 1.7, dmg: 16, r: 0.65, scale: 1.2, coin: 6, from: 7, w: 3, skin: 0x7a8a6a, cloth: 0x8a9098 },
  necro: { n: 'Некромант', hp: 70, spd: 1.6, dmg: 10, r: 0.55, scale: 1.1, coin: 6, from: 8, w: 2, skin: 0x8a8a9a, cloth: 0x2a1038, ranged: true, summon: true },
  boss: { n: 'Повелитель мёртвых', hp: 1000, spd: 1.7, dmg: 28, r: 1.6, scale: 2.4, coin: 40, from: 99, w: 0, skin: 0x8a3a3a, cloth: 0x2a1a2a, boss: true }
};

function waveTotal(w) { return 12 + w * 5 + Math.floor(w * w * 0.3); }
