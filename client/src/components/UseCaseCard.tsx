import { Link } from 'react-router-dom';
import { Star, User, Calendar, ArrowRight } from 'lucide-react';
import { UseCase } from '../types';
import { StatusBadge, ApprovalBadge } from './StatusBadge';

interface UseCaseCardProps {
  useCase: UseCase;
}

export function UseCaseCard({ useCase }: UseCaseCardProps) {
  return (
    <Link
      to={`/use-case/${useCase.id}`}
      className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 block overflow-hidden"
    >
      {/* Decorative gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Accent line on top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors pr-4 flex-1">
            {useCase.name}
          </h3>
          {useCase.compositeScore !== null && useCase.compositeScore !== undefined && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-1 rounded-lg border border-amber-200/50 shadow-sm flex-shrink-0">
              <Star size={14} fill="currentColor" />
              <span className="font-bold text-sm">{useCase.compositeScore.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{useCase.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={useCase.status} size="sm" />
          <ApprovalBadge status={useCase.approvalStatus} size="sm" />
          {useCase.tools && useCase.tools.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-slate-50 text-blue-700 border border-blue-200/50">
              <span className="flex -space-x-1">
                {useCase.tools.slice(0, 3).map((_, i) => {
                  const colors = ['bg-blue-500', 'bg-slate-500', 'bg-cyan-500'];
                  return <span key={i} className={`w-3 h-3 rounded-full ${colors[i]} border border-white`} />;
                })}
              </span>
              {useCase.tools.length} tool{useCase.tools.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <User size={12} className="text-slate-500" />
            </div>
            <span className="text-slate-500 font-medium">{useCase.submitter.name}</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Calendar size={12} />
            {new Date(useCase.dateSubmitted).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* View indicator */}
      <div className="absolute bottom-5 right-5 w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-lg group-hover:shadow-blue-500/30">
        <ArrowRight size={16} className="text-slate-400 group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}
