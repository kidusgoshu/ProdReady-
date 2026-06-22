import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Wifi } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning';
}

interface NotificationToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  isLightMode?: boolean;
}

export default function NotificationToast({ 
  toast, 
  onClose,
  isLightMode = false 
}: NotificationToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div 
      id="notification-toast-frame"
      className={`fixed bottom-6 right-6 z-55 max-w-sm flex items-center gap-3 p-3.5 rounded-2xl shadow-2xl border transition duration-300 ${
        isLightMode 
          ? 'bg-white border-neutral-200 text-neutral-800' 
          : 'bg-neutral-900 border-neutral-800 text-white backdrop-blur-md'
      }`}
    >
      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
        toast.type === 'success' ? 'bg-emerald-55/10 bg-emerald-500/10 text-emerald-500' :
        toast.type === 'warning' ? 'bg-rose-55/10 bg-rose-500/10 text-rose-500' :
        'bg-blue-55/10 bg-blue-500/10 text-blue-500'
      }`}>
        {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
        {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-rose-500" />}
        {toast.type === 'info' && <Wifi className="w-4 h-4 text-blue-500" />}
      </div>

      <div className="flex-1">
        <p className="text-xs font-semibold font-sans leading-normal">{toast.text}</p>
      </div>

      <button
        onClick={onClose}
        className={`p-1 rounded-full cursor-pointer ${
          isLightMode ? 'text-neutral-400 hover:text-neutral-800' : 'text-neutral-500 hover:text-neutral-300'
        }`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
