# Google Search Console Audit - shiksha.cloud

**Audit Date**: 2026-03-29  
**Property**: `https://shiksha.cloud`  
**GSC Property Type**: Domain (sc-domain:shiksha.cloud)  
**Ownership Status**: ✅ Verified (per GSC-INDEXING-FIX.md)

---

## 📊 How to Use This Audit

This audit is designed for **manual execution** in the GSC UI. For each section:
1. Click the provided GSC link
2. Fill in the data in the tables below
3. Mark status: ✅ Healthy | ⚠️ Warning | ❌ Action Required

---

## 1. PAGE INDEXING (Critical)

**URL**: https://search.google.com/search-console/page-indexing

### 1.1 Indexed vs Not Indexed Overview

| Metric | Count | Trend (7d) | Status |
|--------|-------|------------|--------|
| Pages Indexed | _Fill from GSC_ | ⬆️⬇️➡️ | |
| Pages Not Indexed | _Fill from GSC_ | ⬆️⬇️➡️ | |

**Instructions**:
- Turn OFF "Pages not indexed" → screenshot "Pages indexed" trend
- Turn OFF "Pages indexed" → screenshot "Pages not indexed" trend
- Stable trend = ✅ Good | Sudden drop/spike = ⚠️ Investigate

### 1.2 Why Pages Are Not Indexed (Drill into each reason)

Click each reason in the "Why pages are not indexed" section:

| Reason | Count | Status | Action Needed |
|--------|-------|--------|---------------|
| Crawled - currently not indexed | | | |
| Discovered - currently not indexed | | | |
| Excluded by 'noindex' tag | | | |
| Blocked by robots.txt | | | |
| Redirect | | | |
| Soft 404 | | | |
| 404 | | | |
| Duplicate, Google chose different canonical | | | |
| Alternate page with proper canonical | | | |

**Action Guidelines**:

| Reason | If Important Pages Affected | If Expected |
|--------|----------------------------|-------------|
| Crawled - currently not indexed | Improve content, add internal links, Request Indexing | Static assets (/\\_next/) = OK to ignore |
| Discovered - currently not indexed | Wait 1-2 weeks, build backlinks | New pages = normal |
| Excluded by 'noindex' | Remove noindex if accidental | Login, admin, thank-you pages = OK |
| Blocked by robots.txt | Remove Disallow rule | /api/, /dashboard/ = OK |
| 404 | Fix broken links or redirect | Deleted pages = OK |

### 1.3 URL Inspection for Priority Pages

Test each URL using the **URL Inspection Tool** (top search bar in GSC):

| URL | Status | Indexing Allowed? | Canonical | Action |
|-----|--------|-------------------|-----------|--------|
| https://shiksha.cloud/ | | | | |
| https://shiksha.cloud/features | | | | |
| https://shiksha.cloud/pricing | | | | |
| https://shiksha.cloud/blogs | | | | |
| https://shiksha.cloud/industries/k-12-schools | | | | |
| https://shiksha.cloud/industries/coaching-centers | | | | |
| https://shiksha.cloud/contact | | | | |
| https://shiksha.cloud/founder | | | | |

**Status Options**:
- ✅ "URL is on Google"
- ⚠️ "URL is on Google, but has issues"
- ❌ "URL is not on Google" → Click **REQUEST INDEXING**

---

## 2. SITEMAPS

**URL**: https://search.google.com/search-console/sitemaps

### 2.1 Sitemap Submission Status

| Sitemap | Status | Discovered URLs | Indexed URLs | Last Read |
|---------|--------|-----------------|--------------|-----------|
| sitemap.xml | | | | |

**Expected**:
- Status: ✅ Success
- Discovered URLs: ~37 (per GSC-INDEXING-FIX.md)
- Indexed URLs: Should be close to discovered count
- Last Read: Within last 7 days

### 2.2 Sitemap Content Verification

Navigate to: `https://shiksha.cloud/sitemap.xml`

**Checklist**:
- [ ] Homepage (/) included with priority 1.0
- [ ] /features included with priority 0.9
- [ ] /pricing included with priority 0.9
- [ ] All blog posts included
- [ ] All industry pages included
- [ ] No 404 URLs in sitemap
- [ ] Lastmod dates are recent

---

## 3. SEARCH PERFORMANCE

**URL**: https://search.google.com/search-console/performance

### 3.1 Overall Performance (Last 28 Days)

| Metric | Value | vs Previous 28d | Status |
|--------|-------|-----------------|--------|
| Total Clicks | | ⬆️⬇️➡️ | |
| Total Impressions | | ⬆️⬇️➡️ | |
| Average CTR | % | ⬆️⬇️➡️ | |
| Average Position | | ⬆️⬇️➡️ | |

**Instructions**:
- Date range: Last 28 days
- Compare to: Previous 28 days
- Search type: Web
- Check: All search appearances

### 3.2 Performance Trend Analysis

**Chart Analysis** (screenshot for records):
- [ ] Clicks trend: Stable/Increasing ⬆️
- [ ] Impressions trend: Stable/Increasing ⬆️
- [ ] No sudden drops (if drop, correlate with releases/changes)

### 3.3 Top Queries (Last 28 Days)

| Query | Clicks | Impressions | CTR | Position | Status |
|-------|-------|-------------|-----|----------|--------|
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |

**Optimization Opportunity**:
- High impressions + Low CTR (<2%) = Optimize title/meta description
- Position 4-10 + High impressions = Content improvement for top 3

### 3.4 Top Pages (Last 28 Days)

