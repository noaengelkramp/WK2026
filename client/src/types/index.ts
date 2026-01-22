// Type definitions for World Cup 2026 Prediction Game

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  isAdmin: boolean;
  languagePreference: 'en' | 'nl';
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  countryCode: string;
  flagUrl: string;
  groupLetter: string;
  fifaRank: number;
}

export interface Match {
  id: string;
  matchNumber: number;
  stage: 'group' | 'round32' | 'round16' | 'quarter' | 'semi' | 'final' | 'third_place';
  homeTeam: Team;
  awayTeam: Team;
  venue: string;
  city: string;
  matchDate: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'finished';
  groupLetter?: string;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsEarned?: number;
  isLocked: boolean;
}

export interface BonusQuestion {
  id: string;
  questionType: 'champion' | 'top_scorer' | 'total_goals' | 'most_yellow_cards' | 'highest_scoring_team';
  questionTextEn: string;
  questionTextNl: string;
  points: number;
  correctAnswer?: string;
  isActive: boolean;
}

export interface ScoringRule {
  id: string;
  stage: 'group' | 'round32' | 'round16' | 'quarter' | 'semi' | 'final' | 'third_place';
  exactScorePoints: number;
  correctWinnerPoints: number;
  description?: string;
}

export interface Prize {
  id: string;
  rank: number;
  prizeName: string;
  description: string;
  imageUrl: string;
}

export interface UserStatistics {
  userId: string;
  totalPoints: number;
  rank: number;
  correctScores: number;
  correctWinners: number;
  predictionsMade: number;
}

export interface DepartmentStatistics {
  departmentId: string;
  departmentName: string;
  totalPoints: number;
  averagePoints: number;
  rank: number;
  memberCount: number;
}

export interface GroupStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  department: Department;
  totalPoints: number;
  correctScores: number;
  correctWinners: number;
  predictionsMade: number;
}
