'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Download,
  Clock,
  Calendar,
  User,
  GraduationCap,
  MapPin,
  Building2,
  Info,
  Printer
} from 'lucide-react';
import { formatDateIN, formatDateTimeIN } from '../utils';
import QRCode from 'qrcode';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Types based on existing integrations
interface HallTicketStudent {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  rollNumber: string;
  profileImage?: string | null;
  dateOfBirth: Date;
  grade: {
    id: string;
    grade: string;
  };
  section: {
    id: string;
    name: string;
  };
  user: {
    email: string;
    phoneNumber?: string | null;
  };
}

interface HallTicketOrganization {
  id: string;
  name?: string | null;
  logo?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: string | null;
}

interface HallTicketExamSession {
  id: string;
  title: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
}

interface HallTicketExam {
  id: string;
  title: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  durationInMinutes?: number | null;
  venue?: string | null;
  maxMarks: number;
  subject: {
    id: string;
    name: string;
    code: string;
  };
}

interface HallTicketData {
  id: string;
  studentId: string;
  examId?: string | null;
  examSessionId?: string | null;
  pdfUrl: string;
  qrCode?: string | null;
  generatedAt: Date;
  downloadedAt?: Date | null;
  expiryDate?: Date | null;
  organizationId: string;
  student: HallTicketStudent;
  exam?: HallTicketExam | null;
  examSession?: HallTicketExamSession | null;
  organization: HallTicketOrganization;
}

interface HallTicketPDFProps {
  hallTicketData: HallTicketData;
  onDownloadPDF?: () => void;
  className?: string;
}

