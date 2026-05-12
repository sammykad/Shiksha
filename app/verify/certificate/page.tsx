'use client';

import { useState } from 'react';
import { Search, CheckCircle2, XCircle, Loader2, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { verifyCertificate, type VerifyCertificateResult } from '@/lib/data/certificate/verify-certificate';

interface CertData extends NonNullable<VerifyCertificateResult['certificate']> { }

export default function CertificateVerificationPage() {
  const [CertificateNumber, setCertificateNumber] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyCertificateResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!CertificateNumber.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await verifyCertificate(
        CertificateNumber.trim(),
        orgSlug.trim() || undefined,
      );
      setResult(data);
    } catch (err) {
      console.error('Verification failed:', err);
      setResult({ valid: false, message: 'Verification failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (iso: string | Date) => {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const fmtCertType = (type: string) =>
    type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="flex items-start justify-center p-4 pt-8 sm:pt-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 text-green-500 border-green-200 border mb-3">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Verify Certificate</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Enter the certificate number to verify its authenticity
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Certificate Number</CardTitle>
            <CardDescription className="text-xs">
              Found on the top-right corner of the certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={CertificateNumber}
                  onChange={e => setCertificateNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. PRO/2026/937"
                  className="flex-1 h-10 font-mono text-sm uppercase tracking-wider"
                  autoFocus
                />
                <Button type="submit" disabled={loading || !CertificateNumber.trim()} className="h-10 px-4 shrink-0">
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                </Button>
              </div>

              <details className="group">
                <summary className="text-xs text-zinc-400 cursor-pointer hover:text-zinc-600 select-none">
                  Advanced options
                </summary>
                <div className="mt-2">
                  <Input
                    value={orgSlug}
                    onChange={e => setOrgSlug(e.target.value.toLowerCase())}
                    placeholder="Organization slug (optional)"
                    className="h-9 text-xs"
                  />
                </div>
              </details>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className={`${result.valid ? 'border-green-200' : 'border-red-200'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {result.valid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                )}
                <div>
                  <CardTitle className={`text-sm ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                    {result.valid ? 'Certificate Verified' : 'Certificate Not Found'}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">{result.message}</CardDescription>
                </div>
              </div>
            </CardHeader>

            {result.valid && result.certificate && (
              <CardContent className="pt-0">
                <Separator className="mb-3" />
                <div className="space-y-2.5">
                  {/* Certificate type badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      {result.certificate.CertificateNumber}
                    </Badge>
                    <Badge className="bg-zinc-900 text-white text-xs">
                      {fmtCertType(result.certificate.CertificateType)}
                    </Badge>
                  </div>

                  {/* Student info */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <span className="text-zinc-500">Student Name</span>
                    <span className="font-semibold text-zinc-900 text-right">{result.certificate.studentName}</span>
                    <span className="text-zinc-500">Roll No</span>
                    <span className="font-semibold text-zinc-900 text-right">#{result.certificate.rollNo}</span>
                    <span className="text-zinc-500">Class</span>
                    <span className="font-semibold text-zinc-900 text-right">
                      {result.certificate.grade} – {result.certificate.section}
                    </span>
                    <span className="text-zinc-500">Academic Year</span>
                    <span className="font-semibold text-zinc-900 text-right">{result.certificate.year}</span>
                    <span className="text-zinc-500">Language</span>
                    <span className="font-semibold text-zinc-900 text-right">{result.certificate.language}</span>
                    <span className="text-zinc-500">Issued On</span>
                    <span className="font-semibold text-zinc-900 text-right">
                      {fmtDate(result.certificate.issuedAt)}
                    </span>
                  </div>

                  <Separator className="my-2" />

                  {/* Organization info */}
                  <div className="text-xs">
                    <p className="font-semibold text-zinc-900">{result.certificate.organization.name}</p>
                    {result.certificate.organization.website && (
                      <a
                        href={result.certificate.organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-700 mt-1"
                      >
                        <ExternalLink size={10} />
                        {result.certificate.organization.website}
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-zinc-400 mt-6">
          This verification is powered by{' '}
          <a href="https://shiksha.cloud" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-900">
            Shiksha.Cloud
          </a>
          {' '}Certificate System
        </p>
      </div>
    </div>
  );
}
