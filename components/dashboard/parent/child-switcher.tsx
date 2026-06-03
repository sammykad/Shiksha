'use client';

import { useSelectedChild } from '@/context/SelectedChildContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChildSwitcher() {
  const { selectedChild, childList, isPending, selectChild } = useSelectedChild();

  // No children — don't show the switcher
  if (childList.length === 0) {
    return null;
  }

  // Single child — no switcher needed, just a label
  if (childList.length === 1) {
    return (
      <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/50 text-sm">
          <Avatar className="h-5 w-5">
            <AvatarImage src={selectedChild?.profileImage ?? undefined} />
            <AvatarFallback className="text-[10px]">
              {(selectedChild?.fullName || selectedChild?.firstName)?.[0]}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{selectedChild?.fullName || `${selectedChild?.firstName} ${selectedChild?.lastName}`}</span>
        <span className="text-muted-foreground">
          {selectedChild?.grade.grade} {selectedChild?.section.name}
        </span>
      </div>
    );
  }

  // Multiple children — dropdown switcher
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Avatar className="h-5 w-5">
              <AvatarImage src={selectedChild?.profileImage ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {(selectedChild?.fullName || selectedChild?.firstName)?.[0]}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="font-medium">{selectedChild?.fullName || `${selectedChild?.firstName} ${selectedChild?.lastName}`}</span>
          <span className="text-muted-foreground hidden sm:inline">
            · {selectedChild?.grade.grade} {selectedChild?.section.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Switch Child
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {childList.map((child) => (
          <DropdownMenuItem
            key={child.id}
            onSelect={() => selectChild(child.id)}
            className={cn(
              'gap-3 cursor-pointer',
              child.id === selectedChild?.id && 'bg-accent'
            )}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={child.profileImage ?? undefined} />
              <AvatarFallback className="text-xs">
                {(child.fullName || child.firstName)?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {child.firstName} {child.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                {child.grade.grade} · {child.section.name} · {child.relationship}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}