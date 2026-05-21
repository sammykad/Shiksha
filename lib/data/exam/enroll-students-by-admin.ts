"use server";

import { StudentExamStatus } from "@/generated/prisma/enums";
import { getCurrentUserByRole, getOrganizationId } from "@/lib/auth";
import prisma from "@/lib/db";
import { getCurrentUserId } from "@/lib/user";
import { revalidatePath } from "next/cache";

export async function enrollStudentsInExam(
    examId: string,
    studentIds: string[]
) {
    // Verify authorization
    const currentUser = await getCurrentUserByRole();
    if (!currentUser || !["ADMIN", "TEACHER"].includes(currentUser.role)) {
        throw new Error("Unauthorized: Admin or Teacher role required");
    }
    const userId = await getCurrentUserId();

    // Verify exam exists and belongs to current organization
    const organizationId = await getOrganizationId();
    const exam = await prisma.exam.findFirst({
        where: { id: examId, organizationId },
        select: { id: true }
    });

    if (!exam) {
        return { error: `Exam not found with ID: ${examId}` };
    }

    // Filter out already enrolled students
    const existingEnrollments = await prisma.examEnrollment.findMany({
        where: {
            examId,
            studentId: { in: studentIds },
        },
        select: { studentId: true }
    });

    const alreadyEnrolledIds = new Set(
        existingEnrollments.map((e) => e.studentId)
    );
    const studentsToEnroll = studentIds.filter(
        (id) => !alreadyEnrolledIds.has(id)
    );

    if (studentsToEnroll.length === 0) {
        return { error: "All students are already enrolled in this exam" };
    }

    await prisma.examEnrollment.createMany({
        data: studentsToEnroll.map((studentId) => ({
            studentId,
            examId,
            status: StudentExamStatus.ENROLLED,
            enrolledBy: userId,
        })),
    });

    revalidatePath("/admin/exams");
    revalidatePath(`/dashboard/exams/${examId}`);

    return {
        success: true,
        message: `Successfully enrolled ${studentsToEnroll.length} student(s)`,
        enrolled: studentsToEnroll.length,
        skipped: alreadyEnrolledIds.size,
    };
}