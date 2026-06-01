'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  FilterIcon,
  SearchIcon,
  XCircleIcon,
  InfoIcon,
  Eye,
  Send,
  Clock,
  FileTextIcon,
} from 'lucide-react';
import { cn, formatCurrencyIN, formatDateIN, formatDateTimeIN } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { FeeRecord } from '@/types';

import { ScrollArea } from '@/components/ui/scroll-area';
import { recordOfflinePayment } from '@/lib/data/fee/recordOfflinePayment';
import { PaymentMethod } from '@/generated/prisma/enums';
import { offlinePaymentSchema, offlinePaymentFormData } from '@/lib/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  FeeReminderRecipient,
  SendFeesReminderDialog,
} from './SendFeesReminderDialog';
import { DownloadReceiptDialog } from './download-receipt-dialog';
import { useTerminology } from '@/context/terminology';
import { GeneratePaymentLink } from './GeneratePaymentLink';
import { RecordPdcPaymentCard } from './Recordpdcpaymentcard';

interface FilterState {
  searchTerm: string;
  grade: string | null;
  section: string | null;
  category: string | null;
  status: string | null;
}

interface StudentPaymentHistoryTableProps {
  feeRecords: FeeRecord[];
}

export default function StudentPaymentHistoryTable({
  feeRecords = [],
}: StudentPaymentHistoryTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    grade: null,
    section: null,
    category: null,
    status: null,
  });
  const [currentTab, setCurrentTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [localFeeRecords, setLocalFeeRecords] =
    useState<FeeRecord[]>(feeRecords);

  // Sync local records with props
  useEffect(() => {
    setLocalFeeRecords(feeRecords);
  }, [feeRecords]);

  // Simulate loading effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, [filters, currentTab, currentPage]);

  // Reset pagination on filter or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, currentTab]);

  // Filter and pagination logic
  const { filteredRecords, totalPages, currentRecords } = useMemo(() => {
    const filtered = localFeeRecords.filter((record) => {
      const { searchTerm, grade, section, category, status } = filters;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        record.fee.id.toLowerCase().includes(searchLower) ||
        record.student.rollNumber.toLowerCase().includes(searchLower) ||
        record.student.firstName.toLowerCase().includes(searchLower) ||
        record.student.lastName.toLowerCase().includes(searchLower);
      const matchesTab =
        currentTab === 'all' || record.fee.status === currentTab.toUpperCase();
      const matchesGrade = !grade || record.grade.grade === grade;
      const matchesSection = !section || record.section.name === section;
      const matchesCategory = !category || record.feeCategory.name === category;
      const matchesStatus = !status || record.fee.status === status;
      return (
        matchesSearch &&
        matchesTab &&
        matchesGrade &&
        matchesSection &&
        matchesCategory &&
        matchesStatus
      );
    });

    const total = Math.ceil(filtered.length / recordsPerPage);
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    return {
      filteredRecords: filtered,
      totalPages: total,
      currentRecords: filtered.slice(start, end),
    };
  }, [localFeeRecords, filters, currentTab, currentPage, recordsPerPage]);

  // Filter options
  const filterOptions = useMemo(
    () => ({
      grades: Array.from(new Set(localFeeRecords.map((r) => r.grade.grade))),
      sections: Array.from(new Set(localFeeRecords.map((r) => r.section.name))),
      categories: Array.from(
        new Set(localFeeRecords.map((r) => r.feeCategory.name))
      ),
    }),
    [localFeeRecords]
  );

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      grade: null,
      section: null,
      category: null,
      status: null,
    });
  };

  return (

    <div className="flex flex-col space-y-8">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <FilterControls
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
          resetFilters={resetFilters}
          feeRecords={localFeeRecords}
          currentTab={currentTab}
        />
        {['all', 'paid', 'unpaid', 'overdue'].map((tab) => (
          <TabsContent key={tab} value={tab} className="m-0">
            <FeeTable
              records={currentRecords}
              isLoading={isLoading}
              recordsPerPage={recordsPerPage}
              setSelectedRecord={setSelectedRecord}
              resetFilters={resetFilters}
            />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              recordsPerPage={recordsPerPage}
              setCurrentPage={setCurrentPage}
              setRecordsPerPage={setRecordsPerPage}
              filteredRecordsCount={filteredRecords.length}
              isLoading={isLoading}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Record Payment Dialog Component
interface RecordPaymentCardProps {
  selectedRecord: FeeRecord;
  onSuccess?: () => void;
}

const RecordPaymentCard = ({
  selectedRecord,
  onSuccess,
}: RecordPaymentCardProps) => {
  const [isPending, startTransition] = useTransition();

  const maxPayableAmount = Number(selectedRecord.fee.pendingAmount || 0);

  const form = useForm<offlinePaymentFormData>({
    resolver: zodResolver(offlinePaymentSchema),
    defaultValues: {
      feeId: selectedRecord?.fee.id || '', // Use selectedRecord.id for the form's feeId
      amount: maxPayableAmount > 0 ? maxPayableAmount : 0, // Initialize with max payable or 0
      method: PaymentMethod.CASH, // Default to CASH
      transactionId: '',
      note: '',
      payerId: selectedRecord.student.userId || '',
    },
  });

  async function onSubmit(data: offlinePaymentFormData) {
    // Additional client-side validation for amount against maxPayableAmount
    if (data.amount > maxPayableAmount) {
      form.setError('amount', {
        type: 'manual',
        message: `Amount cannot exceed ${formatCurrencyIN(maxPayableAmount)}.`,
      });
      toast.error('Validation Error', {
        description: `Payment amount exceeds the pending amount.`,
      });
      return;
    }

    startTransition(async () => {
      try {
        // Ensure feeId is present before calling recordOfflinePayment
        if (!selectedRecord?.fee.id) {
          toast.error('Failed to record payment', {
            description:
              'Fee record ID is missing. Please select a valid record.',
          });
          return;
        }

        await recordOfflinePayment(data);
        toast.success('Payment recorded successfully!');

        if (onSuccess) {
          onSuccess();
        }
        form.reset();
      } catch (error) {
        console.error('Payment recording failed:', error);
        toast.error('Failed to record payment', {
          description:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred.',
        });
      }
    });
  }

  if (!selectedRecord) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center text-muted-foreground">
          No fee record selected. Please select a record to proceed with
          payment.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
            <div className="grid gap-4 ">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="amount">Payment Amount</FormLabel>
                    <FormControl>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        max={maxPayableAmount}
                        {...field}
                        // Display empty string for 0 to avoid showing "0" initially
                        value={field.value === 0 ? '' : field.value}
                        disabled={isPending || maxPayableAmount <= 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="method">Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger id="method">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PaymentMethod).filter((method) => method !== "ONLINE").map((method) => (
                          <SelectItem key={method} value={method}>
                            {method.charAt(0) +
                              method.slice(1).toLowerCase().replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="transaction">
                      Transaction ID (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="transaction"
                        placeholder="Enter transaction reference"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="note">Note (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        id="note"
                        placeholder="Add any additional note"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="payerId">Payer ID *</FormLabel>
                    <FormControl>
                      <Input
                        id="payerId"
                        placeholder="Enter user ID of the person making payment"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>

                      <span className="flex flex-col border border-orange-300 bg-orange-50 p-2 rounded">
                        <span>
                          Required: Enter the user ID of the person who made this
                          payment (parent, student, or guardian).
                        </span>
                        <span className='border-t border-gray-200 my-2'>
                          Default: The user ID of the student.
                        </span>
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="w-full flex justify-center items-center p-0 mx-0">
                <Button
                  type="submit"
                  disabled={isPending || maxPayableAmount <= 0}
                  className="px-4 py-2 w-full mx-0"
                >
                  {isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </CardFooter>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// Filter Controls Component
interface FilterControlsProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  filterOptions: { grades: string[]; sections: string[]; categories: string[] };
  resetFilters: () => void;
  feeRecords: FeeRecord[];
  currentTab: string;
}

function FilterControls({
  filters,
  setFilters,
  filterOptions,
  resetFilters,
  feeRecords,
  currentTab,
}: FilterControlsProps) {
  // Map feeRecords to initialRecipients for unpaid or overdue fees

  const initialRecipients: FeeReminderRecipient[] = useMemo(() => {
    return feeRecords
      .filter((record) => ['UNPAID', 'OVERDUE'].includes(record.fee.status))
      .map((record) => {
        const primaryParent = record.student.parents?.find(
          (ps) => ps.isPrimary
        )?.parent;

        const parentId = primaryParent?.id ?? undefined;
        const parentUserId = primaryParent?.userId ?? undefined;

        const parentName = primaryParent
          ? `${primaryParent.firstName} ${primaryParent.lastName}`
          : `${record.student.firstName} ${record.student.lastName}`;

        const parentEmail = primaryParent?.email ?? record.student.email;
        const parentPhone =
          primaryParent?.phoneNumber ?? record.student.phoneNumber;
        const parentWhatsAppNumber =
          primaryParent?.whatsAppNumber ?? record.student.phoneNumber;

        const status = record.fee.status as 'UNPAID' | 'OVERDUE';

        return {
          id: record.fee.id,
          studentId: record.student.id,
          studentName: `${record.student.firstName} ${record.student.lastName}`,
          studentPhoneNumber: record.student.phoneNumber,
          studentWhatsappNumber: record.student.phoneNumber,
          grade: record.grade.grade,
          section: record.section.name,
          parentName,
          parentEmail,
          parentPhone,
          parentId,
          parentUserId,
          parentWhatsAppNumber,
          status,
          amountDue: Number(record.fee.pendingAmount || 0),
          dueDate: record.fee.dueDate,
          avatar: record.student.profileImage || undefined,
          organizationName: record.fee.organizationName,
          organizationEmail: record.fee.organizationEmail,
          organizationPhone: record.fee.organizationPhone,
          feeCategoryName: record.feeCategory?.name || 'Unknown',
        };
      });
  }, [feeRecords]);
  const term = useTerminology()

  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-4">
      <TabsList className="flex-wrap">
        {['all', 'paid', 'unpaid', 'overdue'].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="relative text-xs sm:text-sm"
            aria-label={`${tab.charAt(0).toUpperCase() + tab.slice(1)} Fees`}
          >
            <span className="hidden sm:inline">
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Fees
            </span>
            <span className="sm:hidden">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
            <Badge
              className={cn(
                'ml-1 text-xs',
                tab === 'all' && 'bg-gray-200 text-gray-700 hover:bg-gray-200',
                tab === 'paid' &&
                'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
                tab === 'unpaid' &&
                'bg-amber-100 text-amber-700 hover:bg-amber-100',
                tab === 'overdue' && 'bg-red-100 text-red-700 hover:bg-red-100'
              )}
            >
              {tab === 'all'
                ? feeRecords.length
                : feeRecords.filter((r) => r.fee.status === tab.toUpperCase())
                  .length}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex flex-wrap items-center gap-2 mx-2">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by ID, name, or roll number..."
            className="pl-8"
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters({ ...filters, searchTerm: e.target.value })
            }
            aria-label="Search fee records"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              aria-label="Filter options"
            >
              <FilterIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px]">
            <DropdownMenuLabel>Filter Fees</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <SelectFilter
              label={term.grade}
              value={filters.grade}
              onChange={(value) => setFilters({ ...filters, grade: value })}
              options={filterOptions.grades}
              placeholder={`All ${term.grades}`}
            />
            <SelectFilter
              label={term.section}
              value={filters.section}
              onChange={(value) => setFilters({ ...filters, section: value })}
              options={filterOptions.sections}
              placeholder={`All ${term.sections}`}

            />
            <SelectFilter
              label="Fee Category"
              value={filters.category}
              onChange={(value) => setFilters({ ...filters, category: value })}
              options={filterOptions.categories}
              placeholder="All Categories"
            />
            {currentTab === 'all' && (
              <SelectFilter
                label="Status"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={['PAID', 'UNPAID', 'OVERDUE']}
                placeholder="All Statuses"
              />
            )}
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={resetFilters}
                aria-label="Reset filters"
              >
                Reset Filters
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 max-sm:w-full">
              <Send className="w-4 h-4" /> Send Reminders
            </Button>
          </DialogTrigger>

          <DialogContent className="
    w-full max-w-none h-full rounded-none p-2
    sm:h-auto sm:max-w-3xl sm:rounded-lg sm:max-h-[90vh]
    overflow-hidden flex flex-col bg-background
  ">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
              <DialogTitle>Send Fee Reminders</DialogTitle>
              <DialogDescription>
                Send payment reminders to students or parents with outstanding fees
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <SendFeesReminderDialog initialRecipients={initialRecipients} />
            </div>
          </DialogContent>
        </Dialog>

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              aria-label="More options"
            >
              <SlidersHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <PrinterIcon className="h-4 w-4" />
              <span>Print Report</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              <span>Export to Excel</span>
            </DropdownMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onSelect={(e) => e.preventDefault()}
                >
                  <BellIcon className="h-4 w-4" />
                  <span>Send Reminders</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Send Fee Reminders</DialogTitle>
                  <DialogDescription>
                    Send payment reminders to students or parents with
                    outstanding fees
                  </DialogDescription>
                </DialogHeader>
                <SendFeesReminderDialog initialRecipients={initialRecipients} />
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
    </div>
  );
}

// Select Filter Component
interface SelectFilterProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: string[];
  placeholder: string;
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
  placeholder,
}: SelectFilterProps) {
  return (
    <div className="p-2">
      <p className="text-xs font-medium mb-1">{label}</p>
      <Select
        value={value ?? 'all'}
        onValueChange={(val) => onChange(val === 'all' ? null : val)}
      >
        <SelectTrigger className="h-8" aria-label={`Filter by ${label}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Fee Table Component
interface FeeTableProps {
  records: FeeRecord[];
  isLoading: boolean;
  recordsPerPage: number;
  setSelectedRecord: (record: FeeRecord | null) => void;

  resetFilters: () => void;
}
function FeeTable({
  records,
  isLoading,
  recordsPerPage,
  resetFilters,
}: FeeTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <FeeTableHeader />
          </TableHeader>
          <TableBody>
            {isLoading ? (
              tableLoadingSkeletons(recordsPerPage)
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-10 text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center">
                    <InfoIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                    <p>No fee records found</p>
                    <Button
                      variant="link"
                      onClick={resetFilters}
                      className="mt-2"
                      aria-label="Reset all filters"
                    >
                      Reset all filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <FeeTableRow key={record.fee.id} record={record} />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
function FeeTableHeader() {
  const term = useTerminology()
  return (
    <TableRow>
      <TableHead className='truncate'>Student Name</TableHead>
      <TableHead className='truncate'>{term.grade} / {term.section}</TableHead>
      <TableHead>Category</TableHead>
      <TableHead className="text-right">Amount</TableHead>
      <TableHead className='truncate'>Due Date</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  );
}
interface FeeTableRowProps {
  record: FeeRecord;
}

const getStudentFullName = (record: FeeRecord) =>
  `${record.student.firstName} ${record.student.lastName}`.trim();

const getStudentInitials = (record: FeeRecord) =>
  `${record.student.firstName.charAt(0)}${record.student.lastName.charAt(0)}`.toUpperCase();

function FeeTableRow({ record }: FeeTableRowProps) {
  const studentName = getStudentFullName(record);

  return (
    <TableRow className="group transition-colors hover:bg-muted/35">
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage
              src={record.student.profileImage || undefined}
              alt={studentName}
            />
            <AvatarFallback className="text-xs font-semibold">
              {getStudentInitials(record)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium">{studentName}</div>
            <div className="text-xs text-muted-foreground">
              Roll No : {record.student.rollNumber}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col items-start gap-1">
          {record.grade.grade}
          <span className="text-xs text-muted-foreground">
            ({record.section.name})
          </span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="capitalize">{record.feeCategory.name}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{record.feeCategory.description ?? 'No description'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="text-right font-medium whitespace-nowrap">
        <div>{formatCurrencyIN(record.fee.totalFee)}</div>
        {record.fee.paidAmount > 0 &&
          record.fee.paidAmount < record.fee.totalFee && (
            <div className="text-xs text-muted-foreground">
              Paid: {formatCurrencyIN(record.fee.paidAmount)}
            </div>
          )}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {formatDateIN(record.fee.dueDate)}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={record.fee.status}
        >
          {record.fee.status === 'PAID' && (
            <CheckCircle2Icon className="mr-1 h-3 w-3" />
          )}
          {record.fee.status === 'OVERDUE' && (
            <XCircleIcon className="mr-1 h-3 w-3" />
          )}
          {record.fee.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 px-0 text-muted-foreground transition-colors group-hover:text-foreground sm:w-auto sm:px-3"
              aria-label={`View details for ${studentName}`}
            >
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">View details</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {record?.feeCategory.name}
              </DialogTitle>
              <DialogDescription>
                Detailed fee information and payment history for{' '}
                <span className="font-semibold text-foreground">
                  {studentName}
                </span>{' '}
                for academic year {record?.fee.academicYearName}
              </DialogDescription>
            </DialogHeader>
            <FeeDetailsContent selectedRecord={record} />
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}

const FeeDetailsContent = ({
  selectedRecord,
}: {
  selectedRecord: FeeRecord | null;
}) => {
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isPdcOpen, setIsPdcOpen] = useState(false);
  const studentName = selectedRecord ? getStudentFullName(selectedRecord) : '';

  return (
    <>
      {selectedRecord && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Information */}
            <div className="grid gap-4 grid-cols-1">
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Student Information
                </h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center gap-3 border-b pb-4">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage
                          src={selectedRecord.student.profileImage || undefined}
                          alt={studentName}
                        />
                        <AvatarFallback className="text-sm font-semibold">
                          {getStudentInitials(selectedRecord)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          Roll No : {selectedRecord.student.rollNumber}
                        </p>
                      </div>
                    </div>
                    <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                      <dt className="font-medium text-muted-foreground">
                        Name:
                      </dt>
                      <dd>{studentName}</dd>
                      <dt className="font-medium text-muted-foreground">
                        Roll Number:
                      </dt>
                      <dd>{selectedRecord.student.rollNumber}</dd>
                      <dt className="font-medium text-muted-foreground">
                        Class:
                      </dt>
                      <dd>{`${selectedRecord.grade.grade} - ${selectedRecord.section.name}`}</dd>
                      <dt className="font-medium text-muted-foreground">
                        Email:
                      </dt>
                      <dd className="truncate">
                        {selectedRecord.student.email || 'N/A'}
                      </dd>
                      <dt className="font-medium text-muted-foreground">
                        Phone:
                      </dt>
                      <dd>{selectedRecord.student.phoneNumber || 'N/A'}</dd>
                    </dl>
                  </CardContent>
                </Card>
              </div>
              {selectedRecord.payments?.length > 0 && (
                <ScrollArea className="max-h-72">
                  <h3 className="text-sm font-medium mb-2">
                    Payment Information
                  </h3>
                  {selectedRecord.payments.map((payment) => (
                    <Card key={payment.id} className="mb-4">
                      <CardContent className="p-4">
                        <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                          <dt className="font-medium text-muted-foreground">
                            Receipt No:
                          </dt>
                          <dd>{payment.receiptNumber}</dd>

                          <dt className="font-medium text-muted-foreground">
                            Payer:
                          </dt>
                          <dd>{`${payment.payer.firstName} ${payment.payer.lastName}`}</dd>

                          <dt className="font-medium text-muted-foreground">
                            Payment Status:
                          </dt>
                          <dd
                            className={cn(
                              payment.status === 'COMPLETED' &&
                              'text-emerald-600',
                              payment.status === 'PENDING' && 'text-yellow-600',
                              payment.status === 'CHEQUE_PENDING' && 'text-amber-600',
                              payment.status === 'FAILED' && 'text-red-600',
                              payment.status === 'UNPAID' && 'text-gray-600',
                              payment.status === 'REFUNDED' &&
                              'text-purple-600',
                              payment.status === 'CANCELLED' && 'text-gray-500'
                            )}
                          >
                            {payment.status}
                          </dd>

                          <dt className="font-medium text-muted-foreground">
                            Amount Paid:
                          </dt>
                          <dd className="font-semibold tabular-nums">
                            {['COMPLETED', 'CHEQUE_PENDING', 'PENDING'].includes(payment.status)
                              ? formatCurrencyIN(payment.amount)
                              : formatCurrencyIN(0)}
                            {payment.status === 'CHEQUE_PENDING' && (
                              <span className="ml-1.5 text-[10px] text-amber-600 font-normal italic">
                                (Uncredited)
                              </span>
                            )}
                          </dd>

                          <dt className="font-medium text-muted-foreground">
                            Payment Date:
                          </dt>
                          <dd className="truncate">
                            {formatDateTimeIN(payment.paymentDate) || 'N/A'}
                          </dd>

                          <dt className="font-medium text-muted-foreground">
                            Method:
                          </dt>
                          <dd className="flex items-center gap-1.5 capitalize">
                            {payment.paymentMethod?.replace('_', ' ').toLowerCase() || 'N/A'}
                            {payment.paymentMethod === 'CHEQUE' && payment.chequeDetail && (
                              <Badge variant="outline" className="h-4 px-1 text-[9px] font-mono">
                                #{payment.chequeDetail.chequeNumber}
                              </Badge>
                            )}
                          </dd>

                          {payment.paymentMethod === 'CHEQUE' && payment.chequeDetail && (
                            <>
                              <dt className="font-medium text-muted-foreground">
                                Bank:
                              </dt>
                              <dd className="text-xs">
                                {payment.chequeDetail.bankName}
                              </dd>
                              <dt className="font-medium text-muted-foreground">
                                Cheque Date:
                              </dt>
                              <dd className="text-xs">
                                {formatDateIN(payment.chequeDetail.chequeDate)}
                              </dd>
                              {payment.chequeDetail.bounceReason && (
                                <>
                                  <dt className="font-medium text-red-600">
                                    Bounce Reason:
                                  </dt>
                                  <dd className="text-xs text-red-600 italic">
                                    {payment.chequeDetail.bounceReason}
                                  </dd>
                                </>
                              )}
                            </>
                          )}
                          <dt className="font-medium text-muted-foreground">
                            Transaction ID:
                          </dt>
                          <dd>{payment.transactionId || 'N/A'}</dd>
                        </dl>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              )}
            </div>
            {/* Fee Information */}
            <div>
              <h3 className="text-sm font-medium mb-2">Fee Information</h3>
              <Card>
                <CardContent className="p-4">
                  <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                    <dt className="font-medium text-muted-foreground">
                      Fee Reference:
                    </dt>
                    <dd className="font-mono text-xs text-muted-foreground uppercase">
                      {selectedRecord.fee.id}
                    </dd>
                    <dt className="font-medium text-muted-foreground">
                      Academic Year:
                    </dt>
                    <dd>{selectedRecord.fee.academicYearName}</dd>
                    <dt className="font-medium text-muted-foreground">
                      Category:
                    </dt>
                    <dd>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {selectedRecord.feeCategory.name}
                        </span>
                        {selectedRecord.feeCategory.description && (
                          <span className="text-xs text-muted-foreground">
                            {selectedRecord.feeCategory.description}
                          </span>
                        )}
                      </div>
                    </dd>
                    <dt className="font-medium text-muted-foreground">
                      Total Amount:
                    </dt>
                    <dd className="font-medium text-lg">
                      {formatCurrencyIN(selectedRecord.fee.totalFee)}
                    </dd>
                    <dt className="font-medium text-muted-foreground">
                      Paid Amount:
                    </dt>
                    <dd className="text-emerald-600 font-medium">
                      {formatCurrencyIN(selectedRecord.fee.paidAmount)}
                    </dd>
                    <dt className="font-medium text-muted-foreground">
                      Pending Amount:
                    </dt>
                    <dd
                      className={cn(
                        'font-medium',
                        selectedRecord.fee.pendingAmount &&
                          selectedRecord.fee.pendingAmount > 0
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      )}
                    >
                      {formatCurrencyIN(Number(selectedRecord.fee.pendingAmount || 0))}
                    </dd>
                    <dt className="font-medium text-muted-foreground">
                      Due Date:
                    </dt>
                    <dd
                      className={cn(
                        selectedRecord.fee.status === 'OVERDUE' &&
                        'text-red-600 font-medium'
                      )}
                    >
                      {formatDateIN(selectedRecord.fee.dueDate)}
                    </dd>
                    <dt className="font-medium text-muted-foreground">
                      Status:
                    </dt>
                    <dd>
                      <Badge
                        variant={selectedRecord.fee.status}
                      >
                        {selectedRecord.fee.status === 'PAID' && (
                          <CheckCircle2Icon className="mr-1 h-3 w-3" />
                        )}
                        {selectedRecord.fee.status === 'OVERDUE' && (
                          <XCircleIcon className="mr-1 h-3 w-3" />
                        )}
                        {selectedRecord.fee.status === 'UNPAID' && (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {selectedRecord.fee.status}
                      </Badge>
                    </dd>
                    <dt className="font-medium text-muted-foreground">
                      Created:
                    </dt>
                    <dd className="text-xs text-muted-foreground">
                      {formatDateIN(selectedRecord.fee.createdAt)}
                    </dd>
                    <dt className="font-medium text-muted-foreground">
                      Last Updated:
                    </dt>
                    <dd className="text-xs text-muted-foreground">
                      {formatDateIN(selectedRecord.fee.updatedAt)}
                    </dd>
                  </dl>
                  {selectedRecord.fee.status !== 'PAID' && (
                    <div className="mt-6 pt-4 border-t">
                      <GeneratePaymentLink
                        feeId={selectedRecord.fee.id}
                        studentName={`${selectedRecord.student.firstName} ${selectedRecord.student.lastName}`}
                        amount={Number(selectedRecord.fee.pendingAmount || 0)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Payment History</h3>
              <span className="text-xs text-muted-foreground">
                {selectedRecord.payments?.length ?? 0} payments
              </span>
            </div>

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt</TableHead>
                      <TableHead className="hidden sm:table-cell">Method</TableHead>
                      <TableHead className="hidden md:table-cell">Payer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRecord.payments?.length ? (
                      selectedRecord.payments.map((payment) => (
                        <TableRow key={payment.id}>

                          {/* Receipt + Date stacked */}
                          <TableCell>
                            <p className="font-mono text-xs font-medium">
                              {payment.receiptNumber}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {formatDateIN(payment.paymentDate)}
                            </p>
                          </TableCell>

                          {/* Method — hidden on xs */}
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary" className="text-[10px]">
                              {payment.paymentMethod}
                            </Badge>
                          </TableCell>

                          {/* Payer — hidden on xs + sm */}
                          <TableCell className="hidden md:table-cell">
                            {payment.payer ? (
                              <div>
                                <p className="text-xs font-medium">
                                  {payment.payer.firstName} {payment.payer.lastName}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                                  {payment.payer.email}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>

                          {/* Amount + Status stacked */}
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "font-mono text-sm font-semibold",
                                payment.status === "COMPLETED" && "text-emerald-600",
                                payment.status === "PENDING" && "text-amber-600",
                                payment.status === "UNPAID" && "text-amber-600",
                                payment.status === "FAILED" && "text-red-600",
                                payment.status === "REFUNDED" && "text-purple-600"
                              )}
                            >
                              {formatCurrencyIN(payment.amount)}
                            </span>
                            <p className="text-[9px] uppercase tracking-wide text-muted-foreground mt-0.5">
                              {payment.status}
                            </p>
                          </TableCell>

                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center">
                          <CreditCardIcon className="mx-auto h-6 w-6 text-muted-foreground/40 mb-2" />
                          <p className="text-xs text-muted-foreground">No payment records found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          {selectedRecord.payments?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Payment Summary</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                    <div className="text-center p-2 rounded-lg bg-emerald-50/50 border border-emerald-100/50">
                      <div className="text-xl sm:text-2xl font-bold text-emerald-700">
                        {selectedRecord.payments.length}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        Total Payments
                      </div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-blue-50/50 border border-blue-100/50">
                      <div className="text-xl sm:text-2xl font-bold text-blue-700">
                        {formatCurrencyIN(selectedRecord.fee.paidAmount)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Amount Paid</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-amber-50/50 border border-amber-100/50">
                      <div className="text-xl sm:text-2xl font-bold text-amber-700">
                        {formatCurrencyIN(
                          Number(selectedRecord.fee.pendingAmount || 0)
                        )}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Pending</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50/50 border border-gray-100/50">
                      <div className="text-xl sm:text-2xl font-bold text-foreground">
                        {Math.round(
                          (selectedRecord.fee.paidAmount /
                            selectedRecord.fee.totalFee) *
                          100
                        )}
                        %
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Completion</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Payment Progress</span>
                      <span>
                        {formatCurrencyIN(selectedRecord.fee.paidAmount)} /{' '}
                        {formatCurrencyIN(selectedRecord.fee.totalFee)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((selectedRecord.fee.paidAmount / selectedRecord.fee.totalFee) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="gap-2 grid grid-cols-2 ">
            {selectedRecord.fee.status !== 'PAID' && (
              <Dialog
                open={isRecordPaymentOpen}
                onOpenChange={setIsRecordPaymentOpen}
              >
                <DialogTrigger asChild>
                  <Button aria-label="Record payment">
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                      Record a new payment for{' '}
                      {selectedRecord?.fee.id
                        ? `${selectedRecord.student.firstName} ${selectedRecord.student.lastName}`
                        : 'selected student'}
                    </DialogDescription>
                  </DialogHeader>
                  <RecordPaymentCard
                    selectedRecord={selectedRecord}
                    onSuccess={() => setIsRecordPaymentOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
            {/* ── NEW: post-dated cheque ───────────────────────────────── */}
            {selectedRecord.fee.status !== 'PAID' && (
            <Dialog open={isPdcOpen} onOpenChange={setIsPdcOpen}>
              <DialogTrigger asChild>
                <Button aria-label="Record post-dated cheque" variant="outline">
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  PDC Cheque
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Record PDC Cheque</DialogTitle>
                  <DialogDescription>
                    Record a post-dated cheque for{' '}
                    {`${selectedRecord.student.firstName} ${selectedRecord.student.lastName}`}.
                    Fee will be credited only after the cheque is marked as cleared.
                  </DialogDescription>
                </DialogHeader>
                <RecordPdcPaymentCard
                  selectedRecord={selectedRecord}
                  onSuccess={() => setIsPdcOpen(false)}
                />
              </DialogContent>
            </Dialog>
            )}
            <DownloadReceiptDialog
              record={selectedRecord}
            />
            {/* 
            {selectedRecord.fee.status !== 'PAID' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" aria-label="Send reminder">
                    <MailIcon className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto mx-auto">
                  <DialogHeader>
                    <DialogTitle>Send Fee Reminders</DialogTitle>
                    <DialogDescription>
                      Send payment reminders to students or parents with outstanding
                      fees
                    </DialogDescription>
                  </DialogHeader>
                  <SendFeesReminderDialog initialRecipients={} />
                </DialogContent>
              </Dialog>

            )} */}
          </DialogFooter>
        </>
      )
      }
    </>
  );
};

// Pagination Controls Component
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  recordsPerPage: number;
  setCurrentPage: (page: number) => void;
  setRecordsPerPage: (records: number) => void;
  filteredRecordsCount: number;
  isLoading: boolean;
}

function PaginationControls({
  currentPage,
  totalPages,
  recordsPerPage,
  setCurrentPage,
  setRecordsPerPage,
  filteredRecordsCount,
  isLoading,
}: PaginationControlsProps) {
  const startRecord =
    filteredRecordsCount === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, filteredRecordsCount);

  return (
    <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t p-4 gap-4 sm:gap-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Showing{' '}
          <strong>
            {startRecord === endRecord ? startRecord : `${startRecord}-${endRecord}`}
          </strong>{' '}
          of{' '}
          <strong>{filteredRecordsCount}</strong> Fee Records
        </p>
        <Select
          value={recordsPerPage.toString()}
          onValueChange={(value) => setRecordsPerPage(parseInt(value))}
          aria-label="Records per page"
        >
          <SelectTrigger className="h-8 w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          aria-label="Previous page"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <div className="text-sm">
          Page <strong>{currentPage}</strong> of{' '}
          <strong>{totalPages || 1}</strong>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0 || isLoading}
          aria-label="Next page"
        >
          Next
          <ArrowRightIcon className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </CardFooter>
  );
}

// Table Loading Skeletons
function tableLoadingSkeletons(recordsPerPage: number) {
  return Array.from({ length: recordsPerPage }).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell>
        <Skeleton className="h-5 w-16" />
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-5 w-16 ml-auto" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-8 w-8 ml-auto" />
      </TableCell>
    </TableRow>
  ));
}
