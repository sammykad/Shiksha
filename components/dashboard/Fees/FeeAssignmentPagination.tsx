'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface FeeAssignmentPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function FeeAssignmentPagination({
  currentPage,
  totalPages,
}: FeeAssignmentPaginationProps) {
  const [isPending, startTransition] = useTransition();
  const [pageIndex, setPageIndex] = useQueryState('pageIndex', {
    ...parseAsInteger.withDefault(currentPage),
    shallow: false,
  });

  const currentPageNum = Math.min(Math.max(pageIndex || currentPage, 1), totalPages);

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);

    if (nextPage === currentPageNum) {
      return;
    }

    startTransition(() => {
      setPageIndex(nextPage);
    });
  };

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    pages.push(1);

    let start = Math.max(2, currentPageNum - 1);
    let end = Math.min(totalPages - 1, currentPageNum + 1);

    if (currentPageNum <= 3) {
      end = Math.min(totalPages - 1, 4);
    } else if (currentPageNum >= totalPages - 2) {
      start = Math.max(2, totalPages - 3);
    }

    if (start > 2) {
      pages.push('ellipsis-start');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(1)}
            disabled={currentPageNum === 1 || isPending}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>

        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(event) => {
              event.preventDefault();
              handlePageChange(Math.max(1, currentPageNum - 1));
            }}
            className={currentPageNum === 1 ? 'pointer-events-none opacity-50' : ''}
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
              handlePageChange(Math.min(totalPages, currentPageNum + 1));
            }}
            className={currentPageNum === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        <PaginationItem>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPageNum === totalPages || isPending}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
