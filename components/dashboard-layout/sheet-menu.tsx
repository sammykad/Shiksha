'use client';

import { MenuIcon, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Menu } from './menu';
import { OrganizationSwitcher } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { Role } from '@/generated/prisma/enums';

interface SheetMenuProps {
  role: Role;
}

export function SheetMenu({ role }: SheetMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="lg:hidden" asChild>
        <Button
          className="h-9 w-9 relative group transition-all duration-200 hover:shadow-md"
          variant="outline"
          size="icon"
        >
          <MenuIcon
            size={18}
            className="transition-transform duration-200 group-hover:scale-110"
          />
        </Button>
      </SheetTrigger>

      <SheetContent
        showCloseButton={false}
        side="left"
        className="w-[280px] sm:w-[300px] p-0 gap-0 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-700/60 [&>button]:hidden"
      >
        <VisuallyHidden>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Application navigation sidebar</SheetDescription>
        </VisuallyHidden>

        {/* Header — Org Switcher + Close */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-200/60 dark:border-slate-700/60 flex-shrink-0 bg-white/50 dark:bg-slate-900/50">
          {/* Org Switcher */}
          <div className="flex-1 min-w-0 px-2 py-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 shadow-sm">
            <OrganizationSwitcher
              hidePersonal={true}
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  organizationSwitcherTrigger: {
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    '&:hover': {
                      background: 'rgba(59, 130, 246, 0.05)',
                    },
                    '&:focus': {
                      boxShadow: 'none',
                    },
                  },
                  organizationPreview: {
                    gap: '8px',
                  },
                  organizationPreviewMainIdentifier: cn(
                    'text-slate-800 dark:text-slate-100 font-bold text-sm tracking-tight max-w-[130px] truncate'
                  ),
                  organizationPreviewSecondaryIdentifier: cn(
                    'text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider'
                  ),
                  organizationSwitcherTriggerIcon: cn(
                    'text-slate-400 dark:text-slate-500 ml-auto'
                  ),
                  organizationSwitcherPopoverActionButton__createOrganization: {
                    display: 'none',
                  },
                  organizationSwitcherPopoverCard: {
                    zIndex: 60,
                  },
                },
              }}
            />
          </div>

          {/* Close button */}
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 flex-shrink-0 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
              <span className="sr-only">Close menu</span>
            </Button>
          </SheetClose>
        </div>

        {/* Scrollable Menu — takes remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {role ? (
            <Menu isOpen role={role} />
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Role not assigned
                </p>
                <p className="text-red-500 dark:text-red-500 text-sm mt-1">
                  Contact admin for access
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}