You said:

Wed Feb 25 2026 00:00:00 GMT+0530 (IST)
You store attendance in UTC
But your app runs in IST
And you mark attendance at night

Here’s what’s happening 👇

🔥 The Core Issue

IST = UTC + 5:30

So:

IST:  25 Feb 2026 00:00
UTC:  24 Feb 2026 18:30

When you convert 2026-02-25 00:00 IST to UTC,
it becomes previous date in UTC.

That means:

If you mark attendance late night (say 12:30 AM IST),
in UTC it's still previous day.

So your database might store:

2026-02-24T18:30:00.000Z

But you think it’s Feb 25.

That’s why your date mismatches.



Yes, exactly. And toISTDate fixes this precisely because of this flow:
Teacher marks at:  Feb 25, 12:30 AM IST
                         ↓
toZonedTime()      sees it as Feb 25 in IST  ✅
                         ↓
setHours(0,0,0,0)  snaps to Feb 25 00:00 IST ✅
                         ↓
fromZonedTime()    stores: 2026-02-24T18:30:00.000Z
                         ↓
DB reads back as:  Feb 25 IST  ✅
The key insight — 18:30Z IS Feb 25 IST midnight. It looks like Feb 24 in UTC but that's correct and expected. Every record for Feb 25 will always be 2026-02-24T18:30:00.000Z regardless of when the teacher marked it — 8 AM, 3 PM, or 12:30 AM. That's why queries always match.