# Hebrew + French Bilingual Invitation — Design Spec

**Date:** 2026-05-28
**Status:** Draft for review

## Goal

Make the Sarah & Ilan wedding invitation site available in both French and Hebrew, with:

1. Browser-locale-based default language on first visit
2. Persistent user choice (localStorage) overriding the browser default on subsequent visits
3. A two-way language selector (FR / עב) in the topbar and the footer
4. Full RTL layout flip when Hebrew is active
5. Hebrew typography using the already-loaded Frank Ruhl Libre font

Out of scope: SEO `hreflang` tags, separate URLs per language, third language, animation/timing changes.

## Architecture

### New file: `i18n.js`

Loaded synchronously in `<head>` **before** `styles.css` and `script.js`. Single-file module exposing:

- `TRANSLATIONS` — `{ fr: { ...keys }, he: { ...keys } }`, flat keyed by dotted IDs (e.g., `mairie.intro`, `rsvp.submit`).
- `getCurrentLang()` — returns `'fr' | 'he'`.
- `applyLanguage(lang)` — applies a language to the live DOM.

### Detection logic

```js
function detectInitialLang() {
  const stored = localStorage.getItem('wedding-lang');
  if (stored === 'fr' || stored === 'he') return stored;
  const browser = (navigator.language || 'fr').toLowerCase();
  return browser.startsWith('he') ? 'he' : 'fr';
}
```

Applied immediately at script-end (before `</head>` closes) so `<html lang>` and `<html dir>` are correct before any paint. Text content is applied as soon as the body is parseable — wrapped in a `DOMContentLoaded` check for safety.

### HTML markup patterns

Four ways to mark translatable content:

| Pattern | Use case | Example |
|---|---|---|
| `data-i18n="key"` | Plain text content (replaces `textContent`) | `<p data-i18n="mairie.address">Av. Charles de Gaulle</p>` |
| `data-i18n-html="key"` | Text with inline HTML (`<em>`, `<br>`, `<strong>`) — uses `innerHTML`; dictionary content is author-controlled, no user input flows here | `<p data-i18n-html="mairie.intro">se diront <em>« Oui »</em></p>` |
| `data-i18n-attr="attr:key"` | Single attribute (most common: `aria-label`, `alt`, `placeholder`) | `<button data-i18n-attr="aria-label:menu.openLabel">` |
| `data-i18n-attr="attr1:key1,attr2:key2"` | Multiple attributes on one element | `<meta data-i18n-attr="content:meta.description">` |

### applyLanguage(lang) behavior

1. Update `<html lang="…" dir="…">` (dir = `"rtl"` for Hebrew, `"ltr"` for French).
2. Update `<title>` from `TRANSLATIONS[lang]['meta.title']`.
3. Walk all `[data-i18n]`, `[data-i18n-html]`, `[data-i18n-attr]` elements and apply their values.
4. Update `<meta property="og:locale">` content (`fr_FR` ↔ `he_IL`) and write the opposite as `<meta property="og:locale:alternate">` so social-share previews announce both available languages.
5. Persist `lang` to `localStorage.wedding-lang`.
6. Update both language selectors' active states.
7. Dispatch `new CustomEvent('languagechange', { detail: { lang } })` on `document` so `script.js` can react (RSVP dynamic strings, calendar `.ics` content).

## RTL layout

### Global

```css
html[dir="rtl"] body {
  font-feature-settings: normal;
}
[lang="he"], html[lang="he"] body {
  font-family: "Frank Ruhl Libre", "Cormorant Garamond", serif;
}
```

### Targeted overrides in `styles.css`

Under `[dir="rtl"]` selectors:

