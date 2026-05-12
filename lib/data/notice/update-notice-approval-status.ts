'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/user';
import { notify } from '@/lib/notifications/notify';
import { NotificationChannel, Role, StudentStatus } from '@/generated/prisma/enums';
import { getOrganizationId } from '@/lib/organization';
import type { RecipientInfo } from '@/lib/notifications/engine';

// ─── Channel resolver ─────────────────────────────────────────────────────────
// Reads the per-notice channel toggles saved at creation time.
// Returns the exact channels admin chose, or undefined to fall back to org settings.

function resolveChannels(notice: {
  emailNotification: boolean;
  pushNotification: boolean;
  whatsAppNotification: boolean;
  smsNotification: boolean;
}): NotificationChannel[] | undefined {
  const channels: NotificationChannel[] = [
    ...(notice.emailNotification ? ['EMAIL' as NotificationChannel] : []),
    ...(notice.pushNotification ? ['PUSH' as NotificationChannel] : []),
    ...(notice.whatsAppNotification ? ['WHATSAPP' as NotificationChannel] : []),
    ...(notice.smsNotification ? ['SMS' as NotificationChannel] : []),
  ];
  return channels.length > 0 ? channels : undefined;
}

// ─── Attachment resolver ──────────────────────────────────────────────────────
// Fetches any file type — PDF, image, docx, etc.
// Prefers PDF for email compatibility but doesn't block other types.
// Returns undefined cleanly if fetch fails — notification still fires.

async function resolveAttachment(
  attachments: { fileUrl: string; fileName: string; fileType: string }[],
): Promise<{ filename: string; content: Buffer; contentType: string } | undefined> {
  if (attachments.length === 0) return undefined;

  const picked = attachments.find((a) => a.fileType === 'application/pdf') ?? attachments[0];

  try {
    const res = await fetch(picked.fileUrl);
    if (!res.ok) return undefined;
    return {
      filename: picked.fileName,
      content: Buffer.from(await res.arrayBuffer()),
      contentType: picked.fileType,
    };
  } catch {
    return undefined;
  }
}

// ─── Recipient resolver ───────────────────────────────────────────────────────
// Resolves targetRoles + targetGrades + targetSections into RecipientInfo[]
// matching the exact schema shape — Student has direct contact fields,
// Parent contact is on the Parent model, Teacher contact is via User.

async function resolveRecipients(
  organizationId: string,
  targetRoles: Role[],
  targetGrades: string[],
  targetSections: string[],
): Promise<RecipientInfo[]> {
  const recipients: RecipientInfo[] = [];
  const seen = new Set<string>(); // deduplicate by userId

  const has = (role: Role) => targetRoles.includes(role);
  const scopedToGrades = targetGrades.length > 0;
  const sectionFilter = targetSections.length > 0 ? { sectionId: { in: targetSections } } : {};

  function addUser(info: RecipientInfo, userId?: string) {
    if (userId && seen.has(userId)) return;
    if (userId) seen.add(userId);
    recipients.push(info);
  }

  // ── A. Grade/section-scoped: Students, Parents, Teachers ──────────────────
  if (scopedToGrades && (has(Role.STUDENT) || has(Role.PARENT) || has(Role.TEACHER))) {

    if (has(Role.STUDENT) || has(Role.PARENT)) {
      // Student model has direct contact fields — no need to join User for email/phone
      const students = await prisma.student.findMany({
        where: {
          organizationId,
          gradeId: { in: targetGrades },
          status: StudentStatus.ACTIVE,
          ...sectionFilter,
        },
        select: {
          id: true,
          userId: true,
          email: true,
          phoneNumber: true,
          whatsAppNumber: true,
          user: { select: { deviceTokens: { select: { token: true } } } },
          // ParentStudent join → Parent model for contact details
          parents: {
            where: { isPrimary: true },
            select: {
              parent: {
                select: {
                  id: true,
                  userId: true,
                  email: true,
                  phoneNumber: true,
                  whatsAppNumber: true,
                  user: { select: { deviceTokens: { select: { token: true } } } },
                },
              },
            },
          },
        },
      });

      for (const s of students) {
        if (has(Role.STUDENT)) {
          addUser({
            userId: s.userId,
            studentId: s.id,
            email: s.email,
            phone: s.phoneNumber,
            whatsappNumber: s.whatsAppNumber,
            fcmTokens: s.user.deviceTokens.map((d) => d.token),
          }, s.userId);
        }

        if (has(Role.PARENT)) {
          for (const { parent: p } of s.parents) {
            addUser({
              userId: p.userId ?? undefined,
              parentId: p.id,
              studentId: s.id,
              email: p.email,
              phone: p.phoneNumber,
              whatsappNumber: p.whatsAppNumber,
              fcmTokens: p.user?.deviceTokens.map((d) => d.token) ?? [],
            }, p.userId ?? undefined);
          }
        }
      }
    }

    if (has(Role.TEACHER)) {
      // Teacher contact lives on User — teachingAssignment → teacher → user
      const assignments = await prisma.teachingAssignment.findMany({
        where: {
          organizationId,
          gradeId: { in: targetGrades },
          ...sectionFilter,
        },
        select: {
          teacher: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  deviceTokens: { select: { token: true } },
                },
              },
            },
          },
        },
      });

      for (const { teacher: t } of assignments) {
        addUser({
          userId: t.userId,
          email: t.user.email,
          fcmTokens: t.user.deviceTokens.map((d) => d.token),
        }, t.userId);
      }
    }
  }

  // ── B. Org-wide: no grade scope, or ADMIN (always org-wide) ───────────────
  const orgWideRoles: Role[] = [
    ...(!scopedToGrades && has(Role.STUDENT) ? [Role.STUDENT] : []),
    ...(!scopedToGrades && has(Role.PARENT) ? [Role.PARENT] : []),
    ...(!scopedToGrades && has(Role.TEACHER) ? [Role.TEACHER] : []),
    ...(has(Role.ADMIN) ? [Role.ADMIN] : []),
  ];

  if (orgWideRoles.length > 0) {
    // For org-wide, we resolve through User → student/parent/teacher sub-records
    // to get phone + whatsapp (those live on the sub-models, not User directly)
    const users = await prisma.user.findMany({
      where: { organizationId, role: { in: orgWideRoles }, isActive: true },
      select: {
        id: true,
        email: true,
        role: true,
        deviceTokens: { select: { token: true } },
        student: { select: { id: true, phoneNumber: true, whatsAppNumber: true } },
        parent: { select: { id: true, phoneNumber: true, whatsAppNumber: true } },
        teacher: { select: { id: true } },
      },
    });

    for (const u of users) {
      if (seen.has(u.id)) continue;
      seen.add(u.id);

      recipients.push({
        userId: u.id,
        studentId: u.student?.id,
        parentId: u.parent?.id,
        email: u.email,
        phone: u.student?.phoneNumber ?? u.parent?.phoneNumber,
        whatsappNumber: u.student?.whatsAppNumber ?? u.parent?.whatsAppNumber,
        fcmTokens: u.deviceTokens.map((d) => d.token),
      });
    }
  }

  return recipients;
}

