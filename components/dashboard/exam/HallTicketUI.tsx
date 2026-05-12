'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Printer,
  User,
  GraduationCap,
  ShieldCheck,
  Info,
  Building2,
} from 'lucide-react';
import { formatDateIN, formatDateTimeIN, formatDuration } from '@/lib/utils';
import { Prisma } from '@/generated/prisma/client';
import QRCode from 'qrcode';

type StudentHallTicketData = Prisma.HallTicketGetPayload<{
  select: {
    id: true;
    generatedAt: true;
    pdfUrl: true;
    qrCode: true;
    expiryDate: true;
    organization: {
      select: {
        name: true;
        logo: true;
        contactEmail: true;
        contactPhone: true;
        website: true;
      };
    };
    student: {
      select: {
        firstName: true;
        lastName: true;
        rollNumber: true;
        profileImage: true;
        grade: { select: { grade: true } };
        section: { select: { name: true } };
        email: true;
        phoneNumber: true;
      };
    };
    examSession: {
      select: {
        title: true;
        startDate: true;
        endDate: true;
      };
    };
    exam: {
      select: {
        id: true;
        title: true;
        subject: { select: { name: true; code: true } };
        startDate: true;
        endDate: true;
        venue: true;
        mode: true;
        durationInMinutes: true;
      };
    };
  };
}>;

interface HallTicketUIProps {
  data: StudentHallTicketData;
}

const INSTRUCTIONS = [
  'Report to the examination centre 45 minutes before commencement.',
  'Carry a physical copy of this hall ticket at all times during the examination.',
  'Electronic devices, calculators, and smartwatches are strictly prohibited.',
  'Present a valid government-issued photo ID along with this ticket.',
  'Tampering with this document renders it null and void immediately.',
];

