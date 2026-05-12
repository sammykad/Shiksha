'use client';

import { useState, useTransition } from 'react';
import {
  Calendar,
  CircleAlertIcon,
  Edit,
  MoreHorizontal,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AcademicYearForm } from './AcademicYearForm';
import { deleteAcademicYear, setCurrentAcademicYear } from '@/app/actions';
import { AcademicYear } from '@/generated/prisma/client';

interface AcademicYearConfigProps {
  academicYears: AcademicYear[];
  organizationId: string;
}

const yearTypeColors = {
  ANNUAL: 'bg-blue-50 text-blue-700 border-blue-200',
  SEMESTER: 'bg-green-50 text-green-700 border-green-200',
  TRIMESTER: 'bg-purple-50 text-purple-700 border-purple-200',
  BATCH: 'bg-orange-50 text-orange-700 border-orange-200',
};

export function AcademicYearConfig({
  academicYears,
  organizationId,
}: AcademicYearConfigProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSetCurrent = (year: AcademicYear) => {
    startTransition(async () => {
      const result = await setCurrentAcademicYear(year.id);
      if (result.success) {
        toast.success('Current academic year updated');
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!yearToDelete) return;
    startTransition(async () => {
      const result = await deleteAcademicYear(yearToDelete.id);
      if (result.success) {
        toast.success('Academic year deleted');
        setDeleteDialogOpen(false);
        setYearToDelete(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  const sortedYears = [...academicYears].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  const isOnboarding = academicYears.length === 0;

  return (
    <div className="space-y-4">
      {!isOnboarding && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Academic Years
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your organization's academic years and sessions
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="sm:self-end">
                <Plus className="mr-2 h-4 w-4" />
                Add Year
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Academic Year</DialogTitle>
                <DialogDescription>
                  Add a new academic year for your organization
                </DialogDescription>
              </DialogHeader>
              <AcademicYearForm
                organizationId={organizationId}
                onSuccess={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isOnboarding ? (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No academic years yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Get started by creating your first academic year. This will unlock all features of the system.
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="mt-4">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Academic Year
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Academic Year</DialogTitle>
                <DialogDescription>
                  Add your first academic year to get started
                </DialogDescription>
              </DialogHeader>
              <AcademicYearForm
                organizationId={organizationId}
                onSuccess={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedYears.map((year) => (
            <div
              key={year.id}
              className={`group flex flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 transition-all hover:shadow-md ${year.isCurrent ? 'border-primary/50 bg-primary/[0.03] shadow-sm' : 'hover:bg-muted/30'
                }`}
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <h3 className="font-semibold text-sm">{year.name}</h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {year.isCurrent && (
                      <Badge variant="APPROVED" className="h-5 text-xs">
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        Current
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`${yearTypeColors[year.type]} h-5 text-xs`}
                    >
                      {year.type}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {format(year.startDate, 'MMM d, yyyy')} -{' '}
                    {format(year.endDate, 'MMM d, yyyy')}
                  </span>
                </p>
                {year.description && (
                  <p className="text-xs text-muted-foreground/80 italic">
                    {year.description}
                  </p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:self-start">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setEditingYear(year)}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {!year.isCurrent && (
                    <DropdownMenuItem
                      onClick={() => handleSetCurrent(year)}
                      disabled={isPending}
                      className="cursor-pointer"
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Set as Current
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setYearToDelete(year);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={year.isCurrent}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingYear} onOpenChange={() => setEditingYear(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Academic Year</DialogTitle>
            <DialogDescription>
              Update the academic year details
            </DialogDescription>
          </DialogHeader>
          {editingYear && (
            <AcademicYearForm
              organizationId={organizationId}
              academicYear={editingYear}
              onSuccess={() => setEditingYear(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10"
              aria-hidden="true"
            >
              <CircleAlertIcon className="text-destructive" size={20} />
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">
                Delete Academic Year
              </DialogTitle>
              <DialogDescription className="sm:text-center">
                Are you sure you want to delete "{yearToDelete?.name}"? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              className="flex-1"
              onClick={handleDelete}
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}