// ─── Main action ──────────────────────────────────────────────────────────────

export const updateNoticeApprovalStatus = async (
  noticeId: string,
  shouldApprove: boolean,
) => {
  const [user, organizationId] = await Promise.all([
    getCurrentUser(),
    getOrganizationId(),
  ]);

  if (user.role !== Role.ADMIN) throw new Error('Only admins can approve or reject notices');

  const existing = await prisma.notice.findFirst({
    where: { id: noticeId, organizationId },
    select: { id: true, status: true },
  });

  if (!existing) throw new Error('Notice not found');

  if (shouldApprove && existing.status !== 'PENDING_REVIEW')
    throw new Error(`Cannot approve a notice with status "${existing.status}"`);

  if (!shouldApprove && !['PENDING_REVIEW', 'PUBLISHED'].includes(existing.status))
    throw new Error(`Cannot reject a notice with status "${existing.status}"`);

  const actor = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Admin';
  const now = new Date();

  const notice = await prisma.notice.update({
    where: { id: noticeId },
    data: shouldApprove
      ? { status: 'PUBLISHED', approvedBy: actor, approvedAt: now, publishedBy: actor, publishedAt: now }
      : { status: 'REJECTED', approvedBy: null, approvedAt: null, publishedBy: null, publishedAt: null },
    include: {
      attachments: true,
      organization: { select: { name: true } },
    },
  });

  revalidatePath('/dashboard/notices');
  revalidatePath(`/dashboard/notices/${noticeId}`);

  if (!shouldApprove) return notice;

  // ── Resolve recipients + attachment in parallel ───────────────────────────
  const [resolvedRecipients, attachment] = await Promise.all([
    resolveRecipients(
      notice.organizationId,
      notice.targetRoles as Role[],
      notice.targetGrades as string[],
      notice.targetSections as string[],
    ),
    resolveAttachment(notice.attachments),
  ]);

  if (resolvedRecipients.length === 0) return notice;

  // ── Fire through notification engine ─────────────────────────────────────
  await notify.notice[notice.isUrgent ? 'urgent' : 'general']({
    noticeId: notice.id,
    organizationId: notice.organizationId,
    recipients: resolvedRecipients,         // already fully hydrated — engine skips re-resolution
    channels: resolveChannels(notice),    // undefined = org defaults, array = notice override
    attachment,                                // undefined when no files uploaded
    variables: {
      title: notice.title,
      content: notice.content,
      summary: notice.summary ?? undefined,
      noticeType: notice.noticeType,
      startDate: notice.startDate,
      endDate: notice.endDate,
      publishedBy: actor,
      attachmentCount: notice.attachments.length,
      noticeId: notice.id,
    },
  });

  return notice;
};