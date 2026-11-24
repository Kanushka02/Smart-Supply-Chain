import { useCallback, useEffect, useState } from 'react';
import {
  FaBell,
  FaTrash,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaRobot,
  FaCheck
} from 'react-icons/fa';
import toast from 'react-hot-toast';

import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingState from '../components/common/LoadingState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import notificationService from '../services/notificationService';
import { formatDate } from '../utils/formatters';

const FILTER_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Critical Shortages', value: 'CRITICAL_SHORTAGE' },
  { label: 'Potential Shortages', value: 'POTENTIAL_SHORTAGE' },
  { label: 'Warnings', value: 'WARNING' },
  { label: 'Info', value: 'INFO' },
  { label: 'Success', value: 'SUCCESS' }
];

function getTypeStyle(type) {
  switch (type) {
    case 'SUCCESS':
      return {
        icon: <FaCheckCircle className="text-emerald-600" />,
        iconBg: 'bg-emerald-50 border-emerald-200'
      };
    case 'CRITICAL_SHORTAGE':
    case 'ERROR':
      return {
        icon: <FaTimesCircle className="text-rose-600" />,
        iconBg: 'bg-rose-50 border-rose-200'
      };
    case 'POTENTIAL_SHORTAGE':
    case 'WARNING':
      return {
        icon: <FaExclamationTriangle className="text-amber-600" />,
        iconBg: 'bg-amber-50 border-amber-200'
      };
    default:
      return {
        icon: <FaInfoCircle className="text-indigo-600" />,
        iconBg: 'bg-indigo-50 border-indigo-200'
      };
  }
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState('ALL');
  const [confirmState, setConfirmState] = useState({ type: null, id: null });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationService.getAllNotifications(page, limit);
      setNotifications(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    const load = async () => {
      await fetchNotifications();
    };
    void load();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const executeConfirmedDelete = async () => {
    try {
      if (confirmState.type === 'ALL') {
        await notificationService.deleteAllNotifications();
        setNotifications([]);
        setTotal(0);
        setPage(1);
        toast.success('All notifications cleared');
      } else if (confirmState.id) {
        await notificationService.deleteNotification(confirmState.id);
        setNotifications((prev) =>
          prev.filter((n) => n.id !== confirmState.id)
        );
        setTotal((prev) => Math.max(0, prev - 1));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      toast.error('Failed to delete notification');
    } finally {
      setConfirmState({ type: null, id: null });
    }
  };

  const filteredNotifications =
    filterType === 'ALL'
      ? notifications
      : notifications.filter((notif) => notif.type === filterType);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-sm text-slate-500">
          Real-time order updates, AI stockout risk alerts, and system activity history.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <FaCheck className="text-indigo-600" />
              Mark All Read
            </button>
          )}
          {total > 0 && (
            <button
              type="button"
              onClick={() => setConfirmState({ type: 'ALL', id: null })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
            >
              <FaTrash className="text-[11px]" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-3.5 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setFilterType(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filterType === tab.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-medium text-slate-400 tabular-nums">
          {total} total · {unreadCount} unread
        </span>
      </div>

      {loading && notifications.length === 0 ? (
        <LoadingState label="Loading notifications" />
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const style = getTypeStyle(notification.type);
            const isAiAlert =
              notification.type === 'CRITICAL_SHORTAGE' ||
              notification.type === 'POTENTIAL_SHORTAGE';

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-card transition ${
                  notification.isRead
                    ? 'border-slate-200/80'
                    : 'border-indigo-300 ring-2 ring-indigo-500/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base shrink-0 ${style.iconBg}`}
                    >
                      {style.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                          {notification.title}
                        </h3>
                        {isAiAlert && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              notification.type === 'CRITICAL_SHORTAGE'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <FaRobot className="text-[10px]" />
                            AI Alert
                          </span>
                        )}
                        {!notification.isRead && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            Unread
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {notification.message}
                      </p>

                      <p className="text-xs text-slate-400 mt-2">
                        {formatDate(notification.createdAt)} ·{' '}
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                      >
                        <FaCheck className="text-[10px]" />
                        Mark Read
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Delete notification"
                      onClick={() =>
                        setConfirmState({ type: 'SINGLE', id: notification.id })
                      }
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">
            <FaBell />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-800 mb-1">
            {total === 0 ? 'No notifications yet' : 'No matching notifications'}
          </h3>
          <p className="text-sm text-slate-500">
            {total === 0
              ? 'Order confirmations and AI stockout alerts will show up here.'
              : 'Try selecting another filter tab above.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-500 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmState.type)}
        title={
          confirmState.type === 'ALL'
            ? 'Clear all notifications'
            : 'Delete notification'
        }
        message={
          confirmState.type === 'ALL'
            ? 'Delete every notification in your inbox? This cannot be undone.'
            : 'Remove this notification permanently?'
        }
        confirmText={confirmState.type === 'ALL' ? 'Clear All' : 'Delete'}
        onCancel={() => setConfirmState({ type: null, id: null })}
        onConfirm={executeConfirmedDelete}
      />
    </DashboardLayout>
  );
}

export default NotificationsPage;
