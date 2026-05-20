// prisma-error-extension.ts
import { Prisma } from '@/generated/prisma/client'

/**
 * Maps are keyed by the RELATION FIELD NAME as Prisma reports it,
 * not the DB constraint name. On PostgreSQL with driver adapters,
 * e.meta.field_name is the relation field name (e.g. "grade", "section")
 * or the FK column name (e.g. "gradeId"). We handle both.
 *
 * IMPORTANT: field_name can also be:
 *   - "(not available)"  → batch ops like createMany
 *   - "foreign key"      → some DB adapters/versions
 *   - undefined          → non-FK errors
 *
 * We fall back gracefully in all cases.
 */
const FK_LABELS: Record<string, string> = {
    // Relation field name variants (what Prisma 5+ reports on PostgreSQL)
    gradeId: 'items are linked to this grade',
    sectionId: 'items are linked to this section',
    subjectId: 'items are linked to this subject',
    examSessionId: 'exams exist in this session',
    academicYearId: 'records are tied to this academic year',
    examId: 'results or enrollments exist for this exam',

    // Full constraint name variants (older Prisma / MySQL)
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

/**
 * A typed, structured error that preserves the original cause
 * and is distinguishable via instanceof.
 */
export class PrismaUserError extends Error {
    public readonly prismaCode: string
    public readonly fieldName: string | undefined
    public readonly blockedBy: string | undefined
    public readonly modelName: string
    public readonly userMessage: string

    constructor(opts: {
        prismaCode: string
        fieldName?: string
        blockedBy?: string
        modelName: string
        userMessage: string
        cause: Error
    }) {
        super(opts.userMessage, { cause: opts.cause })
        this.name = 'PrismaUserError'
        this.prismaCode = opts.prismaCode
        this.fieldName = opts.fieldName
        this.blockedBy = opts.blockedBy
        this.modelName = opts.modelName
        this.userMessage = opts.userMessage
    }
}

/**
 * Resolves a human-readable label from field_name.
 * Handles the known garbage values Prisma emits.
 */
function resolveBlockedBy(fieldName: string | undefined): string | undefined {
    if (
        !fieldName ||
        fieldName === 'foreign key' ||      // SQLite / some adapters
        fieldName === '(not available)'     // createMany / batch ops
    ) {
        return undefined
    }
    return FK_LABELS[fieldName]
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
                        throw new PrismaUserError({
                            prismaCode: e.code,
                            fieldName,
                            blockedBy: resolveBlockedBy(fieldName),
                            modelName: model,
                            userMessage: PRISMA_MESSAGES[e.code] ?? 'A database error occurred.',
                            cause: e,          // ← preserves original stack and context
                        })
                    }
                    throw e
                }
            },
        },
    },
})