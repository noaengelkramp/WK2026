import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserStatisticsAttributes {
  id: string;
  userId: string;
  totalPoints: number;
  exactScores: number;
  correctWinners: number;
  predictionsMade: number;
  rank?: number;
  bonusPoints: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserStatisticsCreationAttributes extends Optional<UserStatisticsAttributes, 'id' | 'totalPoints' | 'exactScores' | 'correctWinners' | 'predictionsMade' | 'rank' | 'bonusPoints' | 'createdAt' | 'updatedAt'> {}

class UserStatistics extends Model<UserStatisticsAttributes, UserStatisticsCreationAttributes> implements UserStatisticsAttributes {
  public id!: string;
  public userId!: string;
  public totalPoints!: number;
  public exactScores!: number;
  public correctWinners!: number;
  public predictionsMade!: number;
  public rank?: number;
  public bonusPoints!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserStatistics.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    exactScores: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    correctWinners: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    predictionsMade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bonusPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'user_statistics',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id'],
      },
      {
        fields: ['total_points'],
      },
      {
        fields: ['rank'],
      },
    ],
  }
);

export default UserStatistics;
