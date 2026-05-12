'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText, Download, CheckCircle, XCircle, User, Calendar,
  Clock, AlertCircle, Eye, ExternalLink, Loader2, Info,
  MessageSquare, Lightbulb, FileType,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { formatBytes, formatDateIN } from '@/lib/utils';
import { DOCUMENT_TYPE_LABELS, DocumentVerificationStatus, type DocumentWithStudent } from '@/types/document';
import { documentRejectionReasons } from '@/constants';

// ─── Types ──────────────────────────────────────────────────────────────────

// type DocumentStatus = DocumentVerificationStatus;

interface DocumentVerificationDialogProps {
  document: DocumentWithStudent | null;
  verificationNote: string;
  setVerificationNote: (note: string) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onApprove: (documentId: string) => Promise<void>;
  onReject: (documentId: string) => Promise<void>;
  isApprovePending: boolean;
  isRejectPending: boolean;
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function getDocumentStatus(doc: DocumentWithStudent): DocumentVerificationStatus {
  if (doc.verified) return DocumentVerificationStatus.VERIFIED;
  if (doc.rejected) return DocumentVerificationStatus.REJECTED;
  return DocumentVerificationStatus.PENDING;
}

function getRandomRejectionReason(type: keyof typeof documentRejectionReasons): string {
  const reasons = documentRejectionReasons[type] ?? [];
  if (!reasons.length) return 'No rejection reasons found for this document type.';
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function downloadDocument(doc: DocumentWithStudent) {
  const link = document.createElement('a');
  link.href = doc.documentUrl;
  link.download = doc.fileName ?? `${DOCUMENT_TYPE_LABELS[doc.type]}.${doc.documentUrl.split('.').pop()}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value ?? 'N/A'}</span>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <Separator />
      {children}
    </div>
  );
}

function StatusBanner({ status, doc }: { status: DocumentVerificationStatus; doc: DocumentWithStudent }) {
  const isApproved = status === DocumentVerificationStatus.VERIFIED;

  return (
    <div className={`rounded-xl border-2 p-4 space-y-3 ${isApproved
      ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20'
      : 'border-red-200 bg-red-50/60 dark:border-red-800 dark:bg-red-950/20'
      }`}>
      <div className="flex items-center gap-2">
        {isApproved
          ? <CheckCircle className="w-5 h-5 text-emerald-600" />
          : <XCircle className="w-5 h-5 text-red-600" />
        }
        <span className={`font-semibold ${isApproved ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>
          Document {isApproved ? 'Approved' : 'Rejected'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoRow
          label={isApproved ? 'Verified By' : 'Rejected By'}
          value={doc.verifiedBy ?? doc.rejectedBy}
        />
        <InfoRow
          label="Date"
          value={formatDateIN(doc.verifiedAt ?? doc.rejectedAt ?? 'N/A')}
        />
      </div>

      {status === DocumentVerificationStatus.REJECTED && doc.rejectReason && (
        <Alert className="border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-1">
            <p className="font-medium text-sm">Rejection Reason</p>
            <p className="text-sm whitespace-pre-wrap">{doc.rejectReason}</p>
          </AlertDescription>
        </Alert>
      )}

      {doc.note && (
        <Alert className="border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4" />
          <AlertDescription className="space-y-1">
            <p className="font-medium text-sm">Verification Notes</p>
            <p className="text-sm whitespace-pre-wrap">{doc.note}</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function VerificationActions({
  doc,
  verificationNote,
  setVerificationNote,
  rejectionReason,
  setRejectionReason,
  onApprove,
  onReject,
  isApprovePending,
  isRejectPending,
}: Omit<DocumentVerificationDialogProps, 'document'> & { doc: DocumentWithStudent }) {
  const isBusy = isApprovePending || isRejectPending;
  const canApprove = !isBusy && !rejectionReason.trim();
  const canReject = !isBusy && !!rejectionReason.trim();

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-600" />
        <span className="font-semibold text-amber-800 dark:text-amber-200">
          Pending Verification
        </span>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="verification-note" className="text-sm font-medium flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4" />
          Notes
          <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Textarea
          id="verification-note"
          placeholder="Add notes about the document verification…"
          value={verificationNote}
          onChange={(e) => setVerificationNote(e.target.value)}
          className="min-h-[72px] resize-none text-sm"
          disabled={isBusy}
        />
      </div>

      {/* Rejection Reason */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="rejection-reason" className="text-sm font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-destructive" />
            Rejection Reason
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setRejectionReason(getRandomRejectionReason(doc.type))}
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            disabled={isBusy}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Suggest
          </Button>
        </div>
        <Textarea
          id="rejection-reason"
          placeholder="Reason for rejection…"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="min-h-[72px] resize-none text-sm"
          disabled={isBusy}
        />
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => onApprove(doc.id)}
          disabled={!canApprove}
          className="bg-green-500 hover:bg-green-600 text-white font-medium"
        >
          {isApprovePending
            ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
            : <CheckCircle className="w-4 h-4 mr-2" />
          }
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => onReject(doc.id)}
          disabled={!canReject}
          className="font-medium"
        >
          {isRejectPending
            ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
            : <XCircle className="w-4 h-4 mr-2" />
          }
          Reject
        </Button>
      </div>
    </div>
  );
}

function DocumentPreview({ doc }: { doc: DocumentWithStudent }) {
  const [isLoading, setIsLoading] = useState(true);
  const isPDF = doc.fileType === 'application/pdf';
  const isImage = doc.fileType?.startsWith('image/');

  // Reset loading state when document changes
  useEffect(() => { setIsLoading(true); }, [doc.id]);

  const handleDownload = () => downloadDocument(doc);
  const handleOpenInNewTab = () => window.open(doc.documentUrl, '_blank', 'noopener,noreferrer');

  return (
    <div className="flex flex-col h-[70vh] min-h-[400px] gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-sm truncate">
            {doc.fileName ?? DOCUMENT_TYPE_LABELS[doc.type]}
          </span>
          {doc.fileSize && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {formatBytes(doc.fileSize)}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload} size="sm" variant="outline" className="h-8 text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button onClick={handleOpenInNewTab} size="sm" variant="outline" className="h-8 text-xs">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">New Tab</span>
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 overflow-hidden min-h-0">
        {isLoading && (isPDF || isImage) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading preview…
            </div>
          </div>
        )}

        {isPDF && (
          <iframe
            src={doc.documentUrl}
            className="w-full h-full border-0"
            title={`Preview of ${DOCUMENT_TYPE_LABELS[doc.type]}`}
            onLoad={() => setIsLoading(false)}
          />
        )}

        {isImage && (
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={doc.documentUrl ?? '/placeholder.svg'}
              alt={DOCUMENT_TYPE_LABELS[doc.type]}
              className="max-w-full max-h-full object-contain rounded-lg"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        )}

        {!isPDF && !isImage && (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold mb-1">Preview Not Available</p>
              <p className="text-sm text-muted-foreground mb-4">
                This file type cannot be previewed in the browser
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" /> Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DocumentVerificationDialog({
  document: doc,
  verificationNote,
  setVerificationNote,
  rejectionReason,
  setRejectionReason,
  onApprove,
  onReject,
  isApprovePending,
  isRejectPending,
}: DocumentVerificationDialogProps) {
  if (!doc) return null;

  const status = getDocumentStatus(doc);
  const isPending = status === DocumentVerificationStatus.PENDING;

  return (
    <Tabs defaultValue="details" className="flex flex-col">
      {/* Tab Bar */}
      <TabsList className="grid w-full grid-cols-2 flex-shrink-0 mb-4 h-10">
        <TabsTrigger value="details" className="gap-2 text-sm">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Details</span>
          <span className="sm:hidden">Details</span>
        </TabsTrigger>
        <TabsTrigger value="preview" className="gap-2 text-sm">
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Preview</span>
          <span className="sm:hidden">Preview</span>
        </TabsTrigger>
      </TabsList>

      {/* Details Tab */}
      <TabsContent value="details" className="m-0">
        <div className="overflow-y-auto max-h-[60vh] sm:max-h-[70vh] pr-1 pb-8">
          <div className="space-y-4 pb-2">
            {/* Student Header */}
            <div className="flex items-center gap-3 rounded-xl bg-muted/40 border p-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={doc.student.profileImage || undefined} alt={`${doc.student.firstName} ${doc.student.lastName}`} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {doc.student.firstName?.[0]}{doc.student.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {doc.student.firstName} {doc.student.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Roll {doc.student.rollNumber} · Grade {doc.student.grade.grade}-{doc.student.section.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Left column: Document info + Timeline */}
              <div className="space-y-4">
                <SectionCard icon={FileType} title="Document Information">
                  <div className="space-y-3">
                    <InfoRow label="Document Type" value={DOCUMENT_TYPE_LABELS[doc.type]} />
                    <InfoRow label="File Name" value={<span className="break-all">{doc.fileName}</span>} />
                    <div className="grid grid-cols-2 gap-3">
                      <InfoRow label="File Size" value={doc.fileSize ? formatBytes(doc.fileSize) : undefined} />
                      <InfoRow label="File Type" value={doc.fileType} />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard icon={Calendar} title="Timeline">
                  <div className="space-y-3">
                    <InfoRow label="Upload Date" value={formatDateIN(doc.uploadedAt)} />
                    {(doc.verifiedAt || doc.rejectedAt) && (
                      <>
                        <InfoRow
                          label={status === DocumentVerificationStatus.VERIFIED ? 'Verification Date' : 'Rejection Date'}
                          value={formatDateIN(doc.verifiedAt ?? doc.rejectedAt ?? 'N/A')}
                        />
                        <InfoRow
                          label={status === DocumentVerificationStatus.VERIFIED ? 'Verified By' : 'Rejected By'}
                          value={doc.verifiedBy ?? doc.rejectedBy}
                        />
                      </>
                    )}
                  </div>
                </SectionCard>
              </div>

              {/* Right column: Status / Actions */}
              <div>
                {isPending ? (
                  <VerificationActions
                    doc={doc}
                    verificationNote={verificationNote}
                    setVerificationNote={setVerificationNote}
                    rejectionReason={rejectionReason}
                    setRejectionReason={setRejectionReason}
                    onApprove={onApprove}
                    onReject={onReject}
                    isApprovePending={isApprovePending}
                    isRejectPending={isRejectPending}
                  />
                ) : (
                  <StatusBanner status={status} doc={doc} />
                )}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="preview" className="m-0">
        <DocumentPreview doc={doc} />
      </TabsContent>
    </Tabs>
  );
}
