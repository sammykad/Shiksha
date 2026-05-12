import { getOnboardingProgress } from '@/lib/onboarding';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import type { StepId } from '@/components/onboarding/types';

export default async function OnboardingPage() {
  const data = await getOnboardingProgress();

  // Determine the first incomplete step to start on
  let startStep: StepId = 0;
  if (!data.hasOrg) startStep = 0;
  else if (!data.academicYearId) startStep = 1;
  else if (data.grades.length === 0) startStep = 2;
  else if (!data.grades.some((g) => g.sections.length > 0)) startStep = 3;
  else if (data.studentsCount === 0) startStep = 4;
  else if (data.parentsCount === 0) startStep = 5;
  else if (data.documentsCount === 0) startStep = 6; // optional but show it
  else if (data.teachersCount === 0) startStep = 7;
  else if (data.subjectsCount === 0) startStep = 8;
  else if (data.feeCategoriesCount === 0) startStep = 9;
  else if (data.teachingAssignmentsCount === 0) startStep = 10;
  else if (data.feeAssignmentsCount === 0) startStep = 11;
  else startStep = 11;

  return (
    <OnboardingWizard initialData={data} startStep={startStep} />
  );
}
