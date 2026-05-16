
import AdminDashboard from '@/components/dashboard/admin/AdminDashboard';
import ParentDashboard from '@/components/dashboard/parent/parent-dashboard';
import StudentDashboard from '@/components/dashboard/Student/StudentDashboard';
import TeacherDashboard from '@/components/dashboard/teacher/TeacherDashboard';
import { auth } from '@/lib/auth';
export default async function DashboardPage() {
  const { orgRole } = await auth()

  switch (orgRole) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'PARENT':
      return <ParentDashboard />;
    case 'STUDENT':
      return <StudentDashboard />; // Or show a fallback/unauthorized page
  }
}
