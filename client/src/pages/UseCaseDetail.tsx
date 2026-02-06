import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Trash2,
  Star,
  User as UserIcon,
  Calendar,
  RefreshCw,
  Save,
  Wrench,
} from 'lucide-react';
import {
  UseCase,
  User,
  Tool,
  Status,
  ApprovalStatus,
  STATUS_LABELS,
  APPROVAL_STATUS_LABELS,
} from '../types';
import { useCasesApi, usersApi, toolsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { StatusBadge, ApprovalBadge } from '../components/StatusBadge';

export function UseCaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isCommitteeOrAdmin, isAdmin } = useAuth();
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [ownerCandidates, setOwnerCandidates] = useState<Pick<User, 'id' | 'name' | 'email' | 'role'>[]>([]);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);

  const [editData, setEditData] = useState({
    status: '' as Status | '',
    notes: '',
  });

  const [scoreData, setScoreData] = useState({
    businessImpact: undefined as number | undefined,
    feasibility: undefined as number | undefined,
    strategicAlignment: undefined as number | undefined,
    approvalStatus: '' as ApprovalStatus | '',
    ownerId: '' as string | '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await useCasesApi.get(id);
        if (response.data) {
          setUseCase(response.data);
          setEditData({
            status: response.data.status,
            notes: response.data.notes || '',
          });
          setScoreData({
            businessImpact: response.data.businessImpact ?? undefined,
            feasibility: response.data.feasibility ?? undefined,
            strategicAlignment: response.data.strategicAlignment ?? undefined,
            approvalStatus: response.data.approvalStatus,
            ownerId: response.data.ownerId || '',
            notes: response.data.notes || '',
          });
          setSelectedToolIds(response.data.tools?.map((t) => t.id) || []);
        }

        if (isCommitteeOrAdmin) {
          const [ownersResponse, toolsResponse] = await Promise.all([
            usersApi.getOwnerCandidates(),
            toolsApi.list({ limit: 100 }),
          ]);
          if (ownersResponse.data) {
            setOwnerCandidates(ownersResponse.data);
          }
          if (toolsResponse.data) {
            setAvailableTools(toolsResponse.data);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch use case');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isCommitteeOrAdmin]);

  const canEdit = useCase && (user?.id === useCase.submitterId || isCommitteeOrAdmin);

  const handleUpdateStatus = async () => {
    if (!id || !editData.status) return;
    setIsSaving(true);
    try {
      const response = await useCasesApi.update(id, {
        status: editData.status,
        notes: editData.notes || undefined,
      });
      if (response.data) {
        setUseCase(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScore = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await useCasesApi.score(id, {
        businessImpact: scoreData.businessImpact,
        feasibility: scoreData.feasibility,
        strategicAlignment: scoreData.strategicAlignment,
        approvalStatus: scoreData.approvalStatus || undefined,
        ownerId: scoreData.ownerId || null,
        notes: scoreData.notes || undefined,
      });
      if (response.data) {
        setUseCase(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to score');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this use case?')) return;
    try {
      await useCasesApi.delete(id);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleUpdateTools = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await useCasesApi.update(id, {
        toolIds: selectedToolIds,
      });
      if (response.data) {
        setUseCase(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tools');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={40} className="animate-spin text-blue-600 mb-3" />
          <span className="text-sm text-slate-500">Loading use case...</span>
        </div>
      </Layout>
    );
  }

  if (!useCase) {
    return (
      <Layout>
        <div className="text-center py-16 card max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Use case not found</h2>
          <p className="text-sm text-slate-500 mb-4">The use case you're looking for doesn't exist or has been deleted.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-slate-800">{useCase.name}</h1>
          </div>
          {isAdmin && (
            <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2">
              <Trash2 size={16} />
              Delete
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Details</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</label>
                  <p className="mt-1.5 text-slate-700 leading-relaxed">{useCase.description}</p>
                </div>
                {useCase.problemStatement && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Problem Statement</label>
                    <p className="mt-1.5 text-slate-700 leading-relaxed">{useCase.problemStatement}</p>
                  </div>
                )}
                {useCase.clientProject && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Client/Project</label>
                    <p className="mt-1.5 text-slate-700">{useCase.clientProject}</p>
                  </div>
                )}
                {useCase.notes && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Notes</label>
                    <p className="mt-1.5 text-slate-700 whitespace-pre-wrap">{useCase.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {canEdit && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw size={16} className="text-slate-400" />
                  <h2 className="text-base font-semibold text-slate-800">Update Status</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label">Status</label>
                    <select
                      className="input"
                      value={editData.status}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, status: e.target.value as Status }))
                      }
                    >
                      {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      className="input resize-none"
                      rows={3}
                      value={editData.notes}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, notes: e.target.value }))
                      }
                    />
                  </div>
                  <button
                    onClick={handleUpdateStatus}
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
                        Update
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {isCommitteeOrAdmin && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Scoring & Approval</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="label">Business Impact (1-5)</label>
                    <select
                      className="input"
                      value={scoreData.businessImpact || ''}
                      onChange={(e) =>
                        setScoreData((prev) => ({
                          ...prev,
                          businessImpact: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    >
                      <option value="">Select...</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Feasibility (1-5)</label>
                    <select
                      className="input"
                      value={scoreData.feasibility || ''}
                      onChange={(e) =>
                        setScoreData((prev) => ({
                          ...prev,
                          feasibility: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    >
                      <option value="">Select...</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Strategic Alignment (1-5)</label>
                    <select
                      className="input"
                      value={scoreData.strategicAlignment || ''}
                      onChange={(e) =>
                        setScoreData((prev) => ({
                          ...prev,
                          strategicAlignment: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    >
                      <option value="">Select...</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Approval Status</label>
                    <select
                      className="input"
                      value={scoreData.approvalStatus}
                      onChange={(e) =>
                        setScoreData((prev) => ({
                          ...prev,
                          approvalStatus: e.target.value as ApprovalStatus,
                        }))
                      }
                    >
                      {(Object.keys(APPROVAL_STATUS_LABELS) as ApprovalStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {APPROVAL_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Assign Owner</label>
                    <select
                      className="input"
                      value={scoreData.ownerId}
                      onChange={(e) =>
                        setScoreData((prev) => ({ ...prev, ownerId: e.target.value }))
                      }
                    >
                      <option value="">Unassigned</option>
                      {ownerCandidates.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={scoreData.notes}
                    onChange={(e) =>
                      setScoreData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>
                <button
                  onClick={handleScore}
                  disabled={isSaving}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Scoring'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Status</span>
                  <StatusBadge status={useCase.status} size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Approval</span>
                  <ApprovalBadge status={useCase.approvalStatus} size="sm" />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Star size={14} className="text-amber-500" />
                <h2 className="text-sm font-semibold text-slate-800">Scores</h2>
              </div>
              {useCase.compositeScore !== null && useCase.compositeScore !== undefined ? (
                <div className="space-y-3">
                  <div className="text-center py-3 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg mb-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {useCase.compositeScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Composite Score</div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Business Impact</span>
                    <span className="font-medium text-slate-700">{useCase.businessImpact || '-'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Feasibility</span>
                    <span className="font-medium text-slate-700">{useCase.feasibility || '-'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Strategic Alignment</span>
                    <span className="font-medium text-slate-700">{useCase.strategicAlignment || '-'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Not yet scored</p>
              )}
            </div>

            <div className="card p-5 overflow-hidden relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <Wrench size={14} className="text-white" />
                </div>
                <h2 className="text-sm font-semibold text-slate-800">AI Tools</h2>
              </div>
              {useCase.tools && useCase.tools.length > 0 ? (
                <div className="space-y-2">
                  {useCase.tools.map((tool, index) => {
                    const colors = ['from-blue-500 to-blue-600', 'from-slate-500 to-slate-600', 'from-cyan-500 to-blue-500'];
                    const bgColors = ['bg-blue-50 border-blue-100', 'bg-slate-50 border-slate-200', 'bg-cyan-50 border-cyan-100'];
                    const textColors = ['text-blue-700', 'text-slate-700', 'text-cyan-700'];
                    const color = colors[index % colors.length];
                    const bgColor = bgColors[index % bgColors.length];
                    const textColor = textColors[index % textColors.length];
                    return (
                      <div key={tool.id} className={`${bgColor} border rounded-lg px-3 py-2 flex items-center gap-2`}>
                        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                          <Wrench size={12} className="text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${textColor} truncate`}>{tool.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-2">
                    <Wrench size={18} className="text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400">No tools assigned</p>
                </div>
              )}
              {isCommitteeOrAdmin && availableTools.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Assign Tools</label>
                  <div className="border border-slate-200 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1 bg-slate-50">
                    {availableTools.map((tool) => (
                      <label key={tool.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded-md text-xs transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedToolIds.includes(tool.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedToolIds([...selectedToolIds, tool.id]);
                            } else {
                              setSelectedToolIds(selectedToolIds.filter((tid) => tid !== tool.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700">{tool.name}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={handleUpdateTools}
                    disabled={isSaving}
                    className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-lg text-xs font-medium shadow-sm hover:shadow-md disabled:opacity-50 transition-all"
                  >
                    {isSaving ? 'Saving...' : 'Update Tools'}
                  </button>
                </div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Info</h2>
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-2">
                  <UserIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block">Submitted by</span>
                    <p className="font-medium text-slate-700">{useCase.submitter.name || useCase.submitter.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block">Date Submitted</span>
                    <p className="font-medium text-slate-700">
                      {new Date(useCase.dateSubmitted).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {useCase.owner && (
                  <div className="flex items-start gap-2">
                    <UserIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-slate-500 block">Owner</span>
                      <p className="font-medium text-slate-700">{useCase.owner.name || useCase.owner.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <RefreshCw size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block">Last Updated</span>
                    <p className="font-medium text-slate-700">
                      {new Date(useCase.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
