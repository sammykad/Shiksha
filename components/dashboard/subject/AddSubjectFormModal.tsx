'use client';

import {
  useState,
  useEffect,
  useTransition,
  useMemo,
  useCallback,
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Wand2,
  BookOpen,
  Brain,
  Zap,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { subjectSchema, type SubjectFormData } from '@/lib/schemas';
import {
  type AISubjectSuggestion,
  createDebouncedSuggestions, generateAIDescription
} from '@/ai/gemini-subject-service';
import { Subject } from '@/generated/prisma/client';
import { toast } from 'sonner';
import { createSubject } from '@/lib/data/subjects/subject-action';
import { useRouter } from 'next/navigation';

interface AddSubjectModalProps {
  subjects: Subject[];
}

export function AddSubjectFormModal({ subjects }: AddSubjectModalProps) {
  const [aiSuggestion, setAiSuggestion] = useState<AISubjectSuggestion | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const debouncedGetSuggestions = useMemo(
    () => createDebouncedSuggestions(400),
    []
  );

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: '', code: '', description: '' },
    mode: 'onChange',
  });

  const watchedName = form.watch('name');

  // Local-only suggestions — fast, no network
  const getSuggestions = useCallback(
    async (name: string) => {
      if (!name || name.length < 2) {
        setAiSuggestion(null);
        setIsLoadingAI(false);
        return;
      }
      setIsLoadingAI(true);
      try {
        const result = await debouncedGetSuggestions(name, subjects);
        setAiSuggestion(result);
      } finally {
        setIsLoadingAI(false);
      }
    },
    [subjects, debouncedGetSuggestions]
  );

  useEffect(() => {
    getSuggestions(watchedName);
  }, [watchedName, getSuggestions]);

  // AI description — only fetched when user explicitly clicks "Use AI suggestion"
  const handleApplyAIDescription = async () => {
    const name = form.getValues('name');
    if (!name) return;

    setIsLoadingDescription(true);
    try {
      const desc = await generateAIDescription(name);
      form.setValue('description', desc, { shouldValidate: true });
    } catch {
      toast.error('Could not generate description');
    } finally {
      setIsLoadingDescription(false);
    }
  };

  const hasCriticalDuplicate = aiSuggestion?.similarSubjects?.some(
    (s) => s.similarity > 0.95
  );

  const onSubmit = (data: SubjectFormData) => {
    if (aiSuggestion?.similarSubjects.some((s) => s.similarity > 0.9)) {
      toast.error('Subject looks very similar to an existing one — please verify.');
      return;
    }
    startTransition(async () => {
      try {
        const result = await createSubject(data);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
          form.reset({ name: '', code: '', description: '' });
          setAiSuggestion(null);
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error('An unexpected error occurred');
      }
    });
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* ── Subject Name ── */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden />
                    Subject Name *
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="e.g., Mathematics, English Literature"
                        className="h-11 text-base pr-8"
                        {...field}
                      />
                    </FormControl>
                    {isLoadingAI && (
                      <Loader2
                        className="absolute right-2.5 top-3 h-4 w-4 animate-spin text-muted-foreground"
                        aria-hidden
                      />
                    )}
                  </div>
                  <FormMessage />

                  {/* Unified AI panel */}
                  {!isLoadingAI && aiSuggestion && (
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-3 animate-in slide-in-from-top-1 duration-200">

                      {aiSuggestion.correctedName && (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden />
                            <span className="text-xs text-muted-foreground truncate">
                              Did you mean{' '}
                              <span className="font-medium text-foreground">
                                {aiSuggestion.correctedName}
                              </span>
                              ?
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs gap-1 shrink-0"
                            onClick={() =>
                              form.setValue('name', aiSuggestion.correctedName!, {
                                shouldValidate: true,
                              })
                            }
                          >
                            <Zap className="h-3 w-3" aria-hidden />
                            Apply
                          </Button>
                        </div>
                      )}

                      {aiSuggestion.similarSubjects.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden />
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                              Similar subjects already exist
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pl-5">
                            {aiSuggestion.similarSubjects.map((s) => (
                              <Badge
                                key={s.id}
                                variant="outline"
                                className="text-xs border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300"
                              >
                                {s.name}
                                <span className="ml-1 text-muted-foreground font-normal">
                                  {s.code}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {!aiSuggestion.correctedName &&
                        aiSuggestion.similarSubjects.length === 0 && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                            <span className="text-xs text-muted-foreground">
                              Name looks good
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* ── Subject Code ── */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden />
                    Subject Code *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., MATH101, ENG201, CS101"
                      className="font-mono h-11 text-base"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Uppercase letters and numbers only
                  </FormDescription>
                  <FormMessage />

                  {aiSuggestion?.codeSuggestions &&
                    aiSuggestion.codeSuggestions.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground shrink-0">
                          Suggestions:
                        </span>
                        {aiSuggestion.codeSuggestions.map((code, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="cursor-pointer font-mono text-xs hover:bg-muted transition-colors border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                            onClick={() =>
                              form.setValue('code', code, { shouldValidate: true })
                            }
                          >
                            {code}
                          </Badge>
                        ))}
                      </div>
                    )}
                </FormItem>
              )}
            />

            {/* ── Description ── */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                      Description
                      <span className="text-muted-foreground font-normal">
                        (Optional)
                      </span>
                    </FormLabel>
                    {/* Only shown when field is empty and a name exists — triggers lazy AI fetch */}
                    {!field.value && watchedName && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={isLoadingDescription}
                        className="h-6 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                        onClick={handleApplyAIDescription}
                      >
                        {isLoadingDescription ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" aria-hidden />
                        )}
                        {isLoadingDescription ? 'Generating…' : 'Use AI suggestion'}
                      </Button>
                    )}
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Brief overview of what this subject covers…"
                      rows={3}
                      maxLength={512}
                      className="text-base resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormDescription>Max 512 characters</FormDescription>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {field.value?.length ?? 0}/512
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Zone 3: Action Bar ── */}
            <div className="flex items-center justify-between gap-2 pt-4 border-t">
              <div className="flex items-center gap-1.5 text-xs">
                {hasCriticalDuplicate ? (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md border bg-background hover:bg-muted transition"
                            aria-label="Duplicate subject warning"
                          >
                            <Info className="h-3.5 w-3.5 text-amber-600" aria-hidden />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">
                          A very similar subject already exists. Review before creating.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-amber-600 dark:text-amber-400">
                      Possible duplicate
                    </span>
                  </>
                ) : (
                  <span />
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => {
                    form.reset();
                    setAiSuggestion(null);
                  }}
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={
                    isPending ||
                    !form.formState.isValid ||
                    !!hasCriticalDuplicate
                  }
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Creating…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      Create Subject
                    </>
                  )}
                </Button>
              </div>
            </div>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}