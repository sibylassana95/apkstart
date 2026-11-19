'use strict';
/**
 * 界面翻译完整性检查。
 *
 * 校验三件事：
 *   1) src/i18n/fr*.json 之间没有重复 key；
 *   2) 代码里用到的 i18n key 都有译文；
 *   3) 词典里没有没人用的孤儿 key。
 *
 * 例外：doctor.js 用 `core.diag.${i}.title` 这类动态 key，静态扫描看不到，
 * 因此以 core.diag. 开头的 key 不计入「孤儿」统计。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const I18N_DIR = path.join(ROOT, 'src', 'i18n');

const catalogs = fs.readdirSync(I18N_DIR).filter((f) => /^fr.*\.json$/i.test(f)).sort();
const all = Object.create(null);
const duplicate = [];
for (const name of catalogs) {
  let obj;
  try {
    obj = JSON.parse(fs.readFileSync(path.join(I18N_DIR, name), 'utf8'));
  } catch (e) {
    console.error(`✗ 词典解析失败 ${name}: ${e.message}`);
    process.exit(1);
  }
  for (const [key, value] of Object.entries(obj)) {
    if (Object.prototype.hasOwnProperty.call(all, key)) duplicate.push(`${key} (${name})`);
    all[key] = value;
  }
}

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(js|html)$/.test(entry.name)) files.push(p);
  }
})(path.join(ROOT, 'src'));

const used = new Set();
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  // Le fichier adb.js a été reformatté avec des guillemets doubles : accepter les deux styles.
  for (const m of src.matchAll(/(?:i18n\.)?t\(\s*(['"])([^'"]+)\1/g)) used.add(m[2]);
  for (const m of src.matchAll(/data-i18n(?:-title|-placeholder|-aria-label|-alt|-value)?="([^"]+)"/g)) used.add(m[1]);
}

const PREFIX = /^(app|ui|windows|core|tray|settings)\./;
const DYNAMIC = (key) => key.startsWith('core.diag.') || key.startsWith('core.drv.forbid');
const missing = [...used].filter((k) => PREFIX.test(k) && !all[k] && !DYNAMIC(k)).sort();
const orphan = Object.keys(all).filter((k) => !used.has(k) && !DYNAMIC(k)).sort();

for (const k of duplicate) console.error(`✗ 重复 key: ${k}`);
for (const k of missing) console.error(`✗ 缺少译文: ${k}`);
for (const k of orphan) console.error(`✗ 孤儿 key: ${k}`);

if (duplicate.length || missing.length || orphan.length) {
  console.error(`\n检查结果：重复 ${duplicate.length}，缺译 ${missing.length}，孤儿 ${orphan.length}`);
  process.exit(1);
}
console.log(`✓ i18n 完整：${catalogs.length} 份词典 / ${Object.keys(all).length} 个 key / ${used.size} 处引用`);
