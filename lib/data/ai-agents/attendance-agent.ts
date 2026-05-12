import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import prisma from '@/lib/db';
import { z } from 'zod';

export class AttendanceAnalyzerAgent {
  async analyzeStudent(studentId: string, organizationId: string, academicYearId: string) {
    const attendance = await prisma.studentAttendance.findMany({
      where: { studentId, academicYearId },
      orderBy: { date: 'desc' },
      take: 90, // Last 90 days
    });

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parents: { include: { parent: true } },
        section: { include: { classTeacher: true } },
      },
    });

    if (!student) return null;

    const analysis = await generateObject({
      model: google('gemini-1.5-pro'),
      schema: z.object({
        attendanceRate: z.number(),
        riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
        patterns: z.array(z.string()),
        recommendedAction: z.string(),
        dropoutRisk: z.number(), // 0-1
        shouldNotifyParent: z.boolean(),
        shouldNotifyTeacher: z.boolean(),
      }),
      prompt: `Analyze attendance for ${student.firstName} ${student.lastName}:
               Total days: ${attendance.length}
               Present: ${attendance.filter((a) => a.status === 'PRESENT').length}
               Absent: ${attendance.filter((a) => a.status === 'ABSENT').length}
               Recent trend: ${JSON.stringify(attendance.slice(0, 14).map(a => ({ date: a.date, status: a.status })))}`,
    });

    const result = analysis.object;

    // Auto-send notifications via Inbox
    if (result.shouldNotifyParent && student.parents[0]?.parent) {
      await this.notifyParent(student.parents[0].parent, student, result, organizationId, academicYearId);
    }

    if (result.shouldNotifyTeacher && student.section?.classTeacher?.userId) {
      await this.notifyTeacher(student.section.classTeacher.userId, student, result, organizationId, academicYearId);
    }

    return result;
  }

  async detectClassPatterns(sectionId: string, academicYearId: string) {
    const attendance = await prisma.studentAttendance.findMany({
      where: { sectionId, academicYearId },
      include: { student: { select: { firstName: true, lastName: true, id: true } } },
    });

    const analysis = await generateObject({
      model: google('gemini-1.5-pro'),
      schema: z.object({
        classAttendanceRate: z.number(),
        problematicDays: z.array(z.string()),
        problematicPeriods: z.array(z.string()),
        studentsAtRisk: z.array(z.string()),
        suggestedActions: z.array(z.string()),
      }),
      prompt: `Analyze class attendance patterns based on recent records: ${JSON.stringify(attendance.map(a => ({ date: a.date, status: a.status, studentId: a.studentId })))}`,
    });

    return analysis.object;
  }

  private async notifyParent(parent: any, student: any, analysis: any, organizationId: string, academicYearId: string) {
    await prisma.notification.create({
      data: {
        organizationId,
        academicYearId,
        parentId: parent.id,
        userId: parent.userId,
        studentId: student.id,
        type: 'ATTENDANCE',
        title: analysis.attendanceRate < 75 ? '⚠️ Attendance Alert' : '📊 Attendance Update',
        message: `Attendance is at ${analysis.attendanceRate}%. ${analysis.recommendedAction}`,
        idempotencyKey: `attendance_parent_${student.id}_${Date.now()}`
      }
    });
  }

  private async notifyTeacher(teacherUserId: string, student: any, analysis: any, organizationId: string, academicYearId: string) {
    await prisma.notification.create({
      data: {
        organizationId,
        academicYearId,
        userId: teacherUserId,
        studentId: student.id,
        type: 'ATTENDANCE',
        title: `${analysis.riskLevel.toUpperCase()} Risk Student: ${student.firstName}`,
        message: analysis.recommendedAction,
        idempotencyKey: `attendance_teacher_${student.id}_${Date.now()}`
      },
    });
  }
}
