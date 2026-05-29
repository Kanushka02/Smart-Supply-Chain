import API from './api';

export const getProducts =
() => API.get('/products');

export const getUsers =
() => API.get('/users');

export const getOrders =
() => API.get('/orders');