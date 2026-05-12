import { EmptyState } from '@/components/ui/empty-state';
import { Paperclip, School, Book } from 'lucide-react';

export default function Assignments() {
  return (
    <div className="flex items-center justify-center min-h-full">
      <EmptyState
        description="There are no pending assignments for your active classes right now. Enjoy your free time or review past materials."
        title="You're all caught up!"
        icons={[Book, School, Paperclip]}
      />
      {/* <StudentAssignment /> */}
    </div>
  );
}
// https://github.com/Ashutoshx7/VengenceUI/blob/main/src/pages/demo/staggered-grid.tsx