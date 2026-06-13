"use client";

import { useState, useMemo } from "react";
import { OrganizationType } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  GraduationCap, Settings2, Plus, Trash2, Info, AlertTriangle,
  CheckCircle2, Pencil, BookOpen, BarChart3, FlaskConical, Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { createGradingScale } from '@/lib/data/exam/grading-scales';
import { type CreateGradingScaleInput } from '@/lib/data/exam/grading-scales';
import { BandPreviewBar } from '@/components/dashboard/exam/BandPreviewBar';
import { RoundingRule, PointsMode as PrismaPointsMode } from "@/generated/prisma/enums";
import { toast } from "sonner";
import { useTransition } from "react";
import { getBandStatusLabels } from "@/lib/data/exam/grade-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExamArchetype = "school" | "higherEd" | "testPrep" | "flexible";
type PointsMode = "none" | "gpa" | "cgpa";
type ResultLogic = "passCompartmentFail" | "clearBacklog" | "scoreOnly" | "custom";

interface GradeBand {
  id: string; label: string;
  minPercentage: number; maxPercentage: number;
  points: number | null; description?: string;
}

interface GradingConfig {
  archetype: ExamArchetype; scalePreset: string;
  passThreshold: number; pointsMode: PointsMode;
  resultLogic: ResultLogic;
  showRank: boolean; showPercentile: boolean;
  showAttendance: boolean; showConductGrade: boolean;
  showPrincipalRemarks: boolean; customBands: GradeBand[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const ARCHETYPES = [
  { id: "school" as ExamArchetype, label: "School", icon: GraduationCap, description: "K-12, CBSE, ICSE, State boards", presets: ["cbse", "outstanding", "standard", "simple"], defaultPass: 33, defaultLogic: "passCompartmentFail" as ResultLogic },
  { id: "higherEd" as ExamArchetype, label: "Higher Ed", icon: BookOpen, description: "Colleges, universities, vocational", presets: ["cgpa", "gpa", "simple"], defaultPass: 40, defaultLogic: "clearBacklog" as ResultLogic },
  { id: "testPrep" as ExamArchetype, label: "Test Prep", icon: BarChart3, description: "Coaching centers, tuition classes", presets: ["standard", "simple"], defaultPass: 0, defaultLogic: "scoreOnly" as ResultLogic },
  { id: "flexible" as ExamArchetype, label: "Flexible", icon: Sliders, description: "Online, hybrid, multi-branch", presets: ["custom"], defaultPass: 33, defaultLogic: "custom" as ResultLogic },
];

const PRESET_SCALES: Record<string, { name: string; bands: GradeBand[]; pointsMode: "none" | "gpa" | "cgpa" }> = {
  cbse: {
    name: "CBSE (A1–E2)", pointsMode: "cgpa", bands: [
      { id: "1", label: "A1", minPercentage: 91, maxPercentage: 100, points: 10, description: "Outstanding" },
      { id: "2", label: "A2", minPercentage: 81, maxPercentage: 90.99, points: 9, description: "Excellent" },
      { id: "3", label: "B1", minPercentage: 71, maxPercentage: 80.99, points: 8, description: "Very Good" },
      { id: "4", label: "B2", minPercentage: 61, maxPercentage: 70.99, points: 7, description: "Good" },
      { id: "5", label: "C1", minPercentage: 51, maxPercentage: 60.99, points: 6, description: "Above Average" },
      { id: "6", label: "C2", minPercentage: 41, maxPercentage: 50.99, points: 5, description: "Average" },
      { id: "7", label: "D", minPercentage: 33, maxPercentage: 40.99, points: 4, description: "Pass" },
      { id: "8", label: "E1", minPercentage: 21, maxPercentage: 32.99, points: 0, description: "Fail" },
      { id: "9", label: "E2", minPercentage: 0, maxPercentage: 20.99, points: 0, description: "Fail" },
    ]
  },
  outstanding: {
    name: "Outstanding (O–E)", pointsMode: "none", bands: [
      { id: "1", label: "O+", minPercentage: 95, maxPercentage: 100, points: null, description: "Outstanding Plus" },
      { id: "2", label: "O", minPercentage: 90, maxPercentage: 94.99, points: null, description: "Outstanding" },
      { id: "3", label: "A+", minPercentage: 85, maxPercentage: 89.99, points: null, description: "Excellent Plus" },
      { id: "4", label: "A", minPercentage: 80, maxPercentage: 84.99, points: null, description: "Excellent" },
      { id: "5", label: "B+", minPercentage: 75, maxPercentage: 79.99, points: null, description: "Very Good Plus" },
      { id: "6", label: "B", minPercentage: 70, maxPercentage: 74.99, points: null, description: "Very Good" },
      { id: "7", label: "C", minPercentage: 60, maxPercentage: 69.99, points: null, description: "Good" },
      { id: "8", label: "D", minPercentage: 50, maxPercentage: 59.99, points: null, description: "Satisfactory" },
      { id: "9", label: "E", minPercentage: 0, maxPercentage: 49.99, points: null, description: "Needs Improvement" },
    ]
  },
  standard: {
    name: "Standard (A–F)", pointsMode: "gpa", bands: [
      { id: "1", label: "A+", minPercentage: 97, maxPercentage: 100, points: 4.0 },
      { id: "2", label: "A", minPercentage: 93, maxPercentage: 96.99, points: 4.0 },
      { id: "3", label: "A-", minPercentage: 90, maxPercentage: 92.99, points: 3.7 },
      { id: "4", label: "B+", minPercentage: 87, maxPercentage: 89.99, points: 3.3 },
      { id: "5", label: "B", minPercentage: 83, maxPercentage: 86.99, points: 3.0 },
      { id: "6", label: "B-", minPercentage: 80, maxPercentage: 82.99, points: 2.7 },
      { id: "7", label: "C+", minPercentage: 77, maxPercentage: 79.99, points: 2.3 },
      { id: "8", label: "C", minPercentage: 73, maxPercentage: 76.99, points: 2.0 },
      { id: "9", label: "D", minPercentage: 65, maxPercentage: 72.99, points: 1.0 },
      { id: "10", label: "F", minPercentage: 0, maxPercentage: 64.99, points: 0.0 },
    ]
  },
  simple: {
    name: "Pass / Fail", pointsMode: "none", bands: [
      { id: "1", label: "Pass", minPercentage: 33, maxPercentage: 100, points: null },
      { id: "2", label: "Fail", minPercentage: 0, maxPercentage: 32.99, points: null },
    ]
  },
  cgpa: {
    name: "CGPA (0–10)", pointsMode: "cgpa", bands: [
      { id: "1", label: "O", minPercentage: 91, maxPercentage: 100, points: 10 },
      { id: "2", label: "A+", minPercentage: 81, maxPercentage: 90.99, points: 9 },
      { id: "3", label: "A", minPercentage: 71, maxPercentage: 80.99, points: 8 },
      { id: "4", label: "B+", minPercentage: 61, maxPercentage: 70.99, points: 7 },
      { id: "5", label: "B", minPercentage: 51, maxPercentage: 60.99, points: 6 },
      { id: "6", label: "C", minPercentage: 40, maxPercentage: 50.99, points: 5 },
      { id: "7", label: "F", minPercentage: 0, maxPercentage: 39.99, points: 0 },
    ]
  },
  gpa: {
    name: "GPA (0–4)", pointsMode: "gpa", bands: [
      { id: "1", label: "A", minPercentage: 90, maxPercentage: 100, points: 4.0 },
      { id: "2", label: "B", minPercentage: 80, maxPercentage: 89.99, points: 3.0 },
      { id: "3", label: "C", minPercentage: 70, maxPercentage: 79.99, points: 2.0 },
      { id: "4", label: "D", minPercentage: 60, maxPercentage: 69.99, points: 1.0 },
      { id: "5", label: "F", minPercentage: 0, maxPercentage: 59.99, points: 0.0 },
    ]
  },
  custom: {
    name: "Custom scale", pointsMode: "none", bands: [
      { id: "1", label: "Pass", minPercentage: 33, maxPercentage: 100, points: null },
      { id: "2", label: "Fail", minPercentage: 0, maxPercentage: 32.99, points: null },
    ]
  },
};

const RESULT_LOGIC_OPTIONS: Record<ResultLogic, { label: string; description: string }> = {
  passCompartmentFail: { label: "Pass / Compartment / Fail", description: "1–2 subjects failed → Compartment. 3+ failed → Fail." },
  clearBacklog: { label: "Cleared / Backlog / Detained", description: "Any failed subject → Backlog. Multiple backlogs → Detained." },
  scoreOnly: { label: "Score only (no pass/fail)", description: "Show raw marks and percentile. No pass/fail status." },
  custom: { label: "Custom", description: "Admin defines what constitutes passing." },
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

/** Pass = green tint, fail = red tint — both opacity-based for theme compat */

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
}

// ─── Step pill ────────────────────────────────────────────────────────────────

function StepPill({ n }: { n: number }) {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shrink-0">
      {n}
    </div>
  );
}

// ─── Archetype card ───────────────────────────────────────────────────────────

function ArchetypeCard({ archetype, isActive, isRecommended, onClick }: {
  archetype: typeof ARCHETYPES[0]; isActive: boolean; isRecommended: boolean; onClick: () => void;
}) {
  const Icon = archetype.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full text-left rounded-xl border p-4 transition-all duration-150",
        isActive
          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
          : "border-border bg-card hover:bg-muted/40 hover:border-foreground/20"
      )}
    >
      {isRecommended && (
        <Badge variant={"REFUNDED"} className="absolute -top-2 right-3 shadow-sm">
          Recommended
        </Badge>
      )}
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
          isActive ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">{archetype.label}</span>
            {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{archetype.description}</p>
        </div>
      </div>
    </button>
  );
}

