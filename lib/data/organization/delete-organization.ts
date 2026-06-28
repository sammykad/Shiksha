'use server';

import { Role } from '@/generated/prisma/enums';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma-base';

export type OrgDeleteSummary = {
  slug: string;
  name: string;
  counts: Record<string, number>;
};

export async function getOrgDeleteSummary(orgId: string): Promise<OrgDeleteSummary | null> {
  const { orgRole, orgId: sessionOrgId } = await auth();
  if (orgRole !== Role.ADMIN || sessionOrgId !== orgId) return null;
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { slug: true, name: true },
  });
  if (!org) return null;

  const [
    studentCount,
    teacherCount,
    parentCount,
    feeCount,
    paymentCount,
    examCount,
    examSessionCount,
    certificateCount,
    leaveCount,
    leadCount,
    noticeCount,
    complaintCount,
    attendanceCount,
    documentCount,
    teachingAssignmentCount,
    academicYearCount,
    aiAgentCount,
    membershipCount,
  ] = await Promise.all([
    prisma.student.count({ where: { organizationId: orgId } }),
    prisma.teacher.count({ where: { organizationId: orgId } }),
    prisma.parent.count({ where: { organizationId: orgId } }),
    prisma.fee.count({ where: { organizationId: orgId } }),
    prisma.feePayment.count({ where: { organizationId: orgId } }),
    prisma.exam.count({ where: { organizationId: orgId } }),
    prisma.examSession.count({ where: { organizationId: orgId } }),
    prisma.certificate.count({ where: { organizationId: orgId } }),
    prisma.leave.count({ where: { organizationId: orgId } }),
    prisma.lead.count({ where: { organizationId: orgId } }),
    prisma.notice.count({ where: { organizationId: orgId } }),
    prisma.anonymousComplaint.count({ where: { organizationId: orgId } }),
    prisma.studentAttendance.count({ where: { student: { organizationId: orgId } } }),
    prisma.studentDocument.count({ where: { organizationId: orgId } }),
    prisma.teachingAssignment.count({ where: { organizationId: orgId } }),
    prisma.academicYear.count({ where: { organizationId: orgId } }),
    prisma.aiAgent.count({ where: { organizationId: orgId } }),
    prisma.membership.count({ where: { organizationId: orgId } }),
  ]);

  return {
    slug: org.slug,
    name: org.name,
    counts: {
      students: studentCount,
      teachers: teacherCount,
      parents: parentCount,
      fees: feeCount,
      payments: paymentCount,
      exams: examCount,
      examSessions: examSessionCount,
      certificates: certificateCount,
      leaves: leaveCount,
      leads: leadCount,
      notices: noticeCount,
      complaints: complaintCount,
      attendanceRecords: attendanceCount,
      documents: documentCount,
      teachingAssignments: teachingAssignmentCount,
      academicYears: academicYearCount,
      aiAgents: aiAgentCount,
      members: membershipCount,
    },
  };
}

