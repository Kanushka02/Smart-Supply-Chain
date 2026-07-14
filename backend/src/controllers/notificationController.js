const {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require('../services/notificationService');

// GET ALL NOTIFICATIONS
exports.getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await getNotifications(userId, limit, offset);

    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
};

// GET UNREAD NOTIFICATIONS
exports.getUnreadNotificationsCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await getUnreadCount(userId);
    const notifications = await getUnreadNotifications(userId);

    res.status(200).json({
      success: true,
      unreadCount: count,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notifications',
    });
  }
};

// MARK NOTIFICATION AS READ
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await markAsRead(parseInt(id));

    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
};

// MARK ALL NOTIFICATIONS AS READ
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await markAllAsRead(userId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
    });
  }
};

// DELETE NOTIFICATION
exports.deleteNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await deleteNotification(parseInt(id));

    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
    });
  }
};

// DELETE ALL NOTIFICATIONS
exports.deleteAllNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await deleteAllNotifications(userId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'All notifications deleted',
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all notifications',
    });
  }
};
