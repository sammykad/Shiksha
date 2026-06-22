# Release Process — Shiksha Cloud

## Branch Structure

```
main      ── Production. Protected. Only tagged releases.
develop   ── Daily integration. Feature branches merge here.
feature/* ── One branch per feature. Branch off develop, PR into develop.
hotfix/*  ── Urgent production bug. Branch off main, PR into main + develop.
```

## Creating a Release

### 1. Freeze `develop`

```bash
git checkout develop
# Only bug fixes from here — no new features
```

### 2. Create Release Branch (optional, for coordination)

```bash
git checkout -b release/v1.1.0
# Final testing, version bumps, changelog
```

### 3. Tag and Merge

```bash
git checkout main
git merge develop
npm version minor    # or 'patch' for bugfix, 'major' for breaking
git push origin main --tags
```

This creates a tag like `v1.1.0` that permanently marks the release.

### 4. Deploy

Deploy `main` to production. The version badge will show `v1.1.0`.

### 5. Keep `develop` in Sync

```bash
git checkout develop
git merge main
git push origin develop
```

---

## Hotfix (Urgent Production Bug)

```bash
git checkout main
git checkout -b hotfix/payment-calculation
# fix the bug
git commit -m "fix: payment calculation off by paise"
npm version patch
git push origin main --tags
git checkout develop
git merge hotfix/payment-calculation
git push origin develop
```

Deploy `main`. Version goes from `v1.0.0` → `v1.0.1`.

---

## Rollback

### Code rollback

```bash
# Option A: Revert the last commit
git revert HEAD
git push origin main

# Option B: Deploy a previous tag
git checkout v1.0.0
# deploy this version
```

### Database rollback

Every Prisma migration MUST have a rollback migration:

```bash
npx prisma migrate dev --create-only   # creates migration files
# Edit the down.sql file with the reverse SQL
# Example: if up.sql adds a column, down.sql drops it
```

If you need to roll back:

```bash
npx prisma migrate resolve --rolled-back <migration-name>
# Then apply a new migration that reverses the schema
```

---

## Supabase Branching (Preview DBs)

Each PR on GitHub can auto-create an isolated Supabase database branch:

### Setup (one time)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref <your-project-id>

# Create a dev database branch linked to git develop
supabase branches create develop
```

### How it works

| Git Branch | Supabase DB Branch | Purpose |
|---|---|---|
| `main` | `main` (production) | Real user data |
| `develop` | `develop` (branch) | Testing with dev data |
| PR branch | Auto-created | Isolated test schema |

When you open a PR to `develop`, Supabase creates a fresh DB branch with the current schema. Prisma migrations run against it. Merging to `develop` syncs the `develop` DB. Merging to `main` syncs production DB.

### GitHub Action (automated)

```yaml
# .github/workflows/preview-db.yml
name: Preview DB
on: pull_request
jobs:
  db:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase link --project-ref ${{ vars.SUPABASE_PROJECT_REF }}
      - run: supabase db push
```

---

## Version Convention

Use [semver](https://semver.org):

| Change | Example | Command |
|---|---|---|
| Bug fix | `v1.0.0` → `v1.0.1` | `npm version patch` |
| New feature | `v1.0.0` → `v1.1.0` | `npm version minor` |
| Breaking change | `v1.0.0` → `v2.0.0` | `npm version major` |

The version badge at the bottom-left of the dashboard always shows the current deployed version.

---

## Release Checklist

Before tagging a release, confirm:

- [ ] `develop` builds without errors (`npm run build`)
- [ ] `develop` passes lint (`npm run lint`)
- [ ] All new features are behind checks or complete (no half-done states)
- [ ] Database migrations are applied and tested
- [ ] Rollback migration exists for every new migration
- [ ] `main` has not diverged from `develop` (merge `main` into `develop` first if needed)
- [ ] Version bumped with `npm version minor|patch`
- [ ] Tag pushed: `git push origin main --tags`
- [ ] Production deployed from `main`
- [ ] Smoke test: login, dashboard loads, core flows work
