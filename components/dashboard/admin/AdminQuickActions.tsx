'use client';

import {
  UserPlus,
  FileText,
  Calendar,
  IndianRupee,
  AlertTriangle,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    title: 'Add Student',
    description: 'Enroll new student',
    icon: UserPlus,
    href: '/dashboard/students/create',
    featured: true,
  },
  {
    title: 'Create Notice',
    description: 'Publish announcement',
    icon: FileText,
    href: '/dashboard/notices/create',
    featured: true,
  },
  {
    title: 'Take Attendance',
    description: 'Record daily attendance',
    icon: Users,
    href: '/dashboard/attendance/mark',
    featured: true,
  },
  {
    title: 'Manage Fees',
    description: 'Fee collection & tracking',
    icon: IndianRupee,
    href: '/dashboard/fees/admin',
    featured: true,
  },
  {
    title: 'Add Holiday',
    description: 'Update academic calendar',
    icon: Calendar,
    href: '/dashboard/holidays',
    featured: false,
  },
  {
    title: 'View Complaints',
    description: 'Handle pending issues',
    icon: AlertTriangle,
    href: '/dashboard/anonymous-complaints/manage',
    featured: false,
  },
  {
    title: 'Manage Grades',
    description: 'Configure classes & sections',
    icon: BookOpen,
    href: '/dashboard/grades',
    featured: false,
  },
  {
    title: 'View Analytics',
    description: 'Performance insights',
    icon: BarChart3,
    href: '/dashboard/attendance/analytics',
    featured: false,
  },
  {
    title: 'Settings',
    description: 'System configuration',
    icon: Settings,
    href: '/dashboard/settings',
    featured: false,
  },
];

export default function AdminQuickActions() {
  const featured = actions.filter((a) => a.featured);
  const secondary = actions.filter((a) => !a.featured);

  return (
    <div className="space-y-6 pt-2">
      {/* Featured 2×2 */}
      <div className="grid grid-cols-2 gap-2">
        {featured.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={i} href={action.href} className="group">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-border/80 transition-all duration-150">
                <div className="mt-0.5 p-1.5 rounded-lg bg-background border border-border shrink-0">
                  <Icon className="w-4 h-4 text-foreground" strokeWidth={1.6} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
          Other
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Secondary list */}
      <div className="grid grid-cols-1 gap-0.5">
        {secondary.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={i} href={action.href} className="group">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors duration-150">
                <Icon
                  className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-150 shrink-0"
                  strokeWidth={1.6}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-150 flex-1">
                  {action.title}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}