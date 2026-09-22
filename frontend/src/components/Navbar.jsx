import React from 'react';
import {
  Menu,
  Activity,
  RefreshCw,
  Layers,
  LayoutDashboard,
  History,
  Home,
  ChevronRight,
  Loader2,
  Sparkles,
  Plus,
  Wrench,
  Monitor,
  Smartphone,
  Webhook,
  Database,
} from 'lucide-react';

export default function Navbar({
  onRefresh,
  isRefreshing,
  activeRun,
  activeView,
  onSelectView,
  onOpenMobileSidebar,
  onCreateSuite,
  onRunAll,
  isRunning,
  projects = [],
  selectedProjectId = 'all',
  onSelectProject,
  onOpenProjectModal,
}) {
  const getViewTitle = () => {
    switch (activeView) {
      case 'suites':
        return 'Automated Test Suites';
      case 'history':
        return 'Execution History';
      case 'tools':
        return 'QA Tools & Utilities';
      case 'e2e':
        return 'Desktop Web Testing';
      case 'mobile':
        return 'Mobile Web Emulation';
      case 'api':
        return 'API Integration Testing';
      case 'database':
        return 'Database Automated Testing';
      default:
        return 'Dashboard Overview';
    }
  };

  const getViewIcon = () => {
    switch (activeView) {
      case 'suites':
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'history':
        return <History className="w-4 h-4 text-indigo-600" />;
      case 'tools':
        return <Wrench className="w-4 h-4 text-indigo-600" />;
      case 'e2e':
        return <Monitor className="w-4 h-4 text-blue-600" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      case 'api':
        return <Webhook className="w-4 h-4 text-emerald-600" />;
      case 'database':
        return <Database className="w-4 h-4 text-amber-600" />;
      default:
        return <LayoutDashboard className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Mobile Drawer Trigger & Breadcrumbs */}
          <div className="flex items-center space-x-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={onOpenMobileSidebar}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 md:hidden transition shadow-2xs"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Title */}
            <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => onSelectView('all')}
                className="flex items-center space-x-1 text-slate-500 hover:text-indigo-600 font-medium transition"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QA Hub</span>
              </button>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <div className="flex items-center space-x-1.5 font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/80">
                {getViewIcon()}
                <span>{getViewTitle()}</span>
              </div>
            </nav>

            {/* Project Workspace Selector Dropdown */}
            <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-slate-200">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-xs">
                <Layers className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span className="text-slate-500 font-medium text-[11px]">Workspace:</span>
                <select
                  value={selectedProjectId || 'all'}
                  onChange={(e) => onSelectProject && onSelectProject(e.target.value)}
                  className="bg-transparent font-bold text-indigo-950 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="all">All Projects (Global View)</option>
                  {selectedProjectId && selectedProjectId !== 'all' && !(projects || []).some((p) => p.id === selectedProjectId) && (
                    <option value={selectedProjectId}>
                      Loading Workspace ({selectedProjectId})...
                    </option>
                  )}
                  {(projects || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.base_url})
                    </option>
                  ))}
                </select>
                {selectedProjectId !== 'all' && (
                  <button
                    type="button"
                    onClick={() => onSelectProject && onSelectProject('all')}
                    className="text-slate-400 hover:text-indigo-600 text-xs font-bold px-1 cursor-pointer"
                    title="Reset to All Projects (Global View)"
                  >
                    ✕
                  </button>
                )}
              </div>

              {onOpenProjectModal && (
                <button
                  type="button"
                  onClick={onOpenProjectModal}
                  className="p-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 transition shadow-2xs cursor-pointer flex items-center space-x-1 text-xs font-semibold"
                  title="Manage software projects & environments"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px] hidden lg:inline">Projects</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Action Toolbar */}
          <div className="flex items-center space-x-2.5">
            {/* Active Running Pulse Badge */}
            {activeRun && (
              <button
                type="button"
                onClick={() => onSelectView('suites')}
                className="flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-medium shadow-2xs transition cursor-pointer"
                title="View live test execution"
              >
                <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span className="hidden sm:inline text-amber-700 font-medium">Executing:</span>
                <strong className="truncate max-w-[120px] sm:max-w-[180px] text-amber-900 font-semibold">{activeRun.suiteName}</strong>
              </button>
            )}

            {/* Sync Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Sync fresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