// ─── Preset card ──────────────────────────────────────────────────────────────

function PresetCard({ presetKey, isActive, onClick }: { presetKey: string; isActive: boolean; onClick: () => void }) {
  const preset = PRESET_SCALES[presetKey];
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border p-3.5 transition-all duration-150",
        isActive
          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
          : "border-border bg-card hover:bg-muted/30 hover:border-foreground/20"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{preset.name}</span>
        {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {preset.bands.length} band{preset.bands.length !== 1 ? "s" : ""}
        {preset.pointsMode !== "none" && ` · ${preset.pointsMode.toUpperCase()}`}
      </p>
    </button>
  );
}

// ─── Grade band row ───────────────────────────────────────────────────────────

function GradeBandRow({ band, passThreshold, showPoints, onUpdate, onDelete, isOnly }: {
  band: GradeBand; passThreshold: number; showPoints: boolean;
  onUpdate: (field: keyof GradeBand, value: string | number | null) => void;
  onDelete: () => void; isOnly: boolean;
}) {
  const mid = (band.minPercentage + band.maxPercentage) / 2;
  const status = getBandStatusLabels(mid, passThreshold);

  return (
    <TableRow className="group">
      <TableCell>
        <Input value={band.label} onChange={e => onUpdate("label", e.target.value)}
          className="h-8 w-16 text-center font-mono text-xs" maxLength={4} />
      </TableCell>
      <TableCell>
        <Input type="number" value={band.minPercentage} onChange={e => onUpdate("minPercentage", parseFloat(e.target.value))}
          className="h-8 w-20 text-xs" min={0} max={100} step={0.01} />
      </TableCell>
      <TableCell>
        <Input type="number" value={band.maxPercentage} onChange={e => onUpdate("maxPercentage", parseFloat(e.target.value))}
          className="h-8 w-20 text-xs" min={0} max={100} step={0.01} />
      </TableCell>
      {showPoints && (
        <TableCell>
          <Input type="number" value={band.points ?? ""} onChange={e => onUpdate("points", e.target.value === "" ? null : parseFloat(e.target.value))}
            className="h-8 w-20 text-xs" min={0} max={10} step={0.1} placeholder="—" />
        </TableCell>
      )}
      <TableCell>
        <Input value={band.description ?? ""} onChange={e => onUpdate("description", e.target.value)}
          className="h-8 text-xs" placeholder="Optional label" />
      </TableCell>
      <TableCell>
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", status.cls)}>
          {status.label}
        </span>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" onClick={onDelete} disabled={isOnly}
          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({ label, description, checked, onChange, disabled }: {
  label: string; description?: string; checked: boolean;
  onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className={cn("text-sm font-medium", disabled ? "text-muted-foreground" : "text-foreground")}>{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} className="shrink-0" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GradingSettings({ organizationType }: { organizationType?: OrganizationType }) {
  const defaultValues: GradingConfig = {
    archetype: "school", scalePreset: "cbse", passThreshold: 33,
    pointsMode: "cgpa", resultLogic: "passCompartmentFail",
    showRank: false, showPercentile: false, showAttendance: true,
    showConductGrade: true, showPrincipalRemarks: true,
    customBands: PRESET_SCALES.cbse.bands,
  };

  const [config, setConfig] = useState<GradingConfig>(defaultValues);
  const [initialConfig, setInitialConfig] = useState<GradingConfig>(defaultValues);
  const [activeTab, setActiveTab] = useState("scale");
  const [isSaving, startSaveTransition] = useTransition();

  const hasUnsaved = useMemo(() => JSON.stringify(config) !== JSON.stringify(initialConfig), [config, initialConfig]);

  const recommendedArchetype = useMemo(() => {
    switch (organizationType) {
      case "SCHOOL": case "KINDERGARTEN": return "school";
      case "COLLEGE": case "UNIVERSITY": return "higherEd";
      case "COACHING_CLASS": return "testPrep";
      case "TRAINING_INSTITUTE": case "OTHER": return "flexible";
      default: return null;
    }
  }, [organizationType]);

  const activeArchetype = ARCHETYPES.find(a => a.id === config.archetype)!;
  const activePreset = PRESET_SCALES[config.scalePreset];
  const showPoints = config.pointsMode !== "none";

  function update<K extends keyof GradingConfig>(key: K, value: GradingConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  function selectArchetype(id: ExamArchetype) {
    const arch = ARCHETYPES.find(a => a.id === id)!;
    const firstKey = arch.presets[0];
    const preset = PRESET_SCALES[firstKey];
    setConfig(prev => ({ ...prev, archetype: id, scalePreset: firstKey, pointsMode: preset.pointsMode, passThreshold: arch.defaultPass, resultLogic: arch.defaultLogic, customBands: preset.bands }));
  }

  function selectPreset(key: string) {
    const preset = PRESET_SCALES[key];
    setConfig(prev => ({ ...prev, scalePreset: key, pointsMode: preset.pointsMode, customBands: preset.bands }));
  }

  function addBand() {
    update("customBands", [...config.customBands, { id: Date.now().toString(), label: "", minPercentage: 0, maxPercentage: 0, points: null }]);
  }
  function updateBand(id: string, field: keyof GradeBand, value: string | number | null) {
    update("customBands", config.customBands.map(b => b.id === id ? { ...b, [field]: value } : b));
  }
  function deleteBand(id: string) {
    update("customBands", config.customBands.filter(b => b.id !== id));
  }

  async function handleSave() {
    if (overlaps.length > 0) {
      toast.error("Please fix overlapping grade bands before saving.");
      return;
    }

    startSaveTransition(async () => {
      try {
        // Map UI config to Database input
        const input: CreateGradingScaleInput = {
          name: activePreset.name,
          rounding: RoundingRule.NEAREST, // Default for now
          passThreshold: config.passThreshold,
          pointsMode: config.pointsMode.toUpperCase() as PrismaPointsMode,
          allowGrace: false, // Default for now
          maxGraceMarks: 0,
          isDefault: true, // Settings saves as organization default
          bands: config.customBands.map(b => ({
            label: b.label,
            minPercentage: b.minPercentage,
            maxPercentage: b.maxPercentage,
            points: b.points,
            description: b.description || undefined
          }))
        };

        const result = await createGradingScale(input);

        if (result.success) {
          toast.success("Grading configuration saved successfully.");
          setInitialConfig(config);
        } else {
          toast.error(result.error || "Failed to save grading configuration.");
        }
      } catch (error) {
        toast.error("An unexpected error occurred while saving.");
      }
    });
  }

  // Overlap detection
  const overlaps: string[] = [];
  for (let i = 0; i < config.customBands.length; i++) {
    for (let j = i + 1; j < config.customBands.length; j++) {
      const a = config.customBands[i], b = config.customBands[j];
      if (a.minPercentage <= b.maxPercentage && b.minPercentage <= a.maxPercentage)
        overlaps.push(`"${a.label || `Band ${i + 1}`}" and "${b.label || `Band ${j + 1}`}" overlap`);
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <PageHeader
        title="Grading Configuration"
        description="Controls how marks convert to grades, ranks, and report cards across all exams."
        actions={hasUnsaved ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Unsaved changes
            </span>
            <Button variant="outline" size="sm" onClick={() => setConfig(initialConfig)} className="h-8" disabled={isSaving}>Cancel</Button>
            <Button size="sm" onClick={handleSave} className="h-8 gap-1.5" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        ) : null}
      />

      {/* ── Step 1: Institution type ── */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <StepPill n={1} />
            <div>
              <CardTitle className="text-sm">Institution type</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Select the type that best describes your institution — this auto-configures sensible defaults below.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ARCHETYPES.map(arch => (
              <ArchetypeCard
                key={arch.id} archetype={arch}
                isActive={config.archetype === arch.id}
                isRecommended={recommendedArchetype === arch.id}
                onClick={() => selectArchetype(arch.id)}
              />
            ))}
          </div>

          {/* Active summary */}
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{activeArchetype.label}</span> defaults to{" "}
              <span className="font-medium text-foreground">{RESULT_LOGIC_OPTIONS[config.resultLogic].label}</span> logic
              and a <span className="font-medium text-foreground">{config.passThreshold}%</span> pass threshold.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Step 2: Grading scale & report card ── */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <StepPill n={2} />
            <div>
              <CardTitle className="text-sm">Grading scale &amp; report card</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Configure grade bands, result logic, and report card layout.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-5 h-9 bg-muted p-0.5 rounded-lg w-full sm:w-auto">
              {[
                { value: "scale", label: "Grade Scale", icon: Settings2 },
                { value: "bands", label: "Grade Bands", icon: Pencil },
                { value: "result", label: "Result Logic", icon: FlaskConical },
                { value: "reportcard", label: "Report Card", icon: GraduationCap },
              ].map(t => (
                <TabsTrigger key={t.value} value={t.value}
                  className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md">
                  <t.icon className="h-3.5 w-3.5" />
                  <span className={cn(
                    "overflow-hidden transition-all duration-500 whitespace-nowrap",
                    activeTab === t.value
                      ? "max-w-24 opacity-100 ml-0"
                      : "max-w-0 opacity-0 sm:max-w-24 sm:opacity-100"
                  )}>
                    {t.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Grade Scale ── */}
            <TabsContent value="scale" className="space-y-6 mt-0">
              <div>
                <SectionHeader title="Preset scale" description="Pick a built-in scale — customise bands in the next tab." />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {activeArchetype.presets.map(key => (
                    <PresetCard key={key} presetKey={key} isActive={config.scalePreset === key} onClick={() => selectPreset(key)} />
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Pass threshold */}
                <div className="space-y-1.5">
                  <Label htmlFor="passThreshold" className="text-sm font-medium flex items-center gap-1.5">
                    Pass threshold
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="text-xs max-w-[200px]">
                          Students at or above this percentage are considered passing.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input id="passThreshold" type="number" value={config.passThreshold}
                      onChange={e => update("passThreshold", parseFloat(e.target.value) || 0)}
                      className="w-24 h-9" min={0} max={100} step={1} />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Common: 33% (CBSE), 40% (university), 50% (college).</p>
                </div>

                {/* Points mode */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Points system</Label>
                  <Select value={config.pointsMode} onValueChange={v => update("pointsMode", v as PointsMode)}>
                    <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="gpa">GPA (0–4 scale)</SelectItem>
                      <SelectItem value="cgpa">CGPA (0–10 scale)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Shown on report cards alongside the grade label.</p>
                </div>
              </div>

              <Separator />

              <div>
                <SectionHeader title="Live preview" description="Grade band distribution across 0–100%" />
                <BandPreviewBar bands={config.customBands} passThreshold={config.passThreshold} />
              </div>
            </TabsContent>

            {/* ── Grade Bands ── */}
            <TabsContent value="bands" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <SectionHeader title="Grade bands" description="Define the percentage ranges for each grade label." />
                <Button size="sm" variant="outline" onClick={addBand} className="gap-1.5 h-8 shrink-0">
                  <Plus className="h-3.5 w-3.5" /> Add band
                </Button>
              </div>

              {overlaps.length > 0 && (
                <div className="flex items-start gap-2 mb-4 p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/8">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <span className="font-semibold">Overlap detected:</span> {overlaps[0]}.
                    {overlaps.length > 1 && ` +${overlaps.length - 1} more.`} Fix ranges before saving.
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-xs w-20">Label</TableHead>
                      <TableHead className="text-xs w-24">Min %</TableHead>
                      <TableHead className="text-xs w-24">Max %</TableHead>
                      {showPoints && <TableHead className="text-xs w-24">Points</TableHead>}
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs w-20">Status</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...config.customBands].sort((a, b) => b.minPercentage - a.minPercentage).map(band => (
                      <GradeBandRow
                        key={band.id} band={band} passThreshold={config.passThreshold}
                        showPoints={showPoints}
                        onUpdate={(field, value) => updateBand(band.id, field, value)}
                        onDelete={() => deleteBand(band.id)}
                        isOnly={config.customBands.length === 1}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4">
                <BandPreviewBar bands={config.customBands} passThreshold={config.passThreshold} />
              </div>
            </TabsContent>

            {/* ── Result Logic ── */}
            <TabsContent value="result" className="mt-0 space-y-5">
              <div>
                <SectionHeader title="Result status logic" description="How the overall result is determined across all subjects in an exam session." />
                <RadioGroup value={config.resultLogic} onValueChange={v => update("resultLogic", v as ResultLogic)} className="space-y-2">
                  {(Object.entries(RESULT_LOGIC_OPTIONS) as [ResultLogic, { label: string; description: string }][]).map(([key, opt]) => (
                    <div key={key}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
                        config.resultLogic === key ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                      )}
                      onClick={() => update("resultLogic", key)}
                    >
                      <RadioGroupItem value={key} id={key} className="mt-0.5" />
                      <div>
                        <Label htmlFor={key} className="text-sm font-medium cursor-pointer text-foreground">{opt.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Score display */}
                <div className="rounded-xl border border-border p-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Score display</p>
                  <ToggleRow label="Show rank" description="Student's position within the section or batch"
                    checked={config.showRank} onChange={v => update("showRank", v)} />
                  <ToggleRow label="Show percentile" description="% of students scored below this student"
                    checked={config.showPercentile} onChange={v => update("showPercentile", v)}
                    disabled={config.resultLogic === "passCompartmentFail"} />
                </div>

                {/* Computation */}
                <div className="rounded-xl border border-border p-4 space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Computation</p>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Min. subjects to fail</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue={3} className="w-20 h-8 text-sm" min={1} disabled={config.resultLogic === "scoreOnly"} />
                      <span className="text-xs text-muted-foreground">subjects → Fail</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Compartment window</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue={2} className="w-20 h-8 text-sm" min={1}
                        disabled={config.resultLogic === "scoreOnly" || config.resultLogic === "clearBacklog"} />
                      <span className="text-xs text-muted-foreground">1–N failed → Compartment</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Report Card ── */}
            <TabsContent value="reportcard" className="mt-0 space-y-5">
              <div>
                <SectionHeader title="Report card fields" description="Choose which fields appear on generated report cards and transcripts." />
                <div className="rounded-xl border border-border divide-y divide-border px-2">
                  <ToggleRow label="Attendance percentage" description="Overall attendance % for the academic period" checked={config.showAttendance} onChange={v => update("showAttendance", v)} />
                  <ToggleRow label="Conduct grade" description="Teacher-assigned conduct or behaviour grade" checked={config.showConductGrade} onChange={v => update("showConductGrade", v)} />
                  <ToggleRow label="Principal remarks" description="Free-text remarks field signed by principal" checked={config.showPrincipalRemarks} onChange={v => update("showPrincipalRemarks", v)} />
                  <ToggleRow label="Rank in section" description="Student's rank among section peers" checked={config.showRank} onChange={v => update("showRank", v)} />
                  <ToggleRow label="Percentile" description="Shown only when result logic is score-based" checked={config.showPercentile} onChange={v => update("showPercentile", v)} disabled={config.resultLogic !== "scoreOnly"} />
                </div>
              </div>

              <Separator />

              <div>
                <SectionHeader title="Report card template" description="Layout used when generating PDFs — auto-selected based on institution type." />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: "school", label: "School", desc: "Grades, attendance, remarks" },
                    { key: "transcript", label: "Transcript", desc: "SGPA, CGPA, credits" },
                    { key: "ranksheet", label: "Rank Sheet", desc: "Score, rank, percentile" },
                  ].map(t => {
                    const isActive =
                      (config.archetype === "school" && t.key === "school") ||
                      (config.archetype === "higherEd" && t.key === "transcript") ||
                      (config.archetype === "testPrep" && t.key === "ranksheet");
                    return (
                      <button key={t.key} className={cn(
                        "rounded-lg border p-4 text-left transition-all",
                        isActive ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/30 hover:border-foreground/20"
                      )}>
                        <p className="text-sm font-medium text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ── Summary ── */}
      <Card className="border-dashed">
        <CardContent className="pt-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Active configuration summary
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm">
            {[
              { label: "Archetype", value: activeArchetype.label },
              { label: "Scale", value: activePreset.name },
              { label: "Pass threshold", value: `${config.passThreshold}%` },
              { label: "Result logic", value: RESULT_LOGIC_OPTIONS[config.resultLogic].label },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}