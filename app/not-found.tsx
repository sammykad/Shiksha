import { EmptyState } from '@/components/ui/empty-state';
import { Mail, Phone, User } from 'lucide-react';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Page Not Found | Shiksha Cloud',
  description: 'The page you are looking for does not exist. Return to the homepage or contact us for help.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NotFound() {
  const session = await getSession();
  const userId = session?.user.id;

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
