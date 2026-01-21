import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BonusAnswerAttributes {
  id: string;
  userId: string;
  bonusQuestionId: string;
  answer: string;
  pointsEarned?: number;
  isCorrect: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BonusAnswerCreationAttributes extends Optional<BonusAnswerAttributes, 'id' | 'pointsEarned' | 'isCorrect' | 'createdAt' | 'updatedAt'> {}

class BonusAnswer extends Model<BonusAnswerAttributes, BonusAnswerCreationAttributes> implements BonusAnswerAttributes {
  public id!: string;
  public userId!: string;
  public bonusQuestionId!: string;
  public answer!: string;
  public pointsEarned?: number;
  public isCorrect!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BonusAnswer.init(
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
    bonusQuestionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bonus_questions',
        key: 'id',
      },
    },
    answer: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'bonus_answers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'bonus_question_id'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['bonus_question_id'],
      },
    ],
  }
);

export default BonusAnswer;
