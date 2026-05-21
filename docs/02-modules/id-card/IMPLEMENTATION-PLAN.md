# Digital ID Card Module - Implementation Plan

## Phase 1: Foundation & Schema (Completed)
- [x] Prisma schema with `IdCard` model
- [x] Unique constraints: `@@unique([organizationId, studentId, academicYear])` and `@@unique([organizationId, teacherId, academicYear])`
- [x] `cardNumber` unique constraint
- [x] Version tracking with `version` field
- [x] Revocation fields: `revokedAt`, `revokedBy`, `revokedReason`
- [x] Constants extraction: `ID_CARD_MOTTO` in `constants/index.ts`

## Phase 2: Core Generation Logic (Completed)
- [x] Single card generation: `lib/data/id-card/generate-id-card.tsx`
- [x] Bulk card generation: `lib/data/id-card/generate-bulk-id-cards.ts`
- [x] Batch processing with `Promise.allSettled` (batch size: 5)
- [x] Deduplication using `Map` before processing
- [x] Reissue logic: increment version instead of creating duplicate
- [x] QR code generation: `lib/data/id-card/qr-code-generator.ts`
- [x] PDF generation: `lib/data/id-card/id-card-pdf.tsx`
- [x] UploadThing integration (disabled, preserved for future)

## Phase 3: UI Components (Completed)
- [x] Main dashboard: `app/dashboard/id-cards/page.tsx` (server) + `IdCardsClient.tsx` (client)
- [x] HTML preview component: `components/dashboard/id-card/IdCardPreview.tsx`
- [x] Card/List toggle with default card view
- [x] Role-based color coding
- [x] Profile photo validation with skip/cancel dialog
- [x] Preview dialog with sample card preview
- [x] Card details dialog with actions
- [x] Generated tab with search, filter, sort, year filter, refresh
- [x] Loading states for all async operations
- [x] Large batch warning (100+ cards)
- [x] Responsive grid layouts (2-6 columns)

## Phase 4: PDF Generation & Download (Completed)
- [x] PDF template matching HTML preview exactly (360x228px)
- [x] Organization logo with shield fallback
- [x] Profile image with `objectFit: 'cover'` (passport-size 80x96)
- [x] Role-colored QR codes
- [x] Wave footer SVG matching HTML preview
- [x] On-demand PDF download: `lib/data/id-card/download-id-card-pdf.tsx`
- [x] Base64 download without storage dependency
- [x] Download button in generated tab and card details dialog

## Phase 5: Verification System (Completed)
- [x] Public verification page: `app/verify/id-card/[cardNumber]/page.tsx`
- [x] Status display: valid, revoked, expired
- [x] Card details: person info, institution, academic year, version
- [x] SEO protection: `robots: { index: false, follow: false }`
- [x] Verification timestamp display
- [x] QR code URL: `${NEXT_PUBLIC_APP_URL}/verify/id-card/${cardNumber}`

## Phase 6: Security & Access Control (Completed)
- [x] Admin-only bulk generation check
- [x] Admin-only revocation check
- [x] Admin-only reissue check
- [x] Organization scoping in all queries
- [x] Student/Parent self-service generation
- [x] Server Actions with auth checks (no API routes)

## Phase 7: Bug Fixes & Polish (Completed)
- [x] Null relation safety: `student.grade?.grade ?? '?'`
- [x] Year filtering in `getAllIdCards`
- [x] Sort by `createdAt` instead of `id` string comparison
- [x] Added `createdAt` to `GeneratedCard` interface
- [x] Removed dead `/api/verify/id-card` route
- [x] Fixed Radix infinite loop (replaced `<label>` with `<div>` + `onClick`)
- [x] Profile image propagation through all components
- [x] PDF layout matching HTML preview exactly

## File Structure
```
app/
  dashboard/
    id-cards/
      page.tsx              # Server route (fetch students, teachers, org)
      IdCardsClient.tsx     # Main UI (tabs, forms, dialogs, cards)
  verify/
    id-card/[cardNumber]/
      page.tsx              # Public verification page

lib/
  data/id-card/
    generate-id-card.tsx    # Single card generation
    generate-bulk-id-cards.ts # Bulk generation with batching
    get-id-card.ts          # Fetch cards with safe relations
    revoke-id-card.ts       # Revoke and reissue functions
    download-id-card-pdf.tsx # On-demand PDF download
    id-card-pdf.tsx         # PDF template (react-pdf)
    qr-code-generator.ts    # QR code generation

components/
  dashboard/id-card/
    IdCardPreview.tsx       # HTML preview component

constants/
  index.ts                  # ID_CARD_MOTTO configuration
```

## Key Decisions
1. **Server Actions over API Routes**: All mutations use `'use server'` for better security and simplicity
2. **On-Demand PDF**: PDFs generated when downloaded instead of stored, reducing storage costs
3. **Static Constants**: `ID_CARD_MOTTO` in `constants/index.ts` for single-source updates
4. **Deduplication**: `Map`-based dedup before bulk processing prevents duplicate work
5. **Version Tracking**: Increment version on reissue instead of creating new records
6. **No Emojis in PDF**: `@react-pdf/renderer` doesn't support emojis; use SVG icons instead
7. **Helvetica Font**: Default PDF font; no custom fonts needed for ID card text

## Testing Checklist
- [ ] Generate single student card
- [ ] Generate single teacher card
- [ ] Bulk generate 10+ student cards
- [ ] Bulk generate 100+ cards (verify warning)
- [ ] Reissue card for same student/year
- [ ] Revoke card and verify status
- [ ] Scan QR code to verification page
- [ ] Download PDF and verify layout
- [ ] Search/filter/sort in generated tab
- [ ] Card/list toggle functionality
- [ ] Profile photo validation dialog
- [ ] Missing photo skip/cancel flow
- [ ] Year filter in generated tab
- [ ] Responsive design on mobile
