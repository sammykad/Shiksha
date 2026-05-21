# Google Search Console API Setup Guide

**For**: shiksha.cloud  
**Purpose**: Enable automated GSC audits via `scripts/gsc-audit.ts`

---

## Prerequisites

- Google account with **Owner** access to shiksha.cloud in GSC
- 10-15 minutes for setup

---

## Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click **Select a project** → **NEW PROJECT**
3. Project name: `shiksha-cloud-gsc`
4. Organization: (None) or your org if applicable
5. Click **CREATE**
6. Wait 30 seconds for project creation

---

## Step 2: Enable Search Console API

1. In your new project, go to: **APIs & Services** → **Library**
2. Search for: `Search Console API`
3. Click on **Search Console API**
4. Click **ENABLE**
5. Wait for activation (green checkmark)

**Direct Link**: https://console.cloud.google.com/apis/library/searchconsole.googleapis.com

---

## Step 3: Create Service Account

1. Go to: **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **Service account**
3. Fill in:
   - **Service account name**: `gsc-audit-bot`
   - **Service account ID**: Auto-generated (e.g., `gsc-audit-bot@shiksha-cloud-gsc.iam.gserviceaccount.com`)
   - **Description**: `Automated GSC audits for shiksha.cloud`
4. Click **CREATE AND CONTINUE**
5. Skip role selection (click **CONTINUE**)
6. Click **DONE**

**Direct Link**: https://console.cloud.google.com/apis/credentials

---

## Step 4: Create Service Account Key

1. In **Credentials** page, find your new service account
2. Click the **email address** (e.g., `gsc-audit-bot@...iam.gserviceaccount.com`)
3. Go to **KEYS** tab
4. Click **ADD KEY** → **Create new key**
5. Select **JSON** format
6. Click **CREATE**
7. **Download the JSON file** (auto-downloads to your computer)

⚠️ **Important**: This file contains sensitive credentials. Store securely!

---

## Step 5: Add Service Account to Google Search Console

1. Go to: https://search.google.com/search-console
2. Select property: `https://shiksha.cloud` (or `sc-domain:shiksha.cloud`)
3. Click **Settings** (gear icon, bottom left)
4. Click **Users and permissions**
5. Click **ADD USER**
6. Enter service account email:
   ```
   gsc-audit-bot@shiksha-cloud-gsc.iam.gserviceaccount.com
   ```
7. Permission level: **Owner** (required for full API access)
8. Click **ADD**

**Direct Link**: https://search.google.com/search-console/settings?resource_id=sc-domain:shiksha.cloud

---

## Step 6: Install Credentials in Project

### 6.1 Move Credentials File

1. Take the downloaded JSON file (e.g., `shiksha-cloud-gsc-abc123xyz.json`)
2. Rename to: `.gsc-credentials.json`
3. Move to project root: `D:\nexus\.gsc-credentials.json`

### 6.2 Add to .gitignore

Ensure the credentials file is **never committed** to git:

```bash
# Add to .gitignore
.gsc-credentials.json
*.gsc-credentials.json
```

### 6.3 Verify File Location

Your structure should look like:
```
D:\nexus\
├── .gitignore
├── .gsc-credentials.json  ← Credentials file (DO NOT COMMIT)
├── GSC-AUDIT-SHIKSHA.md
├── GSC-COVERAGE-AUDIT.md
├── scripts/
│   └── gsc-audit.ts
└── ...
```

---

## Step 7: Test the Setup

### 7.1 Install Required Package

Already done: `googleapis` is installed (see package.json)

### 7.2 Run the Audit Script

```bash
npx tsx scripts/gsc-audit.ts
```

### Expected Output

```
🔍 GSC Audit for https://shiksha.cloud
==================================================

📌 1. SITE VERIFICATION
✅ Site verified in GSC
   Permission level: siteOwner

📌 2. PAGE INDEXING STATUS
⚠️  Coverage report requires manual check in GSC UI
   → https://search.google.com/search-console/page-indexing

📌 3. SITEMAP STATUS
   📄 sitemap.xml
      Status: success
      Last read: 2026-03-29
      Indexed: 35

📌 4. SEARCH PERFORMANCE (Last 28 days)
   📊 Total Clicks: 150
   📊 Total Impressions: 5000
   📊 Average CTR: 3.00%
   📊 Average Position: 12.45

   🔝 Top Queries:
      1. "school management software" → 50 clicks, 1200 impressions
      2. "shiksha cloud" → 30 clicks, 400 impressions
      ...

📌 5. TOP PAGES BY IMPRESSIONS
      1. / → 2000 impressions, 80 clicks
      2. /features → 1500 impressions, 45 clicks
      3. /pricing → 800 impressions, 30 clicks
      ...

==================================================
📋 MANUAL CHECKLIST (GSC UI Required)
==================================================
...

==================================================
✅ Audit Complete
==================================================
```

