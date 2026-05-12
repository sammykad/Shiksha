'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Trash2, Loader2, CheckCircle2, XCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { manageClassTeacher } from '@/lib/data/class-management/ClassTeacherManagement';

// Validation Schema
const classTeacherSchema = z.object({
  teacherId: z.string().min(1, 'Please select a teacher'),
  action: z.enum(['assign', 'remove']),
});

type ClassTeacherFormData = z.infer<typeof classTeacherSchema>;

interface Section {
  id: string;
  name: string;
  grade: {
    grade: string;
  };
}

interface Teacher {
  id: string;
  employeeCode: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  sections: Section[];
}

interface ManageClassTeacherProps {
  sectionId: string;
  currentTeacherId: string | null;
  teachers: Teacher[];
  sectionName: string;
  gradeName: string;
}

export function ManageClassTeacher({
  sectionId,
  currentTeacherId,
  teachers,
  sectionName,
  gradeName,
}: ManageClassTeacherProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const form = useForm<ClassTeacherFormData>({
    resolver: zodResolver(classTeacherSchema),
    defaultValues: {
      teacherId: currentTeacherId || '',
      action: 'assign',
    },
  });

  const selectedAction = form.watch('action');
  const selectedTeacherId = form.watch('teacherId');

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      form.reset({
        teacherId: currentTeacherId || '',
        action: 'assign',
      });
      setResult(null);
    }
  };

  const onSubmit = (values: ClassTeacherFormData) => {
    startTransition(async () => {
      setResult(null);

      const response = await manageClassTeacher({
        sectionId,
        teacherId: values.action === 'assign' ? values.teacherId : null,
        action: values.action,
      });

      setResult(response);

      if (response.success) {
        setTimeout(() => {
          setOpen(false);
          setResult(null);
        }, 1500);
      }
    });
  };

  const currentTeacher = teachers.find((t) => t.id === currentTeacherId);
  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  // Get sections excluding the current one
  const getOtherSections = (sections: Section[]) => {
    return sections.filter((s) => s.id !== sectionId);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={currentTeacherId ? 'outline' : 'default'}
          size="sm"
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {currentTeacherId ? 'Change Class Teacher' : 'Assign Class Teacher'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Class Teacher</DialogTitle>
          <DialogDescription className="space-y-1">
            <span className="block font-medium text-slate-900 dark:text-slate-100">
              {gradeName} - {sectionName}
            </span>
            {currentTeacher && (
              <span className="block text-sm">
                Current Class Teacher:{' '}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {currentTeacher.user.firstName} {currentTeacher.user.lastName}
                </span>
                {currentTeacher.employeeCode && (
                  <span className="text-slate-500">
                    {' '}({currentTeacher.employeeCode})
                  </span>
                )}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="assign">
                        {currentTeacherId ? 'Change Class Teacher' : 'Assign Class Teacher'}
                      </SelectItem>
                      {currentTeacherId && (
                        <SelectItem value="remove">Remove Class Teacher</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedAction === 'assign' && (
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Teacher</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a teacher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachers.length === 0 ? (
                          <div className="p-3 text-sm text-slate-500 text-center">
                            No active teachers available
                          </div>
                        ) : (
                          teachers.map((teacher) => {
                            const otherSections = getOtherSections(teacher.sections || []);
                            const isCurrentTeacher = teacher.id === currentTeacherId;

                            return (
                              <SelectItem
                                key={teacher.id}
                                value={teacher.id}
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center text-start space-x-3">
                                    {teacher.user.firstName} {teacher.user.lastName}
                                    {teacher.employeeCode && (
                                      <span className="text-xs text-slate-500 ml-2">
                                        ({teacher.employeeCode})
                                      </span>
                                    )}
                                    {isCurrentTeacher && (
                                      <Badge variant="secondary" className="text-xs">
                                        Current
                                      </Badge>
                                    )}
                                  </div>

                                  {otherSections.length > 0 && (
                                    <div className="flex items-start gap-1 text-start">
                                      <span className="text-xs text-slate-600 dark:text-slate-400">
                                        Also class teacher of:{' '}
                                        {otherSections.map((s, idx) => (
                                          <span key={s.id}>
                                            {s.grade.grade}-{s.name}
                                            {idx < otherSections.length - 1 && ', '}
                                          </span>
                                        ))}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Teachers can be assigned as class teacher to multiple sections
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Show selected teacher's sections */}
            {selectedAction === 'assign' && selectedTeacher && selectedTeacher.sections.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Current Assignments for {selectedTeacher.user.firstName} {selectedTeacher.user.lastName}
                </h4>
                <div className="space-y-1">
                  {selectedTeacher.sections.map((section) => (
                    <div
                      key={section.id}
                      className={`text-sm px-2 py-1 rounded ${section.id === sectionId
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      • {section.grade.grade} - {section.name}
                      {section.id === sectionId && ' (This section)'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAction === 'remove' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  This will remove the class teacher assignment from{' '}
                  <strong>{gradeName} - {sectionName}</strong>. Are you sure?
                </AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert
                variant={result.success ? 'default' : 'destructive'}
                className={
                  result.success
                    ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200'
                    : ''
                }
              >
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{result.message || result.error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter
              className='gap-2'
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  (selectedAction === 'assign' && !form.watch('teacherId'))
                }
                variant={selectedAction === 'remove' ? 'destructive' : 'default'}
                className="gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : selectedAction === 'remove' ? (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {currentTeacherId ? 'Update' : 'Assign'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}