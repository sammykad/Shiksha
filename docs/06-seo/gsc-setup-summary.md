# GSC API Setup Summary - shiksha.cloud

**Created**: 2026-03-29  
**Status**: Ready for credential setup

---

## 📦 What Was Created

### 1. Documentation Files

| File | Purpose |
|------|---------|
| **GSC-API-SETUP.md** | Complete step-by-step setup guide with screenshots instructions |
| **GSC-SETUP-QUICK.md** | Quick reference card (1-page checklist) |
| **GSC-AUDIT-SHIKSHA.md** | Comprehensive manual audit template (20+ sections) |
| **GSC-COVERAGE-AUDIT.md** | Pre-filled audit with expected coverage status |
| **scripts/gsc-audit.ts** | Automated audit script (enhanced with CTR analysis) |

### 2. Script Enhancements

The `scripts/gsc-audit.ts` script now includes:

- ✅ Site verification status
- ✅ Sitemap submission status (with indexed/submitted ratio)
- ✅ Search performance (28-day rolling window)
- ✅ **NEW**: CTR vs Position benchmark analysis
- ✅ **NEW**: Low-CTR page opportunities detection
- ✅ Top queries and pages breakdown
- ✅ Manual checklist reminders
- ✅ Output file suggestion

### 3. Security Updates

- ✅ Added `.gsc-credentials.json` to `.gitignore`
- ✅ Credentials file never committed to version control

---

## 🚀 Next Steps (Your Action Required)

### Step 1: Follow GSC-API-SETUP.md

Open: [`GSC-API-SETUP.md`](./GSC-API-SETUP.md)

This guide walks you through:
1. Creating Google Cloud project
2. Enabling Search Console API
3. Creating service account
4. Downloading JSON credentials
5. Adding service account to GSC
6. Testing the setup

**Time**: 10-15 minutes

### Step 2: Save Credentials

After downloading the JSON key from Google Cloud:
1. Rename to: `.gsc-credentials.json`
2. Move to: `D:\nexus\.gsc-credentials.json`

### Step 3: Run First Audit

```bash
npx tsx scripts/gsc-audit.ts
```

**Expected output**: Full GSC data including:
- Sitemap status
- Search performance metrics
- Top queries and pages
- CTR optimization opportunities

### Step 4: Save Audit Results

```bash
npx tsx scripts/gsc-audit.ts > gsc-audit-2026-03-29.md
```

---

## 📊 What the Audit Will Show

Once credentials are set up, running `gsc-audit.ts` will display:

### 1. Site Verification
```
✅ Site verified in GSC
   Permission level: siteOwner
```

### 2. Sitemap Status
```
✅ sitemap.xml
   Status: success
   Last read: 2026-03-29
   Indexed: 35 / 37 submitted
```

### 3. Search Performance (Last 28 Days)
```
📊 Total Clicks: [actual number]
📊 Total Impressions: [actual number]
📊 Average CTR: [X.XX]%
📊 Average Position: [XX.XX]
```

### 4. CTR Optimization Opportunities
```
⚠️  Low CTR Opportunities (CTR < expected for position):
   /features | Pos: 4 | CTR: 2.1% (expected: 5%+)
   /pricing | Pos: 3 | CTR: 5.2% (expected: 8%+)
```

### 5. Top Queries
```
🔝 Top Queries:
   1. "school management software" → 50 clicks, 1200 impressions (Pos: 8.5)
   2. "shiksha cloud" → 30 clicks, 400 impressions (Pos: 2.1)
   ...
```

### 6. Top Pages
```
📌 5. TOP PAGES BY IMPRESSIONS
   1. / → 2000 impressions, 80 clicks
   2. /features → 1500 impressions, 45 clicks
   3. /pricing → 800 impressions, 30 clicks
   ...
```

---

## 🔧 Alternative: Manual Audit (No API Setup)

If you prefer not to set up API access, use the manual audit templates:

### Option A: Fill GSC-AUDIT-SHIKSHA.md

1. Open each GSC report URL in the checklist
2. Fill in the blank tables with actual data
3. Screenshot charts for records
4. Export data to spreadsheet monthly

**Start here**: [`GSC-AUDIT-SHIKSHA.md`](./GSC-AUDIT-SHIKSHA.md)

### Option B: Quick Health Check

1. **Page Indexing**: https://search.google.com/search-console/page-indexing
2. **Sitemaps**: https://search.google.com/search-console/sitemaps
3. **Performance**: https://search.google.com/search-console/performance

Fill in this table:

| Metric | Value | Trend |
|--------|-------|-------|
| Pages Indexed | | ⬆️⬇️➡️ |
| Pages Not Indexed | | ⬆️⬇️➡️ |
| Total Clicks (28d) | | ⬆️⬇️➡️ |
| Total Impressions (28d) | | ⬆️⬇️➡️ |
| Sitemap Status | | ✅/⚠️/❌ |

---

## 📅 Recommended Monitoring Schedule

| Task | Frequency | Method |
|------|-----------|--------|
| Run GSC audit | Weekly | `npx tsx scripts/gsc-audit.ts` |
| Review indexing issues | Weekly | GSC UI or script output |
| Performance analysis | Bi-weekly | Script + manual review |
| Full SEO audit | Monthly | GSC-AUDIT-SHIKSHA.md |
| API key rotation | Every 90 days | Google Cloud Console |

---

## 🆘 Troubleshooting

### "Where do I get credentials?"

Follow **GSC-API-SETUP.md** Step 1-5. You need:
1. Google account with GSC Owner access for shiksha.cloud
2. Google Cloud project (free, no billing required for basic usage)
3. Service account with JSON key

### "Can I share GSC access with team?"

Yes! Add team members in GSC → Settings → Users and permissions.

### "What if API setup fails?"

Use manual audit template: GSC-AUDIT-SHIKSHA.md

### "How much does the API cost?"

Free quota: 50,000 requests/day (more than enough for weekly audits)

---

## 📚 Related Documentation

| Document | Use Case |
|----------|----------|
| GSC-API-SETUP.md | Step-by-step API credential setup |
| GSC-SETUP-QUICK.md | Quick reference checklist |
| GSC-AUDIT-SHIKSHA.md | Comprehensive manual audit template |
| GSC-COVERAGE-AUDIT.md | Expected coverage status + action items |
| GSC-INDEXING-FIX.md | Original indexing fix guide |
| scripts/gsc-audit.ts | Automated audit script |

---

## ✅ Success Criteria

After setup, you should be able to:

- [ ] Run `npx tsx scripts/gsc-audit.ts` without errors
- [ ] See actual GSC data (clicks, impressions, indexed pages)
- [ ] Identify low-CTR pages for optimization
- [ ] Track indexing progress over time
- [ ] Export audit results to markdown files

---

**Questions?** 

1. Check GSC-API-SETUP.md troubleshooting section
2. Review GSC-SETUP-QUICK.md checklist
3. Use manual audit template if API setup is blocked

---

**Setup Status**: ⏳ Awaiting credential configuration  
**Estimated Time**: 10-15 minutes  
**Difficulty**: Easy (follow step-by-step guide)
