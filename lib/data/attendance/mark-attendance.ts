"use server";

import { AttendanceStatus } from "@/generated/prisma/enums";
import { getCurrentAcademicYearId } from "@/lib/academicYear";
import prisma from "@/lib/db";
import { notify } from "@/lib/notifications/notify";
import { getOrganizationId } from "@/lib/organization";
import { getCurrentUser } from "@/lib/user";
import { formatTimeIN, toISTDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// Teacher marks Arjun LATE at 9:05am  → eventId: clx123:2026-03-16:LATE  ✓ parent notified
// Teacher corrects to ABSENT at 9:10am → eventId: clx123:2026-03-16:ABSENT ✓ parent notified again

interface markAttendanceProps {
    sectionId: string;
    selectedDate: Date;
    records: {
        studentId: string;
        status: AttendanceStatus;
        note?: string;
    }[];
}

export async function markAttendance({ sectionId, selectedDate, records }: markAttendanceProps) {
    const date = toISTDate(selectedDate);
    if (!records.length) throw new Error("Attendance data cannot be empty");

    const [academicYearId, organizationId, user] = await Promise.all([
        getCurrentAcademicYearId(),
        getOrganizationId(),
        getCurrentUser(),
    ]);

    // ── 1. Holiday & Weekend Guard ───────────────────────────────────────────
    const holiday = await prisma.academicCalendar.findFirst({
        where: {
            organizationId,
            startDate: { lte: date },
            endDate: { gte: date },
        },
        select: { name: true }
    });

    // if (holiday) {
    //     throw new Error(`Cannot mark attendance on a holiday: ${holiday.name}`);
    // }

    const section = await prisma.section.findFirstOrThrow({
        where: { id: sectionId, organizationId },
        select: {
            id: true,
            name: true,
            grade: { select: { grade: true } },
            students: { select: { id: true, userId: true, firstName: true, lastName: true } },
        },
    });

    // ── 2. Identify Students on Approved Leave ───────────────────────────────
    const studentsOnLeave = await prisma.leave.findMany({
        where: {
            organizationId,
            currentStatus: "APPROVED",
            startDate: { lte: date },
            endDate: { gte: date },
            userId: { in: section.students.map(s => s.userId).filter((id): id is string => !!id) }
        },
        select: { userId: true }
    });
    const onLeaveUserIds = new Set(studentsOnLeave.map(l => l.userId));

    const recordedBy = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown";


    const chunkSize = 50; // tune this — 50–100 is a good starting point
    const chunks: typeof records[] = [];
    for (let i = 0; i < records.length; i += chunkSize) {
        chunks.push(records.slice(i, i + chunkSize));
    }

    const attendanceRecords = (
        await Promise.all(
            chunks.map((chunk) =>
                prisma.$transaction(
                    chunk.map(({ studentId, status, note }) =>
                        prisma.studentAttendance.upsert({
                            where: { studentId_date: { studentId, date } },
                            update: { status, updatedAt: new Date(), recordedBy, academicYearId, note },
                            create: { studentId, academicYearId, date, status, note, recordedBy, sectionId, createdAt: new Date(), updatedAt: new Date() },
                            select: { id: true, studentId: true, status: true },
                        })
                    )
                )
            )
        )
    ).flat();

    // const attendanceRecords = await prisma.$transaction(
    //     records.map(({ studentId, status, note }) =>
    //         prisma.studentAttendance.upsert({
    //             where: { studentId_date: { studentId, date } },
    //             update: { status, updatedAt: new Date(), recordedBy, academicYearId, note },
    //             create: { studentId, academicYearId, date, status, note, recordedBy, sectionId, createdAt: new Date(), updatedAt: new Date() },
    //             select: { id: true, studentId: true, status: true },
    //         })
    //     )
    // );

    revalidatePath("/dashboard/attendance");
    revalidatePath("/dashboard/attendance/analytics");

    const getStudent = (studentId: string) => section.students.find((s) => s.id === studentId);
    const studentName = (studentId: string) => {
        const s = getStudent(studentId);
        return s ? `${s.firstName} ${s.lastName}`.trim() : "Student";
    };

    // ── 3. Notification Promises (Leave-Aware) ──────────────────────────────────
    const absentRecords = attendanceRecords.filter((r) => r.status === "ABSENT");
    const lateRecords = attendanceRecords.filter((r) => r.status === "LATE");

    const notificationPromises = [];

    // Current time for late arrival display
    const submissionTime = new Date();

    for (const record of absentRecords) {
        const student = getStudent(record.studentId);
        if (student?.userId && onLeaveUserIds.has(student.userId)) {
            console.log(`[ATTENDANCE] Skipping notification for ${studentName(record.studentId)}: Approved Leave active.`);
            continue;
        }

        notificationPromises.push(
            notify.attendance.absent({
                attendanceId: record.id,
                recipients: [{ studentId: record.studentId }],
                variables: {
                    studentName: studentName(record.studentId),
                    date: date,
                    time: formatTimeIN(submissionTime), // Use actual marking time
                    grade: section.grade.grade,
                    section: section.name,
                },
            }).then(result => ({ templateId: "STUDENT_ABSENT", ...result }))
        );
    }

    for (const record of lateRecords) {
        notificationPromises.push(
            notify.attendance.late({
                attendanceId: record.id,
                recipients: [{ studentId: record.studentId }],
                variables: {
                    studentName: studentName(record.studentId),
                    date: date,
                    arrivalTime: formatTimeIN(submissionTime), // Use actual marking time
                    grade: section.grade.grade,
                    section: section.name,
                },
            }).then(result => ({ templateId: "STUDENT_LATE", ...result }))
        );
    }

    // Send all notifications in parallel (don't await individually to prevent timeouts)
    const results = await Promise.allSettled(notificationPromises);
    const notifyResults = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .map(r => r.value);

    return {
        success: true,
        message: "Attendance marked successfully",
        recordsUpdated: records.length,
        totalNotifications: notificationPromises.length,
        sentNotifications: notifyResults.length,
        notifyResults
    };
}