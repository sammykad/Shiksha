"use client"

import { AcademicYear } from "@/generated/prisma/client";
import { setActiveAcademicYearId } from "@/lib/academicYear";
import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useState, useTransition } from "react";


type AcademicYearContextType = {
  currentYear: AcademicYear | null;
  viewingYear: AcademicYear | null;
  setViewingYear: (yearId: string) => void;
  isViewingPastYear: boolean;
  years: AcademicYear[];
  isPending: boolean;
};

const AcademicYearContext = createContext<AcademicYearContextType | null>(null);

export function AcademicYearProvider({
  children,
  years,
  initialActiveYearId,
}: {
  children: React.ReactNode;
  years: AcademicYear[];
  initialActiveYearId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeYearId, setActiveYearId] = useState(initialActiveYearId);

  const currentYear = years.find((y) => y.isCurrent) ?? null;
  // ❌ Still using initialActiveYearId — never changes
  // const viewingYear = years.find((y) => y.id === initialActiveYearId) ?? currentYear;

  const viewingYear = years.find((y) => y.id === activeYearId) ?? currentYear;
  const isViewingPastYear = !!viewingYear && !!currentYear && viewingYear.id !== currentYear.id;

  async function handleSetViewingYear(yearId: string) {
    startTransition(async () => {
      setActiveYearId(yearId); // optimistic — instant UI
      await setActiveAcademicYearId(yearId);
      router.refresh(); // Force server components to re-fetch with new academicYearId
    });
  }

  const contextValue = useMemo(() => ({
    currentYear,
    viewingYear,
    setViewingYear: handleSetViewingYear,
    isViewingPastYear,
    years,
    isPending,
  }), [currentYear, viewingYear, isViewingPastYear, years, isPending]);
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