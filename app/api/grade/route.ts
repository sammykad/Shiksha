import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import { getOrganizationId } from '@/lib/auth';
import { sortByNaturalText } from '@/lib/utils';

export async function GET() {
  noStore();
  try {
    const organizationId = await getOrganizationId();

    // Fetch all grades for the organization
    const grades = await prisma.grade.findMany({
      where: {
        organizationId,
      },
      include: {
        section: true,
        students: true,
      },
    });

    // Return the grades as a JSON response
    return NextResponse.json(sortByNaturalText(grades, (grade) => grade.grade));
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}