- **`.topbar`**: keeps the centered brand; flips so `.topbar__menu` (hamburger) sits on the right, `.topbar__right` (music + lang selector) on the left. Implemented by overriding the existing grid template or with `flex-direction: row-reverse` if the topbar is a flex container.
- **`.side-menu`**: `transform: translateX(100%)` initial state and `transform: translateX(0)` open state — slides in from the right. Close button (`.side-menu__close`) flips to the left edge.
- **`.landing__countdown`**: `flex-direction: row-reverse` so "Jours / ימים" sits rightmost.
- **`.event-section__hosts-grid`**: `direction: rtl` with column order swapped.
- **`.btn--icon`** (calendar buttons): `flex-direction: row-reverse` so icon sits on the right of label in Hebrew.
- **`.event-section__rsvp-link`** (WhatsApp link in Chabbat block): same row-reverse for the WhatsApp icon.
- **`.footer__inner`**: `flex-direction: row-reverse` to mirror the brand column / menu column placement.
- **`.rsvp-pill`**, **`.rsvp-modal__close`**: positions adjusted (close button on the left when RTL).

### Bidi isolation

Names containing `&` (`Sarah & Ilan`, `Jean Claude & Brigitte Sultan`, etc.) get wrapped with `<span dir="ltr" style="unicode-bidi: isolate">…</span>` in the translation strings so the ampersand and the word order render LTR inside an RTL paragraph. Phone numbers, the `wa.me` link text if numeric, and the `94100` postal codes are wrapped the same way.

### Elements kept bilingual (unchanged in both languages)

- `בס״ד` (landing + topbar)
- Chuppah image overlay names שרה / אילן (already bilingual under `event-section__chuppa-names`)
- Footer `מַזָּל טוֹב`
- `hebrew-text.png` banner image in the Houppa section
- The `lang="he"` Hebrew dates that already appear (e.g., `21 Av 5786`)

These are ceremonial flourishes. The French parallel text around them (`event-section__intro`, etc.) is still translated normally.

## Language selector UI

### Topbar variant

Inserted into `.topbar__right` **before** the `#music-toggle` button:

```html
<div class="lang-switch" role="group" aria-label="Langue / שפה">
  <button type="button" class="lang-switch__btn is-active" data-lang="fr">FR</button>
  <button type="button" class="lang-switch__btn" data-lang="he" lang="he">עב</button>
</div>
```

Styling: pill-shaped group, ~36px tall on desktop / 32px on mobile, two equal-width segments separated by a thin divider. Active segment has the solid green fill of the topbar; inactive is transparent with the topbar text color. Hover: subtle background.

### Footer variant

Inserted into `.footer__col--brand` below `.footer__actions`:

```html
<div class="footer__lang">
  <p class="footer__lang-eyebrow">Langue · שפה</p>
  <div class="lang-switch lang-switch--lg" role="group" aria-label="Langue / שפה">
    <button type="button" class="lang-switch__btn is-active" data-lang="fr">FR</button>
    <button type="button" class="lang-switch__btn" data-lang="he" lang="he">עב</button>
  </div>
</div>
```

Larger variant uses the same component with a `--lg` modifier (larger padding, bigger font).

### Wiring

Both selectors delegate to the same handler:

```js
document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

document.addEventListener('languagechange', (e) => {
  document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.lang === e.detail.lang);
  });
});
```

## Translation dictionary

All strings live in `i18n.js` `TRANSLATIONS` object. Below is the complete French → Hebrew mapping. Family/proper names use the spelling I've drafted; please correct anything that should differ.

### Meta

| Key | French | Hebrew |
|---|---|---|
| `meta.title` | Sarah & Ilan — Notre mariage | שרה ואילן — החתונה שלנו |
| `meta.description` | C'est avec une immense joie que nous vous invitons à célébrer notre mariage — Sarah & Ilan. | בשמחה רבה אנו מזמינים אתכם לחגוג עמנו את חתונתנו — שרה ואילן. |
| `meta.ogTitle` | Mariage de Sarah & Ilan | חתונת שרה ואילן |
| `meta.ogDescription` | Mairie le 23 juin 2026 — Henné le soir — Houppa le 4 août en Israël — Chabbat Hatan le 7 août. | טקס אזרחי 23 ביוני 2026 — חינה בערב — חופה ב-4 באוגוסט בישראל — שבת חתן ב-7 באוגוסט. |
| `meta.ogImageAlt` | Sarah & Ilan — 23 juin 2026 | שרה ואילן — 23 ביוני 2026 |
| `meta.twitterTitle` | Mariage de Sarah & Ilan | חתונת שרה ואילן |
| `meta.twitterDescription` | Notre mariage — Sarah & Ilan. | החתונה שלנו — שרה ואילן. |

