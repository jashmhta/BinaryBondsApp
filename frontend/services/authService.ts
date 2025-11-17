/**
 * Authentication Service
 */
import { apiService } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  has_pin: boolean;
  preferences: {
    theme: string;
    notifications_enabled: boolean;
  };
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/api/auth/register', data);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/api/auth/login', credentials);
  }

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/api/auth/me');
  }

  async setPin(pin: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('/api/auth/set-pin', { pin });
  }

  async verifyPin(pin: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('/api/auth/verify-pin', { pin });
  }
}

export const authService = new AuthService();
