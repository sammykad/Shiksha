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
import { createGrade } from '@/app/actions';
import { GradeFormData, gradeSchema } from '@/lib/schemas';
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useTransition } from 'react';
import { useTerminology } from '@/context/terminology';


export function AddGrade() {
  const [isPending, startTransition] = useTransition();
  const terms = useTerminology();


  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      name: "",
    },
  })


  async function onSubmit(data: GradeFormData) {
    startTransition(async () => {
      const result = await createGrade(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`${terms.grade} Created Successfully`)
        form.reset()
      }
    })

  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button aria-label="Add Grade" className='gap-2'>
          <Plus className="h-4 w-4 " />
          Create {terms.grade}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create {terms.grade}</DialogTitle>
          <DialogDescription>
            Create a new {terms.grade}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">
                    {terms.grade} Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    aria-invalid={fieldState.invalid}
                    placeholder={`Enter ${terms.grade} name`}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">
                    Description
                  </FieldLabel>
                  <Input
                    {...field}
                    id="description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter description"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <FieldDescription>
                    Include steps to reproduce, expected behavior, and what
                    actually happened.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            /> */}
          </FieldGroup>
          <DialogFooter className='mt-3'>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {isPending ? (
              <Button type="submit" disabled={isPending} className='gap-2'>
                <Loader2 className="animate-spin" />
                Creating {terms.grade}...
              </Button>
            ) : (
              <Button type="submit" disabled={isPending} className='gap-2'>
                Create {terms.grade}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
