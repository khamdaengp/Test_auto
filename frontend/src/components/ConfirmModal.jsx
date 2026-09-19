import React from 'react';
import {
  Trash2,
  AlertTriangle,
  AlertCircle,
  X,
  Loader2,
  Info,
} from 'lucide-react';

/**
 * Modern confirmation modal to replace browser-native window.confirm() dialogs.
 */
export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  itemName = '',
  confirmLabel = 'Confirm Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden z-10 transition-all transform scale-100">
        {/* Close Icon Button */}
        <button
          onClick={isLoading ? undefined : onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header & Icon */}
        <div className="flex items-start space-x-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-2xs ${
              isDanger
                ? 'bg-rose-50 border-rose-100 text-rose-600'
                : isWarning
                ? 'bg-amber-50 border-amber-100 text-amber-600'
                : 'bg-indigo-50 border-indigo-100 text-indigo-600'
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-6 h-6" />
            ) : isWarning ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <Info className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Targeted Item Preview Box */}
        {itemName && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2.5">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
            />
            <span className="text-xs font-mono font-medium text-slate-800 break-all line-clamp-2">
              {itemName}
            </span>
          </div>
        )}

        {/* Non-reversible Warning note */}
        {isDanger && (
          <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>This action will permanently delete the selected item.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs transition shadow-2xs disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-white transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isLoading ? 'Processing...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
