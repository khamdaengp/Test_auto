import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Square,
  Trash2,
  Search,
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  SlidersHorizontal,
  X,
  PanelRight,
  PanelBottom,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Camera,
} from 'lucide-react';

export default function LiveConsole({
  logs = [],
  progress = { percent: 0, status: 'idle', text: 'Waiting to start' },
  isRunning = false,
  onStop,
  onClearLogs,
  activeSuiteName,
  orientation = 'side',
  onToggleOrientation,
  onInspectRun,
}) {
  const [filterText, setFilterText] = useState('');
  const [streamFilter, setStreamFilter] = useState('all'); // 'all', 'stderr', 'stdout', 'system'
  const [autoScroll, setAutoScroll] = useState(true);
  const [hasCopied, setHasCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalContainerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      setIsCollapsed(false);
    }
  }, [isRunning]);

  useEffect(() => {
    if (autoScroll && terminalContainerRef.current && logs.length > 0) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((l) => {
    const matchesStream =
      streamFilter === 'all' ||
      (streamFilter === 'errors' && (l.stream === 'stderr' || l.message.includes('failed') || l.message.includes('Error:'))) ||
      (streamFilter === 'system' && l.stream === 'system');

    const matchesQuery = l.message.toLowerCase().includes(filterText.toLowerCase());
    return matchesStream && matchesQuery;
  });

  const handleCopyLogs = () => {
    const fullText = logs.map((l) => `[${l.stream.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(fullText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (progress.status) {
      case 'running':
      case 'initializing':
      case 'parsing':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span className="capitalize">{progress.status}</span>
          </span>
        );
      case 'passed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Passed</span>
          </span>
        );
      case 'failed':
      case 'error':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            <span>Ready</span>
          </span>
        );
    }
  };

  return (
    <>
      {/* Fullscreen Backdrop when Maximized */}
      {isMaximized && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsMaximized(false)}
        />
      )}

      <div
        className={
          isMaximized
            ? 'fixed inset-4 sm:inset-8 z-50 rounded-xl bg-white border border-slate-300 shadow-2xl overflow-hidden flex flex-col'
            : 'rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col'
        }
      >
        {/* Console Window Header */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            {/* Traffic light control dots */}
            <div className="flex space-x-1.5 items-center">
              <button
                type="button"
                onClick={onClearLogs}
                className="w-2.5 h-2.5 rounded-full bg-rose-400 hover:bg-rose-500 transition cursor-pointer"
                title="Clear console output"
              />
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-2.5 h-2.5 rounded-full bg-amber-400 hover:bg-amber-500 transition cursor-pointer"
                title={isCollapsed ? 'Expand console drawer' : 'Collapse console drawer'}
              />
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                className="w-2.5 h-2.5 rounded-full bg-emerald-400 hover:bg-emerald-500 transition cursor-pointer"
                title={isMaximized ? 'Restore size' : 'Maximize console'}
              />
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                Live Runner Output
              </h4>
              <span className="hidden sm:inline-flex text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-semibold">
                {orientation === 'bottom' ? 'Bottom Dock' : 'Side Panel'}
              </span>
              {activeSuiteName && (
                <span className="text-xs text-indigo-600 font-mono hidden sm:inline font-bold">
                  [{activeSuiteName}]
                </span>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-1.5">
            {/* Toggle Drawer Orientation */}
            {onToggleOrientation && (
              <button
                type="button"
                onClick={onToggleOrientation}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                title={
                  orientation === 'side'
                    ? 'Switch to Bottom Drawer Orientation'
                    : 'Switch to Side Panel Orientation'
                }
              >
                {orientation === 'side' ? (
                  <>
                    <PanelBottom className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline font-medium">Bottom Dock</span>
                  </>
                ) : (
                  <>
                    <PanelRight className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline font-medium">Side Dock</span>
                  </>
                )}
              </button>
            )}

            {/* Copy Logs */}
            <button
              onClick={handleCopyLogs}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
              title="Copy logs to clipboard"
            >
              {hasCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span className="hidden sm:inline font-medium">{hasCopied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Auto-scroll */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2.5 py-1 rounded-md border text-xs flex items-center space-x-1.5 transition shadow-2xs cursor-pointer ${
                autoScroll
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle Auto-Scroll"
            >
              <ArrowDownCircle className="w-3 h-3" />
              <span className="hidden sm:inline font-medium">Follow</span>
            </button>

            {/* Clear */}
            <button
              onClick={onClearLogs}
              className="p-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition cursor-pointer"
              title="Clear logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Maximize / Restore */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition cursor-pointer"
              title={isMaximized ? 'Restore console size' : 'Maximize console to full screen'}
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition cursor-pointer"
              title={isCollapsed ? 'Expand console drawer' : 'Collapse console drawer'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Stop / Cancel */}
            {isRunning && (
              <button
                onClick={onStop}
                className="px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition ml-1 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Abort</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Bar */}
        <div className="px-4 py-2 bg-white border-b border-slate-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              {getStatusBadge()}
              <span className="text-xs text-slate-600 font-medium truncate max-w-[240px]">
                {progress.text}
              </span>
              {progress.runId && onInspectRun && (
                <button
                  type="button"
                  onClick={() => onInspectRun(progress.runId)}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                  title="View test execution details and captured screenshot"
                >
                  <Camera className="w-3 h-3 text-indigo-600" />
                  <span>View Screenshot</span>
                </button>
              )}
            </div>
            <span className="text-xs font-mono font-bold text-slate-800">
              {progress.percent}%
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                progress.status === 'failed' || progress.status === 'error'
                  ? 'bg-rose-500'
                  : progress.status === 'passed'
                  ? 'bg-emerald-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.max(progress.percent, 2)}%` }}
            ></div>
          </div>

          {/* Sub-toolbar: Stream Filters & Search (only shown when not collapsed) */}
          {!isCollapsed && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center space-x-1">
                {[
                  { id: 'all', label: 'All Output' },
                  { id: 'errors', label: 'Errors Only' },
                  { id: 'system', label: 'System' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStreamFilter(st.id)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                      streamFilter === st.id
                        ? 'bg-slate-200 text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="relative w-36 sm:w-48">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search console..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full pl-7 pr-6 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                />
                {filterText && (
                  <button
                    onClick={() => setFilterText('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Terminal Viewport (only shown when not collapsed) */}
        {!isCollapsed && (
          <div
            ref={terminalContainerRef}
            className={`${
              isMaximized
                ? 'flex-1 min-h-0'
                : orientation === 'bottom'
                ? 'h-96'
                : 'h-80'
            } overflow-y-auto p-4 font-['JetBrains_Mono',monospace] text-xs space-y-1 bg-[#0b101b] text-slate-200 select-text`}
          >
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 italic text-xs space-y-2">
                <Terminal className="w-6 h-6 text-slate-600" />
                <span>
                  {filterText
                    ? 'No log lines matching query'
                    : 'Console ready. Click "Run" on any test suite to stream live output.'}
                </span>
              </div>
            ) : (
              filteredLogs.map((log, idx) => {
                let textColor = 'text-slate-300';
                let streamBadgeColor = 'text-slate-400 border-slate-700 bg-slate-800/60';

                if (log.stream === 'stderr' || log.message.includes('Error:') || log.message.includes('failed')) {
                  textColor = 'text-rose-400 font-semibold';
                  streamBadgeColor = 'text-rose-400 border-rose-800 bg-rose-950/40';
                } else if (log.stream === 'system') {
                  textColor = 'text-cyan-400 font-medium';
                  streamBadgeColor = 'text-cyan-400 border-cyan-800 bg-cyan-950/40';
                } else if (log.message.includes('passed') || log.message.includes('ok')) {
                  textColor = 'text-emerald-400';
                }

                const timeStr = log.timestamp
                  ? new Date(log.timestamp).toLocaleTimeString()
                  : '';

                return (
                  <div key={idx} className="flex items-start space-x-2 leading-relaxed hover:bg-slate-800/40 px-1 rounded">
                    <span className="text-[10px] text-slate-500 select-none min-w-[55px] font-mono">
                      {timeStr}
                    </span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-mono select-none ${streamBadgeColor}`}
                    >
                      {log.stream}
                    </span>
                    <span className={`break-all whitespace-pre-wrap flex-1 ${textColor}`}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
