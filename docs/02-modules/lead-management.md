# Lead Management System — Product Overview

> **Module Status:** Core features live in production · Meta Ads integration in development (coming soon)

---

## Core Purpose

The Lead Management system transforms how Indian schools handle admissions. Instead of relying on scattered WhatsApp messages, paper registers, and forgotten follow-up calls, it gives every institution a structured, visual pipeline — from the first inquiry to a fully enrolled student.

Every lead that enters the system gets scored, assigned, tracked, and followed up through a single interface. Nothing falls through the cracks. No inquiry goes cold without a deliberate decision.

---

## Who This Is For

| Role | Primary Use |
|---|---|
| **Admin** | Full pipeline visibility — total leads, conversion rate, source attribution, team performance |
| **Admission Officer** | Day-to-day lead management — adding leads, logging calls, scheduling demos, converting to students |
| **Principal / Management** | High-level reporting — which sources drive quality leads, where leads drop off, month-over-month trends |

---

## Core Workflow

```
Inquiry Arrives
      ↓
Lead Created (auto or manual)
      ↓
Score Assigned (0–100)
      ↓
Priority Set (High / Medium / Low)
      ↓
Activities Logged (calls, visits, demos, WhatsApp)
      ↓
Status Updated through Pipeline
      ↓
Qualified Lead → Converted to Student Record
```

---

## Lead Capture Channels

### Currently Live
| Channel | How It Works |
|---|---|
| **Walk-in** | Staff creates lead manually from reception |
| **Phone Call** | Admission officer logs inquiry during/after call |
| **Referral** | Existing parent or student referred a new family |
| **School Website** | Inquiry form submission → auto-creates lead |
| **WhatsApp** | Manually logged from incoming messages |
| **Social Media (Organic)** | Manually tagged from Instagram/Facebook DMs |
| **Other** | Catch-all for any unlisted source |

### Coming Soon — Meta Ads Integration
| Channel | Description |
|---|---|
| **Facebook Lead Ads** | Lead forms inside Facebook ads auto-sync to the pipeline — no manual entry |
| **Instagram Lead Ads** | Instagram ad inquiries captured directly, including the ad that drove the lead |
| **Ad Attribution** | Every auto-captured lead tagged with campaign, ad set, and ad name for ROI tracking |

> When a parent fills a Facebook or Instagram lead form, their name, phone, and email appear automatically in the pipeline — assigned, scored, and ready for follow-up. Zero data entry.

---

## Lead Pipeline Stages

| Stage | Meaning | Typical Next Action |
|---|---|---|
| `NEW` | Just captured, not yet reviewed | Review and assign |
| `CONTACTED` | First outreach made | Schedule follow-up |
| `INTERESTED` | Family showed positive intent | Schedule demo class or campus visit |
| `DEMO_SCHEDULED` | Demo class or visit confirmed | Conduct and log outcome |
| `NEGOTIATING` | Fee or seat discussions underway | Send fee structure, answer objections |
| `ENROLLED` | Converted — student record created | Trigger enrollment workflow |
| `NOT_INTERESTED` | Declined — reason logged | Archive |
| `LOST` | No response after multiple attempts | Archive with follow-up date |

Each stage change is timestamped and logged. Every status move is visible in the audit trail.

---

## Lead Scoring System

Every lead receives a score from **0 to 100** based on:

- **Engagement level** — how many activities have been logged
- **Response rate** — did they reply to calls, WhatsApp, email
- **Source quality** — referrals score higher than cold organic
- **Stage velocity** — how fast they move through stages
- **Demo attendance** — highest positive signal

Scores are recalculated on each activity update.

### Priority Tiers (derived from score)

| Priority | Score Range | Visual | Action |
|---|---|---|---|
| 🔴 High | 70–100 | Red badge | Follow up within 24 hours |
| 🟡 Medium | 40–69 | Amber badge | Follow up within 3 days |
| 🟢 Low | 0–39 | Green badge | Weekly nurture cadence |

---

## Activity Tracking

Every interaction with a lead is logged as a `LeadActivity`. This creates a complete conversation history — useful for handoffs between staff, reporting, and legal audit if needed.

### Activity Types

| Type | When Used |
|---|---|
| `CALL` | Phone conversation — outcome, duration, next step |
| `WHATSAPP` | WhatsApp message sent or received |
| `EMAIL` | Email sent — subject and body summary |
| `SCHOOL_VISIT` | In-person campus visit |
| `DEMO_CLASS` | Trial class attended |
| `PARENT_MEETING` | In-person meeting with parent(s) |
| `FOLLOW_UP` | Scheduled follow-up reminder |
| `NOTE` | Internal note — not a communication |
| `STATUS_CHANGE` | Auto-logged when stage is changed |

