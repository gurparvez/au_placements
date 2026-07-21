// src/api/skills.ts
import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';

export interface Skill {
  _id: string;
  name: string;
  displayName?: string;
  __v?: number;
}

export interface SkillResponse {
  success: boolean;
  skill: Skill;
}

export interface AllSkillsResponse {
  success: boolean;
  skills: {
    _id: string;
    name: string;
    displayName?: string;
  }[];
}

export class SkillsApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: URL,
      withCredentials: true, // send the auth cookie for protected routes (POST /skills)
      timeout: 15000,
    });
  }

  async getSkillById(skillId: string): Promise<SkillResponse> {
    const res = await this.instance.get(`/api/skills/${skillId}`);
    // Backend returns { success, data: skill }
    return { success: res.data.success, skill: res.data.data };
  }

  async getAllSkills(options?: { signal?: AbortSignal }): Promise<AllSkillsResponse> {
    const res = await this.instance.get(`/api/skills`, { signal: options?.signal });
    // Backend returns { success, data: [...], pagination }
    return { success: res.data.success, skills: res.data.data };
  }

  async searchSkills(query: string): Promise<Skill[]> {
    const { data } = await this.instance.get(`/api/skills/search?q=${query}`);
    // Backend returns { success, data: [...] }
    return Array.isArray(data.data) ? data.data : [];
  }

  async addSkill(name: string) {
    const { data } = await this.instance.post(`/api/skills`, { name });
    return data.data;
  }

  async updateSkill(id: string, name: string): Promise<Skill> {
    const { data } = await this.instance.put(`/api/skills/${id}`, { name });
    return data.data;
  }

  async deleteSkill(id: string): Promise<void> {
    await this.instance.delete(`/api/skills/${id}`);
  }
}

export const skillsApi = new SkillsApi();
export default skillsApi;
