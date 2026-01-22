import apiClient from './api';
import type { Team, Match, Department, ScoringRule, BonusQuestion } from '../types';

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

  /**
   * Get all scoring rules
   */
  async getScoringRules(): Promise<ScoringRule[]> {
    const response = await apiClient.get<{ success: boolean; count: number; scoringRules: ScoringRule[] }>('/scoring-rules');
    return response.data.scoringRules;
  },

  /**
   * Get scoring rule for a specific stage
   */
  async getScoringRuleByStage(stage: string): Promise<ScoringRule> {
    const response = await apiClient.get<{ success: boolean; scoringRule: ScoringRule }>(`/scoring-rules/${stage}`);
    return response.data.scoringRule;
  },

  /**
   * Get all bonus questions
   */
  async getBonusQuestions(): Promise<BonusQuestion[]> {
    const response = await apiClient.get<{ success: boolean; count: number; bonusQuestions: BonusQuestion[] }>('/bonus-questions');
    return response.data.bonusQuestions;
  },
};
