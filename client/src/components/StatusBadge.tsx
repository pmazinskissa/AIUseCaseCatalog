import { Clock, Loader2, CheckCircle2, PauseCircle, XCircle } from 'lucide-react';
import { Status, ApprovalStatus, STATUS_LABELS, APPROVAL_STATUS_LABELS } from '../types';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

interface ApprovalBadgeProps {
  status: ApprovalStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const styles: Record<Status, string> = {
    NEW: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const icons: Record<Status, React.ReactNode> = {
    NEW: <Clock size={12} />,
    IN_PROGRESS: <Loader2 size={12} className="animate-spin" />,
    COMPLETED: <CheckCircle2 size={12} />,
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${styles[status]} ${sizeClass}`}>
      {icons[status]}
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ApprovalBadge({ status, size = 'md' }: ApprovalBadgeProps) {
  const styles: Record<ApprovalStatus, string> = {
    PENDING_REVIEW: 'bg-slate-100 text-slate-600 border-slate-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const icons: Record<ApprovalStatus, React.ReactNode> = {
    PENDING_REVIEW: <Clock size={12} />,
    APPROVED: <CheckCircle2 size={12} />,
    ON_HOLD: <PauseCircle size={12} />,
    REJECTED: <XCircle size={12} />,
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${styles[status]} ${sizeClass}`}>
      {icons[status]}
      {APPROVAL_STATUS_LABELS[status]}
    </span>
  );
}
