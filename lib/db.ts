// prisma-client.ts
import { getActiveAcademicYearId, getCurrentAcademicYearId } from '@/lib/academicYear'
import basePrisma from './prisma-base'
import { errorExtension } from './prisma-error-extension'

const YEAR_SCOPED_MODELS = new Set([
  'Fee',
  'TeachingAssignment',
  'StudentAttendance',
  'AcademicCalendar',
  'Notice',
  'AnonymousComplaint',
  'Leave',
  'Lead',
  'ExamSession',
  'ReportCard',
  'Certificate',
])

const READ_OPS = new Set([
  'findMany', 'findFirst', 'findFirstOrThrow',
  'count', 'aggregate', 'groupBy',
])

const WRITE_OPS = new Set([
  'create', 'createMany', 'upsert',
  'update', 'updateMany', 'delete', 'deleteMany',
])

const prisma = basePrisma
  .$extends(errorExtension)           // outermost: catches errors from everything below
  .$extends({
    name: 'withAcademicYear',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !YEAR_SCOPED_MODELS.has(model)) {
            return query(args)
          }

          if (READ_OPS.has(operation)) {
            // If caller already set a complex academicYearId filter (e.g. { in: [...] }),
            // respect it instead of overriding — needed for multi-org queries
            if ((args as Record<string, unknown>).where !== undefined &&
              (args as Record<string, Record<string, unknown>>).where?.academicYearId !== undefined) {
              return query(args)
            }
            const academicYearId = await getActiveAcademicYearId()
              ; (args as Record<string, unknown>).where = {
                ...(args as Record<string, unknown>).where as object,
                academicYearId,
              }
            return query(args)
          }

          if (WRITE_OPS.has(operation)) {
            const academicYearId = await getCurrentAcademicYearId()

            if (operation === 'create') {
              const data = (args as Record<string, Record<string, unknown>>).data
                ; (args as Record<string, unknown>).data = {
                  ...data,
                  academicYearId: data?.academicYearId ?? academicYearId,
                }
            } else if (operation === 'createMany') {
              const data = (args as Record<string, unknown>).data
              if (Array.isArray(data)) {
                ; (args as Record<string, unknown>).data = data.map(
                  (item: Record<string, unknown>) => ({
                    ...item,
                    academicYearId: item.academicYearId ?? academicYearId,
                  })
                )
              }
            } else if (operation === 'upsert') {
              const a = args as Record<string, Record<string, unknown>>
              a.where = { ...a.where, academicYearId }
              a.create = {
                ...a.create,
                academicYearId: a.create?.academicYearId ?? academicYearId,
              }
              a.update = {
                ...a.update,
                academicYearId: a.update?.academicYearId ?? academicYearId,
              }
            } else {
              // update / updateMany / delete / deleteMany
              ; (args as Record<string, unknown>).where = {
                ...(args as Record<string, unknown>).where as object,
                academicYearId,
              }
            }

            return query(args)
          }

          return query(args)
        },
      },
    },
  })

export default prisma

export const adminPrisma = basePrisma