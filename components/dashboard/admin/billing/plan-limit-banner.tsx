"use client";

import { AlertTriangle, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface PlanLimitBannerProps {
  currentStudents: number;
  studentLimit: number | null;
  planName: string;
}

export function PlanLimitBanner({
  currentStudents,
  studentLimit,
  planName,
}: PlanLimitBannerProps) {
  if (studentLimit === null) return null;

  const usagePercent = Math.min(100, Math.round((currentStudents / studentLimit) * 100));
  const isNearLimit = usagePercent >= 80;
  const isAtLimit = usagePercent >= 100;

  if (!isNearLimit) return null;

  return (
    <Alert variant={isAtLimit ? "destructive" : "warning"}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {isAtLimit ? "Student Limit Reached" : "Approaching Student Limit"}
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p className="text-sm">
          Your {planName} plan allows up to {studentLimit.toLocaleString("en-IN")} students.
          {isAtLimit
            ? " You cannot add more students until you upgrade."
            : ` You have ${studentLimit - currentStudents} slots remaining before new enrollments are blocked.`}
        </p>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {currentStudents} / {studentLimit} students
          </span>
        </div>
        <Progress value={usagePercent} className="h-1.5" />
      </AlertDescription>
    </Alert>
  );
}
