import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Layers,
  History,
  Wrench,
  Monitor,
  Smartphone,
  Webhook,
  Database,
  Activity,
  RefreshCw,
  Plus,
  X,
  Server,
  Wifi,
  WifiOff,
  ExternalLink,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { socket } from '../services/socket';

export default function Sidebar({
  activeView,
  onSelectView,
  suitesCount = 0,
  runsCount = 0,
  categoryCounts = {},
  activeRun,
  onRefresh,
  isRefreshing,
  onCreateSuite,
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  projects = [],
  selectedProjectId = 'all',
  onSelectProject,
  onOpenProjectModal,
}) {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (socket.connected) {
      setIsConnected(true);
    }
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const checkInterval = setInterval(() => {
      setIsConnected(socket.connected);
    }, 1500);

    return () => {
      clearInterval(checkInterval);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const navSections = [
    {
      title: 'Main',
      items: [
        {
          id: 'all',
          path: '/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'suites',
          path: '/test-suites',
          label: 'Test Suites',
          icon: Layers,
          badge: suitesCount,
        },
        {
          id: 'history',
          path: '/runs-history',
          label: 'Runs History',
          icon: History,
          badge: runsCount,
        },
      ],
    },
    {
      title: 'Test Automation',
      items: [
        {
          id: 'e2e',
          path: '/desktop-web',
          label: 'Desktop Web',
          icon: Monitor,
          count: categoryCounts.e2e || 0,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        },
        {
          id: 'mobile',
          path: '/mobile-web',
          label: 'Mobile Web',
          icon: Smartphone,
          count: categoryCounts.mobile || 0,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
        },
        {
          id: 'api',
          path: '/api-integration',
          label: 'API Integration',
          icon: Webhook,
          count: categoryCounts.api || 0,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
        },
        {
          id: 'database',
          path: '/database-testing',
          label: 'Database Testing',
          icon: Database,
          count: categoryCounts.database || 0,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
        },
      ],
    },
    {
      title: 'Utilities',
      items: [
        {
          id: 'tools',
          path: '/tools',
          label: 'Tools & CodeGen',
          icon: Wrench,
          badge: null,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-250 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200/80 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              onSelectView('all');
              if (onSelectCategory) onSelectCategory('all');
              if (onClose) onClose();
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-bold text-slate-900 tracking-tight">QA Hub</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  v1.50
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Enterprise QA Suite</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-4 pb-2 space-y-3">
          {/* Workspace Selector */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-2.5 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <div className="flex items-center space-x-1.5 text-slate-600">
                <Layers className="w-3 h-3 text-indigo-600" />
                <span>Workspace</span>
              </div>
              <div className="flex items-center space-x-2">
                {selectedProjectId !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectProject) onSelectProject('all');
                      if (onClose) onClose();
                    }}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer underline"
                    title="Reset to All Projects (Global View)"
                  >
                    Reset All
                  </button>
                )}
                {onOpenProjectModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenProjectModal();
                      if (onClose) onClose();
                    }}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                  >
                    + Manage
                  </button>
                )}
              </div>
            </div>
            <select
              value={selectedProjectId || 'all'}
              onChange={(e) => {
                if (onSelectProject) onSelectProject(e.target.value);
                if (onClose) onClose();
              }}
              className="w-full bg-white text-xs font-semibold text-slate-800 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Projects (Global)</option>
              {selectedProjectId && selectedProjectId !== 'all' && !(projects || []).some((p) => p.id === selectedProjectId) && (
                <option value={selectedProjectId}>
                  Loading Workspace ({selectedProjectId})...
                </option>
              )}
              {(projects || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              onCreateSuite();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Test Suite</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {section.title}
              </div>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  const badgeValue = item.badge ?? (item.count !== undefined && item.count > 0 ? item.count : null);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView(item.id);
                        if (['e2e', 'mobile', 'api', 'database'].includes(item.id) && onSelectCategory) {
                          onSelectCategory(item.id);
                        }
                        if (onClose) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {item.bg ? (
                          <div className={`p-1 rounded-md ${item.bg}`}>
                            <Icon className={`w-3.5 h-3.5 ${item.color || 'text-slate-500'}`} />
                          </div>
                        ) : (
                          <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {badgeValue !== null && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-indigo-100 text-indigo-700 font-semibold'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {badgeValue}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Active Running Card (if executing) */}
          {activeRun && (
            <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 shadow-2xs">
              <div className="flex items-center space-x-2 text-amber-800 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>Running Test</span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                {activeRun.suiteName}
              </div>
              <div className="text-[10px] font-mono text-amber-700 mt-0.5 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Runner Active</span>
              </div>
            </div>
          )}
        </div>

        {/* System Health & Footer Status */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/80 space-y-2">
          {/* Status Row */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
            <div className="flex items-center space-x-1.5">
              {isConnected ? (
                <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Socket</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-rose-600 font-medium">
                  <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                  <span>Offline</span>
                </div>
              )}
            </div>

            <a
              href="http://localhost:8088/?pgsql=qa_postgres&username=qa_user&db=qa_dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 font-mono text-[10px] text-slate-600 hover:text-indigo-600 transition px-2 py-0.5 rounded border border-slate-200 bg-white hover:border-indigo-200 shadow-2xs group"
              title="Open Database GUI (Adminer)"
            >
              <Server className="w-3 h-3 text-emerald-600" />
              <span className="font-semibold text-slate-700 group-hover:text-indigo-600">PG :5434</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-indigo-600" />
            </a>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium transition shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Fresh Data'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
