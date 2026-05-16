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
import { getSafeAuthCallbackUrl } from '@/lib/auth-navigation';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'Select Organization | Shiksha Cloud',
  description: 'Select or create an organization to access your Shiksha Cloud dashboard. Manage your school, students, and fees in one unified platform.',
};

export default async function SelectOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string | string[]; switch?: string | string[] }>;
}) {
  let session;
  try {
    session = await getSession();
  } catch {
    redirect('/sign-in?callbackUrl=/select-organization');
  }

  const params = await searchParams;
  const requestedReturnUrl = Array.isArray(params.returnUrl)
    ? params.returnUrl[0]
    : params.returnUrl;
  const returnUrl = getSafeAuthCallbackUrl(requestedReturnUrl);
  const shouldForcePicker = getBooleanParam(params.switch);
  const activeOrganizationId = (session.session as { activeOrganizationId?: string | null })
    .activeOrganizationId;

  if (activeOrganizationId && !shouldForcePicker) {
    redirect(returnUrl);
  }

  const memberships = await prisma.membership.findMany({
    where: {
      userId: session.user.id,
      status: 'ACTIVE',
      organization: {
        isActive: true,
      },
    },
    select: {
      organizationId: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const hasOrganizations = memberships.length > 0;

  if (hasOrganizations && !shouldForcePicker) {
    const defaultOrganizationId = await resolveDefaultOrganizationId(
      session.user.id,
      memberships.map((membership) => membership.organizationId)
    );

    await prisma.session.update({
      where: {
        id: session.session.id,
      },
      data: {
        activeOrganizationId: defaultOrganizationId ?? memberships[0].organizationId,
      },
    });

    redirect(returnUrl);
  }

  const title = hasOrganizations
    ? 'Select an organization'
    : 'Create an organization';
  const description = hasOrganizations
    ? 'Select an organization to continue'
    : 'Create an organization to get started';


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl ">
        <CardHeader className="">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 ">
            <div className="w-full flex items-center justify-center">
              {hasOrganizations ? (
                <OrganizationList
                  hidePersonalAccount
                  afterSelectOrganizationUrl={returnUrl}
                  applicationName="Shiksha Cloud"
                />
              ) : (
                <CreateOrganization afterCreateOrganizationUrl={returnUrl} />
              )}

            </div>
            <div className="w-full max-w-[564px] hidden lg:flex justify-center">
              <Image
                src="/images/select-organization.svg"
                alt="Select Organization"
                width={400}
                height={400}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getBooleanParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'true' || raw === '1' || raw === '';
}

async function resolveDefaultOrganizationId(userId: string, organizationIds: string[]) {
  if (organizationIds.length === 0) return null;

  const lastSession = await prisma.session.findFirst({
    where: {
      userId,
      activeOrganizationId: {
        in: organizationIds,
      },
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      activeOrganizationId: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return lastSession?.activeOrganizationId ?? null;
}
