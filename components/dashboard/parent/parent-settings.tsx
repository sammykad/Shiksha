import { PageHeader } from '@/components/ui/page-header';
import { ParentProfileEditForm } from './parent-profile-edit-form';
import prisma from '@/lib/db';
import { getCurrentUserByRole } from '@/lib/auth';
import { Settings } from 'lucide-react';

async function getParentProfile() {
  const userRole = await getCurrentUserByRole();

  if (userRole.role !== 'PARENT') return null;

  const parent = await prisma.parent.findUnique({
    where: { id: userRole.parentId },
    include: { user: true },
  });

  if (!parent) return null;

  return {
    id: parent.id,
    firstName: parent.firstName,
    lastName: parent.lastName,
    email: parent.email,
    phoneNumber: parent.phoneNumber,
    whatsAppNumber: parent.whatsAppNumber,
    profileImage: parent.user?.profileImage,
  };
}

export default async function ParentSettings() {
  const currentUser = await getCurrentUserByRole();

  if (currentUser.role !== 'PARENT') {
    return (
      <div className="p-8 text-center text-destructive font-semibold text-lg">
        Only parents can access this page.
      </div>
    );
  }

  const parent = await getParentProfile();

  if (!parent) {
    return (
      <div className="p-8 text-center text-destructive font-semibold text-lg">
        Parent profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences."
        icon={Settings}
      />
      <ParentProfileEditForm parent={parent} />
    </div>
  );
}
