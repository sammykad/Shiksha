'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Plus } from 'lucide-react';
import { SectionFormData, sectionSchema } from '@/lib/schemas';
import { createSection } from '@/app/actions';
import { useTransition } from 'react';
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { useTerminology } from '@/context/terminology';

interface AddSectionProps {
    gradeId: string;
}

export function AddSection({ gradeId }: AddSectionProps) {
    const [isPending, startTransition] = useTransition();
    const terms = useTerminology();


    const form = useForm<SectionFormData>({
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            gradeId: gradeId,
            name: "",
        },
    })

    async function onSubmit(data: SectionFormData) {
        startTransition(async () => {
            const result = await createSection(data);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(`${terms.section} Created Successfully`)
                form.reset()
            }
        })

    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create  {terms.section}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        Create {terms.section}
                    </DialogTitle>
                    <DialogDescription>
                        Add a new {terms.section} to this {terms.grade}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <input type="hidden" name="gradeId" value={gradeId} />

                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="name">
                                        {terms.section} Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="name"
                                        aria-invalid={fieldState.invalid}
                                        placeholder={`Enter ${terms.section} name`}
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <DialogFooter className='mt-3'>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        {isPending ? (
                            <Button type="submit" disabled={isPending} className="gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating {terms.section}...
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isPending}>
                                Create {terms.section}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}



