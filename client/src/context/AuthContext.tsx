import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Group } from '../types';
import { authApi } from '../utils/api';

interface AuthContextType {
  user: User | null;
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isCommitteeOrAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserContext = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [meResponse, groupsResponse] = await Promise.all([
        authApi.me(),
        authApi.groups(),
      ]);

      if (meResponse.data) {
        setUser(meResponse.data);
      }
      if (groupsResponse.data) {
        setGroups(groupsResponse.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to authenticate';
      setError(message);
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserContext();
  }, []);

  const isCommitteeOrAdmin = user?.isCommittee ?? false;
  const isAdmin = user?.isAdmin ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        groups,
        isLoading,
        error,
        refetch: fetchUserContext,
        isCommitteeOrAdmin,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
