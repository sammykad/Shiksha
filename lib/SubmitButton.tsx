'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import React from 'react';
import { useFormStatus } from 'react-dom';

export function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Please wait
        </Button>
      ) : (
        <Button type="submit">{text}</Button>
      )}
    </>
  );
}

export function DeleteNoticeButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Please wait
        </Button>
      ) : (
        <Button type="submit" variant="destructive" onClick={onClick}>
          Delete Notice
        </Button>
      )}
    </>
  );
}

export function CreateGradeButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button type="submit" disabled={pending} className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating Grade...
        </Button>
      ) : (
        <Button type="submit" disabled={pending}>
          Create Grade
        </Button>
      )}
    </>
  );
}
export function DeleteGradeButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button variant="destructive" type="submit" disabled={pending} className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Deleting...
        </Button>
      ) : (
        <Button variant="destructive" type="submit" disabled={pending}>
          Delete Grade
        </Button>
      )}
    </>
  );
}
export function CreateSectionButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button type="submit" disabled={pending} className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating...
        </Button>
      ) : (
        <Button type="submit" disabled={pending}>
          Create Section
        </Button>
      )}
    </>
  );
}
export function DeleteSectionButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button variant="destructive" type="submit" disabled={pending} className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Deleting...
        </Button>
      ) : (
        <Button variant="destructive" type="submit" disabled={pending}>
          Delete Section
        </Button>
      )}
    </>
  );
}

export function CreateStudentButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button variant="default" type="submit" disabled={pending} className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating...
        </Button>
      ) : (
        <Button variant="default" type="submit" disabled={pending}>
          Create Student
        </Button>
      )}
    </>
  );
}

// Fees Buttons

export function CreateFeeAssignmentButton({
  disabled,
}: {
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled={disabled} className="gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Please wait
        </Button>
      ) : (
        <Button type="submit" className="gap-2">
          <Send className="h-4 w-4" /> Assign Fees
        </Button>
      )}
    </>
  );
}
