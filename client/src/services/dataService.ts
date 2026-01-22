import apiClient from './api';
import { Team, Match, Department } from '../types';

export const dataService = {
  /**
   * Get all teams, optionally filtered by group
   */
  async getTeams(group?: string): Promise<Team[]> {
    const params = group ? { group } : {};
    const response = await apiClient.get<{ teams: Team[] }>('/teams', { params });
    return response.data.teams;
  },

  /**
   * Get single team by ID
   */
  async getTeam(id: string): Promise<Team> {
    const response = await apiClient.get<{ team: Team }>(`/teams/${id}`);
    return response.data.team;
  },

  /**
   * Get all matches with optional filters
   */
  async getMatches(filters?: {
    stage?: string;
    status?: string;
    group?: string;
  }): Promise<Match[]> {
    const response = await apiClient.get<{ matches: Match[] }>('/matches', {
      params: filters,
    });
    return response.data.matches;
  },

  /**
   * Get upcoming matches
   */
  async getUpcomingMatches(limit: number = 5): Promise<Match[]> {
    const response = await apiClient.get<{ matches: Match[] }>('/matches/upcoming', {
      params: { limit },
    });
    return response.data.matches;
  },

  /**
   * Get single match by ID
   */
  async getMatch(id: string): Promise<Match> {
    const response = await apiClient.get<{ match: Match }>(`/matches/${id}`);
    return response.data.match;
  },

  /**
   * Get all departments
   */
  async getDepartments(): Promise<Department[]> {
    const response = await apiClient.get<{ departments: Department[] }>('/departments');
    return response.data.departments;
  },

  /**
   * Get single department by ID
   */
  async getDepartment(id: string): Promise<Department> {
    const response = await apiClient.get<{ department: Department }>(`/departments/${id}`);
    return response.data.department;
  },
};
