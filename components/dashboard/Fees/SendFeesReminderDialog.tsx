'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { BellRing, Check, ChevronDownIcon, Info, Loader2, Mail, Phone, Search, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatDateIN } from '@/lib/utils';
import { toast } from 'sonner';
import { WhatsAppIcon } from '@/public/icons/WhatsAppIcon';
import { sendFeeReminders } from '@/lib/data/fee/fee-reminder';
import { reminderFormSchema, ReminderFormValues } from '@/lib/schemas';
import { useTerminology } from '@/context/terminology';
import { GmailIcon } from '@/public/icons/GmailIcon';


export interface FeeReminderRecipient {
  id: string;
  studentId: string;
  studentName: string;
  studentPhoneNumber?: string;
  studentWhatsappNumber?: string;
  grade: string;
  section: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentWhatsAppNumber?: string;
  status: 'UNPAID' | 'OVERDUE';
  amountDue: number;
  dueDate: Date;
  feeCategoryName: string;
  avatar?: string;
  organizationName?: string;
  organizationEmail?: string;
  organizationPhone?: string;
  parentId?: string | null;
  parentUserId?: string | null;
}

export interface SendReminderData {
  recipients: FeeReminderRecipient[];
  templateType: 'FEE_FRIENDLY_REMINDER' | 'FEE_DUE_TODAY' | 'FEE_OVERDUE';
  scheduleDate?: Date | null;
  scheduleTime?: string | null;
  /**
   * Channel override for this manual send.
   * When provided, engine ignores org NotificationSetting and sends only on these.
   * When omitted, engine uses org settings as normal.
   */
  channels?: ('EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH')[];
}

