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
import { getSession, resolveDefaultOrganizationId } from '@/lib/auth';
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
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8 sm:px-6">
      <Card className="w-full max-w-6xl overflow-hidden">
        <CardHeader className="px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
          <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
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
                <CreateOrganization afterCreateOrganizationUrl={returnUrl} />
              )}

            </div>
            <div className="hidden w-full justify-center lg:flex">
              <Image
                src="/images/select-organization.svg"
                alt="Select Organization"
                width={420}
                height={420}
                priority
                className="max-w-[420px]"
                style={{ width: 'auto', height: 'auto' }}
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

