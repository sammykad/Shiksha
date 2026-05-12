'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Organization } from '@/generated/prisma/client';
import { TerminologyLabels, getTerminology } from '@/lib/terminology';
import { updateOrganization } from '@/lib/data/update-organization';

interface TerminologySettingsProps {
    organization: Organization;
}

const PRESETS: { label: string; data: TerminologyLabels }[] = [
    { label: 'Maharashtra School', data: { grade: 'Standard', section: 'Division', student: 'Student', classTeacher: 'Class Teacher', grades: 'Standards', sections: 'Divisions', students: 'Students', institute: 'School' } },
    { label: 'Kindergarten', data: { grade: 'Class', section: 'Section', student: 'Child', classTeacher: 'Class Teacher', grades: 'Classes', sections: 'Sections', students: 'Children', institute: 'School' } },
    { label: 'Coaching Classes', data: { grade: 'Standard', section: 'Batch', student: 'Student', classTeacher: 'Faculty', grades: 'Standards', sections: 'Batches', students: 'Students', institute: 'Classes' } },
    { label: 'College', data: { grade: 'Year', section: 'Division', student: 'Student', classTeacher: 'Mentor', grades: 'Years', sections: 'Divisions', students: 'Students', institute: 'College' } },
    { label: 'Training Institute', data: { grade: 'Course', section: 'Batch', student: 'Trainee', classTeacher: 'Instructor', grades: 'Courses', sections: 'Batches', students: 'Trainees', institute: 'Institute' } },
];

const SINGULAR_FIELDS: { key: keyof TerminologyLabels; tag: string }[] = [
    { key: 'grade', tag: 'Grade' },
    { key: 'section', tag: 'Section' },
    { key: 'student', tag: 'Student' },
    { key: 'classTeacher', tag: 'Class Teacher' },
];

const PLURAL_FIELDS: { key: keyof TerminologyLabels; tag: string }[] = [
    { key: 'grades', tag: 'Grades' },
    { key: 'sections', tag: 'Sections' },
    { key: 'students', tag: 'Students' },
    { key: 'institute', tag: 'Institute' },
];

const PREVIEW_KEYS: (keyof TerminologyLabels)[] = [
    'grade', 'section', 'student', 'classTeacher', 'institute',
];

export default function TerminologySettings({ organization }: TerminologySettingsProps) {
    const [isPending, startTransition] = useTransition();
    const [isDirty, setIsDirty] = useState(false);
    const [activePreset, setActivePreset] = useState<number | null>(null);

    const [terminology, setTerminology] = useState<TerminologyLabels>(
        () => getTerminology(organization.organizationType)
    );

    // const [terminology, setTerminology] = useState<TerminologyLabels>(
    //     () => (organization.terminology as TerminologyLabels) ?? getTerminology(organization.organizationType)
    // );

    const update = (key: keyof TerminologyLabels, value: string) => {
        setTerminology(prev => ({ ...prev, [key]: value }));
        setActivePreset(null);
        setIsDirty(true);
    };

    const applyPreset = (index: number, data: TerminologyLabels) => {
        setTerminology(data);
        setActivePreset(index);
        setIsDirty(true);
    };

    const onSave = () => {
        startTransition(async () => {
            // try {
            //     await updateOrganization({
            //         organizationId: organization.id,
            //         data: { terminology },
            //     });
            //     toast.success('Terminology saved');
            //     setIsDirty(false);
            // } catch (err) {
            //     toast.error('Failed to save', {
            //         description: err instanceof Error ? err.message : 'Unexpected error',
            //     });
            // }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium">Terminology</h2>
                <p className="text-sm text-muted-foreground">
                    Customise what your organisation calls grades, sections, students and staff.
                    Changes apply everywhere across the app.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Label configuration</CardTitle>
                    <CardDescription>Start from a preset or set your own labels below.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">

                    {/* Presets */}
                    <div className="space-y-3">
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Quick presets
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map((preset, i) => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => applyPreset(i, preset.data)}
                                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${activePreset === i
                                        ? 'border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-200'
                                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Singular fields */}
                    <div className="space-y-3">
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Singular labels
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {SINGULAR_FIELDS.map(({ key, tag }) => (
                                <div
                                    key={key}
                                    className="overflow-hidden rounded-lg border border-border focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 dark:focus-within:ring-violet-900 transition-shadow"
                                >
                                    <span className="block bg-violet-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                        {tag}
                                    </span>
                                    <Input
                                        value={terminology[key]}
                                        onChange={e => update(key, e.target.value)}
                                        placeholder={tag}
                                        className="rounded-none border-0 border-t px-3 py-2 text-sm font-medium shadow-none focus-visible:ring-0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Plural fields */}
                    <div className="space-y-3">
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Plural &amp; institute
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {PLURAL_FIELDS.map(({ key, tag }) => (
                                <div
                                    key={key}
                                    className="overflow-hidden rounded-lg border border-border focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 dark:focus-within:ring-violet-900 transition-shadow"
                                >
                                    <span className="block bg-violet-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                        {tag}
                                    </span>
                                    <Input
                                        value={terminology[key]}
                                        onChange={e => update(key, e.target.value)}
                                        placeholder={tag}
                                        className="rounded-none border-0 border-t px-3 py-2 text-sm font-medium shadow-none focus-visible:ring-0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live preview */}
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Preview
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {PREVIEW_KEYS.map((key, i) => (
                                <div
                                    key={key}
                                    className={`flex flex-col gap-0.5 rounded-md px-3 py-2 ${i < 2
                                        ? 'bg-violet-50 dark:bg-violet-950'
                                        : 'bg-background border border-border'
                                        }`}
                                >
                                    <span className={`text-[10px] ${i < 2 ? 'text-violet-500' : 'text-muted-foreground'}`}>
                                        {key === 'classTeacher' ? 'class teacher' : key}
                                    </span>
                                    <span className={`text-sm font-medium ${i < 2 ? 'text-violet-900 dark:text-violet-100' : 'text-foreground'}`}>
                                        {terminology[key] || '—'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </CardContent>

                <CardFooter className="flex items-center justify-between border-t bg-muted/30 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${isDirty ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                        <span className="text-xs text-muted-foreground">
                            {isDirty ? 'Unsaved changes' : 'All changes saved'}
                        </span>
                    </div>
                    <Button onClick={onSave} disabled={isPending || !isDirty} size="sm">
                        {isPending ? 'Saving...' : 'Save changes'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}