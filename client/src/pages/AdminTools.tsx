import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Plus, Pencil, Trash2, X, Save, Wrench, Sparkles, Bot } from 'lucide-react';
import { Tool } from '../types';
import { toolsApi } from '../utils/api';
import { Layout } from '../components/Layout';

export function AdminTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const response = await toolsApi.list({ limit: 100 });
      if (response.data) {
        setTools(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tools');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleOpenForm = (tool?: Tool) => {
    if (tool) {
      setEditingTool(tool);
      setFormData({
        name: tool.name,
        description: tool.description || '',
      });
    } else {
      setEditingTool(null);
      setFormData({ name: '', description: '' });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTool(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      if (editingTool) {
        const response = await toolsApi.update(editingTool.id, {
          name: formData.name,
          description: formData.description || undefined,
        });
        if (response.data) {
          setTools(tools.map((t) => (t.id === editingTool.id ? response.data! : t)));
        }
      } else {
        const response = await toolsApi.create({
          name: formData.name,
          description: formData.description || undefined,
        });
        if (response.data) {
          setTools([...tools, response.data]);
        }
      }
      handleCloseForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tool');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (tool: Tool) => {
    if (!confirm(`Are you sure you want to delete "${tool.name}"?`)) return;

    try {
      await toolsApi.delete(tool.id);
      setTools(tools.filter((t) => t.id !== tool.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tool');
    }
  };

  // Tool icon colors - cycle through these for variety (blue/grey theme)
  const toolColors = [
    'from-blue-500 to-blue-600',
    'from-slate-500 to-slate-600',
    'from-sky-500 to-blue-600',
    'from-blue-600 to-indigo-600',
    'from-slate-600 to-slate-700',
    'from-cyan-500 to-blue-500',
  ];

  const getToolColor = (index: number) => toolColors[index % toolColors.length];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Loader2 size={28} className="animate-spin text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-md flex items-center justify-center">
              <Sparkles size={14} className="text-blue-500" />
            </div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Loading AI tools...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-xl mb-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} className="text-rose-600" />
            </div>
            <span className="flex-1 font-medium">{error}</span>
            <button
              onClick={() => setError('')}
              className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Bot size={22} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">AI Tools</h1>
            </div>
            <p className="text-slate-500 sm:ml-[52px]">
              Manage the AI tools available for use case assignments
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="group relative px-5 py-2.5 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            Add Tool
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={handleCloseForm}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-slate-700 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      {editingTool ? <Pencil size={20} className="text-white" /> : <Wrench size={20} className="text-white" />}
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      {editingTool ? 'Edit Tool' : 'Add New Tool'}
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseForm}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Tool Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    maxLength={200}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., ChatGPT, GitHub Copilot, Claude"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the tool and its capabilities..."
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {editingTool ? 'Update Tool' : 'Create Tool'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Empty State */}
        {tools.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-200 p-12">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-slate-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30 rotate-3 hover:rotate-0 transition-transform duration-300">
                <Wrench size={36} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">No AI Tools Yet</h2>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                Get started by adding your first AI tool. Tools can be assigned to use cases to track which AI technologies are being used.
              </p>
              <button
                onClick={() => handleOpenForm()}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
                Add Your First Tool
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl p-6 mb-6 shadow-lg shadow-blue-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Total AI Tools</p>
                    <p className="text-3xl font-bold text-white">{tools.length}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-white/70 text-sm">
                  <Bot size={16} />
                  <span>Ready for assignment</span>
                </div>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, index) => (
                <div
                  key={tool.id}
                  className="group relative bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Tool Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getToolColor(index)} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <Wrench size={22} className="text-white" />
                  </div>

                  {/* Tool Info */}
                  <h3 className="text-lg font-semibold text-slate-800 mb-1 pr-16">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
                    {tool.description || 'No description provided'}
                  </p>

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenForm(tool)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(tool)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getToolColor(index)} rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
