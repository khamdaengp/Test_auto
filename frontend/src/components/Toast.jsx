import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 p-4 rounded-xl shadow-xl border bg-white max-w-sm w-full animate-fadeIn transition-all">
      <div
        className={`p-2 rounded-lg flex-shrink-0 ${
          isSuccess
            ? 'bg-emerald-50 text-emerald-600'
            : isError
            ? 'bg-rose-50 text-rose-600'
            : 'bg-blue-50 text-blue-600'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : isError ? (
          <AlertTriangle className="w-5 h-5" />
        ) : (
          <Info className="w-5 h-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-900">
          {isSuccess ? 'Success' : isError ? 'Error' : 'Notification'}
        </p>
        <p className="text-xs text-slate-600 mt-0.5 truncate">{toast.message}</p>
      </div>

      <button
        onClick={onClose}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
