import AdminSettings from '@/components/dashboard/admin/settings/AdminSettings';
import ParentSettings from '@/components/dashboard/parent/parent-settings';
import StudentSettings from '@/components/dashboard/Student/StudentSettings';
import TeacherSettings from '@/components/dashboard/teacher/TeacherSettings';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SettingPage() {
  const { orgRole } = await auth({
    returnUrl: '/dashboard/settings',
  });

  switch (orgRole) {
    case 'ADMIN':
      return <AdminSettings />;
    case 'TEACHER':
      return <TeacherSettings />;
    case 'PARENT':
      return <ParentSettings />;
    case 'STUDENT':
      return <StudentSettings />;
    default:
      redirect('/'); // Or show a fallback/unauthorized page
  }
}
