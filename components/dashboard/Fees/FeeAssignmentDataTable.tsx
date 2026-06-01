'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { memo, useCallback, useMemo, useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
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
import { format } from 'date-fns';
import {
  CalendarIcon,
  CreditCard,
  IndianRupee,
  Info,
  Plus,
  Users,
  Search,
  GraduationCap,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, formatCurrencyIN, formatDateIN } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { feeAssignmentSchema } from '@/lib/schemas';
import { toast } from 'sonner';
import Link from 'next/link';
import { AssignFeeToStudents } from '@/lib/data/fee/FeeAssignmentAction';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Calendar } from '@/components/ui/calendar';
import { FeeStatus } from '@/generated/prisma/enums';
import { useTerminology } from '@/context/terminology';

type FeeCategory = {
  id: string;
  name: string;
  description?: string | null;
};

type StudentFeeRow = {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  profileImage?: string | null;
  organizationId: string;
  grade: {
    id: string;
    grade: string;
  };
  section: {
    id: string;
    gradeId: string;
    organizationId: string;
    name: string;
  };
  Fee: {
    id: string;
    totalFee: number;
    paidAmount: number;
    pendingAmount: number;
    dueDate: Date;
    status: FeeStatus;
    feeCategory: FeeCategory;
  }[];
};

type CheckedState = boolean | 'indeterminate';

interface FeeAssignmentProps {
  students: StudentFeeRow[];
  feeCategories: FeeCategory[];
}

