# Hazmat Training Eval — Setup Guide

## Overview
This app has two pages:
- `/` — The eval form techs fill out (link this from your QR code)
- `/admin` — Password-protected dashboard showing all responses from Google Sheets

---

## Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new sheet
2. Name it: **Hazmat Training Evaluations**
3. In Row 1, add these exact headers in columns A–L:

```
Timestamp | Date | Training Type | Instructor | Role | Q1_Objectives | Q2_Relevance | Q3_Instructor | Q4_Prepared | Q5_Recommend | Overall | Comments
```

4. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**THIS_PART**`/edit`

---

## Step 2: Create the Google Apps Script

This script is what receives form submissions and writes them to your sheet.

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete the default code and paste this:

```javascript
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date().toISOString(),
      data.date,
      data.trainingType,
      data.instructor,
      data.role,
      data.q1,
      data.q2,
      data.q3,
      data.q4,
      data.q5,
      data.overall,
      data.comments
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return ContentService
    .createTextOutput(JSON.stringify({ data }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Deploy → New deployment**
4. Type: **Web app**
5. Execute as: **Me**
6. Who has access: **Anyone**
7. Click **Deploy** → Copy the Web App URL

---

## Step 3: Configure the app

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```

2. Fill in your values:
   ```
   REACT_APP_GOOGLE_SHEET_ID=1BxiMVs...
   REACT_APP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/...
   ```

---

## Step 4: Deploy to Vercel

```bash
npm install
npm run build
npx vercel --prod
```

Set your environment variables in Vercel dashboard under **Settings → Environment Variables**.

---

## Step 5: Generate QR Code

1. Go to [qr-code-generator.com](https://www.qr-code-generator.com)
2. Enter your Vercel app URL (e.g. `https://hazmat-eval.vercel.app`)
3. Download as PNG or SVG
4. Print and laminate — post at every training

---

## Admin Dashboard

Navigate to `/admin` on your deployed app.

Default password: `hazmat2024` — **change this** in `src/pages/Admin.jsx` before deploying.

---

## Customizing Training Types

Edit the `TRAINING_TYPES` array in `src/config.js` to match your program's events.
