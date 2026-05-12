import { Plus, School } from 'lucide-react';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/ui/page-header';
import { AddTeacherForm } from '@/components/dashboard/teacher/AddTeacherForm';
import { TeacherManagementStatsCards } from '@/components/dashboard/teacher/TeacherManagementStatsCards';
import TeachersTable from '@/components/dashboard/teacher/TeachersTable';
import {
  DashboardFourGridsCardSkeleton,
  TableSkeleton,
} from '@/components/skeletons/DashboardCardSkeleton';
import { getAllTeachers } from '@/lib/data/teacher/get-all-teachers';
import { getAllStaff } from '@/lib/data/teacher/get-all-staff';


export default async function TeachersPage() {
  const teachers = await getAllTeachers();
  const staff = await getAllStaff();

  return (
    <div className="flex-1 space-y-4 px-2">
      <PageHeader
        title="Teachers"
        description="Manage your teaching staff and their assignments"
        icon={School}
        actions={
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Teacher
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Teacher</DialogTitle>
                  <DialogDescription>
                    Create a new teacher profile with all necessary information.
                  </DialogDescription>
                </DialogHeader>
                <AddTeacherForm />
              </DialogContent>
            </Dialog>
          </>

        }
      />
      <Suspense fallback={<DashboardFourGridsCardSkeleton />}>
        <TeacherManagementStatsCards teachers={teachers} />
      </Suspense>

      <Suspense
        fallback={
          <TableSkeleton
            columns={7}
            rows={6}
            hasAvatar={true}
            hasActions={true}
            searchBar={true}
            filters={2}
          />
        }
      >
        <TeachersTable teachers={teachers} staff={staff} />
      </Suspense>
    </div>
  );
}