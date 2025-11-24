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
    });
  }

  async getSkillById(skillId: string): Promise<SkillResponse> {
    const res = await this.instance.get(`/api/skills/${skillId}`);
    return res.data;
  }

  async getAllSkills(): Promise<AllSkillsResponse> {
    const res = await this.instance.get(`/api/skills`);
    return res.data;
  }

  async searchSkills(query: string): Promise<Skill[]> {
    const { data } = await this.instance.get(`/api/skills/search?q=${query}`);
    return Array.isArray(data) ? data : [];
  }

  // ➕ ADD new skill
  async addSkill(name: string) {
    const { data } = await this.instance.post(`/api/skills`, { name });
    return data; // Created SkillResponse
  }
}

export const skillsApi = new SkillsApi();
export default skillsApi;
