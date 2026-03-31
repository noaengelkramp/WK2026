import sequelize from '../config/database';

// Import all models
import Customer from './Customer';
import Event from './Event';
import User from './User';
import Team from './Team';
import Match from './Match';
import Prediction from './Prediction';
import BonusQuestion from './BonusQuestion';
import BonusAnswer from './BonusAnswer';
import Prize from './Prize';
import ScoringRule from './ScoringRule';
import UserStatistics from './UserStatistics';
import AppSettings from './AppSettings';
import ApiLog from './ApiLog';

// Define associations

// Customer <-> User
User.belongsTo(Customer, { foreignKey: 'customerNumber', targetKey: 'customerNumber', as: 'customer' });
Customer.hasOne(User, { foreignKey: 'customerNumber', sourceKey: 'customerNumber', as: 'user' });

// Event <-> User
User.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(User, { foreignKey: 'eventId', as: 'users' });

// User <-> Predictions
User.hasMany(Prediction, { foreignKey: 'userId', as: 'predictions' });
Prediction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Event scoped models
Prediction.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(Prediction, { foreignKey: 'eventId', as: 'predictions' });

BonusQuestion.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(BonusQuestion, { foreignKey: 'eventId', as: 'bonusQuestions' });

BonusAnswer.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(BonusAnswer, { foreignKey: 'eventId', as: 'bonusAnswers' });

Prize.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(Prize, { foreignKey: 'eventId', as: 'prizes' });

ScoringRule.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(ScoringRule, { foreignKey: 'eventId', as: 'scoringRules' });

UserStatistics.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(UserStatistics, { foreignKey: 'eventId', as: 'userStatistics' });

AppSettings.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(AppSettings, { foreignKey: 'eventId', as: 'appSettings' });

// User <-> BonusAnswers
User.hasMany(BonusAnswer, { foreignKey: 'userId', as: 'bonusAnswers' });
BonusAnswer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> UserStatistics (one-to-one)
User.hasOne(UserStatistics, { foreignKey: 'userId', as: 'statistics' });
UserStatistics.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Prize (winner)
User.hasMany(Prize, { foreignKey: 'winnerId', as: 'prizesWon' });
Prize.belongsTo(User, { foreignKey: 'winnerId', as: 'winner' });

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
  Event,
  Customer,
  User,
  Team,
  Match,
  Prediction,
  BonusQuestion,
  BonusAnswer,
  Prize,
  ScoringRule,
  UserStatistics,
  AppSettings,
  ApiLog,
};

// Export default for convenience
export default {
  sequelize,
  Event,
  Customer,
  User,
  Team,
  Match,
  Prediction,
  BonusQuestion,
  BonusAnswer,
  Prize,
  ScoringRule,
  UserStatistics,
  AppSettings,
  ApiLog,
};
