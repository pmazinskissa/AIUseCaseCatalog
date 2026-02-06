import { Search, SlidersHorizontal, ArrowUpDown, X, Filter } from 'lucide-react';
import {
  Status,
  ApprovalStatus,
  UseCaseFilters,
  STATUS_LABELS,
  APPROVAL_STATUS_LABELS,
} from '../types';

interface FilterPanelProps {
  filters: UseCaseFilters;
  onFilterChange: (filters: UseCaseFilters) => void;
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const handleChange = (key: keyof UseCaseFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
      page: 1,
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.approvalStatus;
  const activeFilterCount = [filters.search, filters.status, filters.approvalStatus].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-500/20">
            <SlidersHorizontal size={18} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800 block">Filters</span>
            <span className="text-xs text-slate-400">Refine your search</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">
              <Filter size={12} />
              {activeFilterCount} active
            </span>
          )}
          {hasActiveFilters && (
            <button
              onClick={() => onFilterChange({ page: 1, limit: filters.limit })}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-all"
            >
              <X size={14} />
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Search</label>
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm placeholder:text-slate-400"
              placeholder="Search use cases..."
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Status</label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm appearance-none cursor-pointer pr-10"
              value={filters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {(Object.keys(STATUS_LABELS) as Status[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Approval</label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm appearance-none cursor-pointer pr-10"
              value={filters.approvalStatus || ''}
              onChange={(e) => handleChange('approvalStatus', e.target.value)}
            >
              <option value="">All Approvals</option>
              {(Object.keys(APPROVAL_STATUS_LABELS) as ApprovalStatus[]).map((status) => (
                <option key={status} value={status}>
                  {APPROVAL_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <ArrowUpDown size={12} />
            Sort By
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm appearance-none cursor-pointer pr-10"
              value={`${filters.sortBy || 'dateSubmitted'}-${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [
                  UseCaseFilters['sortBy'],
                  UseCaseFilters['sortOrder']
                ];
                onFilterChange({ ...filters, sortBy, sortOrder, page: 1 });
              }}
            >
              <option value="dateSubmitted-desc">Newest First</option>
              <option value="dateSubmitted-asc">Oldest First</option>
              <option value="compositeScore-desc">Highest Score</option>
              <option value="compositeScore-asc">Lowest Score</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