export async function deleteOrganizationAction(orgId: string) {
  const session = await auth();
  if (orgId !== session.orgId || session.orgRole !== Role.ADMIN) return { success: false, error: 'Unauthorized' } as const;

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true },
  });
  if (!org) return { success: false, error: 'Organization not found' } as const;

  try {
    const studentIds = (
      await prisma.student.findMany({
        where: { organizationId: orgId },
        select: { id: true },
      })
    ).map((s) => s.id);

    await prisma.$transaction(async (tx) => {
      // Tier 1a: Models without orgId (FK traversal via parent's orgId)
      await tx.chequeDetail.deleteMany({ where: { feePayment: { organizationId: orgId } } });
      await tx.aiAgentReport.deleteMany({ where: { agent: { organizationId: orgId } } });
      await tx.aiAgentConfig.deleteMany({ where: { agent: { organizationId: orgId } } });
      await tx.leaveStatusTimeline.deleteMany({ where: { leave: { organizationId: orgId } } });
      await tx.complaintStatusTimeline.deleteMany({ where: { complaint: { organizationId: orgId } } });
      await tx.noticeAttachment.deleteMany({ where: { notice: { organizationId: orgId } } });
      await tx.leadActivity.deleteMany({ where: { lead: { organizationId: orgId } } });
      await tx.teacherProfile.deleteMany({ where: { teacher: { organizationId: orgId } } });
      await tx.gradeBand.deleteMany({ where: { gradingScale: { organizationId: orgId } } });
      await tx.pricingSlab.deleteMany({ where: { subscription: { organizationId: orgId } } });
      await tx.subscriptionPayment.deleteMany({ where: { subscription: { organizationId: orgId } } });
      await tx.billingEvent.deleteMany({ where: { subscription: { organizationId: orgId } } });

      // Tier 1b: Student-referencing models (via student relation — catches cross-org orphans)
      if (studentIds.length > 0) {
        await tx.examEnrollment.deleteMany({ where: { studentId: { in: studentIds } } });
        await tx.examResult.deleteMany({ where: { studentId: { in: studentIds } } });
        await tx.parentStudent.deleteMany({ where: { studentId: { in: studentIds } } });
        await tx.studentAttendance.deleteMany({ where: { studentId: { in: studentIds } } });
      }

      // Tier 1c: Models with orgId, no FK children
      await tx.transportEnrollment.deleteMany({ where: { organizationId: orgId } });
      await tx.studentDocument.deleteMany({ where: { organizationId: orgId } });
      await tx.certificate.deleteMany({ where: { organizationId: orgId } });
      await tx.academicCalendar.deleteMany({ where: { organizationId: orgId } });
      await tx.hallTicket.deleteMany({ where: { organizationId: orgId } });
      await tx.reportCard.deleteMany({ where: { organizationId: orgId } });
      await tx.idCard.deleteMany({ where: { organizationId: orgId } });
      await tx.teachingAssignment.deleteMany({ where: { organizationId: orgId } });
      await tx.scheduledJob.deleteMany({ where: { organizationId: orgId } });
      await tx.metaIntegration.deleteMany({ where: { organizationId: orgId } });
      await tx.notificationLog.deleteMany({ where: { organizationId: orgId } });
      await tx.notificationSetting.deleteMany({ where: { organizationId: orgId } });
      await tx.membership.deleteMany({ where: { organizationId: orgId } });
      await tx.invitation.deleteMany({ where: { organizationId: orgId } });
      await tx.teacherBankAccount.deleteMany({ where: { organizationId: orgId } });

      // Tier 2: Models referenced by Tier 1 (one level up)
      await tx.transportStop.deleteMany({ where: { route: { organizationId: orgId } } });
      await tx.notification.deleteMany({ where: { organizationId: orgId } });
      await tx.feePayment.deleteMany({ where: { organizationId: orgId } });
      await tx.lead.deleteMany({ where: { organizationId: orgId } });
      await tx.anonymousComplaint.deleteMany({ where: { organizationId: orgId } });
      await tx.notice.deleteMany({ where: { organizationId: orgId } });
      await tx.leave.deleteMany({ where: { organizationId: orgId } });
      await tx.invoice.deleteMany({ where: { organizationId: orgId } });
      await tx.subscription.deleteMany({ where: { organizationId: orgId } });

      // Tier 3: Entities referenced by Tier 2
      await tx.fee.deleteMany({ where: { organizationId: orgId } });
      await tx.exam.deleteMany({ where: { organizationId: orgId } });
      await tx.examSession.deleteMany({ where: { organizationId: orgId } });
      await tx.aiAgentExecutionLog.deleteMany({ where: { organizationId: orgId } });
      await tx.aiAgent.deleteMany({ where: { organizationId: orgId } });
      await tx.transportRoute.deleteMany({ where: { organizationId: orgId } });
      await tx.parent.deleteMany({ where: { organizationId: orgId } });
      await tx.subject.deleteMany({ where: { organizationId: orgId } });

      // Tier 4: Core entities referenced by Tier 2 and 3
      await tx.student.deleteMany({ where: { id: { in: studentIds } } });
      await tx.feeCategory.deleteMany({ where: { organizationId: orgId } });
      await tx.gradingScale.deleteMany({ where: { organizationId: orgId } });
      await tx.vehicle.deleteMany({ where: { organizationId: orgId } });
      await tx.driver.deleteMany({ where: { organizationId: orgId } });
      await tx.helper.deleteMany({ where: { organizationId: orgId } });

      // Tier 5: Entities with FK to AcademicYear, Grade, Section
      await tx.section.deleteMany({ where: { organizationId: orgId } });
      await tx.academicYear.deleteMany({ where: { organizationId: orgId } });

      // Tier 6: Pure parents (no remaining FK children)
      await tx.grade.deleteMany({ where: { organizationId: orgId } });
      await tx.teacher.deleteMany({ where: { organizationId: orgId } });

      // Finally: delete the organization
      await tx.organization.delete({ where: { id: orgId } });
    });

    await prisma.session.updateMany({
      where: { activeOrganizationId: orgId },
      data: { activeOrganizationId: null },
    });

    return { success: true } as const;
  } catch (error) {
    console.error('Failed to delete organization:', error);
    return { success: false, error: 'Failed to delete organization. Please try again.' } as const;
  }
}