export interface ReminderResult {
  success: boolean;
  error?: string;
  sentCount?: number;
  message?: string;
  scheduledJobId?: string;
  scheduledAt?: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW TEMPLATES  (client-side only — for the message preview UI)
// ─────────────────────────────────────────────────────────────────────────────

const FeeReminderTemplates = [
  {
    id: 'FEE_FRIENDLY_REMINDER',
    name: 'Friendly Reminder',
    description: 'Gentle reminder before due date',
    message: `Dear {PARENT_NAME},\n\nThis is a friendly reminder that the fee payment for {STUDENT_NAME} (Class {GRADE}-{SECTION}) is due on {DUE_DATE}.\nThe total outstanding amount is {AMOUNT}.\n\nPlease make the payment at your earliest convenience.\n\nBest regards,\n{ORGANIZATION_NAME}`,
  },
  {
    id: 'FEE_DUE_TODAY',
    name: 'Payment Due Today',
    description: 'Urgent reminder for payments due today',
    message: `Dear {PARENT_NAME},\n\nThe fee payment for {STUDENT_NAME} (Class {GRADE}-{SECTION}) is due TODAY.\n\nAmount Due: {AMOUNT}\n\nPlease make immediate payment to avoid late fees.\n\nBest regards,\n{ORGANIZATION_NAME}`,
  },
  {
    id: 'FEE_OVERDUE',
    name: 'Overdue Notice',
    description: 'Formal notice for overdue payments',
    message: `Dear {PARENT_NAME},\n\nThe fee payment for {STUDENT_NAME} (Class {GRADE}-{SECTION}) is now OVERDUE.\n\nOverdue Amount: {AMOUNT}\nOriginal Due Date: {DUE_DATE}\n\nPlease clear the payment immediately.\n\nBest regards,\n{ORGANIZATION_NAME}`,
  },
];

const ALL_CHANNELS = [
  { value: 'EMAIL', label: 'Email', icon: <GmailIcon width={16} height={16} /> },
  { value: 'SMS', label: 'SMS', icon: <Phone className="h-4 w-4 mr-1.5" color="blue" /> },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: <WhatsAppIcon /> },
  { value: 'PUSH', label: 'Push', icon: <BellRing className="h-4 w-4 mr-1.5" color="blue" /> },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// DIALOG
// ─────────────────────────────────────────────────────────────────────────────

interface SendReminderDialogProps {
  initialRecipients: FeeReminderRecipient[];
}

export function SendFeesReminderDialog({ initialRecipients = [] }: SendReminderDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMessage, setPreviewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'UNPAID' | 'OVERDUE'>('all');

  const filteredRecipients = useMemo(() =>
    initialRecipients.filter((r) => {
      const matchesSearch =
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.parentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.parentPhone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    }),
    [initialRecipients, searchTerm, statusFilter]);

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      recipients: initialRecipients.map((r) => r.id),
      channels: [],                         // empty = use org settings
      templateId: 'FEE_FRIENDLY_REMINDER',
      templateType: 'FEE_FRIENDLY_REMINDER',
      sendNow: true,
      scheduleDate: new Date(),
      scheduleTime: '10:30',
    },
  });

  const watchTemplateId = form.watch('templateId');
  const watchSendNow = form.watch('sendNow');
  const watchChannels = form.watch('channels') ?? [];

  useEffect(() => {
    const t = FeeReminderTemplates.find((t) => t.id === watchTemplateId);
    if (t) {
      setPreviewMessage(t.message);
      form.setValue('templateType', t.id as ReminderFormValues['templateType']);
    }
  }, [watchTemplateId, form]);

  const getPersonalizedPreview = (recipient: FeeReminderRecipient) =>
    previewMessage
      .replace('{PARENT_NAME}', recipient.parentName)
      .replace('{STUDENT_NAME}', recipient.studentName)
      .replace('{GRADE}', recipient.grade)
      .replace('{SECTION}', recipient.section)
      .replace('{DUE_DATE}', formatDateIN(recipient.dueDate))
      .replace('{AMOUNT}', recipient.amountDue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }))
      .replace('{ORGANIZATION_NAME}', recipient.organizationName || 'School Administration');

  async function onSubmit(data: ReminderFormValues) {
    setError(null);
    const toastId = toast.loading(
      `Sending reminders to ${data.recipients.length} recipient${data.recipients.length > 1 ? 's' : ''}...`
    );
    startTransition(() => {
      (async () => {
        try {
          const result = await sendFeeReminders({
            recipients: initialRecipients.filter((r) => data.recipients.includes(r.id)),
            templateType: data.templateType,
            scheduleDate: data.sendNow ? null : data.scheduleDate,
            scheduleTime: data.sendNow ? null : data.scheduleTime,
            // empty array = use org settings; selected channels = override
            channels: data.channels?.length ? data.channels : undefined,
          });

          if (result.success) {
            toast.success(
              result.message ?? (data.sendNow ? 'Reminders sent!' : 'Reminders scheduled!'),
              { id: toastId }
            );
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
          } else {
            const msg = result.error ?? 'Failed to process reminders';
            setError(msg);
            toast.error(msg, { id: toastId });
          }
        } catch (err) {
          setError('An unexpected error occurred');
          toast.error('An unexpected error occurred', { id: toastId });
          console.error(err);
        }
      })();
    });
  }

  return (
    <div>
      <div className="p-0">
        {success ? (
          <div className="py-6 flex flex-col items-center justify-center mx-2 px-2">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium">Reminders Sent Successfully!</h3>
            <p className="text-muted-foreground text-center mt-2">
              Your reminders have been sent to the selected recipients.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 overflow-auto flex-1">
              {error && (
                <Alert
                  variant={error.includes('already sent') && !error.includes('failed') ? 'default' : 'destructive'}
                  className={error.includes('already sent') && !error.includes('failed') ? 'border-amber-500 bg-amber-50 text-amber-900' : ''}
                >
                  <Info className={cn('h-4 w-4', error.includes('already sent') && !error.includes('failed') ? 'text-amber-600' : '')} />
                  <AlertTitle>
                    {error.includes('already sent') && !error.includes('failed') ? 'Notice' : 'Error'}
                  </AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Search + Filter */}
              <div className="space-y-4 ">
                <div className="flex flex-col sm:flex-row gap-2 p-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search recipients..." value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={statusFilter} onValueChange={(v: 'all' | 'UNPAID' | 'OVERDUE') => setStatusFilter(v)}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="UNPAID">Unpaid</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="flex-1"
                      disabled={filteredRecipients.length === 0}
                      onClick={() => form.setValue('recipients', filteredRecipients.map((r) => r.id))}>
                      Select All
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="flex-1"
                      onClick={() => { form.setValue('recipients', []); setSearchTerm(''); setStatusFilter('all'); }}>
                      Clear All
                    </Button>
                  </div>
                </div>
                <FormField control={form.control} name="recipients" render={({ field }) => (
                  <FormItem>
                    <div className="border rounded-lg bg-card overflow-hidden">
                      {filteredRecipients.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Mail className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">
                            {initialRecipients.length === 0 ? 'No recipients available' : 'No recipients found'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <ScrollArea className="h-[280px]">
                            <div className="p-3 space-y-2">
                              {filteredRecipients.map((recipient) => (
                                <RecipientCard key={recipient.id} recipient={recipient}
                                  isSelected={field.value?.includes(recipient.id)}
                                  onToggle={() => {
                                    const current = field.value || [];
                                    field.onChange(
                                      current.includes(recipient.id)
                                        ? current.filter((id) => id !== recipient.id)
                                        : [...current, recipient.id]
                                    );
                                  }} />
                              ))}
                            </div>
                          </ScrollArea>
                          <div className="border-t p-3 bg-muted/20 text-sm text-muted-foreground">
                            <strong>{field.value?.length || 0}</strong> of <strong>{filteredRecipients.length}</strong> selected
                          </div>
                        </>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

              </div>

              {/* Template */}
              <FormField control={form.control} name="templateId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Template</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FeeReminderTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Channel Override */}
              <FormField control={form.control} name="channels" render={() => (
                <FormItem>
                  <FormLabel>
                    Channels{' '}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      {watchChannels.length === 0
                        ? '— using organization settings'
                        : `— override: ${watchChannels.join(', ')}`}
                    </span>
                  </FormLabel>
                  <div className="flex flex-wrap gap-4">
                    {ALL_CHANNELS.map(({ value, label, icon }) => (
                      <FormField key={value} control={form.control} name="channels" render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(value)}
                              onCheckedChange={(checked) =>
                                field.onChange(
                                  checked
                                    ? [...(field.value ?? []), value]
                                    : (field.value ?? []).filter((v) => v !== value)
                                )
                              }
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer flex items-center space-x-2 gap-1">
                            {icon}{label}
                          </FormLabel>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded-md text-yellow-500 w-fit border border-yellow-100" >
                    Leave all unchecked to use channels configured in organization notification settings.
                  </p>
                  <FormMessage />
                </FormItem>
              )} />

              {/* When to Send */}
              <FormField control={form.control} name="sendNow" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>When to Send</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={(v) => field.onChange(v === 'now')}
                      defaultValue={field.value ? 'now' : 'schedule'} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="now" /></FormControl>
                        <FormLabel className="font-normal">Send immediately</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="schedule" /></FormControl>
                        <FormLabel className="font-normal">
                          Schedule for later <Badge variant="meta">Meta Feature</Badge>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {!watchSendNow && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="scheduleDate" render={({ field }) => (
                    <FormItem className="flex flex-col gap-3">
                      <FormLabel className="px-1">Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn('justify-between font-normal', !field.value && 'text-muted-foreground')}>
                              {field.value ? format(field.value, 'PPP') : 'Select date'}<ChevronDownIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange}
                            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="scheduleTime" render={({ field }) => (
                    <FormItem className="flex flex-col gap-3">
                      <FormLabel className="px-1">Time</FormLabel>
                      <FormControl>
                        <Input type="time" step="60" {...field}
                          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {/* Message Preview */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Message Preview</h3>
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Template</TabsTrigger>
                    <TabsTrigger value="personalized">Personalized</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="mt-2">
                    <div className="border rounded-md p-4 bg-muted/30 text-sm whitespace-pre-wrap leading-relaxed">
                      {previewMessage
                        ? <HighlightedMessage message={previewMessage} />
                        : <span className="text-muted-foreground">No message content</span>}
                    </div>
                  </TabsContent>
                  <TabsContent value="personalized" className="mt-2">
                    {form.watch('recipients').length > 0 ? (
                      <div className="border rounded-md p-4 bg-muted/30 text-sm whitespace-pre-wrap">
                        {getPersonalizedPreview(initialRecipients.find((r) => r.id === form.watch('recipients')[0])!)}
                      </div>
                    ) : (
                      <div className="border rounded-md p-4 bg-muted/30 text-center text-muted-foreground text-sm">
                        Select at least one recipient to see personalized preview
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </form>
          </Form>
        )}
      </div>

      {!success && (
        <div className="flex justify-end space-x-4 mt-5">
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
              : <><Send className="mr-2 h-4 w-4" />{form.watch('sendNow') ? 'Send Reminders' : 'Schedule Reminders'}</>}
          </Button>
        </div>
      )}
    </div>
  );
}

function HighlightedMessage({ message }: { message: string }) {
  return (
    <>
      {message.split(/(\{[\w_]+\})/g).map((part, i) =>
        /\{[\w_]+\}/.test(part)
          ? <span key={i} className="font-medium text-blue-500">{part}</span>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

const RecipientCard = ({ recipient, isSelected, onToggle }: {
  recipient: FeeReminderRecipient;
  isSelected: boolean;
  onToggle: () => void;
}) => {
  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }
  const term = useTerminology()

  const isOverdue = recipient.status === 'OVERDUE';

  const avatarColors = [
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-orange-100 text-orange-700',
    'bg-rose-100 text-rose-700',
  ];
  const colorIndex = recipient.studentName.charCodeAt(0) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  return (
    <div
      onClick={onToggle}
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 select-none',
        isSelected
          ? 'border-[1.5px] border-blue-400 bg-background'
          : 'border border-border bg-background hover:border-border/80 hover:bg-muted/30',
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        'flex-shrink-0 w-9 h-9 ring-1 ring-border/50 mt-0.5',
        isSelected ? 'bg-blue-100 text-blue-700' : avatarColor,
      )}>
        <AvatarImage src={recipient.avatar || ''} alt={recipient.studentName} className="object-cover" />
        <AvatarFallback className="bg-transparent text-sm font-medium text-inherit">
          {getInitials(recipient.studentName)}
        </AvatarFallback>
      </Avatar>

      {/* Main content — takes all remaining space */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">

        {/* Row 1: name + badge + amount (amount floats right) */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground truncate">
            {recipient.studentName}
          </span>
          <span className={cn(
            'flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full',
            isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
          )}>
            {isOverdue ? 'Overdue' : 'Unpaid'}
          </span>
          <span className={cn(
            'ml-auto flex-shrink-0 text-sm font-medium',
            isOverdue ? 'text-red-600' : 'text-foreground',
          )}>
            {recipient.amountDue.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        {/* Row 2: parent · class + due date (due date floats right) */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="flex-shrink-0">{term.grade} {recipient.grade}-{recipient.section}</span>
          <span className="ml-auto flex-shrink-0 text-[11px]">
            Due {formatDateIN(recipient.dueDate)}
          </span>
        </div>
        {/* Row 3: contact chips — wrap naturally on narrow screens */}
        <div className='flex items-center justify-between'>
          <div>
            <span className="truncate min-w-0 text-xs text-muted-foreground">
              {recipient.parentName}
            </span>
          </div>
          <div>
            {(recipient.parentPhone || recipient.parentWhatsAppNumber) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                {recipient.parentPhone && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    {recipient.parentPhone}
                  </span>
                )}
                {recipient.parentWhatsAppNumber && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <WhatsAppIcon />
                    {recipient.parentWhatsAppNumber}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Checkbox — aligned to top */}
      <div className={cn(
        'flex-shrink-0 w-[18px] h-[18px] mt-0.5 rounded border flex items-center justify-center transition-colors',
        isSelected ? 'bg-blue-500 border-blue-500' : 'border-border bg-transparent',
      )}>
        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
      </div>
    </div>
  );
};
