import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Activity,
  Monitor,
  Smartphone,
  Webhook,
  Database,
  Layers,
  ArrowUpRight,
  Eye,
} from 'lucide-react';

export default function RecentRunsFeed({ runs = [], onSelectRun, onViewAll }) {
  // Take the 5 most recent runs
  const recentRuns = runs.slice(0, 5);

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
      default:
        return <Layers className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Passed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
            <span>Running</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <AlertCircle className="w-3 h-3 text-slate-400" />
            <span>{status || 'Unknown'}</span>
          </span>
        );
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Execution Activity</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest automated runs across all testing suites</p>
          </div>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
          >
            <span>View all runs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Stream List */}
      <div className="divide-y divide-slate-100">
        {recentRuns.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No test runs recorded yet. Launch a suite from the Test Runner to get started.
          </div>
        ) : (
          recentRuns.map((run) => {
            const durationSec = run.duration_ms ? (run.duration_ms / 1000).toFixed(2) : '0.00';
            const shortId = run.id?.slice(0, 8) || 'N/A';

            return (
              <div
                key={run.id}
                onClick={() => onSelectRun && onSelectRun(run.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition cursor-pointer group"
              >
                {/* Left: Suite Info & Badges */}
                <div className="flex items-start sm:items-center space-x-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                    {getTypeIcon(run.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                        {run.suite_name || 'Automated Suite'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        #{shortId}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1 font-medium">
                      <span>{run.total_tests || 0} assertions</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                      <span className="text-emerald-600 font-semibold">{run.passed_tests || 0} passed</span>
                      {run.failed_tests > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                          <span className="text-rose-600 font-semibold">{run.failed_tests} failed</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status, Duration, Relative Timestamp & Action */}
                <div className="flex items-center space-x-4 shrink-0 justify-between sm:justify-end">
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(run.status)}

                    <div className="text-right font-mono text-xs">
                      <div className="flex items-center space-x-1 text-slate-600 font-semibold">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{durationSec}s</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {formatRelativeTime(run.created_at)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectRun) onSelectRun(run.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                    title="Inspect run details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link if more than 5 runs */}
      {runs.length > 5 && onViewAll && (
        <div className="p-3 bg-slate-50/70 border-t border-slate-200/80 text-center">
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>Showing 5 of {runs.length} runs - Open Full Runs History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
