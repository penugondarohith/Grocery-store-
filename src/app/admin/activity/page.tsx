'use client';

import { useAdminData } from '@/context/AdminDataContext';
import { ClipboardList, Trash2 } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  CREATE_PRODUCT: 'bg-green-50 text-green-700',
  UPDATE_PRODUCT: 'bg-blue-50 text-blue-700',
  DELETE_PRODUCT: 'bg-red-50 text-red-700',
  PRODUCT_OVERRIDE: 'bg-violet-50 text-violet-700',
  CREATE_COUPON: 'bg-amber-50 text-amber-700',
  UPDATE_REVIEW: 'bg-cyan-50 text-cyan-700',
  INVENTORY_ADJUST: 'bg-orange-50 text-orange-700',
  UPDATE_SETTINGS: 'bg-indigo-50 text-indigo-700',
};

export default function AdminActivityPage() {
  const { state, logAction } = useAdminData();
  const log = state.auditLog;

  const clearLog = () => {
    // Clear via localStorage directly since we don't have a clearAuditLog action
    localStorage.removeItem('vlgs_admin_audit');
    window.location.reload();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-sm text-gray-400">{log.length} recorded actions</p>
        </div>
        {log.length > 0 && (
          <button onClick={clearLog}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200">
            <Trash2 className="w-4 h-4" /> Clear Log
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {log.length === 0 ? (
          <div className="py-20 text-center">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 font-semibold">No activity recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Admin actions will appear here as you use the panel</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {log.map(entry => (
              <div key={entry.id} className="px-5 py-3.5 flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${ACTION_COLORS[entry.action] ?? 'bg-gray-100 text-gray-600'}`}>
                    {entry.action.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{entry.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {entry.entity} {entry.entityId ? `· ${entry.entityId.slice(0, 12)}…` : ''} · by {entry.performedBy}
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                  {new Date(entry.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
