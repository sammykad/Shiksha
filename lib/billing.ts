import prisma from "@/lib/db";

export async function getBillingSummary(
  organizationId: string,
  academicYearId: string | null
) {
  // ── 1. Channel usage — single GROUP BY query, no JS reduce ──────────────
  // groupBy returns one row per channel, so max 4 rows regardless of org size.
  // Filtering SENT only so FAILED/PENDING logs don't inflate the bill.
  const channelRows = await prisma.notificationLog.groupBy({
    by: ["channel"],
    where: {
      organizationId,
      status: "SENT",
    },
    _sum: {
      units: true,
      cost: true,
    },
  });

  // Normalize into a predictable shape with zero-defaults
  const channelSummary: Record<string, { units: number; cost: number }> = {
    EMAIL: { units: 0, cost: 0 },
    SMS: { units: 0, cost: 0 },
    WHATSAPP: { units: 0, cost: 0 },
    PUSH: { units: 0, cost: 0 },
  };

  let totalCost = 0;
  let totalMessages = 0;

  for (const row of channelRows) {
    const units = row._sum.units ?? 0;
    const cost = row._sum.cost ?? 0;
    channelSummary[row.channel] = { units, cost };
    totalCost += cost;
    totalMessages += units;
  }

  // ── 2. Storage — two aggregate queries, no row fetching ─────────────────
  const [docStorage, noticeStorage] = await Promise.all([
    // Student documents (org-wide, not year-scoped)
    prisma.studentDocument.aggregate({
      where: { organizationId, isDeleted: false },
      _sum: { fileSize: true },
    }),

    // Notice attachments — only if we have an academic year to scope to
    academicYearId
      ? prisma.noticeAttachment.aggregate({
        where: {
          notice: { organizationId, academicYearId },
        },
        _sum: { fileSize: true },
      })
      : Promise.resolve({ _sum: { fileSize: 0 } }),
  ]);

  const totalBytes =
    (docStorage._sum.fileSize ?? 0) +
    (noticeStorage._sum.fileSize ?? 0);

  const totalStorageMB = parseFloat((totalBytes / (1024 * 1024)).toFixed(2));

  // // ── 3. Wallet balance ────────────────────────────────────────────────────
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { walletBalance: true, plan: true },
  });

  return {
    channelSummary,
    totalMessages,
    totalCost,
    totalStorageMB,
    walletBalance: (organization?.walletBalance ?? 0) / 100, // Convert paise to rupees
    plan: organization?.plan,
  };
}

export async function addOrganizationCredits(
  organizationId: string,
  amountInRupees: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const amountInPaise = Math.round(amountInRupees * 100);
    if (amountInPaise <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: { walletBalance: { increment: amountInPaise } },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to add credits:", error);
    return { success: false, error: "Failed to add credits" };
  }
}