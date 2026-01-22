import type { Team, Department, Match, User, LeaderboardEntry, DepartmentStatistics, GroupStanding, Prize } from '../types';

// Mock Teams
export const mockTeams: Team[] = [
  { id: '1', name: 'Brazil', countryCode: 'BRA', flagUrl: '🇧🇷', groupLetter: 'A', fifaRank: 1 },
  { id: '2', name: 'Argentina', countryCode: 'ARG', flagUrl: '🇦🇷', groupLetter: 'A', fifaRank: 2 },
  { id: '3', name: 'Germany', countryCode: 'GER', flagUrl: '🇩🇪', groupLetter: 'B', fifaRank: 3 },
  { id: '4', name: 'France', countryCode: 'FRA', flagUrl: '🇫🇷', groupLetter: 'B', fifaRank: 4 },
  { id: '5', name: 'Spain', countryCode: 'ESP', flagUrl: '🇪🇸', groupLetter: 'C', fifaRank: 5 },
  { id: '6', name: 'England', countryCode: 'ENG', flagUrl: '🏴󐁧󐁢󐁥󐁮󐁧󐁿', groupLetter: 'C', fifaRank: 6 },
  { id: '7', name: 'Netherlands', countryCode: 'NED', flagUrl: '🇳🇱', groupLetter: 'D', fifaRank: 7 },
  { id: '8', name: 'Portugal', countryCode: 'POR', flagUrl: '🇵🇹', groupLetter: 'D', fifaRank: 8 },
  { id: '9', name: 'Belgium', countryCode: 'BEL', flagUrl: '🇧🇪', groupLetter: 'E', fifaRank: 9 },
  { id: '10', name: 'Italy', countryCode: 'ITA', flagUrl: '🇮🇹', groupLetter: 'E', fifaRank: 10 },
  { id: '11', name: 'USA', countryCode: 'USA', flagUrl: '🇺🇸', groupLetter: 'F', fifaRank: 11 },
  { id: '12', name: 'Mexico', countryCode: 'MEX', flagUrl: '🇲🇽', groupLetter: 'F', fifaRank: 12 },
];

// Mock Departments
export const mockDepartments: Department[] = [
  { id: '1', name: 'Engineering', description: 'Software Development Team' },
  { id: '2', name: 'Sales', description: 'Sales and Business Development' },
  { id: '3', name: 'Marketing', description: 'Marketing and Communications' },
  { id: '4', name: 'Operations', description: 'Operations and Logistics' },
  { id: '5', name: 'Finance', description: 'Finance and Accounting' },
];

// Mock Users
export const mockUsers: User[] = [
  { id: '1', email: 'john@company.com', firstName: 'John', lastName: 'Doe', departmentId: '1', isAdmin: false, languagePreference: 'en', createdAt: '2026-01-01' },
  { id: '2', email: 'jane@company.com', firstName: 'Jane', lastName: 'Smith', departmentId: '2', isAdmin: false, languagePreference: 'en', createdAt: '2026-01-02' },
  { id: '3', email: 'admin@company.com', firstName: 'Admin', lastName: 'User', departmentId: '1', isAdmin: true, languagePreference: 'en', createdAt: '2026-01-01' },
];

// Mock Matches
export const mockMatches: Match[] = [
  {
    id: '1',
    matchNumber: 1,
    stage: 'group',
    homeTeam: mockTeams[0],
    awayTeam: mockTeams[1],
    venue: 'MetLife Stadium',
    city: 'New York',
    matchDate: '2026-06-12T20:00:00Z',
    homeScore: undefined,
    awayScore: undefined,
    status: 'scheduled',
    groupLetter: 'A'
  },
  {
    id: '2',
    matchNumber: 2,
    stage: 'group',
    homeTeam: mockTeams[2],
    awayTeam: mockTeams[3],
    venue: 'Rose Bowl',
    city: 'Los Angeles',
    matchDate: '2026-06-13T20:00:00Z',
    homeScore: 2,
    awayScore: 1,
    status: 'finished',
    groupLetter: 'B'
  },
  {
    id: '3',
    matchNumber: 3,
    stage: 'group',
    homeTeam: mockTeams[4],
    awayTeam: mockTeams[5],
    venue: 'AT&T Stadium',
    city: 'Dallas',
    matchDate: '2026-06-14T18:00:00Z',
    homeScore: 1,
    awayScore: 1,
    status: 'live',
    groupLetter: 'C'
  },
];

// Mock Leaderboard
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user: mockUsers[0],
    department: mockDepartments[0],
    totalPoints: 245,
    correctScores: 12,
    correctWinners: 28,
    predictionsMade: 45
  },
  {
    rank: 2,
    user: mockUsers[1],
    department: mockDepartments[1],
    totalPoints: 238,
    correctScores: 10,
    correctWinners: 30,
    predictionsMade: 48
  },
  {
    rank: 3,
    user: mockUsers[2],
    department: mockDepartments[0],
    totalPoints: 220,
    correctScores: 9,
    correctWinners: 26,
    predictionsMade: 42
  },
];

// Mock Department Standings
export const mockDepartmentStandings: DepartmentStatistics[] = [
  {
    departmentId: '1',
    departmentName: 'Engineering',
    totalPoints: 1250,
    averagePoints: 208.3,
    rank: 1,
    memberCount: 6
  },
  {
    departmentId: '2',
    departmentName: 'Sales',
    totalPoints: 1180,
    averagePoints: 196.7,
    rank: 2,
    memberCount: 6
  },
  {
    departmentId: '3',
    departmentName: 'Marketing',
    totalPoints: 1050,
    averagePoints: 175.0,
    rank: 3,
    memberCount: 6
  },
];

// Mock Group Standings
export const mockGroupStandings: GroupStanding[] = [
  {
    team: mockTeams[0],
    played: 2,
    won: 2,
    drawn: 0,
    lost: 0,
    goalsFor: 5,
    goalsAgainst: 1,
    goalDifference: 4,
    points: 6,
    form: ['W', 'W']
  },
  {
    team: mockTeams[1],
    played: 2,
    won: 1,
    drawn: 1,
    lost: 0,
    goalsFor: 4,
    goalsAgainst: 2,
    goalDifference: 2,
    points: 4,
    form: ['W', 'D']
  },
];

// Mock Prizes
export const mockPrizes: Prize[] = [
  {
    id: '1',
    rank: 1,
    prizeName: 'Professional Foosball Table',
    description: 'First place winner receives a premium foosball table',
    imageUrl: '🎯'
  },
  {
    id: '2',
    rank: 2,
    prizeName: 'Smart TV 55"',
    description: 'Second place winner receives a 55-inch Smart TV',
    imageUrl: '📺'
  },
  {
    id: '3',
    rank: 3,
    prizeName: 'iPad Pro',
    description: 'Third place winner receives the latest iPad Pro',
    imageUrl: '📱'
  },
];

export const getCurrentUser = (): User => mockUsers[0];

export const getNextMatch = (): Match => mockMatches[0];
