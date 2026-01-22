import apiClient from './api';
import { Prediction, BonusQuestion } from '../types';

export interface PredictionSubmission {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface BonusAnswerSubmission {
  bonusQuestionId: string;
  answer: string;
}

export interface PredictionStats {
  totalPredictions: number;
  finishedMatches: number;
  exactScores: number;
  correctWinners: number;
  completionPercentage: number;
  remainingMatches: number;
}

export const predictionService = {
  /**
   * Get current user's predictions
   */
  async getMyPredictions(): Promise<{
    predictions: Prediction[];
    bonusAnswers: any[];
    totalPredictions: number;
  }> {
    const response = await apiClient.get('/predictions/my');
    return response.data;
  },

  /**
   * Submit or update a match prediction
   */
  async submitPrediction(data: PredictionSubmission): Promise<Prediction> {
    const response = await apiClient.post<{ prediction: Prediction }>('/predictions', data);
    return response.data.prediction;
  },

  /**
   * Submit or update bonus answer
   */
  async submitBonusAnswer(data: BonusAnswerSubmission): Promise<any> {
    const response = await apiClient.post('/predictions/bonus', data);
    return response.data.bonusAnswer;
  },

  /**
   * Get prediction statistics
   */
  async getMyStatistics(): Promise<PredictionStats> {
    const response = await apiClient.get<PredictionStats>('/predictions/my/statistics');
    return response.data;
  },

  /**
   * Delete a prediction
   */
  async deletePrediction(matchId: string): Promise<void> {
    await apiClient.delete(`/predictions/${matchId}`);
  },

  /**
   * Get all bonus questions
   */
  async getBonusQuestions(): Promise<BonusQuestion[]> {
    const response = await apiClient.get<{ bonusQuestions: BonusQuestion[] }>('/bonus-questions');
    return response.data.bonusQuestions;
  },
};
