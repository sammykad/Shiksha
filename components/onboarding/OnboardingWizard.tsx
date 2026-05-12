'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  Users, Users2, FileText, GraduationCap as TeacherIcon,
  Link2, Receipt, Building2, CalendarDays, ListOrdered,
  Layout, BookOpen, Menu, LayoutGrid, LayoutDashboard, ChevronRight,
} from 'lucide-react';
import { type WizardData, type StepId, STEPS, PHASE_MESSAGES } from './types';
import StepsSidebar from './StepsSidebar';
import PhaseMessage from './PhaseMessage';
import GuideStep from './steps/GuideStep';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { getOnboardingProgress } from '@/lib/onboarding';
import { AcademicYearForm } from '@/components/dashboard/admin/settings/AcademicYearForm';
import { useTerminology } from '@/context/terminology';

interface Props {
  initialData: WizardData;
  startStep: StepId;
}

// ─── Fix 1: add step 11 ───────────────────────────────────────
function resolveCompletedSteps(data: WizardData): Set<number> {
  const completed = new Set<number>();
  if (data.hasOrg) completed.add(0);
  if (data.academicYearId) completed.add(1);
  if (data.grades.length > 0) completed.add(2);
  if (data.grades.some((g) => g.sections.length > 0)) completed.add(3);
  if (data.studentsCount > 0) completed.add(4);
  if (data.parentsCount > 0) completed.add(5);
  completed.add(6); // Documents - always marked complete (optional step)
  if (data.teachersCount > 0) completed.add(7);
  if (data.subjectsCount > 0) completed.add(8);
  if (data.feeCategoriesCount > 0) completed.add(9);
  if (data.teachingAssignmentsCount > 0) completed.add(10);
  if (data.feeAssignmentsCount > 0) completed.add(11); // ← added
  return completed;
}

// ─── Fix 2: add case 11 ──────────────────────────────────────
function getCount(step: number, data: WizardData): number {
  switch (step) {
    case 0: return data.hasOrg ? 1 : 0;
    case 1: return data.academicYearId ? 1 : 0;
    case 2: return data.grades.length;
    case 3: return data.grades.reduce((acc, g) => acc + g.sections.length, 0);
    case 4: return data.studentsCount;
    case 5: return data.parentsCount;
    case 6: return data.documentsCount;
    case 7: return data.teachersCount;
    case 8: return data.subjectsCount;
    case 9: return data.feeCategoriesCount;
    case 10: return data.teachingAssignmentsCount;
    case 11: return data.feeAssignmentsCount; // ← added
    default: return 0;
  }
}

