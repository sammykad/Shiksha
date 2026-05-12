import { getActiveAcademicYearId, getCurrentAcademicYearId } from '@/lib/academicYear';
import basePrisma from './prisma-base';
import { errorExtension } from './prisma-error-extension';

// Models that MUST be scoped to an academic year
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
  // 'Exam',
  // 'ExamEnrollment',
  // 'ExamResult',
  // 'HallTicket',
  // 'ReportCard',
]);

const prisma = basePrisma.$extends({
  name: 'withAcademicYear',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }: any) {
        if (!model || !YEAR_SCOPED_MODELS.has(model)) {
          return query(args);
        }

        // --- READ OPERATIONS: Scope to Active Year (Cookie) ---
        if ([
          'findMany', 'findFirst', 'findFirstOrThrow',
          'count', 'aggregate', 'groupBy'
        ].includes(operation)) {
          const academicYearId = await getActiveAcademicYearId();
          args.where = { ...args.where, academicYearId };
          return query(args);
        }

        // --- WRITE OPERATIONS: Force to Current Year (Live) ---
        if (['create', 'createMany', 'upsert', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
          const academicYearId = await getCurrentAcademicYearId();

          if (operation === 'create') {
            args.data = { ...args.data, academicYearId: args.data.academicYearId ?? academicYearId };
          } else if (operation === 'createMany') {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: any) => ({
                ...item,
                academicYearId: item.academicYearId ?? academicYearId,
              }));
            }
          } else if (operation === 'upsert') {
            args.where = { ...args.where, academicYearId };
            args.create = { ...args.create, academicYearId: args.create.academicYearId ?? academicYearId };
          } else {
            // updates - only allow updates within the current year to be safe
            args.where = { ...args.where, academicYearId };
          }

          return query(args);
        }

        return query(args);
      }
    }
  }
}).$extends(errorExtension)

export default prisma;

/**
 * For bypassing the year scope (e.g., cross-year reports)
 */
export const adminPrisma = basePrisma;
