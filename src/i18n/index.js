'use strict';
/**
 * 界面多语言核心：主进程与 preload 共用，零第三方依赖。
 * 默认简体中文；只有 fr.json 里命中 key 时才切到法语，否则原样回落中文。
 */
const fs = require('fs');
const path = require('path');

const SUPPORTED = ['zh-CN', 'fr'];
const DEFAULT_LANG = 'zh-CN';

// 所有 fr*.json 合并成一份词典（按文件名排序，后面的覆盖前面的）。
// 分文件是为了让不同界面区域各管各的文案，避免多人同时改同一个大文件。
// 文件缺失/损坏时退回空目录，保证中文路径永远可用（零回归）。
let frCatalog = {};
for (const name of fs.readdirSync(__dirname).filter((f) => /^fr.*\.json$/i.test(f)).sort()) {
  try {
    Object.assign(frCatalog, JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8')));
  } catch (_) { /* 单个词典坏了不该拖垮整个界面 */ }
}

let currentLang = DEFAULT_LANG;
// 子窗口（splash / shell）通过 additionalArguments 传入当前界面语言，
// preload 里的 i18n 是独立模块实例，靠这里同步，否则会退回默认中文。
const langArg = process.argv.find((a) => a.startsWith('--apkstart-lang='));
if (langArg) {
  const v = langArg.slice('--apkstart-lang='.length);
  if (SUPPORTED.includes(v)) currentLang = v;
}

function getLang() {
  return currentLang;
}

// 只切内存里的语言，不写磁盘；持久化由 settings:set 负责。
function setLang(lang) {
  currentLang = SUPPORTED.includes(lang) ? lang : DEFAULT_LANG;
  return currentLang;
}

function catalog(lang) {
  return lang === 'fr' ? frCatalog : {};
}

// 把 {name} 这样的占位符换成 params.name；没传的参数保留原样。
function interpolate(text, params) {
  if (!params) return text;
  return String(text).replace(/\{(\w+)\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  ));
}

function t(key, defaultZh, params) {
  if (currentLang === 'fr' && Object.prototype.hasOwnProperty.call(frCatalog, key)) {
    return interpolate(frCatalog[key], params);
  }
  // zh-CN 或 fr 缺 key：回落传入的中文原文（仍然做插值，避免界面出现 {name} 占位符）
  return interpolate(defaultZh, params);
}

module.exports = {
  supported: SUPPORTED,
  getLang,
  setLang,
  t,
  catalog,
};