const getStatusIcon = (status: FeeStatus) => {
  switch (status) {
    case 'PAID':
      return <IndianRupee className="h-4 w-4 text-green-600" />;
    case 'UNPAID':
      return <CreditCard className="h-4 w-4 text-amber-600" />;
    case 'OVERDUE':
      return <CalendarIcon className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

const getStudentInitials = (student: StudentFeeRow) =>
  `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();

function StudentIdentityCell({ student }: { student: StudentFeeRow }) {
  const fullName = `${student.firstName} ${student.lastName}`.trim();

  return (
    <div className="flex min-w-[220px] items-center gap-3">
      <Avatar className="h-10 w-10 border border-border">
        <AvatarImage src={student.profileImage || undefined} alt={fullName} />
        <AvatarFallback className="text-xs font-semibold">
          {getStudentInitials(student)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{fullName}</p>
        <p className="text-xs text-muted-foreground">
          Roll No : {student.rollNumber}
        </p>
      </div>
    </div>
  );
}

const FeeAssignmentRow = memo(function FeeAssignmentRow({
  student,
  isSelected,
  onSelectionChange,
}: {
  student: StudentFeeRow;
  isSelected: boolean;
  onSelectionChange: (studentId: string, checked: CheckedState) => void;
}) {
  const sortedFees = useMemo(
    () =>
      [...student.Fee].sort(
        (a, b) =>
          new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      ),
    [student.Fee]
  );
  const visibleFees = sortedFees.slice(0, 3);
  const moreFees = sortedFees.slice(3);

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectionChange(student.id, checked)}
        />
      </TableCell>
      <TableCell>
        <StudentIdentityCell student={student} />
      </TableCell>
      <TableCell className="whitespace-nowrap">{student.grade.grade}</TableCell>
      <TableCell>{student.section.name}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1.5">
          {sortedFees.length > 0 ? (
            <>
              {visibleFees.map((fee) => (
                <HoverCard key={fee.id}>
                  <HoverCardTrigger asChild>
                    <div className="grid max-w-[280px] grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 cursor-pointer group">
                      <Badge variant={fee.status} className="whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(fee.status)}
                          {fee.status}
                        </span>
                      </Badge>
                      <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-foreground">
                        Rs. {formatCurrencyIN(fee.totalFee)}
                      </span>
                      <span className="truncate text-xs font-medium capitalize">
                        {fee.feeCategory.name}
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent
                    className="w-80 p-0 shadow-xl border-2"
                    align="start"
                  >
                    <div
                      className={`${fee.status === 'PAID'
                        ? 'bg-gradient-to-r from-green-400 to-green-100 dark:from-teal-950/30 dark:to-emerald-950/30'
                        : fee.status === 'OVERDUE'
                          ? 'bg-gradient-to-r from-red-400 to-red-100 dark:from-red-950/30 dark:to-red-950/30'
                          : 'bg-gradient-to-r from-orange-100 to-orange-50 dark:from-teal-950/30 dark:to-orange-950/30'
                        } p-4 rounded-t-lg`}
                    >
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Fee Details
                      </h4>
                      <p className="text-sm text-foreground/80 capitalize">
                        {fee.feeCategory.name}
                        {fee.feeCategory.description && (
                          <span className="block mt-1 text-xs italic opacity-70">
                            {fee.feeCategory.description}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-muted-foreground">
                          Total Fee
                        </div>
                        <div className="text-sm font-medium text-right">
                          Rs. {formatCurrencyIN(fee.totalFee)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-muted-foreground">
                          Paid Amount
                        </div>
                        <div className="text-sm font-medium text-right text-emerald-600">
                          Rs. {formatCurrencyIN(fee.paidAmount)}
                        </div>
                      </div>
                      {fee.status !== 'PAID' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-muted-foreground">
                            Balance
                          </div>
                          <div className="text-sm font-medium text-right text-red-600">
                            Rs. {formatCurrencyIN(fee.pendingAmount)}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-muted-foreground">
                          Due Date
                        </div>
                        <div className="text-sm font-medium text-right">
                          {formatDateIN(fee.dueDate)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-muted-foreground">
                          Status
                        </div>
                        <div className="text-right">
                          <Badge variant={fee.status} className="transition-all">
                            <span className="flex items-center gap-1">
                              {getStatusIcon(fee.status)}
                              {fee.status}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}

              {moreFees.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-6 px-2 text-[10px] font-bold text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100 w-fit"
                    >
                      +{moreFees.length} more fees
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[340px] p-3 shadow-2xl border-2"
                    align="start"
                  >
                    <h3 className="text-xs font-bold mb-3 border-b pb-2">
                      Remaining Fees
                    </h3>
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
                      {moreFees.map((fee) => (
                        <HoverCard key={fee.id}>
                          <HoverCardTrigger asChild>
                            <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-muted border border-transparent hover:border-border transition-all">
                              <Badge
                                variant={fee.status}
                                className="whitespace-nowrap transition-all scale-90"
                              >
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(fee.status)}
                                  {fee.status}
                                </span>
                              </Badge>
                              <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-foreground">
                                Rs. {formatCurrencyIN(fee.totalFee)}
                              </span>
                              <span className="text-xs truncate font-medium capitalize">
                                {fee.feeCategory.name}
                              </span>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent
                            className="w-80 p-0 shadow-xl border-2 z-[60]"
                            align="start"
                          >
                            <div
                              className={`${fee.status === 'PAID'
                                ? 'bg-gradient-to-r from-green-400 to-green-100 dark:from-teal-950/30 dark:to-emerald-950/30'
                                : fee.status === 'OVERDUE'
                                  ? 'bg-gradient-to-r from-red-400 to-red-100 dark:from-red-950/30 dark:to-red-950/30'
                                  : 'bg-gradient-to-r from-orange-100 to-orange-50 dark:from-teal-950/30 dark:to-orange-950/30'
                                } p-4 rounded-t-lg`}
                            >
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Fee Details
                              </h4>
                              <p className="text-sm text-foreground/80 capitalize">
                                {fee.feeCategory.name}
                                {fee.feeCategory.description && (
                                  <span className="block mt-1 text-xs italic opacity-70">
                                    {fee.feeCategory.description}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm text-muted-foreground">
                                  Total Fee
                                </div>
                                <div className="text-sm font-medium text-right">
                                  Rs. {formatCurrencyIN(fee.totalFee)}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm text-muted-foreground">
                                  Paid Amount
                                </div>
                                <div className="text-sm font-medium text-right text-emerald-600">
                                  Rs. {formatCurrencyIN(fee.paidAmount)}
                                </div>
                              </div>
                              {fee.status !== 'PAID' && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="text-sm text-muted-foreground">
                                    Balance
                                  </div>
                                  <div className="text-sm font-medium text-right text-red-600">
                                    Rs. {formatCurrencyIN(fee.pendingAmount)}
                                  </div>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm text-muted-foreground">
                                  Due Date
                                </div>
                                <div className="text-sm font-medium text-right">
                                  {formatDateIN(fee.dueDate)}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm text-muted-foreground">
                                  Status
                                </div>
                                <div className="text-right">
                                  <Badge
                                    variant={fee.status}
                                    className="transition-all"
                                  >
                                    <span className="flex items-center gap-1">
                                      {getStatusIcon(fee.status)}
                                      {fee.status}
                                    </span>
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic px-1">
              No fees assigned
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

const FeeAssignmentDataTable = ({
  students,
  feeCategories,
}: FeeAssignmentProps) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const terms = useTerminology();

  const selectedStudentIds = useMemo(
    () => new Set(selectedStudents),
    [selectedStudents]
  );

  const handleSelectAll = (checked: CheckedState) => {
    if (checked === true) {
      setSelectedStudents(students.map((s) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentSelectionChange = useCallback(
    (studentId: string, checked: CheckedState) => {
      setSelectedStudents((prev) => {
        if (checked) {
          return prev.includes(studentId) ? prev : [...prev, studentId];
        }

        return prev.filter((id) => id !== studentId);
      });
    },
    []
  );

  const form = useForm<z.infer<typeof feeAssignmentSchema>>({
    resolver: zodResolver(feeAssignmentSchema),
    defaultValues: {
      dueDate: new Date(),
      feeAmount: 0,
      feeCategoryId: '',
      studentIds: [],
    },
  });

  async function onSubmit(data: z.infer<typeof feeAssignmentSchema>) {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          studentIds: selectedStudents,
        };
        await AssignFeeToStudents(payload);
        toast.success('Fees assigned successfully');
        form.reset();
        setIsDialogOpen(false);
        setSelectedStudents([]);
      } catch (error) {
        toast.error('Something went wrong');
        console.error(error);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Student Fees</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={selectedStudents.length === 0}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Assign Fee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Fees</DialogTitle>
              <DialogDescription>
                Assign fees to {selectedStudents.length} selected student(s)
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="feeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter fee amount"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is the amount of the fee to be assigned
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="feeCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee Categories </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {feeCategories.length > 0 ? (
                            feeCategories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id}
                                className="capitalize"
                              >
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              No categories found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Don’t see your category?
                        <Link
                          target="_blank"
                          href="/dashboard/fees/admin/fee-categories"
                          className="text-blue-500 ml-2"
                        >
                          Create one
                        </Link>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            // disabled={(date) =>
                            //   date > new Date() || date > new Date('1900-01-01')
                            // }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Due date of the fee assignment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button variant="outline" className="mr-2">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Assigning...' : 'Create Fee Assignment'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="flex justify-center py-4">
            <EmptyState
              title="No Students Found"
              description="No students match your current search or filter criteria. Try adjusting the search term or changing the grade/section filter."
              icons={[Users, Search, GraduationCap]}
              image="/EmptyState.png"
              hint="Students need to be registered first before assigning fees."
              compact
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    onCheckedChange={handleSelectAll}
                    checked={
                      students.length > 0 &&
                      selectedStudents.length === students.length
                    }
                  />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>{terms.grade}</TableHead>
                <TableHead>{terms.section}</TableHead>
                <TableHead>Fee Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <FeeAssignmentRow
                  key={student.id}
                  student={student}
                  isSelected={selectedStudentIds.has(student.id)}
                  onSelectionChange={handleStudentSelectionChange}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedStudents.length} of {students.length} students selected
        </div>
      </CardFooter>
    </Card>
  );
};

export default FeeAssignmentDataTable;