export default function HallTicketUI({ data }: HallTicketUIProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(
      JSON.stringify({
        id: data.id,
        student: `${data.student.firstName} ${data.student.lastName}`,
        roll: data.student.rollNumber,
        exam: data.exam?.title ?? data.examSession?.title,
        org: data.organization.name,
      }),
      { width: 128, margin: 1, color: { dark: '#000', light: '#fff' } }
    )
      .then(setQrCodeUrl)
      .catch(console.error);
  }, [data]);

  const handleDownload = () => {
    if (data.pdfUrl) {
      window.open(data.pdfUrl, '_blank');
    } else {
      setIsGenerating(true);
      setTimeout(() => setIsGenerating(false), 2000);
    }
  };

  const ticketId = data.id.slice(-10).toUpperCase();

  return (
    <div className="print:bg-white print:p-0">

      {/* Toolbar */}
      <div className="no-print  mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3 rounded-lg border border-border bg-background px-4 py-3">
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-foreground leading-none">Hall Ticket Preview</p>
              <p className="text-xs text-muted-foreground mt-0.5">ID · {ticketId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 h-8 text-xs">
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button size="sm" onClick={handleDownload} disabled={isGenerating} className="gap-1.5 h-8 text-xs">
              {isGenerating
                ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                : <Download className="h-3.5 w-3.5" />}
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Hall Ticket */}
      <div className="print:max-w-none">
        <div className="bg-background border border-border rounded-xl overflow-hidden print:rounded-none print:shadow-none">
          {/* Header */}
          <div className="border-b border-border px-7 py-5 print:px-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {data.organization.logo
                    ? <img src={data.organization.logo} alt="Logo" className="h-full w-full object-contain p-1" />
                    : <Building2 className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="space-y-1">
                  <h1 className="text-base text-foreground leading-snug">
                    {data.organization.name}
                  </h1>
                  {data.organization.website && (
                    <p className="text-xs text-muted-foreground">{data.organization.website}</p>
                  )}
                  <span className="inline-block text-[10px] text-muted-foreground border border-border rounded px-2 py-0.5">
                    Examination Hall Ticket · {data.examSession?.title}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="rounded border border-border p-1 bg-white">
                  {qrCodeUrl
                    ? <img src={qrCodeUrl} alt="QR" className="h-16 w-16" />
                    : <div className="h-16 w-16 bg-muted animate-pulse rounded" />}
                </div>
                <p className="text-[9px] text-muted-foreground tracking-wide">Scan to verify</p>
              </div>
            </div>
          </div>

          {/* Meta strip */}
          <div className="bg-muted/30 border-b border-border px-7 py-2 flex items-center justify-between flex-wrap gap-2 print:px-6">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>Ticket No: <span className="font-mono text-foreground">{ticketId}</span></span>
              <span>·</span>
              <span>Issued: <span className="text-foreground">{formatDateTimeIN(data.generatedAt)}</span></span>
            </div>
            <Badge variant="outline" className="text-[10px] gap-1 rounded">
              <ShieldCheck className="h-2.5 w-2.5" />
              Authenticated
            </Badge>
          </div>

          <div className="px-7 py-6 print:px-6 space-y-6">

            {/* Student info */}
            <section>
              <SectionHeading icon={<User className="h-3 w-3" />} title="Student Information" />
              <div className="mt-4 grid md:grid-cols-[1fr_auto] gap-6 items-start">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                  <Field label="Full Name" value={`${data.student.firstName} ${data.student.lastName}`} span />
                  <Field label="Roll Number" value={data.student.rollNumber ?? 'N/A'} mono />
                  <Field label="Class & Section" value={`Grade ${data.student.grade?.grade ?? '—'} · ${data.student.section?.name ?? '—'}`} />
                  <Field label="Email" value={data.student.email ?? '—'} />
                  <Field label="Phone" value={data.student.phoneNumber ?? '—'} />
                  <Field label="Reference ID" value={ticketId} mono />
                </div>

                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-24 h-32 border border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {data.student.profileImage
                      ? <img src={data.student.profileImage} alt="Student" className="w-full h-full object-cover" />
                      : <User className="h-8 w-8 text-muted-foreground/30" />}
                  </div>
                  <p className="text-[9px] text-muted-foreground tracking-widest uppercase">Photo</p>
                </div>
              </div>
            </section>

            <Divider />

            {/* Exam schedule */}
            <section>
              <SectionHeading icon={<GraduationCap className="h-3 w-3" />} title="Examination Schedule" />
              <div className="mt-4 rounded-lg border border-border overflow-hidden overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {['Subject', 'Code', 'Date', 'Time', 'Venue', 'Duration'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[9px] tracking-widest uppercase text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.exam ? (
                      <tr>
                        <td className="px-4 py-3.5 text-foreground whitespace-nowrap">
                          {data.exam.subject?.name}
                        </td>
                        <td className="px-4 py-3.5">
                          <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                            {data.exam.subject?.code}
                          </code>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-foreground">
                          {formatDateIN(data.exam.startDate)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-foreground">
                          {new Date(data.exam.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {new Date(data.exam.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3.5 text-foreground">{data.exam.venue ?? '—'}</td>
                        <td className="px-4 py-3.5 text-foreground whitespace-nowrap">
                          {formatDuration(data.exam.durationInMinutes ?? 180)}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No examination scheduled
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <Divider />

            {/* Instructions + Signatures */}
            <section className="grid sm:grid-cols-2 gap-5">
              <div className="rounded-lg border border-border p-4 space-y-3">
                <SectionHeading icon={<Info className="h-3 w-3" />} title="Instructions" />
                <ol className="space-y-2">
                  {INSTRUCTIONS.map((text, i) => (
                    <li key={i} className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed">
                      <span className="shrink-0 text-[10px] text-muted-foreground/50 w-4 pt-px">{i + 1}.</span>
                      {text}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-lg border border-border p-4 flex flex-col justify-between gap-5">
                <SectionHeading icon={<ShieldCheck className="h-3 w-3" />} title="Certification" />
                <div className="flex gap-5 items-end">
                  <SignatureBox label="Candidate" />
                  <SignatureBox label="Controller of Examinations" />
                </div>
                <p className="text-[9px] text-muted-foreground leading-relaxed border-t border-border pt-3">
                  This ticket is system-generated. Unauthorized duplication is a punishable offence.
                </p>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="border-t border-border bg-muted/20 px-7 py-3 print:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
              {data.organization.contactPhone && <span>Phone: {data.organization.contactPhone}</span>}
              {data.organization.contactEmail && (
                <><span>·</span><span>{data.organization.contactEmail}</span></>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Generated {formatDateTimeIN(data.generatedAt)}
            </p>
          </div>
        </div>

        {/* Help note */}
        <div className="no-print mt-3 flex items-start gap-2.5 rounded-lg border border-border bg-background px-4 py-3 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p>
            For any discrepancy, contact your <span className="text-foreground">Class Teacher</span> or the{' '}
            <span className="text-foreground">Exam Control Room</span> before the examination date.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 1.2cm; }
        }
      `}</style>
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-border pb-2">
      <span className="text-muted-foreground">{icon}</span>
      <h2 className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground">{title}</h2>
    </div>
  );
}

function Field({ label, value, mono = false, span = false }: {
  label: string; value: string; mono?: boolean; span?: boolean;
}) {
  return (
    <div className={span ? 'col-span-2 sm:col-span-1' : ''}>
      <p className="text-[9px] tracking-[0.14em] uppercase text-muted-foreground mb-1">{label}</p>
      <p className={`text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-border" />;
}

function SignatureBox({ label }: { label: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="h-10 border-b border-border mb-1.5" />
      <p className="text-[9px] tracking-widest uppercase text-muted-foreground">{label}</p>
    </div>
  );
}