---

## Troubleshooting

### Error: "Missing or invalid .gsc-credentials.json"

**Cause**: Credentials file not found or malformed JSON

**Fix**:
1. Verify file exists: `D:\nexus\.gsc-credentials.json`
2. Check JSON syntax (use JSONLint.com)
3. Ensure file is not empty

---

### Error: "User does not have sufficient permissions"

**Cause**: Service account not added as Owner in GSC

**Fix**:
1. Go to GSC → Settings → Users and permissions
2. Verify service account email is listed as **Owner**
3. Wait 5-10 minutes for permissions to propagate

---

### Error: "Site not found in GSC"

**Cause**: Wrong GSC property URL or site not verified

**Fix**:
1. Verify site ownership in GSC: https://search.google.com/search-console
2. Check property type:
   - Domain property: `sc-domain:shiksha.cloud`
   - URL prefix: `https://shiksha.cloud`
3. Update `GSC_PROPERTY` in `scripts/gsc-audit.ts` if needed

---

### Error: "Search Console API has not been used"

**Cause**: API not enabled in Google Cloud Console

**Fix**:
1. Go to: https://console.cloud.google.com/apis/library/searchconsole.googleapis.com
2. Click **ENABLE**
3. Wait 1-2 minutes for activation

---

## Automation Options

### Option 1: Run Weekly via Task Scheduler (Windows)

1. Open **Task Scheduler**
2. **Create Basic Task**
3. Name: `GSC Weekly Audit`
4. Trigger: Weekly (e.g., Monday 9 AM)
5. Action: Start a program
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `D:\nexus\scripts\gsc-audit.ts`
   - Start in: `D:\nexus`
6. Finish

### Option 2: GitHub Actions (if using GitHub)

Create `.github/workflows/gsc-audit.yml`:

```yaml
name: GSC Weekly Audit

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run GSC Audit
        env:
          GSC_CREDENTIALS: ${{ secrets.GSC_CREDENTIALS }}
        run: |
          echo "$GSC_CREDENTIALS" > .gsc-credentials.json
          npx tsx scripts/gsc-audit.ts
```

Then add credentials as GitHub Secret:
```bash
# In GitHub repo → Settings → Secrets and variables → Actions
# New secret: GSC_CREDENTIALS
# Value: Paste entire .gsc-credentials.json content
```

### Option 3: Output to File for Records

Modify script to save audit results:

```bash
npx tsx scripts/gsc-audit.ts > gsc-audit-$(date +%Y-%m-%d).md
```

---

## API Quotas & Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Requests per day | 50,000 | Per project |
| Rows per response | 25,000 | Use pagination for more |
| Data freshness | 2-3 days | Not real-time |
| Historical data | 16 months | Rolling window |

---

## Security Best Practices

1. **Never commit credentials** to git
   - `.gsc-credentials.json` is in `.gitignore`
   
2. **Limit service account permissions**
   - Only add to required GSC properties
   - Use **Owner** role only when necessary

3. **Rotate credentials periodically**
   - Delete old keys in Google Cloud Console
   - Create new keys every 90 days

4. **Monitor API usage**
   - Check: **APIs & Services** → **Dashboard**
   - Set up billing alerts if quota exceeded

---

## Next Steps After Setup

1. ✅ Run first audit: `npx tsx scripts/gsc-audit.ts`
2. ✅ Review output and fill in manual sections
3. ✅ Schedule recurring audits (weekly/monthly)
4. ✅ Set up alerting for critical issues (optional)
5. ✅ Integrate with SEO monitoring workflow

---

## Support Resources

- **GSC API Docs**: https://developers.google.com/webmaster-tools
- **API Explorer**: https://developers.google.com/webmaster-tools/v1/how-tos/search_analytics
- **Quota Increase**: https://console.cloud.google.com/apis/api/searchconsole.googleapis.com/quotas

---

**Setup Completed**: ________________  
**Test Run Successful**: ________________  
**First Scheduled Audit**: ________________
