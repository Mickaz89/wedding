/* Sarah & Ilan — i18n engine. Loaded synchronously in <head>. */
(() => {
  const STORAGE_KEY = "wedding-lang";
  const SUPPORTED = ["fr", "he"];
  const DEFAULT_LANG = "fr";

  // Translations are filled in by subsequent tasks. Keys are dotted IDs.
  const TRANSLATIONS = {
    fr: {},
    he: {},
  };

  const isSupported = (l) => SUPPORTED.includes(l);

  const detectInitialLang = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isSupported(stored)) return stored;
    } catch { /* private mode etc. */ }
    const browser = (navigator.language || DEFAULT_LANG).toLowerCase();
    return browser.startsWith("he") ? "he" : DEFAULT_LANG;
  };

  let currentLang = detectInitialLang();

  // Apply lang/dir to <html> immediately, before CSS paints,
  // so RTL layout doesn't flash from LTR.
  document.documentElement.setAttribute("lang", currentLang);
  document.documentElement.setAttribute("dir", currentLang === "he" ? "rtl" : "ltr");

  const getString = (key) => {
    const dict = TRANSLATIONS[currentLang] || {};
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    // Fallback: French dictionary, then the key itself (useful while building out).
    const frDict = TRANSLATIONS.fr || {};
    if (Object.prototype.hasOwnProperty.call(frDict, key)) return frDict[key];
    return key;
  };

  const applyTo = (root = document) => {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = getString(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = getString(el.getAttribute("data-i18n-html"));
    });
    root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr");
      spec.split(",").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        if (attr && key) el.setAttribute(attr, getString(key));
      });
    });
  };

  const syncSelectors = () => {
    document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.lang === currentLang);
      btn.setAttribute("aria-pressed", btn.dataset.lang === currentLang ? "true" : "false");
    });
  };

  const applyLanguage = (lang) => {
    if (!isSupported(lang)) return;
    currentLang = lang;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "he" ? "rtl" : "ltr");
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
    applyTo(document);
    syncSelectors();
    document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
  };

  const wireSelectors = () => {
    document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
      // Avoid double-wiring if called twice.
      if (btn.dataset.langWired === "1") return;
      btn.dataset.langWired = "1";
      btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
    });
    syncSelectors();
  };

  const init = () => {
    applyTo(document);
    wireSelectors();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose a small API on window for script.js to read current language
  // and for debugging in DevTools.
  window.WeddingI18n = {
    get lang() { return currentLang; },
    apply: applyLanguage,
    t: getString,
  };
})();
