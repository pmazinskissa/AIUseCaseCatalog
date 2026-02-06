export type Role = 'SUBMITTER' | 'COMMITTEE' | 'ADMIN';
export type Status = 'NEW' | 'IN_PROGRESS' | 'COMPLETED';
export type ApprovalStatus = 'PENDING_REVIEW' | 'APPROVED' | 'ON_HOLD' | 'REJECTED';
export type VisibilityScope = 'PRIVATE' | 'GROUP' | 'GENERAL';

export interface Group {
  id: string;
  name: string;
  slug: string;
}

export interface Tool {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isAdmin: boolean;
  isCommittee: boolean;
  groups: Group[];
  createdAt?: string;
  _count?: {
    submittedUseCases: number;
    ownedUseCases: number;
  };
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  problemStatement?: string;
  clientProject?: string;
  submitterId: string;
  submitter: Pick<User, 'id' | 'name' | 'email'>;
  dateSubmitted: string;
  businessImpact?: number;
  feasibility?: number;
  strategicAlignment?: number;
  compositeScore?: number;
  status: Status;
  approvalStatus: ApprovalStatus;
  visibilityScope: VisibilityScope;
  ownerId?: string;
  owner?: Pick<User, 'id' | 'name' | 'email'>;
  notes?: string;
  tools?: Tool[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UseCaseFilters {
  search?: string;
  status?: Status;
  approvalStatus?: ApprovalStatus;
  sortBy?: 'dateSubmitted' | 'compositeScore' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const STATUS_LABELS: Record<Status, string> = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  ON_HOLD: 'On Hold',
  REJECTED: 'Rejected',
};
