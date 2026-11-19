(function () {
  'use strict';
  window.I18nDom = {
    apply(root) {
      const api = window.apkstart || window.apkstartSplash;
      if (!api || !api.i18n) return;
      const scope = root || document;
      document.documentElement.lang = api.i18n.getLang();
      // 第三列表示目标是不是「属性」而非 JS 属性（aria-label 必须用 setAttribute）。
      const attrs = [
        ['data-i18n', 'textContent', false],
        ['data-i18n-title', 'title', false],
        ['data-i18n-placeholder', 'placeholder', false],
        ['data-i18n-aria-label', 'aria-label', true],
        ['data-i18n-alt', 'alt', true],
        ['data-i18n-value', 'value', false],
      ];
      for (const [attr, prop, isAttribute] of attrs) {
        scope.querySelectorAll('[' + attr + ']').forEach((el) => {
          const key = el.getAttribute(attr);
          const read = () => (isAttribute ? el.getAttribute(prop) : el[prop]);
          const write = (v) => { if (isAttribute) el.setAttribute(prop, v); else el[prop] = v; };
          // 首次访问时记住原始中文，否则切回 zh-CN 时会把 FR 文本当成 fallback。
          const storeKey = '_i18nOriginal_' + attr;
          if (el[storeKey] === undefined) el[storeKey] = read();
          write(api.i18n.t(key, el[storeKey]));
        });
      }
    },
  };
})();
