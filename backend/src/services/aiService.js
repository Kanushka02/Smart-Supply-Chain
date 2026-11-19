const axios = require('axios');

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Check if the AI Microservice is online and healthy.
 */
exports.checkHealth = async () => {
  try {
    const response = await aiClient.get('/health');
    return response.data;
  } catch (error) {
    return {
      status: 'offline',
      service: 'AI Demand Forecasting Microservice',
      model_loaded: false,
      error: error.message
    };
  }
};

/**
 * Retrieve model metadata and evaluation metrics from FastAPI.
 */
exports.getModelInfo = async () => {
  try {
    const response = await aiClient.get('/model-info');
    return response.data;
  } catch (error) {
    throw new Error(`AI_SERVICE_ERROR: Failed to retrieve model info: ${error.message}`);
  }
};

/**
 * Send a demand forecasting request to the FastAPI microservice.
 * @param {Object} params - { price, stock, orders, lag1Orders, rollingMean3, month, productName }
 */
exports.getDemandPrediction = async (params) => {
  try {
    const response = await aiClient.post('/predict', params);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new Error(
        'AI_SERVICE_UNAVAILABLE: The AI Forecasting service is currently unreachable. Please ensure the Python service is running on port 8000.'
      );
    }
    if (error.response?.data?.detail) {
      throw new Error(`AI_SERVICE_VALIDATION_ERROR: ${JSON.stringify(error.response.data.detail)}`);
    }
    throw new Error(`AI_SERVICE_ERROR: ${error.message}`);
  }
};
