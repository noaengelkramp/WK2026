import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

type MatchStage = 'group' | 'round32' | 'round16' | 'quarter' | 'semi' | 'final' | 'third_place';
type MatchStatus = 'scheduled' | 'live' | 'finished';

interface MatchAttributes {
  id: string;
  matchNumber: number;
  stage: MatchStage;
  homeTeamId?: string;
  awayTeamId?: string;
  venue: string;
  city: string;
  matchDate: Date;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  groupLetter?: string;
  apiMatchId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MatchCreationAttributes extends Optional<MatchAttributes, 'id' | 'homeTeamId' | 'awayTeamId' | 'homeScore' | 'awayScore' | 'groupLetter' | 'apiMatchId' | 'createdAt' | 'updatedAt'> {}

class Match extends Model<MatchAttributes, MatchCreationAttributes> implements MatchAttributes {
  public id!: string;
  public matchNumber!: number;
  public stage!: MatchStage;
  public homeTeamId?: string;
  public awayTeamId?: string;
  public venue!: string;
  public city!: string;
  public matchDate!: Date;
  public homeScore?: number;
  public awayScore?: number;
  public status!: MatchStatus;
  public groupLetter?: string;
  public apiMatchId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Match.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    matchNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    stage: {
      type: DataTypes.ENUM('group', 'round32', 'round16', 'quarter', 'semi', 'final', 'third_place'),
      allowNull: false,
    },
    homeTeamId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    awayTeamId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    venue: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    matchDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    homeScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    awayScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'live', 'finished'),
      defaultValue: 'scheduled',
    },
    groupLetter: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    apiMatchId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'matches',
    timestamps: true,
    indexes: [
      {
        fields: ['match_date'],
      },
      {
        fields: ['stage'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['group_letter'],
      },
    ],
  }
);

export default Match;
