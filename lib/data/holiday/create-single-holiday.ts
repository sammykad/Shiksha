'use server';

import { getCurrentAcademicYearId } from '@/lib/academicYear';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { singleHolidayFormSchema } from '@/lib/schemas';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { notify } from '@/lib/notifications/notify';
import { CalendarEventType } from '@/generated/prisma/enums';
import { formatInIST } from '@/lib/utils';

export const createSingleHolidayAction = async (
  data: z.infer<typeof singleHolidayFormSchema>
) => {
  const validateData = singleHolidayFormSchema.parse(data);

  const user = await currentUser();
  const organizationId = await getOrganizationId();
  const academicYearId = await getCurrentAcademicYearId();

  const holiday = await prisma.academicCalendar.create({
    data: {
      name: validateData.name,
      startDate: validateData.startDate,
      endDate: validateData.endDate,
      type: validateData.type,
      reason: validateData.reason,
      organizationId: organizationId,
      isRecurring: validateData.isRecurring,
      createdBy: `${user?.firstName} ${user?.lastName}` || "Unknown",
      createdAt: new Date(),
      academicYearId,
    },
  });

  // ─── NOTIFICATION ──────────────────────────────────────────────────────────
  const users = await prisma.user.findMany({
    where: { organizationId, isActive: true },
    select: { id: true }
  });

  if (users.length > 0) {
    // Use user's style: formatInIST for pretty display
    const startStr = formatInIST(validateData.startDate, 'PPP');
    const endStr = formatInIST(validateData.endDate, 'PPP');
    const dateStr = startStr === endStr ? startStr : `${startStr} to ${endStr}`;

    if (validateData.type === CalendarEventType.EMERGENCY) {
      await notify.holiday.emergency({
        holidayId: holiday.id,
        organizationId,
        academicYearId,
        recipients: users.map(u => ({ userId: u.id })),
        variables: {
          holidayName: validateData.name,
          date: dateStr,
          reason: validateData.reason ?? 'Emergency Holiday',
          isEmergency: true,
        },
      });
    }
  }

  revalidatePath('/dashboard/holiday');
};
