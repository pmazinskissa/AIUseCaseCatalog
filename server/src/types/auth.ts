export interface AuthContext {
  userId: string;
  email: string;
  role: 'SUBMITTER' | 'COMMITTEE' | 'ADMIN';
  isAdmin: boolean;
  isCommittee: boolean;
  groupIds: string[];
  groupSlugs: string[];
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}
