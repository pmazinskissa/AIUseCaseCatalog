import { useState, useEffect } from 'react';
import { Loader2, FileText, AlertCircle, X, LayoutGrid, Sparkles, TrendingUp, CheckCircle2, Clock, PlusCircle } from 'lucide-react';
import { UseCase, UseCaseFilters } from '../types';
import { useCasesApi } from '../utils/api';
import { UseCaseCard } from '../components/UseCaseCard';
import { FilterPanel } from '../components/FilterPanel';
import { Pagination } from '../components/Pagination';
import { Layout } from '../components/Layout';

export function Dashboard() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<UseCaseFilters>({
    page: 1,
    limit: 12,
    sortBy: 'dateSubmitted',
    sortOrder: 'desc',
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchUseCases = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await useCasesApi.list(filters);
        setUseCases(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch use cases');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUseCases();
  }, [filters]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Calculate stats from current data
  const completedCount = useCases.filter(uc => uc.status === 'COMPLETED').length;
  const inProgressCount = useCases.filter(uc => uc.status === 'IN_PROGRESS').length;
  const approvedCount = useCases.filter(uc => uc.approvalStatus === 'APPROVED').length;

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-6 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">AI-Powered Use Case Catalog</h1>
                <p className="text-slate-400">Discover, track, and manage AI implementations across your organization</p>
              </div>
            </div>
            <a href="/submit" className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-all border border-white/10">
              <PlusCircle size={18} />
              New Use Case
            </a>
          </div>

          {/* Stats Row inside banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <LayoutGrid size={20} className="text-blue-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{total}</p>
                  <p className="text-xs text-slate-400">Total Use Cases</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{completedCount}</p>
                  <p className="text-xs text-slate-400">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/30 rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-amber-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{inProgressCount}</p>
                  <p className="text-xs text-slate-400">In Progress</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/30 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-cyan-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{approvedCount}</p>
                  <p className="text-xs text-slate-400">Approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FilterPanel filters={filters} onFilterChange={setFilters} />

      {error && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-xl mb-6 shadow-sm slide-in-from-bottom">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-rose-600" />
          </div>
          <span className="flex-1 font-medium">{error}</span>
          <button onClick={() => setError('')} className="p-2 hover:bg-rose-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 flex items-center justify-center shadow-xl shadow-blue-500/30 animate-glow">
              <Loader2 size={36} className="animate-spin text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center">
              <Sparkles size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="mt-8 text-slate-600 font-semibold">Loading use cases...</p>
          <p className="text-sm text-slate-400 mt-1">Fetching the latest data</p>
        </div>
      ) : useCases.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-2 border-dashed border-slate-200 p-16">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-slate-100/50 to-blue-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-400/30 rotate-3 hover:rotate-0 transition-transform">
              <FileText size={44} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No use cases found</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Try adjusting your filters or submit a new use case to get started with your AI catalog.
            </p>
            <a href="/submit" className="btn btn-primary inline-flex items-center gap-2">
              <Sparkles size={18} />
              Submit New Use Case
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {useCases.map((useCase, index) => (
              <div key={useCase.id} className="animate-in" style={{ animationDelay: `${index * 50}ms` }}>
                <UseCaseCard useCase={useCase} />
              </div>
            ))}
          </div>
          <Pagination
            page={filters.page || 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </Layout>
  );
}
