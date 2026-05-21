'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ID_CARD_MOTTO } from '@/constants';

const ROLE_STYLES: Record<string, { primary: string; light: string; dark: string; badge: string }> = {
  STUDENT: { primary: '#059669', light: '#d1fae5', dark: '#064e3b', badge: 'bg-emerald-100 text-emerald-700' },
  TEACHER: { primary: '#2563eb', light: '#dbeafe', dark: '#1e3a5f', badge: 'bg-blue-100 text-blue-700' },
  ADMIN: { primary: '#7c3aed', light: '#ede9fe', dark: '#4c1d95', badge: 'bg-violet-100 text-violet-700' },
  PARENT: { primary: '#d97706', light: '#fef3c7', dark: '#78350f', badge: 'bg-amber-100 text-amber-700' },
};

const ShieldIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color }}>
    <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface IdCardPreviewProps {
  person: { firstName: string; lastName: string; profileImage?: string; details: Record<string, string | undefined> };
  organization?: { name: string; logo?: string; address?: string; phone?: string; website?: string };
  cardNumber: string;
  academicYear: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PARENT';
  motto?: string;
}

export default function IdCardPreview({ person, organization, cardNumber, academicYear, role, motto }: IdCardPreviewProps) {
  const s = ROLE_STYLES[role] || ROLE_STYLES.STUDENT;
  const displayMotto = motto || ID_CARD_MOTTO[role] || ID_CARD_MOTTO.STUDENT;
  const orgName = organization?.name || 'School Name';
  const orgAddress = organization?.address;
  const orgPhone = organization?.phone;
  const orgWebsite = organization?.website;
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!cardNumber) return;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    QRCode.toDataURL(`${baseUrl}/verify/id-card/${cardNumber}`, { width: 80, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => { });
  }, [cardNumber]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl overflow-hidden border-2 shadow-xl bg-white relative" style={{ borderColor: s.primary + '30' }}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start gap-3">
            {organization?.logo ? (
              <img src={organization.logo} alt="org-name" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.light }}>
                <ShieldIcon color={s.primary} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[15px] text-slate-900 leading-tight">{orgName}</p>
              {orgAddress && <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{orgAddress}</p>}
              {(orgPhone || orgWebsite) && (
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                  {orgPhone && (
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      </svg>
                      {orgPhone}
                    </span>
                  )}
                  {orgWebsite && (
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                      </svg>
                      {orgWebsite}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: s.primary }}>
                {academicYear}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5" style={{ borderTop: `1px dashed ${s.primary}30` }} />

        {/* Body */}
        <div className="flex gap-4 p-5">
          {/* Photo */}
          <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2" style={{ borderColor: s.primary + '40', backgroundColor: s.light }}>
            {person.profileImage ? (
              <img src={person.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: s.primary }}>
                {(person.firstName?.[0] || '')}{(person.lastName?.[0] || '')}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg text-slate-900 leading-tight">{person.firstName || ''} {person.lastName || ''}</p>
            <span className={cn('inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md mt-1.5 mb-2', s.badge)}>
              {role}
            </span>
            {Object.entries(person.details).filter(([, v]) => v !== undefined).map(([label, value]) => (
              <p key={label} className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-700">{label}:</span> {value}
              </p>
            ))}
          </div>

          {/* QR Code */}
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 bg-white" style={{ borderColor: s.primary + '40' }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR" className="w-full h-full object-contain p-1" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <span className="text-xs text-slate-400">QR</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Wave */}
        <div className="relative h-10 overflow-hidden">
          <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-0">
            <path d="M0,8 C80,0 120,18 200,8 C280,0 320,18 400,8 L400,40 L0,40 Z" fill={s.primary} />
          </svg>
          <div className="absolute bottom-1.5 inset-x-0 flex justify-center">
            <p className="text-[11px] font-bold text-white tracking-widest">{displayMotto}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
