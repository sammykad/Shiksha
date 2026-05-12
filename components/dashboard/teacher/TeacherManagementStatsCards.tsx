'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Clock, GraduationCap } from 'lucide-react';
import type { SelectedTeacher } from './TeachersTable';

interface TeacherStatsProps {
  teachers: SelectedTeacher[];
}

export function TeacherManagementStatsCards({ teachers }: TeacherStatsProps) {
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(
    (t) => t?.isActive && t?.employmentStatus === 'ACTIVE'
  ).length;
  const onLeaveTeachers = teachers.filter(
    (t) => t?.employmentStatus === 'ON_LEAVE'
  ).length;

  const teachersWithExperience = teachers.filter(
    (t) => t?.profile?.experienceInYears !== undefined
  );
  const avgExperience =
    teachersWithExperience.length > 0
      ? Math.round(
        teachersWithExperience.reduce(
          (acc, t) => acc + (t?.profile?.experienceInYears ?? 0),
          0
        ) / teachersWithExperience.length
      )
      : 0;

  const activePercentage =
    totalTeachers > 0 ? Math.round((activeTeachers / totalTeachers) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="relative overflow-hidden">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Teachers
              </p>
              <p className="text-2xl font-bold">{totalTeachers}</p>
            </div>
            <Users className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Teachers
              </p>
              <p className="text-2xl font-bold text-green-600">
                {activeTeachers}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activePercentage}% of total
              </p>
            </div>
            <UserCheck className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                On Leave
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {onLeaveTeachers}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Currently unavailable
              </p>
            </div>
            <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Experience
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {avgExperience} yrs
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                With reported experience
              </p>            </div>
            <GraduationCap className="w-5 h-5 sm:w-8 sm:h-8 text-purple-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}