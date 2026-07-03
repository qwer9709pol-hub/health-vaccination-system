import { X, Bell, AlertTriangle, Clock } from 'lucide-react';
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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div
        className="fixed top-0 left-0 w-full sm:w-96 h-full bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
        dir="rtl"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-white" />
            <h2 className="text-lg font-bold text-white">الإشعارات</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.is_read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${notification.is_read ? 'text-gray-400' : 'text-orange-500'}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(notification.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => onMarkRead(notification.id)}
                      className="mt-2 text-xs text-emerald-600 hover:underline"
                    >
                      تعليم كمقروء
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
