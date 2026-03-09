import axios from 'axios';

// Task 4: Axios instance — communicates with Express REST API
const api = axios.create({ baseURL: 'http://localhost:5000/api' });

// Inject JWT on every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('apollonia_user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Only redirect on real 401 errors
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('apollonia_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;