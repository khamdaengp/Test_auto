import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-100 font-['Inter',sans-serif]">
          <div className="bg-slate-800 border border-slate-700 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">An unexpected interface error occurred</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The application encountered a display problem. You can refresh the page to restore normal operation.
            </p>
            {this.state.error && (
              <div className="text-left bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-rose-300 max-h-32 overflow-y-auto break-all">
                {this.state.error.toString()}
              </div>
            )}
            <div className="pt-2 flex justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
