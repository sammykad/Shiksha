'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Phone,
  Mail,
  MessageCircle,
  Edit2,
  Trash2,
  Clock,
  AlertCircle,
  MapPin,
  School,
  Calendar,
  Loader2,
  UserCircle,
  IndianRupee,
  CalendarClock,
  Activity,
  Globe,
  Crosshair,
  CalendarCheck,
  GraduationCap,
  Save,
} from 'lucide-react';
import { Prisma } from '@/generated/prisma/client';
import { formatDateIN } from '@/lib/utils';
import { LeadActivityTimeline } from './lead-activity-timeline';
import { AssignLeadDialog } from './assign-lead-dialog';
import { deleteLead } from '@/lib/data/leads/delete-lead';
import { toast } from 'sonner';
import Link from 'next/link';

type LeadWithActivities = Prisma.LeadGetPayload<{
  include: {
    createdBy: {
      select: {
        firstName: true;
        lastName: true;
        profileImage: true;
      };
    };
    assignedTo: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        profileImage: true;
      };
    };
    activities: {
      include: {
        performedBy: {
          select: {
            firstName: true;
            lastName: true;
            profileImage: true;
          };
        };
      };
    };
  };
}>;

interface LeadDetailProps {
  lead: LeadWithActivities;
}

export default function LeadDetails({ lead }: LeadDetailProps) {
  const [notes, setNotes] = useState(lead.notes);
  const [notesChanged, setNotesChanged] = useState(false);
  const [isConverting, startConvertTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setNotesChanged(true);
  };

  const handleConvertLead = (leadId: string) => {
    window.location.href = `/dashboard/students/create?leadId=${leadId}`;
  };

  const handleDeleteLead = async (leadId: string) => {
    startDeleteTransition(async () => {
      try {
        const result = await deleteLead(leadId);
        if (result.success) {
          toast.success('Lead deleted successfully.');
          window.location.href = '/dashboard/leads';
        } else {
          toast.error(result.message || 'Failed to delete lead. Please try again.');
        }
      } catch (error) {
        toast.error('Failed to delete lead. Please try again.');
      }
    });
  };

  const isOverdue = lead.nextFollowUpAt && new Date() > lead.nextFollowUpAt;

  const initials = lead.studentName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-4 px-2 my-4">
      {/* ── Header card ── */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">

        {/* Top row: Avatar+info LEFT, actions RIGHT */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          {/* Avatar + name block */}
          <div className="flex items-start gap-3 min-w-0">
            <Avatar className="size-14 sm:size-16 shrink-0">
              {lead?.imageUrl && <AvatarImage src={lead.imageUrl} alt={lead.studentName} />}
              <AvatarFallback className="text-base font-semibold font-mono">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              {/* Name + badges */}
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <h1 className="text-base sm:text-lg font-bold leading-tight truncate">
                  {lead.studentName}
                </h1>
                <Badge variant={lead.status} className="text-[10px] px-1.5 py-0 shrink-0">
                  {lead.status}
                </Badge>
                <Badge variant={lead.priority} className="text-[10px] px-1.5 py-0 shrink-0">
                  {lead.priority}
                </Badge>
              </div>

              {/* Parent */}
              <p className="text-xs text-muted-foreground mb-2">
                Parent: {lead.parentName || '-'}
              </p>

              {/* Contact info */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-x-4 text-xs text-muted-foreground">
                {lead.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 shrink-0" />
                    <span>{lead.phone}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[200px]">{lead.email}</span>
                  </div>
                )}
                {lead.whatsappNumber && (
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3 h-3 shrink-0" />
                    <span>{lead.whatsappNumber}</span>
                  </div>
                )}
                {!lead.phone && !lead.email && !lead.whatsappNumber && (
                  <span className="text-muted-foreground italic">No contact information provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons — horizontal row, wraps cleanly */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              asChild
            >
              <Link href={`/dashboard/leads/${lead.id}/edit`} prefetch>
                <Edit2 className="w-3 h-3" />
                Edit
              </Link>
            </Button>

            {lead.status === 'CONVERTED' ? (
              <Button
                size="sm"
                disabled
                variant="outline"
                className="gap-1.5 h-8 text-xs bg-indigo-50 text-indigo-600 border-indigo-200 cursor-not-allowed"
              >
                <GraduationCap className="w-3 h-3" />
                Enrolled
              </Button>
            ) : (
              <Button
                size="sm"
                className="gap-1.5 h-8 text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                onClick={() => handleConvertLead(lead.id)}
                disabled={isConverting}
              >
                {isConverting
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <GraduationCap className="w-3 h-3" />
                }
                {isConverting ? 'Enrolling...' : 'Enroll Student'}
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={() => handleDeleteLead(lead.id)}
              disabled={isDeleting}
            >
              {isDeleting
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Trash2 className="w-3 h-3" />
              }
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Stats cards — 2 cols on mobile, 4 cols from md up */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {/* Lead Score */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-xs font-medium text-muted-foreground">Lead Score</span>
                <div className="p-1.5 bg-blue-100 dark:bg-blue-950/50 rounded-md shrink-0">
                  <Crosshair className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold tabular-nums">{lead.score}/100</div>
              <div className="w-full bg-muted rounded-full h-1 mt-2">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-700"
                  style={{ width: `${lead.score}%` }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
            </CardContent>
          </Card>

          {/* Follow-ups */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-xs font-medium text-muted-foreground">Follow-ups</span>
                <div className="p-1.5 bg-green-100 dark:bg-green-950/50 rounded-md shrink-0">
                  <CalendarCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold tabular-nums">{lead.followUpCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Total interactions</p>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none" />
            </CardContent>
          </Card>

          {/* Last Contact */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-xs font-medium text-muted-foreground truncate pr-1">
                  Last Contact
                </span>
                <div className="p-1.5 bg-purple-100 dark:bg-purple-950/50 rounded-md shrink-0">
                  <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-sm font-bold tabular-nums leading-tight">
                {formatDateIN(lead.lastContactedAt)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Recent activity</p>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
            </CardContent>
          </Card>

          {/* Next Follow-up */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between pb-1.5">
                <div className="flex items-center gap-1 min-w-0 mr-1">
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    Next Follow-up
                  </span>
                  {isOverdue && (
                    <span className="text-[9px] px-1 py-0.5 rounded-full font-bold bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 animate-pulse shrink-0">
                      !!
                    </span>
                  )}
                </div>
                <div
                  className={`p-1.5 rounded-md shrink-0 ${isOverdue
                    ? 'bg-red-100 dark:bg-red-950/50'
                    : 'bg-orange-100 dark:bg-orange-950/50'
                    }`}
                >
                  {isOverdue ? (
                    <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  ) : (
                    <Calendar className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
              </div>
              <div
                className={`text-sm font-bold tabular-nums leading-tight ${isOverdue ? 'text-red-600 dark:text-red-400' : ''
                  }`}
              >
                {formatDateIN(lead.nextFollowUpAt)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {isOverdue ? 'Action required' : 'Scheduled'}
              </p>
              <div
                className={`absolute inset-0 bg-gradient-to-r ${isOverdue ? 'from-red-500/5' : 'from-orange-500/5'
                  } to-transparent pointer-events-none`}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content — two columns at lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left column */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Enquiry Details */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">Enquiry Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Enquiry For
                  </Label>
                  <p className="text-base font-semibold text-gray-900">{lead.enquiryFor || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Current School
                  </Label>
                  <p className="text-base font-semibold text-gray-900">{lead.currentSchool || '-'}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Requirements
                </Label>
                <div className="flex flex-wrap gap-2">
                  {lead.requirements.length > 0 ? (
                    lead.requirements.map((req) => (
                      <Badge
                        key={req}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 px-3 py-1.5 text-sm"
                      >
                        {req}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">None specified</span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Budget Range
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="bg-pink-100 rounded-lg p-2 shrink-0">
                      <IndianRupee className="w-4 h-4 text-pink-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{lead.budgetRange || '-'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Source
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 rounded-lg p-2 shrink-0">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {lead.source
                        ?.replace(/[-_]/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Created Date
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 rounded-lg p-2 shrink-0">
                      <CalendarClock className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatDateIN(lead.createdAt)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Total Follow-ups
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 rounded-lg p-2 shrink-0">
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{lead.followUpCount} interactions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-lg">Address</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Street Address
                </Label>
                <p className="text-base font-medium text-gray-900">{lead.address || '-'}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    City
                  </Label>
                  <p className="text-base font-medium text-gray-900">{lead.city || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    State
                  </Label>
                  <p className="text-base font-medium text-gray-900">{lead.state || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Pincode
                  </Label>
                  <p className="text-base font-medium text-gray-900">{lead.pinCode || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="shadow-sm flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Notes</CardTitle>
                  <CardDescription>Private notes about this lead</CardDescription>
                </div>
                {notesChanged && (
                  <Button size="sm" className="gap-1.5 h-8 text-xs">
                    <Save className="w-3 h-3" />
                    Save Notes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-4 flex-1 flex flex-col">
              <Textarea
                value={notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add your notes here..."
                className="resize-none flex-1 min-h-[96px]"
              />
              {notesChanged && (
                <div className="flex items-center gap-2 text-xs text-orange-600 font-medium mt-2">
                  <Clock className="w-3 h-3" />
                  Unsaved changes
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Assignment */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Assignment</CardTitle>
              <CardDescription>Assign this lead to a team member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Currently Assigned To
                </Label>
                {lead.assignedTo ? (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <Avatar className="w-12 h-12 ring-2 ring-white shrink-0">
                      <AvatarImage src={lead.assignedTo.profileImage || ''} />
                      <AvatarFallback className="bg-blue-500 text-white font-semibold text-sm">
                        {lead.assignedTo.firstName.charAt(0)}
                        {lead.assignedTo.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Assigned {formatDateIN(lead.assignedAt)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-xl bg-gray-50">
                    <UserCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Not assigned</p>
                  </div>
                )}
              </div>

              <AssignLeadDialog
                leadId={lead.id}
                currentAssignedTo={lead.assignedTo}
                onAssignmentChange={() => { }}
              />
            </CardContent>
          </Card>

          {/* Activity Timeline — self-contained Card */}
          <LeadActivityTimeline
            activities={lead.activities}
            leadId={lead.id}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}