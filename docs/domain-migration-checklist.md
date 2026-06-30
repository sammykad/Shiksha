# Domain Migration Checklist — shiksha.cloud → newdomain.com

> Generated 2026-07-01. Run a fresh `grep -r "shiksha.cloud" --include="*.{ts,tsx,js,jsx,json,csv}" app/ components/ lib/ constants/ emails/ tools/` before migrating to confirm no new references were added.

---

## Group 1: Root App (5 files, 14 refs)

| File | Ref count | Notes |
|---|---|---|
| `app/layout.tsx` | 9 | metadataBase, hreflang, canonical, schema JSON-LD, applicationName |
| `app/sitemap.ts` | 1 | hardcoded origin |
| `app/robots.ts` | 2 | sitemap + host directive |
| `app/support/page.tsx` | 1 | canonical URL |
| `app/verify/certificate/page.tsx` | 1 | hardcoded link |

## Group 2: Public Website (30+ files, ~90 refs)

| File | Ref count |
|---|---|
| `app/(website)/page.tsx` | 14 |
| `app/(website)/features/page.tsx` | 9 |
| `app/(website)/blogs/page.tsx` | 8 |
| `app/(website)/blogs/[slug]/page.tsx` | 4 |
| `app/(website)/founder/page.tsx` | 6 |
| `app/(website)/[location]/school-management-software/page.tsx` | 6 |
| `app/(website)/about/page.tsx` | 3 |
| `app/(website)/features/by-role/layout.tsx` | 3 |
| `app/(website)/contact/page.tsx` | 2 |
| `app/(website)/time-blog/page.tsx` | 2 |
| `app/(website)/features/ai-agents/page.tsx` | 1 |
| `app/(website)/features/ai-reports/page.tsx` | 2 |
| `app/(website)/features/anonymous-complaints/page.tsx` | 2 |
| `app/(website)/features/attendance/page.tsx` | 2 |
| `app/(website)/features/document-verification/page.tsx` | 2 |
| `app/(website)/features/exam-management/page.tsx` | 2 |
| `app/(website)/features/fee-management/page.tsx` | 2 |
| `app/(website)/features/holidays/page.tsx` | 2 |
| `app/(website)/features/integration/page.tsx` | 2 |
| `app/(website)/features/lead-management/page.tsx` | 2 |
| `app/(website)/features/notification-engine/page.tsx` | 2 |
| `app/(website)/features/parent-portal/page.tsx` | 2 |
| `app/(website)/features/student-management/page.tsx` | 2 |
| `app/(website)/industries/coaching-centers/page.tsx` | 1 |
| `app/(website)/industries/colleges-higher-education/page.tsx` | 1 |
| `app/(website)/industries/k-12-schools/page.tsx` | 1 |
| `app/(website)/industries/page.tsx` | 1 |
| `app/(website)/for-admins/page.tsx` | 1 |
| `app/(website)/for-parents/page.tsx` | 1 |
| `app/(website)/for-teachers/page.tsx` | 1 |
| `app/(website)/changelog/page.tsx` | 1 |
| `app/(website)/guide/page.tsx` | 1 |
| `app/(website)/pricing/page.tsx` | 1 |
| `app/(website)/privacy-policy/page.tsx` | 1 |
| `app/(website)/refund-policy/page.tsx` | 1 |
| `app/(website)/sitemap-page/page.tsx` | 1 |
| `app/(website)/terms-and-conditions/page.tsx` | 1 |
| `app/(website)/why-shiksha/layout.tsx` | 1 |
| `app/(website)/why-shiksha/page.tsx` | 1 |
| `app/(website)/why-us/page.tsx` | 1 |
| `app/(website)/founder/layout.tsx` | 1 |

## Group 3: Components (6 files, 8 refs)

| File | Ref count | Notes |
|---|---|---|
| `components/website/features/fee-management/FeeManagementLanding.tsx` | 3 | email + pay link |
| `components/website/shared/Footer.tsx` | 1 | APP_URL |
| `components/website/support/SupportPage.tsx` | 1 | support email |
| `components/auth/create-organization.tsx` | 1 | support email in prose |
| `components/dashboard/admin/settings/GeneralSettings.tsx` | 1 | subdomain template |
| `components/dashboard/admin/settings/OrganizationConfig.tsx` | 1 | subdomain template |

## Group 4: Lib / Constants (4 files, 11 refs)

| File | Ref count | Notes |
|---|---|---|
| `lib/notifications/current-meta.json` | 7 | Meta templates with URLs |
| `lib/pdf-generator/SubscriptionInvoicePDF.tsx` | 2 | support email |
| `lib/notifications/channels.ts` | 1 | no-reply email |
| `constants/index.ts` | 1 | support email |

## Group 5: Other App Files (4 files, 7 refs)

| File | Ref count | Notes |
|---|---|---|
| `app/actions.ts` | 2 | support email fallback |
| `app/dashboard/id-cards/preview/page.tsx` | 2 | QR code verify URLs |
| `tools/reports/generate-dummy-student-academic-report.tsx` | 2 | QR + org text |
| `emails/templates/DocumentApproved.tsx` | 1 | preview document URL |

## Group 6: Seed / Demo Data (optional — fake emails)

| File | Ref count | Notes |
|---|---|---|
| `prisma/seeds/demo-data.ts` | 6 | `@demo.shiksha.cloud` emails |
| `docs/onboarding-demo-data.json` | 7 | `@demo.shiksha.cloud` emails |
| `docs/09-references/student-import-template.csv` | 11 | `@shiksha.cloud` sample emails |

## Quick Migrate (10-min approach)

Open VS Code, search `shiksha.cloud` across:
```
app/ components/ lib/ constants/ emails/ tools/
```

Bulk replace `shiksha.cloud` → `newdomain.com`. Then manually fix:
- `app/layout.tsx` — `applicationName: 'shiksha.cloud'` → keep as brand or change
- `components/dashboard/admin/settings/GeneralSettings.tsx` — subdomain template
- `components/dashboard/admin/settings/OrganizationConfig.tsx` — subdomain template
- `lib/notifications/current-meta.json` — verify template URLs still make sense

## External Config (not in code)

- Clerk dashboard → add new domain to allowed origins
- PhonePe merchant dashboard → update callback URL
- Google Search Console → add new property
- Email sending service (Brevo/SendGrid) → update sender domains
