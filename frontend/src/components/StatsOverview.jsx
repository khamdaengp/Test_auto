import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Cpu,
  Database,
  PieChart as PieIcon,
  BarChart3,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export default function StatsOverview({ stats }) {
  if (!stats || !stats.summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-200"></div>
        ))}
      </div>
    );
  }

  const { summary, trends = [] } = stats;

  const pieData = [
    { name: 'Passed', value: summary.passedRuns, color: '#10b981' },
    { name: 'Failed', value: summary.failedRuns, color: '#ef4444' },
  ];

  if (summary.totalRuns === 0) {
    pieData[0].value = 1;
    pieData[0].color = '#e2e8f0';
    pieData[0].name = 'No data';
    pieData.pop();
  }

  const chartData = trends.map((t, idx) => ({
    name: `#${idx + 1}`,
    suite: t.suite_name,
    durationSec: Number((t.duration_ms / 1000).toFixed(2)),
    passed: t.passed_tests || 0,
    failed: t.failed_tests || 0,
    status: t.status,
  }));

  const isHealthy = summary.passRate >= 80;

  return (
    <div className="space-y-6">
      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Runs */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Test Runs</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {summary.totalRuns}
            </span>
            <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>CI/CD Ready</span>
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <Check className="w-3.5 h-3.5 text-indigo-600" />
            <span><strong className="text-slate-800">{summary.totalTestsExecuted}</strong> assertions evaluated</span>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass Rate</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-3xl font-bold tracking-tight font-mono ${isHealthy ? 'text-emerald-600' : 'text-slate-900'}`}>
              {summary.passRate}%
            </span>
            <span
              className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                isHealthy
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isHealthy ? (
                <>
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span>Target Met</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-amber-600" />
                  <span>Review Needed</span>
                </>
              )}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${
                isHealthy ? 'bg-emerald-500' : summary.passRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${summary.passRate}%` }}
            ></div>
          </div>
        </div>

        {/* Passed vs Failed */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Passed / Failed</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2 font-mono">
            <span className="text-3xl font-bold text-emerald-600">{summary.passedRuns}</span>
            <span className="text-slate-300 text-2xl font-light">/</span>
            <span className="text-3xl font-bold text-rose-600">{summary.failedRuns}</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span><strong className="text-rose-600 font-semibold">{summary.totalTestsFailed}</strong> failed assertions recorded</span>
          </div>
        </div>

        {/* Avg Duration */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Duration</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {(summary.avgDurationMs / 1000).toFixed(2)}s
            </span>
            <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              <Cpu className="w-3 h-3 text-slate-500" />
              <span>1 Worker</span>
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Automated Playwright runner</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pass / Fail Outcome Donut */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center space-x-1.5">
                <PieIcon className="w-3.5 h-3.5 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Outcome Distribution</h4>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Breakdown across all test runs</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {summary.totalRuns} runs
            </span>
          </div>

          <div className="w-full h-44 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 font-mono">{summary.passRate}%</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Pass Rate</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs text-slate-600 pt-3 border-t border-slate-100 font-medium">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Passed: <strong className="text-slate-800 font-mono">{summary.passedRuns}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Failed: <strong className="text-slate-800 font-mono">{summary.failedRuns}</strong></span>
            </div>
          </div>
        </div>

        {/* Execution Duration Trend Bar Chart */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center space-x-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Execution Duration Trends</h4>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Execution duration in seconds per test run</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-medium">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span>
                <span>Passed</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                <span>Failed</span>
              </span>
            </div>
          </div>

          <div className="w-full h-44">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                No recent runs recorded yet. Start a test suite to view execution trends.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 p-3 rounded-lg text-xs shadow-xl space-y-1">
                            <p className="font-bold text-slate-900">{data.suite}</p>
                            <div className="flex items-center space-x-1.5 text-indigo-600 font-medium">
                              <Clock className="w-3 h-3" />
                              <span>Duration: {data.durationSec}s</span>
                            </div>
                            <div className={`flex items-center space-x-1.5 font-semibold ${data.status === 'passed' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {data.status === 'passed' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              <span>Status: {data.status.toUpperCase()}</span>
                            </div>
                            <p className="text-slate-500 text-[11px]">
                              Assertions: {data.passed} passed / {data.failed} failed
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="durationSec" radius={[4, 4, 0, 0]} maxBarSize={42}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={entry.status === 'passed' ? '#2563eb' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Showing chronological executions</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-500 font-mono">
              <Database className="w-3 h-3 text-slate-400" />
              <span>PostgreSQL storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
