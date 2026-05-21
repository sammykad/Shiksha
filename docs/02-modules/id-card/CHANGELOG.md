# Changelog - ID Card Module

## 2026-05-21 - Initial Release (v1.0.0)

### Added
- Digital ID card generation for students and teachers
- Bulk generation with parallel batch processing (batch size: 5)
- PDF generation using `@react-pdf/renderer` with pixel-perfect HTML match
- QR code verification linking to `/verify/id-card/[cardNumber]`
- Public verification page with status display (valid/revoked/expired)
- Card/List toggle in dashboard (default: card view)
- Generated tab with search, filter, sort, and year selection
- Profile photo validation with skip/cancel dialog
- Organization logo display with shield icon fallback
- Role-based color coding (Student: emerald, Teacher: blue, Admin: violet, Parent: amber)
- On-demand PDF download (base64, no storage required)
- Admin-only revocation with reason tracking
- Reissue support with version increment
- Large batch warning (100+ cards)
- Loading states for all async operations
- Responsive design (2-6 column grids)
- Constants extraction (`ID_CARD_MOTTO` in `constants/index.ts`)
- Null relation safety throughout
- Year filtering in card queries
- Sort by `createdAt` for accurate chronological order

### Security
- Admin-only checks for bulk generation, revocation, and reissue
- Organization scoping in all database queries
- Server Actions with auth checks (no API routes)
- SEO protection on verification page (`robots: { index: false, follow: false }`)

### Known Limitations
- UploadThing PDF upload disabled (code preserved for future)
- `expiresAt` field exists but not set during generation
- `reissueIdCard` function not exposed in UI
- No bulk revocation support

### Files Created
- `app/dashboard/id-cards/page.tsx`
- `app/dashboard/id-cards/IdCardsClient.tsx`
- `app/verify/id-card/[cardNumber]/page.tsx`
- `lib/data/id-card/generate-id-card.tsx`
- `lib/data/id-card/generate-bulk-id-cards.ts`
- `lib/data/id-card/get-id-card.ts`
- `lib/data/id-card/revoke-id-card.ts`
- `lib/data/id-card/download-id-card-pdf.tsx`
- `lib/data/id-card/id-card-pdf.tsx`
- `lib/data/id-card/qr-code-generator.ts`
- `components/dashboard/id-card/IdCardPreview.tsx`
- `docs/id-card-module/PRD.md`
- `docs/id-card-module/IMPLEMENTATION-PLAN.md`
- `docs/id-card-module/TECHNICAL-REFERENCE.md`
- `docs/id-card-module/CHANGELOG.md`
