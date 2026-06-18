'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma-base';
import { Role } from '@/generated/prisma/enums';

export type OrgDeleteSummary = {
  slug: string;
  name: string;
  counts: Record<string, number>;
};

export async function getOrgDeleteSummary(orgId: string): Promise<OrgDeleteSummary> {
  const session = await auth();
  if (orgId !== session.orgId || session.orgRole !== Role.ADMIN) redirect('/dashboard');

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { slug: true, name: true },
  });
  if (!org) redirect('/dashboard');

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
    await prisma.$transaction(async (tx) => {
      // Tier 1: Models without direct orgId (accessed via relation)
      await tx.chequeDetail.deleteMany({ where: { feePayment: { organizationId: orgId } } });
      await tx.aiAgentReport.deleteMany({ where: { agent: { organizationId: orgId } } });
      await tx.aiAgentConfig.deleteMany({ where: { agent: { organizationId: orgId } } });
      await tx.leaveStatusTimeline.deleteMany({ where: { leave: { organizationId: orgId } } });
      await tx.examEnrollment.deleteMany({ where: { exam: { organizationId: orgId } } });
      await tx.examResult.deleteMany({ where: { exam: { organizationId: orgId } } });
      await tx.parentStudent.deleteMany({ where: { student: { organizationId: orgId } } });

      // Tier 2: Models referencing people/exams/academic entities
      await tx.studentAttendance.deleteMany({ where: { student: { organizationId: orgId } } });
      await tx.studentDocument.deleteMany({ where: { organizationId: orgId } });
      await tx.certificate.deleteMany({ where: { organizationId: orgId } });
      await tx.leave.deleteMany({ where: { organizationId: orgId } });
      await tx.feePayment.deleteMany({ where: { organizationId: orgId } });
      await tx.fee.deleteMany({ where: { organizationId: orgId } });
      await tx.teachingAssignment.deleteMany({ where: { organizationId: orgId } });
      await tx.reportCard.deleteMany({ where: { organizationId: orgId } });
      await tx.hallTicket.deleteMany({ where: { organizationId: orgId } });

      // Tier 3: Entities with FK to AcademicYear (delete before AcademicYear)
      await tx.lead.deleteMany({ where: { organizationId: orgId } });
      await tx.academicCalendar.deleteMany({ where: { organizationId: orgId } });

      // Tier 4: Core entities
      await tx.exam.deleteMany({ where: { organizationId: orgId } });
      await tx.examSession.deleteMany({ where: { organizationId: orgId } });
      await tx.student.deleteMany({ where: { organizationId: orgId } });
      await tx.teacher.deleteMany({ where: { organizationId: orgId } });
      await tx.parent.deleteMany({ where: { organizationId: orgId } });
      await tx.subject.deleteMany({ where: { organizationId: orgId } });
      await tx.section.deleteMany({ where: { organizationId: orgId } });
      await tx.grade.deleteMany({ where: { organizationId: orgId } });
      await tx.feeCategory.deleteMany({ where: { organizationId: orgId } });

      // Tier 5: Models with academicYearId FK — must delete before AcademicYear
      await tx.notice.deleteMany({ where: { organizationId: orgId } });
      await tx.anonymousComplaint.deleteMany({ where: { organizationId: orgId } });

      // Tier 6: AcademicYear (no remaining FK refs)
      await tx.academicYear.deleteMany({ where: { organizationId: orgId } });
      await tx.gradingScale.deleteMany({ where: { organizationId: orgId } });

      // Tier 7: Administrative & infrastructure models (no academicYearId FK)
      await tx.scheduledJob.deleteMany({ where: { organizationId: orgId } });
      await tx.metaIntegration.deleteMany({ where: { organizationId: orgId } });
      await tx.idCard.deleteMany({ where: { organizationId: orgId } });
      await tx.aiAgentExecutionLog.deleteMany({ where: { organizationId: orgId } });
      await tx.aiAgent.deleteMany({ where: { organizationId: orgId } });

      // Tier 8: Notifications
      await tx.notificationLog.deleteMany({ where: { organizationId: orgId } });
      await tx.notification.deleteMany({ where: { organizationId: orgId } });
      await tx.notificationSetting.deleteMany({ where: { organizationId: orgId } });

      // Tier 9: Subscriptions (has cascade but explicit for clarity)
      await tx.subscription.deleteMany({ where: { organizationId: orgId } });

      // Finally: delete the organization (cascades memberships, invitations)
      await tx.organization.delete({ where: { id: orgId } });
    });

    // Clear stale activeOrganizationId from ALL sessions using this org
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
