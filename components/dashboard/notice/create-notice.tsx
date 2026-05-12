'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarIcon,
  Upload,
  X,
  FileText,
  AlertCircle,
  Mail,
  Smartphone,
  Bell,
  Pin,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn, toISTDate } from '@/lib/utils';
import { createNoticeFormData, createNoticeSchema } from '@/lib/schemas';
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from '@/components/ui/file-uploader';
import { createNotice } from '@/lib/data/notice/create-notice-action';
import { NoticeType, NoticePriority } from '@/generated/prisma/enums';
import { CloudinaryUploadResult, uploadToCloudinary } from '@/lib/cloudinary';
import { AudienceSelector } from './audience-selector';
import { WhatsApp } from '@/components/website/Icons';
import { useTerminology } from '@/context/terminology';

// https://www.diceui.com/docs/components/file-upload

interface Props {
  grades: {
    id: string;
    grade: string;
    section: {
      id: string;
      name: string;
      gradeId: string
    }[]
  }[];
}

const CHANNELS = [
  {
    name: 'emailNotification' as const,
    label: 'Email',
    description: 'Send via email',
    icon: Mail,
    iconBg: 'bg-rose-100 dark:bg-rose-950',
    iconColor: 'text-rose-500',
  },
  {
    name: 'pushNotification' as const,
    label: 'Push',
    description: 'In-app notification',
    icon: Bell,
    iconBg: 'bg-amber-100 dark:bg-amber-950',
    iconColor: 'text-amber-500',
  },
  {
    name: 'whatsAppNotification' as const,
    label: 'WhatsApp',
    description: 'Send via WhatsApp',
    icon: null, // custom SVG below
    iconBg: 'bg-green-100 dark:bg-green-950',
    iconColor: 'text-green-500',
  },
  {
    name: 'smsNotification' as const,
    label: 'SMS',
    description: 'Send via SMS',
    icon: Smartphone,
    iconBg: 'bg-blue-100 dark:bg-blue-950',
    iconColor: 'text-blue-500',
  },
] as const;
function htmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  function walk(node: Node, depth = 0): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const children = Array.from(el.childNodes);

    if (tag === 'br') return '\n';

    if (tag === 'li') {
      const indent = '   '.repeat(depth);
      const content = children.map((c) => walk(c, depth)).join('').trim();
      return `${indent}• ${content}\n`;
    }

    if (tag === 'ul' || tag === 'ol') {
      return children.map((c) => walk(c, depth + 1)).join('');
    }

    const inner = children.map((c) => walk(c, depth)).join('');

    if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      return inner.trim() ? `${inner.trim()}\n` : '';
    }

    return inner;
  }

  return walk(doc.body).replace(/\n{3,}/g, '\n\n').trim();
}

