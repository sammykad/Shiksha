'use client';

import { useSidebar } from '@/hooks/use-sidebar';
import { useStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';
import { SidebarToggle } from './sidebar-toggle';
import { Menu } from './menu';
import type { Role } from '@/generated/prisma/enums';
import { OrganizationSwitcher } from '@/components/auth/organization-switcher';

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out',
        'bg-white/95 dark:bg-slate-900/95',
        'border-r border-slate-200/80 dark:border-slate-700/80',
        'shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50',
        'backdrop-blur-md',
        '-translate-x-full lg:translate-x-0',
        !getOpenState() ? 'w-[90px]' : 'w-72',
        settings.disabled && 'hidden'
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />

      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative h-full flex flex-col overflow-hidden"
      >
        {/* Organization Header */}
        <div className="flex-shrink-0 p-3 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50">
          <OrganizationSwitcher isCollapsed={!getOpenState()} />
        </div>

        {/* Menu Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <Menu isOpen={getOpenState()} role={role} />
        </div>
      </div>
    </aside>
  );
}
