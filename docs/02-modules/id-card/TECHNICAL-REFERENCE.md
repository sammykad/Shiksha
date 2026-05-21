# Digital ID Card Module - Technical Reference

## API Reference

### Server Actions

#### `generateIdCard(params)`
- **File**: `lib/data/id-card/generate-id-card.tsx`
- **Params**: `{ studentId?: string, teacherId?: string, academicYear: string }`
- **Returns**: `{ success: boolean, card?: IdCard, reissued?: boolean, error?: string }`
- **Auth**: STUDENT (self), PARENT (child), ADMIN (any)

#### `generateBulkIdCards(params)`
- **File**: `lib/data/id-card/generate-bulk-id-cards.ts`
- **Params**: `{ studentIds: string[], teacherIds: string[], academicYear: string }`
- **Returns**: `{ success: boolean, succeeded?: number, failed?: number, reissued?: number, error?: string }`
- **Auth**: ADMIN only
- **Batch Size**: 5 concurrent with `Promise.allSettled`

#### `getAllIdCards(academicYear?)`
- **File**: `lib/data/id-card/get-id-card.ts`
- **Params**: `academicYear?: string` (optional, filters by year)
- **Returns**: `{ success: boolean, cards: GeneratedCard[], error?: string }`

#### `getExistingCardStatus(params)`
- **File**: `lib/data/id-card/get-id-card.ts`
- **Params**: `{ studentIds?: string[], teacherIds?: string[], academicYear: string }`
- **Returns**: `{ success: boolean, map: Map<string, { version: number, revoked: boolean }> }`

#### `revokeIdCard(cardId, reason?)`
- **File**: `lib/data/id-card/revoke-id-card.ts`
- **Params**: `cardId: string, reason?: string`
- **Returns**: `{ success: boolean, error?: string }`
- **Auth**: ADMIN only

#### `reissueIdCard(cardId)`
- **File**: `lib/data/id-card/revoke-id-card.ts`
- **Params**: `cardId: string`
- **Returns**: `{ success: boolean, error?: string }`
- **Auth**: ADMIN only
- **Behavior**: Revokes old card, generates new version

#### `downloadIdCardPdf(cardId)`
- **File**: `lib/data/id-card/download-id-card-pdf.tsx`
- **Params**: `cardId: string`
- **Returns**: `{ success: boolean, base64?: string, filename?: string, error?: string }`

## Component Props

### `IdCardPreview`
```tsx
interface IdCardPreviewProps {
  person: { firstName: string; lastName: string; profileImage?: string; details: Record<string, string | undefined> };
  organization?: { name: string; logo?: string; address?: string; phone?: string; website?: string };
  cardNumber: string;
  academicYear: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PARENT';
  motto?: string;
}
```

### `IdCardPDF` (react-pdf)
```tsx
interface IdCardPDFProps {
  person: { firstName: string; lastName: string; profileImage?: string; details: Record<string, string | undefined> };
  organization: { name: string; logo?: string; address?: string; phone?: string; website?: string };
  cardNumber: string;
  academicYear: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PARENT';
  motto?: string;
  qrCodeDataUrl?: string;
}
```

## Constants

### `ID_CARD_MOTTO`
```ts
export const ID_CARD_MOTTO = {
  STUDENT: 'KNOWLEDGE IS POWER',
  TEACHER: 'INSPIRE • GUIDE • EMPOWER',
  ADMIN: 'LEADERSHIP IN EDUCATION',
  PARENT: 'PARTNERS IN LEARNING',
};
```

### Role Colors
| Role | Primary | Light | Dark |
|------|---------|-------|------|
| STUDENT | `#059669` | `#d1fae5` | `#064e3b` |
| TEACHER | `#2563eb` | `#dbeafe` | `#1e3a5f` |
| ADMIN | `#7c3aed` | `#ede9fe` | `#4c1d95` |
| PARENT | `#d97706` | `#fef3c7` | `#78350f` |

## Card Dimensions
- **Width**: 360px
- **Height**: 228px
- **Header**: 72px (padding: 20px horizontal, 20px top, 12px bottom)
- **Divider**: 1px (dashed, role-colored)
- **Body**: 115px (padding: 20px, gap: 16px)
- **Footer**: 40px (wave SVG + motto text)
- **Photo**: 80x96px (passport-size, 5:6 ratio)
- **QR Code**: 80x80px (70x70 image with 5px padding)

## Database Schema
```prisma
model IdCard {
  id            String    @id @default(cuid())
  cardNumber    String    @unique
  academicYear  String
  version       Int       @default(1)
  qrCodeUrl     String?
  cardPdfUrl    String?
  cardImageUrl  String?
  revokedAt     DateTime?
  revokedBy     String?
  revokedReason String?
  issuedAt      DateTime  @default(now())
  expiresAt     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  studentId     String?
  teacherId     String?
  organizationId String
  generatedBy   String

  @@unique([organizationId, studentId, academicYear])
  @@unique([organizationId, teacherId, academicYear])
}
```

## Environment Variables
- `NEXT_PUBLIC_APP_URL`: Base URL for QR code verification links (e.g., `http://localhost:3000` or `https://yourdomain.com`)

## Future TODOs
- [ ] Re-enable UploadThing upload in `generate-id-card.tsx` (lines 108-115)
- [ ] Add `expiresAt` logic during card generation
- [ ] Expose `reissueIdCard` in UI (currently server-only)
- [ ] Bulk revocation support
- [ ] Custom card templates per institution
- [ ] Batch PDF download for printing
- [ ] NFC/RFID integration for physical cards
