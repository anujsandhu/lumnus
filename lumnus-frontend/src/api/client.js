import axios from 'axios';

/**
 * Smart API client for AlumniConnect.
 *
 * On localhost → tries local backend, falls back to Render production.
 * On production (lumnus-web.web.app) → uses Render directly.
 */
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

const RENDER_URL = 'https://lumnus-backend.onrender.com/api';

// Detect which local port the backend is running on
let localBaseURL = null;

async function detectLocalBackend() {
  const ports = [5050, 5051, 5001, 5000, 3001];
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}/api/health`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        localBaseURL = `http://localhost:${port}/api`;
        console.log(`[API] Connected to local backend on port ${port}`);
        return localBaseURL;
      }
    } catch {
      // port not available, try next
    }
  }
  console.log('[API] No local backend found, using Render');
  return null;
}

// Start detection immediately on localhost
const localDetection = isLocalhost ? detectLocalBackend() : Promise.resolve(null);

const api = axios.create({
  baseURL: isLocalhost ? 'http://localhost:5050/api' : RENDER_URL,
  timeout: isLocalhost ? 8000 : 60000,
});

// Before the first request, wait for local port detection to complete
let detectionDone = false;

api.interceptors.request.use(async (config) => {
  // Attach JWT
  const token = localStorage.getItem('ac_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // On localhost: wait for port detection once, then set baseURL
  if (isLocalhost && !detectionDone) {
    await localDetection;
    detectionDone = true;
    if (localBaseURL) {
      api.defaults.baseURL = localBaseURL;
    } else {
      api.defaults.baseURL = RENDER_URL;
      api.defaults.timeout = 60000;
    }
    config.baseURL = api.defaults.baseURL;
    config.timeout = api.defaults.timeout;
  }

  return config;
});

// Response interceptor: fallback to Render if local backend dies mid-session
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      isLocalhost &&
      (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || !error.response) &&
      originalRequest &&
      !originalRequest._retryFallback &&
      originalRequest.baseURL !== RENDER_URL
    ) {
      originalRequest._retryFallback = true;
      originalRequest.baseURL = RENDER_URL;
      originalRequest.timeout = 60000;
      return axios(originalRequest);
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
      error.message = 'Cannot reach the server. Please check your connection and try again.';
    }

    return Promise.reject(error);
  }
);

export default api;
