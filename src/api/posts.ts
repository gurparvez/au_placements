import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';

export const REACTION_TYPES = ['like', 'celebrate', 'support', 'insightful', 'funny', 'love'] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export interface PostAuthor {
  _id: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface PostLink {
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface Post {
  _id: string;
  author: PostAuthor;
  content: string;
  links: PostLink[];
  media: PostMedia[];
  mentions: PostAuthor[];
  shared_post?: Post | null;
  archived?: boolean;
  reaction_count: number;
  comment_count: number;
  share_count: number;
  my_reaction: ReactionType | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: PostAuthor;
  content: string;
  mentions: PostAuthor[];
  parent?: string | null;
  reaction_count: number;
  my_reaction: ReactionType | null;
  createdAt: string;
}

export interface Pagination { page: number; limit: number; total: number; totalPages: number; }
export interface FeedResponse { success: boolean; data: Post[]; pagination: Pagination; }

export interface PostMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface CreatePostPayload {
  content: string;
  links?: PostLink[];
  mentions?: string[];
  images?: File[];
}

export interface MentionUser { _id: string; firstName?: string; lastName?: string; roles?: string[]; }

class PostsApi {
  private instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({ baseURL: URL, withCredentials: true, timeout: 15000 });
  }

  async feed(params?: { page?: number; limit?: number }): Promise<FeedResponse> {
    const res = await this.instance.get<FeedResponse>('/api/posts', { params });
    return res.data;
  }
  async listByUser(userId: string, params?: { page?: number; limit?: number }): Promise<FeedResponse> {
    const res = await this.instance.get<FeedResponse>(`/api/posts/user/${userId}`, { params });
    return res.data;
  }
  async create(payload: CreatePostPayload): Promise<Post> {
    if (payload.images && payload.images.length) {
      const fd = new FormData();
      fd.append('content', payload.content ?? '');
      if (payload.mentions?.length) fd.append('mentions', JSON.stringify(payload.mentions));
      payload.images.forEach((img) => fd.append('images', img));
      const res = await this.instance.post<{ data: Post }>('/api/posts', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    }
    const res = await this.instance.post<{ data: Post }>('/api/posts', { content: payload.content, mentions: payload.mentions });
    return res.data.data;
  }
  async remove(id: string): Promise<void> {
    await this.instance.delete(`/api/posts/${id}`);
  }
  async archive(id: string, archived: boolean): Promise<Post> {
    const res = await this.instance.patch<{ data: Post }>(`/api/posts/${id}/archive`, { archived });
    return res.data.data;
  }
  async share(id: string, quote?: string): Promise<Post> {
    const res = await this.instance.post<{ data: Post }>(`/api/posts/${id}/share`, { quote });
    return res.data.data;
  }
  async react(id: string, type: ReactionType): Promise<{ my_reaction: ReactionType | null; reaction_count: number }> {
    const res = await this.instance.post(`/api/posts/${id}/react`, { type });
    return res.data.data;
  }
  async listComments(id: string): Promise<Comment[]> {
    const res = await this.instance.get<{ data: Comment[] }>(`/api/posts/${id}/comments`);
    return res.data.data;
  }
  async addComment(id: string, payload: { content: string; parent?: string; mentions?: string[] }): Promise<Comment> {
    const res = await this.instance.post<{ data: Comment }>(`/api/posts/${id}/comments`, payload);
    return res.data.data;
  }
  async deleteComment(commentId: string): Promise<void> {
    await this.instance.delete(`/api/comments/${commentId}`);
  }
  async reactComment(commentId: string, type: ReactionType): Promise<{ my_reaction: ReactionType | null; reaction_count: number }> {
    const res = await this.instance.post(`/api/comments/${commentId}/react`, { type });
    return res.data.data;
  }
  async searchMentions(q: string): Promise<MentionUser[]> {
    const res = await this.instance.get<{ data: MentionUser[] }>('/api/users/search', { params: { q } });
    return res.data.data;
  }
}

const postsApi = new PostsApi();
export default postsApi;
