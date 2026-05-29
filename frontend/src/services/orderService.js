import API from './api';

export const getOrders =
() => API.get('/orders');

export const deleteOrder =
(id) =>
API.delete(`/orders/${id}`);