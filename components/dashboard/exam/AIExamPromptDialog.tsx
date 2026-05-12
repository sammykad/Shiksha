'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles, Loader2, Calendar, Users, BookOpen,
  AlertTriangle, CheckCircle, Edit3, Trash2, Plus,
  Brain, Clock, MapPin, Award, ArrowLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDateIN, formatTimeIN } from '@/lib/utils';
import type { EvaluationType, ExamMode } from '@/generated/prisma/enums';
import { generateExamSchedule } from '@/lib/data/exam/create-bulk-exams';


type Subject = { id: string; name: string };
type Teacher = { id: string; firstName: string; lastName: string };
type Section = { id: string; name: string; gradeId: string };
type Grade = { id: string; grade: string };
type ExamSession = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
};
// ─────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────

const SUGGESTIONS = [
  {
    category: 'Quick Templates',
    items: [
      { text: 'Create final exams for all subjects, 3 hours each, 100 marks', label: 'Final exam setup' },
      { text: 'Schedule midterm tests for core subjects with 2-day gaps', label: 'Balanced midterms' },
      { text: 'Generate unit tests for this week, 1 hour each', label: 'Weekly assessments' },
    ],
  },
  {
    category: 'Detailed Planning',
    items: [
      { text: 'Create comprehensive finals: Math (3h, 100 marks), Science (2.5h, 80 marks), English (2h, 60 marks) with 2-day gaps starting Monday', label: 'Subject-specific' },
      { text: 'Schedule practical exams for Science subjects in labs, 2 hours each with viva', label: 'Lab practicals' },
      { text: 'Generate weekly assessments for all subjects, morning slots only, avoid Fridays', label: 'Time-specific' },
    ],
  },
  {
    category: 'Special Requirements',
    items: [
      { text: 'Create makeup exams for absent students, flexible timing', label: 'Makeup exams' },
      { text: 'Schedule oral exams for language subjects, 30 minutes per student', label: 'Oral assessments' },
      { text: 'Generate project presentations, 1 hour slots in auditorium', label: 'Presentations' },
    ],
  },
];

// ─────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────

