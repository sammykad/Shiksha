import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, XCircle, Clock, Calendar, Hash, User, School, Shield, ScanLine } from 'lucide-react';

export const metadata = {
  title: 'Verify ID Card | Shiksha Cloud',
  robots: { index: false, follow: false },
};

export default async function VerifyIdCardPage({
  params,
}: {
  params: Promise<{ cardNumber: string }>;
}) {
  const { cardNumber } = await params;

  const idCard = await prisma.idCard.findUnique({
    where: { cardNumber },
    include: {
      student: {
        select: {
          firstName: true, lastName: true, profileImage: true,
          rollNumber: true,
          grade: { select: { grade: true } },
          section: { select: { name: true } },
        },
      },
      teacher: {
        select: {
          employeeCode: true,
          user: { select: { firstName: true, lastName: true, profileImage: true } },
        },
      },
      organization: {
        select: { name: true, logo: true },
      },
    },
  });

  if (!idCard) return notFound();

  const isExpired = idCard.expiresAt ? new Date() > idCard.expiresAt : false;
  const isRevoked = !!idCard.revokedAt;
  const isValid = !isExpired && !isRevoked;

  const personName = idCard.student
    ? `${idCard.student.firstName} ${idCard.student.lastName}`
    : idCard.teacher
      ? `${idCard.teacher.user.firstName} ${idCard.teacher.user.lastName}`
      : 'Unknown';

  const personInitials = idCard.student
    ? `${idCard.student.firstName?.[0] ?? ''}${idCard.student.lastName?.[0] ?? ''}` || '?'
    : idCard.teacher
      ? `${idCard.teacher.user.firstName?.[0] ?? ''}${idCard.teacher.user.lastName?.[0] ?? ''}` || '?'
      : '?';

  const personImage = idCard.student?.profileImage || idCard.teacher?.user.profileImage;

  const isStudent = !!idCard.studentId;
  const roleColor = isStudent ? 'emerald' : 'blue';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Shiksha Cloud</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ScanLine className="w-3.5 h-3.5" />
            <span>ID Verification</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <Card className={`overflow-hidden border-2 ${isValid ? 'border-green-200' : 'border-red-200'}`}>
          <div className={`px-5 py-4 ${isValid ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-red-50 to-rose-50'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                {isValid ? (
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                ) : (
                  <XCircle className="w-7 h-7 text-red-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-lg ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {isValid ? 'Valid ID Card' : isRevoked ? 'Card Revoked' : 'Card Expired'}
                </p>
                <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-500'}`}>
                  {isValid
                    ? 'This ID card is active and verified'
                    : isRevoked
                      ? idCard.revokedReason || 'This card has been revoked by the institution'
                      : 'This card has passed its validity period'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Mini ID Card Preview */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl blur-xl opacity-30" />
          <Card className="relative overflow-hidden">
            {/* Role color bar */}
            <div className={`h-1.5 w-full ${isRevoked ? 'bg-red-500' : isStudent ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className="h-16 w-16 flex-shrink-0 ring-2 ring-offset-2" style={{ '--tw-ring-color': isRevoked ? '#ef4444' : isStudent ? '#10b981' : '#3b82f6' } as React.CSSProperties}>
                  <AvatarImage src={personImage || undefined} />
                  <AvatarFallback className="text-lg font-bold bg-muted">
                    {personInitials}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{personName}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {isStudent ? 'Student' : 'Staff Member'}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={isRevoked ? 'destructive' : isStudent ? 'default' : 'secondary'} className="text-xs">
                      {isRevoked ? 'Revoked' : isStudent ? 'Student' : 'Staff'}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">v{idCard.version}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-dashed" />

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Card Number</p>
                  <p className="font-mono text-xs font-medium truncate">{idCard.cardNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Academic Year</p>
                  <p className="font-medium text-xs">{idCard.academicYear}</p>
                </div>
                {isStudent && idCard.student && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Class</p>
                      <p className="font-medium text-xs">{idCard.student.grade.grade} - {idCard.student.section.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Roll No</p>
                      <p className="font-mono text-xs font-medium">{idCard.student.rollNumber}</p>
                    </div>
                  </>
                )}
                {!isStudent && idCard.teacher?.employeeCode && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Employee Code</p>
                    <p className="font-mono text-xs font-medium">{idCard.teacher.employeeCode}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Details */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Verification Details
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-muted">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Issued Date</span>
                </div>
                <span className="text-sm font-medium">{idCard.issuedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-muted">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="w-4 h-4" />
                  <span>Institution</span>
                </div>
                <span className="text-sm font-medium text-right max-w-[200px] truncate">{idCard.organization.name}</span>
              </div>

              {idCard.expiresAt && (
                <div className="flex items-center justify-between py-2 border-b border-muted">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Expires</span>
                  </div>
                  <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : ''}`}>
                    {idCard.expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}

              {isRevoked && idCard.revokedAt && (
                <div className="flex items-center justify-between py-2 border-b border-muted">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <XCircle className="w-4 h-4" />
                    <span>Revoked On</span>
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    {idCard.revokedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Card Type</span>
                </div>
                <span className="text-sm font-medium capitalize">{isStudent ? 'Student' : 'Staff'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2 pb-8">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>Verified by Shiksha Cloud</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60">
            This verification was performed on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}
