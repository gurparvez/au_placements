import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';
import { createHttp } from './http';

export interface ChatUser { _id: string; firstName?: string; lastName?: string; roles?: string[]; }

export interface Conversation {
  _id: string;
  other: ChatUser | null;
  last_message?: { text: string; sender: string; sent_at: string };
  last_activity: string;
  unread: number;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: ChatUser;
  content: string;
  read_by: string[];
  createdAt: string;
}

class MessagesApi {
  private instance: AxiosInstance;
  constructor() {
    this.instance = createHttp();
  }

  async listConversations(): Promise<Conversation[]> {
    const res = await this.instance.get<{ data: Conversation[] }>('/api/conversations');
    return res.data.data;
  }
  async start(userId: string): Promise<Conversation> {
    const res = await this.instance.post<{ data: Conversation }>('/api/conversations', { userId });
    return res.data.data;
  }
  async listMessages(conversationId: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    const res = await this.instance.get<{ data: { conversation: Conversation; messages: Message[] } }>(`/api/conversations/${conversationId}/messages`);
    return res.data.data;
  }
  async send(conversationId: string, content: string): Promise<Message> {
    const res = await this.instance.post<{ data: Message }>(`/api/conversations/${conversationId}/messages`, { content });
    return res.data.data;
  }
}

const messagesApi = new MessagesApi();
export default messagesApi;
