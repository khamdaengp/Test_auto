import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Play,
  Monitor,
  Smartphone,
  Webhook,
  Database,
  Layers,
  Plus,
  Pencil,
  Trash2,
  Search,
  Tag,
  Loader2,
  Sparkles,
  AlertTriangle,
  X,
  CheckCircle2,
  PanelRight,
  PanelBottom,
  BookOpen,
  Copy,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  FileSpreadsheet,
  Clock,
  Sliders,
  Cpu,
  RotateCcw,
  Square,
  Globe,
  ChevronDown,
  Video,
  Camera,
} from 'lucide-react';

export default function TestSuitesTable({
  suites = [],
  projects = [],
  onRunSuite,
  onStopRun,
  isRunning = false,
  runningSuiteId = null,
  onCreateSuite,
  onEditSuite,
  onDeleteSuite,
  onUseTemplate,
  onDuplicateSuite,
  selectedCategory,
  onSelectCategory,
  orientation = 'side',
  onToggleOrientation,
}) {
  const [scopeFilter, setScopeFilter] = useState('active'); // 'active' | 'examples'
  const [filterQuery, setFilterQuery] = useState('');
  const [localType, setLocalType] = useState('all');
  const [openOptionsSuiteId, setOpenOptionsSuiteId] = useState(null);
  const [runOptions, setRunOptions] = useState({
    environment: 'default',
    workers: 1,
    retries: 1,
    video: 'retain-on-failure', // 'off' | 'retain-on-failure' | 'on'
    screenshot: 'only-on-failure', // 'off' | 'only-on-failure' | 'on'
  });

  const handleOpenOptions = (suite) => {
    if (openOptionsSuiteId === suite.id) {
      setOpenOptionsSuiteId(null);
    } else {
      setRunOptions({
        environment: suite.environmentProfile || 'default',
        workers: suite.workersCount || 1,
        retries: suite.retryCount !== undefined && suite.retryCount !== null ? suite.retryCount : 1,
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
      });
      setOpenOptionsSuiteId(suite.id);
    }
  };

  const handleRunWithOptions = (suiteId) => {
    onRunSuite(suiteId, runOptions);
    setOpenOptionsSuiteId(null);
  };

  const selectedType = selectedCategory !== undefined ? selectedCategory : localType;
  const setSelectedType = onSelectCategory || setLocalType;

  // Split suites into User (Active) and Built-in System (Starter Examples / Help)
  const userSuites = suites.filter((s) => !s.isSystem);
  const exampleSuites = suites.filter((s) => s.isSystem);

  // Auto-switch to 'active' tab and clear search filter whenever user suites are added so new suite is visible immediately
  const prevUserSuitesLength = useRef(userSuites.length);
  useEffect(() => {
    if (userSuites.length > prevUserSuitesLength.current) {
      setScopeFilter('active');
      setFilterQuery('');
    }
    prevUserSuitesLength.current = userSuites.length;
  }, [userSuites.length]);

  const currentPool = scopeFilter === 'active' ? userSuites : exampleSuites;

  const filteredSuites = currentPool.filter((s) => {
    const matchesType = selectedType === 'all' || s.type === selectedType;
    const matchesQuery =
      s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(filterQuery.toLowerCase())));
    return matchesType && matchesQuery;
  });

  // Export Test Suites to Excel (.xlsx)
  const handleExportSuitesExcel = () => {
    if (filteredSuites.length === 0) return;
    const data = filteredSuites.map((s, idx) => ({
      'NO': idx + 1,
      'Suite ID': s.id || '',
      'Name': s.name || '',
      'Type': (s.type || '').toUpperCase(),
      'Target Project': projects.find((p) => p.id === s.projectId)?.name || s.projectId || 'Default',
      'Target URL': s.targetUrl || '',
      'Test File': s.testFile || '',
      'Tags': Array.isArray(s.tags) ? s.tags.join(', ') : (s.tags || ''),
      'Scope': s.isSystem ? 'Template Example' : 'Active Suite',
      'Description': s.description || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const colWidths = Object.keys(data[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || '').length)
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Suites Inventory');
    XLSX.writeFile(workbook, `qa_test_suites_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'e2e':
        return <Monitor className="w-3.5 h-3.5 text-blue-600" />;
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-purple-600" />;
      case 'api':
        return <Webhook className="w-3.5 h-3.5 text-emerald-600" />;
      case 'database':
        return <Database className="w-3.5 h-3.5 text-amber-600" />;
      case 'full':
        return <Layers className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Monitor className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'e2e':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {getTypeIcon(type)}
            <span>Desktop Web</span>
          </span>
        );
      case 'mobile':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            {getTypeIcon(type)}
            <span>Mobile Emulation</span>
          </span>
        );
      case 'api':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {getTypeIcon(type)}
            <span>API Request</span>
          </span>
        );
      case 'database':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            {getTypeIcon(type)}
            <span>Database</span>
          </span>
        );
      case 'full':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {getTypeIcon(type)}
            <span>Full Suite</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header & Main Actions */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {scopeFilter === 'active' ? 'Active Test Suites' : 'Starter Examples & Help'}
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {scopeFilter === 'active' ? `${userSuites.length} Active` : `${exampleSuites.length} Templates`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {scopeFilter === 'active'
              ? "Manage your project's custom Playwright test suites or run automated checks"
              : 'Pre-configured reference library and templates for Web, Mobile, API, and DB'}
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Layout Orientation Switcher */}
          {onToggleOrientation && (
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => orientation !== 'side' && onToggleOrientation()}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  orientation === 'side'
                    ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Split Side-by-Side Layout (Dock Right)"
              >
                <PanelRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => orientation !== 'bottom' && onToggleOrientation()}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  orientation === 'bottom'
                    ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Full-Width Stacked Layout (Dock Bottom)"
              >
                <PanelBottom className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Export Suites to Excel */}
          <button
            type="button"
            onClick={handleExportSuitesExcel}
            disabled={filteredSuites.length === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            title="Export test suites inventory to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Export Excel</span>
            <span className="md:hidden">Excel</span>
          </button>

          {/* Create Suite */}
          <button
            onClick={onCreateSuite}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>New Suite</span>
          </button>

          {/* Run All (Runs Active Suites on Active tab, Template Examples on Examples tab) */}
          <button
            onClick={() => {
              if (scopeFilter === 'active') {
                const targetFiles = filteredSuites.map((s) => s.testFile).filter(Boolean);
                onRunSuite('all-active', {
                  testFiles: targetFiles.length > 0 ? targetFiles : ['tests/custom'],
                  scope: 'active',
                });
              } else {
                onRunSuite('all-tests', { scope: 'examples' });
              }
            }}
            disabled={isRunning || (scopeFilter === 'active' && filteredSuites.length === 0)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={
              scopeFilter === 'active'
                ? filteredSuites.length === 0
                  ? 'No active test suites to run'
                  : `Run all ${filteredSuites.length} active test suites on this page`
                : 'Run all starter examples'
            }
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{scopeFilter === 'active' ? 'Run All Active' : 'Run All'}</span>
          </button>
        </div>
      </div>

      {/* Scope Switcher Tabs: Active Suites vs Starter Examples & Help */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-5 pt-2.5 gap-2">
        <button
          type="button"
          onClick={() => setScopeFilter('active')}
          className={`inline-flex items-center space-x-2 py-2 px-3.5 text-xs font-semibold rounded-t-lg transition border-t border-x cursor-pointer ${
            scopeFilter === 'active'
              ? 'bg-white text-indigo-700 border-slate-200 shadow-2xs -mb-px'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Active Test Suites</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              scopeFilter === 'active'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-slate-200/80 text-slate-600'
            }`}
          >
            {userSuites.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setScopeFilter('examples')}
          className={`inline-flex items-center space-x-2 py-2 px-3.5 text-xs font-semibold rounded-t-lg transition border-t border-x cursor-pointer ${
            scopeFilter === 'examples'
              ? 'bg-white text-indigo-700 border-slate-200 shadow-2xs -mb-px'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>Starter Examples & Help</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              scopeFilter === 'examples'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-slate-200/80 text-slate-600'
            }`}
          >
            {exampleSuites.length}
          </span>
        </button>
      </div>

      {/* Examples & Help Info Banner */}
      {scopeFilter === 'examples' && (
        <div className="mx-5 mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/90 via-indigo-50/40 to-slate-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-white border border-amber-300/80 text-amber-700 shadow-2xs flex-shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-xs text-slate-900">Starter Reference Suites & Help Library</h4>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                  Read-Only Templates
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                These built-in test suites illustrate Desktop Web, Mobile Emulation, REST API, and PostgreSQL testing patterns. Click <strong>Use as Template</strong> on any suite to clone its code into a new active suite for your target application.
              </p>
            </div>
          </div>
          <button
            onClick={() => setScopeFilter('active')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span>Go to Active Suites</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar (SaaS Standard) */}
      <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Suites', icon: Layers },
            { id: 'e2e', label: 'Desktop Web', icon: Monitor },
            { id: 'mobile', label: 'Mobile Emulation', icon: Smartphone },
            { id: 'api', label: 'API Request', icon: Webhook },
            { id: 'database', label: 'Database', icon: Database },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-white text-indigo-700 font-semibold shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search test catalog..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-semibold text-center w-14 text-slate-500">NO</th>
              <th className="py-3 px-5 font-semibold">Test Suite</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Target & Device</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Tags</th>
              <th className="py-3 px-5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSuites.length === 0 ? (
              scopeFilter === 'active' ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100 shadow-2xs">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {filterQuery
                        ? 'No test suites match your search'
                        : `No active ${selectedType !== 'all' ? selectedType.toUpperCase() : ''} test suites created yet`}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                      {filterQuery
                        ? 'Try clearing the search text or switching categories.'
                        : 'Create a new test suite for your project, or explore the pre-built reference templates to clone one.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                      {filterQuery ? (
                        <button
                          onClick={() => setFilterQuery('')}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Clear Search</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={onCreateSuite}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Test Suite</span>
                          </button>
                          <button
                            onClick={() => setScopeFilter('examples')}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span>View Starter Templates ({exampleSuites.length})</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 italic text-xs">
                    No starter templates found matching your search.
                  </td>
                </tr>
              )
            ) : (
              filteredSuites.map((suite, idx) => {
                const isCurrentRunning = isRunning && runningSuiteId === suite.id;

                return (
                  <tr key={suite.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400 text-xs w-14">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200/80 flex-shrink-0">
                          {getTypeIcon(suite.type)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                            <span>{suite.name}</span>
                            {!suite.isSystem && (
                              <span className="inline-flex items-center space-x-1 text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200 font-medium">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Custom</span>
                              </span>
                            )}
                            {suite.isSystem && (
                              <span className="inline-flex items-center space-x-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 font-medium">
                                <BookOpen className="w-2.5 h-2.5" />
                                <span>Template</span>
                              </span>
                            )}
                            {suite.id === 'failing-demo' && (
                              <span className="inline-flex items-center space-x-1 text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200 font-medium">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Failure Demo</span>
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                            {suite.description || 'No description provided'}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {suite.scheduleCron && (
                              <span
                                className={`inline-flex items-center space-x-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                  suite.isScheduledEnabled
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 font-semibold'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                                title={suite.isScheduledEnabled ? `Cron Active: ${suite.scheduleCron}` : `Cron Paused: ${suite.scheduleCron}`}
                              >
                                <Clock className="w-2.5 h-2.5" />
                                <span>{suite.scheduleCron}</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${suite.isScheduledEnabled ? 'bg-purple-600 animate-pulse' : 'bg-slate-400'}`} />
                              </span>
                            )}
                            {suite.environmentProfile && suite.environmentProfile !== 'default' && (
                              <span
                                className="inline-flex items-center space-x-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded uppercase bg-emerald-50 text-emerald-700 border border-emerald-200"
                                title={`Target Profile: ${suite.environmentProfile}`}
                              >
                                <span>{suite.environmentProfile}</span>
                              </span>
                            )}
                            {(suite.workersCount > 1 || suite.retryCount > 0) && (
                              <span
                                className="inline-flex items-center space-x-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                                title={`Workers: ${suite.workersCount || 1}, Retries: ${suite.retryCount || 0}`}
                              >
                                <Cpu className="w-2.5 h-2.5 text-slate-400" />
                                <span>{suite.workersCount || 1}w</span>
                                {suite.retryCount > 0 && <span>/{suite.retryCount}r</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getTypeBadge(suite.type)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell">
                      <div className="font-mono text-[11px] text-slate-800 truncate max-w-[200px]">
                        {suite.targetUrl || suite.testFile || 'Default Target'}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        {suite.projectId ? (
                          <span
                            className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                            title={`Linked Project ID: ${suite.projectId}`}
                          >
                            <Layers className="w-2.5 h-2.5 mr-1 text-indigo-500" />
                            <span>{projects.find((p) => p.id === suite.projectId)?.name || suite.projectId}</span>
                          </span>
                        ) : !suite.isSystem ? (
                          <span
                            className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200"
                            title="Global suite (not assigned to any specific project)"
                          >
                            Global
                          </span>
                        ) : null}
                        {suite.project && (
                          <span className="text-[10px] text-slate-400 font-medium font-mono">
                            {suite.project}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {suite.tags &&
                          suite.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 border border-slate-200 font-mono"
                            >
                              <Tag className="w-2.5 h-2.5 mr-1 text-slate-400" />
                              <span>{tag}</span>
                            </span>
                          ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* If in Examples scope: Offer 'Use as Template' */}
                        {scopeFilter === 'examples' ? (
                          <>
                            <button
                              onClick={() => (onUseTemplate ? onUseTemplate(suite) : onEditSuite(suite))}
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
                              title="Clone this example as a new custom test suite"
                            >
                              <Copy className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Use as Template</span>
                            </button>

                            {isCurrentRunning ? (
                              <button
                                onClick={() => onStopRun && onStopRun()}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 animate-pulse"
                                title="Stop this test run"
                              >
                                <Square className="w-3 h-3 fill-current text-rose-600" />
                                <span>Stop</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onRunSuite(suite.id)}
                                disabled={isRunning}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
                              >
                                <Play className="w-3 h-3 fill-current text-slate-500" />
                                <span>Run Demo</span>
                              </button>
                            )}
                          </>
                        ) : (
                          /* Active scope: Edit, Duplicate, Delete (if custom), Run */
                          <>
                            <button
                              onClick={() => onEditSuite(suite)}
                              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition shadow-2xs cursor-pointer"
                              title="Edit Suite and Code"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDuplicateSuite ? onDuplicateSuite(suite) : (onUseTemplate ? onUseTemplate(suite) : onEditSuite(suite))}
                              className="p-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-500 hover:text-indigo-600 transition shadow-2xs cursor-pointer"
                              title="Duplicate Suite"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {!suite.isSystem && (
                              <button
                                onClick={() => onDeleteSuite(suite)}
                                className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition shadow-2xs cursor-pointer"
                                title="Delete Suite"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <div className="inline-flex items-stretch h-8 rounded-lg shadow-2xs overflow-hidden border border-indigo-600/90 bg-indigo-600">
                              {isCurrentRunning ? (
                                <button
                                  onClick={() => onStopRun && onStopRun()}
                                  className="h-full px-3 flex items-center space-x-1.5 text-xs font-semibold transition cursor-pointer bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                                  title="Stop this test run"
                                >
                                  <Square className="w-3 h-3 fill-current" />
                                  <span>Stop</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => onRunSuite(suite.id)}
                                    disabled={isRunning}
                                    className="h-full px-3 flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    title="Run suite immediately with default configuration"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>Run</span>
                                  </button>

                                  <div className="w-[1px] h-4 self-center bg-indigo-400/50" />

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenOptions(suite);
                                    }}
                                    disabled={isRunning}
                                    className="h-full px-2 flex items-center justify-center text-indigo-100 hover:text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition cursor-pointer disabled:opacity-50"
                                    title="Run with options (Profile, Workers, Retries)"
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Helper Link for Active Suites */}
      {scopeFilter === 'active' && userSuites.length > 0 && (
        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span>Looking for Playwright boilerplate code, API test mocks, or DB test patterns?</span>
          </div>
          <button
            onClick={() => setScopeFilter('examples')}
            className="font-semibold text-indigo-600 hover:text-indigo-800 transition inline-flex items-center space-x-1 cursor-pointer whitespace-nowrap"
          >
            <span>View {exampleSuites.length} Starter Examples & Help</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Run with Options Modal Dialog (Fixed positioning to prevent clipping) */}
      {openOptionsSuiteId && (() => {
        const targetSuite = suites.find((s) => s.id === openOptionsSuiteId);
        if (!targetSuite) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => setOpenOptionsSuiteId(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-left flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs flex-shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-900">Run with Options</h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {targetSuite.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate max-w-[280px]">
                      {targetSuite.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenOptionsSuiteId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target Suite Info Pill */}
              <div className="px-6 pt-5 pb-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Globe className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-500 font-medium">Target URL:</span>
                    <span className="font-mono text-slate-800 font-semibold truncate">
                      {targetSuite.targetUrl || 'Default Configured URL'}
                    </span>
                  </div>
                  {targetSuite.project && (
                    <span className="ml-2 flex-shrink-0 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">
                      {targetSuite.project}
                    </span>
                  )}
                </div>
              </div>

              {/* Body Form */}
              <div className="px-6 py-4 space-y-4">
                {/* Environment Profile */}
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                    <span className="flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Environment Profile</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">Target host & base URL</span>
                  </label>
                  <select
                    value={runOptions.environment}
                    onChange={(e) => setRunOptions({ ...runOptions, environment: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
                  >
                    <option value="default">Default Target ({targetSuite.targetUrl || 'Configured Base URL'})</option>
                    <option value="dev">Local Development (http://localhost:5173)</option>
                    <option value="staging">Staging QA (https://staging.internal)</option>
                    <option value="prod">Production Verification (Live URL)</option>
                  </select>
                </div>

                {/* Parallel Workers - Segmented Tiles */}
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-2">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Parallel Workers</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { value: 1, label: '1 Worker', sub: 'Sequential / Safe' },
                      { value: 2, label: '2 Workers', sub: 'Balanced Speed' },
                      { value: 4, label: '4 Workers', sub: 'High Throughput' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRunOptions({ ...runOptions, workers: opt.value })}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          runOptions.workers === opt.value
                            ? 'bg-indigo-50/90 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500 shadow-2xs font-bold'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="text-xs">{opt.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-Retries on Failure - Segmented Tiles */}
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-2">
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Auto-Retries on Failure</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 0, label: '0 Retries', sub: 'Fail Fast' },
                      { value: 1, label: '1 Retry', sub: 'Standard' },
                      { value: 2, label: '2 Retries', sub: 'Flaky Guard' },
                      { value: 3, label: '3 Retries', sub: 'Resilient' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRunOptions({ ...runOptions, retries: opt.value })}
                        className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                          runOptions.retries === opt.value
                            ? 'bg-indigo-50/90 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500 shadow-2xs font-bold'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="text-xs">{opt.label}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 truncate">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Recording & Screenshot Capture */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Video Recording */}
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-2">
                      <Video className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Video Recording</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { value: 'off', label: 'Off', sub: 'Disabled' },
                        { value: 'retain-on-failure', label: 'On Fail', sub: 'Recommended' },
                        { value: 'on', label: 'Always', sub: 'Full Video' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRunOptions({ ...runOptions, video: opt.value })}
                          className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                            runOptions.video === opt.value
                              ? 'bg-indigo-50/90 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500 shadow-2xs font-bold'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                          }`}
                        >
                          <div className="text-xs">{opt.label}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5 truncate">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Screenshot Capture */}
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-2">
                      <Camera className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Screenshot Capture</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { value: 'off', label: 'Off', sub: 'Disabled' },
                        { value: 'only-on-failure', label: 'On Fail', sub: 'Recommended' },
                        { value: 'on', label: 'Always', sub: 'Every Step' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRunOptions({ ...runOptions, screenshot: opt.value })}
                          className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                            runOptions.screenshot === opt.value
                              ? 'bg-indigo-50/90 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500 shadow-2xs font-bold'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                          }`}
                        >
                          <div className="text-xs">{opt.label}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5 truncate">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Execution Plan Live Summary */}
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-indigo-950 font-medium">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>
                      Plan: <strong>{runOptions.workers} Worker(s)</strong> •{' '}
                      <strong>{runOptions.retries === 0 ? 'No retries' : `${runOptions.retries} retry attempt(s)`}</strong> •{' '}
                      Video: <strong>{runOptions.video === 'retain-on-failure' ? 'On Fail' : runOptions.video === 'on' ? 'Always' : 'Off'}</strong> •{' '}
                      Shot: <strong>{runOptions.screenshot === 'only-on-failure' ? 'On Fail' : runOptions.screenshot === 'on' ? 'Always' : 'Off'}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200 font-bold self-end sm:self-auto">
                    {runOptions.environment}
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setOpenOptionsSuiteId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRunWithOptions(targetSuite.id)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Suite</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
