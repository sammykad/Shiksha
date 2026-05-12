import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import prisma from '@/lib/db';
import {
  CalendarDays,
  MessageCircle,
  CreditCard,
  IndianRupee,
  Edit,
  Phone,
  Mail,
  FileText,
  Users,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrencyIN, formatDateIN } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { StudentDashboardStatsCards } from '@/components/dashboard/Student/StudentDashboardStatsCards';
import { StudentAttendanceCalendar } from '@/components/dashboard/StudentAttendance/attendance-calendar';
import { getCurrentAcademicYearId } from '@/lib/academicYear';
import { getOrganizationId } from '@/lib/organization';
import { DocumentCard } from '@/components/dashboard/Student/documents/DocumentCard';
import StudentAcademicPerformance from '@/components/dashboard/Student/StudentAcademicPerformance';
import { StudentReportDialog } from '@/components/dashboard/Student/student-report-dialog';
import { getStudentPerformance } from '@/lib/data/student/get-student-performance';
import StudentSubjectsRadar from '@/components/dashboard/Student/student-subjects-radar';

const getStudentFullDetails = async (studentId: string, organizationId: string, academicYearId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId, organizationId },
    include: {
      grade: true,
      section: {
        include: {
          classTeacher: { include: { user: true } },
        },
      },
      user: true,
      organization: true,
      parents: {
        include: { parent: true },
      },
      StudentDocument: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
      },
      Fee: {
        where: { academicYearId },
        include: {
          feeCategory: true,
          payments: {
            include: { payer: true },
            orderBy: { paymentDate: 'desc' },
          },
        },
      },
      StudentAttendance: {
        where: { academicYearId },
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!student) return null;



  // Calculate stats from the fetched data
  const totalAttendance = student.StudentAttendance.length;
  const presentAttendance = student.StudentAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;

  const totalFees = student.Fee.reduce((sum, fee) => sum + fee.totalFee, 0);
  const paidFees = student.Fee.reduce((sum, fee) => sum + fee.paidAmount, 0);

  return {
    student,
    attendanceRate,
    totalFees,
    paidFees,
    pendingFees: totalFees - paidFees,
  };
};


const getOrganizationMetaData = async (organizationId: string, academicYearId: string) => {
  const [academicYears, examSessions, holidayData] = await Promise.all([
    prisma.academicYear.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        isCurrent: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { startDate: 'desc' },
    }),
    prisma.examSession.findMany({
      where: { organizationId, academicYearId },
      select: {
        id: true,
        title: true,
        academicYearId: true,
        startDate: true,
      },
      orderBy: { startDate: 'desc' },
    }),
    prisma.academicCalendar.findMany({
      where: { organizationId, academicYearId },
    }),
  ]);

  return { academicYears, examSessions, holidayData };
};

const StudentDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id: studentId } = await params;
  const organizationId = await getOrganizationId();
  const academicYearId = await getCurrentAcademicYearId();

  // Optimized parallel fetching for student data and org meta
  const [studentData, orgMeta, performanceData] = await Promise.all([
    getStudentFullDetails(studentId, organizationId, academicYearId),
    getOrganizationMetaData(organizationId, academicYearId),
    getStudentPerformance(studentId),
  ]);

  if (!studentData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Student Not Found</h2>
        <p className="text-slate-500">The student record you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link href="/dashboard/students">Back to Students</Link>
        </Button>
      </div>
    );
  }

  const { student, attendanceRate, totalFees, paidFees, pendingFees } = studentData;
  const { academicYears, examSessions, holidayData } = orgMeta;

  // Prepare stats for the stats card to avoid extra DB call
  const dashboardStats = {
    attendanceRate,
    attendancePresent: student.StudentAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length,
    attendanceTotal: student.StudentAttendance.length,
    gpa: performanceData.reportCards[0]?.cgpa || 0,
    grade: performanceData.reportCards[0]?.overallGrade || 'N/A',
    upcomingExams: performanceData.upcomingExams,
    pendingAssignments: 0,
  };


  return (
    <div className="mx-2 space-y-8 pb-8">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-20 w-20 sm:w-24 sm:h-24 border-4 border-white dark:border-slate-800 shadow-md">
                <AvatarImage
                  src={
                    student?.profileImage ||
                    student?.user.profileImage ||
                    '/placeholder.svg?height=96&width=96'
                  }
                  className='object-cover object-center"'
                  alt="Student"
                />
                <AvatarFallback className="text-lg font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {student?.firstName?.[0]}
                  {student?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Student Info */}
            <div className="space-y-3 text-center sm:text-left">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {student?.firstName} {student?.lastName}
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium"
                  >
                    Roll No: {student?.rollNumber}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300"
                  >
                    {student?.grade.grade} - {student?.section?.name}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row items-center gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
                  <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm">{student?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
                  <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm">{student?.phoneNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 justify-center">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Link href={`/dashboard/students/${student?.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            <StudentReportDialog academicYears={academicYears} currentAcademicYearId={academicYearId} studentId={studentId} />
          </div>
        </div>
      </div>

      <StudentDashboardStatsCards studentId={studentId} data={dashboardStats} />

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <Tabs defaultValue="overview" className="w-full">
          {/* Tabs Header */}
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-t-xl">
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6 h-auto bg-transparent p-2 gap-1">
              <TabsTrigger
                value="overview"
                className="flex-1 data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-slate-900 data-[state=active]:dark:text-white data-[state=active]:shadow-none font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                <span className="text-xs sm:text-sm">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="academic"
                className="flex-1 data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-slate-900 data-[state=active]:dark:text-white data-[state=active]:shadow-none font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                <span className="text-xs sm:text-sm">Academic</span>
              </TabsTrigger>
              <TabsTrigger
                value="attendance"
                className="flex-1 data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-slate-900 data-[state=active]:dark:text-white data-[state=active]:shadow-none font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                <span className="text-xs sm:text-sm">Attendance</span>
              </TabsTrigger>
              <TabsTrigger
                value="fees"
                className="flex-1 data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-slate-900 data-[state=active]:dark:text-white data-[state=active]:shadow-none font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                <span className="text-xs sm:text-sm">Fees</span>
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="flex-1 data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-slate-900 data-[state=active]:dark:text-white data-[state=active]:shadow-none font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                <span className="text-xs sm:text-sm">Documents</span>
              </TabsTrigger>
              <TabsTrigger
                value="parents"
                className="flex-1 data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-slate-900 data-[state=active]:dark:text-white data-[state=active]:shadow-none font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                <span className="text-xs sm:text-sm">Parents</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="py-4">
            <TabsContent value="overview" className="space-y-8 mt-0">
              <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-1 border-slate-200/60 dark:border-slate-700/60 h-full flex flex-col overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-slate-700 rounded-t-lg shrink-0">
                    <CardTitle className="flex items-center gap-2 dark:text-slate-200">
                      <Users className="w-5 h-5 text-blue-600" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 relative min-h-[300px]">
                    <div className="absolute inset-0">
                      <ScrollArea className="h-full px-6 py-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                              <label className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Full Name
                              </label>
                              <p className="font-bold text-lg text-slate-900 dark:text-slate-100 mt-1">
                                {student?.firstName} {student?.middleName} {student?.lastName}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Roll Number
                                </label>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                  {student?.rollNumber}
                                </p>
                              </div>
                              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  Student ID
                                </label>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1 text-xs">
                                  {student?.id}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                              <label className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" />
                                Date of Birth
                              </label>
                              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                {student?.dateOfBirth
                                  ? formatDateIN(student.dateOfBirth)
                                  : 'N/A'}
                              </p>
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                Age:{' '}
                                {student?.dateOfBirth
                                  ? new Date().getFullYear() -
                                  new Date(student.dateOfBirth).getFullYear()
                                  : 'N/A'}{' '}
                                years
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                                <label className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                  Gender
                                </label>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                  {student?.gender}
                                </p>
                              </div>
                              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                                <label className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                  Blood Group
                                </label>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                  {student?.bloodGroup || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                              <label className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                Academic Details
                              </label>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Class:
                                  </span>
                                  <Badge variant="meta" className="font-medium">
                                    {student?.grade.grade} -{' '}
                                    {student?.section?.name}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Class Teacher:
                                  </span>
                                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {student?.section?.classTeacher?.user ? (
                                      `${student.section.classTeacher.user.firstName} ${student.section.classTeacher.user.lastName}`
                                    ) : (
                                      <span className="text-slate-400 italic font-normal">Not Assigned</span>
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Admission Date:
                                  </span>
                                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {student?.createdAt
                                      ? formatDateIN(student.createdAt)
                                      : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg border border-red-200/50 dark:border-red-800/50">
                              <label className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Contact Information
                              </label>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {student?.email}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {student?.phoneNumber}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {student?.emergencyContact}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-lg border border-teal-200/50 dark:border-teal-800/50">
                              <label className="text-sm font-medium text-teal-700 dark:text-teal-300 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Additional Information
                              </label>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    caste:
                                  </span>
                                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {student?.caste || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Nationality:
                                  </span>
                                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {/* {student?.nationality || 'N/A'} */}INDIAN
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Address:
                                  </span>
                                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 text-right max-w-32">
                                    {student?.address || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                              <label className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Status & Verification
                              </label>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Account Status:
                                  </span>
                                  <Badge variant="verified">{student.status}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Documents:
                                  </span>
                                  <Badge
                                    variant={
                                      student.StudentDocument.every((doc) => doc.verified)
                                        ? 'verified'
                                        : student.StudentDocument.some((doc) => doc.rejected)
                                          ? 'rejected'
                                          : 'pending'
                                    }
                                  >
                                    {student.StudentDocument.every((doc) => doc.verified)
                                      ? 'Complete'
                                      : student.StudentDocument.some((doc) => doc.rejected)
                                        ? 'Issues Found'
                                        : 'Pending Review'}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Fee Status:
                                  </span>
                                  <Badge
                                    variant={
                                      pendingFees === 0 ? 'verified' : 'pending'
                                    }
                                  >
                                    {pendingFees === 0
                                      ? 'Up to Date'
                                      : 'Payment Due'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
                <StudentSubjectsRadar
                  role="ADMIN"
                  examResults={performanceData.examResults}
                  reportCards={performanceData.reportCards}
                  examSessions={examSessions}
                  activeAcademicYearId={academicYearId}
                  studentName={`${student?.firstName} ${student?.lastName}`}
                  className='lg:col-span-2 border-slate-200/60 dark:border-slate-700/60 '
                />
              </div>
            </TabsContent>

            <TabsContent value="academic" className="mt-0">
              <StudentAcademicPerformance
                examResults={performanceData.examResults}
                reportCards={performanceData.reportCards}
                upcomingExams={performanceData.upcomingExams}
                examEnrollments={performanceData.examEnrollments}
              />
            </TabsContent>

            <TabsContent value="attendance" className="mt-0">
              <Card className='border-none'>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5" />
                      Attendance
                    </div>
                    <Button asChild size={'sm'}>
                      <Link href={'/dashboard/attendance/mark'}>
                        Mark Attendance
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {student.StudentAttendance.length > 0 ? (
                    <StudentAttendanceCalendar
                      attendanceRecords={student.StudentAttendance}
                      academicCalendarEvents={holidayData}
                      activeAcademicYear={academicYears.find(y => y.id === academicYearId)}
                    />
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center">
                      <CalendarDays className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Detailed attendance tracking will be displayed here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="mt-0">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-slate-200/60 dark:border-slate-700/60 bg-transparent shadow-none">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm font-semibold">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      Fee Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-0 p-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 shadow-none rounded-xl">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between pb-2">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Fees</span>
                            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                              <IndianRupee className="h-3.5 w-3.5 text-blue-500/70" />
                            </div>
                          </div>
                          <div className="text-xl font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                            ₹{formatCurrencyIN(totalFees)}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            Total allocated for the year
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 shadow-none rounded-xl">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between pb-2">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paid Amount</span>
                            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500/70" />
                            </div>
                          </div>
                          <div className="text-xl font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                            ₹{formatCurrencyIN(paidFees)}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            Total collected so far
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 shadow-none rounded-xl">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between pb-2">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending</span>
                            <div className="p-1.5 bg-red-50 dark:bg-red-950/30 rounded-lg">
                              <AlertCircle className="h-3.5 w-3.5 text-red-500/70" />
                            </div>
                          </div>
                          <div className="text-xl font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                            ₹{formatCurrencyIN(pendingFees)}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            Outstanding balance
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          Fee Breakdown
                        </h4>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          {student.Fee.length} Items
                        </span>
                      </div>

                      <ScrollArea className="h-64 pr-4 -mr-4">
                        <div className="space-y-3">
                          {student.Fee.length > 0 ? (
                            student.Fee.map((fee, index) => (
                              <div
                                key={index}
                                className="p-3.5 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all duration-300"
                              >
                                <div className="flex items-center justify-between mb-2.5">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                      {fee.feeCategory.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                      <CalendarDays className="w-3 h-3 opacity-60" />
                                      Due: {formatDateIN(fee.dueDate)}
                                    </p>
                                  </div>
                                  <Badge
                                    variant={
                                      fee.status === 'PAID'
                                        ? 'verified'
                                        : fee.status === 'OVERDUE'
                                          ? 'rejected'
                                          : 'pending'
                                    }
                                    className="text-[10px] font-medium px-2 py-0 bg-transparent border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 shadow-none"
                                  >
                                    {fee.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                                  <span className="tabular-nums">
                                    Total: ₹{formatCurrencyIN(fee.totalFee)}
                                  </span>
                                  <span className="tabular-nums font-medium text-slate-600 dark:text-slate-300">
                                    Paid: ₹{formatCurrencyIN(fee.paidAmount)}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${fee.status === 'PAID'
                                      ? 'bg-emerald-400/60'
                                      : fee.status === 'OVERDUE'
                                        ? 'bg-red-400/60'
                                        : 'bg-blue-400/60'
                                      }`}
                                    style={{
                                      width: `${(fee.paidAmount / fee.totalFee) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="h-48 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                              <CreditCard className="w-10 h-10 text-slate-200 dark:text-slate-800 mb-3" />
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No fees assigned</p>
                              <p className="text-xs text-slate-400 mt-1">No fee records found for this academic year.</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/60 dark:border-slate-700/60 bg-transparent shadow-none">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm font-semibold">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        Payment History
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {student.Fee.flatMap((fee) => fee.payments).length} Transactions
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-[470px] pr-4 -mr-4">
                      <div className="space-y-3">
                        {student.Fee.flatMap((fee) => fee.payments).length > 0 ? (
                          student.Fee
                            .flatMap((fee) =>
                              fee.payments.map((payment) => ({
                                ...payment,
                                feeCategory: fee.feeCategory.name,
                              }))
                            )
                            .sort(
                              (a, b) =>
                                new Date(b.paymentDate).getTime() -
                                new Date(a.paymentDate).getTime()
                            )
                            .slice(0, 15)
                            .map((payment, index) => (
                              <div
                                key={index}
                                className="p-3.5 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all duration-300"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${payment.status === 'COMPLETED'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/20'
                                      : payment.status === 'FAILED'
                                        ? 'bg-red-50 dark:bg-red-950/20'
                                        : 'bg-amber-50 dark:bg-amber-950/20'
                                      }`}>
                                      <CheckCircle className={`w-3.5 h-3.5 ${payment.status === 'COMPLETED' ? 'text-emerald-500/60' : payment.status === 'FAILED' ? 'text-red-500/60' : 'text-amber-500/60'
                                        }`} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                                        ₹{formatCurrencyIN(payment.amount)}
                                      </p>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {payment.feeCategory}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant={
                                      payment.status === 'COMPLETED'
                                        ? 'verified'
                                        : payment.status === 'FAILED'
                                          ? 'rejected'
                                          : 'pending'
                                    }
                                    className="text-[10px] font-medium px-2 py-0 bg-transparent border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 shadow-none"
                                  >
                                    {payment.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <CalendarDays className="w-3 h-3 opacity-60" />
                                      {formatDateIN(payment.paymentDate)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <CreditCard className="w-3 h-3 opacity-60" />
                                      {payment.paymentMethod || 'Online'}
                                    </span>
                                  </div>
                                  {payment.transactionId && (
                                    <span className="font-mono text-[10px] opacity-40">
                                      #{payment.transactionId.slice(-6)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                            <Clock className="w-10 h-10 text-slate-200 dark:text-slate-800 mb-3" />
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No transactions</p>
                            <p className="text-xs text-slate-400 mt-1">No payments have been recorded yet.</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <Card className="shadow-none border-none">
                <CardContent className="p-4">
                  {student.StudentDocument && student.StudentDocument.filter(d => !d.isDeleted).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {student.StudentDocument
                        .filter(d => !d.isDeleted)
                        .map((document) => (
                          <DocumentCard
                            key={document.id}
                            studentDocument={document}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                      <div className="mx-auto w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <FileText className="h-5 w-5 text-slate-200" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-900">
                        No documents found
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Upload documents like Aadhaar, PAN, or Birth Certificate.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parents" className="mt-0">
              <div className="flex flex-wrap gap-6 max-w-5xl">
                {/* Existing Parent Cards (Limit to 2) */}
                {student.parents.slice(0, 2).map((parentStudent, index) => (
                  <Card
                    key={index}
                    className="flex-1 min-w-[320px] overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/20 shadow-none rounded-2xl transition-all duration-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
                  >
                    <CardHeader className="pb-4 pt-6 px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <Users className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-base font-semibold dark:text-slate-100">
                              {parentStudent.parent.firstName}{' '}
                              {parentStudent.parent.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-medium text-muted-foreground">
                                {parentStudent.relationship}
                              </span>
                              {parentStudent.isPrimary && (
                                <Badge
                                  className="text-xs h-4 px-1.5 font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 shadow-none"
                                >
                                  PRIMARY
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-2">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-slate-200/60 hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-200">
                          <div className="p-2 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg">
                            <Mail className="w-3.5 h-3.5 text-blue-500/70" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                              Email Address
                            </label>
                            <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">
                              {parentStudent.parent.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-slate-200/60 hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-200">
                          <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg">
                            <Phone className="w-3.5 h-3.5 text-emerald-500/70" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                              Phone Number
                            </label>
                            <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 tabular-nums">
                              {parentStudent.parent.phoneNumber}
                            </p>
                          </div>
                        </div>

                        {parentStudent.parent.whatsAppNumber && (
                          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-slate-200/60 hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-200">
                            <div className="p-2 bg-green-50/50 dark:bg-green-950/30 rounded-lg">
                              <MessageCircle className="w-3.5 h-3.5 text-green-500/70" />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                WhatsApp
                              </label>
                              <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 tabular-nums">
                                {parentStudent.parent.whatsAppNumber}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <Button
                          className="w-full rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 shadow-none font-medium"
                          variant="outline"
                          size="sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5 mr-2 opacity-60" />
                          Contact Parent
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Parent Skeleton Cards (Total slots always = 2) */}
                {Array.from({ length: Math.max(0, 2 - student.parents.slice(0, 2).length) }).map((_, i) => (
                  <Link
                    key={`skeleton-${i}`}
                    href={`/dashboard/students/${studentId}/edit`}
                    className="flex-1 min-w-[320px] group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300 min-h-[340px] overflow-hidden"
                  >
                    {/* Animated gradient background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/50 dark:group-hover:from-blue-900/10 dark:group-hover:to-indigo-900/10 transition-all duration-500" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-md group-hover:border-blue-200 dark:group-hover:border-blue-900 transition-all duration-300">
                        <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {student.parents.length === 0 && i === 0 ? 'Add Primary Parent' : 'Add Secondary Parent'}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed">
                          Link a mother, father, or guardian record to this student's profile.
                        </p>
                      </div>

                      <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Link Record <Plus className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Decorative ghost icons */}
                    <Users className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-200/40 dark:text-slate-800/40 transform -rotate-12 group-hover:scale-110 transition-transform duration-500" />
                  </Link>
                ))}
              </div>
            </TabsContent>
          </div >
        </Tabs >
      </div >
    </div >
  );
};

export default StudentDetailsPage;
