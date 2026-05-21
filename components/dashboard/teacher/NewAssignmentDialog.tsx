'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  CreateAssignmentModal,
  type AcademicYear,
  type Teacher,
  type Subject,
  type Grade,
  type Section,
  type ExistingAssignment,
} from './CreateAssignmentModal';

interface Props {
  academicYears: AcademicYear[];
  teachers: Teacher[];
  subjects: Subject[];
  grades: Grade[];
  sections: Section[];
  existingAssignments: ExistingAssignment[];
  onSubmit: (
    data: any
  ) => Promise<{ success?: boolean; error?: string; message?: string } | void>;
}

export function NewAssignmentDialog({
  academicYears,
  teachers,
  subjects,
  grades,
  sections,
  existingAssignments,
  onSubmit,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <CreateAssignmentModal
          academicYears={academicYears}
          teachers={teachers}
          subjects={subjects}
          grades={grades}
          sections={sections}
          existingAssignments={existingAssignments}
          onSubmit={onSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
