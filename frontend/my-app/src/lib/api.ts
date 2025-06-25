import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:3000/api'; // Backend port

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data.data;
          Cookies.set('access_token', access_token);
          Cookies.set('refresh_token', newRefreshToken);

          // Retry the original request
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// Projects API
export const projectsApi = {
  async getProjects() {
    const response = await api.get('/projects');
    return response.data.data;
  },

  async getProjectById(projectId: string) {
    const response = await api.get(`/projects/${projectId}`);
    return response.data.data;
  },

  async applyToProject(projectId: string) {
    const response = await api.post(`/projects/${projectId}/applications`);
    return response.data;
  },

  async getMyApplications() {
    const response = await api.get('/projects/my-applications');
    return response.data.data;
  }
};

// Teams API
export const teamsApi = {
  async getTeamMembers(projectId: string) {
    const response = await api.get(`/teams/projects/${projectId}`);
    return response.data.data;
  },

  async getMyTeamMemberships() {
    const response = await api.get('/teams/my-memberships');
    return response.data.data;
  }
};

