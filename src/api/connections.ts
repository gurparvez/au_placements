import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';
import type { ChatUser } from './messages';
import { createHttp } from './http';

export type ConnStatus = 'none' | 'pending' | 'outgoing' | 'incoming' | 'connected' | 'self';

export interface ConnectionEntry { connectionId: string; user: ChatUser; since?: string; createdAt?: string; }
export interface PendingLists { incoming: ConnectionEntry[]; outgoing: ConnectionEntry[]; }

class ConnectionsApi {
  private instance: AxiosInstance;
  constructor() { this.instance = createHttp(); }

  async status(userId: string): Promise<{ status: ConnStatus; connectionId?: string }> {
    const res = await this.instance.get(`/api/connections/status/${userId}`);
    return res.data.data;
  }
  async request(userId: string): Promise<void> {
    await this.instance.post('/api/connections', { userId });
  }
  async respond(connectionId: string, accept: boolean): Promise<void> {
    await this.instance.patch(`/api/connections/${connectionId}/respond`, { accept });
  }
  async remove(userId: string): Promise<void> {
    await this.instance.delete(`/api/connections/${userId}`);
  }
  async list(): Promise<ConnectionEntry[]> {
    const res = await this.instance.get('/api/connections');
    return res.data.data;
  }
  async pending(): Promise<PendingLists> {
    const res = await this.instance.get('/api/connections/pending');
    return res.data.data;
  }
}

const connectionsApi = new ConnectionsApi();
export default connectionsApi;
