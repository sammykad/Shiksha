import { SelectedChildProvider } from '@/context/SelectedChildContext';
import { getSelectedChildId, getChildrenForParent } from '@/lib/data/parent/selected-child';

interface RoleLayoutWrapperProps {
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  userId: string;
  children: React.ReactNode;
}

export default async function RoleLayoutWrapper({
  role,
  userId,
  children,
}: RoleLayoutWrapperProps) {
  if (role === 'PARENT') {
    const [selectedChildId, childList] = await Promise.all([
      getSelectedChildId(),
      getChildrenForParent(userId),
    ]);

    return (
      <SelectedChildProvider initialChildId={selectedChildId} childList={childList}>
        {children}
      </SelectedChildProvider>
    );
  }

  // ADMIN, TEACHER, STUDENT — no parent code, no parent DB queries
  return <>{children}</>;
}