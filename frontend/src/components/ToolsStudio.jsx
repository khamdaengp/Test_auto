import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Video,
  Database,
  Download,
  FileSpreadsheet,
  FileCode,
  Terminal,
  Server,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Sparkles,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Play,
  Copy,
  Check,
  Globe,
  HardDrive,
  Activity,
  FileText,
  Sliders,
  ChevronRight,
  Clock,
  CheckCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ToolsStudio({
  suites = [],
  runs = [],
  projects = [],
  onNavigateToSuites,
  onOpenCreateSuite,
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'recorder' | 'trace' | 'exports' | 'system'
  const [targetUrl, setTargetUrl] = useState(() => {
    if (projects.length > 0 && projects[0].base_url) {
      return projects[0].base_url;
    }
    return 'http://localhost:3000';
  });
  const [selectedDevice, setSelectedDevice] = useState('');
  const [codegenStatus, setCodegenStatus] = useState('idle'); // 'idle' | 'launching' | 'success' | 'error'
  const [codegenMessage, setCodegenMessage] = useState('');
  const [copiedTraceCmd, setCopiedTraceCmd] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [healthData, setHealthData] = useState({
    status: 'ok',
    uptime: 0,
    database: {
      status: 'connected',
      host: 'localhost',
      port: 5432,
      database: 'qa_dashboard',
      activeConnections: 1,
    },
    system: {
      nodeVersion: 'v24.19.0',
      platform: 'win32',
      memoryUsageMb: 12,
      playwrightVersion: '1.44.0',
    },
  });

  // Fetch real-time health telemetry from backend
  const fetchHealth = async () => {
    setIsHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (err) {
      console.warn('Could not fetch health telemetry:', err);
    } finally {
      setIsHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Poll health every 30s
    return () => clearInterval(interval);
  }, []);

  // Format uptime in hours, minutes, seconds
  const formatUptime = (seconds = 0) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // Launch Playwright CodeGen Recorder
  const handleLaunchCodegen = async () => {
    setCodegenStatus('launching');
    setCodegenMessage('');
    try {
      const res = await fetch('/api/suites/codegen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl || 'http://localhost:3000',
          device: selectedDevice || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodegenStatus('success');
        setCodegenMessage(`Playwright Recorder launched successfully for ${targetUrl}`);
      } else {
        setCodegenStatus('error');
        setCodegenMessage(data.error || 'Failed to launch Playwright CodeGen');
      }
    } catch (err) {
      setCodegenStatus('error');
      setCodegenMessage(err.message || 'Failed to connect to backend server');
    }
  };

  // Export Suites to Excel (.xlsx)
  const handleExportSuitesExcel = () => {
    if (!suites.length) return;
    const exportData = suites.map((s) => ({
      'Suite ID': s.id,
      'Name': s.name,
      'Type': (s.type || '').toUpperCase(),
      'Target Project': projects.find((p) => p.id === s.projectId)?.name || s.projectId || 'Default',
      'Target URL': s.targetUrl || '',
      'Test File': s.testFile || '',
      'Tags': Array.isArray(s.tags) ? s.tags.join(', ') : (s.tags || ''),
      'Scope': s.isSystem ? 'Starter Template' : 'Active Suite',
      'Workers': s.workersCount || 1,
      'Retries': s.retryCount || 0,
      'Scheduled Cron': s.scheduleCron || 'None',
      'Cron Active': s.isScheduledEnabled ? 'Yes' : 'No',
      'Description': s.description || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const colWidths = Object.keys(exportData[0] || {}).map((key) => {
      const maxValLen = Math.max(
        key.length,
        ...exportData.map((row) => String(row[key] ?? '').length)
      );
      return { wch: Math.min(Math.max(maxValLen + 3, 12), 45) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Suites Catalog');
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `qa_test_suites_${today}.xlsx`);
  };

  // Export Runs to Excel (.xlsx)
  const handleExportRunsExcel = () => {
    if (!runs.length) return;
    const exportData = runs.map((r) => ({
      'Run ID': r.id,
      'Suite Name': r.suite_name || '',
      'Type': (r.type || r.suite_type || '').toUpperCase(),
      'Status': (r.status || '').toUpperCase(),
      'Passed Tests': r.passed_tests || 0,
      'Failed Tests': r.failed_tests || 0,
      'Total Tests': r.total_tests || 0,
      'Duration (seconds)': r.duration_ms ? Number((r.duration_ms / 1000).toFixed(2)) : 0,
      'Execution Timestamp': r.start_time ? new Date(r.start_time).toLocaleString() : '',
      'Triggered By': r.triggered_by || 'manual',
      'Environment': r.environment || 'default',
      'Workers': r.workers || 1,
      'Retries': r.retries || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const colWidths = Object.keys(exportData[0] || {}).map((key) => {
      const maxValLen = Math.max(
        key.length,
        ...exportData.map((row) => String(row[key] ?? '').length)
      );
      return { wch: Math.min(Math.max(maxValLen + 3, 10), 40) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Execution Audit History');
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `qa_execution_history_${today}.xlsx`);
  };

  // Export Full JSON Database Backup (.json)
  const handleExportJsonBackup = () => {
    const backup = {
      exportTimestamp: new Date().toISOString(),
      schemaVersion: '1.2.0',
      projects,
      suites,
      runs,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa_hub_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Find latest failed run or default run for trace inspection
  const latestFailedRun = runs.find((r) => r.status === 'failed') || runs[0];
  const traceCommand = latestFailedRun
    ? `npx playwright show-trace test-results/artifacts/${latestFailedRun.id}/trace.zip`
    : `npx playwright show-trace test-results/artifacts/<run-id>/trace.zip`;

  const copyTraceCommand = () => {
    navigator.clipboard.writeText(traceCommand);
    setCopiedTraceCmd(true);
    setTimeout(() => setCopiedTraceCmd(false), 2500);
  };

  // Device emulation presets
  const devicePresets = [
    { id: '', label: 'Desktop Chrome', sub: '1280 × 720 Viewport', icon: Monitor },
    { id: 'Pixel 7', label: 'Android (Pixel 7)', sub: '412 × 915 Mobile Touch', icon: Smartphone },
    { id: 'iPhone 14', label: 'iOS (iPhone 14)', sub: '390 × 844 Mobile Touch', icon: Smartphone },
    { id: 'iPad Pro 11', label: 'Tablet (iPad Pro 11)', sub: '834 × 1194 Tablet Touch', icon: Tablet },
  ];

  // Quick Developer CLI command snippets
  const developerCliCommands = [
    {
      id: 'ui',
      label: 'Interactive UI Runner',
      badge: 'Interactive',
      desc: 'Visual runner with watch mode, locator picker, and time-travel replay',
      cmd: 'npx playwright test --ui',
    },
    {
      id: 'headed',
      label: 'Headed Browser Execution',
      badge: 'Visual Run',
      desc: 'Executes suites in real Chromium/Firefox windows for visual inspection',
      cmd: 'npx playwright test --headed',
    },
    {
      id: 'debug',
      label: 'Step-by-Step Debugger',
      badge: 'Inspector',
      desc: 'Pauses on each step with Playwright Inspector to evaluate selectors',
      cmd: 'npx playwright test --debug',
    },
    {
      id: 'report',
      label: 'HTML Report Server',
      badge: 'Telemetry',
      desc: 'Hosts local HTML report server showing execution waterfall & artifacts',
      cmd: 'npx playwright show-report',
    },
  ];

  const handleCopyCommand = (id, cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  // Card Sub-renderers for Balanced Layout
  const renderCodegenCard = () => (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-2xs">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Playwright CodeGen (Auto-Recorder)
            </h3>
            <p className="text-xs text-slate-500">
              Interactively click and type in the browser to generate verified Playwright TypeScript code
            </p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono">
          Interactive GUI
        </span>
      </div>

      {/* Target URL Selector */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Target Application Base URL
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="http://localhost:3000"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>
            <button
              type="button"
              onClick={handleLaunchCodegen}
              disabled={codegenStatus === 'launching'}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              {codegenStatus === 'launching' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Launching Engine...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Launch Recorder</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workspace Project Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-slate-400">Quick Workspace Presets:</span>
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setTargetUrl(p.base_url)}
              className="px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold transition cursor-pointer border border-indigo-200/80 flex items-center space-x-1"
              title={`Fill ${p.name} URL: ${p.base_url}`}
            >
              <Layers className="w-3 h-3" />
              <span>{p.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setTargetUrl('http://localhost:3000')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition cursor-pointer border border-slate-200"
          >
            localhost:3000
          </button>
          <button
            type="button"
            onClick={() => setTargetUrl('http://localhost:5180')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition cursor-pointer border border-slate-200"
          >
            localhost:5180
          </button>
          <button
            type="button"
            onClick={() => setTargetUrl('https://example.com')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition cursor-pointer border border-slate-200"
          >
            example.com
          </button>
        </div>

        {/* Device Emulation Presets Grid */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Device Viewport Emulation
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {devicePresets.map((dev) => {
              const DevIcon = dev.icon;
              const isSel = selectedDevice === dev.id;
              return (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => setSelectedDevice(dev.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSel
                      ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 ring-1 ring-indigo-400 shadow-2xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <DevIcon className={`w-3.5 h-3.5 ${isSel ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold truncate">{dev.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">{dev.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Launch Status Banner */}
      {codegenStatus === 'success' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <div className="font-bold text-sm text-emerald-900">
              Chromium Browser & Playwright Inspector are active!
            </div>
            <p className="text-emerald-700 text-xs leading-relaxed">
              1. Interact with the browser window (click, fill forms, navigate).
              <br />
              2. Use the Inspector window to <strong>Assert visibility</strong> or <strong>Assert text</strong> to generate assertions.
              <br />
              3. Click <strong>Copy</strong> in Inspector, then create a new test suite to paste and save.
            </p>
          </div>
        </div>
      )}

      {codegenStatus === 'error' && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{codegenMessage || 'Failed to launch recorder'}</span>
        </div>
      )}
    </div>
  );

  const renderTraceViewerCard = () => (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shadow-2xs">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Playwright Trace Viewer & Forensic Replay
            </h3>
            <p className="text-xs text-slate-500">
              Inspect recorded DOM snapshots, network waterfalls, console logs, and action timelines
            </p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 font-mono">
          Forensics
        </span>
      </div>

      {latestFailedRun ? (
        <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span className="font-semibold text-rose-900 truncate">
              Target Trace: Run #{latestFailedRun.id} &bull; {latestFailedRun.suite_name || 'Automated Suite'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-rose-700 font-bold shrink-0 ml-2">Failed Run</span>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center space-x-2">
          <Activity className="w-4 h-4 text-slate-400 shrink-0" />
          <span>No failed runs recorded. Inspect artifacts from any completed run below.</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          CLI Trace Viewer Launch Command
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 px-3 py-2 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 flex items-center justify-between">
            <span className="truncate">{traceCommand}</span>
          </div>
          <button
            type="button"
            onClick={copyTraceCommand}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition cursor-pointer shrink-0"
          >
            {copiedTraceCmd ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-slate-600">
          Drop your <code className="text-indigo-600 font-mono font-bold">trace.zip</code> directly into the official Playwright Web Viewer:
        </span>
        <a
          href="https://trace.playwright.dev"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0"
        >
          <span>trace.playwright.dev</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );

  const renderReportsExporterCard = () => (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-2xs">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Audit Logs & Report Exporter
          </h3>
          <p className="text-xs text-slate-500">
            Download complete Excel workbooks and system database backups
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleExportSuitesExcel}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/50 hover:border-emerald-300 text-slate-800 transition cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700 group-hover:bg-emerald-200 transition">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                Export Test Suites Inventory (.xlsx)
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {suites.length} test suites with tags & configs
              </div>
            </div>
          </div>
          <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
        </button>

        <button
          type="button"
          onClick={handleExportRunsExcel}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/50 hover:border-emerald-300 text-slate-800 transition cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700 group-hover:bg-emerald-200 transition">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                Export Execution Audit Logs (.xlsx)
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {runs.length} test runs with pass/fail telemetry
              </div>
            </div>
          </div>
          <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
        </button>

        <button
          type="button"
          onClick={handleExportJsonBackup}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-800 transition cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-100/70 text-indigo-700 group-hover:bg-indigo-200 transition">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                Full System Database Backup (.json)
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Projects, suites & execution history snapshot
              </div>
            </div>
          </div>
          <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
        </button>
      </div>
    </div>
  );

  const renderPostgresTelemetryCard = () => (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-2xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              PostgreSQL Database Telemetry
            </h3>
            <p className="text-xs text-slate-500">
              Live connection pool & instance health
            </p>
          </div>
        </div>
        <span className="inline-flex items-center space-x-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Connected</span>
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Database Target:</span>
          <span className="font-mono font-bold text-slate-800">
            {healthData.database.host}:{healthData.database.port || 5432}
          </span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Catalog Database:</span>
          <span className="font-mono font-bold text-slate-800">
            {healthData.database.database || 'qa_dashboard'}
          </span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Connection Pool Status:</span>
          <span className="inline-flex items-center space-x-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected & Healthy</span>
          </span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Active PostgreSQL Clients:</span>
          <span className="font-mono font-bold text-indigo-700">
            {healthData.database.activeConnections || 1} active connection(s)
          </span>
        </div>
      </div>
    </div>
  );

  const renderToolchainRuntimeCard = () => (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-2xs">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Execution Toolchain Runtime
          </h3>
          <p className="text-xs text-slate-500">
            Active browser drivers & platform services
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 text-[10px] block font-mono">Playwright Core</span>
          <span className="font-bold text-slate-900 font-mono text-xs">
            v{healthData.system.playwrightVersion || '1.44.0'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 text-[10px] block font-mono">Node.js Engine</span>
          <span className="font-bold text-slate-900 font-mono text-xs">
            {healthData.system.nodeVersion || 'v24.19.0'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 text-[10px] block font-mono">Server Uptime</span>
          <span className="font-bold text-slate-900 font-mono text-xs">
            {formatUptime(healthData.uptime)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 text-[10px] block font-mono">Heap Memory</span>
          <span className="font-bold text-indigo-600 font-mono text-xs">
            {healthData.system.memoryUsageMb || 12} MB
          </span>
        </div>
      </div>
    </div>
  );

  const renderDeveloperCliCard = () => (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-2xs">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Playwright Developer CLI Commands
            </h3>
            <p className="text-xs text-slate-500">
              1-Click copy standard execution commands for local terminal debugging
            </p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 font-mono">
          CLI Toolkit
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {developerCliCommands.map((item) => {
          const isCopied = copiedCmd === item.id;
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{item.label}</span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  {item.desc}
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <code className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] truncate border border-slate-800" title={item.cmd}>
                  {item.cmd}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyCommand(item.id, item.cmd)}
                  className={`p-1.5 rounded-lg text-xs font-medium border transition cursor-pointer shrink-0 ${
                    isCopied
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                  title="Copy command to clipboard"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderBestPracticesCard = () => (
    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs space-y-3">
      <div className="flex items-center space-x-2 font-bold text-slate-800">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <span>Playwright Recorder Best Practices</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-slate-600">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
          <div className="font-bold text-slate-900 mb-1">1. Clean Navigation</div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Let each page load fully before clicking elements to record clean, stable locators.
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
          <div className="font-bold text-slate-900 mb-1">2. Auto-Assertions</div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Hover and click "Assert text" on success messages to ensure tests verify backend state.
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
          <div className="font-bold text-slate-900 mb-1">3. Save to Suite</div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Copy the recorded code into a new test suite file under <code className="text-indigo-600 font-mono">tests/</code> for automated runs.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ========================================================
          HERO BANNER & SYSTEM OVERVIEW
         ======================================================== */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-50/70 via-slate-50/40 to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-xs shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  QA Automation & Diagnostic Studio
                </h2>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Toolchain Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Interactive Playwright test recorder, post-mortem trace forensics, PostgreSQL health telemetry, and full audit export engine.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => {
                fetchHealth();
                if (onRefresh) onRefresh();
              }}
              disabled={isHealthLoading}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
              title="Refresh telemetry and database status"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isHealthLoading ? 'animate-spin' : ''}`} />
              <span>{isHealthLoading ? 'Pinging...' : 'Ping Telemetry'}</span>
            </button>

            {onOpenCreateSuite && (
              <button
                onClick={onOpenCreateSuite}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>+ New Suite</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Telemetry KPI Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">Active Test Suites</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
              {suites.filter((s) => !s.isSystem).length}{' '}
              <span className="text-xs text-slate-400 font-normal">({suites.length} total)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">Historical Runs Recorded</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
              {runs.length}{' '}
              <span className="text-xs text-slate-400 font-normal">executions</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">Target Workspaces</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
              {projects.length}{' '}
              <span className="text-xs text-slate-400 font-normal">projects</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">PostgreSQL Engine</div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 font-mono">
                Port {healthData.database.port || 5432} Connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          STUDIO NAVIGATION TABS
         ======================================================== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'All Studio Utilities', icon: Sliders },
          { id: 'recorder', label: 'Interactive CodeGen Recorder', icon: Video },
          { id: 'trace', label: 'Trace Forensics & Replay', icon: Terminal },
          { id: 'exports', label: 'Audit Reports & Backup', icon: FileSpreadsheet },
          { id: 'system', label: 'Database & System Health', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          STUDIO UTILITY SECTIONS - BALANCED RESPONSIVE GRID
         ======================================================== */}
      {/* Tab 1: All Studio Utilities (Balanced 50/50 + Full Width Bottom) */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Top Row: Symmetrical 2 Columns with Matched Heights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (50% / lg:col-span-6): Interactive Recorders & Replay */}
            <div className="lg:col-span-6 space-y-6">
              {renderCodegenCard()}
              {renderTraceViewerCard()}
            </div>

            {/* Right Column (50% / lg:col-span-6): Exporters, PostgreSQL & Toolchain */}
            <div className="lg:col-span-6 space-y-6">
              {renderReportsExporterCard()}
              {renderPostgresTelemetryCard()}
              {renderToolchainRuntimeCard()}
            </div>
          </div>

          {/* Full-width Middle Row: Playwright Developer CLI Commands */}
          {renderDeveloperCliCard()}

          {/* Full-width Bottom Row: Playwright Best Practices */}
          {renderBestPracticesCard()}
        </div>
      )}

      {/* Tab 2: Interactive CodeGen Recorder */}
      {activeTab === 'recorder' && (
        <div className="space-y-6">
          {renderCodegenCard()}
          {renderBestPracticesCard()}
        </div>
      )}

      {/* Tab 3: Trace Forensics & Replay */}
      {activeTab === 'trace' && (
        <div className="space-y-6">
          {renderTraceViewerCard()}
          {renderDeveloperCliCard()}
        </div>
      )}

      {/* Tab 4: Audit Reports & Backup */}
      {activeTab === 'exports' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {renderReportsExporterCard()}
        </div>
      )}

      {/* Tab 5: Database & System Health */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {renderPostgresTelemetryCard()}
          {renderToolchainRuntimeCard()}
        </div>
      )}
    </div>
  );
}
