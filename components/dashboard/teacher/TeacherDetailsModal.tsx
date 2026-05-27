'use client';

import type React from 'react';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
  Languages,
  BookOpen,
  Users,
  Download,
  ExternalLink,
  Clock,
  Building,
  Award,
  Briefcase,
  Globe,
  Heart,
  LucideIcon,
} from 'lucide-react';
import { SelectedTeacher } from './TeachersTable';
import { EmploymentStatus } from '@/generated/prisma/enums';

interface TeacherDetailsModalProps {
  teacher: SelectedTeacher;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (teacherId: string) => void;
  onDeactivate?: (teacherId: string) => void;
  onActivate?: (teacherId: string) => void;
}

export const getStatusConfig = (
  status: EmploymentStatus,
  isActive: boolean
) => {
  if (!isActive) {
    return {
      color: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
      label: 'Inactive',
    };
  }

  switch (status) {
    case 'ACTIVE':
      return {
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Active',
      };
    case 'ON_LEAVE':
      return {
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'On Leave',
      };
    case 'PROBATION':
      return {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        label: 'Probation',
      };
    case 'CONTRACTUAL':
      return {
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
        label: 'Contractual',
      };
    case 'SUSPENDED':
      return {
        color: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        label: 'Suspended',
      };
    default:
      return {
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-500',
        label: status
          .replace('_', ' ')
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase()),
      };
  }
};

