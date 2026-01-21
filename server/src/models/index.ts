import sequelize from '../config/database';

// Import all models
import Department from './Department';
import User from './User';
import Team from './Team';
import Match from './Match';
import Prediction from './Prediction';
import BonusQuestion from './BonusQuestion';
import BonusAnswer from './BonusAnswer';
import Prize from './Prize';
import ScoringRule from './ScoringRule';
import UserStatistics from './UserStatistics';
import DepartmentStatistics from './DepartmentStatistics';
import AppSettings from './AppSettings';
import ApiLog from './ApiLog';

// Define associations

// User <-> Department
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(User, { foreignKey: 'departmentId', as: 'users' });

// User <-> Predictions
User.hasMany(Prediction, { foreignKey: 'userId', as: 'predictions' });
Prediction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> BonusAnswers
User.hasMany(BonusAnswer, { foreignKey: 'userId', as: 'bonusAnswers' });
BonusAnswer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> UserStatistics (one-to-one)
User.hasOne(UserStatistics, { foreignKey: 'userId', as: 'statistics' });
UserStatistics.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Prize (winner)
User.hasMany(Prize, { foreignKey: 'winnerId', as: 'prizesWon' });
Prize.belongsTo(User, { foreignKey: 'winnerId', as: 'winner' });

// Department <-> DepartmentStatistics (one-to-one)
Department.hasOne(DepartmentStatistics, { foreignKey: 'departmentId', as: 'statistics' });
DepartmentStatistics.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

// Match <-> Team (home and away)
Match.belongsTo(Team, { foreignKey: 'homeTeamId', as: 'homeTeam' });
Match.belongsTo(Team, { foreignKey: 'awayTeamId', as: 'awayTeam' });
Team.hasMany(Match, { foreignKey: 'homeTeamId', as: 'homeMatches' });
Team.hasMany(Match, { foreignKey: 'awayTeamId', as: 'awayMatches' });

// Match <-> Predictions
Match.hasMany(Prediction, { foreignKey: 'matchId', as: 'predictions' });
Prediction.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });

// BonusQuestion <-> BonusAnswers
BonusQuestion.hasMany(BonusAnswer, { foreignKey: 'bonusQuestionId', as: 'answers' });
BonusAnswer.belongsTo(BonusQuestion, { foreignKey: 'bonusQuestionId', as: 'question' });

// Export all models and sequelize instance
export {
  sequelize,
  Department,
  User,
  Team,
  Match,
  Prediction,
  BonusQuestion,
  BonusAnswer,
  Prize,
  ScoringRule,
  UserStatistics,
  DepartmentStatistics,
  AppSettings,
  ApiLog,
};

// Export default for convenience
export default {
  sequelize,
  Department,
  User,
  Team,
  Match,
  Prediction,
  BonusQuestion,
  BonusAnswer,
  Prize,
  ScoringRule,
  UserStatistics,
  DepartmentStatistics,
  AppSettings,
  ApiLog,
};
