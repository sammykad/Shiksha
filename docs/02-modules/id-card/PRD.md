# Digital ID Card Module - Product Requirements Document

## Overview
A comprehensive Digital ID Card generation and management system for educational institutions built on the Shiksha Cloud platform. Enables administrators to generate, manage, and verify digital ID cards for students and staff with QR code verification, PDF export, and real-time status tracking.

## Target Users
- **Administrators**: Generate, manage, revoke, and verify ID cards
- **Teachers**: View and download their own ID cards
- **Students**: View and download their own ID cards
- **Parents**: View and download their children's ID cards
- **External Verifiers**: Scan QR codes to verify card authenticity

## Core Features

### 1. Card Generation
- **Bulk Generation**: Select multiple students/teachers and generate cards in parallel batches
- **Individual Generation**: Generate single cards from the dashboard
- **Reissue Support**: Automatically increments version when regenerating for same person/year
- **Deduplication**: One card per person per academic year enforced via database constraints
- **Profile Photo Validation**: Warns when selected people lack profile photos, allows skip or cancel

### 2. Card Design
- **Role-Based Colors**: Student (emerald), Teacher (blue), Admin (violet), Parent (amber)
- **Organization Branding**: Logo display with shield icon fallback
- **QR Code Verification**: High-error-correction QR codes linking to public verification page
- **Passport-Size Photo**: 80x96px image with cover cropping, initials fallback
- **Wave Footer**: SVG wave pattern with configurable motto text
- **Consistent Layout**: 360x228px card dimensions matching HTML preview and PDF exactly

### 3. PDF Export
- **On-Demand Generation**: PDFs generated dynamically when download is requested
- **Pixel-Perfect Match**: PDF layout matches HTML preview exactly
- **No Storage Required**: Base64 download without UploadThing dependency (upload code preserved for future)
- **Role-Colored QR**: QR codes use role-specific colors in PDF

### 4. Card Management
- **Generated Tab**: View all generated cards with search, filter, sort, and year selection
- **Card/List Toggle**: Switch between card grid view and list view
- **Status Tracking**: Active, revoked, and version indicators
- **Revocation**: Admin-only card revocation with reason tracking
- **Reissue**: Auto-revoke old card and generate new version

### 5. Verification System
- **Public Verification Page**: `/verify/id-card/[cardNumber]` accessible without authentication
- **Status Display**: Valid, revoked, or expired status with visual indicators
- **Card Details**: Person name, role, class/section, card number, academic year, institution
- **SEO Protection**: `robots: { index: false, follow: false }` prevents search indexing
- **Timestamp**: Shows verification date and time

### 6. UI/UX
- **Responsive Design**: Mobile to desktop breakpoints (2-6 column grids)
- **Loading States**: Spinners for generation, download, revocation, and data fetch
- **Error Handling**: Toast notifications for success, errors, and warnings
- **Empty States**: Helpful messages when no data is found
- **Large Batch Warning**: Info banner when selecting 100+ cards

## Technical Requirements

### Architecture
- **Next.js 15**: App Router with Server Components and Server Actions
- **Prisma ORM**: PostgreSQL database with unique constraints
- **React-PDF**: `@react-pdf/renderer` for PDF generation
- **QR Code**: `qrcode` library for QR generation (server and client)
- **UploadThing**: Storage layer (disabled but preserved for future)

### Database Schema
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

### Security
- **Admin-Only Actions**: Bulk generation and revocation restricted to ADMIN role
- **Organization Scoping**: All queries filtered by `organizationId`
- **Student/Parent Access**: Can only generate cards for themselves/their children
- **No API Routes**: All mutations use Server Actions with auth checks

### Constants
- `ID_CARD_MOTTO`: Static motto text per role, stored in `constants/index.ts`
- `ROLE_COLORS`: Consistent color mapping across PDF and HTML components

## Non-Functional Requirements
- **Performance**: Batch processing with `Promise.allSettled` for resilience
- **Scalability**: Supports 100+ card generation with progress warnings
- **Reliability**: Deduplication and version tracking prevent duplicate cards
- **Maintainability**: Modular code with clear separation of concerns

## Future Enhancements
- **UploadThing Integration**: Re-enable PDF storage for persistent downloads
- **Card Expiry**: Set and enforce `expiresAt` dates
- **Reissue UI**: Expose `reissueIdCard` function in the dashboard
- **Bulk Revocation**: Revoke multiple cards at once
- **Card Templates**: Customizable card designs per institution
- **Print Optimization**: Batch PDF download for printing
- **NFC/RFID Integration**: Physical card encoding support
