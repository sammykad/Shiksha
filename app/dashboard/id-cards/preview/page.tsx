'use client';

import { PDFViewer } from '@react-pdf/renderer';
import { IdCardPDF } from '@/lib/data/id-card/id-card-pdf';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import IdCardPreview from '@/components/dashboard/id-card/IdCardPreview';

const viewerStyle = { width: '100%', height: '500px' };

const studentData = {
  person: {
    firstName: 'Aarav',
    lastName: 'Sharma',
    details: { 'Grade': '7 - B', 'ID No.': 'GIS24S0078' },
  },
  organization: {
    name: 'Greenfield International School',
    phone: '+91 80 1234 5678',
    website: 'www.gis.edu.in',
  },
  cardNumber: 'GIS24S0078',
  academicYear: '2024-25',
  role: 'STUDENT' as const,
  motto: 'Inspire • Learn • Grow',
};

const teacherData = {
  person: {
    firstName: 'Neha',
    lastName: 'Krishnan',
    details: { 'Department': 'Mathematics', 'ID No.': 'GIS24T00156' },
  },
  organization: {
    name: 'Greenfield International School',
    phone: '+91 80 1234 5678',
    website: 'www.gis.edu.in',
  },
  cardNumber: 'GIS24T00156',
  academicYear: '2024-25',
  role: 'TEACHER' as const,
  motto: 'Empower • Educate • Excel',
};

export default function IdCardPreviewPage() {
  const [studentQr, setStudentQr] = useState('');
  const [teacherQr, setTeacherQr] = useState('');

  useEffect(() => {
    QRCode.toDataURL('https://shiksha.cloud/verify/GIS24S0078').then(setStudentQr);
    QRCode.toDataURL('https://shiksha.cloud/verify/GIS24T00156').then(setTeacherQr);
  }, []);

  return (
    <div className="flex-1 space-y-8 px-2 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">ID Card Templates — Live PDF Preview</h1>
        <p className="text-muted-foreground">These are rendered as actual PDFs using @react-pdf/renderer</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center text-emerald-600">Student ID Card</h2>
          <div className="border rounded-lg overflow-hidden">
            <PDFViewer style={viewerStyle} showToolbar>
              <IdCardPDF {...studentData} qrCodeDataUrl={studentQr} />
            </PDFViewer>
          </div>
          {/* <IdCardPreview {...sampleStudent} /> */}

        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center text-blue-600">Teacher ID Card</h2>
          <div className="border rounded-lg overflow-hidden">
            <PDFViewer style={viewerStyle} showToolbar>
              <IdCardPDF {...teacherData} qrCodeDataUrl={teacherQr} />
            </PDFViewer>
          </div>
          {/* <IdCardPreview {...sampleTeacher} /> */}

        </div>
      </div>

      <div className="max-w-2xl mx-auto text-center text-sm text-muted-foreground">
        <p>Each card is a real rendered PDF. Use the toolbar to zoom, download, or print.</p>
      </div>
    </div>
  );
}
