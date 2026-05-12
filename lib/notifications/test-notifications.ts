import prisma from "@/lib/db";
import { NotificationChannel } from "@/generated/prisma/enums";
import { ChannelFactory } from "./channels";

export interface TestNotificationResult {
    channel: NotificationChannel;
    success: boolean;
    message: string;
    messageId?: string;
    error?: string;
}

/**
 * Send a test push notification directly to a user's devices
 * Bypasses organization settings for testing purposes
 */
export async function sendTestPushNotification(
    userId: string,
    title: string = "🔔 Test Notification",
    body: string = "This is a test push notification from Nexus"
): Promise<TestNotificationResult> {
    try {
        // Get user's device tokens
        const deviceTokens = await prisma.deviceToken.findMany({
            where: { userId },
            orderBy: { lastUsedAt: "desc" },
        });

        if (deviceTokens.length === 0) {
            return {
                channel: "PUSH",
                success: false,
                message: "No device tokens found for user",
                error: "User has no registered devices",
            };
        }

        console.log(`[TEST] 🔔 Sending test push to ${deviceTokens.length} device(s)`);

        const provider = ChannelFactory.getProvider("PUSH");
        let successCount = 0;
        let lastError = "";

        // Send to all devices (deduplicated by token)
        const seenTokens = new Set<string>();
        for (const tokenRecord of deviceTokens) {
            if (seenTokens.has(tokenRecord.token)) continue;
            seenTokens.add(tokenRecord.token);

            const result = await provider.send(tokenRecord.token, title, body);

            if (result.success) {
                successCount++;
                console.log(`[TEST] ✅ Push sent to ${tokenRecord.platform} device`);
            } else {
                lastError = result.error || "Unknown error";
                console.log(`[TEST] ❌ Push failed: ${lastError}`);

                // Clean up invalid tokens
                if (
                    result.error?.includes("not-registered") ||
                    result.error?.includes("invalid-registration-token")
                ) {
                    await prisma.deviceToken.delete({ where: { id: tokenRecord.id } }).catch(() => { });
                }
            }
        }

        return {
            channel: "PUSH",
            success: successCount > 0,
            message: `Sent to ${successCount}/${seenTokens.size} device(s)`,
            messageId: `${successCount} devices`,
            error: successCount === 0 ? lastError : undefined,
        };
    } catch (error) {
        console.error("[TEST] Push notification error:", error);
        return {
            channel: "PUSH",
            success: false,
            message: "Push notification failed",
            error: (error as Error).message,
        };
    }
}

/**
 * Send a test email notification
 */
export async function sendTestEmailNotification(
    email: string,
    subject: string = "🔔 Test Email from Nexus",
    body: string = "This is a test email notification. If you received this, email notifications are working correctly!"
): Promise<TestNotificationResult> {
    try {
        console.log(`[TEST] 📧 Sending test email to ${email}`);

        const provider = ChannelFactory.getProvider("EMAIL");
        const result = await provider.send(email, subject, body);

        return {
            channel: "EMAIL",
            success: result.success,
            message: result.success ? `Email sent to ${email}` : "Email failed",
            messageId: result.messageId,
            error: result.error,
        };
    } catch (error) {
        console.error("[TEST] Email notification error:", error);
        return {
            channel: "EMAIL",
            success: false,
            message: "Email notification failed",
            error: (error as Error).message,
        };
    }
}

/**
 * Send a test SMS notification
 */
export async function sendTestSMSNotification(
    phone: string,
    message: string = "🔔 Test SMS from Nexus - If you received this, SMS notifications are working correctly!"
): Promise<TestNotificationResult> {
    try {
        // Normalize phone number (remove +91 if present)
        const normalizedPhone = phone.replace(/^\+?91/, "").replace(/\D/g, "");

        console.log(`[TEST] 📱 Sending test SMS to ${normalizedPhone}`);

        const provider = ChannelFactory.getProvider("SMS");
        const result = await provider.send(normalizedPhone, undefined, message);

        return {
            channel: "SMS",
            success: result.success,
            message: result.success ? `SMS sent to ${normalizedPhone}` : "SMS failed",
            messageId: result.messageId,
            error: result.error,
        };
    } catch (error) {
        console.error("[TEST] SMS notification error:", error);
        return {
            channel: "SMS",
            success: false,
            message: "SMS notification failed",
            error: (error as Error).message,
        };
    }
}

/**
 * Send a test WhatsApp notification
 */
export async function sendTestWhatsAppNotification(
    phone: string,
    message: string = "🔔 Test WhatsApp from Nexus - If you received this, WhatsApp notifications are working correctly!"
): Promise<TestNotificationResult> {
    try {
        // Normalize phone number (remove +91 if present)
        const normalizedPhone = phone.replace(/^\+?91/, "").replace(/\D/g, "");

        console.log(`[TEST] 💬 Sending test WhatsApp to ${normalizedPhone}`);

        const provider = ChannelFactory.getProvider("WHATSAPP");
        const result = await provider.send(normalizedPhone, undefined, {
            name: "hello_world",
            language: { code: "en_US" },
            components: []
        });

        return {
            channel: "WHATSAPP",
            success: result.success,
            message: result.success ? `WhatsApp test template sent to ${normalizedPhone}` : "WhatsApp failed",
            messageId: result.messageId,
            error: result.error,
        };
    } catch (error) {
        console.error("[TEST] WhatsApp notification error:", error);
        return {
            channel: "WHATSAPP",
            success: false,
            message: "WhatsApp notification failed",
            error: (error as Error).message,
        };
    }
}

/**
 * Send test notifications to all channels for a user
 * Returns results for each channel
 */
export async function sendTestAllChannels(
    userId: string,
    email?: string,
    phone?: string
): Promise<{
    results: TestNotificationResult[];
    summary: { total: number; success: number; failed: number };
}> {
    console.log(`[TEST] 🧪 Testing all notification channels for user ${userId}`);

    const results: TestNotificationResult[] = [];

    // 1. Test Push (always if user has devices)
    const pushResult = await sendTestPushNotification(userId);
    results.push(pushResult);

    // 2. Test Email (if provided)
    if (email) {
        const emailResult = await sendTestEmailNotification(email);
        results.push(emailResult);
    } else {
        results.push({
            channel: "EMAIL",
            success: false,
            message: "Skipped - no email provided",
        });
    }

    // 3. Test SMS (if provided)
    if (phone) {
        const smsResult = await sendTestSMSNotification(phone);
        results.push(smsResult);
    } else {
        results.push({
            channel: "SMS",
            success: false,
            message: "Skipped - no phone provided",
        });
    }

    // 4. Test WhatsApp (if provided)
    if (phone) {
        const whatsappResult = await sendTestWhatsAppNotification(phone);
        results.push(whatsappResult);
    } else {
        results.push({
            channel: "WHATSAPP",
            success: false,
            message: "Skipped - no phone provided",
        });
    }

    const summary = {
        total: results.length,
        success: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
    };

    console.log(`[TEST] 📊 Test complete: ${summary.success}/${summary.total} channels succeeded`);

    return { results, summary };
}
