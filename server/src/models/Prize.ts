import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PrizeAttributes {
  id: string;
  rank: number;
  titleEn: string;
  titleNl: string;
  descriptionEn: string;
  descriptionNl: string;
  imageUrl?: string;
  winnerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PrizeCreationAttributes extends Optional<PrizeAttributes, 'id' | 'imageUrl' | 'winnerId' | 'createdAt' | 'updatedAt'> {}

class Prize extends Model<PrizeAttributes, PrizeCreationAttributes> implements PrizeAttributes {
  public id!: string;
  public rank!: number;
  public titleEn!: string;
  public titleNl!: string;
  public descriptionEn!: string;
  public descriptionNl!: string;
  public imageUrl?: string;
  public winnerId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Prize.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: {
        min: 1,
      },
    },
    titleEn: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    titleNl: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    descriptionEn: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    descriptionNl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    winnerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'prizes',
    timestamps: true,
    indexes: [
      {
        fields: ['rank'],
      },
      {
        fields: ['winner_id'],
      },
    ],
  }
);

export default Prize;
