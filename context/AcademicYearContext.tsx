"use client"

import { AcademicYear } from "@/generated/prisma/client";
import { setActiveAcademicYearId } from "@/lib/academicYear";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";


type AcademicYearContextType = {
  currentYear: AcademicYear | null;
  viewingYear: AcademicYear | null;
  setViewingYear: (yearId: string) => void;
  isViewingPastYear: boolean;
  years: AcademicYear[];
  isPending: boolean;
  organizationId: string;
};

const AcademicYearContext = createContext<AcademicYearContextType | null>(null);

export function AcademicYearProvider({
  children,
  years,
  organizationId,
}: {
  children: React.ReactNode;
  years: AcademicYear[];
  organizationId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [viewingYearId, setViewingYearId] = useState<string | null>(null);

  const currentYear = years.find((y) => y.isCurrent) ?? null;
  const viewingYear = years.find((y) => y.id === viewingYearId) ?? currentYear;
  const isViewingPastYear = !!viewingYear && !!currentYear && viewingYear.id !== currentYear.id;

  const handleSetViewingYear = useCallback((yearId: string) => {
    startTransition(async () => {
      setViewingYearId(yearId);
      await setActiveAcademicYearId(yearId);
      router.refresh();
    });
  }, [router]);

  const contextValue = useMemo(() => ({
    currentYear,
    viewingYear,
    setViewingYear: handleSetViewingYear,
    isViewingPastYear,
    years,
    isPending,
    organizationId,
  }  ), [currentYear, viewingYear, handleSetViewingYear, isViewingPastYear, years, isPending, organizationId]);

  return (
    <AcademicYearContext.Provider value={contextValue}>
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const ctx = useContext(AcademicYearContext);
  if (!ctx) throw new Error("useAcademicYear must be inside AcademicYearProvider");
  return ctx;
}
