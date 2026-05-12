import { Suspense } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { SubjectsTable } from '@/components/dashboard/subject/SubjectsTable';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { getAllSubjectsByOrganizationId } from '@/lib/data/subjects/get-all-subjects-by-organization-id';
import { AddSubjectFormModal } from '@/components/dashboard/subject/AddSubjectFormModal';

export default async function SubjectsPage() {
  const subjects = await getAllSubjectsByOrganizationId();

  return (
    <div className="px-2 space-y-4">
      <PageHeader
        title="Subject Management"
        description="Manage subjects for your organization"
        icon={BookOpen}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-3.5 w-3.5" />
                Add Subject
              </Button>
            </DialogTrigger>
            <AddSubjectDialog subjects={subjects} />
          </Dialog>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={<div>Loading subjects...</div>}>
            <SubjectsTable initialSubjects={subjects} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function AddSubjectDialog({
  subjects,
}: {
  subjects: Awaited<ReturnType<typeof getAllSubjectsByOrganizationId>>;
}) {
  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Subject</DialogTitle>
        <DialogDescription>
          Create a new subject with the required details.
        </DialogDescription>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto px-1">
        <AddSubjectFormModal subjects={subjects} />
      </div>
    </DialogContent>
  );
}
