'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Users,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useTerminology } from '@/context/terminology';
import {
  getGradesInSession,
  getSectionsInSessionGrade,
  getStudentsCountForReportCards,
  previewReportCardCalculation,
  generateReportCards,
} from '@/lib/data/exam/report-card-generation';

type GenerateReportCardsSectionProps = {
  sessionId: string;
  exams: Array<{
    id: string;
    gradeId: string;
    sectionId: string;
  }>;
  allPublished: boolean;
  onGenerated: () => void;
};

type Grade = { id: string; grade: string };
type Section = { id: string; name: string };

export function GenerateReportCardsSection({
  sessionId,
  exams,
  allPublished,
  onGenerated,
}: GenerateReportCardsSectionProps) {
  const term = useTerminology();

  // State management
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [studentCount, setStudentCount] = useState<number>(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any>(null);

  // Dialog states
  const [previewDialog, setPreviewDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Transitions for async operations
  const [isLoadingGrades, startGradesTransition] = useTransition();
  const [isLoadingSections, startSectionsTransition] = useTransition();
  const [isLoadingCount, startCountTransition] = useTransition();
  const [isLoadingPreview, startPreviewTransition] = useTransition();
  const [isGenerating, startGenerateTransition] = useTransition();

  const [resultDialog, setResultDialog] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);

  // Computed values
  const canGenerate = useMemo(
    () => allPublished && selectedGrade && studentCount > 0,
    [allPublished, selectedGrade, studentCount]
  );

  const selectedGradeName = useMemo(() => {
    const grade = grades.find((g) => g.id === selectedGrade);
    return grade ? `${term.grade} ${grade.grade}` : 'Select Grade';
  }, [grades, selectedGrade, term.grade]);

  const selectedSectionName = useMemo(() => {
    if (selectedSection === 'all') return `All ${term.sections}`;
    const section = sections.find((s) => s.id === selectedSection);
    return section ? `${term.section} ${section.name}` : 'Select Section';
  }, [sections, selectedSection, term.section, term.sections]);

  // Load grades on mount
  const loadGrades = async () => {
    startGradesTransition(async () => {
      const result = await getGradesInSession(sessionId);
      if (result.success && result.data) {
        setGrades(result.data);
        if (result.data.length > 0 && !selectedGrade) {
          setSelectedGrade(result.data[0].id);
          loadSections(result.data[0].id);
        }
      }
    });
  };

  // Load sections for selected grade
  const loadSections = async (gradeId: string) => {
    startSectionsTransition(async () => {
      const result = await getSectionsInSessionGrade(sessionId, gradeId);
      if (result.success && result.data) {
        setSections(result.data);
        setSelectedSection('all');
        loadStudentCount(gradeId, 'all');
      }
    });
  };

  // Load student count
  const loadStudentCount = async (gradeId: string, sectionId: string) => {
    startCountTransition(async () => {
      const result = await getStudentsCountForReportCards(
        sessionId,
        gradeId,
        sectionId === 'all' ? undefined : sectionId
      );
      if (result.success && result.data !== undefined) {
        setStudentCount(result.data);
      }
    });
  };

  // Handle grade change
  const handleGradeChange = (gradeId: string) => {
    setSelectedGrade(gradeId);
    loadSections(gradeId);
  };

  // Handle section change
  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId);
    loadStudentCount(selectedGrade, sectionId);
  };

  // Preview calculation
  const handlePreview = () => {
    if (!selectedGrade) {
      toast.error('Please select a grade');
      return;
    }

    if (studentCount === 0) {
      toast.error('No students found with selected filters');
      return;
    }

    setPreviewDialog(true);
    setPreviewData(null);

    startPreviewTransition(async () => {
      const result = await previewReportCardCalculation(
        sessionId,
        selectedGrade,
        selectedSection === 'all' ? undefined : selectedSection
      );

      if (result.success && result.data) {
        setPreviewData(result.data);
      } else {
        toast.error(result.error || 'Failed to load preview');
        setPreviewDialog(false);
      }
    });
  };

  // Generate report cards
  const handleGenerateClick = () => {
    if (!selectedGrade) {
      toast.error('Please select a grade');
      return;
    }

    if (studentCount === 0) {
      toast.error('No students found with selected filters');
      return;
    }

    setConfirmDialog(true);
  };

  const handleConfirmGenerate = () => {
    setConfirmDialog(false);
    setGenerationProgress(0);

    startGenerateTransition(async () => {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      try {
        const result = await generateReportCards(
          sessionId,
          selectedGrade,
          selectedSection === 'all' ? undefined : selectedSection
        );

        clearInterval(progressInterval);
        setGenerationProgress(100);

        // Small delay for UX
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (result.success && result.data) {
          setGenerationResult(result.data);
          setResultDialog(true);

          if (result.data.failedCount === 0) {
            toast.success('All report cards generated successfully!');
          } else {
            toast.warning(`Generated ${result.data.successCount} report cards, but ${result.data.failedCount} failed.`);
          }

          onGenerated();
        } else {
          toast.error(result.error || 'Failed to generate report cards');
        }
      } catch (error) {
        clearInterval(progressInterval);
        toast.error('An unexpected error occurred');
        console.error(error);
      } finally {
        setGenerationProgress(0);
      }
    });
  };

  // Initialize on mount
  useEffect(() => {
    loadGrades();
  }, [sessionId]);

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Report Cards
          </CardTitle>
          <CardDescription>
            Configure filters and start batch generation
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{term.grade}</label>
              <Select
                value={selectedGrade}
                onValueChange={handleGradeChange}
                disabled={isLoadingGrades || isGenerating}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={`Select ${term.grade}`} />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{term.section}</label>
              <Select
                value={selectedSection}
                onValueChange={handleSectionChange}
                disabled={isLoadingSections || isGenerating || !selectedGrade}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={`Select ${term.section}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {term.sections}</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student Stats Summary */}
          {selectedGrade && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Total {term.students} Enrolled
                  </p>
                  <p className="text-xs text-blue-600/70">
                    {selectedGradeName} • {selectedSectionName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-semibold text-blue-700 dark:text-blue-400">{studentCount}</span>
                <span className="text-[10px] uppercase ml-1 text-blue-600/50">{term.students}</span>
              </div>
            </div>
          )}

          {/* Warning Banner */}
          {!allPublished && (
            <Alert variant="destructive" className="border-orange-200 bg-orange-50/50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900 text-xs font-medium">
                Batch generation is restricted. Some exam results in this session are unpublished.
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-primary">
                <span>Compiling Records...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-1.5" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!selectedGrade || studentCount === 0 || isGenerating}
              className="font-medium"
            >
              {isLoadingPreview ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Preview
            </Button>

            <Button
              onClick={handleGenerateClick}
              disabled={!canGenerate || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report Cards
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <PreviewDialog
        open={previewDialog}
        onOpenChange={setPreviewDialog}
        isLoading={isLoadingPreview}
        previewData={previewData}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog}
        onOpenChange={setConfirmDialog}
        onConfirm={handleConfirmGenerate}
        gradeName={selectedGradeName}
        sectionName={selectedSectionName}
        studentCount={studentCount}
      />

      {/* Results Summary Dialog */}
      <GenerationResultsDialog
        open={resultDialog}
        onOpenChange={setResultDialog}
        result={generationResult}
        onClose={() => setResultDialog(false)}
      />
    </div>
  );
}

// Separated Preview Dialog Component
function PreviewDialog({
  open,
  onOpenChange,
  isLoading,
  previewData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  previewData: any;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden flex flex-col p-6 space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Calculation Preview
          </DialogTitle>
          <DialogDescription>
            Performance breakdown for a sample student record
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Loading Analytics...</p>
          </div>
        ) : previewData ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Student Name</p>
                <p className="text-lg">{previewData.student.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-muted-foreground">Roll Number</p>
                <p className="font-mono">#{previewData.student.rollNumber}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Subject</th>
                    <th className="text-center p-3 font-medium">Max</th>
                    <th className="text-center p-3 font-medium">Obtained</th>
                    <th className="text-right p-3 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewData.exams.map((exam: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium">{exam.subject}</td>
                      <td className="p-3 text-center">{exam.maxMarks}</td>
                      <td className="p-3 text-center font-medium">{exam.obtainedMarks ?? '--'}</td>
                      <td className="p-3 text-right">
                        <Badge variant={exam.isPassed ? 'PASS' : 'FAILED'}>
                          {exam.isPassed ? 'Pass' : 'Fail'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Total</p>
                <p>{previewData.calculation.totalObtained} / {previewData.calculation.totalMaxMarks}</p>
              </div>
              <div className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-900/20">
                <p className="text-[10px] uppercase text-blue-600 mb-1">Percentage</p>
                <p>{previewData.calculation.percentage.toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-lg border bg-emerald-50/50 dark:bg-emerald-900/20">
                <p className="text-[10px] uppercase text-emerald-600 mb-1">Grade</p>
                <p>{previewData.calculation.overallGrade}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">No preview data available.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Separated Results Dialog Component
function GenerationResultsDialog({
  open,
  onOpenChange,
  result,
  onClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: any;
  onClose: () => void;
}) {
  if (!result) return null;

  const hasErrors = result.failedCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasErrors ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Generation completed
          </DialogTitle>
          <DialogDescription>
            Bulk process has finished.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border text-center">
              <div className="text-2xl font-semibold">{result.totalProcessed}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Processed</div>
            </div>
            <div className="p-4 rounded-xl bg-green-50 border text-center">
              <div className="text-2xl font-semibold text-green-700">{result.successCount}</div>
              <div className="text-[10px] text-green-600 uppercase">Success</div>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border text-center">
              <div className="text-2xl font-semibold text-red-700">{result.failedCount}</div>
              <div className="text-[10px] text-red-600 uppercase">Failed</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Separated Confirmation Dialog Component
function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  gradeName,
  sectionName,
  studentCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  gradeName: string;
  sectionName: string;
  studentCount: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Confirm Generation
          </DialogTitle>
          <DialogDescription>Proceed with report card generation?</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-50 border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grade:</span>
              <span className="font-medium">{gradeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Section:</span>
              <span className="font-medium">{sectionName}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span>Total Students:</span>
              <span>{studentCount}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
            <Button onClick={onConfirm} className="flex-1">Start Process</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}