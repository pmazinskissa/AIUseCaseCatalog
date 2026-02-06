import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const showPages = 5;
  let start = Math.max(1, page - Math.floor(showPages / 2));
  const end = Math.min(totalPages, start + showPages - 1);

  if (end - start + 1 < showPages) {
    start = Math.max(1, end - showPages + 1);
  }

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-200/80">
      <button
        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:shadow-none transition-all"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <div className="flex gap-1.5">
        {pages.map((p, i) =>
          typeof p === 'number' ? (
            <button
              key={i}
              onClick={() => onPageChange(p)}
              className={`min-w-[40px] h-10 px-3 rounded-xl text-sm font-medium transition-all ${
                p === page
                  ? 'bg-gradient-to-r from-blue-600 to-slate-700 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={i} className="px-2 py-2.5 text-slate-400 font-medium">
              {p}
            </span>
          )
        )}
      </div>

      <button
        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:shadow-none transition-all"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