| Page | Clicks | Impressions | CTR | Position | Status |
|------|-------|-------------|-----|----------|--------|
| / | | | | | |
| /features | | | | | |
| /pricing | | | | | |
| /blogs | | | | | |
| /industries/* | | | | | |

**Low CTR Alert** (CTR < expected for position):

| Page | Position | Actual CTR | Expected CTR | Gap |
|------|----------|------------|--------------|-----|
| | | | | |

**Expected CTR by Position** (for reference):

| Position | Expected CTR |
|----------|--------------|
| 1 | 25-35% |
| 2 | 12-18% |
| 3 | 8-12% |
| 4-5 | 5-7% |
| 6-10 | 2-5% |

---

## 4. CORE WEB VITALS

**URL**: https://search.google.com/search-console/core-web-vitals

### 4.1 Mobile Performance (Priority)

| Status | URL Count | Action |
|--------|-----------|--------|
| Good | | ✅ Monitor |
| Needs Improvement | | ⚠️ Fix |
| Poor | | ❌ Urgent |

**Click "View details" for each status to see example URLs**

### 4.2 Desktop Performance

| Status | URL Count | Action |
|--------|-----------|--------|
| Good | | ✅ |
| Needs Improvement | | ⚠️ |
| Poor | | ❌ |

### 4.3 Issue Breakdown

| Issue Type | Affected URLs | Metric | Fix |
|------------|---------------|--------|-----|
| LCP (Largest Contentful Paint) | | >2.5s | Optimize images, server response |
| INP (Interaction to Next Paint) | | >200ms | Reduce JS, optimize event handlers |
| CLS (Cumulative Layout Shift) | | >0.1 | Add size attributes, reserve space |

---

## 5. ENHANCEMENTS (Rich Results)

**URL**: https://search.google.com/search-console/enhancements

### 5.1 Structured Data Status

| Enhancement Type | Valid | Invalid | Warnings |
|------------------|-------|---------|----------|
| Breadcrumb | | | |
| FAQ | | | |
| Product | | | |
| Organization | | | |
| WebSite | | | |
| Article/BlogPosting | | | |

**Invalid Items** (click to see details):

| Type | URL | Issue | Fix |
|------|-----|-------|-----|
| | | | |

---

## 6. MOBILE USABILITY

**URL**: https://search.google.com/search-console/mobile-usability

### 6.1 Mobile-Friendly Status

| Status | URL Count | Action |
|--------|-----------|--------|
| Mobile-friendly | | ✅ |
| Not mobile-friendly | | ❌ Fix |

### 6.2 Issues (if any)

| Issue | Affected URLs | Fix |
|-------|---------------|-----|
| Text too small to read | | Increase font size |
| Clickable elements too close | | Add spacing |
| Content wider than screen | | Fix viewport |
| Viewport not set | | Add meta viewport |

---

## 7. LINKS

**URL**: https://search.google.com/search-console/links

### 7.1 Top Linked Pages

| Page | External Links | Internal Links |
|------|----------------|----------------|
| | | |
| | | |
| | | |

### 7.2 Top Linking Sites

| Site | Links | Action |
|------|-------|--------|
| | | |
| | | |

**Toxic Backlinks** (spammy, irrelevant):
- [ ] None detected
- [ ] Review and consider disavow file

---

## 8. SECURITY & MANUAL ACTIONS

**URL**: https://search.google.com/search-console/security

### 8.1 Manual Actions

- [ ] ✅ No issues detected
- [ ] ❌ Manual action detected → Review and submit reconsideration request

### 8.2 Security Issues

- [ ] ✅ No issues detected
- [ ] ❌ Hacked content, malware, unwanted software → Clean and request review

---

## 📋 ACTION ITEMS SUMMARY

### Critical (Fix Within 48 Hours)

| Priority | Issue | Page/Section | Action | Owner |
|----------|-------|--------------|--------|-------|
| P0 | | | | |
| P0 | | | | |

### High (Fix Within 1 Week)

| Priority | Issue | Page/Section | Action | Owner |
|----------|-------|--------------|--------|-------|
| P1 | | | | |
| P1 | | | | |

### Medium (Fix Within 2-4 Weeks)

| Priority | Issue | Page/Section | Action | Owner |
|----------|-------|--------------|--------|-------|
| P2 | | | | |
| P2 | | | | |

### Low (Monitor/Optimize)

| Priority | Issue | Page/Section | Action | Owner |
|----------|-------|--------------|--------|-------|
| P3 | | | | |
| P3 | | | | |

---

## 📅 MONITORING SCHEDULE

| Task | Frequency | Owner |
|------|-----------|-------|
| Check Page Indexing | Weekly | |
| Review Performance | Weekly | |
| Core Web Vitals | Bi-weekly | |
| Sitemap Status | Monthly | |
| Full Audit | Monthly | |

---

## 🔗 Quick Links

| Report | URL |
|--------|-----|
| GSC Home | https://search.google.com/search-console |
| Page Indexing | https://search.google.com/search-console/page-indexing |
| Sitemaps | https://search.google.com/search-console/sitemaps |
| Performance | https://search.google.com/search-console/performance |
| Core Web Vitals | https://search.google.com/search-console/core-web-vitals |
| Enhancements | https://search.google.com/search-console/enhancements |
| Mobile Usability | https://search.google.com/search-console/mobile-usability |
| Links | https://search.google.com/search-console/links |
| URL Inspection | https://search.google.com/search-console/inspect |

---

**Audit Completed By**: ________________  
**Date**: ________________  
**Next Audit Due**: ________________
