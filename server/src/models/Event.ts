import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface EventAttributes {
  id: string;
  code: string;
  name: string;
  subdomain: string;
  defaultLocale: string;
  allowedLocales: string[];
  timezone: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EventCreationAttributes
  extends Optional<EventAttributes, 'id' | 'defaultLocale' | 'allowedLocales' | 'timezone' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: string;
  public code!: string;
  public name!: string;
  public subdomain!: string;
  public defaultLocale!: string;
  public allowedLocales!: string[];
  public timezone!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    subdomain: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    defaultLocale: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'en',
    },
    allowedLocales: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: ['en'],
    },
    timezone: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Europe/Amsterdam',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'events',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['code'] },
      { unique: true, fields: ['subdomain'] },
      { fields: ['is_active'] },
    ],
  }
);

export default Event;
