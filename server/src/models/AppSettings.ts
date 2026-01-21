import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AppSettingsAttributes {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AppSettingsCreationAttributes extends Optional<AppSettingsAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

class AppSettings extends Model<AppSettingsAttributes, AppSettingsCreationAttributes> implements AppSettingsAttributes {
  public id!: string;
  public key!: string;
  public value!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AppSettings.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'app_settings',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['key'],
      },
    ],
  }
);

export default AppSettings;
