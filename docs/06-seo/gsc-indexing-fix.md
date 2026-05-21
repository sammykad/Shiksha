# Google Search Console - Indexing Fix Checklist

## Problem Status
- **Issue**: "URL is unknown to Google" for https://shiksha.cloud/features
- **Root Cause**: Sitemap not submitted to Google Search Console
- **Status**: Code is correct, manual GSC action required

---

## Step-by-Step Fix (Do This Now)

### 1. Submit Sitemap to GSC ⭐ CRITICAL

1. Go to: https://search.google.com/search-console
2. Select property: `https://shiksha.cloud`
3. Click **Sitemaps** in left sidebar
4. In "Add a new sitemap" field, enter: `sitemap.xml`
5. Click **SUBMIT**
6. Verify status shows:
   - Status: ✅ **Success**
   - Discovered URLs: ~37 URLs
   - Last read: Today's date

**Expected Result**: All 37 URLs from your sitemap will be submitted for crawling

---

### 2. Request Indexing for Key Pages

For each URL below, do this:

1. Paste URL into GSC **URL Inspection** tool (top search bar)
2. Wait for analysis
3. Click **TEST LIVE URL**
4. Click **REQUEST INDEXING**
5. Complete captcha if shown

**Priority URLs to Submit**:

| URL | Priority | Status |
|-----|----------|--------|
| https://shiksha.cloud/ | Critical | ⏳ Submit |
| https://shiksha.cloud/features | Critical | ⏳ Submit |
| https://shiksha.cloud/pricing | Critical | ⏳ Submit |
| https://shiksha.cloud/industries/k-12-schools | High | ⏳ Submit |
| https://shiksha.cloud/industries/coaching-centers | High | ⏳ Submit |
| https://shiksha.cloud/blogs | High | ⏳ Submit |
| https://shiksha.cloud/contact | Medium | ⏳ Submit |
| https://shiksha.cloud/founder | Medium | ⏳ Submit |
| https://shiksha.cloud/why-shiksha | Medium | ⏳ Submit |

---

### 3. Verify Internal Linking (Already Done ✅)

Your codebase already has proper internal linking:

**Homepage** (`/`) links to:
- ✅ `/features` (via Features component)
- ✅ `/pricing` (via Navbar and CTAs)

**Footer** links to:
- ✅ `/features`
- ✅ `/pricing`
- ✅ `/blogs`
- ✅ `/contact`
- ✅ All important pages

**Navbar** links to:
- ✅ `/pricing`
- ✅ `/features/*` (mega menu)

---

### 4. Monitor Indexing Progress

**Timeline**:
- **Day 1-2**: Sitemap processed, URLs discovered
- **Day 3-7**: Pages start getting indexed
- **Day 7-14**: Full indexing complete

**Check Daily**:
1. GSC → URL Inspection → Enter URL
2. Status should change from "URL is not on Google" to "URL is on Google"
3. Check **Page Indexing** report for overall progress

---

## Code Verification (Already Correct)

### ✅ Sitemap Configuration
File: `app/sitemap.ts`
- Includes `/features` with priority 0.9, weekly changefreq
- Includes all major pages (37 total URLs)
- Auto-updates on build

### ✅ Robots.txt Configuration
File: `app/robots.ts`
```typescript
rules: {
  userAgent: '*',
  allow: '/',
  disallow: ['/api/', '/dashboard/', '/_next/']
}
sitemap: 'https://shiksha.cloud/sitemap.xml'
```
- ✅ Allows `/features`
- ✅ Blocks only admin/dashboard paths

### ✅ Metadata on Pages
All pages have proper:
- `robots: { index: true, follow: true }`
- Canonical URLs
- OpenGraph tags
- Twitter cards

---

## After Indexing: Next Steps

### Week 2: Monitor Performance
1. GSC → Performance → Check impressions/clicks
2. GSC → Page Indexing → Verify all pages show "Indexed"
3. GSC → Core Web Vitals → Check mobile performance

### Week 3: Optimize
1. Identify low-CTR pages (high impressions, low clicks)
2. Optimize title tags and meta descriptions
3. Build backlinks from education blogs, directories

### Month 2: Scale
1. Add more blog content (target keywords)
2. Submit to Indian education directories
3. Get listed on product hunt, alternativeTo, etc.

---

## Common Issues & Solutions

### Issue: "Crawled - currently not indexed"
**Cause**: Google crawled but chose not to index
**Fix**: 
- Improve content quality
- Add more internal links to that page
- Ensure unique, valuable content

### Issue: "Discovered - currently not indexed"
**Cause**: Google knows about URL but hasn't crawled yet
**Fix**:
- Wait 1-2 weeks
- Improve server response time
- Build more backlinks

### Issue: Sitemap shows errors
**Cause**: URLs returning 404 or redirect loops
**Fix**:
- Check each URL manually
- Fix broken links
- Update sitemap if URLs changed

---

## Quick Reference Links

- **GSC Home**: https://search.google.com/search-console
- **URL Inspection Tool**: https://search.google.com/search-console/inspect
- **Sitemap Report**: https://search.google.com/search-console/sitemaps
- **Page Indexing Report**: https://search.google.com/search-console/page-indexing
- **Performance Report**: https://search.google.com/search-console/performance

---

## Contact for Help

If issues persist after 2 weeks:
1. Check GSC Manual Actions report
2. Verify site ownership in GSC
3. Check for robots.txt blocking (use URL Inspection tool)
4. Review server logs for Googlebot activity

---

**Last Updated**: 2026-03-29
**Site**: https://shiksha.cloud
**GSC Property**: https://shiksha.cloud