export function HallTicketPDF({
  hallTicketData,
  onDownloadPDF,
  className = '',
}: HallTicketPDFProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const verificationData = JSON.stringify({
          id: hallTicketData.id,
          student: `${hallTicketData.student.firstName} ${hallTicketData.student.lastName}`,
          roll: hallTicketData.student.rollNumber,
          org: hallTicketData.organization.name,
        });
        const url = await QRCode.toDataURL(verificationData, {
          width: 160,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    };
    if (hallTicketData) generateQR();
  }, [hallTicketData]);

  if (!hallTicketData || !hallTicketData.student || !hallTicketData.organization) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive mb-2">Invalid Hall Ticket Data</h2>
            <p className="text-sm text-muted-foreground">Please contact administration.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    if (onDownloadPDF) {
      onDownloadPDF();
    } else {
      window.print();
    }
  };

  return (
    <div className={`min-h-screen bg-muted/5 p-4 md:p-8 scrollbar-hide ${className}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Print Action Bar */}
        <div className="no-print mb-6 flex gap-4 justify-center">
          <Button onClick={handleDownloadPDF} className="gap-2 bg-primary shadow-sm" size="sm">
            <Printer className="h-4 w-4" />
            Print / Download
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.close()} className="bg-background">
            Close Preview
          </Button>
        </div>

        {/* Hall Ticket Document */}
        <Card className="print-page bg-white shadow-none border border-border overflow-hidden print:shadow-none print:m-0 scrollbar-hide">
          {/* Header */}
          <div className="bg-slate-50 p-8 border-b border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20 border-2 border-background shadow-sm rounded-xl">
                  <AvatarImage src={hallTicketData.organization.logo || ''} className="object-contain p-1" />
                  <AvatarFallback className="rounded-xl"><Building2 className="h-10 w-10 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-black tracking-tight uppercase text-slate-900">
                    {hallTicketData.organization.name}
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 text-muted-foreground font-medium">
                    <span className="text-[10px] uppercase tracking-widest bg-muted px-2 py-0.5 rounded">Examination Hall Ticket</span>
                    <span className="text-xs opacity-75">{hallTicketData.organization.website}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-border shadow-inner">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR" className="h-20 w-20" />
                ) : (
                  <div className="h-20 w-20 bg-muted animate-pulse rounded-lg" />
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {/* Session Info */}
            <div className="bg-muted/30 border-b border-border py-2.5 px-8 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {hallTicketData.examSession?.title || 'Academic Session'}
              </div>
              <Badge variant="outline" className="bg-white text-[9px] font-black border-border px-2">
                {hallTicketData.id.slice(-8).toUpperCase()}
              </Badge>
            </div>

            <div className="p-8 space-y-10">
              {/* Student Details */}
              <div className="grid md:grid-cols-[1fr,auto] gap-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 border-b-2 border-primary pb-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Candidate Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Student Name</p>
                      <p className="text-base font-bold text-slate-900">
                        {hallTicketData.student.firstName} {hallTicketData.student.lastName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Roll Number</p>
                      <p className="text-base font-mono font-bold text-primary">
                        {hallTicketData.student.rollNumber}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Grade & Section</p>
                      <p className="text-base font-bold text-slate-900">
                        {hallTicketData.student.grade.grade} — {hallTicketData.student.section.name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Registration ID</p>
                      <p className="text-base font-bold text-slate-900">
                        {hallTicketData.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-36 h-44 border border-border rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 shadow-inner">
                  <img
                    src={hallTicketData.student.profileImage || '/images/avatar.png'}
                    alt="Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Exam Schedule */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 border-b-2 border-primary pb-1">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Examination Schedule</h3>
                </div>
                <div className="rounded-xl border border-border overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="px-6 h-10 text-[10px] font-black uppercase tracking-widest">Subject</TableHead>
                        <TableHead className="px-6 h-10 text-[10px] font-black uppercase tracking-widest">Date & Time</TableHead>
                        <TableHead className="px-6 h-10 text-[10px] font-black uppercase tracking-widest">Venue</TableHead>
                        <TableHead className="px-6 h-10 text-[10px] font-black uppercase tracking-widest text-right">Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hallTicketData.exam ? (
                        <TableRow className="hover:bg-transparent">
                          <td className="px-6 py-5">
                            <p className="font-bold text-sm text-slate-900">{hallTicketData.exam.subject.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{hallTicketData.exam.subject.code}</p>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="font-bold text-sm text-slate-900">{formatDateIN(hallTicketData.exam.startDate.toISOString())}</div>
                            <div className="text-[10px] text-muted-foreground font-medium mt-1">
                              {new Date(hallTicketData.exam.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(hallTicketData.exam.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                              <MapPin className="h-3.5 w-3.5 text-red-500" />
                              {hallTicketData.exam.venue || 'Center Hall'}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-900 border-none font-black text-[10px]">
                              {hallTicketData.exam.durationInMinutes || '180'} MINS
                            </Badge>
                          </td>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <td colSpan={4} className="py-12 text-center text-muted-foreground italic font-medium text-sm">
                            No individual exam details assigned to this ticket.
                          </td>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Instructions & Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="bg-slate-50 border border-border p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Guidelines</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Carry a physical copy of this Hall Ticket.',
                      'Report 30 mins before the scheduled time.',
                      'Electronic gadgets are strictly prohibited.',
                      'Follow all center safety protocols.'
                    ].map((text, i) => (
                      <li key={i} className="flex gap-2 text-[11px] text-muted-foreground font-semibold leading-tight">
                        <span className="h-1 w-1 bg-primary/30 rounded-full mt-1.5 shrink-0" />
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col justify-end p-6 bg-slate-50/50 border border-border rounded-xl">
                  <div className="flex justify-between items-end gap-6 text-center">
                    <div className="flex-1">
                      <div className="h-10 border-b border-dashed border-muted-foreground/30 mb-2" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Student</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-10 border-b-2 border-slate-300 mb-2 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-slate-200" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Controller</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 px-8 py-5 border-t border-border flex justify-between items-center">
            <div className="flex gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>GEN: {formatDateTimeIN(hallTicketData.generatedAt.toISOString())}</span>
              <span className="opacity-20">|</span>
              <span>ID: {hallTicketData.id.slice(0, 12).toUpperCase()}</span>
            </div>
            <div className="text-right uppercase font-black tracking-[0.2em] text-slate-400 text-[10px]">
              Nexus Educational © 2024
            </div>
          </CardFooter>
        </Card>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media print {
          body { background: white !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .print-page { 
            box-shadow: none !important; 
            border: 1px solid #ccc !important;
            margin: 0 !important;
          }
          @page { size: A4; margin: 1cm; }
        }
      `}</style>
    </div>
  );
}

export default HallTicketPDF;
