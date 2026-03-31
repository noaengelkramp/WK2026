import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AppSettingsAttributes {
  id: string;
  eventId: string;
  key: string;
  value: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AppSettingsCreationAttributes extends Optional<AppSettingsAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

class AppSettings extends Model<AppSettingsAttributes, AppSettingsCreationAttributes> implements AppSettingsAttributes {
  public id!: string;
  public eventId!: string;
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
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
        fields: ['event_id', 'key'],
      },
      {
        fields: ['event_id'],
      },
    ],
  }
);

export default AppSettings;
