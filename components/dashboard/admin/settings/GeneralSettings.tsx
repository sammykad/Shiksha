'use client';

import type React from 'react';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

import { OrganizationType } from '@/generated/prisma/enums';
import { OrganizationFormData, organizationSchema } from '@/lib/schemas';
import { updateOrganization } from '@/lib/data/update-organization';
import { Organization } from '@/generated/prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadToCloudinary } from '@/lib/cloudinary';
import TerminologySettings from './TerminologySettings';

interface GeneralSettingsProps {
    organization: Organization;
}

export default function GeneralSettings({ organization }: GeneralSettingsProps) {

    const [isPending, startTransition] = useTransition();

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(organization?.logo || null);

    const form = useForm<OrganizationFormData>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            name: organization?.name || '',
            slug: organization?.slug || '',
            contactEmail: organization?.contactEmail || '',
            contactPhone: organization?.contactPhone || '',
            website: organization?.website || '',
            organizationType: organization?.organizationType ?? undefined,
            logo: organization?.logo || '',
            establishedYear: organization?.establishedYear ?? undefined,
        },
    });

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File too large", {
                    description: "Please select an image smaller than 2MB",
                });
                return;
            }
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    function onSubmit(data: OrganizationFormData) {
        startTransition(async () => {
            if (!organization) return;
            try {
                let logoUrl = data.logo;

                if (logoFile) {
                    const uploadResult = await uploadToCloudinary(logoFile, "organization");
                    logoUrl = uploadResult.url;
                }

                await updateOrganization({
                    organizationId: organization.id,
                    data: { ...data, logo: logoUrl }
                });

                toast.success('Organization settings updated successfully');
            } catch (error) {
                console.error('Update error:', error);
                const message = error instanceof Error ? error.message : 'An unexpected error occurred';
                toast.error('Failed to update organization settings', {
                    description: message,
                });
            }
        });
    }
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium">General Settings</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your organization's basic information and settings.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Organization Information</CardTitle>
                    <CardDescription>
                        View and update your organization's details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Logo Section */}
                            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/40 to-muted/10 p-5">
                                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                                    {/* Avatar with ring */}
                                    <div className="relative shrink-0">
                                        <div className="h-20 w-20 rounded-full ring-2 ring-border ring-offset-2 ring-offset-background overflow-hidden">
                                            <Avatar className="h-full w-full">
                                                <AvatarImage src={logoPreview || ''} alt="Organization logo" className="object-cover" />
                                                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                                    {organization?.name?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        {/* Active status indicator dot */}
                                        <span className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-background ${organization?.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    </div>

                                    {/* Text + Actions */}
                                    <div className="flex flex-col items-center sm:items-start gap-3 flex-1 min-w-0">
                                        <div className="text-center sm:text-left">
                                            <p className="font-semibold text-sm leading-tight">Organization Logo</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                PNG or JPG · Max 2 MB · Recommended 200 × 200 px
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('logo-upload')?.click()}
                                                className="gap-2 h-8 text-xs font-medium shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <Upload className="h-3.5 w-3.5" />
                                                {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                            </Button>

                                            {logoPreview && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setLogoFile(null);
                                                        setLogoPreview(organization?.logo);
                                                    }}
                                                    className="gap-2 h-8 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Organization Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter organization name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="organizationType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.values(OrganizationType).map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Organization Slug</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center">
                                                        <Input
                                                            placeholder="organization-slug"
                                                            className="rounded-l-none"
                                                            {...field}
                                                        />
                                                        <span className="text-sm text-muted-foreground bg-muted px-3 py-2 border border-r-0 rounded-l-md">
                                                            .shiksha.cloud
                                                        </span>
                                                    </div>
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground">
                                                    Used in URLs. Only lowercase letters, numbers, and
                                                    hyphens.
                                                </p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="establishedYear"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Established Year</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="e.g. 1985"
                                                        min={1000}
                                                        max={9999}
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            field.onChange(val === '' ? undefined : Number(val));
                                                        }}
                                                    />
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground">
                                                    Year when the organization was established
                                                </p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <h3 className="font-medium">Contact Information</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="contactEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="admin@organization.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="contactPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1 (555) 123-4567" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://www.organization.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            {/* <TerminologySettings organization={organization} /> */}
        </div>
    );
}
