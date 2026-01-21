import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PredictionAttributes {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  pointsEarned?: number;
  isCorrectScore: boolean;
  isCorrectWinner: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PredictionCreationAttributes extends Optional<PredictionAttributes, 'id' | 'pointsEarned' | 'isCorrectScore' | 'isCorrectWinner' | 'createdAt' | 'updatedAt'> {}

class Prediction extends Model<PredictionAttributes, PredictionCreationAttributes> implements PredictionAttributes {
  public id!: string;
  public userId!: string;
  public matchId!: string;
  public homeScore!: number;
  public awayScore!: number;
  public pointsEarned?: number;
  public isCorrectScore!: boolean;
  public isCorrectWinner!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Prediction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    matchId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'matches',
        key: 'id',
      },
    },
    homeScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    awayScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    isCorrectScore: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isCorrectWinner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'predictions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'match_id'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['match_id'],
      },
    ],
  }
);

export default Prediction;
