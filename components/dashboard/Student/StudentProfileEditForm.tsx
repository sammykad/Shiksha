'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { StudentProfileFormData, studentProfileSchema } from '@/lib/schemas';
import { toast } from 'sonner';
import { editStudentProfileForm } from '@/lib/data/student/edit-student-form-action';
import { BloodGroup, Gender } from '@/generated/prisma/enums';

interface StudentProfileEditFormProps {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    motherName?: string | null;
    fullName?: string | null;
    dateOfBirth: Date;
    bloodGroup?: BloodGroup | null;
    address?: string | null;
    caste?: string | null;
    subCaste?: string | null;
    profileImage?: string | null;
    rollNumber: string;
    phoneNumber: string;
    whatsAppNumber: string;
    email: string;
    emergencyContact: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    grade: string;
    section: string;
    organization: string;
    canEditGrade: boolean;
    canEditParentDetails: boolean;
    isOwnProfile: boolean;
    isParent: boolean;
  };
}

export function StudentProfileEditForm({
  student,
}: StudentProfileEditFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      firstName: student.firstName,
      lastName: student.lastName,
      middleName: student.middleName || '',
      motherName: student.motherName || '',
      dateOfBirth: student.dateOfBirth,
      bloodGroup: student.bloodGroup || undefined,
      address: student.address || '',
      caste: student.caste || '',
      subCaste: student.subCaste || '',
      gender: student.gender,
      phoneNumber: student.phoneNumber,
      whatsAppNumber: student.whatsAppNumber,
      email: student.email,
      emergencyContact: student.emergencyContact,
      profileImage: student.profileImage || '',
    },
  });

  const onSubmit = async (data: StudentProfileFormData) => {
    startTransition(async () => {
      try {
        const result = await editStudentProfileForm(student.id, data);

        if (result.success) {
          toast.success(
            result.message || 'Student profile updated successfully'
          );
        } else {
          toast.error(result.error || 'Failed to update student profile');
        }
      } catch (error) {
        console.error('Profile update error:', error);
        toast.error('Failed to update student profile. Please try again.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic personal details and identification information
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
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter middle name (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional middle name or father's name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother&apos;s Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mother's name" {...field} />
                      </FormControl>
                      {/* {!student.canEditParentDetails && (
                        <FormDescription className="text-amber-600">
                          Parent details cannot be modified after submission
                        </FormDescription>
                      )} */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem >
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              size={'sm'}
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP') // ✅ field.value is already Date
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(date || undefined)
                            } // ✅ Send actual Date object
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"

                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(Gender).map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {gender}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood Group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={BloodGroup.A_POSITIVE}>A+</SelectItem>
                          <SelectItem value={BloodGroup.A_NEGATIVE}>A-</SelectItem>
                          <SelectItem value={BloodGroup.B_POSITIVE}>B+</SelectItem>
                          <SelectItem value={BloodGroup.B_NEGATIVE}>B-</SelectItem>
                          <SelectItem value={BloodGroup.AB_POSITIVE}>AB+</SelectItem>
                          <SelectItem value={BloodGroup.AB_NEGATIVE}>AB-</SelectItem>
                          <SelectItem value={BloodGroup.O_POSITIVE}>O+</SelectItem>
                          <SelectItem value={BloodGroup.O_NEGATIVE}>O-</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caste</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter caste" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subCaste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Caste</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter sub caste" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Read-only fields */}
              <Separator />
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <FormLabel className="text-muted-foreground">
                    Roll Number
                  </FormLabel>
                  <Input value={student.rollNumber} disabled />
                  <FormDescription>
                    Roll number cannot be changed
                  </FormDescription>
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-muted-foreground">
                    Grade & Section
                  </FormLabel>
                  <Input
                    value={`Grade ${student.grade}-${student.section}`}
                    disabled
                  />
                  <FormDescription>
                    Grade and section are managed by administration
                  </FormDescription>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>
                Phone numbers, email, and emergency contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormDescription>Primary contact number</FormDescription>
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
                        <Input placeholder="Enter WhatsApp number" {...field} />
                      </FormControl>
                      <FormDescription>
                        For WhatsApp notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter email address"
                          type="email"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormDescription>
                        For important notifications and communications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter emergency contact number"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Alternative contact for emergencies
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className='flex items-center justify-between mt-3 bg-muted/50 rounded-lg pt-4'>
              <div>
                <h3 className="">Save Changes</h3>
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
    </div>
  );
}
