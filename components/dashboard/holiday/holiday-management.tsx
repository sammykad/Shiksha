'use client';

import React, { useState, useTransition } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CalendarIcon,
  Plus,
  Trash2,
  AlertCircle,
  Upload,
  Download,
  FileText,
  Link,
  Copy,
  CheckCircle,
  CalendarDays,
  Clock,
  Users,
  FileSpreadsheet,
  PlusCircle,
  Loader2,
  PartyPopper,
  Gift,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn, formatDateIN, toISTDate } from '@/lib/utils';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import CreateSingleHolidayForm from './create-single-holiday-form';
import HolidayGoogleSheetImporter from './holiday-google-sheet-importer';
import { createSingleHolidayAction } from '@/lib/data/holiday/create-single-holiday';
import { deleteSingleHolidayAction } from '@/lib/data/holiday/delete-single-holiday';
import { createCsvHolidayAction } from '@/lib/data/holiday/create-csv-holiday';
import { deleteAllHolidaysAction } from '@/lib/data/holiday/delete-all-holidays';
import { CalendarEventType } from '@/generated/prisma/enums';
import { EmptyState } from '@/components/ui/empty-state';
import { Separator } from '@/components/ui/separator';

interface HolidayManagementProps {
  holidays: Holiday[];
  holidaysSummary: HolidaySummary;
}

interface Holiday {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  type: CalendarEventType;
  reason: string | null;
  organizationId: string;
  isRecurring: boolean;
}

interface HolidaySummary {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalWorkingDays: number;
  totalHolidays: number;
  totalWeekendDays: number;
};

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

