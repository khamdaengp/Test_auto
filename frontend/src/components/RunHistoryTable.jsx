import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  History,
  Calendar,
  Eye,
  Loader2,
  X,
  Layers,
  Download,
  FileSpreadsheet,
  FileCode,
  Video,
  Camera,
  Filter,
  Monitor,
  Smartphone,
  Webhook,
  Database,
  RotateCcw,
  Trash2,
} from 'lucide-react';

export default function RunHistoryTable({
  runs = [],
  onSelectRun,
  onRunSuite,
  onClearHistory,
  onDeleteRun,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter runs based on search, status, category, and date
  const filteredRuns = useMemo(() => {
    const now = new Date();

    return runs.filter((run) => {
      // 1. Text search
      const matchesSearch =
        !searchTerm ||
        run.suite_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.id?.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Status filter
      const matchesStatus =
        statusFilter === 'all' || run.status?.toLowerCase() === statusFilter.toLowerCase();

      // 3. Category filter
      const matchesCategory =
        categoryFilter === 'all' || run.type?.toLowerCase() === categoryFilter.toLowerCase();

      // 4. Date filter
      let matchesDate = true;
      if (dateFilter !== 'all' && run.created_at) {
        const runDate = new Date(run.created_at);
        const diffHours = (now - runDate) / (1000 * 60 * 60);

        if (dateFilter === 'today') {
          matchesDate = diffHours <= 24;
        } else if (dateFilter === 'yesterday') {
          matchesDate = diffHours > 24 && diffHours <= 48;
        } else if (dateFilter === '7days') {
          matchesDate = diffHours <= 24 * 7;
        } else if (dateFilter === '30days') {
          matchesDate = diffHours <= 24 * 30;
        }
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });
  }, [runs, searchTerm, statusFilter, categoryFilter, dateFilter]);

  // Reset pagination on filter change
  const totalPages = Math.max(1, Math.ceil(filteredRuns.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedRuns = useMemo(() => {
    const startIndex = (effectivePage - 1) * pageSize;
    return filteredRuns.slice(startIndex, startIndex + pageSize);
  }, [filteredRuns, effectivePage, pageSize]);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: runs.length,
      passed: runs.filter((r) => r.status === 'passed').length,
      failed: runs.filter((r) => r.status === 'failed').length,
      running: runs.filter((r) => r.status === 'running').length,
    };
  }, [runs]);

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (filteredRuns.length === 0) return;

    const data = filteredRuns.map((r) => ({
      'Run ID': r.id || '',
      'Suite Name': r.suite_name || '',
      'Type': (r.type || '').toUpperCase(),
      'Status': (r.status || '').toUpperCase(),
      'Passed Tests': r.passed_tests || 0,
      'Failed Tests': r.failed_tests || 0,
      'Total Tests': r.total_tests || 0,
      'Duration (s)': r.duration_ms ? Number((r.duration_ms / 1000).toFixed(2)) : 0,
      'Execution Date': r.start_time || r.created_at || '',
      'Has Screenshot': r.has_screenshot ? 'YES' : 'NO',
      'Has Video': r.has_video ? 'YES' : 'NO',
      'Error Message': r.error_message || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-fit column widths
    const colWidths = Object.keys(data[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || '').length)
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 45) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Execution History');

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `qa_test_runs_${dateStr}.xlsx`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRuns.length === 0) return;

    const headers = [
      'Run ID',
      'Suite Name',
      'Type',
      'Status',
      'Passed Tests',
      'Failed Tests',
      'Total Tests',
      'Duration (s)',
      'Created At',
    ];

    const rows = filteredRuns.map((r) => [
      `"${r.id || ''}"`,
      `"${r.suite_name || ''}"`,
      `"${r.type || ''}"`,
      `"${r.status || ''}"`,
      r.passed_tests || 0,
      r.failed_tests || 0,
      r.total_tests || 0,
      r.duration_ms ? (r.duration_ms / 1000).toFixed(2) : '0.00',
      `"${r.created_at || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `qa_test_runs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (filteredRuns.length === 0) return;
    const dataStr = JSON.stringify(filteredRuns, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `qa_test_runs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Passed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Running</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{status || 'Unknown'}</span>
          </span>
        );
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'database':
        return <Database className="w-3.5 h-3.5 text-amber-600" />;
      case 'api':
        return <Webhook className="w-3.5 h-3.5 text-emerald-600" />;
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-purple-600" />;
      case 'e2e':
        return <Monitor className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'database':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'api':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'mobile':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'e2e':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const hasArtifacts = (run) => {
    if (run.has_screenshot !== undefined || run.has_video !== undefined) {
      return {
        hasVideo: Boolean(run.has_video),
        hasScreenshot: Boolean(run.has_screenshot),
      };
    }
    if (!run.artifacts) return { hasVideo: false, hasScreenshot: false };
    let art = run.artifacts;
    if (typeof art === 'string') {
      try {
        art = JSON.parse(art);
      } catch {
        art = {};
      }
    }
    return {
      hasVideo: Boolean(art.video || art.videos?.length),
      hasScreenshot: Boolean(art.screenshot || art.screenshots?.length || run.failed_tests > 0),
    };
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
      {/* Top Header Bar */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Execution Audit Log
              </h3>
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {filteredRuns.length} of {runs.length} runs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed database archive with Playwright execution metrics, artifacts, and export tools
            </p>
          </div>
        </div>

        {/* Export & Manage Actions */}
        <div className="flex items-center space-x-2">
          {onClearHistory && (
            <button
              type="button"
              onClick={onClearHistory}
              disabled={runs.length === 0}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-semibold shadow-2xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Clear all test run records from database"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear History</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={filteredRuns.length === 0}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
            title="Export filtered records directly to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredRuns.length === 0}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            disabled={filteredRuns.length === 0}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
            title="Export filtered records to JSON"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Status Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'passed', label: 'Passed', count: counts.passed },
            { id: 'failed', label: 'Failed', count: counts.failed },
            { id: 'running', label: 'Running', count: counts.running },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setStatusFilter(st.id);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition shrink-0 cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-white text-indigo-700 border border-indigo-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{st.label}</span>
              <span className="ml-1 text-[10px] font-mono px-1 py-0.2 rounded-full bg-slate-100 text-slate-500">
                {st.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Dropdown Selectors & Search Input */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs font-medium cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="e2e">Desktop Web</option>
            <option value="mobile">Mobile Emulation</option>
            <option value="api">REST API</option>
            <option value="database">Database Testing</option>
          </select>

          {/* Date Range Dropdown */}
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs font-medium cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today (Last 24h)</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search run ID, suite..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-6 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider font-mono text-[10px]">
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-4">Suite Specification</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4 hidden sm:table-cell">Assertions</th>
              <th className="py-3 px-4 hidden md:table-cell">Media</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4 hidden lg:table-cell">Timestamp</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedRuns.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-700">No matching test execution records found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Try adjusting your status, category, or date range filters
                  </p>
                </td>
              </tr>
            ) : (
              paginatedRuns.map((run) => {
                const artifacts = hasArtifacts(run);
                const shortId = run.id?.slice(0, 8) || 'N/A';
                const durationSec = run.duration_ms ? (run.duration_ms / 1000).toFixed(2) : '0.00';

                return (
                  <tr
                    key={run.id}
                    onClick={() => onSelectRun(run.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition group"
                  >
                    {/* Status */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1">
                        {getStatusBadge(run.status)}
                        {run.is_flaky && (
                          <span
                            className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-300"
                            title="Test suite succeeded after automatic retry attempt"
                          >
                            <RotateCcw className="w-2.5 h-2.5 text-amber-600" />
                            <span>Passed on Retry</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Suite Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition flex items-center space-x-1.5">
                        <span>{run.suite_name || 'Automated Suite'}</span>
                        {run.environment && run.environment !== 'default' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {run.environment}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>ID: {shortId}</span>
                        {run.triggered_by && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-slate-500">By: {run.triggered_by}</span>
                          </>
                        )}
                        {(run.workers > 1 || run.retries > 0) && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-slate-500">{run.workers || 1}w/{run.retries || 0}r</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Type (Dedicated Column) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 uppercase text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${getTypeBadgeClass(
                          run.type
                        )}`}
                      >
                        {getTypeIcon(run.type)}
                        <span>{run.type}</span>
                      </span>
                    </td>

                    {/* Assertions */}
                    <td className="py-3.5 px-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold font-mono bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-100">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{run.passed_tests || 0}</span>
                        </span>
                        {(run.failed_tests > 0) && (
                          <span className="inline-flex items-center space-x-1 text-rose-700 font-semibold font-mono bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-100">
                            <XCircle className="w-2.5 h-2.5 text-rose-600" />
                            <span>{run.failed_tests}</span>
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          of {run.total_tests || 0} tests
                        </span>
                      </div>
                    </td>

                    {/* Media Artifacts Indicator */}
                    <td className="py-3.5 px-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center space-x-1.5">
                        {artifacts.hasVideo ? (
                          <span
                            className="p-1 rounded bg-purple-50 text-purple-700 border border-purple-200"
                            title="Video recording available"
                          >
                            <Video className="w-3 h-3" />
                          </span>
                        ) : null}
                        {artifacts.hasScreenshot ? (
                          <span
                            className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-200"
                            title="Screenshots captured"
                          >
                            <Camera className="w-3 h-3" />
                          </span>
                        ) : null}
                        {!artifacts.hasVideo && !artifacts.hasScreenshot && (
                          <span className="text-[11px] text-slate-400 font-mono">-</span>
                        )}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-mono text-[11px]">
                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{durationSec}s</span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap hidden lg:table-cell font-mono text-[11px]">
                      <div className="flex items-center space-x-1.5 text-slate-500">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {run.created_at
                            ? new Date(run.created_at).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRun(run.id);
                          }}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 group-hover:text-indigo-600 group-hover:border-indigo-200 transition text-xs font-semibold shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-400" />
                        </button>

                        {onDeleteRun && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRun(run.id);
                            }}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition shadow-2xs cursor-pointer"
                            title="Delete this run record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center space-x-3">
          <span>
            Showing{' '}
            <strong className="text-slate-900 font-semibold">
              {filteredRuns.length === 0 ? 0 : (effectivePage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-900 font-semibold">
              {Math.min(effectivePage * pageSize, filteredRuns.length)}
            </strong>{' '}
            of <strong className="text-slate-900 font-semibold">{filteredRuns.length}</strong> runs
          </span>

          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page Nav Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={effectivePage <= 1}
            className="p-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-mono text-xs font-semibold shadow-2xs">
            {effectivePage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={effectivePage >= totalPages}
            className="p-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