### Music gate

| Key | French | Hebrew |
|---|---|---|
| `music.ariaLabel` | Démarrer la musique | הפעלת המוזיקה |
| `music.brand` | Sarah & Ilan | שרה ואילן |
| `music.title` | Bienvenue | ברוכים הבאים |
| `music.subtitle` | Une mélodie hébraïque accompagne ce faire-part. | מנגינה עברית מלווה את ההזמנה הזו. |
| `music.enter` | Entrer | להיכנס |
| `music.skip` | Continuer en silence | להמשיך בשקט |
| `music.toggleAria` | Activer / couper la musique | הפעלת / השתקת המוזיקה |

### Landing

| Key | French | Hebrew |
|---|---|---|
| `landing.countdownAria` | Compte à rebours jusqu'au mariage | ספירה לאחור עד לחתונה |
| `landing.days` | Jours | ימים |
| `landing.hours` | Heures | שעות |
| `landing.minutes` | Minutes | דקות |
| `landing.seconds` | Secondes | שניות |
| `landing.cta` | Voir la carte | לצפייה בהזמנה |

### Topbar / menu

| Key | French | Hebrew |
|---|---|---|
| `menu.openLabel` | Ouvrir le menu | פתיחת התפריט |
| `menu.closeLabel` | Fermer le menu | סגירת התפריט |
| `menu.homeLabel` | Accueil | דף הבית |
| `nav.home` | Accueil | דף הבית |
| `nav.mairie` | Mairie | טקס אזרחי |
| `nav.henne` | Henné | חינה |
| `nav.houppa` | Houppa | חופה |
| `nav.chabbat` | Chabbat | שבת חתן |
| `nav.gallery` | Galerie | גלריה |
| `nav.rsvp` | RSVP | אישור הגעה |

### Mairie

| Key | French | Hebrew |
|---|---|---|
| `mairie.title` | Mairie | טקס אזרחי |
| `mairie.couple` | Sarah & Ilan | שרה ואילן |
| `mairie.intro` | se diront « Oui » | יגידו זה לזו "כן" |
| `mairie.date` | Le 23 Juin 2026 | 23 ביוני 2026 |
| `mairie.time` | à 13h30 précises | בשעה 13:30 בדיוק |
| `mairie.venue` | à la mairie de Saint-Maur, | בעיריית סן-מור, |
| `mairie.address` | Av. Charles de Gaulle, 94100 | שדרות שארל דה גול, 94100 |
| `mairie.maps` | Google Maps | Google Maps |
| `mairie.waze` | Waze | Waze |

### Henné

| Key | French | Hebrew |
|---|---|---|
| `henne.title` | Henné | חינה |
| `henne.intro1` | C'est avec une immense joie que | בשמחה רבה |
| `henne.couple` | Sarah & Ilan | שרה ואילן |
| `henne.intro2` | vous invitent à partager avec eux<br>une soirée mémorable le | מזמינים אתכם לחגוג עמם<br>בערב בלתי נשכח, ב- |
| `henne.date` | 23 Juin 2026 | 23 ביוני 2026 |
| `henne.time` | à 19h30 | בשעה 19:30 |
| `henne.venue` | Les salons du Centre Hillel | אולמי מרכז הלל |
| `henne.address1` | 10bis avenue du Château | שדרות דו שאטו 10ב |
| `henne.address2` | 94210 — La Varenne | 94210 — לה ורן |

### Houppa & soirée

