'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Calendar,
  User,
  School,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { formatDateIN, cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeeklyAttendanceReportData } from '@/types';

const WeeklyAttendanceReportCard: React.FC<{
  data: WeeklyAttendanceReportData;
}> = ({ data }) => {
  const {
    student,
    attendanceRecords,
    weekRange,
    organization,
    cumulativeStats,
  } = data;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Calculate weekly statistics
  const weeklyStats = React.useMemo(() => {
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (r) => r.status === 'PRESENT'
    ).length;
    const lateDays = attendanceRecords.filter(
      (r) => r.status === 'LATE'
    ).length;
    const absentDays = attendanceRecords.filter(
      (r) => r.status === 'ABSENT'
    ).length;
    const notMarkedDays = attendanceRecords.filter(
      (r) => r.status === 'NOT_MARKED'
    ).length;

    // Calculate percentage excluding NOT_MARKED days
    const markedDays = totalDays - notMarkedDays;
    const attendancePercentage =
      markedDays > 0
        ? Math.round(((presentDays + lateDays) / markedDays) * 100)
        : 0;

    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      notMarkedDays,
      attendancePercentage,
    };
  }, [attendanceRecords]);

  // Status configuration for consistent styling and icons
  const statusConfig = {
    PRESENT: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Present',
      emoji: '✅',
    },
    ABSENT: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Absent',
      emoji: '❌',
    },
    // UNEXCUSED_ABSENT: {
    //   icon: XCircle,
    //   color: 'text-red-600',
    //   bgColor: 'bg-red-50',
    //   borderColor: 'border-red-200',
    //   label: 'Unexcused Absent',
    //   emoji: '❌',
    // },
    EXCUSED_ABSENT: {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Excused Absent',
      emoji: '📋',
    },
    LATE: {
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      label: 'Late',
      emoji: '⏰',
    },
    EARLY_DISMISSAL: {
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Early Dismissal',
      emoji: '🏃',
    },
    NOT_MARKED: {
      icon: AlertTriangle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Not Marked',
      emoji: '❓',
    },
  };

  const getAttendanceMessage = (percentage: number, notMarkedDays: number) => {
    if (notMarkedDays > 0) {
      return {
        message: `${notMarkedDays} day(s) not yet marked. Attendance percentage calculated from marked days only.`,
        color: 'text-gray-600',
      };
    }

    if (percentage >= 95)
      return {
        message: 'Excellent attendance! Keep up the outstanding work.',
        color: 'text-green-600',
      };
    if (percentage >= 90)
      return {
        message: 'Great attendance! Well done.',
        color: 'text-green-600',
      };
    if (percentage >= 85)
      return {
        message: 'Good attendance. Keep it consistent.',
        color: 'text-blue-600',
      };
    if (percentage >= 75)
      return {
        message:
          'Attendance needs improvement. Please ensure regular attendance.',
        color: 'text-yellow-600',
      };
    return {
      message: 'Poor attendance. Please contact the school immediately.',
      color: 'text-red-600',
    };
  };

  const attendanceMessage = getAttendanceMessage(
    weeklyStats.attendancePercentage,
    weeklyStats.notMarkedDays
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border-dashed hover:border-solid"
        >
          <Sparkles className="w-4 h-4 text-blue-400 " />
          AI Report
          {/* Generate AI Summary */}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl w-[95vw] h-[95vh] p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Weekly Attendance Report
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Past-week attendance summary for {student.firstName}. Dates shown
            are <strong>Monday – Sunday</strong> of the selected week.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden relative mt-4">
          <ScrollArea className="h-full">
            <div className="p-4 md:p-6 space-y-6 mb-5">
              {/* Student Information Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-blue-50 shadow-inner group relative">
                      {student.profileImage ? (
                        <Image
                          src={student.profileImage}
                          alt={`${student.firstName} ${student.lastName}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <User className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
                        {student.firstName}{' '}
                        {student.middleName && `${student.middleName} `}
                        {student.lastName}
                      </h2>
                      <p className="text-blue-500 font-medium">Roll No : {student.rollNumber}</p>
                    </div>

                    <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-slate-600 text-sm">
                        <School className="w-4 h-4 text-blue-500" />
                        <span>
                          Grade {student.grade.grade} • Section {student.section.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-slate-600 text-sm">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="font-semibold text-slate-700">
                          {formatDateIN(weekRange.startDate)} - {formatDateIN(weekRange.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Weekly Statistics Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Weekly Performance</h3>
                  <div className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                    Updates Live
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                  {[
                    { label: 'Attendance Rate', value: `${weeklyStats.attendancePercentage}%`, color: 'text-blue-600', icon: BarChart3, bg: 'bg-blue-50' },
                    { label: 'Days Present', value: weeklyStats.presentDays, color: 'text-emerald-600', icon: CheckCircle, bg: 'bg-emerald-50' },
                    { label: 'Total Absences', value: weeklyStats.absentDays, color: 'text-rose-600', icon: XCircle, bg: 'bg-rose-50' },
                    { label: 'Late Arrivals', value: weeklyStats.lateDays, color: 'text-amber-600', icon: Clock, bg: 'bg-amber-50' },
                    { label: 'Not Marked', value: weeklyStats.notMarkedDays, color: 'text-slate-500', icon: AlertTriangle, bg: 'bg-slate-50' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-1 hover:border-slate-200 transition-colors group"
                    >
                      <div className={cn("p-2 rounded-lg mb-1 transition-colors", stat.bg)}>
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                      </div>
                      <div className={cn("text-2xl font-bold group-hover:scale-105 transition-transform", stat.color)}>
                        {stat.value}
                      </div>
                      <div className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-tight">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Attendance Progress Bar */}
              <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                    <span className="font-bold text-slate-900">Attendance Insight</span>
                  </div>
                  <span className="text-sm font-bold text-slate-600 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                    {weeklyStats.attendancePercentage}% Compliance
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-50 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${weeklyStats.attendancePercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full transition-colors relative",
                        weeklyStats.attendancePercentage >= 90 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                          weeklyStats.attendancePercentage >= 75 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                            'bg-gradient-to-r from-rose-400 to-rose-600'
                      )}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>
                  <div className="flex justify-between text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-widest">
                    <span>Critical</span>
                    <span>Satisfactory</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <div className={cn(
                  "p-4 rounded-xl border flex items-start gap-3",
                  weeklyStats.attendancePercentage >= 90 ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
                    weeklyStats.attendancePercentage >= 75 ? "bg-amber-50 border-amber-100 text-amber-800" :
                      "bg-rose-50 border-rose-100 text-rose-800"
                )}>
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    {weeklyStats.attendancePercentage >= 90 ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                      weeklyStats.attendancePercentage >= 75 ? <AlertTriangle className="w-5 h-5 text-amber-600" /> :
                        <XCircle className="w-5 h-5 text-rose-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">Weekly Evaluation</p>
                    <p className="text-sm opacity-90">{attendanceMessage.message}</p>
                  </div>
                </div>
              </div>

              {/* Daily Attendance Grid */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Daily Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {attendanceRecords.map((record, index) => {
                    const config = statusConfig[record.status];
                    const IconComponent = config.icon;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ y: -4 }}
                        className={cn(
                          "rounded-2xl border-2 p-4 transition-all relative overflow-hidden group",
                          config.bgColor,
                          config.borderColor
                        )}
                      >
                        <div className="absolute -bottom-5 -right-5 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                          <IconComponent className="w-12 h-12" />
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long' })}
                            </p>
                            <div className="font-bold text-slate-900">
                              {formatDateIN(record.date)}
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">
                            {config.emoji}
                          </div>
                        </div>

                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset relative z-10",
                          config.color,
                          "bg-white/50 backdrop-blur-sm shadow-sm ring-slate-100"
                        )}>
                          <IconComponent className="w-3.5 h-3.5" />
                          {config.label}
                        </div>

                        {record.note && (
                          <div className="mt-4 p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 text-xs text-slate-600 line-clamp-2 hover:line-clamp-none transition-all relative z-10">
                            <span className="font-bold text-slate-900">Note: </span>
                            {record.note}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Cumulative Attendance Section */}
              {cumulativeStats && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 blur-[100px] -ml-32 -mb-32 rounded-full" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-blue-200">
                        <Sparkles className="w-4 h-4" />
                        Academic Overview
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl md:text-3xl font-bold">Year-to-Date Performance</h3>
                        <p className="text-slate-400 text-sm md:text-base">Comprehensive attendance metrics for the current session.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl md:text-5xl font-black text-white bg-clip-text">
                          {cumulativeStats.attendancePercentage}%
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">
                          Overall Score
                        </div>
                      </div>
                      <div className="w-px h-16 bg-white/10" />
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-slate-300">{cumulativeStats.totalDaysPresent} Days Present</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-slate-300">{cumulativeStats.totalDaysLate} Days Late</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-slate-300">{cumulativeStats.totalPossibleDays} Total Sessions</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 w-full bg-white/10 rounded-full h-2.5 overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cumulativeStats.attendancePercentage}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    />
                  </div>
                </motion.div>
              )}

              {/* Status Legend */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Report Legend
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const IconComponent = config.icon;
                    return (
                      <div key={status} className="flex flex-col items-center gap-3 text-center p-3 rounded-xl hover:bg-white transition-colors">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2 border-white transition-all hover:scale-110", config.bgColor, config.borderColor)}>
                          {config.emoji}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-slate-900 leading-tight">{config.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Floating Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="flex items-center gap-6">
              {organization.contactEmail && (
                <a href={`mailto:${organization.contactEmail}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  Support
                </a>
              )}
              {organization.contactPhone && (
                <a href={`tel:${organization.contactPhone}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  Contact
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyAttendanceReportCard;
