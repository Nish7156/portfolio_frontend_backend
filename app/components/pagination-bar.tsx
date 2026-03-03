"use client";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limits?: number[];
}

export function PaginationBar({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limits = [5, 10, 15, 25],
}: PaginationBarProps) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2">
      <div className="text-slate-400 text-sm">
        Showing {start}–{end} of {total}
      </div>
      <div className="flex items-center gap-2">
        {onLimitChange && (
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white"
          >
            {limits.map((l) => (
              <option key={l} value={l}>
                {l} per page
              </option>
            ))}
          </select>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            Prev
          </button>
          <span className="px-2 py-1 text-sm text-slate-400">
            {page} / {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
