# Shiksha.cloud Auth Components PRD

## Summary

Shiksha.cloud is replacing Clerk UI components with Better Auth powered, shadcn-based components that keep the same simple mental model:

```tsx
<SignIn />
<SignUp />
<UserButton />
<UserProfile />
<CreateOrganization />
<OrganizationList />
<OrganizationSwitcher />
<OrganizationProfile />
```

We are not copying Clerk internals. We are recreating the useful Clerk flow with Shiksha branding, Better Auth APIs, Prisma-backed tenant data, and reusable shadcn primitives.

## Goals

- Make auth UI easy to use across the app with small component APIs.
- Keep organization flows consistent: list, switch, create, manage, invite, leave.
- Avoid duplicate UI logic for logos, avatars, shells, rows, footers, and modals.
- Build one component at a time, but from a shared architecture.
- Keep Better Auth logic behind clean components and hooks.
- Use shadcn UI primitives first, then small Shiksha auth primitives where shadcn does not provide the product-specific layer.

## Non-Goals

- Do not recreate every Clerk component.
- Do not add billing, waitlist, Google One Tap, or MFA UI in Phase 1.
- Do not keep Clerk branding or Clerk API dependencies.
- Do not create separate modal logic inside every component.

## Current Code Audit

Current files:

- `components/auth/sign-in.tsx`
- `components/auth/sign-up.tsx`
- `components/auth/organization-list.tsx`
- `components/auth/organization-switcher.tsx`
- `components/auth/create-organization.tsx`
- `components/auth/organization-profile.tsx`
- `components/auth/role-badge.tsx`

Current problems:

- Shared primitives are duplicated across files.
- `organization-switcher.tsx` already contains an internal `OrganizationProfileDialog`, while `organization-profile.tsx` also exists as a separate component.
- `OrganizationAvatar`, `ShikshaCloudLogo`, `ShikshaCloudWordmark`, card shell, footer, and Mosaic row styles should not be redefined in each component.
- Some auth components use raw inputs/buttons where existing shadcn components can be composed.
- Component names mostly mirror Clerk, but exports are inconsistent (`BetterAuthSignIn`, `BetterAuthSignUp` instead of clean `<SignIn />`, `<SignUp />` wrappers).

## Target Architecture

Auth components should be split into three layers.

### 1. Public Components

These are the components app code imports.

```tsx
import {
  SignIn,
  SignUp,
  UserAvatar,
  UserButton,
  UserProfile,
  CreateOrganization,
  OrganizationList,
  OrganizationSwitcher,
  OrganizationProfile,
} from "@/components/auth";
```

Public components should have Clerk-like APIs where useful, but Better Auth implementation inside.

### 2. Shared Auth UI Primitives

Create reusable internal primitives:

- `AuthCard`
- `AuthCardFooter`
- `AuthBrandLogo`
- `AuthBrandWordmark`
- `UserAvatar`
- `OrganizationAvatar`
- `OrganizationRow`
- `AuthModal`
- `AuthTabsShell`
- `RoleBadge`

Suggested location:

```txt
components/auth/_components/
```

These primitives may use shadcn internally.

### 3. Better Auth Data Hooks

Keep Better Auth calls in small hooks so UI stays clean.

Suggested hooks:

- `useCurrentUser()`
- `useOrganizations()`
- `useActiveOrganization()`
- `useSwitchOrganization()`
- `useCreateOrganization()`
- `useOrganizationMembers()`
- `useOrganizationInvitations()`
- `useOrganizationProfileActions()`

Suggested location:

```txt
components/auth/_hooks/
```

## Required Component Behavior

### SignIn

Public API:

```tsx
<SignIn callbackUrl="/dashboard" signUpUrl="/sign-up" />
```

Behavior:

- Email/password sign-in.
- Google OAuth.
- Toast on failure and success.
- Redirect to callback URL.
- Use shadcn `Form`, `Field`, `Button`, and `Input`.

### SignUp

Public API:

```tsx
<SignUp redirectUrl="/dashboard" signInUrl="/sign-in" />
```

Behavior:

- First name, last name, email, password.
- Password rules.
- OTP email verification.
- Resend cooldown.
- After verification, send user to `/select-organization?returnUrl=/dashboard`.
- Use shadcn `Form`, `Field`, `InputOTP` if available, `Button`, and `sonner`.

### OrganizationList

Public API:

```tsx
<OrganizationList afterSelectOrganizationUrl="/dashboard" />
```

Behavior:

- List personal account if enabled.
- List current user organizations.
- Show pending invitations and join/request states later.
- Create organization row opens `<CreateOrganization />`.
- Selecting organization calls Better Auth `organization.setActive`.
- After selecting, redirect to target URL.

### OrganizationSwitcher

Public API:

```tsx
<OrganizationSwitcher />
```

Behavior:

- Compact trigger for sidebar/navbar.
- Popover shows active org, organization list, create org, and manage action.
- Clicking `Manage` opens the shared `<OrganizationProfile />` modal.
- Must not contain its own duplicate profile dialog.

