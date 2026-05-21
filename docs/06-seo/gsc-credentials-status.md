# GSC Credentials Status - shiksha.cloud

**Checked**: 2026-03-29

---

## ✅ Credentials File Status

- **File Location**: `D:\nexus\.gsc-credentials.json`
- **File Size**: 2,371 bytes
- **Status**: ✅ Exists and valid

---

## ❌ GSC Access Status

**Issue**: Service account not added to Google Search Console

The credentials file is valid, but the service account doesn't have permission to access shiksha.cloud in GSC.

---

## 🔧 Fix Required (5 Minutes)

### Step 1: Get Service Account Email

Open your `.gsc-credentials.json` file and find the `client_email` field. It should look like:

```json
{
  "type": "service_account",
  "project_id": "shiksha-cloud-gsc",
  "client_email": "gsc-audit-bot@shiksha-cloud-gsc.iam.gserviceaccount.com",
  ...
}
```

**Copy the `client_email` value** (e.g., `gsc-audit-bot@shiksha-cloud-gsc.iam.gserviceaccount.com`)

---

### Step 2: Add to Google Search Console

1. Go to: https://search.google.com/search-console

2. Select property: **shiksha.cloud**
   - If you see multiple properties, select the domain property (`sc-domain:shiksha.cloud`)
   - Or select URL prefix (`https://shiksha.cloud/`)

3. Click **Settings** (gear icon, bottom left)

4. Click **Users and permissions**

5. Click **ADD USER**

6. Enter the service account email:
   ```
   gsc-audit-bot@shiksha-cloud-gsc.iam.gserviceaccount.com
   ```
   (Replace with your actual service account email from Step 1)

7. Permission level: Select **Owner** (not Viewer!)

8. Click **ADD**

---

### Step 3: Wait for Propagation

- Wait **5-10 minutes** for permissions to propagate
- Google's systems need time to update access controls

---

### Step 4: Test Again

```bash
npx tsx scripts/gsc-audit.ts
```

**Expected Output**:
```
🔍 GSC Audit for https://shiksha.cloud
==================================================

✅ Found GSC property: sc-domain:shiksha.cloud
   Permission level: siteOwner

📌 1. SITEMAP STATUS
   ✅ sitemap.xml
      Status: success
      ...
```

---

## 🚨 Common Issues

### "I don't see shiksha.cloud in my GSC"

**Fix**: You need to verify ownership first.

1. Go to: https://search.google.com/search-console
2. Click **Add Property**
3. Enter: `https://shiksha.cloud` (or `sc-domain:shiksha.cloud` for domain property)
4. Verify ownership via:
   - DNS record (for domain property), or
   - HTML file upload / meta tag (for URL prefix)

### "Service account shows as 'Pending'"

**Fix**: Wait 10-15 minutes. If still pending:
1. Remove the service account from GSC
2. Add it again
3. Wait longer (up to 1 hour in rare cases)

### "Permission denied" after adding

**Fix**: Ensure you selected **Owner** permission, not Viewer.

The script needs Owner-level access to read all GSC data.

---

## 📋 Checklist

- [ ] Open `.gsc-credentials.json`
- [ ] Copy `client_email` value
- [ ] Go to GSC → Settings → Users and permissions
- [ ] Add service account as **Owner**
- [ ] Wait 5-10 minutes
- [ ] Run: `npx tsx scripts/gsc-audit.ts`
- [ ] Verify output shows "✅ Found GSC property"

---

## ✅ After Successful Setup

Once the script runs successfully, you'll see:

- Sitemap status (indexed/submitted)
- Search performance (clicks, impressions, CTR, position)
- Top queries and pages
- CTR optimization opportunities

---

**Need Help?** 

- Full setup guide: [GSC-API-SETUP.md](./GSC-API-SETUP.md)
- Quick reference: [GSC-SETUP-QUICK.md](./GSC-SETUP-QUICK.md)