const InfoCard = ({
  icon: Icon,
  title,
  children,
  className = '',
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm sm:p-6 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200">
          <Icon className="size-5 text-gray-600" />
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  </div>
);

const DataPoint = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: LucideIcon;
}) => (
  <div className="flex items-start gap-3 py-0">
    {Icon && (
      <div className="mt-0.5 flex size-5 items-center justify-center">
        <Icon className="size-4 text-gray-400" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-0.5 break-words text-sm font-medium text-gray-900">
        {value || 'Not specified'}
      </p>
    </div>
  </div>
);

export function TeacherDetailsModal({
  teacher,
  isOpen,
  onClose,
  onEdit,
  onDeactivate,
  onActivate,
}: TeacherDetailsModalProps) {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);

  if (!teacher) return null;

  const { user, profile } = teacher;
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const statusConfig = getStatusConfig(
    teacher.employmentStatus,
    teacher.isActive
  );

  const handleDeactivate = () => {
    onDeactivate?.(teacher.id);
    setShowDeactivateDialog(false);
    onClose();
  };

  const handleActivate = () => {
    onActivate?.(teacher.id);
    setShowActivateDialog(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] md:h-[85vh]">
          <DialogHeader className="shrink-0 border-b px-4 py-4 pr-12 sm:px-6">
            <DialogTitle>Teacher Details</DialogTitle>
            <DialogDescription>Preview the teacher details</DialogDescription>
          </DialogHeader>
          {/* Header */}
          <div className="flex shrink-0 flex-row items-start gap-3 border-b px-4 py-4 sm:gap-6 sm:px-6">
            <div className="relative w-fit shrink-0">
              <Avatar className="size-14 ring-2 ring-background shadow-sm sm:size-20">
                <AvatarImage
                  src={user.profileImage || '/placeholder.svg'}
                  alt={fullName}
                />
                <AvatarFallback className="text-sm font-medium text-muted-foreground sm:text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 right-1.5 size-4 rounded-full border-2 border-white sm:size-6 ${statusConfig.dot}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div>
                <h1 className="break-words text-xl font-bold text-gray-900 sm:text-2xl">
                  {fullName}
                </h1>
                <p className="mt-1 break-words text-sm font-medium text-gray-600 sm:text-lg">
                  {profile?.qualification || 'Teacher'}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-start gap-2 sm:gap-3">
                <Badge
                  className={`${statusConfig.color} border px-3 py-1 font-medium`}
                >
                  <div
                    className={`mr-2 size-2 rounded-full ${statusConfig.dot}`}
                  />
                  {statusConfig.label}
                </Badge>
                {teacher.employeeCode && (
                  <Badge
                    variant="outline"
                    className="border-gray-300 bg-gray-50 font-mono"
                  >
                    ID: {teacher.employeeCode}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-700"
                >
                  <Clock className="mr-1 size-3" />
                  {profile?.experienceInYears || 0} years exp.
                </Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <Tabs defaultValue="overview" className="w-full">
              <div className="mb-6">
                <TabsList className="flex h-auto w-full flex-wrap justify-start rounded-lg bg-gray-100 p-1">
                  <TabsTrigger
                    value="overview"
                    className="min-w-0 basis-1/2 px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm sm:basis-1/4 sm:text-sm"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="min-w-0 basis-1/2 px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm sm:basis-1/4 sm:text-sm"
                  >
                    Contact
                  </TabsTrigger>
                  <TabsTrigger
                    value="professional"
                    className="min-w-0 basis-1/2 px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm sm:basis-1/4 sm:text-sm"
                  >
                    Professional
                  </TabsTrigger>
                  <TabsTrigger
                    value="teaching"
                    className="min-w-0 basis-1/2 px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm sm:basis-1/4 sm:text-sm"
                  >
                    Teaching
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                  <InfoCard
                    icon={User}
                    title="Personal Information"
                    className="lg:col-span-2"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <DataPoint
                        label="Full Name"
                        value={fullName}
                        icon={User}
                      />
                      <DataPoint
                        label="Email Address"
                        value={user.email}
                        icon={Mail}
                      />
                      <DataPoint
                        label="Employee ID"
                        value={teacher.employeeCode}
                        icon={Building}
                      />
                      <DataPoint
                        label="Role"
                        value={
                          user.memberships?.[0]?.role
                            ? user.memberships[0].role.toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())
                            : 'No membership'
                        }
                        icon={Briefcase}
                      />
                    </div>
                  </InfoCard>

                  <InfoCard icon={Calendar} title="Important Dates">
                    <div className="space-y-4">
                      {profile?.dateOfBirth && (
                        <DataPoint
                          label="Date of Birth"
                          value={format(
                            new Date(profile.dateOfBirth),
                            'MMM dd, yyyy'
                          )}
                          icon={Calendar}
                        />
                      )}
                      {profile?.joinedAt && (
                        <DataPoint
                          label="Joined Date"
                          value={format(
                            new Date(profile.joinedAt),
                            'MMM dd, yyyy'
                          )}
                          icon={Calendar}
                        />
                      )}
                      <DataPoint
                        label="Account Created"
                        value={format(
                          new Date(teacher.createdAt),
                          'MMM dd, yyyy'
                        )}
                        icon={Calendar}
                      />
                    </div>
                  </InfoCard>
                </div>

                {profile?.bio && (
                  <InfoCard icon={FileText} title="Biography">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {profile.bio}
                      </p>
                    </div>
                  </InfoCard>
                )}

                {profile?.teachingPhilosophy && (
                  <InfoCard icon={Heart} title="Teaching Philosophy">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {profile.teachingPhilosophy}
                      </p>
                    </div>
                  </InfoCard>
                )}
              </TabsContent>

              <TabsContent value="contact" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                  <InfoCard icon={Mail} title="Email & Communication">
                    <div className="space-y-4">
                      <DataPoint
                        label="Primary Email"
                        value={user.email}
                        icon={Mail}
                      />
                      {profile?.contactEmail &&
                        profile.contactEmail !== user.email && (
                          <DataPoint
                            label="Contact Email"
                            value={profile.contactEmail}
                            icon={Mail}
                          />
                        )}
                      {profile?.contactPhone && (
                        <DataPoint
                          label="Phone Number"
                          value={profile.contactPhone}
                          icon={Phone}
                        />
                      )}
                      {profile?.linkedinPortfolio && (
                        <div className="pt-2">
                          <a
                            href={profile.linkedinPortfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            View LinkedIn Profile
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  </InfoCard>

                  <InfoCard icon={MapPin} title="Address Information">
                    <div className="space-y-4">
                      {profile?.address && (
                        <>
                          <DataPoint
                            label="Street Address"
                            value={profile.address}
                            icon={MapPin}
                          />
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DataPoint label="City" value={profile.city} />
                            <DataPoint label="State" value={profile.state} />
                          </div>
                        </>
                      )}
                    </div>
                  </InfoCard>
                </div>
              </TabsContent>

              <TabsContent value="professional" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                  <InfoCard icon={GraduationCap} title="Education & Experience">
                    <div className="space-y-4">
                      <DataPoint
                        label="Highest Qualification"
                        value={profile?.qualification}
                        icon={GraduationCap}
                      />
                      <DataPoint
                        label="Teaching Experience"
                        value={
                          profile?.experienceInYears
                            ? `${profile.experienceInYears} years`
                            : undefined
                        }
                        icon={Award}
                      />
                      {profile?.resumeUrl && (
                        <div className="pt-2">
                          <a
                            href={profile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Resume
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  </InfoCard>

                  <InfoCard icon={Languages} title="Languages & Skills">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-3">
                          Languages Known
                        </p>
                        {profile?.languagesKnown &&
                          profile.languagesKnown.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {profile.languagesKnown.map((language: string) => (
                              <Badge
                                key={language}
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {language}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No languages specified
                          </p>
                        )}
                      </div>
                    </div>
                  </InfoCard>
                </div>
              </TabsContent>

              <TabsContent value="teaching" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                  <InfoCard icon={BookOpen} title="Subject Expertise">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-3">
                        Specialized Subjects
                      </p>
                      {profile?.specializedSubjects &&
                        profile.specializedSubjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.specializedSubjects.map(
                            (subject: string) => (
                              <Badge
                                key={subject}
                                className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              >
                                {subject}
                              </Badge>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No subjects specified
                        </p>
                      )}
                    </div>
                  </InfoCard>

                  <InfoCard icon={Users} title="Grade Preferences">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-3">
                        Preferred Teaching Grades
                      </p>
                      {profile?.preferredGrades &&
                        profile.preferredGrades.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.preferredGrades.map((grade: string) => (
                            <Badge
                              key={grade}
                              variant="outline"
                              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                            >
                              {grade}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No grade preferences specified
                        </p>
                      )}
                    </div>
                  </InfoCard>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-900">
              Deactivate Teacher Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to deactivate <strong>{fullName}</strong>?
              This will prevent them from accessing the system, but their data
              will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Deactivate Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showActivateDialog}
        onOpenChange={setShowActivateDialog}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-900">
              Activate Teacher Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to activate <strong>{fullName}</strong>?
              This will restore their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActivate}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
            >
              Activate Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