| Key | French | Hebrew |
|---|---|---|
| `houppa.title` | Houppa & soirée | חופה ושמחה |
| `houppa.intro` | C'est avec une immense joie et de gratitude envers <span lang="he" dir="rtl">הי</span> que | בשמחה רבה ובהודיה ל-<span lang="he" dir="rtl">הי</span> |
| `houppa.host1` | Denise Abitbol | דניז אביטבול |
| `houppa.host2` | Jean Claude & Brigitte Sultan | ז'אן קלוד וברידיט סולטן |
| `houppa.host3` | Gilles & Guila Zana | ז'יל וגילה זנה |
| `houppa.hostsIntro` | vous convient au mariage de leurs petits-enfants et enfants | מתכבדים להזמינכם לחתונת נכדיהם וילדיהם |
| `houppa.coupleLeft` | Sarah | שרה |
| `houppa.coupleRight` | Ilan | אילן |
| `houppa.date` | Le 4 août 2026 | 4 באוגוסט 2026 |
| `houppa.dateHebrew` | 21 Av 5786 | כ״א באב התשפ״ו |
| `houppa.time` | La Houppa débutera à <strong>18h précises</strong>,<br>dans <strong>les salons Yara à Hadera, Israël</strong>. | החופה תתקיים ב<strong>שעה 18:00 בדיוק</strong>,<br>ב<strong>אולמי יערה, חדרה, ישראל</strong>. |
| `houppa.memorial` | En ce jour de joie, une pensée émue se tourne vers nos grands-parents partis trop tôt :<br>papi Simon et mamie Camille Zana,<br>papi Jacob et mami Rachel Bouganim,<br>ainsi que papi Elie Abitbol,<br>papi Alphonse et mamie André Sultan. | ביום שמחה זה, מחשבה נרגשת לסבים וסבתות שאינם עמנו:<br>סבא סימון וסבתא קמיל זנה ז״ל,<br>סבא יעקב וסבתא רחל בוגנים ז״ל,<br>סבא אלי אביטבול ז״ל,<br>סבא אלפונס וסבתא אנדריי סולטן ז״ל. |
| `houppa.dressCode` | Une tenue tsniout réjouira les mariés | לבוש צנוע ישמח את החתן והכלה |
| `houppa.rsvp` | Réponse souhaitée a.s.a.p | נא לאשר הגעה בהקדם |

### Chabbat Hatan

| Key | French | Hebrew |
|---|---|---|
| `chabbat.title` | Chabbat Hatan | שבת חתן |
| `chabbat.day` | Vendredi | יום שישי |
| `chabbat.date` | 7 Août 2026 | 7 באוגוסט 2026 |
| `chabbat.venue` | Hôtel Eden Inn | מלון עדן אין |
| `chabbat.address1` | Derekh Aharon 2 | דרך אהרון 2 |
| `chabbat.address2` | Zichron Yaacov, Israël | זכרון יעקב, ישראל |
| `chabbat.rsvpLink` | Réservations auprès de Deborah | להזמנות אצל דבורה |
| `chabbat.whatsappText` | Bonjour Deborah, je souhaite réserver pour le Chabbat Hatan de Sarah & Ilan ✨ | שלום דבורה, אני רוצה להזמין מקום לשבת חתן של שרה ואילן ✨ |

### Calendar CTA

| Key | French | Hebrew |
|---|---|---|
| `cta.saveTheDate` | Gardez la date | שמרו את התאריך |
| `cta.addCalendar` | Ajouter au calendrier | הוספה ליומן |

### Gallery

| Key | French | Hebrew |
|---|---|---|
| `gallery.eyebrow` | Notre histoire en images | הסיפור שלנו בתמונות |
| `gallery.title` | Quelques moments à deux | כמה רגעים יחד |

### Footer

| Key | French | Hebrew |
|---|---|---|
| `footer.respond` | Répondre | אישור הגעה |
| `footer.addCalendar` | Ajouter au calendrier | הוספה ליומן |
| `footer.menu` | Menu | תפריט |
| `footer.langEyebrow` | Langue · שפה | שפה · Langue |

### RSVP modal

