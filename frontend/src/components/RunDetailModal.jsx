import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Video,
  Image as ImageIcon,
  ExternalLink,
  Terminal,
  FileText,
  AlertTriangle,
  Clock,
  Calendar,
  Hash,
  Maximize2,
  Download,
  FolderCode,
  Layers,
  ArrowRight,
  RotateCcw,
  Cpu,
  Webhook,
  Copy,
  Check,
} from 'lucide-react';

export default function RunDetailModal({ runDetail, onClose }) {
  const [activeTab, setActiveTab] = useState('cases');
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyText = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadJson = (text, filename = 'response.json') => {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!runDetail) return null;

  const { run, results = [], logs = [] } = runDetail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl ${
                run.status === 'passed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {run.status === 'passed' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{run.suite_name}</h3>
                <span
                  className={`inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                    run.status === 'passed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {run.status === 'passed' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>{run.status}</span>
                </span>
                {run.is_flaky && (
                  <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                    <RotateCcw className="w-3 h-3 text-amber-600" />
                    <span>Passed on Retry (Flaky)</span>
                  </span>
                )}
                {run.environment && run.environment !== 'default' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Env: {run.environment}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center space-x-1">
                  <Hash className="w-3 h-3 text-slate-400" />
                  <span>ID: <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{run.id}</code></span>
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Duration: <strong className="text-slate-800">{(run.duration_ms / 1000).toFixed(2)}s</strong></span>
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center space-x-1">
                  <Cpu className="w-3 h-3 text-slate-400" />
                  <span>{run.workers || 1} Worker(s) / {run.retries || 0} Auto-Retries</span>
                </span>
                {run.triggered_by && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Trigger: <strong className="text-slate-700">{run.triggered_by}</strong></span>
                  </>
                )}
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{new Date(run.start_time).toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('cases')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'cases'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Test Results & Media Artifacts ({results.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Console Execution Logs ({logs.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'cases' ? (
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic">
                  No individual test cases parsed for this run.
                </div>
              ) : (
                results.map((item) => {
                  const isPassed = item.status === 'passed';

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-xl border transition ${
                        isPassed
                          ? 'bg-slate-50/60 border-slate-200'
                          : 'bg-rose-50/40 border-rose-200 shadow-2xs'
                      }`}
                    >
                      {/* Title & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          {isPassed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                          )}
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                            <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                              <span className="font-mono text-indigo-600 font-medium">
                                Project: {item.project}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="font-mono text-slate-600">{item.file}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-slate-500 font-mono">
                            {(item.duration_ms / 1000).toFixed(2)}s
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-semibold uppercase text-[11px] ${
                              isPassed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Error Trace */}
                      {!isPassed && item.error_message && (
                        <div className="mt-4 p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                          <div className="text-xs font-semibold text-rose-400 flex items-center space-x-1.5 mb-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Error Traceback</span>
                          </div>
                          <pre className="text-[11px] text-slate-200 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                            {item.error_message.replace(/\u001b\[.*?m/g, '')}
                          </pre>
                        </div>
                      )}

                      {/* API Request Testing Response Code & Text Resource */}
                      {(item.response_body || item.response_status) && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <div className="p-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Webhook className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-slate-900">
                                API Response Code & Text Resource
                              </span>
                              {item.response_status && (
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                                    item.response_status >= 200 && item.response_status < 300
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : item.response_status >= 400 && item.response_status < 500
                                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                                      : 'bg-rose-50 text-rose-700 border-rose-300'
                                  }`}
                                >
                                  Status: {item.response_status}
                                </span>
                              )}
                              {(() => {
                                if (!item.response_body) return null;
                                try {
                                  const parsed = JSON.parse(item.response_body);
                                  if (parsed.errorCode && parsed.errorCode !== '0' && parsed.errorCode !== 0) {
                                    return (
                                      <span
                                        className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center space-x-1 shadow-2xs"
                                        title={parsed.errorMessage || 'Business Error returned inside response body'}
                                      >
                                        <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                                        <span>Body Error: {parsed.errorCode}</span>
                                      </span>
                                    );
                                  }
                                  if (parsed.error) {
                                    return (
                                      <span
                                        className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-300 flex items-center space-x-1 shadow-2xs"
                                        title={String(parsed.error_description || parsed.error)}
                                      >
                                        <AlertTriangle className="w-3 h-3 text-rose-600 flex-shrink-0" />
                                        <span>Body Error: {String(parsed.error)}</span>
                                      </span>
                                    );
                                  }
                                  if (parsed.result !== undefined && parsed.result !== null) {
                                    return (
                                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center space-x-1 shadow-2xs">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                        <span>Result: {String(parsed.result)}</span>
                                      </span>
                                    );
                                  }
                                  if (parsed.token || parsed.sessionId || parsed.id) {
                                    return (
                                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-300 flex items-center space-x-1 shadow-2xs">
                                        <CheckCircle2 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                        <span>Verified: {parsed.token ? 'token' : parsed.sessionId ? 'sessionId' : 'id'}</span>
                                      </span>
                                    );
                                  }
                                } catch (e) {}
                                return null;
                              })()}
                              {item.response_body && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ({new Blob([item.response_body]).size} bytes)
                                </span>
                              )}
                            </div>

                            {item.response_body && (
                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(item.response_body, item.id)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer shadow-2xs"
                                  title="Copy response body text to clipboard"
                                >
                                  {copiedId === item.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700 font-semibold">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-500" />
                                      <span>Copy Response</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadJson(item.response_body, `api-response-${item.id}.json`)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer shadow-2xs"
                                  title="Download JSON file"
                                >
                                  <Download className="w-3 h-3 text-slate-500" />
                                  <span>JSON</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Response Body Text Block */}
                          {item.response_body ? (
                            <div className="relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner">
                              <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span>Response Payload (JSON / Text)</span>
                                <span>UTF-8</span>
                              </div>
                              <pre className="p-3.5 text-xs text-emerald-400 font-mono whitespace-pre-wrap overflow-x-auto max-h-72 select-text leading-relaxed">
                                {(() => {
                                  try {
                                    return JSON.stringify(JSON.parse(item.response_body), null, 2);
                                  } catch (e) {
                                    return item.response_body;
                                  }
                                })()}
                              </pre>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-slate-100 text-slate-500 text-xs italic">
                              Response status recorded ({item.response_status}), no response body captured.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Media Artifacts: Screenshots (Before & After) and Video */}
                      {(item.before_screenshot_url || item.screenshot_url || item.video_url) && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                          {/* Side-by-Side Comparison if both Before and After exist */}
                          {item.before_screenshot_url && item.screenshot_url ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between pb-1">
                                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 tracking-wide uppercase">
                                  <Layers className="w-4 h-4 text-indigo-600" />
                                  <span>Action Effect: Before vs After State</span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                                  <span>Before</span>
                                  <ArrowRight className="w-3 h-3 text-slate-400" />
                                  <span>After</span>
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Before Action Card */}
                                <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-xs space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2">
                                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                                        Before Action
                                      </span>
                                      <span className="text-slate-600 font-medium">Initial State</span>
                                    </div>
                                    <a
                                      href={item.before_screenshot_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-medium"
                                    >
                                      <span>Open full</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>

                                  <div
                                    onClick={() => setSelectedImage(item.before_screenshot_url)}
                                    className="cursor-pointer group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center hover:border-blue-500 transition shadow-2xs"
                                  >
                                    <img
                                      src={item.before_screenshot_url}
                                      alt="Before Action Screenshot"
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                      <span className="inline-flex items-center space-x-1.5 text-xs text-white bg-slate-900/90 px-3 py-1.5 rounded-md shadow-md">
                                        <Maximize2 className="w-3.5 h-3.5" />
                                        <span>Enlarge Before Action</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* After Action Card */}
                                <div className={`p-3 bg-white rounded-xl border shadow-xs space-y-2 ${
                                  isPassed ? 'border-emerald-200' : 'border-rose-200'
                                }`}>
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2">
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                          isPassed
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                            : 'bg-rose-100 text-rose-800 border-rose-200'
                                        }`}
                                      >
                                        After Action
                                      </span>
                                      <span className="text-slate-600 font-medium">
                                        {isPassed ? 'Target State' : 'Failure State'}
                                      </span>
                                    </div>
                                    <a
                                      href={item.screenshot_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`text-[11px] flex items-center space-x-1 font-medium ${
                                        isPassed
                                          ? 'text-emerald-600 hover:text-emerald-800'
                                          : 'text-rose-600 hover:text-rose-800'
                                      }`}
                                    >
                                      <span>Open full</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>

                                  <div
                                    onClick={() => setSelectedImage(item.screenshot_url)}
                                    className={`cursor-pointer group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center transition shadow-2xs ${
                                      isPassed ? 'hover:border-emerald-500' : 'hover:border-rose-500'
                                    }`}
                                  >
                                    <img
                                      src={item.screenshot_url}
                                      alt="After Action Screenshot"
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                      <span className="inline-flex items-center space-x-1.5 text-xs text-white bg-slate-900/90 px-3 py-1.5 rounded-md shadow-md">
                                        <Maximize2 className="w-3.5 h-3.5" />
                                        <span>Enlarge After Action</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Single Screenshot Fallback */
                            (item.screenshot_url || item.before_screenshot_url) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                                    <span className="flex items-center space-x-1.5">
                                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>
                                        {item.before_screenshot_url
                                          ? 'Before Action Screenshot'
                                          : isPassed
                                          ? 'Execution Screenshot'
                                          : 'Failure Screenshot'}
                                      </span>
                                    </span>
                                    <a
                                      href={item.screenshot_url || item.before_screenshot_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 font-medium"
                                    >
                                      <span>Open full</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                  <div
                                    onClick={() => setSelectedImage(item.screenshot_url || item.before_screenshot_url)}
                                    className="cursor-pointer group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center hover:border-indigo-500 transition"
                                  >
                                    <img
                                      src={item.screenshot_url || item.before_screenshot_url}
                                      alt="Screenshot"
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                      <span className="inline-flex items-center space-x-1.5 text-xs text-white bg-slate-900/90 px-3 py-1.5 rounded-md shadow-md">
                                        <Maximize2 className="w-3.5 h-3.5" />
                                        <span>Click to Enlarge</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          )}

                          {/* Video */}
                          {item.video_url && (
                            <div className="space-y-1.5 max-w-xl">
                              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                                <span className="flex items-center space-x-1.5">
                                  <Video className="w-3.5 h-3.5 text-rose-600" />
                                  <span>{isPassed ? 'Execution Video Recording' : 'Failure Video Recording'}</span>
                                </span>
                                <a
                                  href={item.video_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center space-x-1 font-medium"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download .webm</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                              <div className="rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video">
                                <video
                                  controls
                                  autoPlay
                                  loop
                                  muted
                                  className="w-full h-full object-contain"
                                >
                                  <source src={item.video_url} type="video/webm" />
                                  Your browser does not support HTML5 video.
                                </video>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0f172a] text-slate-200 font-['JetBrains_Mono',monospace] text-xs space-y-1 max-h-[60vh] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-slate-400 italic">No logs recorded for this run.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                    <span className="text-[10px] text-slate-400 min-w-[65px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`text-[9px] uppercase px-1 rounded border font-mono ${
                        log.stream === 'stderr'
                          ? 'text-rose-400 border-rose-800 bg-rose-950/40'
                          : log.stream === 'system'
                          ? 'text-cyan-400 border-cyan-800 bg-cyan-950/40'
                          : 'text-slate-400 border-slate-700 bg-slate-800'
                      }`}
                    >
                      {log.stream}
                    </span>
                    <span
                      className={`break-all whitespace-pre-wrap flex-1 ${
                        log.stream === 'stderr' ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox for Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer backdrop-blur-xs"
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Enlarged Failure Screenshot"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-slate-600"
            />
            <p className="text-center text-xs text-white mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
