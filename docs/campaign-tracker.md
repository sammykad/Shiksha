# WhatsApp Campaign Tracker — June 2026

## Template Reference

| Name | Purpose | Button |
|---|---|---|
| `shiksha_90day_trial` | 90 days free trial | "Start Free Trial" |
| `shiksha_school_opening` | General marketing | "See It Live" |
| `shiksha_new_admission_crm` | New feature — Admission CRM | "See It Live" |

## Excel Columns

Copy these headers into Excel:

```
S.No | School Name | Contact Person | Phone | City | Bucket | Template Sent | Sent Date | Clicked (Y/N) | Called (Y/N) | Call Notes | Trial Started (Y/N) | LIVE (Y/N) | Follow-up Date
```

## Segmentation

| Bucket | Criteria | Template | Send Day | Count |
|---|---|---|---|---|
| A — Hot | Interested / negotiation | `shiksha_90day_trial` | Day 0 (Today) | 15–20 |
| B — Warm | Contacted, no response | `shiksha_90day_trial` | Day 1 | 30–40 |
| C — Cold | Never contacted | `shiksha_school_opening` | Day 2 | 30–40 |
| D — Invalid | Wrong number / not a school | — | Remove | 5–10 |

## 14-Day Send Calendar

| Day | Date | Template | Bucket | Calls Target |
|---|---|---|---|---|
| Day 0 | Jun 16 | `shiksha_90day_trial` | A | Call all non-clickers |
| Day 1 | Jun 17 | `shiksha_90day_trial` | B | Call clickers |
| Day 2 | Jun 18 | `shiksha_school_opening` | C | Call top 10 |
| Day 3 | Jun 19 | `shiksha_new_admission_crm` | B non-responders | Call all clickers |
| Day 4 | Jun 20 | — | — | Physical visits |
| Day 5-6 | Jun 21-22 | Respond only | — | — |
| Day 7 | Jun 23 | Review + follow-up | All | 15 calls |
| Day 8 | Jun 24 | `shiksha_new_admission_crm` | Remaining non-responders | 15 calls |
| Day 9 | Jun 25 | `shiksha_90day_trial` | Anyone who clicked | 15 calls |
| Day 10 | Jun 26 | `shiksha_school_opening` | All remaining | 20 calls |
| Day 11-14 | Jun 27-30 | Close calls | All trials | 25 calls/day |

## Tracking Table (Copy to Excel)

| S.No | School Name | Contact Person | Phone | City | Bucket | Template Sent | Sent Date | Clicked | Called | Call Notes | Trial Started | LIVE | Follow-up |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | | | | | |
