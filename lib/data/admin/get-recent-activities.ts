'use server';

import prisma from '@/lib/db';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { getOrganizationId } from '@/lib/organization';
import { getRelativeTime } from '@/lib/utils';
import { ActivityItem } from '@/components/dashboard/admin/RecentActivity';

/* ---------- helpers ---------- */
const rel = (d: Date | string) => getRelativeTime(new Date(d));

const severityToPriority = (s?: string): ActivityItem['priority'] => {
  if (s === 'CRITICAL') return 'critical';
  if (s === 'HIGH') return 'high';
  if (s === 'MEDIUM') return 'medium';
  return 'low';
};

/* ---------- main action ---------- */
export const getRecentAdminActivities = async (): Promise<ActivityItem[]> => {
  try {
    const [academicYearId, organizationId] = await Promise.all([
      getActiveAcademicYearId(),
      getOrganizationId(),
    ]);

    const [
      payments,
      leads,
      complaints,
      notices,
      attendance,
      documents,
      teachers,
      students,
      academicCal,
    ] = await Promise.all([
      // Fee Payments - Fixed: removed payer relation (doesn't exist in schema)
      prisma.feePayment.findMany({
        where: { organizationId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          fee: {
            select: {
              student: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),

      // Leads - Fixed: activities relation structure
      prisma.lead.findMany({
        where: { organizationId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          studentName: true,
          email: true,
          phone: true,
          createdAt: true,
          activities: {
            select: {
              id: true,
              description: true,
              createdAt: true,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),

      // Complaints - Added null check for academicYearId
      prisma.anonymousComplaint.findMany({
        where: {
          organizationId,
          ...(academicYearId && { academicYearId }),
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          subject: true,
          trackingId: true,
          currentStatus: true,
          severity: true,
          createdAt: true,
        },
      }),

      // Notices - Added null check for academicYearId
      prisma.notice.findMany({
        where: {
          organizationId,
          ...(academicYearId && { academicYearId }),
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          summary: true,
          content: true,
          noticeType: true,
          priority: true,
          createdAt: true,
        },
      }),

      // Attendance - Added null check for academicYearId
      prisma.studentAttendance.findMany({
        where: {
          section: { organizationId },
          ...(academicYearId && { academicYearId }),
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          date: true,
          createdAt: true,
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          section: {
            select: {
              grade: {
                select: {
                  grade: true,
                },
              },
            },
          },
        },
      }),

      // Documents
      prisma.studentDocument.findMany({
        where: { organizationId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          verified: true,
          createdAt: true,
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      // Teachers
      prisma.teacher.findMany({
        where: { organizationId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      // Students
      prisma.student.findMany({
        where: { organizationId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          grade: {
            select: {
              grade: true,
            },
          },
          section: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Academic Calendar
      prisma.academicCalendar.findMany({
        where: { organizationId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          createdAt: true,
        },
      }),
    ]);

    const activities: (ActivityItem & { timestamp: Date })[] = [];

    // Process Payments
    payments.forEach((p) => {
      const st = p.fee?.student || { firstName: 'Unknown', lastName: 'Student' };
      activities.push({
        id: `payment-${p.id}`,
        type: 'payment',
        title: 'Fee Payment Received',
        description: `${st.firstName} ${st.lastName} paid ₹${p.amount}`,
        iconStyle: 'payment',
        time: rel(p.createdAt),
        timestamp: p.createdAt,
        badge: { text: 'Paid', variant: 'green' },
        priority: 'medium',
        metadata: { amount: p.amount },
      });
    });

    // Process Leads and Activities
    leads.forEach((l) => {
      activities.push({
        id: `lead-${l.id}`,
        type: 'lead',
        title: 'New Lead Generated',
        description: `${l.studentName} ${l.email || ''} (${l.phone || ''})`,
        iconStyle: 'lead',
        time: rel(l.createdAt),
        timestamp: l.createdAt,
        badge: { text: 'New', variant: 'blue' },
        priority: 'high',
        metadata: {
          studentName: l.studentName,
          email: l.email || '',
          phone: l.phone || '',
        },
      });

      // Process lead activities
      l.activities.forEach((activity) => {
        if (activity.description) {
          activities.push({
            id: `lead-${l.id}-activity-${activity.id}`,
            type: 'lead',
            title: 'Lead Activity',
            description: activity.description,
            iconStyle: 'lead',
            time: rel(activity.createdAt || l.createdAt),
            timestamp: activity.createdAt || l.createdAt,
            badge: { text: 'Activity', variant: 'blue' },
            priority: 'high',
          });
        }
      });
    });

    // Process Complaints
    complaints.forEach((c) => {
      activities.push({
        id: `complaint-${c.id}`,
        type: 'complaint',
        title: 'Anonymous Complaint Filed',
        description: `${c.subject} (ID: ${c.trackingId})`,
        iconStyle: 'complaint',
        time: rel(c.createdAt),
        timestamp: c.createdAt,
        badge: {
          text: c.currentStatus,
          variant: c.severity === 'CRITICAL' ? 'red' : 'yellow',
        },
        priority: severityToPriority(c.severity),
      });
    });

    // Process Notices
    notices.forEach((n) => {
      activities.push({
        id: `notice-${n.id}`,
        type: 'notice',
        title: 'Notice Published',
        description: n.summary || n.content.slice(0, 80),
        iconStyle: 'notice',
        time: rel(n.createdAt),
        timestamp: n.createdAt,
        badge: { text: n.noticeType, variant: 'purple' },
        priority: n.priority === 'URGENT' ? 'high' : 'medium',
      });
    });

    // Process Attendance
    attendance.forEach((a) => {
      const st = a.student || { firstName: 'Unknown', lastName: 'Student' };
      const status = a.status || 'UNKNOWN';
      const dateStr = a.date ? new Date(a.date).toISOString().slice(0, 10) : 'unknown date';

      activities.push({
        id: `attendance-${a.id}`,
        type: 'attendance',
        title: 'Attendance Marked',
        description: `${st.firstName} ${st.lastName} marked ${status} on ${dateStr}`,
        iconStyle: 'attendance',
        time: rel(a.createdAt),
        timestamp: a.createdAt,
        badge: {
          text: status,
          variant: status === 'PRESENT' ? 'green' : 'orange',
        },
        priority: 'low',
      });
    });

    // Process Documents
    documents.forEach((d) => {
      const st = d.student || { firstName: 'Unknown', lastName: 'Student' };
      const isVerified = !!d.verified;
      activities.push({
        id: `document-${d.id}`,
        type: 'document',
        title: isVerified ? 'Document Verified' : 'Document Uploaded',
        description: `${d.type || 'Document'} for ${st.firstName} ${st.lastName}`,
        iconStyle: 'document',
        time: rel(d.createdAt),
        timestamp: d.createdAt,
        badge: {
          text: isVerified ? 'Verified' : 'Pending',
          variant: isVerified ? 'green' : 'yellow',
        },
        priority: 'low',
      });
    });

    // Process Teachers
    teachers.forEach((t) => {
      activities.push({
        id: `teacher-${t.id}`,
        type: 'teacher',
        title: 'Teacher Profile Updated',
        description: `${t.user?.firstName || 'Unknown'} ${t.user?.lastName || 'Teacher'} joined as teacher`,
        iconStyle: 'teacher',
        time: rel(t.createdAt),
        timestamp: t.createdAt,
        badge: { text: 'New', variant: 'blue' },
        priority: 'low',
      });
    });

    // Process Students
    students.forEach((s) => {
      const gradeInfo = s.grade ? `Grade ${s.grade.grade}` : '';
      const sectionInfo = s.section?.name ? `-${s.section.name}` : '';
      const gradeSection =
        gradeInfo || sectionInfo ? ` (${gradeInfo}${sectionInfo})` : '';

      activities.push({
        id: `student-${s.id}`,
        type: 'student',
        title: 'Student Record',
        description:
          `${s.firstName || ''} ${s.lastName || ''}${gradeSection}`.trim(),
        iconStyle: 'student',
        time: rel(s.createdAt),
        timestamp: s.createdAt,
        badge: { text: 'New', variant: 'blue' },
        priority: 'medium',
        metadata: {
          grade: s.grade?.grade,
          section: s.section?.name,
        },
      });
    });

    // Process Academic Calendar
    academicCal.forEach((ac) => {
      const startDateStr = ac.startDate ? ac.startDate.toDateString() : 'N/A';
      const endDateStr = ac.endDate ? ac.endDate.toDateString() : 'N/A';

      activities.push({
        id: `system-${ac.id}`,
        type: 'system',
        title: 'Academic Calendar Updated',
        description: `${ac.name} from ${startDateStr} to ${endDateStr}`,
        iconStyle: 'system',
        time: rel(ac.createdAt),
        timestamp: ac.createdAt,
        priority: 'medium',
        badge: {
          text: 'System',
          variant: 'blue',
        },
      });
    });

    // Sort by time and limit to 50
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50)
      .map(({ timestamp, ...rest }) => rest);

  } catch (error) {
    console.error('Error fetching recent admin activities:', error);
    throw new Error('Failed to fetch recent activities. Please try again later.');
  }
};