### OrganizationProfile

Public API:

```tsx
<OrganizationProfile open={open} onOpenChange={setOpen} />
```

Behavior:

- shadcn `Dialog` modal.
- Left sidebar tabs: General, Members.
- General tab:
  - organization profile
  - update profile action
  - verified domains placeholder
  - leave organization
  - delete organization
- Members tab:
  - members, invitations, requests sub-tabs
  - member search
  - invite button
  - members table
  - role select/update
  - member actions
- Shared with `OrganizationSwitcher` Manage flow.

### CreateOrganization

Public API:

```tsx
<CreateOrganization afterCreateOrganizationUrl="/dashboard" />
```

Behavior:

- Organization name, slug, optional logo.
- Create org through Better Auth.
- Better Auth hook/server hook creates required academic year.
- Optional invite step.
- On success, set active organization and redirect.

## Shiksha Branding Rules

- Use `/logo.svg` for Shiksha Cloud.
- Footer text should say `Secured by Shiksha.cloud`, not Clerk.
- Do not duplicate logo components across files.
- Organization avatars should be generated through one shared `OrganizationAvatar`.
- User avatars should be generated through one shared `UserAvatar`.

## shadcn Usage Rules

Use these primitives:

- `Dialog` for `OrganizationProfile` and modal flows.
- `Popover` for `OrganizationSwitcher`.
- `Tabs` for organization profile navigation.
- `Table` for members.
- `Avatar` for user and organization avatars.
- `Badge` for roles/counts.
- `Button` for actions.
- `Input`, `InputOTP`, `Select`, `Field`, `Form` for forms.
- `Separator` for dividers.
- `Skeleton` for loading.
- `sonner` for toasts.

Avoid:

- Custom portal logic.
- Inline duplicated SVG icons when lucide has the icon.
- Raw buttons/inputs for new code unless shadcn cannot express the required behavior.
- Separate copies of profile modal logic.

## Component API Compatibility

We should support familiar Clerk-style prop names where they make sense:

- `afterSignInUrl`
- `afterSignUpUrl`
- `afterCreateOrganizationUrl`
- `afterSelectOrganizationUrl`
- `hidePersonalAccount`
- `hideCreateOrganizationButton`
- `appearance` can be deferred.

Internally we can map these to Better Auth `callbackURL` and Next.js redirects.

## Data Contract

Minimum organization object:

```ts
type OrganizationLike = {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
  role?: string | null;
};
```

Minimum member object:

```ts
type OrganizationMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  joinedAt?: string;
  isCurrentUser?: boolean;
};
```

## Implementation Plan

### Phase 1: Foundation

- Create `components/auth/index.ts`.
- Create `components/auth/_components/brand.tsx`.
- Create `components/auth/_components/auth-card.tsx`.
- Create `components/auth/_components/user-avatar.tsx`.
- Create `components/auth/_components/organization-avatar.tsx`.
- Create `components/auth/_components/organization-row.tsx`.
- Create shared auth types in `components/auth/types.ts`.

### Phase 2: Organization Components

- Refactor `OrganizationList` to use shared primitives.
- Refactor `CreateOrganization` to use shared card/footer/logo/avatar.
- Refactor `OrganizationSwitcher` to use shared avatar/rows.
- Remove internal `OrganizationProfileDialog` from `OrganizationSwitcher`.
- Make `OrganizationSwitcher` open shared `<OrganizationProfile />` on Manage.
- Refactor `OrganizationProfile` to use shared avatar/brand and real Better Auth member data.

### Phase 3: User Components

- Build public `<UserAvatar />`.
- Build `<UserButton />` with dropdown actions.
- Build `<UserProfile />` modal for account settings/password/sign out.

### Phase 4: Auth Pages

- Rename or re-export `BetterAuthSignIn` as `SignIn`.
- Rename or re-export `BetterAuthSignUp` as `SignUp`.
- Normalize card shell and footer with shared auth primitives.
- Keep existing working OTP logic.

### Phase 5: Polish and Tests

- Add loading skeletons.
- Add empty states.
- Add destructive confirmation dialogs.
- Add responsive checks for mobile.
- Run targeted TypeScript checks.
- Run manual smoke tests for sign-up, sign-in, org select, org switch, org manage.

## First Component to Fix

Start with `OrganizationSwitcher`.

Reason:

- It is used in sidebar/navbar.
- It currently duplicates profile modal logic.
- The user flow is clear: click Manage → open shared `OrganizationProfile`.
- Once this is clean, `OrganizationList`, `CreateOrganization`, and `OrganizationProfile` can reuse the same primitives.

## Acceptance Criteria

- `OrganizationSwitcher` Manage opens the main-screen `OrganizationProfile` dialog.
- `OrganizationProfile` is reusable from any page, not tied to the switcher.
- Organization avatar and Shiksha branding come from shared primitives.
- No duplicate profile dialog remains inside `organization-switcher.tsx`.
- Public imports are clean and scalable.
- Existing pages keep working with Better Auth.

