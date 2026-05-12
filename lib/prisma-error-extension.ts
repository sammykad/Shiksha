// prisma-error-extension.ts
import { Prisma } from '@/generated/prisma/client'

const FK_LABELS: Record<string, string> = {
    Exam_gradeId_fkey: 'Exams are linked to this grade',
    Section_gradeId_fkey: 'Sections belong to this grade',
    Student_gradeId_fkey: 'Students are enrolled in this grade',
    Student_sectionId_fkey: 'Students are in this section',
    TeachingAssignment_gradeId_fkey: 'Teaching assignments use this grade',
    TeachingAssignment_sectionId_fkey: 'Teaching assignments use this section',
    TeachingAssignment_subjectId_fkey: 'Teaching assignments use this subject',
    Exam_examSessionId_fkey: 'Exams exist in this session',
    Fee_academicYearId_fkey: 'Fees are tied to this academic year',
    Notice_academicYearId_fkey: 'Notices are tied to this academic year',
    ExamResult_examId_fkey: 'Results exist for this exam',
    ExamEnrollment_examId_fkey: 'Students are enrolled in this exam',
}

const PRISMA_MESSAGES: Record<string, string> = {
    P2003: 'This item is linked to other records and cannot be deleted.',
    P2002: 'A record with this value already exists.',
    P2025: 'This record no longer exists.',
    P2014: 'This action would break a required relationship.',
}

export const errorExtension = Prisma.defineExtension({
    name: 'error-transformer',
    query: {
        $allModels: {
            async $allOperations({ args, query, model }: { args: any; query: any; model: string }) {
                try {
                    return await query(args)
                } catch (e) {
                    if (e instanceof Prisma.PrismaClientKnownRequestError) {
                        const fieldName = e.meta?.field_name as string | undefined
                        throw new Error(JSON.stringify({
                            prismaCode: e.code,
                            fieldName,
                            blockedBy: fieldName ? FK_LABELS[fieldName] : undefined,
                            modelName: model, // ← use the model from context, not meta
                            userMessage: PRISMA_MESSAGES[e.code] ?? 'A database error occurred.',
                        }))
                    }
                    throw e
                }
            },
        },
    },
})
