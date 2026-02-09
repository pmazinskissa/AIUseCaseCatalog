import { ApiResponse, PaginatedResponse, UseCase, User, UseCaseFilters, Group, Tool } from '../types';

const API_BASE = '/api';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data: unknown;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    data = text;
  }

  if (!response.ok) {
    const errorData = data as { error?: string };
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const authApi = {
  me: () => fetchApi<ApiResponse<User>>('/me'),
  groups: () => fetchApi<ApiResponse<Group[]>>('/groups'),
};

export const useCasesApi = {
  list: (filters: UseCaseFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    return fetchApi<PaginatedResponse<UseCase>>(`/use-cases?${params.toString()}`);
  },

  get: (id: string) => fetchApi<ApiResponse<UseCase>>(`/use-cases/${id}`),

  create: (data: {
    name: string;
    description: string;
    problemStatement?: string;
    clientProject?: string;
    toolIds?: string[];
  }) =>
    fetchApi<ApiResponse<UseCase>>('/use-cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      problemStatement?: string;
      clientProject?: string;
      status?: string;
      notes?: string;
      toolIds?: string[];
    }
  ) =>
    fetchApi<ApiResponse<UseCase>>(`/use-cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  score: (
    id: string,
    data: {
      businessImpact?: number;
      feasibility?: number;
      strategicAlignment?: number;
      approvalStatus?: string;
      ownerId?: string | null;
      notes?: string;
    }
  ) =>
    fetchApi<ApiResponse<UseCase>>(`/use-cases/${id}/score`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/use-cases/${id}`, {
      method: 'DELETE',
    }),
};

export const usersApi = {
  list: (filters: { search?: string; role?: string; page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    return fetchApi<PaginatedResponse<User>>(`/users?${params.toString()}`);
  },

  get: (id: string) => fetchApi<ApiResponse<User>>(`/users/${id}`),

  update: (
    id: string,
    data: { email?: string; name?: string; role?: string }
  ) =>
    fetchApi<ApiResponse<User>>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/users/${id}`, {
      method: 'DELETE',
    }),

  getOwnerCandidates: () =>
    fetchApi<ApiResponse<Pick<User, 'id' | 'name' | 'email' | 'role'>[]>>('/users/owner-candidates'),
};

export const groupsApi = {
  list: () => fetchApi<ApiResponse<Group[]>>('/groups'),

  create: (data: { name: string; slug: string }) =>
    fetchApi<ApiResponse<Group>>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/groups/${id}`, {
      method: 'DELETE',
    }),

  addMember: (groupId: string, userId: string) =>
    fetchApi<ApiResponse<{ id: string }>>('/groups/members', {
      method: 'POST',
      body: JSON.stringify({ groupId, userId }),
    }),

  removeMember: (groupId: string, userId: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    }),
};

export const toolsApi = {
  list: (filters: { search?: string; page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    return fetchApi<PaginatedResponse<Tool>>(`/tools?${params.toString()}`);
  },

  get: (id: string) => fetchApi<ApiResponse<Tool>>(`/tools/${id}`),

  create: (data: { name: string; description?: string }) =>
    fetchApi<ApiResponse<Tool>>('/tools', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; description?: string }) =>
    fetchApi<ApiResponse<Tool>>(`/tools/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/tools/${id}`, {
      method: 'DELETE',
    }),
};
