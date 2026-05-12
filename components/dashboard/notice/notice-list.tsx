'use client';

import { useState, useTransition } from 'react';
import { Eye, Trash2, MoreHorizontalIcon, Pin } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { cn, formatDateIN } from '@/lib/utils';
import { Role } from '@/generated/prisma/enums';
import { Notice } from '@/generated/prisma/client';
import { deleteNotice } from '@/lib/data/notice/delete-notice';
import Link from 'next/link';

interface NoticeListProps {
  notices: Notice[];
  userRole: Role;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  gradeNames: Record<string, string>;
  sectionNames: Record<string, string>;
}

// Component signature
export default function NoticeList({
  notices,
  userRole,
  totalCount,
  currentPage,
  pageSize,
  gradeNames,
  sectionNames,
}: NoticeListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleView = (id: string) => {
    router.push(`/dashboard/notices/${id}`);
  };

  const handleDelete = (notice: Notice) => {
    setNoticeToDelete(notice);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!noticeToDelete) return;

    startTransition(async () => {
      const result = await deleteNotice(noticeToDelete.id);

      if (result?.success) {
        toast.success('Notice deleted successfully');
        setDeleteDialogOpen(false);
        setNoticeToDelete(null);
      } else {
        toast.error(result?.error || 'Failed to delete notice');
      }
    });
  };

  const renderAdminActions = (notice: Notice) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => handleView(notice.id)}
          className="cursor-pointer"
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleDelete(notice)}
          className="text-red-600 cursor-pointer hover:text-red-800"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderViewButton = (notice: Notice) => (
    <Button
      onClick={() => handleView(notice.id)}
      variant="outline"
      size="sm"
      className="cursor-pointer"
    >
      <Eye className="mr-2 h-4 w-4" />
      View
    </Button>
  );

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="w-full">
      {/* ─── Mobile Card Layout (visible below md) ─── */}
      <div className="md:hidden space-y-3">
        {notices.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No notices found
          </p>
        ) : (
          notices.map((notice) => {
            const gradeLabels = (notice.targetGrades as string[]).map((id) => gradeNames[id] ?? id);
            const sectionLabels = (notice.targetSections as string[]).map((id) => sectionNames[id] ?? id);
            const scopeText = sectionLabels.length > 0
              ? sectionLabels.join(', ')
              : gradeLabels.length > 0
                ? `${gradeLabels.join(', ')} (all sections)`
                : null;
            return (
              <div
                key={notice.id}
                className={cn(
                  "rounded-lg border bg-card p-4 space-y-3",
                  notice.isPinned && "border-amber-300 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-800"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/dashboard/notices/${notice.id}`}>
                    <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1 hover:underline">
                      {notice.isPinned && (
                        <Pin className="inline-block mr-1.5 h-3 w-3 text-amber-500 fill-amber-500 -rotate-45" />
                      )}
                      {notice.title}
                    </h3>
                  </Link>
                  {userRole === 'ADMIN' || userRole === 'TEACHER' ? renderAdminActions(notice) : renderViewButton(notice)}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={notice.noticeType} className="capitalize text-xs">
                    {notice.noticeType.toLowerCase()}
                  </Badge>
                  <Badge className="text-xs" variant={notice.status}>
                    {notice.status.replaceAll('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>From: {formatDateIN(notice.startDate)}</span>
                  <span>To: {formatDateIN(notice.endDate)}</span>
                </div>
              </div>
            )
          }

          ))
        }
      </div>

      {/* ─── Desktop Table Layout (visible from md up) ─── */}
      <div className="hidden md:block rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden lg:table-cell">Start Date</TableHead>
              <TableHead className="hidden lg:table-cell">End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No notices found
                </TableCell>
              </TableRow>
            ) : (
              notices.map((notice) => {
                const gradeLabels = (notice.targetGrades as string[]).map((id) => gradeNames[id] ?? id);
                const sectionLabels = (notice.targetSections as string[]).map((id) => sectionNames[id] ?? id);
                const scopeText = sectionLabels.length > 0
                  ? sectionLabels.join(', ')
                  : gradeLabels.length > 0
                    ? `${gradeLabels.join(', ')} (all sections)`
                    : 'Entire school';

                return (
                  <TableRow key={notice.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      <Link href={`/dashboard/notices/${notice.id}`} className="hover:underline inline-flex items-center gap-1.5">
                        {notice.isPinned && (
                          <Pin className="h-3 w-3 flex-shrink-0 text-amber-500 fill-amber-500 -rotate-45" />
                        )}
                        {notice.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={notice.noticeType} className="capitalize">
                        {notice.noticeType.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDateIN(notice.startDate)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDateIN(notice.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs" variant={notice.status}>
                        {notice.status.replaceAll('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {userRole === 'ADMIN' || userRole === 'TEACHER' ? renderAdminActions(notice) : renderViewButton(notice)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <div className="py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={currentPage > 1 ? getPageUrl(currentPage - 1) : '#'}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Basic pagination logic: show current, first, last, and one around current
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href={getPageUrl(pageNum)}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href={currentPage < totalPages ? getPageUrl(currentPage + 1) : '#'}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{noticeToDelete?.title}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
