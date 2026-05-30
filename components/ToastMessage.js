'use client';
import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500' },
  error:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    icon: 'text-red-500' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-500' },
  info:    { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   icon: 'text-blue-500' },
};

let toastRef = null;

export function showToast(message, type = 'info', duration = 4000) {
  if (toastRef) toastRef({ message, type, duration });
}

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    toastRef = (data) => {
      setToast(data);
      setVisible(true);
      setTimeout(() => setVisible(false), data.duration || 4000);
      setTimeout(() => setToast(null), (data.duration || 4000) + 300);
    };
    return () => { toastRef = null; };
  }, []);

  if (!toast) return children;

  const Icon = ICONS[toast.type] || Info;
  const c = COLORS[toast.type] || COLORS.info;

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '360px' }}>
        <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 ${c.bg} ${c.border}
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <Icon size={18} className={`flex-shrink-0 ${c.icon}`} />
          <p className={`text-sm font-medium flex-1 ${c.text}`}>{toast.message}</p>
          <button onClick={() => setVisible(false)} className={`flex-shrink-0 p-1 rounded hover:bg-black/10 ${c.icon}`}>
            <X size={14} />
          </button>
        </div>
      </div>
    </>
  );
}