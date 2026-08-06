import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalRecords?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalRecords,
  className,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Show ellipsis for long page lists
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)
  );

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-3 py-2', className)}>
      {totalRecords && (
        <span className="text-[11px] text-muted-foreground font-medium">
          Showing{' '}
          <strong className="text-foreground">{pageSize ? (currentPage - 1) * pageSize + 1 : 1}</strong>–
          <strong className="text-foreground">{pageSize ? Math.min(currentPage * pageSize, totalRecords) : totalRecords}</strong>
          {' '}of <strong className="text-foreground">{totalRecords}</strong> entries
        </span>
      )}

      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 w-8 p-0 rounded-xl"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {visiblePages.map((page, i) => {
            const prev = visiblePages[i - 1];
            const showEllipsis = prev && page - prev > 1;
            return (
              <React.Fragment key={page}>
                {showEllipsis && (
                  <span className="px-1 text-muted-foreground text-xs">…</span>
                )}
                <button
                  onClick={() => onPageChange(page)}
                  className={cn(
                    'h-8 w-8 rounded-xl text-xs font-semibold transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    page === currentPage
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  )}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile: current / total */}
        <span className="sm:hidden text-xs text-muted-foreground px-2">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 w-8 p-0 rounded-xl"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
