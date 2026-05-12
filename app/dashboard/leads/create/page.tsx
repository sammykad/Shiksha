import { CreateLeadForm } from '@/components/dashboard/leads/create-lead-form';
import { getCurrentAcademicYearId } from '@/lib/academicYear';
import { getCurrentUserByRole } from '@/lib/auth';
import { getOrganizationId } from '@/lib/organization';
import { redirect } from 'next/navigation';

const page = async () => {
  const { role } = await getCurrentUserByRole();

  if (role !== 'ADMIN' && role !== 'TEACHER') {
    redirect('/dashboard');
  }

  const organizationId = await getOrganizationId();
  const academicYearId = await getCurrentAcademicYearId();
  return (
    <CreateLeadForm
      organizationId={organizationId}
      academicYearId={academicYearId}
    />
  );
};

export default page;
