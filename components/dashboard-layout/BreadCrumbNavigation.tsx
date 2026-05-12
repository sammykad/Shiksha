'use client';
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  students: 'Students',
  teachers: 'Teachers',
  attendance: 'Attendance',
  'my-attendance': 'My Attendance',
  'child-attendance': 'Child Attendance',
  analytics: 'Analytics',
  mark: 'Mark Attendance',
  fees: 'Fees',
  admin: 'Admin',
  student: 'Student',
  parent: 'Parent',
  teacher: 'Teacher',
  exams: 'Exams',
  'exam-sessions': 'Exam Sessions',
  leads: 'Leads',
  notices: 'Notices',
  leaves: 'Leaves',
  grades: 'Grades',
  subjects: 'Subjects',
  'teaching-assignments': 'Teaching Assignments',
  holidays: 'Holidays',
  documents: 'Documents',
  verification: 'Verification',
  'anonymous-complaints': 'Complaints',
  'my-children': 'My Children',
  reports: 'Reports',
  settings: 'Settings',
  agents: 'Agents',
  create: 'Create',
  edit: 'Edit',
};

// Matches cuid (24+ lowercase alphanumeric) or uuid (8-4-4-4-12)
const isId = (segment: string) =>
  /^[a-z0-9]{24,}$/.test(segment) ||
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(segment);

const BreadCrumbNavigation = () => {
  const pathname = usePathname();

  const segments = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);

  const crumbs = useMemo(() => {
    return segments
      .map((segment, index) => ({
        segment,
        fullPath: '/' + segments.slice(0, index + 1).join('/'), // ✅ built from original segments
        isId: isId(segment),
      }))
      .filter((crumb) => !crumb.isId); // hide IDs from display but paths are still correct
  }, [segments]);

  return (
    <Breadcrumb className="flex shrink-0 items-center px-4 my-5">
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <React.Fragment key={crumb.fullPath}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem className="cursor-pointer capitalize">
              <Link href={crumb.fullPath}>
                {LABELS[crumb.segment] ?? crumb.segment.replace(/-/g, ' ')}
              </Link>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadCrumbNavigation;