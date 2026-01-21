import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ApiLogAttributes {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  errorMessage?: string;
  createdAt?: Date;
}

interface ApiLogCreationAttributes extends Optional<ApiLogAttributes, 'id' | 'errorMessage' | 'createdAt'> {}

class ApiLog extends Model<ApiLogAttributes, ApiLogCreationAttributes> implements ApiLogAttributes {
  public id!: string;
  public endpoint!: string;
  public method!: string;
  public statusCode!: number;
  public responseTime!: number;
  public errorMessage?: string;
  public readonly createdAt!: Date;
}

ApiLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    endpoint: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Response time in milliseconds',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'api_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['endpoint'],
      },
      {
        fields: ['status_code'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default ApiLog;
