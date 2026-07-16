import { X, Bell, Check } from 'lucide-react';
import { Notification } from '../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  loading: boolean;
  onMarkRead: (id: string) => void;
}

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  loading,
  onMarkRead,
}: NotificationPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-md h-full shadow-2xl overflow-y-auto transition-colors duration-300"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            الإشعارات
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 mb-3 opacity-30" />
            <p>لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notif.is_read ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleString('ar-EG')}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <button
                      onClick={() => onMarkRead(notif.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors flex-shrink-0"
                      title="تحديد كمقروء"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
