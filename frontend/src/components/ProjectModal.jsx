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
  Key,
  Database,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Copy,
  Download,
} from 'lucide-react';
import { fetchDefaultEnv } from '../services/api';

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
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'env'
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    description: '',
  });
  const [envRows, setEnvRows] = useState([]); // [{ id, key, value, showValue }]
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Convert an object of env_vars to an array of rows
  const objectToEnvRows = (envObj) => {
    if (!envObj || typeof envObj !== 'object') return [];
    return Object.entries(envObj).map(([k, v], idx) => ({
      id: `env-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      key: k,
      value: typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''),
      showValue: false,
    }));
  };

  // Convert array of rows back to object
  const envRowsToObject = (rows) => {
    const obj = {};
    for (const r of rows) {
      const trimmedKey = (r.key || '').trim();
      if (trimmedKey) {
        obj[trimmedKey] = r.value ?? '';
      }
    }
    return obj;
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      baseUrl: 'http://localhost:3000',
      description: '',
    });
    setEnvRows([]);
    setActiveTab('general');
    setError(null);
    setMode('create');
  };

  const handleOpenEdit = (proj, initialTab = 'general') => {
    setEditingProject(proj);
    setFormData({
      name: proj.name || '',
      baseUrl: proj.base_url || '',
      description: proj.description || '',
    });
    setEnvRows(objectToEnvRows(proj.env_vars));
    setActiveTab(initialTab);
    setError(null);
    setMode('edit');
  };

  // Row Manipulation
  const handleAddEnvRow = (presetKey = '', presetValue = '') => {
    setEnvRows((prev) => [
      ...prev,
      {
        id: `env-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        key: presetKey,
        value: presetValue,
        showValue: false,
      },
    ]);
  };

  const handleUpdateEnvRow = (id, field, value) => {
    setEnvRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleRemoveEnvRow = (id) => {
    setEnvRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Quick Preset Handlers
  const handleApplyApiPresets = () => {
    const defaultBaseUrl = formData.baseUrl || 'http://10.120.44.76:8500';
    const presets = [
      { key: 'BASE_URL', value: defaultBaseUrl },
      { key: 'API_BASE_URL', value: defaultBaseUrl },
      { key: 'API_TOKEN', value: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYmNjc3xCQ0NTM19GVUxMIiwidXNlcm5hbWUiOiJtYmNjc3xCQ0NTM19GVUxMIiwiaXNzIjoibWJjY3MtY2xpZW50IiwiaWF0IjoxNzkwMDc1Njc4LCJleHAiOjE3OTAxNjIwNzh9.LoXhiBoQIZ_JIPjxUbdwb1qrpRRb6Ce3-Jhs6MvMSKw' },
      { key: 'API_SESSION_ID', value: 'de4e7258-5c79-4ac3-8eba-54158a430174' },
      { key: 'API_USERNAME', value: 'BCCS3_FULL' },
      { key: 'API_PASSWORD', value: '654321a@' },
    ];

    setEnvRows((prev) => {
      const existingKeys = new Set(prev.map((r) => r.key.trim()));
      const newItems = presets
        .filter((p) => !existingKeys.has(p.key))
        .map((p) => ({
          id: `env-${Date.now()}-${p.key}`,
          key: p.key,
          value: p.value,
          showValue: false,
        }));
      return [...prev, ...newItems];
    });
  };

  const [isImporting, setIsImporting] = useState(false);

  const handleImportFromEnv = async () => {
    try {
      setIsImporting(true);
      const defaults = await fetchDefaultEnv();
      const defaultRows = Object.entries(defaults).map(([k, v], idx) => ({
        id: `env-${idx}-${Date.now()}-${k}`,
        key: k,
        value: typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''),
        showValue: false,
      }));

      setEnvRows((prev) => {
        const existingKeys = new Set(prev.map((r) => r.key.trim()));
        const newItems = defaultRows.filter((r) => !existingKeys.has(r.key.trim()));
        return [...prev, ...newItems];
      });
    } catch (err) {
      setError('Failed to import default .env: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleApplyMariaDbPresets = () => {
    const presets = [
      { key: 'MARIADB_HOST', value: '10.120.254.144' },
      { key: 'MARIADB_PORT', value: '3306' },
      { key: 'MARIADB_USER', value: 'bccs3_stl' },
      { key: 'MARIADB_PASSWORD', value: 'bCcs3#St1' },
      { key: 'MARIADB_DATABASE', value: 'bccs3_vsa_la' },
    ];

    setEnvRows((prev) => {
      const existingKeys = new Set(prev.map((r) => r.key.trim()));
      const newItems = presets
        .filter((p) => !existingKeys.has(p.key))
        .map((p) => ({
          id: `env-${Date.now()}-${p.key}`,
          key: p.key,
          value: p.value,
          showValue: false,
        }));
      return [...prev, ...newItems];
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Project name is required');
      setActiveTab('general');
      return;
    }
    if (!formData.baseUrl.trim()) {
      setError('Base URL is required');
      setActiveTab('general');
      return;
    }

    const envObject = envRowsToObject(envRows);

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await onCreateProject({
          name: formData.name.trim(),
          baseUrl: formData.baseUrl.trim(),
          description: formData.description.trim(),
          env_vars: envObject,
        });
      } else if (mode === 'edit' && editingProject) {
        await onUpdateProject(editingProject.id, {
          name: formData.name.trim(),
          baseUrl: formData.baseUrl.trim(),
          description: formData.description.trim(),
          env_vars: envObject,
        });
      }
      setMode('list');
    } catch (err) {
      setError(err.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const configuredEnvCount = envRows.filter((r) => (r.key || '').trim().length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-['Inter',sans-serif]">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
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
                Configure isolated software systems, targets, and project-specific environment variables
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

          {/* LIST MODE */}
          {mode === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Software Projects</h4>
                  <p className="text-[11px] text-slate-500">
                    Switch active workspace or manage connection URLs and environment variables
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
                    const envVarKeys = p.env_vars && typeof p.env_vars === 'object' ? Object.keys(p.env_vars) : [];
                    const envCount = envVarKeys.length;

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
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h5 className="text-xs font-bold text-slate-900">{p.name}</h5>
                            <span className="font-mono text-[10px] text-slate-400">({p.id})</span>
                            {isSelected && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Active Workspace</span>
                              </span>
                            )}
                            {envCount > 0 ? (
                              <span
                                className="inline-flex items-center space-x-1 px-2 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-semibold"
                                title={`Configured Environment: ${envVarKeys.join(', ')}`}
                              >
                                <Key className="w-2.5 h-2.5 text-blue-600" />
                                <span>{envCount} Env Vars</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.2 rounded-md bg-slate-100 text-slate-400 border border-slate-200 text-[10px] font-mono">
                                <span>Default Env</span>
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

                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-wrap">
                          {/* 1-Tap Dedicated Set Env Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p, 'env')}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border border-blue-200 shadow-2xs"
                            title="Configure environment variables isolated strictly to this project"
                          >
                            <Key className="w-3.5 h-3.5 text-blue-600" />
                            <span>Set Env</span>
                          </button>

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
                            onClick={() => handleOpenEdit(p, 'general')}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-2xs cursor-pointer"
                            title="Edit Project General Details"
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

          {/* CREATE / EDIT MODE WITH TABS */}
          {(mode === 'create' || mode === 'edit') && (
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex items-center space-x-1 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                    activeTab === 'general'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>General Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('env')}
                  className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                    activeTab === 'env'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Environment (.env) Variables</span>
                  {configuredEnvCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-mono font-bold">
                      {configuredEnvCount}
                    </span>
                  )}
                </button>
              </div>

              {/* TAB 1: GENERAL SETTINGS */}
              {activeTab === 'general' && (
                <form onSubmit={handleSave} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Project / System Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. MBCCS BCCS3 Core System"
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
                      placeholder="http://10.120.44.76:8441"
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
                      placeholder="Brief description of what this software system does..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                </form>
              )}

              {/* TAB 2: ENVIRONMENT VARIABLES (ISOLATED PER PROJECT) */}
              {activeTab === 'env' && (
                <div className="space-y-4 pt-1">
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                    <div className="font-semibold flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-blue-600" />
                      <span>Project-Specific Environment Isolation</span>
                    </div>
                    <p className="text-[11px] text-blue-700">
                      These environment variables apply strictly to this project. When executing tests in this project, these values automatically override the global .env file without affecting other projects.
                    </p>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <button
                        type="button"
                        onClick={handleApplyApiPresets}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                      >
                        <Globe className="w-3 h-3 text-indigo-600" />
                        <span>+ Add BCCS3 API Presets</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleApplyMariaDbPresets}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                      >
                        <Database className="w-3 h-3 text-emerald-600" />
                        <span>+ Add MariaDB Presets</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleImportFromEnv}
                        disabled={isImporting}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                        title="Import all variables directly from root .env file"
                      >
                        {isImporting ? (
                          <Loader2 className="w-3 h-3 animate-spin text-amber-700" />
                        ) : (
                          <Download className="w-3 h-3 text-amber-700" />
                        )}
                        <span>Import from .env</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddEnvRow('', '')}
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Variable</span>
                    </button>
                  </div>

                  {/* Variables Table / List */}
                  {envRows.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                      <Key className="w-6 h-6 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">
                        No project environment variables configured yet.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Click presets above or "+ Add Variable" to specify project-specific tokens, endpoints, and credentials.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {envRows.map((row, index) => (
                        <div
                          key={row.id}
                          className="flex items-center space-x-2 p-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg transition"
                        >
                          <span className="text-[10px] font-mono text-slate-400 w-5 text-center">
                            {index + 1}
                          </span>

                          {/* Key Input */}
                          <div className="w-1/3 min-w-[140px]">
                            <input
                              type="text"
                              value={row.key}
                              onChange={(e) =>
                                handleUpdateEnvRow(
                                  row.id,
                                  'key',
                                  e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '')
                                )
                              }
                              placeholder="VARIABLE_NAME"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Equal sign */}
                          <span className="text-xs font-mono text-slate-400">=</span>

                          {/* Value Input */}
                          <div className="flex-1 relative">
                            <input
                              type={row.showValue ? 'text' : 'password'}
                              value={row.value}
                              onChange={(e) => handleUpdateEnvRow(row.id, 'value', e.target.value)}
                              placeholder="Value (e.g. secret token, host IP, or port)"
                              className="w-full pl-2.5 pr-8 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateEnvRow(row.id, 'showValue', !row.showValue)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                              title={row.showValue ? 'Mask secret' : 'Reveal secret'}
                            >
                              {row.showValue ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveEnvRow(row.id)}
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Remove variable"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  Back to List
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSave}
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
                        <span>{mode === 'create' ? 'Create Project' : 'Save Changes'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {mode === 'list'
              ? 'Select any workspace to isolate test suites, runs, and KPI reports.'
              : activeTab === 'general'
              ? 'General information and target base URL for this software project.'
              : 'Environment variables configured here override the global .env only when tests in this project run.'}
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
