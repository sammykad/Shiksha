'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, capitalizeName } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  SearchX,
  UsersRound,
  FilterX,
  UserCheck,
  UserX,
  UserPlus,
  Edit,
  Eye,
  MoreHorizontal,
  Users,
  SearchXIcon,
  AlertCircle,
  GraduationCap,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { TeacherProfile, User } from '@/generated/prisma/client';
import { EmploymentStatus, Role } from '@/generated/prisma/enums';
import { getStatusConfig, TeacherDetailsModal } from './TeacherDetailsModal';
import { toggleTeacherStatus } from '@/app/actions';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from '@/components/ui/dialog';
import { EditTeacherForm } from './EditTeacherForm';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddTeacherForm } from './AddTeacherForm';

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  profileImage: string | null;
  createdAt: Date;
  isActive: boolean;
  teacher: {
    id: string;
    employeeCode: string | null;
    employmentStatus: EmploymentStatus;
    isActive: boolean;
    profile: {
      qualification: string | null;
      experienceInYears: number | null;
      contactPhone: string | null;
      specializedSubjects: string[];
    } | null;
    teachingAssignment: {
      subject: { name: string };
      grade: { grade: string };
    }[];
  } | null;
}

interface TeachersProps {
  teachers: {
    id: string;
    employeeCode: string | null;
    isActive: boolean;
    employmentStatus: EmploymentStatus;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    profile: TeacherProfile | null;
    user: User & {
      memberships: {
        role: Role;
      }[];
    };
  }[];
  staff: StaffMember[];
}

export type SelectedTeacher = {
  id: string;
  employeeCode: string | null;
  isActive: boolean;
  employmentStatus: EmploymentStatus;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  profile: TeacherProfile | null;
  user: User & {
    memberships: {
      role: Role;
    }[];
  };
} | null;

