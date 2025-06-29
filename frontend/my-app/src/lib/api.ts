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
  },

  async getMyProjects() {
    const response = await api.get('/projects/my-projects');
    return response.data.data;
  },

  // Leader-specific functions
  async createProject(projectData: { title: string; description: string }) {
    const response = await api.post('/projects', projectData);
    return response.data.data;
  },

  async updateProject(projectId: string, projectData: { title?: string; description?: string; status?: string }) {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data.data;
  },

  async deleteProject(projectId: string) {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  async getProjectApplications(projectId: string) {
    const response = await api.get(`/projects/${projectId}/applications`);
    return response.data.data;
  },

  async updateApplicationStatus(projectId: string, applicationId: string, statusData: { status: string; roleTitle?: string }) {
    const response = await api.put(`/projects/${projectId}/applications/${applicationId}/status`, statusData);
    return response.data.data;
  },

  // New features
  async completeProject(projectId: string) {
    const response = await api.put(`/projects/${projectId}/complete`);
    return response.data.data;
  },

  async rateUser(projectId: string, ratingData: { ratedUserId: string; rating: number; comment?: string }) {
    const response = await api.post(`/projects/${projectId}/rate`, ratingData);
    return response.data.data;
  },

  async getProjectRatings(projectId: string) {
    const response = await api.get(`/projects/${projectId}/ratings`);
    return response.data.data;
  },

  async getRecommendedProjects() {
    const response = await api.get('/projects/recommended');
    return response.data.data;
  },

  // Updated create project to support required skills
  async createProjectWithSkills(projectData: { 
    title: string; 
    description: string; 
    requiredSkills?: Array<{ skillId: string; requiredLevel: 'beginner' | 'intermediate' | 'expert' }> 
  }) {
    const response = await api.post('/projects', projectData);
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
  },

  // Leader-specific team management
  async updateTeamMember(projectId: string, teamId: string, memberData: { roleTitle: string }) {
    const response = await api.put(`/teams/projects/${projectId}/members/${teamId}`, memberData);
    return response.data.data;
  },

  async removeTeamMember(projectId: string, teamId: string) {
    const response = await api.delete(`/teams/projects/${projectId}/members/${teamId}`);
    return response.data;
  }
};

// Users API
export const usersApi = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data.data;
  },

  async updateProfile(profileData: { bio?: string; avatarUrl?: string }) {
    const response = await api.put('/users/profile', profileData);
    return response.data.data;
  },

  async getMySkills() {
    const response = await api.get('/users/skills/my-skills');
    return response.data.data;
  },

  async addSkill(skillData: { skillId: string; level: 'beginner' | 'intermediate' | 'expert' }) {
    const response = await api.post('/users/skills', skillData);
    return response.data.data;
  },

  async removeSkill(skillId: string) {
    const response = await api.delete(`/users/skills/${skillId}`);
    return response.data;
  },

  // New feature: Get detailed user profile with ratings
  async getUserProfile(userId: string) {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data.data;
  }
};

// Skills API
export const skillsApi = {
  async getAllSkills() {
    const response = await api.get('/skills');
    return response.data.data;
  }
};

