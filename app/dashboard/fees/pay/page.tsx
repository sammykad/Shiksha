import { redirect } from 'next/navigation';
import { getCurrentUserByRole } from '@/lib/auth';

const FEE_ROUTES: Record<string, string> = {
  STUDENT: '/dashboard/fees/student',
  PARENT: '/dashboard/fees/parent',
  ADMIN: '/dashboard/fees/admin',
  TEACHER: '/dashboard/fees/teacher',
};

export default async function FeePaymentRedirectPage() {
  const { role } = await getCurrentUserByRole();
  redirect(FEE_ROUTES[role] ?? '/dashboard');
}
