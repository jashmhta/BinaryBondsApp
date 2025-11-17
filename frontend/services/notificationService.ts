/**
 * Notification Service
 */
import { apiService } from './api';

export interface Notification {
  _id: string;
  type: 'interest_payout' | 'maturity_alert' | 'rating_change';
  title: string;
  message: string;
  date: string;
  is_read: boolean;
}

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    return apiService.get<Notification[]>('/api/notifications/list');
  }

  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    return apiService.post(`/api/notifications/mark-read/${notificationId}`);
  }

  async markAllAsRead(): Promise<{ success: boolean }> {
    return apiService.post('/api/notifications/mark-all-read');
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return apiService.get('/api/notifications/unread-count');
  }
}

export const notificationService = new NotificationService();
