import { api } from './api';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'leader' | 'freelancer';
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  userSkills?: Array<{
    level: string;
    skill: {
      id: string;
      name: string;
    };
  }>;
  skills?: Array<{
    level: string;
    skill: {
      id: string;
      name: string;
    };
  }>;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'leader' | 'freelancer';
  bio?: string;
  avatarUrl?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const authData = response.data.data;
    
    // Store tokens
    Cookies.set('access_token', authData.access_token);
    Cookies.set('refresh_token', authData.refresh_token);
    
    return authData;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    const authData = response.data.data;
    
    // Store tokens
    Cookies.set('access_token', authData.access_token);
    Cookies.set('refresh_token', authData.refresh_token);
    
    return authData;
  },

  logout(): void {
    // Remove tokens
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/profile', data);
    return response.data.data;
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('access_token');
  },

  getToken(): string | undefined {
    return Cookies.get('access_token');
  }
}; 