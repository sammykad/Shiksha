import prisma from '@/lib/db';
import { PaymentStatus } from '@/generated/prisma/enums';
import { getFeeBalance } from '@/lib/data/fee/fee-balance';

export async function getTeacherFeeSummary(teacherId: string) {
  // Step 1: Find teacher

  // Step 2: Find assigned sections
  const assignments = await prisma.teachingAssignment.findMany({
    where: { teacherId },
    select: { sectionId: true },
  });

  const sectionIds = assignments.map((a) => a.sectionId);

  if (sectionIds.length === 0) {
    return {
      totalStudents: 0,
      paidFees: 0,
      unpaidFees: 0,
      overdueFees: 0,
    };
  }

  // Step 3: Find students in those sections
  const students = await prisma.student.findMany({
    where: {
      sectionId: { in: sectionIds },
    },
    select: { id: true },
  });

  const studentIds = students.map((s) => s.id);

  if (studentIds.length === 0) {
    return {
      totalStudents: 0,
      paidFees: 0,
      unpaidFees: 0,
      overdueFees: 0,
      studentsWithUnpaidFees: 0,
      studentsWithOverdueFees: 0,
    };
  }

  // Step 4: Aggregate fee data
  const fees = await prisma.fee.findMany({
    where: { studentId: { in: studentIds } },
    select: {
      totalFee: true,
      dueDate: true,
      studentId: true,
      payments: {
        where: { status: PaymentStatus.COMPLETED },
        select: { amount: true, status: true },
      },
    },
  });

  let paidFees = 0;
  let unpaidFees = 0;
  let overdueFees = 0;

  const unpaidStudentSet = new Set<string>();
  const overdueStudentSet = new Set<string>();

  for (const fee of fees) {
    const balance = getFeeBalance(fee);

    paidFees += balance.paidAmount;
    unpaidFees += balance.dueAmount;

    if (balance.dueAmount > 0) unpaidStudentSet.add(fee.studentId);
    if (balance.status === 'OVERDUE' && balance.dueAmount > 0) {
      overdueFees += balance.dueAmount;
      overdueStudentSet.add(fee.studentId);
    }
  }

  return {
    totalStudents: studentIds.length,
    paidFees,
    unpaidFees,
    overdueFees,
    studentsWithUnpaidFees: unpaidStudentSet.size,
    studentsWithOverdueFees: overdueStudentSet.size,
  };
}
