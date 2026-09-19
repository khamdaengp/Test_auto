import React, { useState } from 'react';
import {
  X,
  Layers,
  Globe,
  Pencil,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function ProjectModal({
  isOpen,
  onClose,
  projects = [],
  selectedProjectId = 'all',
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}) {
  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    description: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      baseUrl: 'http://localhost:3000',
      description: '',
    });
    setError(null);
    setMode('create');
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name || '',
      baseUrl: proj.base_url || '',
      description: proj.description || '',
    });
    setError(null);
    setMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!formData.baseUrl.trim()) {
      setError('Base URL is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await onCreateProject({
          name: formData.name.trim(),
          baseUrl: formData.baseUrl.trim(),
          description: formData.description.trim(),
        });
      } else if (mode === 'edit' && editingProject) {
        await onUpdateProject(editingProject.id, {
          name: formData.name.trim(),
          baseUrl: formData.baseUrl.trim(),
          description: formData.description.trim(),
        });
      }
      setMode('list');
    } catch (err) {
      setError(err.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-['Inter',sans-serif]">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  {mode === 'create'
                    ? 'Register New Software Project'
                    : mode === 'edit'
                    ? `Edit Project: ${editingProject?.name}`
                    : 'Manage Software Projects & Workspaces'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {projects.length} Registered
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Configure separate software systems, targets, and test environments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition shadow-2xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Software Projects</h4>
                  <p className="text-[11px] text-slate-500">
                    Switch active workspace or manage connection URLs
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 italic">
                  No software projects found. Click "Add Project" to register your first system.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {projects.map((p) => {
                    const isSelected = selectedProjectId === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-200'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="text-xs font-bold text-slate-900">{p.name}</h5>
                            <span className="font-mono text-[10px] text-slate-400">({p.id})</span>
                            {isSelected && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Active Workspace</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-600">
                            <span className="flex items-center space-x-1 font-mono text-indigo-600">
                              <Globe className="w-3 h-3 text-indigo-500" />
                              <span>{p.base_url}</span>
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-slate-400">
                              Suites: <strong className="text-slate-700">{p.suite_count || 0}</strong>
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-slate-400">
                              Runs: <strong className="text-slate-700">{p.run_count || 0}</strong>
                            </span>
                          </div>
                          {p.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                          {!isSelected && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectProject(p.id);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer border border-slate-200"
                              title="Switch to this workspace"
                            >
                              <span>Switch</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-2xs cursor-pointer"
                            title="Edit Project Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProject(p)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition shadow-2xs cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project / System Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Customer CRM System"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Application URL <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="http://localhost:8080"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional brief description of what this software does..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  Back to List
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{mode === 'create' ? 'Create Project' : 'Update Project'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {mode === 'list'
              ? 'Select any workspace to isolate test suites, runs, and KPI reports.'
              : 'Enter valid project name and base URL to connect Playwright tests.'}
          </div>
          {mode === 'list' && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
