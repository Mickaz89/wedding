/* Sarah & Ilan — i18n engine. Loaded synchronously in <head>. */
(() => {
  const STORAGE_KEY = "wedding-lang";
  const SUPPORTED = ["fr", "he"];
  const DEFAULT_LANG = "fr";

  // Translations are filled in by subsequent tasks. Keys are dotted IDs.
  const TRANSLATIONS = {
    fr: {
      "meta.title": "Sarah & Ilan — Notre mariage",
      "meta.description": "C'est avec une immense joie que nous vous invitons à célébrer notre mariage — Sarah & Ilan.",
      "meta.ogTitle": "Mariage de Sarah & Ilan",
      "meta.ogDescription": "Mairie le 23 juin 2026 — Henné le soir — Houppa le 4 août en Israël — Chabbat Hatan le 7 août.",
      "meta.ogLocale": "fr_FR",
      "meta.ogLocaleAlternate": "he_IL",
      "meta.ogImageAlt": "Sarah & Ilan — 23 juin 2026",
      "meta.twitterTitle": "Mariage de Sarah & Ilan",
      "meta.twitterDescription": "Notre mariage — Sarah & Ilan.",

      "music.ariaLabel": "Démarrer la musique",
      "music.brand": "Sarah & Ilan",
      "music.title": "Bienvenue",
      "music.subtitle": "Une mélodie hébraïque accompagne ce faire-part.",
      "music.enter": "Entrer",
      "music.skip": "Continuer en silence",
      "music.toggleAria": "Activer / couper la musique",

      "landing.countdownAria": "Compte à rebours jusqu'au mariage",
      "landing.days": "Jours",
      "landing.hours": "Heures",
      "landing.minutes": "Minutes",
      "landing.seconds": "Secondes",
      "landing.cta": "Voir la carte",

      "menu.openLabel": "Ouvrir le menu",
      "menu.closeLabel": "Fermer le menu",
      "menu.homeLabel": "Accueil",

      "nav.home": "Accueil",
      "nav.mairie": "Mairie",
      "nav.henne": "Henné",
      "nav.houppa": "Houppa",
      "nav.chabbat": "Chabbat",
      "nav.gallery": "Galerie",
      "nav.rsvp": "RSVP",

      "mairie.title": "Mairie",
      "mairie.couple": "Sarah & Ilan",
      "mairie.intro": "se diront <em>«&nbsp;Oui&nbsp;»</em>",
      "mairie.date": "Le 23 Juin 2026",
      "mairie.time": "à 13h30 précises",
      "mairie.venue": "à la mairie de Saint-Maur,",
      "mairie.address": "Av. Charles de Gaulle, 94100",
      "common.maps": "Google Maps",
      "common.waze": "Waze",

      "henne.title": "Henné",
      "henne.intro1": "C'est avec une immense joie que",
      "henne.couple": "Sarah & Ilan",
      "henne.intro2": "vous invitent à partager avec eux<br />une soirée mémorable le",
      "henne.date": "23 Juin 2026",
      "henne.time": "à 19h30",
      "henne.venue": "Les salons du Centre Hillel",
      "henne.address1": "10bis avenue du Château",
      "henne.address2": "94210 — La Varenne",

      "houppa.title": "Houppa & soirée",
      "houppa.intro": "C'est avec une immense joie et de gratitude envers <span lang=\"he\" dir=\"rtl\">הי</span> que",
      "houppa.host1": "Denise Abitbol",
      "houppa.host2": "Jean Claude & Brigitte Sultan",
      "houppa.host3": "Gilles & Guila Zana",
      "houppa.hostsIntro": "vous convient au mariage de leurs petits-enfants et enfants",
      "houppa.date": "Le 4 août 2026",
      "houppa.dateHebrew": "21 Av 5786",
      "houppa.time": "La Houppa débutera à <strong>18h précises</strong>,<br />dans <strong>les salons Yara à Hadera, Israël</strong>.",
      "houppa.memorial": "En ce jour de joie, une pensée émue se tourne vers nos grands-parents partis trop tôt&nbsp;:<br />\npapi Simon et mamie Camille Zana,<br />\npapi Jacob et mami Rachel Bouganim,<br />\nainsi que papi Elie Abitbol,<br />\npapi Alphonse et mamie André Sultan.",
      "houppa.dressCode": "Une tenue tsniout réjouira les mariés",
      "houppa.rsvp": "Réponse souhaitée a.s.a.p",

      "chabbat.title": "Chabbat Hatan",
      "chabbat.day": "Vendredi",
      "chabbat.date": "7 Août 2026",
      "chabbat.venue": "Hôtel Eden Inn",
      "chabbat.address1": "Derekh Aharon 2",
      "chabbat.address2": "Zichron Yaacov, Israël",
      "chabbat.rsvpLink": "Réservations auprès de Deborah",
      "chabbat.whatsappText": "Bonjour Deborah, je souhaite réserver pour le Chabbat Hatan de Sarah & Ilan ✨",

      "cta.saveTheDate": "Gardez la date",
      "cta.addCalendar": "Ajouter au calendrier",

      "gallery.eyebrow": "Notre histoire en images",
      "gallery.title": "Quelques moments à deux",

      "footer.respond": "Répondre",
      "footer.menu": "Menu",
      "footer.langEyebrow": "Langue · שפה",

      "rsvp.close": "Fermer",
      "rsvp.eyebrow": "Confirmer votre présence",
      "rsvp.brand": "Sarah & Ilan",
      "rsvp.nameLabel": "Nom complet *",
      "rsvp.phoneLabel": "Téléphone",
      "rsvp.phonePlaceholder": "06 …",
      "rsvp.presenceLegend": "Présence",
      "rsvp.attendingYes": "Je serai présent(e)",
      "rsvp.attendingNo": "Je ne pourrai pas venir",
      "rsvp.guestsLabel": "Nombre de personnes",
      "rsvp.eventsLegend": "Événements auxquels je serai présent(e)",
      "rsvp.event.mairie": "Mairie — 23 juin 2026",
      "rsvp.event.henne": "Henné — 23 juin 2026",
      "rsvp.event.houppa": "Houppa & soirée — 4 août 2026",
      "rsvp.event.chabbat": "Chabbat Hatan — 7 août 2026",
      "rsvp.dietaryLabel": "Allergies / régime alimentaire",
      "rsvp.messageLabel": "Message pour Sarah & Ilan",
      "rsvp.submit": "Envoyer ma réponse",
      "rsvp.submitSending": "Envoi en cours…",
      "rsvp.errorName": "Merci d'indiquer votre nom.",
      "rsvp.errorEvents": "Veuillez sélectionner au moins un événement.",
      "rsvp.errorNotActive": "Le formulaire n'est pas encore activé. Merci de contacter Sarah & Ilan directement.",
      "rsvp.errorGeneric": "Une erreur est survenue. Merci de réessayer.",
      "rsvp.success": "Merci, votre réponse est enregistrée 🌿",
    },
    he: {
      "meta.title": "שרה ואילן — החתונה שלנו",
      "meta.description": "בשמחה רבה אנו מזמינים אתכם לחגוג עמנו את חתונתנו — שרה ואילן.",
      "meta.ogTitle": "חתונת שרה ואילן",
      "meta.ogDescription": "טקס אזרחי 23 ביוני 2026 — חינה בערב — חופה ב-4 באוגוסט בישראל — שבת חתן ב-7 באוגוסט.",
      "meta.ogLocale": "he_IL",
      "meta.ogLocaleAlternate": "fr_FR",
      "meta.ogImageAlt": "שרה ואילן — 23 ביוני 2026",
      "meta.twitterTitle": "חתונת שרה ואילן",
      "meta.twitterDescription": "החתונה שלנו — שרה ואילן.",

      "music.ariaLabel": "הפעלת המוזיקה",
      "music.brand": "שרה ואילן",
      "music.title": "ברוכים הבאים",
      "music.subtitle": "מנגינה עברית מלווה את ההזמנה הזו.",
      "music.enter": "להיכנס",
      "music.skip": "להמשיך בשקט",
      "music.toggleAria": "הפעלת / השתקת המוזיקה",

      "landing.countdownAria": "ספירה לאחור עד לחתונה",
      "landing.days": "ימים",
      "landing.hours": "שעות",
      "landing.minutes": "דקות",
      "landing.seconds": "שניות",
      "landing.cta": "לצפייה בהזמנה",

      "menu.openLabel": "פתיחת התפריט",
      "menu.closeLabel": "סגירת התפריט",
      "menu.homeLabel": "דף הבית",

      "nav.home": "דף הבית",
      "nav.mairie": "טקס אזרחי",
      "nav.henne": "חינה",
      "nav.houppa": "חופה",
      "nav.chabbat": "שבת חתן",
      "nav.gallery": "גלריה",
      "nav.rsvp": "אישור הגעה",

      "mairie.title": "טקס אזרחי",
      "mairie.couple": "<span dir=\"ltr\" style=\"unicode-bidi:isolate\">Sarah &amp; Ilan</span>",
      "mairie.intro": "יגידו זה לזו <em>״כן״</em>",
      "mairie.date": "23 ביוני 2026",
      "mairie.time": "בשעה 13:30 בדיוק",
      "mairie.venue": "בעיריית סן-מור,",
      "mairie.address": "שדרות שארל דה גול, 94100",
      "common.maps": "Google Maps",
      "common.waze": "Waze",

      "henne.title": "חינה",
      "henne.intro1": "בשמחה רבה",
      "henne.couple": "<span dir=\"ltr\" style=\"unicode-bidi:isolate\">Sarah &amp; Ilan</span>",
      "henne.intro2": "מזמינים אתכם לחגוג עמם<br />בערב בלתי נשכח, ב-",
      "henne.date": "23 ביוני 2026",
      "henne.time": "בשעה 19:30",
      "henne.venue": "אולמי מרכז הלל",
      "henne.address1": "שדרות דו שאטו 10ב",
      "henne.address2": "94210 — לה ורן",

      "houppa.title": "חופה ושמחה",
      "houppa.intro": "בשמחה רבה ובהודיה ל-<span lang=\"he\" dir=\"rtl\">הי</span>",
      "houppa.host1": "דניז אביטבול",
      "houppa.host2": "ז׳אן קלוד וברידיט סולטן",
      "houppa.host3": "ז׳יל וגילה זנה",
      "houppa.hostsIntro": "מתכבדים להזמינכם לחתונת נכדיהם וילדיהם",
      "houppa.date": "4 באוגוסט 2026",
      "houppa.dateHebrew": "כ״א באב התשפ״ו",
      "houppa.time": "החופה תתקיים ב<strong>שעה 18:00 בדיוק</strong>,<br />ב<strong>אולמי יערה, חדרה, ישראל</strong>.",
      "houppa.memorial": "ביום שמחה זה, מחשבה נרגשת לסבים וסבתות שאינם עמנו:<br />\nסבא סימון וסבתא קמיל זנה ז״ל,<br />\nסבא יעקב וסבתא רחל בוגנים ז״ל,<br />\nסבא אלי אביטבול ז״ל,<br />\nסבא אלפונס וסבתא אנדריי סולטן ז״ל.",
      "houppa.dressCode": "לבוש צנוע ישמח את החתן והכלה",
      "houppa.rsvp": "נא לאשר הגעה בהקדם",

      "chabbat.title": "שבת חתן",
      "chabbat.day": "יום שישי",
      "chabbat.date": "7 באוגוסט 2026",
      "chabbat.venue": "מלון עדן אין",
      "chabbat.address1": "דרך אהרון 2",
      "chabbat.address2": "זכרון יעקב, ישראל",
      "chabbat.rsvpLink": "להזמנות אצל דבורה",
      "chabbat.whatsappText": "שלום דבורה, אני רוצה להזמין מקום לשבת חתן של שרה ואילן ✨",

      "cta.saveTheDate": "שמרו את התאריך",
      "cta.addCalendar": "הוספה ליומן",

      "gallery.eyebrow": "הסיפור שלנו בתמונות",
      "gallery.title": "כמה רגעים יחד",

      "footer.respond": "אישור הגעה",
      "footer.menu": "תפריט",
      "footer.langEyebrow": "שפה · Langue",

      "rsvp.close": "סגירה",
      "rsvp.eyebrow": "אישור הגעה",
      "rsvp.brand": "שרה ואילן",
      "rsvp.nameLabel": "שם מלא *",
      "rsvp.phoneLabel": "טלפון",
      "rsvp.phonePlaceholder": "…",
      "rsvp.presenceLegend": "נוכחות",
      "rsvp.attendingYes": "אגיע",
      "rsvp.attendingNo": "לא אוכל להגיע",
      "rsvp.guestsLabel": "מספר אורחים",
      "rsvp.eventsLegend": "אירועים שאליהם אגיע",
      "rsvp.event.mairie": "טקס אזרחי — 23 ביוני 2026",
      "rsvp.event.henne": "חינה — 23 ביוני 2026",
      "rsvp.event.houppa": "חופה ושמחה — 4 באוגוסט 2026",
      "rsvp.event.chabbat": "שבת חתן — 7 באוגוסט 2026",
      "rsvp.dietaryLabel": "אלרגיות / העדפות תזונה",
      "rsvp.messageLabel": "הודעה לשרה ואילן",
      "rsvp.submit": "לשליחת התשובה",
      "rsvp.submitSending": "שולח…",
      "rsvp.errorName": "נא להזין שם מלא.",
      "rsvp.errorEvents": "יש לבחור אירוע אחד לפחות.",
      "rsvp.errorNotActive": "הטופס עדיין לא פעיל. נא ליצור קשר ישירות עם שרה ואילן.",
      "rsvp.errorGeneric": "אירעה שגיאה. נא לנסות שוב.",
      "rsvp.success": "תודה, התשובה שלך נקלטה 🌿",
    },
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
