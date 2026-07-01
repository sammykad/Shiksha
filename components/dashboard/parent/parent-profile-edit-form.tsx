'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  parentProfileSchema,
  type ParentProfileFormData,
} from '@/lib/schemas';
import { toast } from 'sonner';
import { updateParentProfile } from '@/lib/data/parent/update-parent-profile';

interface ParentProfileEditFormProps {
  parent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    whatsAppNumber: string;
    profileImage?: string | null;
  };
}

export function ParentProfileEditForm({
  parent,
}: ParentProfileEditFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ParentProfileFormData>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: {
      firstName: parent.firstName,
      lastName: parent.lastName,
      phoneNumber: parent.phoneNumber,
      whatsAppNumber: parent.whatsAppNumber,
      profileImage: parent.profileImage || '',
    },
  });

  const onSubmit = async (data: ParentProfileFormData) => {
    startTransition(async () => {
      try {
        const result = await updateParentProfile(data);

        if (result.success) {
          toast.success(result.message || 'Profile updated successfully');
        } else {
          toast.error(result.error || 'Failed to update profile');
        }
      } catch {
        toast.error('Failed to update profile. Please try again.');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your name and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 10-digit mobile number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsAppNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 10-digit WhatsApp number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel className="text-muted-foreground">Email</FormLabel>
                <Input value={parent.email} disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between bg-muted/50 rounded-lg pt-4">
            <div>
              <h3 className="font-medium">Save Changes</h3>
              <p className="text-sm text-muted-foreground">
                Review your information before saving
              </p>
            </div>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
