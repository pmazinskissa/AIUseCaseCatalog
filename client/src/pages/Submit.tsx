import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Send, X, Wrench, Check, FileText, Sparkles } from 'lucide-react';
import { Tool } from '../types';
import { useCasesApi, toolsApi } from '../utils/api';
import { Layout } from '../components/Layout';

export function Submit() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    problemStatement: '',
    clientProject: '',
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await toolsApi.list({ limit: 100 });
        if (response.data) {
          setAvailableTools(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch tools:', err);
      }
    };
    fetchTools();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await useCasesApi.create({
        name: formData.name,
        description: formData.description,
        problemStatement: formData.problemStatement || undefined,
        clientProject: formData.clientProject || undefined,
        toolIds: selectedToolIds.length > 0 ? selectedToolIds : undefined,
      });

      if (response.data) {
        navigate(`/use-case/${response.data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit use case');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Submit New Use Case</h1>
              <p className="text-sm text-slate-500">Share your AI use case with the catalog</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {error && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-rose-50 to-red-50 border-b border-rose-200 text-rose-700 px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={16} className="text-rose-600" />
              </div>
              <span className="flex-1 text-sm font-medium">{error}</span>
              <button type="button" onClick={() => setError('')} className="p-1 hover:bg-rose-100 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="p-6 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Use Case Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                maxLength={200}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter a descriptive name for your use case"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the AI use case in detail..."
              />
            </div>

            {availableTools.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Wrench size={14} className="text-blue-500" />
                  AI Tools
                </label>
                <div className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                    {availableTools.map((tool, index) => {
                      const isSelected = selectedToolIds.includes(tool.id);
                      const colors = ['from-blue-500 to-blue-600', 'from-slate-500 to-slate-600', 'from-cyan-500 to-blue-500', 'from-slate-600 to-slate-700'];
                      const color = colors[index % colors.length];
                      return (
                        <label
                          key={tool.id}
                          className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-white shadow-md border-2 border-blue-400'
                              : 'bg-white border-2 border-transparent hover:border-slate-200 hover:shadow-sm'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedToolIds([...selectedToolIds, tool.id]);
                              } else {
                                setSelectedToolIds(selectedToolIds.filter((id) => id !== tool.id));
                              }
                            }}
                            className="sr-only"
                          />
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <Wrench size={16} className="text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-slate-800 block truncate">{tool.name}</span>
                            {tool.description && (
                              <p className="text-xs text-slate-500 truncate">{tool.description}</p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
                {selectedToolIds.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex -space-x-1">
                      {selectedToolIds.slice(0, 3).map((_, i) => {
                        const colors = ['bg-blue-500', 'bg-slate-500', 'bg-cyan-500'];
                        return (
                          <div key={i} className={`w-5 h-5 rounded-full ${colors[i % colors.length]} border-2 border-white`} />
                        );
                      })}
                    </div>
                    <span className="text-xs font-medium text-blue-600">
                      {selectedToolIds.length} tool{selectedToolIds.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="problemStatement" className="block text-sm font-semibold text-slate-700 mb-2">
                Problem Statement
              </label>
              <textarea
                id="problemStatement"
                name="problemStatement"
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                value={formData.problemStatement}
                onChange={handleChange}
                placeholder="What problem does this use case solve?"
              />
            </div>

            <div>
              <label htmlFor="clientProject" className="block text-sm font-semibold text-slate-700 mb-2">
                Client/Project Reference
              </label>
              <input
                type="text"
                id="clientProject"
                name="clientProject"
                maxLength={200}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                value={formData.clientProject}
                onChange={handleChange}
                placeholder="Optional: Associated client or project"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Use Case
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white text-slate-700 rounded-xl font-medium border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
