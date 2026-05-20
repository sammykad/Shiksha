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
        async $allOperations({ model, operation, args, query }: any) {
          if (!model || !YEAR_SCOPED_MODELS.has(model)) {
            return query(args)
          }

          if (READ_OPS.has(operation)) {
            const academicYearId = await getActiveAcademicYearId()
            args.where = { ...args.where, academicYearId }
            return query(args)
          }

          if (WRITE_OPS.has(operation)) {
            const academicYearId = await getCurrentAcademicYearId()

            if (operation === 'create') {
              args.data = {
                ...args.data,
                academicYearId: args.data.academicYearId ?? academicYearId,
              }
            } else if (operation === 'createMany') {
              if (Array.isArray(args.data)) {
                args.data = args.data.map((item: any) => ({
                  ...item,
                  academicYearId: item.academicYearId ?? academicYearId,
                }))
              }
            } else if (operation === 'upsert') {
              args.where = { ...args.where, academicYearId }
              args.create = {
                ...args.create,
                academicYearId: args.create?.academicYearId ?? academicYearId,
              }
              args.update = {                          // ← was missing
                ...args.update,
                academicYearId: args.update?.academicYearId ?? academicYearId,
              }
            } else {
              // update / updateMany / delete / deleteMany — scope to current year
              args.where = { ...args.where, academicYearId }
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