export default function HolidayManagement({
  holidays,
  holidaysSummary,
}: HolidayManagementProps) {
  const [activeTab, setActiveTab] = useState('sheet');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });


  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [emergencyHolidayName, setEmergencyHolidayName] = useState('');
  const [emergencyHolidayReason, setEmergencyHolidayReason] = useState('');
  const [csvBulkHolidays, setCsvBulkHolidays] = useState('');
  const [isCsvBulkUploading, setIsCsvBulkUploading] = useState(false);


  // Transitions
  const [isAddingEmergency, startEmergencyTransition] = useTransition();
  const [isDeletingHoliday, startDeleteTransition] = useTransition();
  const [isImportingCsv, startCsvImportTransition] = useTransition();
  const [isDeletingAll, startDeleteAllTransition] = useTransition();

  const [copied, setCopied] = useState(false);

  // Sample CSV template
  const csvTemplate = `New Year's Day,2026-01-01,2026-01-01,PLANNED,Calendar Year Start,true
Makar Sankranti,2026-01-14,2026-01-14,PLANNED,Harvest Festival,true
Republic Day,2026-01-26,2026-01-26,PLANNED,National Holiday,true
Maha Shivratri,2026-02-15,2026-02-15,PLANNED,Hindu Festival,true
Holi,2026-03-04,2026-03-05,PLANNED,Festival of Colors,true
Good Friday,2026-04-03,2026-04-03,PLANNED,Christian Observance,true
Ram Navami,2026-04-11,2026-04-11,PLANNED,Hindu Festival,true
Eid-ul-Fitr,2026-03-22,2026-03-22,PLANNED,Islamic Festival,true
Ambedkar Jayanti,2026-04-14,2026-04-14,PLANNED,National Observance,true
Maharashtra Day,2026-05-01,2026-05-01,PLANNED,State Holiday,true
Buddha Purnima,2026-05-31,2026-05-31,PLANNED,Buddhist Festival,true
Eid-ul-Adha,2026-05-28,2026-05-28,PLANNED,Islamic Festival,true
Independence Day,2026-08-15,2026-08-15,PLANNED,National Holiday,true
Raksha Bandhan,2026-08-28,2026-08-28,PLANNED,Sibling Festival,true
Janmashtami,2026-09-06,2026-09-06,PLANNED,Birth of Lord Krishna,true
Ganesh Chaturthi,2026-09-17,2026-09-17,PLANNED,Festival,true
Gandhi Jayanti,2026-10-02,2026-10-02,PLANNED,National Holiday,true
Dussehra,2026-10-19,2026-10-19,PLANNED,Festival of Victory,true
Diwali Break,2026-11-08,2026-11-12,PLANNED,Festival of Lights,true
Guru Nanak Jayanti,2026-11-25,2026-11-25,PLANNED,Sikh Religious Festival,true
Christmas,2026-12-25,2026-12-25,PLANNED,Christian Holiday,true
Winter Break,2026-12-24,2027-01-01,PLANNED,Year-end Vacation,false`;


  const handleAddEmergencyHoliday = () => {

    startEmergencyTransition(async () => {
      try {
        await createSingleHolidayAction({
          name: emergencyHolidayName,
          startDate: dateRange!.from!,
          endDate: dateRange?.to ?? dateRange!.from!,
          type: CalendarEventType.EMERGENCY,
          reason: emergencyHolidayReason,
          isRecurring: false,
        });

        toast.success('Emergency holiday declared');
        setEmergencyHolidayName('');
        setEmergencyHolidayReason('');
        setDateRange({ from: new Date(), to: new Date() });
      } catch (error) {
        console.error(error);
        toast.error('Failed to declare emergency holiday');
      }
    });
  };

  // Delete single holiday
  const handleDeleteHoliday = (id: string) => {
    startDeleteTransition(async () => {
      try {
        await deleteSingleHolidayAction(id);
        toast.success('Holiday deleted');
      } catch (error) {
        toast.error('Failed to delete holiday');
      }
    });
  };

  const csvHandleBulkImport = async () => {
    const lines = csvBulkHolidays
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line); // Split by new lines and trim
    const holidaysToCreate = [];
    for (const line of lines) {
      const [name, startDate, endDate, type, reason, isRecurring] = line
        .split(',')
        .map((item) => item.trim());
      // Validate the data
      if (!name || !startDate || !endDate || !type) {
        toast.error('Please ensure all fields are filled out correctly.');
        return;
      }

      // Validate date format (YYYY-MM-DD)
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
      ) {
        toast.error('Date format must be YYYY-MM-DD.');
        return;
      }
      // Validate type
      const validTypes = ['PLANNED', 'EMERGENCY', 'INSTITUTION_SPECIFIC'];
      if (!validTypes.includes(type)) {
        toast.error(`Type must be one of: ${validTypes.join(', ')}`);
        return;
      }

      // / Validate isRecurring
      const isRecurringBool = isRecurring === 'true';
      // Push the validated holiday object to the array
      holidaysToCreate.push({
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason: reason || null, // Allow reason to be optional
        isRecurring: isRecurringBool,
      });
    }

    // Insert into the database
    try {
      setIsCsvBulkUploading(true);
      await Promise.all(
        holidaysToCreate.map((holiday) => createCsvHolidayAction(holiday))
      );
      setCsvBulkHolidays(''); // Clear the textarea after successful import
      setIsCsvBulkUploading(false);
      toast.success('Holidays imported successfully!');
    } catch (error) {
      console.error('Error importing holidays:', error);
      toast.error('Failed to import holidays.');
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'holiday_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(csvTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Template copied to clipboard');
  };

  const getHolidayTypeConfig = (type: CalendarEventType) => {
    switch (type) {
      case CalendarEventType.PLANNED:
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: 'bg-blue-100',
          label: 'Planned',
        };
      case CalendarEventType.EMERGENCY:
        return {
          badge: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: 'bg-orange-100',
          label: 'Emergency',
        };
      case CalendarEventType.INSTITUTION_SPECIFIC:
        return {
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: 'bg-purple-100',
          label: 'Institution',
        };
      default:
        return {
          badge: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: 'bg-gray-100',
          label: 'Other',
        };
    }
  };


  const isHolidayActive = (holiday: Holiday) => {
    const today = toISTDate(new Date());
    const start = toISTDate(new Date(holiday.startDate));
    const end = toISTDate(new Date(holiday.endDate));
    return start <= today && end >= today; // ✅ all IST midnight, safe to compare
  };

  const getHolidayDuration = (holiday: Holiday) => {
    const start = toISTDate(new Date(holiday.startDate));
    const end = toISTDate(new Date(holiday.endDate));
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleDeleteAllHolidays = async () => {
    startDeleteAllTransition(async () => {
      try {
        await deleteAllHolidaysAction();
        toast.success('All holidays deleted successfully');
      } catch (error) {
        toast.error('Failed to delete all holidays');
      }
    });
  };

  return (
    <div className="space-y-8 px-2">
      {/* Academic Year Summary */}
      <PageHeader
        title="Academic Year Overview"
        description={`${formatDateIN(holidaysSummary.startDate)} – ${formatDateIN(holidaysSummary.endDate)} • Live calculation of working days, scheduled holidays, and their effect on total learning time.`}
        icon={CalendarDays}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Days</span>
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {holidaysSummary.totalDays}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Academic year duration
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Working Days</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {holidaysSummary.totalWorkingDays}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled school days
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Holiday Days</span>
              <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-lg">
                <CalendarIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {holidaysSummary.totalHolidays}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Declared holidays
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Weekend Days</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {holidaysSummary.totalWeekendDays}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Saturdays and Sundays
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

      </div>
      {/* Quick Actions Grid — DROP-IN REPLACEMENT for the existing grid section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

        {/* ── Emergency Holiday ─────────────────────────────── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-950/40">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold leading-none">Emergency Holiday</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Declare an unplanned non-working day instantly</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900">
                Emergency
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {/* Name + Date in one row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="emergency-name" className="text-xs text-muted-foreground">Holiday Name</Label>
                <Input
                  id="emergency-name"
                  placeholder="e.g., Weather Emergency"
                  value={emergencyHolidayName}
                  onChange={(e) => setEmergencyHolidayName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal bg-white border-orange-200 hover:bg-orange-50',
                        !dateRange && 'text-muted-foreground'
                      )}
                    >
                      {dateRange?.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, 'PPP')} - ${format(
                            dateRange.to,
                            'PPP'
                          )}`
                        ) : (
                          format(dateRange.from, 'PPP')
                        )
                      ) : (
                        <span>Select date range</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="emergency-reason" className="text-xs text-muted-foreground">Reason</Label>
              <Textarea
                id="emergency-reason"
                placeholder="Briefly explain the emergency (e.g., Heavy Rainfall, Local Strike)"
                value={emergencyHolidayReason}
                onChange={(e) => setEmergencyHolidayReason(e.target.value)}
                className="min-h-[72px] max-h-[72px] resize-none text-sm"
              />
            </div>

            <Button
              onClick={handleAddEmergencyHoliday}
              disabled={!emergencyHolidayName || !emergencyHolidayReason || !dateRange?.from || isAddingEmergency}
              className="w-full h-9 bg-red-600 hover:bg-red-700 text-white text-sm mt-1"
            >
              {isAddingEmergency ? (
                <><Loader2 className="animate-spin mr-2 h-3.5 w-3.5" />Declaring...</>
              ) : (
                <><AlertCircle className="w-3.5 h-3.5 mr-2" />Declare Emergency Holiday</>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Selected dates will be marked as non-working days and attendance recording will be paused.
            </p>
          </CardContent>
        </Card>

        {/* ── Bulk Import ───────────────────────────────────── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40">
                <Upload className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold leading-none">Bulk Import</CardTitle>
                <CardDescription className="text-xs mt-0.5">Add multiple holidays at once — pick your method</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-2">
            {/* 4 import method tiles */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              {[
                {
                  value: 'sheet',
                  icon: Link,
                  label: 'Google Sheets',
                  description: 'Paste a public sheet link and sync holidays directly',
                  color: 'text-green-600 bg-green-50 dark:bg-green-950/40',
                },
                {
                  value: 'single',
                  icon: PlusCircle,
                  label: 'Single Entry',
                  description: 'Add one holiday at a time with full detail control',
                  color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
                },
                {
                  value: 'paste',
                  icon: FileText,
                  label: 'Paste CSV Data',
                  description: 'Copy-paste comma-separated rows to import in bulk',
                  color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40',
                },
                {
                  value: 'template',
                  icon: Download,
                  label: 'Download Template',
                  description: 'Get our pre-filled CSV template with Indian holidays',
                  color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
                },
              ].map((method) => (
                <DialogTrigger asChild key={method.value}>
                  <button
                    onClick={() => setActiveTab(method.value)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-all text-left group"
                  >
                    <div className={cn('p-1.5 rounded-md shrink-0', method.color)}>
                      <method.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-none">{method.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{method.description}</p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </DialogTrigger>
              ))}

              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Import Holidays</DialogTitle>
                  <DialogDescription>
                    Choose your preferred method to import multiple holidays into the system
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative">
                  <TabsList className="mb-5 h-9 bg-muted p-0.5 rounded-lg w-fit mx-auto flex overflow-x-auto overflow-y-hidden scrollbar-hide justify-center">
                    {[
                      { value: 'sheet', label: 'Google Sheets', icon: Link },
                      { value: 'single', label: 'Single Holiday', icon: PlusCircle },
                      { value: 'paste', label: 'Paste Data', icon: FileText },
                      { value: 'template', label: 'Template', icon: Download },
                    ].map((t) => (
                      <TabsTrigger
                        key={t.value}
                        value={t.value}
                        className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
                      >
                        <t.icon className="h-3.5 w-3.5" />
                        <span className={cn('overflow-hidden transition-all duration-500 whitespace-nowrap', activeTab === t.value ? 'max-w-24 opacity-100 ml-0' : 'max-w-0 opacity-0 sm:max-w-24 sm:opacity-100')}>
                          {t.label}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="sheet" className="space-y-6 mt-6">
                    <HolidayGoogleSheetImporter />
                  </TabsContent>
                  <TabsContent value="single" className="space-y-6 mt-6">
                    <CreateSingleHolidayForm />
                  </TabsContent>
                  <TabsContent value="paste" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Paste CSV Data</Label>
                        <p className="text-sm text-muted-foreground mb-3">Format: Name, Start Date, End Date, Type, Reason, Is Recurring</p>
                        <Textarea value={csvBulkHolidays} onChange={(e) => setCsvBulkHolidays(e.target.value)} placeholder="Paste your holiday data here..." rows={10} className="font-mono text-sm" />
                      </div>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Date Format:</strong> YYYY-MM-DD | <strong>Type:</strong> PLANNED, EMERGENCY, or INSTITUTION_SPECIFIC | <strong>Is Recurring:</strong> true or false
                        </AlertDescription>
                      </Alert>
                      <Button onClick={csvHandleBulkImport} disabled={!csvBulkHolidays.trim()} className="w-full">
                        {isCsvBulkUploading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Uploading</> : <><Upload className="w-4 h-4 mr-2" />Import Holidays</>}
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="template" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">CSV Template</Label>
                        <p className="text-sm text-muted-foreground mb-3">Download or copy this template to get started quickly</p>
                        <div className="bg-muted/50 border rounded-lg p-4">
                          <p className="text-sm py-2 font-medium">Holiday Name, Start Date, End Date, Type, Reason, Is Recurring</p>
                          <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto text-muted-foreground">{csvTemplate}</pre>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={downloadTemplate} variant="outline" className="flex-1"><Download className="w-4 h-4 mr-2" />Download Template</Button>
                        <Button onClick={copyTemplate} variant="outline" className="flex-1">
                          {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                          {copied ? 'Copied!' : 'Copy Template'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </CardContent>
          <Separator />
          <CardFooter>
            <div className="flex items-center justify-between gap-2 pt-1 mt-3">
              <Button variant="ghost" size="sm" onClick={downloadTemplate} className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5">
                <Download className="w-3 h-3" />Download CSV
              </Button>
              <Separator orientation="vertical" />
              <Button variant="ghost" size="sm" onClick={copyTemplate} className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5">
                {copied ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Template'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <PageHeader
        title='Holidays & Events'
        description='Manage all holidays and non-working days that affect attendance calculations'
        icon={CalendarIcon}
        actions={
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={'outline'}
                  className="hover:text-red-500 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All holidays will be
                    permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAllHolidays}
                      disabled={isDeletingAll}
                    >
                      {
                        isDeletingAll ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )
                      }
                      Delete All
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsBulkDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Holiday
            </Button>
          </>
        }
      />
      {/* <Card className="border-0 p-0">
        <CardContent className='p-0'> */}
      {holidays.length === 0 ? (
        <div className="text-center py-16 flex items-center justify-center">
          <EmptyState
            title='No holidays found'
            description='Start by adding holidays to ensure accurate attendance calculations and better planning.'
            icons={[CalendarIcon, PartyPopper, Gift]}
            action={{
              label: 'Add Holiday',
              onClick: () => setIsBulkDialogOpen(true),
              icon: Plus,
            }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {holidays.map((holiday) => {
            const typeConfig = getHolidayTypeConfig(holiday.type);
            const isActive = isHolidayActive(holiday);
            const duration = getHolidayDuration(holiday);

            return (
              <Card
                key={holiday.id}
                className={cn(
                  'border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer',
                  isActive && 'ring-2 ring-green-200 bg-green-50'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn('p-2 rounded-lg', typeConfig.icon)}
                      >
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg leading-tight">
                          {holiday.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={typeConfig.badge}
                          >
                            {typeConfig.label}
                          </Badge>
                          {holiday.isRecurring && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                          {isActive && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Active Now
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        variant={'destructive'}
                        size={'sm'}
                        disabled={isDeletingHoliday}
                      >
                        {isDeletingHoliday ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium">
                          {new Date(holiday.startDate).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p className="font-medium">
                          {new Date(holiday.endDate).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {duration} day{duration > 1 ? 's' : ''}
                        </span>
                      </div>
                      {holiday.reason && (
                        <div
                          className="text-sm text-muted-foreground truncate max-w-[220px]"
                          title={holiday.reason}
                        >
                          {holiday.reason}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {/* </CardContent>
      </Card> */}
    </div >
  );
}
