import { getActiveAcademicYearId } from '@/lib/academicYear';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { eachDayOfInterval } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { IST } from '@/lib/utils';
import { getOrganizationWeekendDays } from '@/lib/data/organization/get-organization-weekend-days';

export const getAcademicYearSummary = async () => {
  const organizationId = await getOrganizationId();
  const academicYearId = await getActiveAcademicYearId();
  const weekendDays = await getOrganizationWeekendDays();

  // ✅ Fetch academic year start and end dates
  const academicYear = await prisma.academicYear.findUnique({
    where: { id: academicYearId, organizationId },
    select: { startDate: true, endDate: true },
  });

  if (!academicYear) throw new Error('Academic year not found');

  const { startDate, endDate } = academicYear;

  // ✅ Fetch holidays for that academic year
  const holidays = await prisma.academicCalendar.findMany({
    where: {
      organizationId,
      academicYearId,
    },
    select: {
      startDate: true,
      endDate: true,
    },
  });



  // ✅ All dates in academic year
  const allDates = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });
  const totalDays = allDates.length;

  // ✅ Count weekends (using IST timezone)
  const weekendDates = allDates.filter(
    (date) => weekendDays.includes(toZonedTime(date, IST).getDay())
  );
  const totalWeekendDays = weekendDates.length;

  // ✅ Flatten holidays into individual dates
  const holidayDates = new Set<string>();
  for (const holiday of holidays) {
    const range = eachDayOfInterval({
      start: new Date(holiday.startDate),
      end: new Date(holiday.endDate),
    });
    range.forEach((d) => holidayDates.add(d.toDateString()));
  }
  const totalHolidays = holidayDates.size;

  // ✅ Remove double-counted weekend+holiday dates
  const overlappingHolidayWeekends = weekendDates.filter((date) =>
    holidayDates.has(date.toDateString())
  ).length;

  // ✅ Final working day calculation
  const totalWorkingDays =
    totalDays - totalWeekendDays - totalHolidays + overlappingHolidayWeekends;

  return {
    startDate,
    endDate,
    totalDays,
    totalWorkingDays,
    totalHolidays,
    totalWeekendDays,
  };
};
