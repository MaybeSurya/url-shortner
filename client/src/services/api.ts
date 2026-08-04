import axios, { AxiosError } from 'axios';
import { 
  User, 
  Link, 
  Domain, 
  CreateLinkPayload, 
  EditLinkPayload, 
  LinkStatsResponse, 
  UserAdmin, 
  DomainAdmin, 
  LinkAdmin,
  AdminSettings,
} from '../types';

// Centralized Axios Instance configured for Express Backend
export const api = axios.create({
  baseURL: '/api/v2',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to extract clean error message from API response
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error || error.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (error.response?.status === 401) return 'Unauthorized session. Please log in.';
    if (error.response?.status === 403) return 'You do not have permission to perform this action.';
    if (error.response?.status === 404) return 'Requested resource not found.';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred. Please try again.';
}

export const authService = {
  async login(payload: { email: string; password?: string }): Promise<{ token: string; user?: User }> {
    const response = await api.post('/auth/login', payload);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async signup(payload: { email: string; password?: string }): Promise<{ message: string }> {
    const response = await api.post('/auth/signup', payload);
    return response.data;
  },

  async createAdmin(payload: { email: string; password?: string }): Promise<{ token: string }> {
    const response = await api.post('/auth/create-admin', payload);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/users');
    return response.data;
  },

  async changePassword(payload: { currentpassword?: string; newpassword?: string }): Promise<void> {
    await api.post('/auth/change-password', payload);
  },

  async changeEmail(payload: { email: string; password?: string }): Promise<void> {
    await api.post('/auth/change-email', payload);
  },

  async generateApiKey(): Promise<{ apikey: string }> {
    const response = await api.post('/auth/apikey');
    return response.data;
  },

  async resetPassword(payload: { email: string }): Promise<void> {
    await api.post('/auth/reset-password', payload);
  },

  async newPassword(payload: { reset_password_token: string; newpassword?: string }): Promise<void> {
    await api.post('/auth/new-password', payload);
  },

  async deleteAccount(payload: { password?: string }): Promise<void> {
    await api.post('/users/delete', payload);
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    window.location.href = '/logout';
  },
};

export const linkService = {
  async getLinks(params?: { limit?: number; skip?: number; search?: string }): Promise<{ total: number; limit: number; skip: number; data: Link[] }> {
    const response = await api.get('/links', { params });
    return response.data;
  },

  async createLink(payload: CreateLinkPayload): Promise<Link> {
    const response = await api.post('/links', payload);
    return response.data;
  },

  async editLink(id: string, payload: EditLinkPayload): Promise<Link> {
    const response = await api.patch(`/links/${id}`, payload);
    return response.data;
  },

  async deleteLink(id: string): Promise<void> {
    await api.delete(`/links/${id}`);
  },

  async getLinkStats(id: string): Promise<LinkStatsResponse> {
    const response = await api.get(`/links/${id}/stats`);
    return response.data;
  },

  async reportLink(payload: { target: string; reason?: string }): Promise<void> {
    await api.post('/links/report', payload);
  },
};

export const domainService = {
  async getDomains(): Promise<Domain[]> {
    const response = await api.get('/users');
    return response.data.domains || [];
  },

  async addDomain(payload: { address: string; homepage?: string }): Promise<Domain> {
    const response = await api.post('/domains', payload);
    return response.data;
  },

  async deleteDomain(id: string): Promise<void> {
    await api.delete(`/domains/${id}`);
  },
};

export const adminService = {
  async getUsers(params?: { limit?: number; skip?: number; search?: string; role?: string }): Promise<{ total: number; limit: number; skip: number; data: UserAdmin[] }> {
    const response = await api.get('/users/admin', { params });
    return response.data;
  },

  async createUser(payload: { email: string; password?: string; role?: string; verified?: boolean }): Promise<void> {
    await api.post('/users/admin', payload);
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/admin/${id}`);
  },

  async banUser(id: string, payload?: { links?: boolean; domains?: boolean }): Promise<void> {
    await api.post(`/users/admin/ban/${id}`, payload);
  },

  async getLinks(params?: { limit?: number; skip?: number; search?: string; user?: string; domain?: string }): Promise<{ total: number; limit: number; skip: number; data: LinkAdmin[] }> {
    const response = await api.get('/links/admin', { params });
    return response.data;
  },

  async editLink(id: string, payload: EditLinkPayload): Promise<Link> {
    const response = await api.patch(`/links/admin/${id}`, payload);
    return response.data;
  },

  async banLink(id: string): Promise<void> {
    await api.post(`/links/admin/ban/${id}`);
  },

  async getDomains(params?: { limit?: number; skip?: number; search?: string }): Promise<{ total: number; limit: number; skip: number; data: DomainAdmin[] }> {
    const response = await api.get('/domains/admin', { params });
    return response.data;
  },

  async addDomain(payload: { address: string; homepage?: string }): Promise<Domain> {
    const response = await api.post('/domains/admin', payload);
    return response.data;
  },

  async deleteDomain(id: string): Promise<void> {
    await api.delete(`/domains/admin/${id}`);
  },

  async banDomain(id: string): Promise<void> {
    await api.post(`/domains/admin/ban/${id}`);
  },

  async getSettings(): Promise<AdminSettings> {
    const response = await api.get('/admin/settings');
    return response.data;
  },
};
