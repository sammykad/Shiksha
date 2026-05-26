'use server';

import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { AttendanceStatus, OrganizationType } from '@/generated/prisma/enums';

type OrgStatus = 'healthy' | 'warning' | 'critical';
type BranchStatus = 'ready' | 'multi' | 'pending';

export type OrganizationDashboardItem = {
  id: string;
  name: string;
  location: string;
  organizationType: string;
  academicYear: string;
  status: OrgStatus;
  students: number;
  feeCollected: number;
  pendingDues: number;
  attendance: number;
  campusCount: number;
  branchStatus: BranchStatus;
  branchSummary: string;
  attention: string[];
};

export type InstitutionDashboardData = {
  institutionName: string;
  organizations: OrganizationDashboardItem[];
  totals: {
    students: number;
    feeCollected: number;
    pendingDues: number;
    attendance: number;
  };
  attentionItems: {
    id: string;
    organization: string;
    item: string;
    status: OrgStatus;
  }[];
};

const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
  [OrganizationType.SCHOOL]: 'School',
  [OrganizationType.COLLEGE]: 'College',
  [OrganizationType.COACHING_CLASS]: 'Coaching',
  [OrganizationType.UNIVERSITY]: 'University',
  [OrganizationType.KINDERGARTEN]: 'Kindergarten',
  [OrganizationType.TRAINING_INSTITUTE]: 'Training',
  [OrganizationType.OTHER]: 'Other',
};

// Thresholds for Attention Alerts (in Paise / Percentages)
const DUES_CRITICAL_THRESHOLD_PAISE = 2000000; // ₹20,000
const DUES_WARNING_THRESHOLD_PAISE = 1000000;  // ₹10,000
const ATTENDANCE_CRITICAL_THRESHOLD_PCT = 60;  // 60%
const ATTENDANCE_WARNING_THRESHOLD_PCT = 75;   // 75%

const ATTENTION_THRESHOLDS = [
  { 
    test: (p: number) => p > DUES_CRITICAL_THRESHOLD_PAISE, 
    status: 'critical' as OrgStatus, 
    msg: 'Pending dues are critically high' 
  },
  { 
    test: (p: number) => p > DUES_WARNING_THRESHOLD_PAISE, 
    status: 'warning' as OrgStatus, 
    msg: 'Pending dues are above target' 
  },
  { 
    test: (a: number) => a > 0 && a < ATTENDANCE_CRITICAL_THRESHOLD_PCT, 
    status: 'critical' as OrgStatus, 
    msg: `Attendance critically below ${ATTENDANCE_CRITICAL_THRESHOLD_PCT}%` 
  },
  { 
    test: (a: number) => a > 0 && a < ATTENDANCE_WARNING_THRESHOLD_PCT, 
    status: 'warning' as OrgStatus, 
    msg: `Attendance below ${ATTENDANCE_WARNING_THRESHOLD_PCT}%` 
  },
];