const TeachersTable = ({ teachers, staff }: TeachersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employmentFilter, setEmploymentFilter] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState<SelectedTeacher>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [onboardingMember, setOnboardingMember] = useState<StaffMember | null>(null);

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.employeeCode ?? '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && teacher.isActive) ||
      (statusFilter === 'inactive' && !teacher.isActive);

    const matchesEmployment =
      employmentFilter === 'all' ||
      teacher.employmentStatus === employmentFilter;

    const hasProfile = !!teacher.profile;

    return matchesSearch && matchesStatus && matchesEmployment && hasProfile;
  });

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());

    const isNotTeacher = !member.teacher;
    const isTeacherWithoutProfile = member.teacher && !member.teacher.profile;

    return matchesSearch && (isNotTeacher || isTeacherWithoutProfile);
  });

  const handleViewDetails = (teacher: SelectedTeacher) => {
    setSelectedTeacher(teacher);
    setIsDetailsModalOpen(true);
  };

  const handleEditTeacher = (teacher: SelectedTeacher) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (teacherId: string) => {
    await toggleTeacherStatus(teacherId);
  };

  const handleDeleteTeacher = async (teacherId: string) => { };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Tabs defaultValue="teachers" className="w-full">
            {/* Toolbar */}
            <div className="border-b bg-muted/30 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <TabsList className="bg-background shadow-sm h-9">
                  <TabsTrigger value="teachers" className="text-xs sm:text-sm gap-1.5 data-[state=active]:shadow-sm px-3">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Active Teachers
                    {filteredTeachers.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {filteredTeachers.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="staff" className="text-xs sm:text-sm gap-1.5 data-[state=active]:shadow-sm px-3">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Incomplete Profiles
                    {filteredStaff.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        {filteredStaff.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-full sm:w-56 h-8 text-xs bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Teachers Tab */}
            <TabsContent value="teachers" className="mt-0">
              {/* Filters Row */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/10">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] h-7 text-xs bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={employmentFilter}
                  onValueChange={setEmploymentFilter}
                >
                  <SelectTrigger className="w-[150px] h-7 text-xs bg-background">
                    <SelectValue placeholder="Employment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employment</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    <SelectItem value="PROBATION">Probation</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                {(statusFilter !== 'all' || employmentFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                    onClick={() => {
                      setStatusFilter('all');
                      setEmploymentFilter('all');
                    }}
                  >
                    <FilterX className="h-3 w-3" />
                    Reset
                  </Button>
                )}

                <div className="ml-auto text-xs text-muted-foreground">
                  {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Table */}
              {filteredTeachers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Teacher</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Code</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Qualification</TableHead>
                        <TableHead className="font-semibold">Exp.</TableHead>
                        <TableHead className="font-semibold">Subjects</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.map((teacher) => {
                        const statusConfig = getStatusConfig(
                          teacher.employmentStatus,
                          teacher.isActive
                        );
                        const specializedSubjects =
                          teacher.profile?.specializedSubjects ?? [];

                        return (
                          <TableRow
                            key={teacher.id}
                            className="group cursor-pointer"
                            onClick={() => handleViewDetails(teacher)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
                                  <AvatarImage
                                    src={teacher.user.profileImage || '/placeholder.svg'}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(`${teacher.user.firstName} ${teacher.user.lastName}`)}
                                  </AvatarFallback>
                                </Avatar>
                              <div className="min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {capitalizeName(teacher.user.firstName)} {capitalizeName(teacher.user.lastName)}
                                </div>
                                  <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                                    {teacher.user.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {teacher.employeeCode ? (
                                <Badge variant="outline" className="font-mono text-[10px] bg-muted/50 whitespace-nowrap">
                                  {teacher.employeeCode}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[120px]">
                                  {teacher.profile?.contactPhone ?? '—'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-xs">
                                <GraduationCap className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[120px]">
                                  {teacher.profile?.qualification ?? '—'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-medium tabular-nums">
                                {teacher.profile?.experienceInYears ?? 0}
                                <span className="text-muted-foreground font-normal ml-0.5">yr</span>
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex max-w-[132px] items-center gap-1 sm:max-w-[180px]">
                                {specializedSubjects.length > 0 ? (
                                  <>
                                    <Badge
                                      variant="secondary"
                                      className="h-5 max-w-[92px] truncate px-1.5 py-0 text-[10px] font-normal sm:max-w-[76px] lg:max-w-[96px]"
                                    >
                                      {specializedSubjects[0]}
                                    </Badge>
                                    {specializedSubjects[1] && (
                                      <Badge
                                        variant="secondary"
                                        className="hidden h-5 max-w-[76px] truncate px-1.5 py-0 text-[10px] font-normal sm:inline-flex lg:max-w-[96px]"
                                      >
                                        {specializedSubjects[1]}
                                      </Badge>
                                    )}
                                    {specializedSubjects.length > 1 && (
                                      <Badge
                                        variant="secondary"
                                        className="h-5 shrink-0 px-1.5 py-0 text-[10px] font-normal sm:hidden"
                                      >
                                        +{specializedSubjects.length - 1}
                                      </Badge>
                                    )}
                                    {specializedSubjects.length > 2 && (
                                      <Badge
                                        variant="secondary"
                                        className="hidden h-5 shrink-0 px-1.5 py-0 text-[10px] font-normal sm:inline-flex"
                                      >
                                        +{specializedSubjects.length - 2}
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-xs text-muted-foreground">No subjects</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${statusConfig.color} hover:bg-${statusConfig.color}-300`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`}
                                />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleViewDetails(teacher)}
                                    className="text-xs"
                                  >
                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleEditTeacher(teacher)}
                                    className="text-xs"
                                  >
                                    <Edit className="mr-2 h-3.5 w-3.5" />
                                    Edit Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleToggleStatus(teacher.id)}
                                    className="text-xs"
                                  >
                                    {teacher.isActive ? (
                                      <>
                                        <UserX className="mr-2 h-3.5 w-3.5 text-red-500" />
                                        <span className="text-red-600">Deactivate</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="mr-2 h-3.5 w-3.5 text-green-500" />
                                        <span className="text-green-600">Activate</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex justify-center items-center py-16 px-4">
                  <EmptyState
                    title="No teachers found"
                    description="Try adjusting your filters or search terms."
                    icons={[SearchX, UsersRound, FilterX]}
                  />
                </div>
              )}
            </TabsContent>

            {/* Incomplete Profiles Tab */}
            <TabsContent value="staff" className="mt-0">
              {filteredStaff.length > 0 ? (
                <div className="divide-y">
                  {filteredStaff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative">
                          <Avatar className="h-10 w-10 ring-2 ring-orange-100 dark:ring-orange-900/30">
                            <AvatarImage
                              src={member.profileImage || '/placeholder.svg'}
                            />
                            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-orange-400 to-amber-500 text-white">
                              {getInitials(`${member.firstName} ${member.lastName}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-orange-400 border-2 border-background" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {capitalizeName(member.firstName)} {capitalizeName(member.lastName)}
                            </span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal capitalize">
                              {member.role.toLowerCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mr-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                            <span className="text-orange-600 dark:text-orange-400 font-medium">Profile Incomplete</span>
                          </div>
                          <span>Joined {new Date(member.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white shadow-sm shrink-0"
                        onClick={() => setOnboardingMember(member)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Setup Profile</span>
                        <ChevronRight className="h-3.5 w-3.5 sm:hidden" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center py-16 px-4">
                  <EmptyState
                    title="All caught up!"
                    description="Everyone on your staff has a complete teacher profile."
                    icons={[UserCheck, Users, SearchXIcon]}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <TeacherDetailsModal
        teacher={selectedTeacher}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update teacher profile information.
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <EditTeacherForm
              teacher={selectedTeacher}
              onSuccess={() => {
                setIsEditModalOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Onboarding Dialog */}
      <Dialog open={!!onboardingMember} onOpenChange={(open) => !open && setOnboardingMember(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-orange-500" />
              Setup Teacher Profile
            </DialogTitle>
            <DialogDescription>
              Complete the profile for <span className="font-medium text-foreground">{onboardingMember?.firstName} {onboardingMember?.lastName}</span> to enable teacher features and assignments.
            </DialogDescription>
          </DialogHeader>
          {onboardingMember && (
            <AddTeacherForm
              prefillData={{
                firstName: onboardingMember.firstName,
                lastName: onboardingMember.lastName,
                email: onboardingMember.email,
              }}
              onSuccess={() => setOnboardingMember(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeachersTable;
