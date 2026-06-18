import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getInitials, capitalizeName } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  UserRound,
  Shield,
  Settings,
  Mail,
  Calendar,
  Briefcase,
  GraduationCap,
  Phone,
  MapPin,
  BookOpen,
  Globe,
  Languages,
  Award,
  Clock,
  PersonStanding,
  ShieldPlus,
  NotepadTextDashed,
  Building2,
  Hash,
  type LucideIcon,
} from 'lucide-react';
import { TeacherProfileForm } from './TeacherProfileForm';
import { TeacherPayoutForm } from './TeacherPayoutForm';
import TeacherSettingsSidebar from './TeacherSettingsSidebar';
import prisma from '@/lib/db';
import { getCurrentUserId } from '@/lib/user';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import prismaBase from '@/lib/prisma-base';

export async function getTeacher(userId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { userId, isActive: true },
    select: {
      id: true,
      employeeCode: true,
      employmentStatus: true,
      joinedAt: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
        },
      },
      profile: {
        select: {
          dateOfBirth: true,
          contactEmail: true,
          contactPhone: true,
          address: true,
          city: true,
          state: true,
          qualification: true,
          experienceInYears: true,
          idProofUrl: true,
          linkedinPortfolio: true,
          languagesKnown: true,
          teachingPhilosophy: true,
          joinedAt: true,
          resumeUrl: true,
          specializedSubjects: true,
          preferredGrades: true,
          certificateUrls: true,
          bio: true,
        },
      },
    },
  });

  if (!teacher || !teacher.user || !teacher.profile) return null;

  return {
    id: teacher.id,
    employeeCode: teacher.employeeCode,
    employmentStatus: teacher.employmentStatus,
    firstName: teacher.user.firstName,
    lastName: teacher.user.lastName,
    email: teacher.user.email,
    profilePhoto: teacher.user.profileImage,
    contactEmail: teacher.profile.contactEmail,
    contactPhone: teacher.profile.contactPhone,
    address: teacher.profile.address,
    city: teacher.profile.city || '',
    state: teacher.profile.state || '',
    dateOfBirth: teacher.profile.dateOfBirth,
    qualification: teacher.profile.qualification,
    experienceInYears: teacher.profile.experienceInYears,
    resumeUrl: teacher.profile.resumeUrl || '',
    specializedSubjects: teacher.profile.specializedSubjects,
    preferredGrades: teacher.profile.preferredGrades,
    bio: teacher.profile.bio || '',
    linkedinPortfolio: teacher.profile.linkedinPortfolio || '',
    languagesKnown: teacher.profile.languagesKnown,
    teachingPhilosophy: teacher.profile.teachingPhilosophy || '',
    certificateUrls: teacher.profile.certificateUrls.map((url, index) => ({
      title: `Certificate ${index + 1}`,
      url,
    })),
    idProofUrl: teacher.profile.idProofUrl,
    joinedAt: teacher.joinedAt,
  };
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | undefined | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 shrink-0 rounded-md bg-muted p-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function ProfileSection({ teacher }: { teacher: NonNullable<Awaited<ReturnType<typeof getTeacher>>> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <UserRound className="h-5 w-5 text-primary" />
          Teacher Profile
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your personal and professional information.
        </p>
      </div>

      <Separator />

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={teacher.profilePhoto || undefined} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {getInitials(`${teacher.firstName} ${teacher.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {capitalizeName(teacher.firstName)} {capitalizeName(teacher.lastName)}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-[11px] font-normal">
                    {teacher.employmentStatus}
                  </Badge>
                  {teacher.employeeCode && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {teacher.employeeCode}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <UserRound className="h-5 w-5" />
                    Edit Profile
                  </DialogTitle>
                  <DialogDescription>
                    Update your personal and professional information.
                  </DialogDescription>
                </DialogHeader>
                <TeacherProfileForm teacher={teacher} />
              </DialogContent>
            </Dialog>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow icon={Mail} label="Email" value={teacher.email} />
            <InfoRow icon={Phone} label="Phone" value={teacher.contactPhone} />
            <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(teacher.dateOfBirth)} />
            <InfoRow icon={MapPin} label="Address" value={`${teacher.address}${teacher.city ? `, ${teacher.city}` : ""}${teacher.state ? `, ${teacher.state}` : ""}`} />
            <InfoRow icon={Globe} label="LinkedIn / Portfolio" value={teacher.linkedinPortfolio} />
            <InfoRow icon={Languages} label="Languages Known" value={Array.isArray(teacher.languagesKnown) ? teacher.languagesKnown.join(", ") : undefined} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow icon={GraduationCap} label="Qualification" value={teacher.qualification} />
            <InfoRow icon={Clock} label="Experience" value={teacher.experienceInYears ? `${teacher.experienceInYears} years` : undefined} />
            <InfoRow icon={BookOpen} label="Specialized Subjects" value={Array.isArray(teacher.specializedSubjects) ? teacher.specializedSubjects.join(", ") : undefined} />
            <InfoRow icon={Award} label="Preferred Grades" value={Array.isArray(teacher.preferredGrades) ? teacher.preferredGrades.join(", ") : undefined} />
            <InfoRow icon={Calendar} label="Joined" value={formatDate(teacher.joinedAt)} />
            <InfoRow icon={Building2} label="Employee Code" value={teacher.employeeCode || undefined} />
          </CardContent>
        </Card>
      </div>

      {teacher.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-wrap">{teacher.bio}</p>
          </CardContent>
        </Card>
      )}

      {teacher.teachingPhilosophy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Teaching Philosophy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-wrap">{teacher.teachingPhilosophy}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PayoutSection() {
  return <TeacherPayoutForm />;
}

function AccountSection({ teacher, hasPassword }: { teacher: NonNullable<Awaited<ReturnType<typeof getTeacher>>>; hasPassword: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Account
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and security preferences.
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your primary email and account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Email Address</p>
              <p className="text-sm font-medium">{teacher.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Contact Email</p>
              <p className="text-sm font-medium">{teacher.contactEmail}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Account Created</p>
              <p className="text-sm font-medium">{formatDate(teacher.joinedAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="secondary" className="text-[11px] font-normal mt-0.5">
                {teacher.employmentStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your password and account security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">
                {hasPassword ? 'Change your account password' : 'Set a password for your account'}
              </p>
            </div>
            <Button variant="outline" size="sm">
              {hasPassword ? 'Change Password' : 'Set Password'}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Badge variant="secondary" className="text-[11px]">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const TeacherSettings = async () => {
  const userId = await getCurrentUserId();
  const teacher = await getTeacher(userId);

  const account = await prismaBase.account.findFirst({
    where: { userId, providerId: 'credential' },
    select: { id: true },
  });
  const hasPassword = !!account;

  if (!teacher) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <EmptyState
          title="No Teacher Found"
          description="You are not registered as a teacher or your profile is not created yet."
          icons={[PersonStanding, ShieldPlus, NotepadTextDashed]}
          action={{
            label: 'Go to Support',
            href: '/support',
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Settings"
        description="Manage your profile, payout information, and account preferences."
        icon={UserRound}
      />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        <TeacherSettingsSidebar>
          <ProfileSection teacher={teacher} />
          <PayoutSection />
          <AccountSection teacher={teacher} hasPassword={hasPassword} />
        </TeacherSettingsSidebar>
      </div>
    </div>
  );
};

export default TeacherSettings;