function StepIndicator({ active }: { active: 'prompt' | 'preview' }) {
  const steps = [
    { id: 'prompt', label: 'Describe' },
    { id: 'preview', label: 'Review' },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => {
        const isDone = active === 'preview' && step.id === 'prompt';
        const isCurrent = active === step.id;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors',
                isDone ? 'bg-emerald-500 text-white' :
                  isCurrent ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground'
              )}>
                {isDone ? <CheckCircle className="w-3 h-3" /> : i + 1}
              </div>
              <span className={cn(
                'text-xs font-medium',
                isCurrent ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Exam card (view mode)
// ─────────────────────────────────────────────
export type GeneratedExam = {
  subjectId: string;
  subjectName: string;
  title: string;
  startDate: string;
  endDate: string;
  maxMarks: number;
  passingMarks: number;
  mode: ExamMode;
  evaluationType: EvaluationType;
  venue: string;
  supervisors: string[];
  supervisorNames: string[];
  description: string;
  instructions: string;
  durationMinutes: number;
  conflicts?: string[];
};

function ExamCard({
  exam,
  index,
  onEdit,
  onRemove,
  onDuplicate,
}: {
  exam: GeneratedExam;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const hasConflicts = exam.conflicts && exam.conflicts.length > 0;

  return (
    <Card className={cn(
      'relative overflow-hidden transition-colors',
      hasConflicts
        ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10'
        : 'border-border'
    )}>
      {/* Left accent bar */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-0.5',
        hasConflicts ? 'bg-amber-400' : 'bg-emerald-500'
      )} />

      <CardContent className="p-4 pl-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm">{exam.title}</h4>
            <Badge variant="secondary" className="text-[10px]">{exam.subjectName}</Badge>
            <Badge variant="outline" className="text-[10px]">{exam.mode}</Badge>
            {hasConflicts && (
              <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-0">
                <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                {exam.conflicts!.length} conflict{exam.conflicts!.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 w-7 p-0">
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDuplicate} className="h-7 w-7 p-0">
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: Calendar,
              label: 'Date',
              primary: formatDateIN(exam.startDate),
              secondary: `${formatTimeIN(exam.startDate)} – ${formatTimeIN(exam.endDate)}`,
            },
            {
              icon: Award,
              label: 'Marks',
              primary: `${exam.maxMarks} total`,
              secondary: `Pass: ${exam.passingMarks}`,
            },
            {
              icon: Clock,
              label: 'Duration',
              primary: `${Math.floor(exam.durationMinutes / 60)}h ${exam.durationMinutes % 60}m`,
              secondary: exam.evaluationType,
            },
            {
              icon: MapPin,
              label: 'Venue',
              primary: exam.venue,
              secondary: exam.supervisorNames[0] ?? '—',
            },
          ].map(({ icon: Icon, label, primary, secondary }) => (
            <div key={label} className="space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wide">
                <Icon className="w-3 h-3" />
                {label}
              </div>
              <p className="text-xs font-medium leading-tight">{primary}</p>
              <p className="text-[10px] text-muted-foreground truncate">{secondary}</p>
            </div>
          ))}
        </div>

        {/* Supervisors */}
        {exam.supervisorNames.length > 1 && (
          <div className="mt-3 flex items-center gap-2">
            <Users className="w-3 h-3 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground truncate">
              {exam.supervisorNames.join(', ')}
            </p>
          </div>
        )}

        {/* Conflicts */}
        {hasConflicts && (
          <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1.5">
              Conflicts
            </p>
            <ul className="space-y-0.5">
              {exam.conflicts!.map((c, i) => (
                <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0">·</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Exam card (edit mode)
// ─────────────────────────────────────────────

function ExamEditForm({
  exam,
  subjects,
  onUpdate,
  onDone,
}: {
  exam: GeneratedExam;
  subjects: Subject[];
  onUpdate: (updates: Partial<GeneratedExam>) => void;
  onDone: () => void;
}) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={exam.title} onChange={(e) => onUpdate({ title: e.target.value })} className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Subject</Label>
            <Select value={exam.subjectId} onValueChange={(v) => {
              const s = subjects.find((s) => s.id === v);
              onUpdate({ subjectId: v, subjectName: s?.name || '' });
            }}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {subjects.map((s) => <SelectItem key={s.id} value={s.id} className="text-sm">{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Max Marks', key: 'maxMarks', value: exam.maxMarks },
            { label: 'Pass Marks', key: 'passingMarks', value: exam.passingMarks },
            { label: 'Duration (min)', key: 'durationMinutes', value: exam.durationMinutes },
          ].map(({ label, key, value }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs">{label}</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => onUpdate({ [key]: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label className="text-xs">Venue</Label>
            <Input value={exam.venue} onChange={(e) => onUpdate({ venue: e.target.value })} className="h-8 text-sm" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onDone} className="h-7 text-xs">Done</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Main dialog
// ─────────────────────────────────────────────

type Props = {
  examSessions: ExamSession[];
  grades: Grade[];
  sections: Section[];
  subjects: Subject[];
  teachers: Teacher[];
  selectedSessionId?: string;
  selectedGradeId?: string;
  selectedSectionId?: string;
  onExamsGenerated: (exams: GeneratedExam[]) => void;
};

export default function AIExamPromptDialog({
  examSessions, grades, sections, subjects, teachers,
  selectedSessionId, selectedGradeId, selectedSectionId,
  onExamsGenerated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedExams, setGeneratedExams] = useState<GeneratedExam[]>([]);
  const [editingExam, setEditingExam] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<'prompt' | 'preview'>('prompt');

  const selectedSession = examSessions.find((s) => s.id === selectedSessionId);
  const selectedGrade = grades.find((g) => g.id === selectedGradeId);
  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const canGenerate = selectedSessionId && selectedGradeId && selectedSectionId && prompt.trim();

  const handleGenerate = () => {
    if (!canGenerate) { toast.error('Please complete all selections and enter a prompt'); return; }
    startTransition(async () => {
      const { success, data, error } = await generateExamSchedule({
        prompt, examSession: selectedSession!, grade: selectedGrade!,
        section: selectedSection!, subjects, teachers,
      });
      if (success && data) {
        setGeneratedExams(data);
        setStep('preview');
        toast.success(`Generated ${data.length} exams`);
      } else {
        toast.error(error || 'Failed to generate exams');
      }
    });
  };

  const updateExam = (i: number, updates: Partial<GeneratedExam>) =>
    setGeneratedExams((prev) => prev.map((e, idx) => idx === i ? { ...e, ...updates } : e));

  const removeExam = (i: number) => {
    setGeneratedExams((prev) => prev.filter((_, idx) => idx !== i));
    toast.success('Exam removed');
  };

  const duplicateExam = (i: number) => {
    const exam = generatedExams[i];
    setGeneratedExams((prev) => [...prev, {
      ...exam,
      title: `${exam.title} (Copy)`,
      startDate: new Date(new Date(exam.startDate).getTime() + 86400000).toISOString(),
      endDate: new Date(new Date(exam.endDate).getTime() + 86400000).toISOString(),
    }]);
    toast.success('Exam duplicated');
  };

  const handleApply = () => {
    startTransition(() => {
      onExamsGenerated(generatedExams);
      setOpen(false);
      reset();
      toast.success(`Added ${generatedExams.length} exams to schedule`);
    });
  };

  const reset = () => { setStep('prompt'); setGeneratedExams([]); setEditingExam(null); setPrompt(''); };

  const conflictCount = generatedExams.filter((e) => e.conflicts?.length).length;
  const readyCount = generatedExams.length - conflictCount;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Brain className="w-4 h-4" />
          AI Exam Creator
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden">

        {/* ── Dialog header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">AI Exam Creator</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Describe requirements — AI builds the schedule
                </p>
              </div>
            </div>
            <StepIndicator active={step} />
          </div>
        </DialogHeader>

        {/* ── Step: Prompt ── */}
        {step === 'prompt' && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Context bar */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-muted/50 border text-sm flex-wrap">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Session</p>
                    <p className="text-xs font-medium">{selectedSession?.title || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Class</p>
                    <p className="text-xs font-medium">
                      Grade {selectedGrade?.grade || '?'} · {selectedSection?.name || '—'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <BookOpen className="w-2.5 h-2.5" />{subjects.length} subjects
                </Badge>
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Users className="w-2.5 h-2.5" />{teachers.length} teachers
                </Badge>
              </div>
            </div>

            {/* Prompt input */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Describe your exam requirements</Label>
              <Textarea
                placeholder={`Examples:\n• Final exams for Math, Science, English — 3 hours each, 100 marks\n• Midterm tests for all subjects with 2-day gaps\n• Unit tests this week, 1 hour, morning slots only`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="resize-none text-sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Be as specific or general as you like</p>
                <Button onClick={handleGenerate} disabled={isPending || !canGenerate} size="sm">
                  {isPending
                    ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Generating...</>
                    : <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Generate Exams</>
                  }
                </Button>
              </div>
            </div>

            <Separator />

            {/* Suggestions */}
            <div className="space-y-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Suggestions — click to use
              </p>
              {SUGGESTIONS.map((group) => (
                <div key={group.category}>
                  <p className="text-xs font-semibold mb-2">{group.category}</p>
                  <div className="space-y-1.5">
                    {group.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(item.text)}
                        className="w-full text-left px-3 py-2.5 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-colors group"
                      >
                        <p className="text-xs font-medium text-foreground leading-relaxed">{item.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step: Preview ── */}
        {step === 'preview' && (
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Preview header */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
              <div>
                <p className="text-sm font-semibold">{generatedExams.length} exams generated</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {readyCount} ready
                  </span>
                  {conflictCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                      {conflictCount} need review
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep('prompt')} className="h-7 text-xs gap-1">
                  <ArrowLeft className="w-3 h-3" />Back
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={isPending || generatedExams.length === 0}
                  className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isPending
                    ? <><Loader2 className="w-3 h-3 animate-spin" />Adding...</>
                    : <><CheckCircle className="w-3 h-3" />Add {generatedExams.length} Exams</>
                  }
                </Button>
              </div>
            </div>

            {/* Exam list */}
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-3">
                {generatedExams.map((exam, index) => (
                  editingExam === index ? (
                    <ExamEditForm
                      key={index}
                      exam={exam}
                      subjects={subjects}
                      onUpdate={(updates) => updateExam(index, updates)}
                      onDone={() => setEditingExam(null)}
                    />
                  ) : (
                    <ExamCard
                      key={index}
                      exam={exam}
                      index={index}
                      onEdit={() => setEditingExam(index)}
                      onRemove={() => removeExam(index)}
                      onDuplicate={() => duplicateExam(index)}
                    />
                  )
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}