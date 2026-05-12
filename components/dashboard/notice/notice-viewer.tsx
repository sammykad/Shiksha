'use client';

import { useState, useTransition } from 'react';
import {
  CalendarRange, Bell, Paperclip, CheckCircle, XCircle,
  Eye, Download, Calendar, AlertTriangle, FileText,
  Pin, MapPin, Send,
} from 'lucide-react';
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, formatBytes, formatDateIN } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';
import { Role } from '@/generated/prisma/enums';
import { Prisma } from '@/generated/prisma/client';
import { updateNoticeApprovalStatus } from '@/lib/data/notice/update-notice-approval-status';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NoticeWithAttachments = Prisma.NoticeGetPayload<{
  include: { attachments: true };
}>;

interface Props {
  notice: NoticeWithAttachments;
  userRole: Role;
  gradeNames: Record<string, string>;
  sectionsByGrade: Record<string, { id: string; name: string }[]>;
}

// ─── Pure helpers (no side effects, no hooks) ─────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

function isImage(fileType: string) {
  return fileType.startsWith('image/');
}

function buildAudienceSummary(
  notice: NoticeWithAttachments,
  gradeNames: Record<string, string>,
): string {
  const roles = notice.targetRoles as string[];
  const grades = notice.targetGrades as string[];

  if (['STUDENT', 'PARENT', 'TEACHER', 'ADMIN'].every((r) => roles.includes(r)))
    return 'Entire school';

  if (roles.every((r) => r === 'TEACHER' || r === 'ADMIN') && grades.length === 0)
    return 'Teachers & Admins';

  const who = (() => {
    const has = (r: string) => roles.includes(r);
    if (has('STUDENT') && has('PARENT')) return 'Students & Parents';
    if (has('STUDENT')) return 'Students';
    if (has('PARENT')) return 'Parents';
    return roles.join(', ');
  })();

  if (grades.length === 0) return who;

  const gradeLabels = grades.map((id) => gradeNames[id] ?? id).join(', ');
  return `${who} — ${gradeLabels}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const CHANNELS = [
  { key: 'emailNotification', label: 'Email', className: 'bg-rose-50   text-rose-700' },
  { key: 'pushNotification', label: 'Push', className: 'bg-purple-50 text-purple-700' },
  { key: 'whatsAppNotification', label: 'WhatsApp', className: 'bg-green-50  text-green-700' },
  { key: 'smsNotification', label: 'SMS', className: 'bg-amber-50  text-amber-700' },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NoticeViewer({
  notice, userRole, gradeNames, sectionsByGrade,
}: Props) {
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [previewAtt, setPreviewAtt] = useState<NoticeWithAttachments['attachments'][number] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);

  const audienceSummary = buildAudienceSummary(notice, gradeNames);
  const activeChannels = CHANNELS.filter((c) => notice[c.key as keyof typeof notice]);
  const targetGrades = notice.targetGrades as string[];
  const hasGradeScope = targetGrades.length > 0;

  function handleApprove() {
    setPendingAction('approve');
    startTransition(async () => {
      try {
        await updateNoticeApprovalStatus(notice.id, true);
        toast.success('Notice published successfully');
      } catch (e: any) {
        toast.error(e.message ?? 'Failed to publish');
      } finally { setPendingAction(null); }
    });
  }

  function handleReject() {
    setPendingAction('reject');
    startTransition(async () => {
      try {
        await updateNoticeApprovalStatus(notice.id, false);
        toast.success('Notice rejected');
      } catch {
        toast.error('Something went wrong');
      } finally { setPendingAction(null); }
    });
  }

  return (
    <Card className="w-full">

      {/* ── Header ── */}
      <CardHeader className='bg-muted/30'>
        {/* Urgent banner — only when urgent */}
        {notice.isUrgent && (
          <div className="flex items-center gap-2 mb-3 bg-rose-50 p-3 rounded-md text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="text-[10px]  font-semibold uppercase tracking-widest">
              Urgent notice — immediate attention required
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={notice.noticeType} className="text-xs uppercase tracking-wide">
                {notice.noticeType}
              </Badge>
              <Badge variant={notice.priority} className="text-xs">
                {notice.priority}
              </Badge>
              {notice.isPinned && (
                <Badge variant="outline" className="text-xs gap-1 border-amber-300 bg-amber-50 text-amber-700">
                  <Pin className="h-3 w-3" /> Pinned
                </Badge>
              )}
              <Badge variant={notice.status} className="text-xs">
                {notice.status.replaceAll('_', ' ')}
              </Badge>
            </div>

            <CardTitle className={cn(
              "text-xl lg:text-2xl leading-tight",
              notice.isUrgent && "text-rose-700 dark:text-rose-400"
            )}>
              {notice.title}
            </CardTitle>

            <CardDescription className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateIN(notice.startDate)} – {formatDateIN(notice.endDate)}
            </CardDescription>
          </div>

          {userRole === 'ADMIN' && notice.status === 'PENDING_REVIEW' && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm" disabled={isPending} onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {pendingAction === 'approve' ? 'Publishing…' : 'Approve & Publish'}
              </Button>
              <Button
                size="sm" variant="outline" disabled={isPending} onClick={handleReject}
                className="border-rose-200 text-rose-600 hover:bg-rose-50 gap-2"
              >
                <XCircle className="h-4 w-4" />
                {pendingAction === 'reject' ? 'Rejecting…' : 'Reject'}
              </Button>
            </div>
          )}

          {userRole === 'ADMIN' && notice.status === 'PUBLISHED' && (
            <Button
              size="sm" variant="outline" disabled={isPending} onClick={handleReject}
              className="border-rose-200 text-rose-600 hover:bg-rose-50 flex-shrink-0 gap-2"
            >
              <XCircle className="h-4 w-4" />
              {isPending ? 'Processing…' : 'Revoke'}
            </Button>
          )}
        </div>
      </CardHeader>

      {/* ── Body ── */}
      <CardContent className="p-6 space-y-6">

        {/* Summary callout */}
        {notice.summary && (
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/40 p-6">
            <FileText className="absolute right-4 top-4 h-16 w-16 text-blue-200 opacity-60" />
            <SectionLabel>Summary</SectionLabel>
            <p className="text-lg font-medium text-slate-700 leading-relaxed italic">
              "{notice.summary}"
            </p>
          </div>
        )}

        {/* Full content */}
        <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
          {notice.content}
        </div>

        <Separator />

        {/* To */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">To</span>
          </div>
          <div className="ml-6 space-y-3">
            <p className="text-sm font-medium text-foreground">{audienceSummary}</p>

            {hasGradeScope && (
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                {targetGrades.map((gradeId) => {
                  const sections = sectionsByGrade[gradeId] ?? [];
                  return (
                    <div key={gradeId} className="flex items-center gap-4 px-4 py-2.5 bg-background">
                      <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {gradeNames[gradeId] ?? gradeId}
                        </span>
                      </div>
                      <div className="h-4 w-px bg-border flex-shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {sections.length > 0
                          ? sections.map((s) => (
                            <Badge key={s.id} variant="secondary" className="text-xs h-5 px-2">
                              Section {s.name}
                            </Badge>
                          ))
                          : <span className="text-xs text-muted-foreground">All sections</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sent via */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sent via</span>
          </div>
          <div className="flex flex-wrap gap-1.5 ml-6">
            {activeChannels.length > 0
              ? activeChannels.map((c) => (
                <Badge key={c.key} variant="outline" className={`text-xs border-transparent ${c.className}`}>
                  {c.label}
                </Badge>
              ))
              : <span className="text-sm text-muted-foreground">None selected</span>
            }
          </div>
        </div>

        {/* Attachments */}
        {notice.attachments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Attachments ({notice.attachments.length})
              </span>
            </div>

            <div className="ml-6">
              <Button variant="outline" size="sm" onClick={() => setAttachmentsOpen(true)} className="gap-2 cursor-pointer">
                <Paperclip className="h-3.5 w-3.5" /> View attachments
              </Button>
            </div>

            {/* Attachment list dialog */}
            <Dialog open={attachmentsOpen} onOpenChange={setAttachmentsOpen}>
              <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Attachments</DialogTitle>
                  <DialogDescription>Files attached to this notice</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  {notice.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{att.fileName}</p>
                          <p className="text-xs text-muted-foreground">{formatBytes(att.fileSize)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {isImage(att.fileType) && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewAtt(att)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={att.fileUrl} download={att.fileName} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Image preview dialog */}
            <Dialog open={!!previewAtt} onOpenChange={(o) => !o && setPreviewAtt(null)}>
              <DialogContent className="sm:max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="truncate">{previewAtt?.fileName}</DialogTitle>
                </DialogHeader>
                <div className="relative w-full h-[60vh] bg-muted rounded-xl overflow-hidden">
                  {previewAtt && (
                    <Image
                      src={previewAtt.fileUrl}
                      alt={previewAtt.fileName}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 80vw"
                    />
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" asChild className="gap-2 cursor-pointer">
                    <a href={previewAtt?.fileUrl ?? '#'} download={previewAtt?.fileName} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" /> Download
                    </a>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>

      {/* ── Footer ── */}
      <CardFooter className="border-t bg-muted/30 px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-muted">
                {getInitials(notice.publishedBy ?? notice.createdBy)}
              </AvatarFallback>
            </Avatar>
            <span>
              {notice.publishedBy
                ? `Published by ${notice.publishedBy}`
                : `Created by ${notice.createdBy}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarRange className="h-3.5 w-3.5" />
            <span>{formatDateIN(notice.createdAt)}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}