Each activity stores: type, outcome, notes, next follow-up date, and the staff member who logged it.

---

## Conversion: Lead → Student

When a lead is qualified and ready to enroll:

1. Admin clicks **"Convert to Student"** on the lead record
2. System pre-fills the student creation form with lead data (name, contact, grade interest)
3. Admin confirms grade, section, and roll number
4. Student record is created with full audit trail linking back to the original lead
5. Lead status auto-updates to `ENROLLED`
6. Lead source is preserved on the student record for long-term attribution

---

## Data Architecture

### `Lead`
```
id                  UUID (primary key)
organizationId      FK → Organization
name                string — full name of the inquiring student/family
phone               string — primary contact number
email               string? — optional
gradeInterest       string? — which grade/class they're inquiring for
source              enum — WALK_IN | PHONE | WEBSITE | REFERRAL | FACEBOOK | INSTAGRAM | WHATSAPP | OTHER
status              enum — pipeline stage (see above)
score               int (0–100)
priority            enum — HIGH | MEDIUM | LOW
assignedToId        FK → User (admission officer)
followUpDate        datetime? — next scheduled follow-up
convertedStudentId  FK → Student? — set on conversion
notes               string? — free-form initial notes
metaCampaignId      string? — Facebook/Instagram campaign (Meta integration)
metaAdSetId         string? — Ad set (Meta integration)
metaAdId            string? — Specific ad (Meta integration)
metaFormId          string? — Lead form ID (Meta integration)
createdAt           datetime
updatedAt           datetime
```

### `LeadActivity`
```
id          UUID
leadId      FK → Lead
type        enum — activity type (see above)
outcome     string? — result of the interaction
notes       string — what happened / what was discussed
followUpAt  datetime? — when to follow up next
createdById FK → User — who logged this
createdAt   datetime
```

---

## Reporting & Analytics

| Metric | Description |
|---|---|
| **Total Leads** | Count by time range, source, grade interest |
| **Conversion Rate** | % of leads that reached `ENROLLED` |
| **Source Attribution** | Which channels drive the most leads and highest conversions |
| **Stage Funnel** | How many leads at each pipeline stage — where they drop off |
| **Avg. Time to Convert** | Days from `NEW` to `ENROLLED` |
| **Staff Performance** | Leads assigned, contacted, and converted per admission officer |
| **Follow-up Compliance** | % of leads with overdue follow-up dates |
| **Meta Ad ROI** *(coming soon)* | Cost per lead and cost per enrollment by campaign |

---

## Meta Ads Integration — Architecture (Coming Soon)

```
Facebook / Instagram Ad
        ↓
Parent fills Lead Form (inside the ad)
        ↓
Meta Webhooks → Shiksha Cloud API
        ↓
Lead auto-created in pipeline
  - Name, phone, email from form
  - Source = FACEBOOK or INSTAGRAM
  - Campaign, ad set, ad name tagged
  - Assigned per org rules
        ↓
Admission officer gets notification
        ↓
Follow-up begins — zero manual entry
```

**What this enables:**
- Real-time lead capture — no checking ad dashboards manually
- Attribution all the way to enrollment
- Ad spend vs enrolled student ROI in one report
- No leads lost between the ad and the CRM

---

## Key Differentiators vs Generic CRMs

| | Generic CRM | Shiksha Cloud Lead Management |
|---|---|---|
| Built for schools | No | Yes — grade interest, section assignment, enrollment conversion built-in |
| Converts to student record | Manual export/import | One click — data flows directly |
| Indian ad platform integration | Partial | Facebook + Instagram Lead Ads (coming soon) |
| Admission officer workflow | Generic sales flow | Designed around school admission cycles |
| Cost | ₹5,000–20,000/month | Included in Shiksha Cloud — no extra charge |
| Setup | Weeks | Same day |

---

## Roadmap

| Feature | Status |
|---|---|
| Manual lead capture (all sources) | ✅ Live |
| Lead scoring (0–100) | ✅ Live |
| Activity logging (all types) | ✅ Live |
| Pipeline stage management | ✅ Live |
| Lead → Student conversion | ✅ Live |
| Assigned officer + follow-up dates | ✅ Live |
| Facebook Lead Ads integration | 🔄 In development |
| Instagram Lead Ads integration | 🔄 In development |
| Meta campaign attribution reporting | 🔄 In development |
| Automated follow-up reminders | 📋 Planned |
| WhatsApp template triggers on status change | 📋 Planned |
| Grade-wise admission capacity tracking | 📋 Planned |

---

> *Lead Management is included in every Shiksha Cloud account. No additional module fee. No per-lead pricing.*
