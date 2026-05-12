import { EmptyState } from '@/components/ui/empty-state';
import { Mail, Phone, User } from 'lucide-react';
import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Page Not Found | Shiksha Cloud',
  description: 'The page you are looking for does not exist. Return to the homepage or contact us for help.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NotFound() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const cookie = headersList.get('cookie') || '';

  // We only attempt auth check if:
  // 1. We are on a dashboard route (where Clerk is required)
  // 2. OR we have a session cookie (user is likely logged in)
  // During static build, headers() will be empty, so this will safely skip auth().
  const shouldCheckAuth = pathname.startsWith('/dashboard') || cookie.includes('__session');

  let userId: string | null = null;

  if (shouldCheckAuth) {
    try {
      const session = await auth();
      userId = session?.userId;
    } catch (error) {
      userId = null;
    }
  }

  const homeHref = userId ? '/dashboard' : '/';
  const homeLabel = userId ? 'Back to Dashboard' : 'Go to Home';

  return (
    <div className="grid h-screen place-items-center bg-slate-50/50">
      <EmptyState
        title="Page Not Found"
        description="The page you are looking for does not exist or has been moved."
        icons={[User, Mail, Phone]}
        image="/EmptyStatePageNotFound.png"
        action={{
          label: homeLabel,
          href: homeHref,
        }}
      />
    </div>
  );
}
