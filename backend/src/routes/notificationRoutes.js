const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getAllNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  deleteAllNotificationsForUser,
} = require('../controllers/notificationController');

// Protected routes
router.use(authMiddleware);

// GET all notifications with pagination
router.get('/', getAllNotifications);

// GET unread notifications
router.get('/unread', getUnreadNotificationsCount);

// MARK notification as read
router.put('/:id/read', markNotificationAsRead);

// MARK all as read
router.put('/read-all', markAllNotificationsAsRead);

// DELETE notification
router.delete('/:id', deleteNotificationById);

// DELETE all notifications
router.delete('/delete/all', deleteAllNotificationsForUser);

module.exports = router;
