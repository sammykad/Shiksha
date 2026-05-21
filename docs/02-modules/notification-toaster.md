# Notification Toaster - Clean Implementation

Real-time toast notifications showing exact delivery analytics when admin/teacher sends notifications.

---

## Architecture

The notification engine returns `NotifyResult` with analytics, but it gets lost in server actions. Here's how to preserve it:

```
Server Action
  ↓ calls notify.*()
Notification Engine
  ↓ returns NotifyResult { totalSent, totalFailed, totalCost, results }
Server Action
  ↓ MUST return this to client!
Client Component
  ↓ calls showNotificationToastsFromResult()
BroadcastChannel
  ↓
NotificationToaster Component
  ↓ Shows toasts with analytics
```

---

## Files

- `components/notification-toaster.tsx` - Listener components (keep these in layout)
- `app/layout.tsx` - Has `<NotificationToaster />` and `<NotificationSummaryToaster />`

---

## How To Implement

### Step 1: Server Action - Return Notification Result

```tsx
"use server";

import { notify } from "@/lib/notifications/notify";

export async function markAttendance(data: AttendanceData) {
  // ... your logic ...

  // Send notifications and GET THE RESULT
  const notificationResult = await notify.attendance.absent({
    attendanceId: record.id,
    recipients: [{ studentId: record.studentId }],
    variables: { /* ... */ },
  });

  // RETURN IT TO CLIENT!
  return { 
    success: true, 
    attendanceData: savedData,
    notification: notificationResult,  // ← Important!
  };
}
```

### Step 2: Client Component - Trigger Toasts

```tsx
"use client";

import { showNotificationToastsFromResult } from "@/components/notification-toaster";

export function AttendanceForm() {
  const handleSubmit = async () => {
    const result = await markAttendance(formData);
    
    // Trigger toasts with the returned analytics
    if (result.notification) {
      showNotificationToastsFromResult("STUDENT_ABSENT", result.notification);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Helper Function

Add this to `components/notification-toaster.tsx`:

```tsx
export function showNotificationToastsFromResult(
  templateId: string,
  result: {
    totalSent: number;
    totalFailed: number;
    totalCost: number;
    results: {
      recipient: { email?: string; phone?: string };
      channels: { channel: string; success: boolean; error?: string }[];
    }[];
  }
) {
  // Individual toasts
  result.results.forEach((r) => {
    const label = r.recipient.email || r.recipient.phone || "unknown";
    r.channels.forEach((c) => {
      triggerNotificationToaster({
        templateId,
        recipientLabel: label,
        channel: c.channel as NotificationChannel,
        status: c.success ? "SENT" : "FAILED",
        error: c.error,
        timestamp: new Date(),
      });
    });
  });

  // Summary toast
  triggerNotificationSummary({
    templateId,
    totalSent: result.totalSent,
    totalFailed: result.totalFailed,
    totalCost: result.totalCost,
    timestamp: new Date(),
  });
}
```

---

## Toast Display

### Individual
```
📧 Student Absent
Sent via Email to parent@example.com
```

```
❌ Student Absent Failed
Invalid WhatsApp number
```

### Summary
```
🎉 Student Absent Sent!
2 notifications • ₹0.50 • 100% success
```

```
⚠️ Student Absent Partially Sent
0/2 sent • 2 failed • ₹0.00
```

---

## Key Points

1. **Engine returns result** - `notify.*()` always returns `NotifyResult`
2. **Server action must return it** - Don't discard the result!
3. **Client triggers toasts** - Call helper after server action completes
4. **BroadcastChannel** - Only works client-side, not in server actions

---

## Current Status

✅ Components created: `NotificationToaster`, `NotificationSummaryToaster`
✅ Added to layout
❌ Need to update server actions to return notification results
❌ Need to add client-side toast triggers
