## The Goal

    ```

Clerk today → your own auth tomorrow
Zero schema change needed when you switch

````

---

## Auth - Agnostic User

    ```prisma
model User {
  id           String  @id @default(cuid())
  firstName    String
  lastName     String
  email        String  @unique
  password     String? // null when using external provider
  profileImage String?
  isActive     Boolean @default(true)

  // ── AUTH IDENTITIES (one per provider) ──────────────────
  // Clerk today. Your own auth tomorrow. Google/Apple later.
  // Just add a row — User model never changes
  identities UserIdentity[]

  // ── KEEP for backward compat — remove after full migration ──
  role    Role    @default(STUDENT)
  clerkId String? @unique // nullable now so you can migrate off

  // ── PRIMARY ORG (backward compat) ───────────────────────
  organization   Organization? @relation(fields: [organizationId], references: [id])
  organizationId String?

  // ── MEMBERSHIPS (source of truth going forward) ──────────
  memberships            OrganizationMembership[]
  institutionMemberships InstitutionMembership[]

  // ── EXISTING RELATIONS (untouched) ───────────────────────
  teacher       Teacher?
  student       Student?
  parent        Parent?
  feePayment    FeePayment[]
  notifications Notification[]
  leave         Leave[]
  leadActivity  LeadActivity[]
  assignedLeads Lead[]         @relation("LeadAssignedTo")
  createdLeads  Lead[]         @relation("LeadCreatedBy")
  deviceTokens  DeviceToken[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([id])
  @@index([email])
  @@index([organizationId])
}

// One row per auth provider per user
// Clerk   → provider: "clerk",  providerUserId: "user_xxx"
// Google  → provider: "google", providerUserId: "118xxx"
// Own JWT → provider: "local",  providerUserId: user.id
model UserIdentity {
  id             String   @id @default(cuid())
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  provider       String   // "clerk" | "google" | "apple" | "local"
  providerUserId String   // the ID on their side
  accessToken    String?  // optional — if you store tokens
  refreshToken   String?
  expiresAt      DateTime?
  meta           Json?    // anything provider-specific

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([provider, providerUserId]) // one identity per provider per user
  @@index([userId])
}
````

---

## Institution → Organization(Solid Long Term)

    ```prisma

model Institution {
id String @id @default(cuid())
name String
slug String @unique
logo String?

contactEmail String?
contactPhone String?
website String?
address String?
isActive Boolean @default(true)

// Billing lives at institution level for group owners
isPaid Boolean @default(false)
plan PlanType @default(STANDARD)
planStartedAt DateTime?
planExpiresAt DateTime?
walletBalance Int @default(0)

organizations Organization[]
memberships InstitutionMembership[]

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([slug])
}

model InstitutionMembership {
id String @id @default(cuid())
institution Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)
institutionId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
userId String
role InstitutionRole @default(ADMIN) // was String — now type safe

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@unique([institutionId, userId])
@@index([institutionId])
@@index([userId])
}

enum InstitutionRole {
OWNER // all branches, billing, transfer staff
ADMIN // manage branches, no billing
VIEWER // read-only cross-branch
}

model Organization {
id String @id @default(cuid())
name String
slug String @unique
logo String?

contactEmail String?
contactPhone String?
website String?

isActive Boolean @default(true)
isPaid Boolean @default(false)
plan PlanType @default(STANDARD)
planStartedAt DateTime?
planExpiresAt DateTime?
walletBalance Int @default(10000)
maxStudents Int?
organizationType OrganizationType?

// ── INSTITUTION LINK (nullable = standalone school) ──────
institution Institution? @relation(fields: [institutionId], references: [id])
institutionId String?
isHeadBranch Boolean @default(false)
branchCode String? // "PUN-01", "MUM-02"

// ── MEMBERSHIPS ──────────────────────────────────────────
memberships OrganizationMembership[]

// ── ALL EXISTING RELATIONS UNTOUCHED ─────────────────────
users User[]
notices Notice[]
Student Student[]
StudentDocument StudentDocument[]
Grade Grade[]
Section Section[]
Fee Fee[]
FeeCategory FeeCategory[]
FeePayment FeePayment[]
AcademicCalendar AcademicCalendar[]
AnonymousComplaint AnonymousComplaint[]
Teacher Teacher[]
Subject Subject[]
TeachingAssignment TeachingAssignment[]
AcademicYear AcademicYear[]
scheduledJob ScheduledJob[]
leaves Leave[]
examSessions ExamSession[]
exam Exam[]
hallTicket HallTicket[]
leads Lead[]
feeSenseAgent FeeSenseAgent?
notificationSettings NotificationSetting[]
notifications Notification[]
NotificationLog NotificationLog[]
certificates Certificate[]
reportCards ReportCard[]
gradingScales GradingScale[]
metaIntegration MetaIntegration?

establishedYear Int?
createdBy String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([id])
@@index([slug])
@@index([institutionId]) // cross-branch queries
}

model OrganizationMembership {
id String @id @default(cuid())
organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
organizationId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
userId String
role MembershipRole
status MembershipStatus @default(ACTIVE)

// Provider-agnostic invitation
invitedByEmail String?
invitationId String? @unique // Clerk today, your token tomorrow
acceptedAt DateTime?
revokedAt DateTime?

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@unique([userId, organizationId])
@@index([organizationId, role])
@@index([userId, status])
@@index([invitationId])
}

enum MembershipRole {
OWNER
ADMIN
TEACHER
ACCOUNTANT
RECEPTIONIST
PARENT
STUDENT
}

enum MembershipStatus {
INVITED
ACTIVE
INACTIVE
REVOKED
DECLINED
}

````

---

## How Switching Off Clerk Looks Later

    ```typescript
// TODAY — resolve user from Clerk
async function resolveUser(req: Request) {
  const { userId } = getAuth(req)  // clerk
  return prisma.userIdentity.findUnique({
    where: { provider_providerUserId: { provider: "clerk", providerUserId: userId } },
    include: { user: { include: { memberships: true } } }
  })
}

// TOMORROW — same function, just swap provider
async function resolveUser(req: Request) {
  const token = verifyJwt(req.headers.authorization) // your own auth
  return prisma.userIdentity.findUnique({
    where: { provider_providerUserId: { provider: "local", providerUserId: token.sub } },
    include: { user: { include: { memberships: true } } }
  })
}

// The rest of your codebase never changes
// user.memberships → always works
// user.institutionMemberships → always works
````

---

## Migration

    ```bash

npx prisma migrate dev --name auth_agnostic_identity_institution_solid

````

    ```
Creates  → UserIdentity table
Adds     → User.clerkId nullable (was required)
Adds     → Organization.institutionId, isHeadBranch, branchCode
Adds     → @@index([institutionId]) on Organization
Changes  → InstitutionMembership.role String → InstitutionRole enum
Zero     → existing data touched
````

---

## Backfill Clerk Identities(one - time)

    ```typescript

// Run once — moves clerkId into UserIdentity
const users = await prisma.user.findMany({ where: { clerkId: { not: null } } })

for (const user of users) {
await prisma.userIdentity.upsert({
where: {
provider_providerUserId: { provider: "clerk", providerUserId: user.clerkId! }
},
create: {
userId: user.id,
provider: "clerk",
providerUserId: user.clerkId!,
},
update: {}
})
}

```

After this runs — `clerkId` on User is redundant.Drop it whenever you're ready.




// ─── LEVEL 1 — OPTIONAL GROUPING ────────────────────────

model Institution {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  logo          String?
  isActive      Boolean  @default(true)

  // Billing at group level (they pay once for all branches)
  isPaid        Boolean   @default(false)
  plan          PlanType  @default(STANDARD)
  planStartedAt DateTime?
  planExpiresAt DateTime?
  walletBalance Int       @default(0)

  organizations Organization[]
  memberships   InstitutionMembership[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
}

model InstitutionMembership {
  id            String          @id @default(cuid())
  institution   Institution     @relation(fields: [institutionId], references: [id], onDelete: Cascade)
  institutionId String
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
  role          InstitutionRole @default(ADMIN)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([institutionId, userId])
  @@index([institutionId])
  @@index([userId])
}

enum InstitutionRole {
  OWNER   // sees all branches, transfers staff, manages billing
  ADMIN   // manages branches, no billing
  VIEWER  // read only across branches
}

// ─── LEVEL 2 — THE TENANT ───────────────────────────────

model Organization {
  id   String  @id @default(cuid())
  name String
  slug String  @unique
  logo String?

  contactEmail String?
  contactPhone String?
  website      String?

  isActive         Boolean           @default(true)
  isPaid           Boolean           @default(false)
  plan             PlanType          @default(STANDARD)
  planStartedAt    DateTime?
  planExpiresAt    DateTime?
  walletBalance    Int               @default(10000)
  maxStudents      Int?
  organizationType OrganizationType?

  // null = standalone tenant (all your existing customers)
  institution   Institution? @relation(fields: [institutionId], references: [id])
  institutionId String?
  isHeadBranch  Boolean      @default(false)
  branchCode    String?

  // compliance
  udiseCode     String?
  affiliationNo String?

  memberships OrganizationMembership[]

  // every existing relation untouched
  users                User[]
  notices              Notice[]
  Student              Student[]
  StudentDocument      StudentDocument[]
  Grade                Grade[]
  Section              Section[]
  Fee                  Fee[]
  FeeCategory          FeeCategory[]
  FeePayment           FeePayment[]
  AcademicCalendar     AcademicCalendar[]
  AnonymousComplaint   AnonymousComplaint[]
  Teacher              Teacher[]
  Subject              Subject[]
  TeachingAssignment   TeachingAssignment[]
  AcademicYear         AcademicYear[]
  scheduledJob         ScheduledJob[]
  leaves               Leave[]
  examSessions         ExamSession[]
  exam                 Exam[]
  hallTicket           HallTicket[]
  leads                Lead[]
  feeSenseAgent        FeeSenseAgent?
  notificationSettings NotificationSetting[]
  notifications        Notification[]
  NotificationLog      NotificationLog[]
  certificates         Certificate[]
  reportCards          ReportCard[]
  gradingScales        GradingScale[]
  metaIntegration      MetaIntegration?

  establishedYear Int?
  createdBy       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([id])
  @@index([slug])
  @@index([institutionId])
}

// ─── LEVEL 3 — WHO IS IN THIS TENANT ────────────────────

model OrganizationMembership {
  id             String           @id @default(cuid())
  organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  role           MembershipRole
  status         MembershipStatus @default(ACTIVE)

  invitedByEmail String?
  invitationId   String?   @unique
  acceptedAt     DateTime?
  revokedAt      DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, organizationId])
  @@index([organizationId, role])
  @@index([userId, status])
}

