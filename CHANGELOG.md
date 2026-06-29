# Changelog

All notable changes to Shiksha.cloud are tracked here.

Format: [Keep a Changelog](https://keepachangelog.com/)
Versioning: [SemVer](https://semver.org/) — `npm version patch|minor`

---

## [Unreleased]

### Added
- WhatsApp recorded session sharing with IMAGE thumbnail header and Watch Now URL button

### Changed
- WhatsApp media header injection unified — `injectIntoHeader` handles both document and image
- `recorded_session_shared` Meta template: body params now match template definition (3 params), URL button with video ID
- `payment_success` WhatsApp template hard-fails on PDF upload error instead of silent fallback

### Removed
- `stripHeader` function from WhatsApp provider (unused)
- Extra `videoUrl` body parameter from `recorded_session_shared` template (mismatched Meta template)

## [0.2.0] — 2026-06-23

### Added
- Teacher payout settings page — bank account, IFSC, UPI, PAN management
- `TeacherBankAccount` model with upsert save (encrypted account number)
- Certificate titles persist as JSON `[{title, url}]` — no more "Certificate 1" placeholders
- `getFileNameFromUrl`, `handleCertUpload`, `handleIdProofUpload` utilities for file uploads
- Profile photo preview updates in real-time after Cloudinary upload

### Changed
- Profile photo, ID proof, and certificate uploads now go to Cloudinary (were using blob URLs)
- Account holder name in payout form defaults to uppercase, CSS `uppercase` display
- `contactEmail` field in teacher settings is now editable with clarifying description
- Employee code label: "Employee Code: 232" (was "#232")
- Account Created date falls back to `teacher.createdAt` when `joinedAt` is null
- Removed Account tab from teacher settings (user-profile popup already covers it)

### Removed
- `panNumber` from `TeacherProfile` model — single source of truth is `TeacherBankAccount.panNumber`
- `getTeacherPayoutAction` — bank data loaded server-side via `getTeacher` instead
- Unused imports: `Mail`, `Shield`, `PrismaBase`, `hasPassword`, `AccountSecurityClient`

### Fixed
- Profile photo avatar now uses `form.watch('profilePhoto')` — updates instantly after upload
- Certificate uploads use `uploadingCert` state (was crashing from undefined `activeUpload`)
- ID proof upload uses `uploadingIdProof` state (same fix)
- `handleCertUpload` / `handleIdProofUpload` were undefined functions — now properly defined
- Payout form pre-fills existing bank data on page load (was blank on refresh)

---

## [1.0.0] — 2026-06-01

### Added
- ID Card Module — Digital ID cards for students & teachers with QR code verification
- Certificate Generator — 13+ types (Bonafide, Leaving, Character, Migration) with English + मराठी + Hindi
- Public Verification Portal — Verify any certificate or ID card via QR scan
- Bulk ID generation for entire sections with one click
- Certificate revocation & reissue workflow

### Changed
- FeeSense AI Agent now sends personalized multi-channel reminders
- Attendance Analyzer detects absentee patterns and flags at-risk students
- Notification engine supports all 5 channels (WhatsApp, SMS, Email, Push, In-App)
- Fee receipts include QR code for instant digital verification

### Fixed
- Fee reconciliation display mismatch in admin dashboard
- Hall ticket PDF generation for non-CBSE grade formats
- Marathi font rendering in leaving certificates
- Parent multi-child switcher not loading all children

---

For prior releases, see the [Changelog Page](https://shiksha.cloud/changelog).
