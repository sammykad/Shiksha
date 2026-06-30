'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
}

const PAGE_SIZES = [10, 30, 50, 100];

export default function DataTablePagination({
  currentPage,
  totalPages,
  totalCount,
}: DataTablePaginationProps) {
  const [isPending, startTransition] = useTransition();
  const [pageIndex, setPageIndex] = useQueryState('pageIndex', {
    ...parseAsInteger.withDefault(currentPage),
    shallow: false,
  });
  const [pageSize, setPageSize] = useQueryState('pageSize', {
    ...parseAsInteger.withDefault(30),
    shallow: false,
  });

  const currentPageNum = Math.min(Math.max(pageIndex || currentPage, 1), totalPages);

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    if (nextPage === currentPageNum) return;
    startTransition(() => void setPageIndex(nextPage));
  };

  const handlePageSizeChange = (size: string) => {
    startTransition(() => {
      void setPageSize(Number(size));
      void setPageIndex(1);
    });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [1];
    let start = Math.max(2, currentPageNum - 1);
    let end = Math.min(totalPages - 1, currentPageNum + 1);

    if (currentPageNum <= 3) {
      end = Math.min(totalPages - 1, 4);
    } else if (currentPageNum >= totalPages - 2) {
      start = Math.max(2, totalPages - 3);
    }

    if (start > 2) pages.push('ellipsis-start');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('ellipsis-end');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page</span>
        <Select value={String(pageSize ?? 30)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-8 w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {totalCount !== undefined && (
          <span>
            {Math.min((currentPageNum - 1) * (pageSize ?? 30) + 1, totalCount)}–
            {Math.min(currentPageNum * (pageSize ?? 30), totalCount)} of {totalCount}
          </span>
        )}
      </div>

      <Pagination className="w-auto mx-0">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(1)}
              disabled={currentPageNum <= 1 || isPending}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>

          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                handlePageChange(currentPageNum - 1);
              }}
              className={currentPageNum <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>

          {getPageNumbers().map((page) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <PaginationItem key={page}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem key={`page-${page}`}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(Number(page));
                  }}
                  isActive={currentPageNum === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault();
                handlePageChange(currentPageNum + 1);
              }}
              className={currentPageNum >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>

          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPageNum >= totalPages || isPending}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
