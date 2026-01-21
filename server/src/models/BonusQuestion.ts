import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

type QuestionType = 'champion' | 'top_scorer' | 'total_goals' | 'most_yellow_cards' | 'highest_scoring_team' | 'custom';

interface BonusQuestionAttributes {
  id: string;
  questionType: QuestionType;
  questionTextEn: string;
  questionTextNl: string;
  points: number;
  correctAnswer?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BonusQuestionCreationAttributes extends Optional<BonusQuestionAttributes, 'id' | 'correctAnswer' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class BonusQuestion extends Model<BonusQuestionAttributes, BonusQuestionCreationAttributes> implements BonusQuestionAttributes {
  public id!: string;
  public questionType!: QuestionType;
  public questionTextEn!: string;
  public questionTextNl!: string;
  public points!: number;
  public correctAnswer?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BonusQuestion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    questionType: {
      type: DataTypes.ENUM('champion', 'top_scorer', 'total_goals', 'most_yellow_cards', 'highest_scoring_team', 'custom'),
      allowNull: false,
    },
    questionTextEn: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    questionTextNl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    correctAnswer: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'bonus_questions',
    timestamps: true,
    indexes: [
      {
        fields: ['question_type'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

export default BonusQuestion;
