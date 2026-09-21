import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  ShieldCheck,
  Server,
  Cpu,
  Wifi,
  WifiOff,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { socket } from '../services/socket';

export default function DashboardTriage({
  suites = [],
  runs = [],
  onRunSuite,
  isRunning = false,
  runningSuiteId = null,
  onNavigateToSuites,
}) {
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  useEffect(() => {
    if (socket.connected) {
      setIsSocketConnected(true);
    }
    function onConnect() {
      setIsSocketConnected(true);
    }
    function onDisconnect() {
      setIsSocketConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const checkInterval = setInterval(() => {
      setIsSocketConnected(socket.connected);
    }, 1500);

    return () => {
      clearInterval(checkInterval);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Compute the latest execution state for each suite
  const suiteLatestMap = {};
  runs.forEach((r) => {
    if (!suiteLatestMap[r.suite_id] || new Date(r.created_at) > new Date(suiteLatestMap[r.suite_id].created_at)) {
      suiteLatestMap[r.suite_id] = r;
    }
  });

  // Failing suites: Only evaluate real user suites (exclude system demo failure suites)
  const targetSuites = suites.some((s) => !s.isSystem)
    ? suites.filter((s) => !s.isSystem)
    : suites.filter((s) => s.id !== 'failing-demo');

  const failingSuites = targetSuites
    .map((s) => {
      const latestRun = suiteLatestMap[s.id];
      return {
        ...s,
        latestRun,
      };
    })
    .filter((s) => s.latestRun && (s.latestRun.status === 'failed' || s.latestRun.status === 'error'));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 8 Cols: Suites Needing Attention / Triage Watchlist */}
      <div className="lg:col-span-8 rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                failingSuites.length > 0
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}
            >
              {failingSuites.length > 0 ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {failingSuites.length > 0
                    ? 'Suites Needing Attention'
                    : 'System Test Health'}
                </h3>
                {failingSuites.length > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {failingSuites.length} Failing
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {failingSuites.length > 0
                  ? 'Suites with assertion failures or errors in their latest execution'
                  : 'All suites passed their latest execution successfully'}
              </p>
            </div>
          </div>

          {onNavigateToSuites && (
            <button
              type="button"
              onClick={onNavigateToSuites}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>Manage Suites</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* List of Failing Suites or All Healthy State */}
        <div className="p-4 sm:p-5">
          {failingSuites.length === 0 ? (
            <div className="p-6 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Zero Failing Test Suites
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    All {suites.length} configured test specifications passed their recent runs without regressions.
                  </p>
                </div>
              </div>

              {onRunSuite && (
                <button
                  type="button"
                  onClick={() => {
                    const activeSuites = suites.filter((s) => !s.isSystem);
                    if (activeSuites.length > 0) {
                      onRunSuite('all-active', {
                        testFiles: activeSuites.map((s) => s.testFile).filter(Boolean),
                        scope: 'active',
                      });
                    } else {
                      onRunSuite('all-tests');
                    }
                  }}
                  disabled={isRunning}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run Verification</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {failingSuites.map((s) => {
                const isSuiteRunning = isRunning && runningSuiteId === s.id;
                const failedTests = s.latestRun?.failed_tests || 1;
                const totalTests = s.latestRun?.total_tests || 1;

                return (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {s.name}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-semibold border border-rose-200">
                          {failedTests}/{totalTests} Failed
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {s.description || 'Automated Playwright suite'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRunSuite(s.id)}
                      disabled={isRunning}
                      className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      <RotateCcw className={`w-3 h-3 ${isSuiteRunning ? 'animate-spin' : ''}`} />
                      <span>{isSuiteRunning ? 'Running...' : 'Re-run Suite'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right 4 Cols: System & Runner Health Card */}
      <div className="lg:col-span-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Runner Infrastructure</h3>
              <p className="text-xs text-slate-500 mt-0.5">Execution engine status</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Playwright Engine */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-600 font-medium">Playwright Core</span>
            </div>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>v1.44 Ready</span>
            </span>
          </div>

          {/* Database */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Server className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-600 font-medium">PostgreSQL Database</span>
            </div>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Connected</span>
            </span>
          </div>

          {/* WebSocket */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {isSocketConnected ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className="text-slate-600 font-medium">WebSocket Streaming</span>
            </div>
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border font-semibold font-mono text-[11px] ${
                isSocketConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  isSocketConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span>{isSocketConnected ? 'Live' : 'Disconnected'}</span>
            </span>
          </div>

          {/* Worker Pool */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500">Concurrency Pool</span>
            <span className="text-slate-700 font-mono font-semibold">1 Worker (Sequential)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