function convertBullets(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/^(\s*)\*\s+/, (_, indent) => `${indent}• `))
    .join('\n');
}
export default function CreateNotice({ grades }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const term = useTerminology()
  const form = useForm<createNoticeFormData>({
    resolver: zodResolver(createNoticeSchema),
    defaultValues: {
      title: '',
      content: '',
      summary: '',
      startDate: new Date(),
      endDate: new Date(),
      noticeType: 'GENERAL',
      priority: 'MEDIUM',
      isUrgent: false,
      isPinned: false,
      targetRoles: [],
      targetGrades: [],
      targetSections: [],

      emailNotification: true,
      pushNotification: false,
      whatsAppNotification: false,
      smsNotification: false,

      attachments: [],
    },
  });

  const isUrgent = form.watch('isUrgent');

  const onSubmit = async (data: createNoticeFormData) => {
    startTransition(async () => {
      try {
        const uploadedAttachments: CloudinaryUploadResult[] = await Promise.all(
          uploadedFiles.map((file) => uploadToCloudinary(file))
        );

        await createNotice({ ...data, attachments: uploadedAttachments });
        toast.success('Notice submitted for approval', {
          description: `"${data.title}" is pending review.`,
        });

        router.push('/dashboard/notices');
        form.reset();
        setUploadedFiles([]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Something went wrong'
        );
      }
    });
  };
  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);


  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Create Notice</CardTitle>
            <CardDescription className="text-xs mt-0">
              Compose and send a notice to your organization.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Section label="Content">
              {/* Urgent toggle — top because it affects everything */}
              <FormField
                control={form.control}
                name="isUrgent"
                render={({ field }) => (
                  <FormItem className={cn(
                    'flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors',
                    isUrgent
                      ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/30'
                      : 'border-border bg-muted/30'
                  )}>
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className={cn(
                        'h-4 w-4 flex-shrink-0',
                        isUrgent ? 'text-rose-500' : 'text-muted-foreground'
                      )} />
                      <div>
                        <FormLabel className={cn(
                          'text-sm font-medium cursor-pointer',
                          isUrgent ? 'text-rose-700 dark:text-rose-400' : 'text-foreground'
                        )}>
                          Mark as urgent
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Bypasses cooldown — sends immediately
                        </FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title <Required /></FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`e.g. ${term.institute} closed — Diwali break`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type + Priority row */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="noticeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type <Required /></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(NoticeType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0) + type.slice(1).toLowerCase()}
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(NoticePriority).map((p) => (
                            <SelectItem key={p} value={p}>
                              <Badge variant={p as any} className="text-xs">
                                {p.charAt(0) + p.slice(1).toLowerCase()}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Summary */}
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Summary
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        (shown in notifications)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="One-line summary parents/students will see in WhatsApp or push..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full content <Required /></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed notice content..."
                        className="min-h-[120px] resize-y"
                        rows={5}
                        {...field}
                        onPaste={(e) => {
                          e.preventDefault();

                          const html = e.clipboardData.getData('text/html');
                          const plain = e.clipboardData.getData('text/plain');

                          const cleaned = html ? htmlToPlainText(html) : convertBullets(plain);

                          const el = e.target as HTMLTextAreaElement;
                          const start = el.selectionStart;
                          const end = el.selectionEnd;
                          const current = field.value ?? '';
                          const next = current.slice(0, start) + cleaned + current.slice(end);
                          field.onChange(next);

                          requestAnimationFrame(() => {
                            el.selectionStart = el.selectionEnd = start + cleaned.length;
                          });
                        }}
                        onInput={(e) => {
                          const t = e.target as HTMLTextAreaElement;
                          t.style.height = 'auto';
                          t.style.height = `${t.scrollHeight}px`;
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            <Separator />

            {/* ── Section: Duration ── */}
            <Section label="Duration">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start date <Required /></FormLabel>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disableBefore={toISTDate(new Date())}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End date <Required /></FormLabel>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disableBefore={form.watch('startDate') ?? toISTDate(new Date())}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            <Separator />

            {/* ── Section: Audience ── */}
            <Section label="Audience">
              <AudienceSelector form={form} grades={grades} />
            </Section>

            <Separator />
            <FormField
              control={form.control}
              name="isPinned"
              render={({ field }) => (
                <FormItem className={cn(
                  'flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors cursor-pointer',
                  field.value
                    ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/30'
                    : 'border-border bg-muted/30'
                )}>
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                      field.value ? 'bg-amber-100 dark:bg-amber-900' : 'bg-muted'
                    )}>
                      <Pin className={cn('h-4 w-4', field.value ? 'text-amber-600' : 'text-muted-foreground')} />
                    </div>
                    <div>
                      <FormLabel className={cn(
                        'text-sm font-medium cursor-pointer',
                        field.value ? 'text-amber-800 dark:text-amber-400' : 'text-foreground'
                      )}>
                        Pin to notice board
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Appears at the top for all users
                      </FormDescription>
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Section label="Send via">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHANNELS.map((channel) => (
                  <FormField
                    key={channel.name}
                    control={form.control}
                    name={channel.name}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn('rounded-lg p-1.5', channel.iconBg)}>
                            {channel.name === 'whatsAppNotification' ? (
                              <WhatsApp className={cn('h-4 w-4', channel.iconColor)} />
                            ) : (
                              channel.icon && (
                                <channel.icon className={cn('h-4 w-4', channel.iconColor)} />
                              )
                            )}
                          </div>
                          <div>
                            <FormLabel className="text-sm font-medium cursor-pointer">
                              {channel.label}
                            </FormLabel>
                            <FormDescription className="text-xs">
                              {channel.description}
                            </FormDescription>
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value as boolean}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </Section>

            <Separator />

            <Section label="Attachments">
              <FileUpload
                maxFiles={4}
                maxSize={5 * 1024 * 1024}
                className="w-full"
                value={uploadedFiles}
                onValueChange={setUploadedFiles}
                onFileReject={onFileReject}
                multiple
              >
                <FileUploadDropzone className="rounded-xl border-dashed border-2 border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex flex-col items-center gap-2 py-2 text-center">
                    <div className="rounded-full border border-border bg-background p-2.5">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">Drag & drop files</p>
                    <p className="text-xs text-muted-foreground">
                      Up to 4 files · 5MB each · PDF, images, docs
                    </p>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-1">
                      Browse files
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>

                {uploadedFiles.length > 0 && (
                  <FileUploadList className="mt-3 space-y-2">
                    {uploadedFiles.map((file, i) => (
                      <FileUploadItem
                        key={i}
                        value={file}
                        className="rounded-lg border border-border bg-background px-3 py-2"
                      >
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                )}
              </FileUpload>
            </Section>

            {/* Submit Buttons */}
            <Button disabled={isPending} className="flex-1 ">
              {isPending ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card >
  );
}
// ─── Small helpers ─────────────────────────────────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Required() {
  return <span className="text-rose-500 ml-0.5">*</span>;
}
function DatePicker({
  value,
  onChange,
  disableBefore,
}: {
  value: Date;
  onChange: (d: Date) => void;
  disableBefore: Date;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
          {value ? format(value, 'dd MMM yyyy') : 'Pick a date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => d && onChange(d)}
          disabled={(d) => d < disableBefore}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}