export default function OnboardingWizard({ initialData, startStep }: Props) {
  const terms = useTerminology();
  const router = useRouter();

  const [data, setData] = useState<WizardData>(initialData);
  const [currentStep, setCurrentStep] = useState<StepId>(startStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    () => resolveCompletedSteps(initialData)
  );
  const [phaseMsg, setPhaseMsg] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ─── Fix 3: persist maxStepReached to localStorage ───────────
  const [maxStepReached, setMaxStepReached] = useState<number>(() => {
    if (typeof window === 'undefined') return startStep;
    const saved = localStorage.getItem(`onboarding-max-step-${initialData.orgId}`);
    return saved ? Math.max(parseInt(saved), startStep) : startStep;
  });

  useEffect(() => {
    localStorage.setItem(
      `onboarding-max-step-${data.orgId}`,
      String(maxStepReached)
    );
  }, [maxStepReached, data.orgId]);

  // ─── Fix 4: refresh data when admin tabs back (Throttled) ─────────
  const lastRefreshRef = typeof window !== 'undefined' ? { current: Date.now() } : { current: 0 };

  const refreshData = useCallback(async () => {
    // Throttle: don't refresh more than once every 10 seconds on focus
    if (Date.now() - lastRefreshRef.current < 10000) return;
    lastRefreshRef.current = Date.now();

    try {
      const fresh = await getOnboardingProgress();
      setData(fresh);
      setCompletedSteps(resolveCompletedSteps(fresh));
    } catch (err) {
      console.error('[OnboardingWizard] Failed to refresh data', err);
    }
  }, []);

  useEffect(() => {
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshData]);

  const canGoDashboard = !!data.academicYearId && data.hasOrg;
  const progressPct = Math.round((completedSteps.size / STEPS.length) * 100);

  const markComplete = useCallback(
    (step: number, updatedData?: Partial<WizardData>) => {
      setCompletedSteps((prev) => new Set([...prev, step]));
      if (updatedData) setData((prev) => ({ ...prev, ...updatedData }));
      if (step === 1) setPhaseMsg(PHASE_MESSAGES[1]);
      else if (step === 3) setPhaseMsg(PHASE_MESSAGES[3]);
      else if (step === 6) setPhaseMsg(PHASE_MESSAGES[6]);
    },
    []
  );

  function goToStep(step: StepId) {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    setMobileMenuOpen(false);
    if (step > maxStepReached) setMaxStepReached(step);
  }

  function advance(updatedData?: Partial<WizardData>) {
    markComplete(currentStep, updatedData);
    if (currentStep < STEPS.length - 1) {
      goToStep((currentStep + 1) as StepId);
    } else {
      router.push('/dashboard');
    }
  }

  function skip() {
    if (currentStep < STEPS.length - 1) {
      const nextStep = (currentStep + 1) as StepId;
      setDirection(1);
      setCurrentStep(nextStep);
      if (nextStep > maxStepReached) setMaxStepReached(nextStep);
    } else {
      router.push('/dashboard');
    }
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  const STEP_CONFIG = [
    {
      icon: Building2,
      title: 'Organization Setup',
      description: "Configure your institution's name, logo, contact details and other basic information in our core settings.",
      fields: [{ label: 'Name' }, { label: 'Type' }, { label: 'Logo' }, { label: 'Contact Info' }],
      href: '/dashboard/settings',
      linkLabel: 'Go to General Settings',
      countLabel: 'organization details',
    },
    {
      icon: CalendarDays,
      title: 'Academic Year',
      description: 'Define your current session and dates. This is used to organize all your data, fees and reports.',
      fields: [{ label: 'Session Name' }, { label: 'Start Date' }, { label: 'End Date' }, { label: 'Type' }],
      href: '/dashboard/settings',
      linkLabel: 'Setup in Configurations',
      countLabel: 'academic year',
    },
    {
      icon: ListOrdered,
      title: `Create ${terms.grades}`,
      description: `Add the ${terms.grades.toLowerCase()} your institution offers.`,
      fields: [{ label: `${terms.grade} Name` }, { label: 'Level' }, { label: 'Description' }],
      href: '/dashboard/grades',
      linkLabel: `Go to ${terms.grades} Management`,
      countLabel: terms.grades.toLowerCase(),
      skippable: true,
    },
    {
      icon: LayoutGrid,
      title: `Create ${terms.sections}`,
      description: `Add ${terms.sections.toLowerCase()} within each ${terms.grade.toLowerCase()} (A, B, C, etc.).`,
      fields: [{ label: `${terms.section} Name` }, { label: terms.classTeacher || 'Class Teacher' }, { label: 'Capacity' }],
      href: '/dashboard/grades',
      linkLabel: `Go to ${terms.grades} & ${terms.sections}`,
      countLabel: terms.sections.toLowerCase(),
      skippable: true,
    },
    {
      icon: Users,
      title: `Add ${terms.students}`,
      description: `Enrol ${terms.students.toLowerCase()} and assign them to ${terms.grades.toLowerCase()} and ${terms.sections.toLowerCase()}.`,
      fields: [{ label: 'Name' }, { label: 'Roll No.' }, { label: 'Email' }, { label: 'Phone' }, { label: 'Date of Birth' }, { label: `${terms.grade} & ${terms.section}` }],
      href: '/dashboard/students',
      linkLabel: `Go to ${terms.students}`,
      countLabel: terms.students.toLowerCase(),
      skippable: true,
    },
    {
      icon: Users2,
      title: 'Add Parents',
      description: `Link parents and guardians to enrolled ${terms.students.toLowerCase()}.`,
      fields: [{ label: 'Name' }, { label: 'Email' }, { label: 'Phone' }, { label: 'Relationship' }, { label: 'Primary contact?' }],
      href: '/dashboard/students',
      linkLabel: `Add via ${terms.student} Page`,
      countLabel: 'parents',
      skippable: true,
    },
    {
      icon: FileText,
      title: `${terms.student} Documents`,
      description: 'Upload Aadhaar, birth certificates, transfer certificates and more. This step is optional.',
      fields: [{ label: 'Document Type' }, { label: 'File Upload' }, { label: 'Note' }],
      href: '/dashboard/documents',
      linkLabel: 'Go to Documents',
      countLabel: 'documents',
      optional: true,
      skippable: true,
    },
    {
      icon: TeacherIcon,
      title: 'Add Teachers',
      description: 'Onboard your teaching staff. Teachers will receive an invitation to log in.',
      fields: [{ label: 'Name' }, { label: 'Email' }, { label: 'Employee Code' }, { label: 'Qualification' }, { label: 'Phone' }],
      href: '/dashboard/teachers',
      linkLabel: 'Go to Teachers',
      countLabel: 'teachers',
      skippable: true,
    },
    {
      icon: BookOpen,
      title: 'Create Subjects',
      description: `Add subjects taught at your institution and organize them by ${terms.grade.toLowerCase()}.`,
      fields: [{ label: 'Subject Name' }, { label: 'Code' }, { label: 'Type' }],
      href: '/dashboard/subjects',
      linkLabel: 'Go to Subjects',
      countLabel: 'subjects',
      skippable: true,
    },
    {
      icon: Layout,
      title: 'Fee Categories',
      description: `Define fee types like tuition, exam, sports, etc.`,
      fields: [{ label: 'Category Name' }, { label: 'Description' }],
      href: '/dashboard/fees',
      linkLabel: 'Go to Fees',
      countLabel: 'fee categories',
      skippable: true,
    },
    {
      icon: Link2,
      title: 'Teaching Assignments',
      description: `Link teachers to subjects, ${terms.grades.toLowerCase()}, and ${terms.sections.toLowerCase()}.`,
      fields: [{ label: 'Teacher' }, { label: 'Subject' }, { label: terms.grade }, { label: terms.section }],
      href: '/dashboard/teaching-assignments',
      linkLabel: 'Go to Assignments',
      countLabel: 'assignments',
      skippable: true,
    },
    {
      icon: Receipt,
      title: 'Assign Fees',
      description: `Assign fee amounts to ${terms.students.toLowerCase()}.`,
      fields: [{ label: terms.students }, { label: 'Fee Category' }, { label: 'Amount' }, { label: 'Due Date' }],
      href: '/dashboard/fees',
      linkLabel: 'Go to Fees',
      countLabel: 'fee assignments',
      skippable: true,
    },
  ] as const;

  const stepCfg = STEP_CONFIG[currentStep];
  const stepDef = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="flex flex-col md:flex-row h-auto rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col w-64 shrink-0">
        <StepsSidebar
          currentStep={currentStep}
          completedSteps={completedSteps}
          canGoDashboard={canGoDashboard}
          onStepClick={goToStep}
          maxStepReached={maxStepReached}
        />
      </div>

      {/* Right Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 md:px-8 py-3.5 border-b border-border shrink-0 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -ml-1">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Onboarding steps and progress</SheetDescription>
                </VisuallyHidden>
                <StepsSidebar
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  canGoDashboard={canGoDashboard}
                  onStepClick={goToStep}
                  maxStepReached={maxStepReached}
                />
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none mb-0.5">
                Step {currentStep + 1} / {STEPS.length}
              </p>
              <p className="text-sm font-medium leading-none truncate max-w-[160px]">
                {stepDef.shortTitle}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="inline-flex items-center text-[11px] font-semibold tracking-wide text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
              Phase {stepDef.phase}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
            <span className="text-[13px] font-medium text-foreground">
              {stepCfg.title}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2.5">
              <Progress value={progressPct} className="w-28 h-1.5" />
              <span className="text-xs font-medium tabular-nums text-muted-foreground w-8">
                {progressPct}%
              </span>
            </div>
            <div className="md:hidden w-20">
              <Progress value={progressPct} className="h-1.5" />
            </div>
            {canGoDashboard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7 px-2"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Skip to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="max-w-xl mx-auto px-5 md:px-10 py-8 md:py-12 min-h-[calc(100%-1px)] flex flex-col">
            {phaseMsg && (
              <div className="mb-6">
                <PhaseMessage message={phaseMsg} onDismiss={() => setPhaseMsg(null)} />
              </div>
            )}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1 flex flex-col"
              >
                {currentStep === 1 && !data.academicYearId ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ring-1 bg-primary/5 ring-primary/15">
                        <CalendarDays className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-[15px] font-semibold tracking-tight text-foreground leading-snug">
                          Setup Academic Year
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          Define your current session dates to organize data, fees, and reports.
                        </p>
                      </div>
                    </div>

                    <div className="p-1">
                      <AcademicYearForm
                        organizationId={data.orgId}
                        onSuccess={async () => {
                          await refreshData();
                          advance();
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <GuideStep
                    icon={<stepCfg.icon className="w-5 h-5 text-primary" />}
                    title={currentStep === 1 && data.academicYearId ? 'Academic Year Added' : stepCfg.title}
                    description={stepCfg.description}
                    fields={[...stepCfg.fields]}
                    href={stepCfg.href}
                    linkLabel={stepCfg.linkLabel}
                    count={getCount(currentStep, data)}
                    countLabel={stepCfg.countLabel}
                    optional={'optional' in stepCfg ? stepCfg.optional : undefined}
                    onRefresh={refreshData}
                    onContinue={() =>
                      isLastStep ? router.push('/dashboard') : advance()
                    }
                    onSkip={'skippable' in stepCfg ? skip : undefined}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}