import { NextResponse } from 'next/server';
import { getOrganizationId } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { gradeId } = await params;

  try {
    if (!gradeId) {
      return NextResponse.json(
        { error: 'Grade ID is required' },
        { status: 400 }
      );
    }

    const organizationId = await getOrganizationId();


    const sections = await prisma.section.findMany({
      where: {
        organizationId,
        gradeId: gradeId,
      },
      include: {
        students: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}
