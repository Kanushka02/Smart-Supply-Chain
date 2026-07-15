import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaTrash, FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import notificationService from '../services/notificationService';
import LoadingState from '../components/common/LoadingState';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getAllNotifications(page, limit);
      setNotifications(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      setTotal((prev) => prev - 1);
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) {
      return;
    }

    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setTotal(0);
      setPage(1);
      toast.success('All notifications deleted');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Failed to delete all notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <FaCheckCircle className="text-green-500" />;
      case 'WARNING':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'ERROR':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'WARNING':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'ERROR':
        return 'bg-red-50 border-l-4 border-red-500';
      default:
        return 'bg-blue-50 border-l-4 border-blue-500';
    }
  };

  const filteredNotifications =
    filterType === 'ALL'
      ? notifications
      : notifications.filter((notif) => notif.type === filterType);

  const totalPages = Math.ceil(total / limit);

  if (loading && notifications.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaBell className="text-2xl text-primary" />
          <h1 className="text-3xl font-bold text-secondary">Notifications</h1>
        </div>
        <div className="flex gap-2">
          {total > 0 && (
            <button
              onClick={handleDeleteAll}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Delete All
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Back
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        {['ALL', 'SUCCESS', 'INFO', 'WARNING', 'ERROR'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilterType(type);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === type
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-card hover:shadow-lg transition ${getNotificationBgColor(
                notification.type
              )} ${!notification.isRead ? 'ring-2 ring-primary ring-opacity-30' : ''}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="text-2xl mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">
                      {notification.message}
                    </p>
                    <span className="text-sm text-gray-500 mt-2 inline-block">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition text-sm whitespace-nowrap"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {total === 0 ? 'No notifications yet' : 'No notifications matching the filter'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, page - 2) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition ${
                    pageNum === page
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>

          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
