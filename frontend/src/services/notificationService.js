import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notificationService = {
  // Get all notifications with pagination
  getAllNotifications: (page = 1, limit = 20) => {
    return api.get('/notifications', {
      params: { page, limit },
    });
  },

  // Get unread notifications
  getUnreadNotifications: () => {
    return api.get('/notifications/unread');
  },

  // Mark notification as read
  markAsRead: (id) => {
    return api.put(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    return api.put('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: (id) => {
    return api.delete(`/notifications/${id}`);
  },

  // Delete all notifications
  deleteAllNotifications: () => {
    return api.delete('/notifications/delete/all');
  },
};

export default notificationService;
