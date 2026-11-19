import API from './api';

/**
 * Fetch AI Microservice health status.
 */
export const getAiServiceStatus = () =>
  API.get('/forecast/status');

/**
 * Fetch batch demand forecasts and summary for all accessible products.
 */
export const getBatchForecast = () =>
  API.get('/forecast');

/**
 * Fetch demand forecast and stock risk evaluation for a single product.
 */
export const getProductForecast = (productId) =>
  API.get(`/forecast/${productId}`);
