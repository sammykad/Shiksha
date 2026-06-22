import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { OrganizationList } from '@/components/auth/organization-list';
import { CreateOrganization } from '@/components/auth/create-organization';
import prisma from '@/lib/prisma-base';
import { UserButton } from '@/components/auth/user-button';

export const metadata: Metadata = {
  title: 'Select Organization | Shiksha Cloud',
  description: 'Select or create an organization to access your Shiksha Cloud dashboard. Manage your school, students, and fees in one unified platform.',
};

export default async function SelectOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string; clear?: string }>;
}) {
  const { returnUrl = '/dashboard', clear } = await searchParams;

  const session = await getSession();
  if (!session) redirect("/sign-in");

  if (clear === "true") {
    await prisma.session.update({
      where: { id: session.session.id },
      data: { activeOrganizationId: null },
    });
    session.session.activeOrganizationId = null;
  }

  const activeOrganizationId = session.session.activeOrganizationId;

  if (activeOrganizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: activeOrganizationId },
      select: { id: true },
    });
    if (org) {
      redirect(returnUrl);
    }
  }

  const memberships = await prisma.membership.findMany({
    where: {
      userId: session.user.id,
      status: 'ACTIVE',
      organization: { isActive: true },
    },
    select: { organizationId: true },
    orderBy: { updatedAt: 'desc' },
  });

  const hasOrganizations = memberships.length > 0;

  if (hasOrganizations && clear !== "true") {
    await prisma.session.update({
      where: { id: session.session.id },
      data: { activeOrganizationId: memberships[0].organizationId },
    });
    redirect(returnUrl);
  }

  const title = hasOrganizations
    ? 'Select an organization'
    : 'Create an organization';
  const description = hasOrganizations
    ? 'Select an organization to continue'
    : 'Create an organization to get started';

  const user = session.user;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8 sm:px-6">
      <Card className="w-full max-w-6xl overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
          <div>
            <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <UserButton
            user={{
              firstName: user.firstName,
              lastName: user.lastName,
              name: user.name,
              email: user.email,
              image: user.image,
            }}
          />
        </CardHeader>
        <CardContent className="px-6 pb-8 pt-0 sm:px-8">
          <div className="grid min-h-[520px] items-center gap-10 lg:grid-cols-[minmax(420px,0.95fr)_minmax(360px,0.75fr)]">
            <div className="flex w-full justify-center lg:justify-start lg:pl-16">
              {hasOrganizations ? (
                <OrganizationList
                  hidePersonalAccount
                  afterSelectOrganizationUrl={returnUrl}
                  applicationName="Shiksha Cloud"
                />
              ) : (
                <CreateOrganization />
              )}
            </div>
            <div className="hidden w-full justify-center lg:flex">
              <Image
                src="/images/select-organization.svg"
                alt="Select Organization"
                width={420}
                height={420}
                priority
                style={{ maxWidth: '420px', width: 'auto', height: 'auto' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