| Key | French | Hebrew |
|---|---|---|
| `rsvp.close` | Fermer | סגירה |
| `rsvp.eyebrow` | Confirmer votre présence | אישור הגעה |
| `rsvp.brand` | Sarah & Ilan | שרה ואילן |
| `rsvp.nameLabel` | Nom complet * | שם מלא * |
| `rsvp.phoneLabel` | Téléphone | טלפון |
| `rsvp.phonePlaceholder` | 06 … | … |
| `rsvp.presenceLegend` | Présence | נוכחות |
| `rsvp.attendingYes` | Je serai présent(e) | אגיע |
| `rsvp.attendingNo` | Je ne pourrai pas venir | לא אוכל להגיע |
| `rsvp.guestsLabel` | Nombre de personnes | מספר אורחים |
| `rsvp.eventsLegend` | Événements auxquels je serai présent(e) | אירועים שאליהם אגיע |
| `rsvp.event.mairie` | Mairie — 23 juin 2026 | טקס אזרחי — 23 ביוני 2026 |
| `rsvp.event.henne` | Henné — 23 juin 2026 | חינה — 23 ביוני 2026 |
| `rsvp.event.houppa` | Houppa & soirée — 4 août 2026 | חופה ושמחה — 4 באוגוסט 2026 |
| `rsvp.event.chabbat` | Chabbat Hatan — 7 août 2026 | שבת חתן — 7 באוגוסט 2026 |
| `rsvp.dietaryLabel` | Allergies / régime alimentaire | אלרגיות / העדפות תזונה |
| `rsvp.messageLabel` | Message pour Sarah & Ilan | הודעה לשרה ואילן |
| `rsvp.submit` | Envoyer ma réponse | לשליחת התשובה |
| `rsvp.submitSending` | Envoi en cours… | שולח… |
| `rsvp.errorName` | Merci d'indiquer votre nom. | נא להזין שם מלא. |
| `rsvp.errorEvents` | Veuillez sélectionner au moins un événement. | יש לבחור אירוע אחד לפחות. |
| `rsvp.errorNotActive` | Le formulaire n'est pas encore activé. Merci de contacter Sarah & Ilan directement. | הטופס עדיין לא פעיל. נא ליצור קשר ישירות עם שרה ואילן. |
| `rsvp.errorGeneric` | Une erreur est survenue. Merci de réessayer. | אירעה שגיאה. נא לנסות שוב. |
| `rsvp.success` | Merci, votre réponse est enregistrée 🌿 | תודה, התשובה שלך נקלטה 🌿 |

### Calendar (.ics) event content — translated at generation time

| Key | French | Hebrew |
|---|---|---|
| `ics.mairie.title` | Mariage Sarah & Ilan — Mairie | חתונת שרה ואילן — טקס אזרחי |
| `ics.mairie.description` | Sarah & Ilan se diront « Oui » à la mairie de Saint-Maur. | שרה ואילן יגידו "כן" בעיריית סן-מור. |
| `ics.mairie.location` | Mairie de Saint-Maur, Av. Charles de Gaulle, 94100 Saint-Maur-des-Fossés | עיריית סן-מור, שדרות שארל דה גול, 94100 סן-מור-דה-פוסה |
| `ics.henne.title` | Mariage Sarah & Ilan — Henné | חתונת שרה ואילן — חינה |
| `ics.henne.description` | Soirée Henné de Sarah & Ilan. | ערב חינה של שרה ואילן. |
| `ics.henne.location` | Les salons du Centre Hillel, 10bis avenue du Château, 94210 La Varenne | אולמי מרכז הלל, שדרות דו שאטו 10ב, 94210 לה ורן |
| `ics.houppa.title` | Mariage Sarah & Ilan — Houppa & soirée | חתונת שרה ואילן — חופה ושמחה |
| `ics.houppa.description` | Houppa et soirée du mariage de Sarah & Ilan. | חופה ושמחה של שרה ואילן. |
| `ics.houppa.location` | Salons Yara, Hadera, Israël | אולמי יערה, חדרה, ישראל |
| `ics.chabbat.title` | Mariage Sarah & Ilan — Chabbat Hatan | חתונת שרה ואילן — שבת חתן |
| `ics.chabbat.description` | Chabbat Hatan en l'honneur de Sarah & Ilan. | שבת חתן לכבוד שרה ואילן. |
| `ics.chabbat.location` | Hôtel Eden Inn, Derekh Aharon 2, Zichron Yaacov, Israël | מלון עדן אין, דרך אהרון 2, זכרון יעקב, ישראל |

