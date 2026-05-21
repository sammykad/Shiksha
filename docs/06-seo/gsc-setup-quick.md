# GSC API Setup - Quick Reference Card

**Site**: shiksha.cloud  
**Time Required**: 10-15 minutes

---

## 📋 Checklist

### 1. Google Cloud Console (5 min)

- [ ] Create project: `shiksha-cloud-gsc`
  - https://console.cloud.google.com

- [ ] Enable Search Console API
  - https://console.cloud.google.com/apis/library/searchconsole.googleapis.com

- [ ] Create service account: `gsc-audit-bot`
  - https://console.cloud.google.com/apis/credentials

- [ ] Create & download JSON key
  - Keys tab → Add Key → Create new key → JSON
  - Save as: `.gsc-credentials.json`

### 2. Google Search Console (2 min)

- [ ] Add service account as Owner
  - GSC → Settings → Users and permissions
  - Email: `gsc-audit-bot@shiksha-cloud-gsc.iam.gserviceaccount.com`
  - Permission: **Owner**

### 3. Project Setup (1 min)

- [ ] Move credentials to project root
  - `D:\nexus\.gsc-credentials.json`

- [ ] Verify `.gitignore` includes:
  ```
  .gsc-credentials.json
  *.gsc-credentials.json
  ```

### 4. Test (2 min)

- [ ] Run audit script
  ```bash
  npx tsx scripts/gsc-audit.ts
  ```

---

## 🔗 Direct Links

| Task | URL |
|------|-----|
| Google Cloud Console | https://console.cloud.google.com |
| Enable API | https://console.cloud.google.com/apis/library/searchconsole.googleapis.com |
| Credentials | https://console.cloud.google.com/apis/credentials |
| GSC Settings | https://search.google.com/search-console/settings?resource_id=sc-domain:shiksha.cloud |
| GSC Users | https://search.google.com/search-console/settings?resource_id=sc-domain:shiksha.cloud&dlg=upm |

---

## 🚨 Common Issues

| Error | Fix |
|-------|-----|
| Missing .gsc-credentials.json | Download JSON key again, place in `D:\nexus\` |
| Permission denied | Add service account as **Owner** in GSC |
| API not enabled | Enable Search Console API in Google Cloud |
| Site not found | Verify GSC property is `sc-domain:shiksha.cloud` |

---

## ✅ Expected Output

```
🔍 GSC Audit for https://shiksha.cloud
==================================================

📌 1. SITE VERIFICATION
✅ Site verified in GSC
   Permission level: siteOwner

📌 3. SITEMAP STATUS
   ✅ sitemap.xml
      Status: success
      Last read: 2026-03-29
      Indexed: 35 / 37 submitted

📌 4. SEARCH PERFORMANCE (Last 28 days)
   📊 Total Clicks: 150
   📊 Total Impressions: 5000
   📊 Average CTR: 3.00%
   📊 Average Position: 12.45

   🔝 Top Queries:
      1. "school management software" → 50 clicks, 1200 impressions
      ...

==================================================
✅ Audit Complete
==================================================
```

---

## 📅 Maintenance

| Task | Frequency |
|------|-----------|
| Run audit script | Weekly |
| Review credentials | Monthly |
| Rotate API keys | Every 90 days |
| Check API quota | Monthly |

---

**Setup Date**: ________________  
**First Successful Run**: ________________  
**Next Key Rotation**: ________________
