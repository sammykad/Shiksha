# GSC Index Coverage Audit - shiksha.cloud

**Generated**: 2026-03-29  
**Based on**: Web crawl + GSC-INDEXING-FIX.md + indexing skill framework

---

## 🎯 Executive Summary

| Area | Status | Confidence |
|------|--------|------------|
| **Technical Setup** | ✅ Correct | High |
| **Sitemap** | ✅ Submitted (37 URLs) | High |
| **robots.txt** | ✅ Properly configured | High |
| **Index Coverage** | ⚠️ Requires GSC UI verification | Medium |
| **Search Performance** | ⚠️ Requires GSC UI verification | Medium |

---

## ✅ What's Already Working (Verified via Crawl)

### 1. robots.txt Configuration
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /_next/

Sitemap: https://shiksha.cloud/sitemap.xml
```

**Analysis**:
- ✅ Allows all public pages
- ✅ Blocks admin/dashboard areas (intentional)
- ✅ Blocks static assets (`/_next/`) - prevents GSC noise
- ✅ References sitemap.xml

### 2. Sitemap Status
- **URL**: https://shiksha.cloud/sitemap.xml
- **Total URLs**: ~37 pages
- **Includes**: Homepage, features, pricing, blogs, industries, legal pages
- **Format**: Valid XML sitemap

### 3. Site Structure
| Page Type | Index Intent | Status |
|-----------|--------------|--------|
| Homepage | Index | ✅ |
| /features | Index | ✅ |
| /pricing | Index | ✅ |
| /blogs | Index | ✅ |
| /industries/* | Index | ✅ |
| /contact | Index | ✅ |
| /founder | Index | ✅ |
| /dashboard/* | NoIndex (blocked) | ✅ |
| /api/* | NoIndex (blocked) | ✅ |

---

## ⚠️ Expected GSC Coverage Status

Based on the site configuration and indexing skill framework:

### Indexed Pages (Expected: ~30-35 URLs)

| URL | Expected Status | Notes |
|-----|-----------------|-------|
| / | ✅ Indexed | Homepage - highest priority |
| /features | ✅ Indexed | Priority 0.9 in sitemap |
| /pricing | ✅ Indexed | Priority 0.9 in sitemap |
| /blogs | ✅ Indexed | Blog listing |
| /blog/* | ✅ Indexed | Individual blog posts |
| /industries/k-12-schools | ✅ Indexed | Key landing page |
| /industries/coaching-centers | ✅ Indexed | Key landing page |
| /contact | ✅ Indexed | Contact page |
| /founder | ✅ Indexed | About page |
| /why-shiksha | ✅ Indexed | Value proposition |

### Not Indexed - Expected/Intentional (~10-20 URLs)

| URL Pattern | Reason | Status |
|-------------|--------|--------|
| `/_next/static/*` | Static assets, blocked by robots.txt | ✅ Expected |
| `/api/*` | API endpoints, blocked by robots.txt | ✅ Expected |
| `/dashboard/*` | Private user area, blocked by robots.txt | ✅ Expected |
| `/*?*` (parameter URLs) | Duplicate content, canonical to base | ⚠️ Monitor |

### Potential Issues to Investigate in GSC UI

| Issue Type | Likely Cause | Action |
|------------|--------------|--------|
| **Crawled - currently not indexed** | Static assets with `dpl=` params from Vercel | ✅ Ignore (normal for Next.js/Vercel) |
| **Discovered - currently not indexed** | New pages waiting for crawl | ⏳ Wait 1-2 weeks or Request Indexing |
| **Duplicate without canonical** | Parameter URLs (filters, sorting) | ⚠️ Add canonical tags |
| **Soft 404** | Empty state pages (e.g., empty search results) | ⚠️ Return 404 or add noindex |

---

## 🔍 GSC UI Verification Required

The following **must be checked manually** in GSC:

### 1. Page Indexing Report
**URL**: https://search.google.com/search-console/page-indexing

**Fill in these numbers**:

| Metric | Count | Trend | Action |
|--------|-------|-------|--------|
| Pages Indexed | ___ | ⬆️⬇️➡️ | |
| Pages Not Indexed | ___ | ⬆️⬇️➡️ | |

**Drill into "Why pages are not indexed"**:

| Reason | Count | Important Pages Affected? | Action |
|--------|-------|---------------------------|--------|
| Crawled - currently not indexed | | | |
| Discovered - currently not indexed | | | |
| Excluded by 'noindex' tag | | | |
| Blocked by robots.txt | | | |
| Duplicate, Google chose different canonical | | | |

### 2. URL Inspection Results

Test these URLs and fill in:

| URL | GSC Status | Action Needed |
|-----|------------|---------------|
| https://shiksha.cloud/ | | |
| https://shiksha.cloud/features | | |
| https://shiksha.cloud/pricing | | |
| https://shiksha.cloud/blogs | | |
| https://shiksha.cloud/industries/k-12-schools | | |

**Status Options**:
- "URL is on Google" ✅
- "URL is on Google, but has issues" ⚠️
- "URL is not on Google" ❌ → Click **REQUEST INDEXING**

### 3. Sitemap Details
**URL**: https://search.google.com/search-console/sitemaps

| Metric | Expected | Actual |
|--------|----------|--------|
| Status | Success | |
| Discovered URLs | ~37 | |
| Indexed URLs | ~30-35 | |
| Last Read | Within 7 days | |

---

## 📊 Search Performance (Requires GSC UI)

**URL**: https://search.google.com/search-console/performance

### Last 28 Days

| Metric | Value | Trend | Notes |
|--------|-------|-------|-------|
| Clicks | | ⬆️⬇️➡️ | |
| Impressions | | ⬆️⬇️➡️ | |
| CTR | % | ⬆️⬇️➡️ | |
| Avg Position | | ⬆️⬇️➡️ | |

### Top Queries (Fill from GSC)

| Query | Clicks | Impressions | CTR | Position |
|-------|-------|-------------|-----|----------|
| | | | | |
| | | | | |
| | | | | |

### Top Pages (Fill from GSC)

| Page | Clicks | Impressions | CTR | Position |
|------|-------|-------------|-----|----------|
| / | | | | |
| /features | | | | |
| /pricing | | | | |

---

## 🛠️ Recommended Actions

### Immediate (Today)

1. **Submit sitemap in GSC** (if not already done)
   - Go to: https://search.google.com/search-console/sitemaps
   - Enter: `sitemap.xml`
   - Click: **SUBMIT**

2. **Request indexing for priority pages**
   - Use URL Inspection tool for each URL in section 2 above
   - Click: **REQUEST INDEXING**

### This Week

3. **Review "Crawled - currently not indexed"**
   - If static assets (`/_next/static/*`): ✅ Ignore
   - If important content pages: ⚠️ Improve content + Request Indexing

4. **Check for missing canonical tags**
   - Inspect page source on key pages
   - Verify: `<link rel="canonical" href="https://shiksha.cloud/...">`

### Next 2 Weeks

5. **Monitor indexing progress daily**
   - Check URL Inspection status changes
   - Track "Pages indexed" trend in Coverage report

6. **Review performance data**
   - Identify low-CTR, high-impression pages
   - Optimize title tags and meta descriptions

### Next Month

7. **Full GSC audit** (use GSC-AUDIT-SHIKSHA.md checklist)
8. **Set up GSC API access** (optional, for automated monitoring)
   - Run: `npx tsx scripts/gsc-audit.ts` (requires credentials)

---

## 📈 Success Metrics

| Metric | Current | Target (30 days) | Target (90 days) |
|--------|---------|------------------|------------------|
| Pages Indexed | TBD | 35+ | 40+ |
| Organic Clicks/Day | TBD | 50+ | 200+ |
| Avg Position (top pages) | TBD | <10 | <5 |
| Indexed/Submitted Ratio | TBD | >90% | >95% |

---

## 🔗 Related Documents

- **Full Audit Checklist**: [GSC-AUDIT-SHIKSHA.md](./GSC-AUDIT-SHIKSHA.md)
- **GSC Setup Guide**: [GSC-INDEXING-FIX.md](./GSC-INDEXING-FIX.md)
- **Indexing Skill**: [.agents/skills/indexing/SKILL.md](./.agents/skills/indexing/SKILL.md)
- **GSC API Script**: [scripts/gsc-audit.ts](./scripts/gsc-audit.ts)

---

**Next Steps**:
1. Open GSC: https://search.google.com/search-console
2. Fill in the "Requires GSC UI" sections above
3. Execute Immediate actions (sitemap submission + URL indexing)
4. Schedule weekly monitoring
