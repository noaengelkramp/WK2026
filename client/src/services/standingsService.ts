import apiClient from './api';
import type { LeaderboardEntry } from '../types';

export interface StandingsResponse {
  standings: LeaderboardEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface DepartmentStandingsResponse {
  standings: any[];
  total: number;
}

export const standingsService = {
  /**
   * Get individual user standings (leaderboard)
   */
  async getIndividualStandings(params?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<StandingsResponse> {
    const response = await apiClient.get<StandingsResponse>('/standings/individual', {
      params,
    });
    return response.data;
  },

  /**
   * Get department standings
   */
  async getDepartmentStandings(): Promise<DepartmentStandingsResponse> {
    const response = await apiClient.get<DepartmentStandingsResponse>('/standings/departments');
    return response.data;
  },

  /**
   * Get top N users (for homepage)
   */
  async getTopUsers(limit: number = 5): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get<{ topUsers: LeaderboardEntry[] }>('/standings/top', {
      params: { limit },
    });
    return response.data.topUsers;
  },

  /**
   * Get current user's ranking and surrounding users
   */
  async getMyRanking(): Promise<{
    rank: number;
    totalParticipants: number;
    userStats: any;
    contextAbove: any[];
    contextBelow: any[];
  }> {
    const response = await apiClient.get('/standings/my-ranking');
    return response.data;
  },
};
