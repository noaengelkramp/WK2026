import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

type MatchStage = 'group' | 'round32' | 'round16' | 'quarter' | 'semi' | 'final' | 'third_place';

interface ScoringRuleAttributes {
  id: string;
  eventId: string;
  stage: MatchStage;
  pointsExactScore: number;
  pointsCorrectWinner: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ScoringRuleCreationAttributes extends Optional<ScoringRuleAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

class ScoringRule extends Model<ScoringRuleAttributes, ScoringRuleCreationAttributes> implements ScoringRuleAttributes {
  public id!: string;
  public eventId!: string;
  public stage!: MatchStage;
  public pointsExactScore!: number;
  public pointsCorrectWinner!: number;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ScoringRule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
    },
    stage: {
      type: DataTypes.ENUM('group', 'round32', 'round16', 'quarter', 'semi', 'final', 'third_place'),
      allowNull: false,
    },
    pointsExactScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    pointsCorrectWinner: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'scoring_rules',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['event_id', 'stage'],
      },
      {
        fields: ['event_id'],
      },
    ],
  }
);

export default ScoringRule;
