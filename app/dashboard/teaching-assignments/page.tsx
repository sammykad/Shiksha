import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import prisma from "@/lib/db";
import { getOrganizationId, getOrganizationType } from "@/lib/organization";
import { getTerminology } from "@/lib/terminology";
import TeachingAssignmentsTable from "@/components/dashboard/teacher/TeachingAssignmentsTable";
import {
  type AcademicYear,
  type Teacher,
  type Subject,
  type Grade,
  type Section,
  type ExistingAssignment,
  CreateAssignmentModal,
} from "@/components/dashboard/teacher/CreateAssignmentModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createTeachingAssignment } from "@/lib/data/teaching-assignment/createTeachingAssignment";
import TeachingAssignmentsView from "@/components/dashboard/teacher/Teachingassignmentsview";

async function getAssignments() {
  const organizationId = await getOrganizationId();

  return prisma.teachingAssignment.findMany({
    where: { organizationId },
    include: {
      teacher: { include: { user: true } },
      subject: true,
      grade: true,
      section: true,
      academicYear: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getFormData(): Promise<{
  academicYears: AcademicYear[];
  teachers: Teacher[];
  subjects: Subject[];
  grades: Grade[];
  sections: Section[];
  existingAssignments: ExistingAssignment[];
}> {
  const organizationId = await getOrganizationId();

  const [rawTeachers, rawSubjects, rawGrades, rawAcademicYears, rawAssignments] =
    await Promise.all([
      prisma.teacher.findMany({
        where: { organizationId, isActive: true },
        include: {
          user: true,
          profile: true,
          teachingAssignment: { where: { status: { not: "INACTIVE" } } },
        },
      }),
      prisma.subject.findMany({
        where: { organizationId },
        orderBy: { name: "asc" },
      }),
      prisma.grade.findMany({
        where: { organizationId },
        include: { section: true },
        orderBy: { grade: "asc" },
      }),
      prisma.academicYear.findMany({
        where: { organizationId },
        orderBy: { isCurrent: "desc" },
      }),
      prisma.teachingAssignment.findMany({
        where: { organizationId },
        select: { teacherId: true, subjectId: true, sectionId: true },
      }),
    ]);

  const academicYears: AcademicYear[] = rawAcademicYears.map((y) => ({
    id: y.id,
    name: y.name,
    isCurrent: y.isCurrent,
    type: y.type ?? undefined,
  }));

  const teachers: Teacher[] = rawTeachers.map((t) => ({
    id: t.id,
    name: `${t.user.firstName} ${t.user.lastName}`.trim(),
    employmentStatus: t.employmentStatus as Teacher["employmentStatus"],
    weeklyPeriodsAssigned: t.teachingAssignment.length,
    profile: t.profile
      ? {
        specializedSubjects: t.profile.specializedSubjects,
        preferredGrades: t.profile.preferredGrades,
      }
      : undefined,
  }));

  const subjects: Subject[] = rawSubjects.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
  }));

  const grades: Grade[] = rawGrades.map((g) => ({
    id: g.id,
    grade: g.grade,
  }));

  const sections: Section[] = rawGrades.flatMap((g) =>
    g.section.map((s) => ({ id: s.id, name: s.name, gradeId: s.gradeId }))
  );

  const existingAssignments: ExistingAssignment[] = rawAssignments.map((a) => ({
    teacherId: a.teacherId,
    subjectId: a.subjectId,
    sectionId: a.sectionId,
    isPrimary: false,
  }));

  return { academicYears, teachers, subjects, grades, sections, existingAssignments };
}

export default async function TeachingAssignmentsPage() {
  const organizationId = await getOrganizationId();
  const organizationType = await getOrganizationType(organizationId);
  const terminology = getTerminology(organizationType);

  const [assignments, { academicYears, teachers, subjects, grades, sections, existingAssignments }] =
    await Promise.all([getAssignments(), getFormData()]);

  return (
    <div className="flex-1 space-y-4 px-2">
      <PageHeader
        title="Teaching Assignments"
        description={`Manage teacher-subject assignments across ${terminology.grades.toLowerCase()} and ${terminology.sections.toLowerCase()}`}
        icon={Users}
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
                <CreateAssignmentModal
                  academicYears={academicYears}
                  teachers={teachers}
                  subjects={subjects}
                  grades={grades}
                  sections={sections}
                  existingAssignments={existingAssignments}
                  onSubmit={createTeachingAssignment}
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      {/* <TeachingAssignmentsTable
        assignments={assignments}
        formData={{ academicYears, teachers, subjects, grades, sections, existingAssignments }}
      /> */}
      <TeachingAssignmentsView
        assignments={assignments}
      />
    </div>
  );
}