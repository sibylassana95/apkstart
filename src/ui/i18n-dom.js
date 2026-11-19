(function () {
  'use strict';
  window.I18nDom = {
    apply(root) {
      const api = window.apkstart;
      if (!api || !api.i18n) return;
      const scope = root || document;
      document.documentElement.lang = api.i18n.getLang();
      const attrs = [
        ['data-i18n', 'textContent'],
        ['data-i18n-title', 'title'],
        ['data-i18n-placeholder', 'placeholder'],
      ];
      for (const [attr, prop] of attrs) {
        scope.querySelectorAll('[' + attr + ']').forEach((el) => {
          const key = el.getAttribute(attr);
          // 首次访问时记住原始中文，否则切回 zh-CN 时会把 FR 文本当成 fallback。
          const storeKey = '_i18nOriginal_' + attr;
          if (el[storeKey] === undefined) el[storeKey] = el[prop];
          el[prop] = api.i18n.t(key, el[storeKey]);
        });
      }
    },
  };
})();
