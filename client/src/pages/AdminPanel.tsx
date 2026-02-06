import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Pencil, Trash2, Save, X, Users, Shield, UserCheck, Sparkles } from 'lucide-react';
import { User, Role } from '../types';
import { usersApi } from '../utils/api';
import { Layout } from '../components/Layout';

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    email: '',
    name: '',
    role: 'SUBMITTER' as Role,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.list({ limit: 100 });
      setUsers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    setError('');
    try {
      await usersApi.update(editingUser.id, {
        email: editForm.email !== editingUser.email ? editForm.email : undefined,
        name: editForm.name !== editingUser.name ? editForm.name : undefined,
        role: editForm.role !== editingUser.role ? editForm.role : undefined,
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.delete(userId);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      name: user.name || '',
      role: user.role,
    });
  };

  const getRoleBadgeStyles = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-slate-700 text-white border-slate-600';
      case 'COMMITTEE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield size={12} />;
      case 'COMMITTEE':
        return <UserCheck size={12} />;
      default:
        return <Users size={12} />;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header Stats */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Users size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium">Total Users</p>
                  <p className="text-4xl font-bold text-white">{users.length}</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm bg-white/10 px-4 py-2 rounded-lg">
                <Sparkles size={16} />
                <span>Role Management</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-sm text-slate-600">
            Users are automatically created when they first log in via SSO.
            You can manage their roles here.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {editingUser && (
          <div className="card p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    className="input"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    required
                    className="input"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Role</label>
                  <select
                    className="input"
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, role: e.target.value as Role }))
                    }
                  >
                    <option value="SUBMITTER">Submitter</option>
                    <option value="COMMITTEE">Committee</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Note: Role can also be configured via ADMIN_EMAILS and COMMITTEE_EMAILS environment variables.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={40} className="animate-spin text-blue-600 mb-3" />
            <span className="text-sm text-slate-500">Loading users...</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200/80">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Use Cases
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                          {(user.name || user.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">{user.name || '(No name)'}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getRoleBadgeStyles(user.role)}`}
                      >
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                          {user._count?.submittedUseCases || 0} submitted
                        </span>
                        {user._count?.ownedUseCases ? (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                            {user._count.ownedUseCases} owned
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => startEditing(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-lg mr-2 transition-all"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
