import {
  LayoutGrid,
  Users,
  LucideIcon,
  Calendar,
  Bell,
  Backpack,
  ScrollText,
  IndianRupee,
  School,
  ShieldAlert,
  FileIcon,
  BadgeCheck,
  GraduationCap,
  ClipboardList,
  Paperclip,
  FileText,
  UserPlus,
  Contact,
  Umbrella,
  ShieldCheck,
  CalendarMinus,
  Bus,
  Settings,
  Video,
  Award,
  Activity,
} from 'lucide-react';


import { TerminologyLabels } from './terminology';

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export const getMenuList = (terminology: TerminologyLabels): Record<string, Group[]> => ({
  ADMIN: [
    {
      groupLabel: '',
      menus: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: LayoutGrid,
        },
      ],
    },
    {
      groupLabel: 'Management',
      menus: [
        {
          href: '/dashboard/grades',
          label: `${terminology.grade} Management`,
          icon: School,
          submenus: [
            { href: '/dashboard/grades', label: `${terminology.grades} & ${terminology.sections}` },
            { href: '/dashboard/subjects', label: 'Subjects' },
            {
              href: '/dashboard/teaching-assignments',
              label: 'Teaching Assignments',
            },
          ],
        },
        {
          href: '/dashboard/leads',
          label: 'Lead Management',
          icon: Contact,
        },
        {
          href: '/dashboard/teachers',
          label: 'Teachers Management',
          icon: GraduationCap,
        },

        {
          href: '/dashboard/students',
          label: `${terminology.student} Management`,
          icon: Users,
        },

        {
          href: '/dashboard/fees/admin',
          label: 'Fees Management',
          icon: IndianRupee,
        },
        {
          href: '/dashboard/holidays',
          label: 'Holidays Management',
          icon: Umbrella,
        },
        {
          href: '/dashboard/exams',
          label: 'Exam Management',
          icon: ClipboardList,
        },
        {
          href: '/dashboard/documents/verification',
          label: 'Documents Verification',
          icon: ShieldCheck,
        },
      ],
    },
    {
      groupLabel: 'Monitoring',
      menus: [
        {
          href: '/dashboard/attendance/analytics',
          label: 'Attendance Monitor',
          icon: Calendar,
          // submenus: [
          //   { href: '/dashboard/attendance', label: 'Student Attendance' },
          //   {
          //     href: '/dashboard/teacher-attendance',
          //     label: 'Teacher Attendance',
          //   },
          // ],
        },
        {
          href: '/dashboard/leaves/manage',
          label: 'Leaves Management',
          icon: CalendarMinus,
        },
        {
          href: '/dashboard/anonymous-complaints/manage',
          label: 'Complaints Management',
          icon: ShieldAlert,
        },
        {
          href: '/dashboard/notices',
          label: 'Notice Board',
          icon: Bell,
        },
        // {
        //   href: '/dashboard/notification-logs',
        //   label: 'Notification Logs',
        //   icon: Activity,
        // },
      ],
    },
  ],
  TEACHER: [
    {
      groupLabel: '',
      menus: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: LayoutGrid,
        },
      ],
    },
    {
      groupLabel: 'Management',
      menus: [
        {
          href: '/dashboard/attendance/mark',
          label: 'Take Attendance',
          icon: Calendar,
        },
        {
          href: '/dashboard/grades',
          label: `${terminology.grade} Management`,
          icon: School,
        },
        {
          href: '/dashboard/fees/teacher',
          label: 'Fees Management',
          icon: IndianRupee,
        },
        {
          href: '/dashboard/leads',
          label: 'Lead Management',
          icon: UserPlus,
        },
        {
          href: '/dashboard/students',
          label: `${terminology.students} Management`,
          icon: Users,
        },
        {
          href: '/dashboard/exams',
          label: 'Exam Management',
          icon: Paperclip,
        },
        {
          href: '/dashboard/holidays',
          label: 'Holidays Management',
          icon: Users,
        },
        {
          href: '/dashboard/anonymous-complaints/manage',
          label: 'Complaints Management',
          icon: ShieldAlert,
        },
        {
          href: '/dashboard/documents/verification',
          label: 'Documents Verification',
          icon: BadgeCheck,
        },
      ],
    },

    {
      groupLabel: 'Personal',
      menus: [
        // {
        //   href: '/leaves',
        //   label: 'Leave Management',
        //   icon: Calendar,
        // },
        {
          href: '/dashboard/leaves',
          label: 'Leaves',
          icon: Calendar,
        },
        {
          href: '/dashboard/notices',
          label: 'Notice Board',
          icon: Bell,
        },
        {
          href: '/dashboard/recorded-sessions',
          label: 'Recorded Sessions',
          icon: Video,
        },
        {
          href: '/dashboard/certificates',
          label: 'Certificate',
          icon: Award,
        },
      ],
    },
  ],
  STUDENT: [
    {
      groupLabel: '',
      menus: [
        {
          href: '/dashboard',
          label: 'Student Portal',
          icon: Backpack,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: 'Academic',
      menus: [
        {
          href: '/dashboard/assignments',
          label: 'Assignments',
          icon: ScrollText,
        },
        {
          href: '/dashboard/my-attendance',
          label: 'Attendance',
          icon: Calendar,
        },
        {
          href: '/dashboard/exams',
          label: 'Exams',
          icon: ClipboardList,
        },
        {
          href: '/dashboard/fees/student',
          label: 'Fees ',
          icon: IndianRupee,
        },
        {
          href: '/dashboard/documents',
          label: 'My Documents',
          icon: FileIcon,
        },
      ],
    },
    {
      groupLabel: 'Communication',
      menus: [
        // {
        //   href: '/dashboard/feedback',
        //   label: 'Teacher Feedback',
        //   icon: MessageSquare,
        // },
        {
          href: '/dashboard/leaves',
          label: 'Leaves',
          icon: FileText,
        },
        {
          href: '/dashboard/notices',
          label: 'Notice Board',
          icon: Bell,
        },
        {
          href: '/dashboard/anonymous-complaints',
          label: 'Anonymous complaints',
          icon: ShieldAlert,
        },
      ],
    },
  ],
  PARENT: [
    {
      groupLabel: '',
      menus: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: LayoutGrid,
        },
      ],
    },
    {
      groupLabel: 'Monitoring',
      menus: [
        {
          href: '/dashboard/my-children',
          label: 'My Children',
          icon: Users,
        },
      ],
    },
    {
      groupLabel: 'Academics',
      menus: [
        {
          href: '/dashboard/child-attendance',
          label: 'Attendance',
          icon: Calendar,
        },
        {
          href: '/dashboard/exams',
          label: 'Exams / Results ',
          icon: ClipboardList,
          submenus: [],
        },
        {
          href: '/dashboard/transport',
          label: 'Bus Transport',
          icon: Bus,
        },
        // {
        //   href: '/dashboard/timetable',
        //   label: 'Timetable',
        //   icon: Clock,
        //   submenus: [],
        // },
        // {
        //   href: '/dashboard/homework',
        //   label: 'Homework/ Assignments',
        //   icon: BookOpen,
        //   submenus: [],
        // },
        // {
        //   href: '/dashboard/syllabus',
        //   label: 'Syllabus',
        //   icon: BookMarked,
        //   submenus: [],
        // },
      ],
    },
    {
      groupLabel: 'Finance',
      menus: [
        {
          href: '/dashboard/fees/parent',
          label: 'Fees',
          icon: IndianRupee,
          submenus: [],
        },
      ],
    },

    {
      groupLabel: 'Communication',
      menus: [
        {
          href: '/dashboard/notices',
          label: 'Notice Board',
          icon: Bell,
          submenus: [],
        },
        // {
        //   href: '/dashboard/messages',
        //   label: 'Messages',
        //   icon: MessageSquare,
        //   submenus: [],
        // },
        // {
        //   href: '/dashboard/remark',
        //   label: 'Teacher Remarks',
        //   icon: ClipboardList,
        //   submenus: [],
        // },
        // {
        //   href: '/dashboard/events',
        //   label: 'Events & Holidays',
        //   icon: PartyPopper,
        //   submenus: [],
        // },
        // {
        //   href: '/dashboard/circulars',
        //   label: 'Circulars',
        //   icon: Megaphone,
        //   submenus: [],
        // },
      ],
    },
  ]
});
