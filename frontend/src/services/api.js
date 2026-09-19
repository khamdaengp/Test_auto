const API_BASE = '';
const NO_CACHE_OPTS = {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
  },
};

export async function fetchSuites() {
  const res = await fetch(`${API_BASE}/api/suites`, NO_CACHE_OPTS);
  if (!res.ok) throw new Error(`Failed to fetch suites: ${res.statusText}`);
  return res.json();
}

export async function fetchSuite(id) {
  const res = await fetch(`${API_BASE}/api/suites/${id}`, NO_CACHE_OPTS);
  if (!res.ok) throw new Error(`Failed to fetch suite: ${res.statusText}`);
  return res.json();
}

export async function createSuite(suiteData) {
  const res = await fetch(`${API_BASE}/api/suites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(suiteData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create suite: ${res.statusText}`);
  }
  return res.json();
}

export async function updateSuite(id, suiteData) {
  const res = await fetch(`${API_BASE}/api/suites/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(suiteData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update suite: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteSuite(id) {
  const res = await fetch(`${API_BASE}/api/suites/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete suite: ${res.statusText}`);
  }
  return res.json();
}

export async function toggleSuiteSchedule(id, isScheduledEnabled, scheduleCron) {
  const res = await fetch(`${API_BASE}/api/suites/${id}/schedule`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isScheduledEnabled, scheduleCron }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update suite schedule: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/api/projects`, NO_CACHE_OPTS);
  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`);
  return res.json();
}

export async function createProject(projectData) {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create project: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchRuns(limit = 25, offset = 0, status = '', projectId = '') {
  let url = `${API_BASE}/api/runs?limit=${limit}&offset=${offset}`;
  if (status) url += `&status=${status}`;
  if (projectId && projectId !== 'all') url += `&projectId=${encodeURIComponent(projectId)}`;
  const res = await fetch(url, NO_CACHE_OPTS);
  if (!res.ok) throw new Error(`Failed to fetch runs: ${res.statusText}`);
  return res.json();
}

export async function fetchRunDetail(runId) {
  const res = await fetch(`${API_BASE}/api/runs/${runId}`, NO_CACHE_OPTS);
  if (!res.ok) throw new Error(`Failed to fetch run details: ${res.statusText}`);
  return res.json();
}

export async function clearAllRuns() {
  const res = await fetch(`${API_BASE}/api/runs`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to clear test runs: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteRun(runId) {
  const res = await fetch(`${API_BASE}/api/runs/${runId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete test run: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchStats(projectId = '') {
  const url = projectId && projectId !== 'all'
    ? `${API_BASE}/api/stats?projectId=${encodeURIComponent(projectId)}`
    : `${API_BASE}/api/stats`;
  const res = await fetch(url, NO_CACHE_OPTS);
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
  return res.json();
}

export async function triggerRun(suiteId, options = {}) {
  const res = await fetch(`${API_BASE}/api/tests/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ suiteId, options }),
  });
  if (!res.ok) throw new Error(`Failed to trigger test: ${res.statusText}`);
  return res.json();
}

export async function stopRun(runId) {
  const res = await fetch(`${API_BASE}/api/tests/stop/${runId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to stop test: ${res.statusText}`);
  return res.json();
}

export async function updateProject(id, projectData) {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update project: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteProject(id) {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete project: ${res.statusText}`);
  }
  return res.json();
}
