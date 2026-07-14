const prisma = require("../config/prisma");

exports.createNotification = async (
  userId,
  title,
  message,
  type = "INFO"
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

exports.getNotifications = async (userId, limit = 20, offset = 0) => {
  try {
    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

exports.getUnreadNotifications = async (userId) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: "desc" },
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    throw error;
  }
};

exports.getUnreadCount = async (userId) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

exports.markAsRead = async (notificationId) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

exports.markAllAsRead = async (userId) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return result;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

exports.deleteNotification = async (notificationId) => {
  try {
    const notification = await prisma.notification.delete({
      where: { id: notificationId },
    });

    return notification;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

exports.deleteAllNotifications = async (userId) => {
  try {
    const result = await prisma.notification.deleteMany({
      where: { userId },
    });

    return result;
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    throw error;
  }
};
