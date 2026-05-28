# TTCP Conference Sign-In — Setup Guide

## Files in this package
- `index.html`    — the PWA sign-in app
- `manifest.json` — makes it installable on tablets
- `sw.js`         — service worker (offline support)
- `Code.gs`       — Google Apps Script backend

---

## Step 1 — Google Sheet setup

1. Open (or create) your attendee spreadsheet.
2. Create a tab named **Attendee Names** with a single column:
   ```
   Name
   Jane Smith
   John Doe
   ...
   ```
3. Create a second tab named **Responses** (the script will auto-create it
   with headers on first submission, but creating it now avoids surprises).
4. Note the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit`

---

## Step 2 — Publish the names tab as CSV

1. File → Share → Publish to web
2. Choose the **Attendee Names** tab
3. Format: **Comma-separated values (.csv)**
4. Click Publish — copy the URL.
   It will look like:
   `https://docs.google.com/spreadsheets/d/.../pub?gid=0&single=true&output=csv`

---

## Step 3 — Create a Drive folder for signatures

1. In Google Drive, create a folder (e.g. "TTCP Signatures — [Event Name]")
2. Open the folder. The ID is in the URL:
   `https://drive.google.com/drive/folders/THIS_IS_THE_ID`
3. Share the folder with the Google account that will run the Apps Script.

---

## Step 4 — Deploy the Apps Script

1. In your spreadsheet, go to **Extensions → Apps Script**
2. Delete any existing code and paste the contents of `Code.gs`
3. Fill in the two constants at the top:
   ```javascript
   const SPREADSHEET_ID  = 'your-sheet-id';
   const DRIVE_FOLDER_ID = 'your-folder-id';
   ```
4. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (no sign-in required)
5. Click Deploy → copy the **Web app URL**
   (looks like: `https://script.google.com/macros/s/.../exec`)
6. ⚠ Every time you change Code.gs, you must create a **New deployment**
   (not update existing) — otherwise the old version keeps running.

---

## Step 5 — Configure the PWA

Open `index.html` and edit the two lines at the top of the `<script>` block:

```javascript
const SHEET_CSV_URL   = 'paste-your-csv-url-here';
const APPS_SCRIPT_URL = 'paste-your-web-app-url-here';
```

---

## Step 6 — Host the PWA

The three files (`index.html`, `manifest.json`, `sw.js`) need to be served
over **HTTPS** for the PWA install prompt to work.

**Easiest option — GitHub Pages (free):**
1. Create a private GitHub repo
2. Upload the three files
3. Settings → Pages → deploy from main branch
4. Your URL: `https://yourusername.github.io/repo-name/`

**Alternative — any static host:**
Netlify Drop (netlify.com/drop) lets you drag-and-drop the folder — instant HTTPS.

---

## Step 7 — Install on tablets (iPad/Android)

**iPad (Safari):**
1. Open the URL in Safari
2. Tap the Share icon → **Add to Home Screen**
3. Name it "TTCP Sign-In" → Add
4. Open from home screen — runs fullscreen, no browser chrome

**Android (Chrome):**
1. Open the URL in Chrome
2. Tap the three-dot menu → **Add to Home screen**
3. Or Chrome will show a banner automatically

**Lock down the tablet:**
- iPad: Settings → Accessibility → Guided Access — locks to one app
- Android: Settings → Security → Screen Pinning

---

## Day-of checklist

- [ ] Tablets charged and plugged in
- [ ] App open and loaded on each tablet
- [ ] Names list loaded (tap "↻ Refresh list")
- [ ] Test submission confirmed in Responses tab
- [ ] Drive folder has write access confirmed
- [ ] Walk-in flow tested ("Not on list?" path)

---

## Adding walk-ins

Two options:
1. Add the name to the Attendee Names sheet, then tap **↻ Refresh list** on
   the tablet. The name appears within a few minutes (CSV cache).
2. Use the **"Not on list? Enter manually"** option — it submits with "(walk-in)"
   appended to the name. Faster, and requires no sheet editing.

---

## Reading the results

In the **Responses** tab:
- Column A: Timestamp (local time)
- Column B: Name
- Column C: Signature image link (click to view)
- Column D: ISO timestamp (UTC)

To see signature images: click any link in column C, or open the Drive folder
directly to see all PNGs named `FirstLast_YYYYMMDD_HHmmss.png`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Names don't load | Check CSV URL is published and correct in index.html |
| Submission fails (online) | Re-deploy Apps Script as a NEW deployment |
| Images not saving | Confirm DRIVE_FOLDER_ID is correct and the script has Drive access |
| PWA won't install | Must be served over HTTPS, not opened as a local file |
| Queue badge appears | Offline submissions saved locally — they auto-sync when back online |
