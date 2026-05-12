'use client';

import { useSidebar } from '@/hooks/use-sidebar';
import { useStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';
import { SidebarToggle } from './sidebar-toggle';
import { Menu } from './menu';
import { OrganizationSwitcher } from '@clerk/nextjs';
import type { Role } from '@/generated/prisma/enums';

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
        {/* Organization Switcher Header - Fixed */}
        <div className="flex-shrink-0 p-3 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50">
          <div className={cn(
            "transition-all duration-300 ease-in-out rounded-xl overflow-hidden",
            "border border-slate-200/80 dark:border-slate-700/80",
            "bg-white dark:bg-slate-800/50",
            "shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600",
            !getOpenState() ? "p-1" : "p-1.5"
          )}>
            <OrganizationSwitcher
              hidePersonal={true}
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger: {
                    width: '100%',
                    padding: getOpenState() ? '8px 12px' : '8px 4px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: getOpenState() ? 'flex-start' : 'center',
                    gap: '12px',
                    '&:hover': {
                      background: 'rgba(59, 130, 246, 0.05)',
                    },
                    '&:focus': {
                      boxShadow: 'none',
                    }
                  },
                  organizationPreview: {
                    gap: '10px',
                  },
                  // organizationPreviewMainIdentifier: cn(
                  //   'text-slate-800 dark:text-slate-100 font-bold text-sm tracking-tight transition-all duration-300 max-w-[140px] truncate',
                  //   !getOpenState() && 'hidden'
                  // ),
                  organizationPreviewSecondaryIdentifier: cn(
                    'text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider',
                    !getOpenState() && 'hidden'
                  ),
                  organizationSwitcherTriggerIcon: cn(
                    'text-slate-400 dark:text-slate-500 ml-auto',
                    !getOpenState() && 'hidden'
                  ),
                  organizationSwitcherPopoverActionButton__createOrganization: {
                    display: 'none',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Menu Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <Menu isOpen={getOpenState()} role={role} />
        </div>
      </div>
    </aside>
  );
}
