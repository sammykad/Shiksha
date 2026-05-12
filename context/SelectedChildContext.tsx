'use client';

import {
  createContext,
  useCallback,
  useContext,
  useOptimistic,
  useTransition,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { selectChildAction } from '@/lib/data/parent/selected-child';
import type { ChildSummary } from '@/lib/data/parent/selected-child';

interface SelectedChildState {
  selectedChildId: string | null;
  selectedChild: ChildSummary | null;
  childList: ChildSummary[];
  isPending: boolean;
  selectChild: (id: string) => void;
}
const SelectedChildContext = createContext<SelectedChildState | null>(null);

interface SelectedChildProviderProps {
  initialChildId: string | null;
  childList: ChildSummary[];
  children: ReactNode;
}

export function SelectedChildProvider({
  initialChildId,
  childList,
  children,
}: SelectedChildProviderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const resolvedInitialId =
    childList.find((c) => c.id === initialChildId)?.id ??
    childList[0]?.id ??
    null;

  const [optimisticId, setOptimisticId] = useOptimistic(resolvedInitialId);

  const selectChild = useCallback(
    (id: string) => {
      startTransition(async () => {
        setOptimisticId(id);          // instant UI — switcher flips immediately
        await selectChildAction(id);  // writes cookie + ownership check
        router.refresh();             // Server Components re-run with new cookie
      });
    },
    [setOptimisticId, router]
  );

  const selectedChild = childList.find((c) => c.id === optimisticId) ?? null;

  return (
    <SelectedChildContext.Provider
      value={{
        selectedChildId: optimisticId,
        selectedChild,
        childList,
        isPending,
        selectChild,
      }}
    >
      {children}
    </SelectedChildContext.Provider>
  );
}

export function useSelectedChild(): SelectedChildState {
  const ctx = useContext(SelectedChildContext);
  if (!ctx) throw new Error('useSelectedChild must be used within SelectedChildProvider');
  return ctx;
}

export function useSelectedChildId(): string | null {
  return useSelectedChild().selectedChildId;
}

export function useChildList(): ChildSummary[] {
  return useSelectedChild().childList;
}

// // In ChildSwitcher (client component)
// const { childList, selectChild, isPending } = useSelectedChild();

// // In ParentDashboard / FeesPage (client component)
// const childId = useSelectedChildId(); // only re-renders when ID changes