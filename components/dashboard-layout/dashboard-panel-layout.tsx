'use client';

import { useSidebar } from '@/hooks/use-sidebar';
import { useStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';

interface AdminPanelLayoutProps {
  children: React.ReactNode;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
}

export default function AdminPanelLayout({
  children,
  role,
}: AdminPanelLayoutProps) {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { getOpenState, settings } = sidebar;

  return (
    <div className="">
      <Sidebar role={role} />
      <main
        className={cn(
          !settings.disabled && (!getOpenState() ? 'lg:ml-[90px]' : 'lg:ml-72')
        )}
      >
        <div className="relative">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.15)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.1)_1px,transparent_0)] [background-size:20px_20px] pointer-events-none" />
          <div className="relative z-10">{children}</div>
        </div>
      </main>
      <footer
        className={cn(
          'transition-all duration-300 ease-in-out',
          !settings.disabled && (!getOpenState() ? 'lg:ml-[90px]' : 'lg:ml-72')
        )}
      >
        {/* Footer content can go here */}
      </footer>
    </div>
  );
}
