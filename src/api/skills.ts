// src/api/skills.ts
import axios, { type AxiosInstance } from "axios";
import { URL } from "../constants";

export interface SkillResponse {
  success: boolean;
  skill: {
    _id: string;
    name: string;
    displayName?: string;
    __v?: number;
  };
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
}

export const skillsApi = new SkillsApi();
export default skillsApi;