## Files changed

| File | Change |
|---|---|
| `index.html` | Add `data-i18n*` attributes throughout. Insert two `.lang-switch` blocks (topbar + footer). Add `<script src="i18n.js"></script>` in `<head>` before `styles.css`. |
| `i18n.js` | **New file.** Holds `TRANSLATIONS`, detection, `applyLanguage`, selector wiring. |
| `styles.css` | Add `.lang-switch` + `.lang-switch--lg` styles. Add `[dir="rtl"]` override section near the end. Add `:lang(he)` font rule. |
| `script.js` | Read `getCurrentLang()` in the RSVP submit handler and `.ics` builder; switch hardcoded strings to dictionary lookups. Listen for `languagechange` to re-render dynamic strings if needed. |
| `apps-script.gs` | **Unchanged.** Form payload schema is language-agnostic. |

## Edge cases

- **Flash of unstyled / wrong-language content (FOUC)**: prevented by loading `i18n.js` in `<head>` synchronously and applying `html.lang`/`html.dir` before CSS finishes parsing. Text content is swapped as soon as DOM is interactive (or immediately if already past).
- **Mixed-direction names** (`Sarah & Ilan`): rendered with `<span dir="ltr" style="unicode-bidi: isolate">` inside the translation string itself.
- **Postal codes and phone numbers in Hebrew text**: same isolation pattern.
- **RSVP server payload**: the existing payload is in English-keyed JSON (`name`, `attending`, etc.) — the Apps Script sheet is unaffected. Only the user-facing form is translated. The `events` array values stay as `mairie`/`henne`/`houppa`/`chabbat` keys regardless of language.
- **`?events=` URL parameter**: continues to use English keys; not localized.
- **`?preview=1` debug param**: still works in both languages.
- **iOS Calendar `.ics`**: SUMMARY/DESCRIPTION/LOCATION lines use the active language at click time, so a Hebrew user gets Hebrew calendar entries.

## Manual testing checklist

- [ ] Open in a fresh browser with `navigator.language = "he-IL"` → loads in Hebrew with RTL layout
- [ ] Open in a fresh browser with `navigator.language = "fr-FR"` → loads in French unchanged from current
- [ ] Open in a fresh browser with `navigator.language = "en-US"` → loads in French (fallback)
- [ ] Toggle FR → עב from the topbar selector → language switches, both selectors stay in sync
- [ ] Toggle עב → FR from the footer selector → language switches, both selectors stay in sync
- [ ] Refresh after switching → remembered selection persists
- [ ] Clear localStorage and refresh → browser locale detection runs again
- [ ] In Hebrew mode: side menu opens from the right; hamburger button on the right
- [ ] In Hebrew mode: countdown reads ימים / שעות / דקות / שניות right-to-left
- [ ] In Hebrew mode: chuppah names שרה / אילן still visually centered correctly
- [ ] In Hebrew mode: "Sarah & Ilan" appears with the `&` between the two Latin names, not flipped
- [ ] RSVP submit in French → success message in French
- [ ] RSVP submit in Hebrew → success message in Hebrew, payload reaches Sheet with same English keys
- [ ] Calendar download in French → `.ics` SUMMARY in French
- [ ] Calendar download in Hebrew → `.ics` SUMMARY in Hebrew
- [ ] Mobile (375px width) in both languages: topbar selector fits, menu accessible, no overflow
- [ ] `?preview=1&screen=events` still loads correctly in both languages

## Out of scope

- `hreflang` meta tags or separate `/he/` URL paths (SEO)
- A third language (English/Spanish/etc.)
- Animation/timing changes
- Visual redesign of any section
- Apps Script / Google Sheet changes
