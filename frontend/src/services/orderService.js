import API from './api';

export const getOrders =
() => API.get('/orders');

export const getSupplierOrders =
(userId) =>
API.get(
  `/orders/user/${userId}`
);

export const createOrder =
(data) =>
API.post('/orders', data);

export const deleteOrder =
(id) =>
API.delete(
  `/orders/${id}`
);