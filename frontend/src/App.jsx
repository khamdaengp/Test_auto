import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StatsOverview from './components/StatsOverview';
import TestSuitesTable from './components/TestSuitesTable';
import LiveConsole from './components/LiveConsole';
import RunHistoryTable from './components/RunHistoryTable';
import RunDetailModal from './components/RunDetailModal';
import SuiteModal from './components/SuiteModal';
import ProjectModal from './components/ProjectModal';
import DashboardTriage from './components/DashboardTriage';
import RecentRunsFeed from './components/RecentRunsFeed';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import ToolsStudio from './components/ToolsStudio';
import {
  Layers,
  ChevronRight,
  Terminal,
  Play,
  Wrench,
  Monitor,
  Smartphone,
  Webhook,
  Database,
  Plus,
} from 'lucide-react';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  fetchSuites,
  fetchSuite,
  createSuite,
  updateSuite,
  deleteSuite,
  fetchRuns,
  fetchStats,
  fetchRunDetail,
  triggerRun,
  stopRun,
  clearAllRuns,
  deleteRun,
} from './services/api';
import { socket } from './services/socket';

const VIEW_ROUTES = {
  all: '/dashboard',
  suites: '/test-suites',
  history: '/runs-history',
  tools: '/tools',
  e2e: '/desktop-web',
  mobile: '/mobile-web',
  api: '/api-integration',
  database: '/database-testing',
};

const ROUTE_TO_VIEW = {
  '/': 'all',
  '/dashboard': 'all',
  '/suites': 'suites',
  '/test-suites': 'suites',
  '/history': 'history',
  '/runs-history': 'history',
  '/tools': 'tools',
  '/desktop-web': 'e2e',
  '/e2e': 'e2e',
  '/mobile-web': 'mobile',
  '/mobile': 'mobile',
  '/api-integration': 'api',
  '/api': 'api',
  '/database-testing': 'database',
  '/database': 'database',
};

const DOMAIN_STUDIOS = {
  e2e: {
    title: 'Desktop Web Testing',
    subtitle: 'End-to-end browser automation for desktop environments using Chromium, Firefox, and WebKit.',
    icon: Monitor,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    type: 'e2e',
    typeName: 'Desktop Web',
  },
  mobile: {
    title: 'Mobile Web Emulation',
    subtitle: 'Mobile browser viewports, touch emulation, and mobile device presets (Pixel 7, iPhone 14).',
    icon: Smartphone,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    type: 'mobile',
    typeName: 'Mobile Web',
  },
  api: {
    title: 'API Integration Testing',
    subtitle: 'Automated RESTful contract testing with JSON payload validations and status code assertions.',
    icon: Webhook,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    type: 'api',
    typeName: 'API Integration',
  },
  database: {
    title: 'Database Automated Testing',
    subtitle: 'Automated data integrity testing, PostgreSQL schema checks, record mutations, and SQL assertions.',
    icon: Database,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    type: 'database',
    typeName: 'Database Testing',
  },
};

export default function App() {
  const [projects, setProjects] = useState(() => {
    try {
      const cached = localStorage.getItem('qa_cached_projects');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlProj = params.get('project') || params.get('projectId');
      if (urlProj) {
        localStorage.setItem('qa_selected_project_id', urlProj);
        return urlProj;
      }
      const savedProj = localStorage.getItem('qa_selected_project_id');
      if (savedProj) return savedProj;
      return 'all';
    } catch {
      return 'all';
    }
  });
  const [suites, setSuites] = useState([]);
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeView, setActiveView] = useState(() => {
    try {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      return ROUTE_TO_VIEW[path] || 'all';
    } catch {
      return 'all';
    }
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const view = ROUTE_TO_VIEW[path];
      return ['e2e', 'mobile', 'api', 'database'].includes(view) ? view : 'all';
    } catch {
      return 'all';
    }
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync selectedProjectId to URL parameters whenever it changes or on mount
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (selectedProjectId && selectedProjectId !== 'all') {
        url.searchParams.set('project', selectedProjectId);
      } else {
        url.searchParams.delete('project');
        url.searchParams.delete('projectId');
      }
      window.history.replaceState(window.history.state, '', url.pathname + url.search);
    } catch (err) {
      console.error('Failed to sync project to URL:', err);
    }
  }, [selectedProjectId]);

  const handleSelectProject = (projId) => {
    const nextId = projId || 'all';
    setSelectedProjectId(nextId);
    try {
      localStorage.setItem('qa_selected_project_id', nextId);
    } catch (err) {
      console.error('Failed to save selected project:', err);
    }

    try {
      const url = new URL(window.location.href);
      if (nextId === 'all') {
        url.searchParams.delete('project');
        url.searchParams.delete('projectId');
      } else {
        url.searchParams.set('project', nextId);
      }
      window.history.replaceState(window.history.state, '', url.pathname + url.search);
    } catch (err) {
      console.error('Failed to update URL search params:', err);
    }
  };

  const handleSelectView = (viewId) => {
    setActiveView(viewId);
    if (['e2e', 'mobile', 'api', 'database'].includes(viewId)) {
      setSelectedCategory(viewId);
    }
    const targetPath = VIEW_ROUTES[viewId] || '/dashboard';
    const params = new URLSearchParams(window.location.search);
    if (selectedProjectId && selectedProjectId !== 'all') {
      params.set('project', selectedProjectId);
    } else {
      params.delete('project');
      params.delete('projectId');
    }
    const query = params.toString();
    const targetRoute = query ? `${targetPath}?${query}` : targetPath;
    if (window.location.pathname !== targetPath || window.location.search !== (query ? `?${query}` : '')) {
      window.history.pushState({ view: viewId }, '', targetRoute);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const matchedView = ROUTE_TO_VIEW[path] || 'all';
      setActiveView(matchedView);
      if (['e2e', 'mobile', 'api', 'database'].includes(matchedView)) {
        setSelectedCategory(matchedView);
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const urlProj = params.get('project') || params.get('projectId');
        if (urlProj && urlProj !== selectedProjectId) {
          setSelectedProjectId(urlProj);
          localStorage.setItem('qa_selected_project_id', urlProj);
        }
      } catch {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProjectId]);

  // Console drawer orientation: 'bottom' (horizontal dock, recommended) or 'side' (vertical split)
  const [consoleOrientation, setConsoleOrientation] = useState(() => {
    try {
      return localStorage.getItem('qa_console_orientation') || 'bottom';
    } catch {
      return 'bottom';
    }
  });

  const handleToggleOrientation = () => {
    setConsoleOrientation((prev) => {
      const next = prev === 'side' ? 'bottom' : 'side';
      try {
        localStorage.setItem('qa_console_orientation', next);
      } catch (err) {
        console.error('Failed to save console orientation:', err);
      }
      return next;
    });
  };

  // Live execution state
  const [activeRun, setActiveRun] = useState(null);
  const [runningSuiteId, setRunningSuiteId] = useState(null);
  const [liveLogs, setLiveLogs] = useState([]);
  const [liveProgress, setLiveProgress] = useState({
    percent: 0,
    status: 'idle',
    text: 'Test runner ready',
  });

  // Modal inspection state
  const [selectedRunDetail, setSelectedRunDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Suite CRUD modal state
  const [isSuiteModalOpen, setIsSuiteModalOpen] = useState(false);
  const [editingSuite, setEditingSuite] = useState(null);

  // Project CRUD modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Modern Confirmation Dialog & Toast notification state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    itemName: '',
    confirmLabel: 'Confirm Delete',
    cancelLabel: 'Cancel',
    variant: 'danger',
    isLoading: false,
    onConfirm: null,
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  // Load initial data
  const loadData = useCallback(async (projId) => {
    // Safely check: ensure projId is a valid string and NOT a MouseEvent or SyntheticEvent
    const targetProjId = typeof projId === 'string' ? projId : selectedProjectId;
    setIsRefreshing(true);
    try {
      const [projectsData, suitesData, runsData, statsData] = await Promise.all([
        fetchProjects().catch(() => []),
        fetchSuites(),
        fetchRuns(50, 0, '', targetProjId),
        fetchStats(targetProjId),
      ]);
      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
        try {
          localStorage.setItem('qa_cached_projects', JSON.stringify(projectsData));
        } catch {}
      }
      setSuites(suitesData);
      setRuns(runsData.runs || []);
      setStats(statsData);

      // Verify that the currently selected project exists in projectsData
      if (targetProjId !== 'all' && Array.isArray(projectsData) && projectsData.length > 0) {
        const exists = projectsData.some(
          (p) => String(p.id).trim().toLowerCase() === String(targetProjId).trim().toLowerCase()
        );
        if (!exists) {
          handleSelectProject('all');
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadData(selectedProjectId);
  }, [selectedProjectId, loadData]);

  // Filter test suites based on selected project
  const displayedSuites =
    selectedProjectId === 'all'
      ? suites
      : suites.filter((s) => s.projectId === selectedProjectId);

  // Setup WebSocket event listeners
  useEffect(() => {
    function handleTestStarted(data) {
      setActiveRun(data);
      setRunningSuiteId(data.suiteId);
      setLiveLogs([]);
      setLiveProgress({
        percent: 10,
        status: 'running',
        text: `Executing ${data.suiteName}...`,
      });
    }

    function handleTestProgress(data) {
      setLiveProgress((prev) => ({
        ...prev,
        percent: data.percent,
        status: data.status,
        text: data.text || prev.text,
      }));
    }

    function handleTestLog(log) {
      setLiveLogs((prev) => [...prev, log]);
    }

    function handleTestCompleted(data) {
      setActiveRun(null);
      setRunningSuiteId(null);
      setLiveProgress({
        percent: 100,
        status: data.status,
        text: `Execution finished: ${data.status.toUpperCase()} (${(data.durationMs / 1000).toFixed(1)}s)`,
        runId: data.runId,
      });

      // Reload fresh statistics and historical runs
      setTimeout(() => {
        loadData();
      }, 500);
    }

    socket.on('test:started', handleTestStarted);
    socket.on('test:progress', handleTestProgress);
    socket.on('test:log', handleTestLog);
    socket.on('test:completed', handleTestCompleted);

    return () => {
      socket.off('test:started', handleTestStarted);
      socket.off('test:progress', handleTestProgress);
      socket.off('test:log', handleTestLog);
      socket.off('test:completed', handleTestCompleted);
    };
  }, [loadData]);

  // Trigger test suite execution
  const handleRunSuite = async (suiteId, options = {}) => {
    try {
      const suite = suites.find((s) => s.id === suiteId);
      const suiteDisplayName =
        suiteId === 'all-active'
          ? 'Active Test Suites'
          : suiteId === 'all-tests'
          ? 'All Test Suites Combined'
          : suite
          ? suite.name
          : suiteId;

      setRunningSuiteId(suiteId);
      if (['all', 'history', 'tools'].includes(activeView)) {
        handleSelectView('suites');
      }
      setLiveLogs([]);
      setLiveProgress({
        percent: 5,
        status: 'initializing',
        text: `Requesting execution for ${suiteDisplayName}...`,
      });

      const activeProjId = options.projectId || (selectedProjectId !== 'all' ? selectedProjectId : (suite?.projectId || null));
      await triggerRun(suiteId, { triggeredBy: 'dashboard-ui', projectId: activeProjId, ...options });
    } catch (err) {
      console.error('Failed to trigger test suite:', err);
      setLiveProgress({
        percent: 100,
        status: 'error',
        text: `Execution trigger failed: ${err.message}`,
      });
      setRunningSuiteId(null);
    }
  };

  // Stop running test
  const handleStopRun = async () => {
    if (!activeRun) return;
    try {
      await stopRun(activeRun.runId);
      setLiveLogs((prev) => [
        ...prev,
        {
          stream: 'system',
          message: '[User] Abort requested by user from dashboard.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Failed to stop run:', err);
    }
  };

  // Select historical run for detail modal
  const handleSelectRun = async (runId) => {
    setIsLoadingDetail(true);
    try {
      const detail = await fetchRunDetail(runId);
      setSelectedRunDetail(detail);
    } catch (err) {
      console.error('Failed to load run details:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // CRUD Suite Handlers
  const handleOpenCreateSuite = (defaultType = null) => {
    if (defaultType && typeof defaultType === 'string') {
      setEditingSuite({ isNewWithDefaultType: true, type: defaultType });
    } else {
      setEditingSuite(null);
    }
    setIsSuiteModalOpen(true);
  };

  const handleOpenEditSuite = async (suite) => {
    try {
      const fullSuite = await fetchSuite(suite.id);
      setEditingSuite(fullSuite);
      setIsSuiteModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch suite details for edit:', err);
    }
  };

  const handleSaveSuite = async (suiteData) => {
    let savedSuite = null;
    if (editingSuite && !editingSuite.isTemplate && !editingSuite.isDuplicate) {
      savedSuite = await updateSuite(editingSuite.id, suiteData);
      const normalized = {
        ...savedSuite,
        projectId: savedSuite.project_id || savedSuite.projectId || suiteData.projectId,
      };
      setSuites((prev) => prev.map((s) => (s.id === editingSuite.id ? { ...s, ...normalized } : s)));
      showToast(`Test suite "${suiteData.name}" updated successfully.`, 'success');
    } else {
      savedSuite = await createSuite(suiteData);
      const normalized = {
        ...savedSuite,
        projectId: savedSuite.project_id || savedSuite.projectId || suiteData.projectId,
      };
      setSuites((prev) => {
        const filtered = prev.filter((s) => s.id !== normalized.id);
        return [normalized, ...filtered];
      });
      showToast(`Test suite "${suiteData.name}" created successfully.`, 'success');
    }

    // Auto-align workspace if suite belongs to a project different from currently filtered project
    if (suiteData.projectId && selectedProjectId !== 'all' && selectedProjectId !== suiteData.projectId) {
      handleSelectProject(suiteData.projectId);
    }
    // Auto-align category filter if suite type differs from active filter
    if (selectedCategory !== 'all' && selectedCategory !== suiteData.type) {
      setSelectedCategory('all');
    }

    await loadData(selectedProjectId);
  };

  const handleUseTemplate = async (templateSuite) => {
    try {
      const fullSuite = await fetchSuite(templateSuite.id);
      setEditingSuite({
        ...fullSuite,
        id: null,
        name: `${templateSuite.name} (Custom)`,
        isTemplate: true,
      });
    } catch (err) {
      setEditingSuite({
        ...templateSuite,
        id: null,
        name: `${templateSuite.name} (Custom)`,
        isTemplate: true,
      });
    }
    setIsSuiteModalOpen(true);
  };

  const handleDuplicateSuite = async (suite) => {
    try {
      const fullSuite = await fetchSuite(suite.id);
      setEditingSuite({
        ...fullSuite,
        id: null,
        name: `${fullSuite.name} (Copy)`,
        isDuplicate: true,
      });
    } catch (err) {
      setEditingSuite({
        ...suite,
        id: null,
        name: `${suite.name} (Copy)`,
        isDuplicate: true,
      });
    }
    setIsSuiteModalOpen(true);
  };

  const handleDeleteSuite = (suite) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Test Suite',
      description: 'Are you sure you want to permanently delete this test suite? Its Playwright specification file and configuration will be completely removed.',
      itemName: suite.name,
      confirmLabel: 'Delete Suite',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await deleteSuite(suite.id);
          setSuites((prev) => prev.filter((s) => s.id !== suite.id));
          await loadData(selectedProjectId);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast(`Test suite "${suite.name}" was successfully deleted.`, 'success');
        } catch (err) {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast(err.message || 'Failed to delete test suite', 'error');
        }
      },
    });
  };

  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Execution History',
      description: 'Are you sure you want to clear all historical test runs? All recorded metrics, execution logs, and captured screenshots will be permanently wiped.',
      itemName: `${runs.length} Historical Test Run(s)`,
      confirmLabel: 'Clear All History',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await clearAllRuns();
          await loadData();
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast('All test run history has been cleared.', 'success');
        } catch (err) {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast(err.message || 'Failed to clear test run history', 'error');
        }
      },
    });
  };

  const handleDeleteRun = (runId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Test Run Record',
      description: 'Are you sure you want to remove this test run record from the history? Associated execution logs and metrics will be permanently deleted.',
      itemName: `Run ID: ${runId}`,
      confirmLabel: 'Delete Record',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await deleteRun(runId);
          await loadData();
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast('Test run record deleted successfully.', 'success');
        } catch (err) {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast(err.message || 'Failed to delete test run', 'error');
        }
      },
    });
  };

  // Software Project CRUD Handlers
  const handleCreateProject = async (projectData) => {
    const newProj = await createProject(projectData);
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== newProj.id);
      const updated = [...filtered, newProj];
      try {
        localStorage.setItem('qa_cached_projects', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    handleSelectProject(newProj.id);
    await loadData(newProj.id);
    showToast(`Software project "${newProj.name}" created successfully.`, 'success');
  };

  const handleUpdateProject = async (id, projectData) => {
    const updated = await updateProject(id, projectData);
    setProjects((prev) => {
      const nextProjects = prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
      try {
        localStorage.setItem('qa_cached_projects', JSON.stringify(nextProjects));
      } catch {}
      return nextProjects;
    });
    await loadData(selectedProjectId);
    showToast(`Project "${updated.name}" updated successfully.`, 'success');
  };

  const handleDeleteProject = (project) => {
    const suitesForProj = suites.filter((s) => s.projectId === project.id);
    const suiteCountText = suitesForProj.length === 1 ? '1 associated test suite' : `${suitesForProj.length} associated test suites`;

    setConfirmModal({
      isOpen: true,
      title: 'Delete Software Project & Associated Suites',
      description: `Are you sure you want to delete project "${project.name}"? All ${suiteCountText}, their Playwright spec files on disk, and execution history will be permanently deleted.`,
      itemName: `${project.name} (${project.id})`,
      confirmLabel: 'Delete Project & Suites',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await deleteProject(project.id);
          setProjects((prev) => {
            const nextProjects = prev.filter((p) => p.id !== project.id);
            try {
              localStorage.setItem('qa_cached_projects', JSON.stringify(nextProjects));
            } catch {}
            return nextProjects;
          });

          // Cascade delete from local state: remove all suites belonging to this project
          setSuites((prev) => prev.filter((s) => s.projectId !== project.id));
          // Remove test runs belonging to this project
          setRuns((prev) => prev.filter((r) => r.projectId !== project.id));

          if (selectedProjectId === project.id) {
            handleSelectProject('all');
            await loadData('all');
          } else {
            await loadData(selectedProjectId);
          }
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast(`Project "${project.name}" and ${suitesForProj.length} test suite(s) were permanently deleted.`, 'success');
        } catch (err) {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast(err.message || 'Failed to delete project', 'error');
        }
      },
    });
  };

  const categoryCounts = {
    e2e: displayedSuites.filter((s) => s.type === 'e2e' && !s.isSystem).length,
    mobile: displayedSuites.filter((s) => s.type === 'mobile' && !s.isSystem).length,
    api: displayedSuites.filter((s) => s.type === 'api' && !s.isSystem).length,
    database: displayedSuites.filter((s) => s.type === 'database' && !s.isSystem).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-['Inter',sans-serif]">
      {/* Sliding Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={handleSelectView}
        suitesCount={displayedSuites.filter((s) => !s.isSystem).length}
        runsCount={runs.length}
        categoryCounts={categoryCounts}
        activeRun={activeRun}
        onRefresh={() => loadData(selectedProjectId)}
        isRefreshing={isRefreshing}
        onCreateSuite={() => handleOpenCreateSuite()}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-200">
        {/* Top Header Bar */}
        <Navbar
          onRefresh={() => loadData(selectedProjectId)}
          isRefreshing={isRefreshing}
          activeRun={activeRun}
          activeView={activeView}
          onSelectView={handleSelectView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
          onOpenProjectModal={() => setIsProjectModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* ========================================================
              DASHBOARD OVERVIEW (activeView === 'all')
              Executive Command Center: KPIs + Triage + Quick Hub + Recent 5
             ======================================================== */}
          {activeView === 'all' && (
            <>
              {/* High-level KPIs & Analytics Charts */}
              <section>
                <StatsOverview stats={stats} />
              </section>

              {/* Suites Needing Attention (Triage Watchlist) & Runner Infrastructure Status */}
              <section>
                <DashboardTriage
                  suites={displayedSuites}
                  runs={runs}
                  onRunSuite={handleRunSuite}
                  isRunning={!!runningSuiteId}
                  runningSuiteId={runningSuiteId}
                  onNavigateToSuites={() => handleSelectView('suites')}
                />
              </section>


              {/* Compact Recent Activity Feed (Latest 5 Runs) */}
              <section>
                <RecentRunsFeed
                  runs={runs}
                  onSelectRun={handleSelectRun}
                  onViewAll={() => handleSelectView('history')}
                />
              </section>
            </>
          )}

          {/* ========================================================
              TEST SUITES (activeView === 'suites')
              Dedicated Catalog & Live Runner with Orientation Toggle
             ======================================================== */}
          {activeView === 'suites' && (
            <div className="space-y-6">
              <div className="rounded-xl p-5 bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl border bg-indigo-50 text-indigo-700 border-indigo-200 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        All Automated Test Suites
                      </h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {displayedSuites.filter((s) => !s.isSystem).length} Active Suites
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Unified test catalog across Desktop Web, Mobile Emulation, API Integration, and Database integrity checks.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenCreateSuite()}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Test Suite</span>
                  </button>
                </div>
              </div>

              <section
                className={
                  consoleOrientation === 'side'
                    ? 'grid grid-cols-1 xl:grid-cols-12 gap-8 items-start'
                    : 'flex flex-col gap-8 items-stretch'
                }
              >
              {/* Test Suites Table (7 cols in side mode, full width in bottom mode) */}
              <div
                className={
                  consoleOrientation === 'side'
                    ? 'xl:col-span-7 space-y-4'
                    : 'w-full space-y-4'
                }
              >
                <TestSuitesTable
                  suites={displayedSuites}
                  projects={projects}
                  onRunSuite={handleRunSuite}
                  onStopRun={handleStopRun}
                  isRunning={!!runningSuiteId}
                  runningSuiteId={runningSuiteId}
                  activeRunId={activeRun?.runId || null}
                  onCreateSuite={() => handleOpenCreateSuite()}
                  onEditSuite={handleOpenEditSuite}
                  onDeleteSuite={handleDeleteSuite}
                  onUseTemplate={handleUseTemplate}
                  onDuplicateSuite={handleDuplicateSuite}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  orientation={consoleOrientation}
                  onToggleOrientation={handleToggleOrientation}
                />
              </div>

              {/* Real-time Console & Progress (5 cols in side mode, full width bottom drawer in bottom mode) */}
              <div
                className={
                  consoleOrientation === 'side'
                    ? 'xl:col-span-5 sticky top-20'
                    : 'w-full'
                }
              >
                <LiveConsole
                  logs={liveLogs}
                  progress={liveProgress}
                  isRunning={!!activeRun}
                  onStop={handleStopRun}
                  onClearLogs={() => setLiveLogs([])}
                  activeSuiteName={activeRun ? activeRun.suiteName : null}
                  orientation={consoleOrientation}
                  onToggleOrientation={handleToggleOrientation}
                  onInspectRun={handleSelectRun}
                />
              </div>
            </section>
          </div>
        )}

          {/* ========================================================
              RUNS HISTORY (activeView === 'history')
              Deep Audit & Reporting Hub with Multi-Filters, Export, Pagination
             ======================================================== */}
          {activeView === 'history' && (
            <section>
              <RunHistoryTable
                runs={runs}
                onSelectRun={handleSelectRun}
                onRunSuite={handleRunSuite}
                onClearHistory={handleClearHistory}
                onDeleteRun={handleDeleteRun}
              />
            </section>
          )}

          {/* ========================================================
              TOOLS STUDIO (activeView === 'tools')
              QA & Playwright Utilities: CodeGen, Device Emulation, DB Check, Diagnostics
             ======================================================== */}
          {activeView === 'tools' && (
            <section>
              <ToolsStudio
                suites={displayedSuites}
                runs={runs}
                projects={projects}
                onNavigateToSuites={() => handleSelectView('suites')}
                onOpenCreateSuite={() => handleOpenCreateSuite()}
                onRefresh={loadData}
              />
            </section>
          )}

          {/* ========================================================
              DOMAIN STUDIOS (e2e, mobile, api, database)
              Dedicated environment for each testing category
             ======================================================== */}
          {['e2e', 'mobile', 'api', 'database'].includes(activeView) && (
            <div className="space-y-6">
              {/* Domain Studio Header Banner */}
              {(() => {
                const domain = DOMAIN_STUDIOS[activeView];
                const DomainIcon = domain.icon;
                const domainSuites = displayedSuites.filter(
                  (s) => s.type === activeView && !s.isSystem
                );
                return (
                  <div className="rounded-xl p-5 bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center space-x-3.5">
                      <div className={`p-2.5 rounded-xl border ${domain.badgeColor} shrink-0`}>
                        <DomainIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                            {domain.title}
                          </h2>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {domainSuites.length} Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {domain.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {['e2e', 'mobile'].includes(activeView) && (
                        <button
                          onClick={() => handleSelectView('tools')}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5 text-slate-500" />
                          <span>CodeGen</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenCreateSuite(activeView)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New {domain.typeName} Suite</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Catalog & Live Runner for this Domain */}
              <section
                className={
                  consoleOrientation === 'side'
                    ? 'grid grid-cols-1 xl:grid-cols-12 gap-8 items-start'
                    : 'flex flex-col gap-8 items-stretch'
                }
              >
                <div
                  className={
                    consoleOrientation === 'side'
                      ? 'xl:col-span-7 space-y-4'
                      : 'w-full space-y-4'
                  }
                >
                  <TestSuitesTable
                    suites={displayedSuites}
                    projects={projects}
                    onRunSuite={handleRunSuite}
                    isRunning={!!runningSuiteId}
                    runningSuiteId={runningSuiteId}
                    onCreateSuite={() => handleOpenCreateSuite(activeView)}
                    onEditSuite={handleOpenEditSuite}
                    onDeleteSuite={handleDeleteSuite}
                    onUseTemplate={handleUseTemplate}
                    onDuplicateSuite={handleDuplicateSuite}
                    selectedCategory={activeView}
                    onSelectCategory={(cat) => handleSelectView(cat)}
                    orientation={consoleOrientation}
                    onToggleOrientation={handleToggleOrientation}
                  />
                </div>

                <div
                  className={
                    consoleOrientation === 'side'
                      ? 'xl:col-span-5 sticky top-20'
                      : 'w-full'
                  }
                >
                  <LiveConsole
                    logs={liveLogs}
                    progress={liveProgress}
                    isRunning={!!activeRun}
                    onStop={handleStopRun}
                    onClearLogs={() => setLiveLogs([])}
                    activeSuiteName={activeRun ? activeRun.suiteName : null}
                    orientation={consoleOrientation}
                    onToggleOrientation={handleToggleOrientation}
                    onInspectRun={handleSelectRun}
                  />
                </div>
              </section>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-5 text-xs text-slate-500">
          <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center space-x-2 text-slate-600 font-medium">
              <span className="font-semibold text-slate-800">Playwright QA Automation Hub</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center space-x-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">PostgreSQL</span>
              </span>
              <span className="flex items-center space-x-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="text-slate-600">React + Vite</span>
              </span>
              <span className="flex items-center space-x-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span className="text-slate-600">Tailwind CSS</span>
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Run Inspection Modal */}
      {selectedRunDetail && (
        <RunDetailModal
          runDetail={selectedRunDetail}
          onClose={() => setSelectedRunDetail(null)}
          suites={suites}
        />
      )}

      {/* Suite Create/Edit CRUD Modal */}
      <SuiteModal
        suite={editingSuite}
        isOpen={isSuiteModalOpen}
        onClose={() => {
          setIsSuiteModalOpen(false);
          setEditingSuite(null);
        }}
        onSave={handleSaveSuite}
        projects={projects}
        selectedProjectId={selectedProjectId}
      />

      {/* Software Project CRUD Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Modern Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        itemName={confirmModal.itemName}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel={confirmModal.cancelLabel}
        variant={confirmModal.variant}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Modern Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
