import axios
from 'axios';

const API =
axios.create({

  baseURL:
  'http://localhost:5000/api'
});

const AUTH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh'
]);

/*
JWT AUTO ATTACH
*/

API.interceptors.request
.use(

(config) => {

  const token =
  localStorage.getItem(
    'token'
  );

  if (token) {

    config.headers
    .Authorization =
    `Bearer ${token}`;
  }

  return config;
},

(error) =>
Promise.reject(
  error
)

);

API.interceptors.response
.use(

  (response) => response,

  async (error) => {

    const originalRequest =
    error.config;
    const requestPath =
      originalRequest?.url || '';
    const isAuthRequest =
      AUTH_PATHS.has(requestPath);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {

      originalRequest._retry = true;

      try {

        const refreshToken =
        localStorage.getItem(
          'refreshToken'
        );

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const res =
        await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {
            refreshToken
          }
        );

        const newToken =
        res.data.accessToken;

        localStorage.setItem(
          'token',
          newToken
        );

        originalRequest.headers =
        originalRequest.headers || {};

        originalRequest.headers.Authorization =
        `Bearer ${newToken}`;

        return API(originalRequest);

      } catch {

        localStorage.clear();

        window.location =
        '/login';
      }
    }

    return Promise.reject(
      error
    );
  }

);

export default API;