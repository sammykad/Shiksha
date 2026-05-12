// components/leads/assign-lead-dialog.tsx
'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Loader2, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AssignLeadFormData, assignLeadSchema } from '@/lib/schemas';
import {
  assignLead,
  getAvailableUsersForLeads,
  unassignLead,
} from '@/lib/data/leads/assign-lead';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
  role: string;
}

interface AssignedUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
}

interface AssignLeadDialogProps {
  leadId: string;
  currentAssignedTo?: AssignedUser | null;
  onAssignmentChange?: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserOption({ user }: { user: TeamMember }) {
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-6 h-6">
        <AvatarImage src={user.profileImage ?? ''} className="object-cover" />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <span>
        {user.firstName} {user.lastName}
      </span>
      <Badge variant="outline" className="ml-auto text-xs">
        {user.role}
      </Badge>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AssignLeadDialog({
  leadId,
  currentAssignedTo,
  onAssignmentChange,
}: AssignLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // useTransition: keeps UI responsive during non-urgent async state updates
  const [isAssigning, startAssignTransition] = useTransition();
  const [isUnassigning, startUnassignTransition] = useTransition();

  const isPending = isAssigning || isUnassigning;

  const form = useForm<AssignLeadFormData>({
    resolver: zodResolver(assignLeadSchema),
    defaultValues: {
      leadId,
      assignedToUserId: currentAssignedTo?.id ?? '',
    },
  });

  const selectedUserId = form.watch('assignedToUserId');

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const result = await getAvailableUsersForLeads();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        toast.error('Failed to load team members');
      }
    } catch {
      toast.error('Failed to load team members');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchUsers();
  }, [open, fetchUsers]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    setOpen(false);
    form.reset();
  }, [form]);

  const onSubmit = useCallback(
    (data: AssignLeadFormData) => {
      startAssignTransition(async () => {
        const toastId = toast.loading('Assigning lead…');
        try {
          const result = await assignLead(data);
          if (result?.error) {
            toast.error('Failed to assign lead', {
              id: toastId,
              description: result.error,
            });
            return;
          }
          toast.success('Lead assigned successfully', { id: toastId });
          handleClose();
          onAssignmentChange?.();
        } catch {
          toast.error('Failed to assign lead', {
            id: toastId,
            description: 'An unexpected error occurred',
          });
        }
      });
    },
    [handleClose, onAssignmentChange],
  );

  const handleUnassign = useCallback(() => {
    startUnassignTransition(async () => {
      const toastId = toast.loading('Unassigning lead…');
      try {
        const result = await unassignLead(leadId);
        if (result?.error) {
          toast.error('Failed to unassign lead', {
            id: toastId,
            description: result.error,
          });
          return;
        }
        toast.success('Lead unassigned successfully', { id: toastId });
        handleClose();
        onAssignmentChange?.();
      } catch {
        toast.error('Failed to unassign lead', {
          id: toastId,
          description: 'An unexpected error occurred',
        });
      }
    });
  }, [leadId, handleClose, onAssignmentChange]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const dialogTitle = currentAssignedTo ? 'Reassign Lead' : 'Assign Lead';
  const dialogDescription = currentAssignedTo
    ? `Currently assigned to ${currentAssignedTo.firstName} ${currentAssignedTo.lastName}`
    : 'Assign this lead to a team member';

  const triggerLabel = currentAssignedTo ? 'Reassign' : 'Assign';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignedToUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={usersLoading || isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {usersLoading ? (
                        <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading team members…
                        </div>
                      ) : users.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          No team members available
                        </div>
                      ) : (
                        users.map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id}
                            className="cursor-pointer"
                          >
                            <UserOption user={user} />
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Actions ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-2 pt-1">
              {/* Unassign (only when currently assigned) */}
              {currentAssignedTo && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUnassign}
                  disabled={isPending}
                  className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  {isUnassigning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserX className="w-4 h-4" />
                  )}
                  Unassign
                </Button>
              )}

              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || !selectedUserId}
                  className="gap-2"
                >
                  {isAssigning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  {isAssigning ? 'Assigning…' : 'Assign Lead'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}