import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';
import type { ChatUser } from './messages';

export type NotificationType =
  | 'reaction' | 'comment' | 'reply' | 'mention' | 'message' | 'recruiter_approved' | 'recruiter_rejected'
  | 'connection_request' | 'connection_accepted' | 'follow';

export interface AppNotification {
  _id: string;
  actor?: ChatUser;
  type: NotificationType;
  entity?: { kind: 'post' | 'comment' | 'message' | 'opening' | 'user'; id: string };
  text?: string;
  read: boolean;
  createdAt: string;
}

class NotificationsApi {
  private instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({ baseURL: URL, withCredentials: true, timeout: 15000 });
  }

  async list(): Promise<{ items: AppNotification[]; unread: number }> {
    const res = await this.instance.get('/api/notifications', { params: { limit: 20 } });
    return { items: res.data.data, unread: res.data.unread };
  }
  async unreadCount(): Promise<number> {
    const res = await this.instance.get('/api/notifications/unread-count');
    return res.data.data.count;
  }
  async markRead(ids?: string[]): Promise<number> {
    const res = await this.instance.post('/api/notifications/read', { ids });
    return res.data.data.unread;
  }
}

const notificationsApi = new NotificationsApi();
export default notificationsApi;