export async function getInstitutionDashboard(): Promise<InstitutionDashboardData | null> {
  const { orgId, userId } = await auth();

  // 1. Resolve institution via active org's link (org admin/team member path)
  let institutionId: string | null = null;

  const activeOrg = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { institutionId: true },
  });

  institutionId = activeOrg?.institutionId ?? null;

  // 2. Fallback: if org isn't linked, check if user owns an institution directly (owner path)
  if (!institutionId) {
    const owned = await prisma.institution.findFirst({
      where: { ownerId: userId, isActive: true },
      select: { id: true },
    });
    institutionId = owned?.id ?? null;
  }

  if (!institutionId) return null;

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId, isActive: true },
    select: { id: true, name: true, city: true, state: true },
  });

  if (!institution) return null;

  const orgs = await prisma.organization.findMany({
    where: { institutionId: institution.id, isActive: true },
    select: { id: true, name: true, organizationType: true },
  });

  if (orgs.length === 0) {
    return {
      institutionName: institution.name,
      organizations: [],
      totals: { students: 0, feeCollected: 0, pendingDues: 0, attendance: 0 },
      attentionItems: [],
    };
  }

  const orgIds = orgs.map(o => o.id);
  const location = [institution.city, institution.state].filter(Boolean).join(', ');

  // 3. Query academic years, student counts, and fee aggregates for all organizations in parallel (Optimized GroupBys)
  const [academicYears, studentGroupStats, feeGroupStats] = await Promise.all([
    prisma.academicYear.findMany({
      where: { organizationId: { in: orgIds }, isCurrent: true },
      select: { id: true, organizationId: true, name: true },
    }),
    prisma.student.groupBy({
      by: ['organizationId'],
      _count: { id: true },
      where: { organizationId: { in: orgIds } },
    }),
    prisma.fee.groupBy({
      by: ['organizationId'],
      _sum: {
        totalFee: true,
        paidAmount: true,
      },
      where: { organizationId: { in: orgIds } },
    }),
  ]);

  // Create maps for efficient O(1) lookups
  const academicYearMap = new Map(academicYears.map(ay => [ay.organizationId, ay.name]));
  const academicYearIdToOrgMap = new Map(academicYears.map(ay => [ay.id, ay.organizationId]));

  const studentCountMap = new Map<string, number>(orgIds.map(id => [id, 0]));
  for (const stat of studentGroupStats) {
    studentCountMap.set(stat.organizationId, stat._count.id);
  }

  const feeMap = new Map<string, { total: number; collected: number }>();
  for (const stat of feeGroupStats) {
    feeMap.set(stat.organizationId, {
      total: stat._sum.totalFee ?? 0,
      collected: stat._sum.paidAmount ?? 0,
    });
  }

  // 4. Query student attendance stats in a single optimized groupBy query
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const academicYearIds = academicYears.map(ay => ay.id);
  const attendanceStatsMap = new Map<string, { presentLate: number; totalAttendance: number }>();
  for (const id of orgIds) {
    attendanceStatsMap.set(id, { presentLate: 0, totalAttendance: 0 });
  }

  if (academicYearIds.length > 0) {
    const attendanceAggregates = await prisma.studentAttendance.groupBy({
      by: ['academicYearId', 'status'],
      where: {
        academicYearId: { in: academicYearIds },
        date: { gte: thirtyDaysAgo },
      },
      _count: {
        id: true,
      },
    });

    for (const agg of attendanceAggregates) {
      const orgId = academicYearIdToOrgMap.get(agg.academicYearId);
      if (orgId) {
        const stats = attendanceStatsMap.get(orgId) ?? { presentLate: 0, totalAttendance: 0 };
        const count = agg._count.id;
        stats.totalAttendance += count;
        if (agg.status === AttendanceStatus.PRESENT || agg.status === AttendanceStatus.LATE) {
          stats.presentLate += count;
        }
        attendanceStatsMap.set(orgId, stats);
      }
    }
  }

  const orgCount = orgs.length;
  let totalStudents = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let totalAttendanceWeighted = 0;

  const organizations: OrganizationDashboardItem[] = orgs.map((org) => {
    const students = studentCountMap.get(org.id) ?? 0;
    const feeData = feeMap.get(org.id);
    const feeCollected = feeData?.collected ?? 0;
    const feeTotal = feeData?.total ?? 0;
    const pendingDues = Math.max(feeTotal - feeCollected, 0);
    
    const attendanceRec = attendanceStatsMap.get(org.id);
    const attendance = attendanceRec && attendanceRec.totalAttendance > 0
      ? Math.round((attendanceRec.presentLate / attendanceRec.totalAttendance) * 100)
      : 0;

    let status: OrgStatus = 'healthy';
    const attention: string[] = [];

    for (const t of ATTENTION_THRESHOLDS) {
      if (t.msg.includes('Pending')) {
        if (t.test(pendingDues)) {
          status = t.status;
          attention.push(t.msg);
        }
      } else {
        if (t.test(attendance)) {
          if (t.status === 'critical' || status === 'healthy') status = t.status;
          if (!attention.some(a => a.includes('Attendance'))) attention.push(t.msg);
        }
      }
    }

    const branchStatus: BranchStatus = orgCount > 1 ? 'multi' : 'ready';
    const branchSummary = orgCount > 1 ? `${orgCount} branches` : '1 campus';

    totalStudents += students;
    totalCollected += feeCollected;
    totalPending += pendingDues;
    totalAttendanceWeighted += attendance * students;

    return {
      id: org.id,
      name: org.name,
      location,
      organizationType: org.organizationType ? (ORG_TYPE_LABELS[org.organizationType] ?? org.organizationType) : 'School',
      academicYear: academicYearMap.get(org.id) ?? '',
      status,
      students,
      feeCollected,
      pendingDues,
      attendance,
      campusCount: orgCount,
      branchStatus,
      branchSummary,
      attention,
    };
  });

  const avgAttendance = totalStudents > 0
    ? Math.round(totalAttendanceWeighted / totalStudents)
    : 0;

  const attentionItems = organizations.flatMap(org =>
    org.attention.map(item => ({
      id: `${org.id}-${item.replace(/\s+/g, '-')}`,
      organization: org.name,
      item,
      status: org.status,
    }))
  );

  return {
    institutionName: institution.name,
    organizations,
    totals: {
      students: totalStudents,
      feeCollected: totalCollected,
      pendingDues: totalPending,
      attendance: avgAttendance,
    },
    attentionItems,
  };
}
