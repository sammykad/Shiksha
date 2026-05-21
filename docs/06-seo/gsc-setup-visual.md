# GSC Service Account Setup - Visual Guide

**Status**: IAM permissions done ✅ | GSC property access pending ⏳

---

## ⚠️ Important: Two Different Places

You've completed **Step A** (Google Cloud IAM), but you still need **Step B** (GSC Property Access).

### Step A: Google Cloud IAM ✅ (Done)
- **Where**: console.cloud.google.com
- **What**: Grants permissions to use GSC API
- **Status**: ✅ Complete (sameerkad2001@gmail.com has Owner access)

### Step B: Google Search Console Property Access ⏳ (Required)
- **Where**: search.google.com/search-console
- **What**: Grants access to shiksha.cloud GSC data
- **Status**: ⏳ **Pending** - This is what's missing!

---

## 🎯 Step-by-Step: Add Service Account to GSC

### Step 1: Open Google Search Console

**URL**: https://search.google.com/search-console

### Step 2: Select shiksha.cloud Property

You should see something like this:

```
┌─────────────────────────────────────────┐
│  Search Console                         │
├─────────────────────────────────────────┤
│  📂 Property Selector                   │
│     └─ sc-domain:shiksha.cloud ▼       │
│        or                               │
│        └─ https://shiksha.cloud/        │
└─────────────────────────────────────────┘
```

### Step 3: Open Settings

```
┌─────────────────────────────────────────┐
│  🏠 Home    📊 Performance    ⚙️ Settings│
│                              ↑           │
│                              Click here  │
└─────────────────────────────────────────┘
```

### Step 4: Users and Permissions

```
┌─────────────────────────────────────────┐
│  Settings                               │
├─────────────────────────────────────────┤
│  ○ General                              │
│  ● Users and permissions                │
│  ○ Verification                         │
└─────────────────────────────────────────┘
```

### Step 5: Add User

Click the **ADD USER** button (usually top right)

```
┌─────────────────────────────────────────┐
│  Users and permissions                  │
├─────────────────────────────────────────┤
│                                         │
│  sameerkad2001@gmail.com    Owner      │
│                                         │
│  [+ ADD USER]  ← Click this             │
└─────────────────────────────────────────┘
```

### Step 6: Enter Service Account Email

```
┌─────────────────────────────────────────┐
│  Add user to property                   │
├─────────────────────────────────────────┤
│                                         │
│  Email:                                 │
│  ┌───────────────────────────────────┐  │
│  │ gsc-audit-bot@shiksha-cloud-gsc.  │  │
│  │ iam.gserviceaccount.com           │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Permission:                            │
│  ○ Viewer                               │
│  ● Owner     ← Select this              │
│                                         │
│         [CANCEL]  [ADD]                 │
└─────────────────────────────────────────┘
```

**Critical**: Select **Owner** permission (not Viewer!)

### Step 7: Wait for Propagation

- Wait **5-10 minutes**
- Google needs time to update permissions

### Step 8: Test the Script

```bash
npx tsx scripts/gsc-audit.ts
```

**Expected Output**:
```
🔍 GSC Audit for https://shiksha.cloud
==================================================

✅ Found GSC property: sc-domain:shiksha.cloud
   Permission level: siteOwner

📌 1. SITEMAP STATUS
   ✅ sitemap.xml
      Status: success
      ...
```

---

## 🔍 How to Verify It Worked

After adding the service account, you should see it in the users list:

```
┌─────────────────────────────────────────────────┐
│  Users and permissions                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  sameerkad2001@gmail.com            Owner       │
│  gsc-audit-bot@shiksha-cloud-gsc... Owner       │  ← Should appear here
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ❌ Common Mistakes

### Mistake 1: Added to wrong place
- ❌ Added to Google Cloud IAM only
- ✅ Need to add to **search.google.com/search-console**

### Mistake 2: Wrong permission level
- ❌ Selected "Viewer"
- ✅ Must select "**Owner**"

### Mistake 3: Wrong property
- ❌ Added to different GSC property
- ✅ Add to **shiksha.cloud** property specifically

### Mistake 4: Testing too soon
- ❌ Tested immediately after adding
- ✅ Wait **5-10 minutes** for propagation

---

## 🆘 Still Not Working?

### Check 1: Verify Service Account Email

Make sure you copied the exact email from `.gsc-credentials.json`:

```bash
# Extract the email
cat .gsc-credentials.json | grep client_email
```

Should show:
```
"client_email": "gsc-audit-bot@shiksha-cloud-gsc.iam.gserviceaccount.com"
```

### Check 2: Verify GSC Property Type

Your GSC property might be:
- **Domain property**: `sc-domain:shiksha.cloud`
- **URL prefix**: `https://shiksha.cloud/`

The script tries both, but make sure you're adding the service account to the correct one.

### Check 3: Wait Longer

Sometimes it takes up to 1 hour for permissions to fully propagate.

---

## 📞 Quick Checklist

Before running the script again, verify:

- [ ] Opened **search.google.com/search-console** (not console.cloud.google.com)
- [ ] Selected **shiksha.cloud** property
- [ ] Went to **Settings** → **Users and permissions**
- [ ] Clicked **ADD USER**
- [ ] Entered email: `gsc-audit-bot@shiksha-cloud-gsc.iam.gserviceaccount.com`
- [ ] Selected **Owner** permission
- [ ] Clicked **ADD**
- [ ] Waited 5-10 minutes

---

## ✅ Success Indicators

When everything is set up correctly:

1. **Script output** shows:
   - `✅ Found GSC property: ...`
   - `Permission level: siteOwner`

2. **GSC Users list** shows:
   - `gsc-audit-bot@shiksha-cloud-gsc.iam.gserviceaccount.com` as **Owner**

3. **Audit data** appears:
   - Sitemap status
   - Search performance metrics
   - Top queries and pages

---

**Next Action**: Complete Step B above, wait 5-10 minutes, then run:
```bash
npx tsx scripts/gsc-audit.ts
```
