import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AnimatedCircularProgressBar } from '@/components/Charts/AnimatedCircularProgressBar';
import { StudentProfileEditForm } from './StudentProfileEditForm';
import SidebarPreferences from '@/components/dashboard-layout/sidebar-preferences';
import prisma from '@/lib/db';
import { getCurrentUserId } from '@/lib/user';
import { getCurrentUserByRole } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

type StudentProfileFields = {
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  motherName?: string | null;
  dateOfBirth?: Date | null;
  profileImage?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  caste?: string | null;
  subCaste?: string | null;
  phoneNumber?: string | null;
  whatsAppNumber?: string | null;
  email?: string | null;
  emergencyContact?: string | null;
  gender?: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROFILE_FIELDS: { key: keyof StudentProfileFields; weight: number }[] = [
  { key: 'firstName', weight: 9 },
  { key: 'lastName', weight: 9 },
  { key: 'middleName', weight: 4 },
  { key: 'motherName', weight: 4 },
  { key: 'dateOfBirth', weight: 9 },
  { key: 'profileImage', weight: 10 },
  { key: 'bloodGroup', weight: 5 },
  { key: 'address', weight: 10 },
  { key: 'phoneNumber', weight: 10 },
  { key: 'whatsAppNumber', weight: 5 },
  { key: 'email', weight: 10 },
  { key: 'emergencyContact', weight: 8 },
  { key: 'gender', weight: 4 },
  { key: 'caste', weight: 2 },
  { key: 'subCaste', weight: 1 },
]; // Weights sum to 100

function calculateProfileCompletion(student: StudentProfileFields): number {
  const total = PROFILE_FIELDS.reduce((sum, { weight }) => sum + weight, 0);
  const completed = PROFILE_FIELDS.reduce((sum, { key, weight }) => {
    const value = student[key];
    return value !== null && value !== undefined && value !== ''
      ? sum + weight
      : sum;
  }, 0);
  return Math.round((completed / total) * 100);
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

export async function getStudentProfile(studentId?: string) {
  const userId = await getCurrentUserId();

  // parent.user must be included to resolve isParent via clerkId
  const includeShape = {
    user: true,
    grade: true,
    section: true,
    organization: true,
    parents: {
      include: {
        parent: {
          include: {
            user: true,
          },
        },
      },
    },
  } as const;

  const student = studentId
    ? await prisma.student.findUnique({ where: { id: studentId }, include: includeShape })
    : await prisma.student.findFirst({ where: { user: { clerkId: userId } }, include: includeShape });

  if (!student) return null;

  const isOwnProfile = student.user?.clerkId === userId;
  const isParent = student.parents.some(
    (ps) => ps.parent.user?.clerkId === userId
  );

  if (!isOwnProfile && !isParent) {
    throw new Error('Unauthorized to view this profile');
  }

  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    middleName: student.middleName,
    motherName: student.motherName,
    fullName: student.fullName,
    dateOfBirth: student.dateOfBirth,
    profileImage: student.profileImage,
    bloodGroup: student.bloodGroup,
    address: student.address,
    caste: student.caste,
    subCaste: student.subCaste,
    rollNumber: student.rollNumber,
    phoneNumber: student.phoneNumber,
    whatsAppNumber: student.whatsAppNumber,
    email: student.email,
    emergencyContact: student.emergencyContact,
    gender: student.gender,
    grade: student.grade.grade,
    section: student.section.name,
    organization: student.organization.name ?? '',
    canEditGrade: false,
    canEditParentDetails: false,
    isOwnProfile,
    isParent,
    profileCompletion: calculateProfileCompletion(student),
    parents: student.parents.map((ps) => ({
      id: ps.parent.id,
      firstName: ps.parent.firstName,
      lastName: ps.parent.lastName,
      phoneNumber: ps.parent.phoneNumber,
      whatsAppNumber: ps.parent.whatsAppNumber,
      email: ps.parent.email,
      relationship: ps.relationship,
      isPrimary: ps.isPrimary ?? false,
    })),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StudentSettings() {
  const currentUser = await getCurrentUserByRole();

  if (currentUser.role !== 'STUDENT') {
    return (
      <div className="p-8 text-center text-destructive font-semibold text-lg">
        Only students can access this page.
      </div>
    );
  }

  const student = await getStudentProfile(currentUser.studentId);

  if (!student) {
    return (
      <div className="p-8 text-center text-destructive font-semibold text-lg">
        Student profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2">
      {/* Header card */}
      <Card className="py-4 px-4 flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">Settings</CardTitle>
          <CardDescription className="text-sm">
            Manage your account settings and preferences.
          </CardDescription>
        </div>
        <AnimatedCircularProgressBar
          className="w-12 h-12 text-sm"
          min={0}
          max={100}
          value={student.profileCompletion}
          gaugePrimaryColor="rgb(79 70 229)"
          gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
        />
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none">
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
              <CardDescription>
                Update your personal information and profile details.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <StudentProfileEditForm student={student} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency tab */}
        <TabsContent value="emergency" className="space-y-6">

          {/* Emergency contact number */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>
                Primary emergency contact number on record.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  value={student.emergencyContact ?? ''}
                  readOnly
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Parent / Guardian details */}
          <Card>
            <CardHeader>
              <CardTitle>Parents &amp; Guardians</CardTitle>
              <CardDescription>
                Contact details for your registered parents or guardians.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {student.parents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No parent or guardian details found.
                </p>
              ) : (
                student.parents.map((parent) => (
                  <div
                    key={parent.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    {/* Name + badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {parent.firstName} {parent.lastName}
                      </span>
                      {parent.relationship && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {parent.relationship}
                        </Badge>
                      )}
                      {parent.isPrimary && (
                        <Badge variant="default" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>

                    {/* Contact fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <Input
                          value={parent.phoneNumber ?? ''}
                          readOnly
                          disabled
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                        <Input
                          value={parent.whatsAppNumber ?? ''}
                          readOnly
                          disabled
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <Input
                          value={parent.email ?? ''}
                          readOnly
                          disabled
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Manage your account and display preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<FieldSkeleton />}>
                <SidebarPreferences />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}