enum MembershipRole {
  OWNER        // standalone school owner
  PRINCIPAL    // runs the branch
  ADMIN        // office admin
  TEACHER
  ACCOUNTANT
  RECEPTIONIST
  PARENT
  STUDENT
}

enum MembershipStatus {
  INVITED
  ACTIVE
  INACTIVE
  REVOKED
  DECLINED
}

// ─── LEVEL 4 — THE PERSON ───────────────────────────────

model User {
  id           String  @id @default(cuid())
  firstName    String
  lastName     String
  email        String  @unique
  password     String?
  profileImage String?
  isActive     Boolean @default(true)
  role         Role    @default(STUDENT) // backward compat

  clerkId String? @unique // nullable — drop when you leave Clerk

  // backward compat — primary org
  organization   Organization? @relation(fields: [organizationId], references: [id])
  organizationId String?

  // source of truth going forward
  memberships            OrganizationMembership[]
  institutionMemberships InstitutionMembership[]

  // auth — swap Clerk for anything without touching schema
  identities UserIdentity[]

  // existing untouched
  teacher       Teacher?
  student       Student?
  parent        Parent?
  feePayment    FeePayment[]
  notifications Notification[]
  leave         Leave[]
  leadActivity  LeadActivity[]
  assignedLeads Lead[]         @relation("LeadAssignedTo")
  createdLeads  Lead[]         @relation("LeadCreatedBy")
  deviceTokens  DeviceToken[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([id])
  @@index([email])
  @@index([organizationId])
}

// swap Clerk for Google or own JWT — User never changes
model UserIdentity {
  id             String    @id @default(cuid())
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  provider       String    // "clerk" | "google" | "local"
  providerUserId String
  meta           Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([provider, providerUserId])
  @@index([userId])
}
```
