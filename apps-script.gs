/**
 * Sarah & Ilan — RSVP backend
 * --------------------------------------------------------------------------
 * SETUP (one-time, ~3 minutes):
 *
 * 1. Create a new Google Sheet (or use an existing one). Share it with the
 *    family members who should see the responses.
 *
 * 2. In the sheet, click  Extensions → Apps Script.
 *
 * 3. Delete the default `function myFunction() {}` placeholder, then paste
 *    this entire file. Save (File → Save, or Ctrl/Cmd+S). Give the project
 *    any name you like, e.g. "Sarah & Ilan RSVP".
 *
 * 4. Click  Deploy → New deployment.
 *      • Click the gear ⚙ next to "Select type" → choose "Web app".
 *      • Description: anything (e.g. "rsvp v1").
 *      • Execute as:        Me (your Google account).
 *      • Who has access:    Anyone.
 *      • Click Deploy.
 *      • Authorize when prompted (Google will warn that the app is unverified
 *        — this is normal because it's your own script. Click "Advanced" →
 *        "Go to <project name> (unsafe)" → "Allow").
 *
 * 5. Copy the "Web app URL" Google shows you. It looks like
 *      https://script.google.com/macros/s/AKfycb.../exec
 *
 * 6. Open `script.js` in this repo and paste that URL into the
 *      const RSVP_ENDPOINT = "";
 *    line near the top of the RSVP section.
 *
 * 7. Make sure the TOKEN constant below matches RSVP_TOKEN in script.js.
 *    (Both are set to "ilan-sarah-2026" by default.)
 *
 * 8. Commit + deploy your site. Done — the form now writes to your sheet.
 *
 * --------------------------------------------------------------------------
 * UPDATING THE SCRIPT LATER:
 *   After editing this file in the Apps Script editor, you must redeploy:
 *     Deploy → Manage deployments → ✏ pencil icon → Version: New version → Deploy.
 *   The Web App URL stays the same.
 * --------------------------------------------------------------------------
 */

const SHEET_NAME = "Réponses";
const TOKEN = "ilan-sarah-2026"; // must match RSVP_TOKEN in script.js

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.token !== TOKEN) {
      return jsonResponse({ ok: false, error: "auth" });
    }
    if (data.honeypot) {
      return jsonResponse({ ok: false, error: "spam" });
    }

    const ss = SpreadsheetApp.getActive();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Date",
        "Nom",
        "Téléphone",
        "Présence",
        "Personnes",
        "Événements confirmés",
        "Événements invités",
        "Régime alimentaire",
        "Message",
        "User agent",
      ]);
      sheet.getRange("A1:J1").setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.phone || "",
      data.attending === "yes" ? "Oui" : "Non",
      Number(data.guests) || 0,
      (data.events || []).join(", "),
      (data.invited || []).join(", "),
      data.dietary || "",
      data.message || "",
      data.userAgent || "",
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Lets you sanity-check the deployment by hitting the URL in a browser.
function doGet() {
  return ContentService.createTextOutput("Sarah & Ilan RSVP endpoint is live.");
}
