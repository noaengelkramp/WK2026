import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DepartmentStatisticsAttributes {
  id: string;
  departmentId: string;
  totalPoints: number;
  averagePoints: number;
  participantCount: number;
  rank?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DepartmentStatisticsCreationAttributes extends Optional<DepartmentStatisticsAttributes, 'id' | 'totalPoints' | 'averagePoints' | 'participantCount' | 'rank' | 'createdAt' | 'updatedAt'> {}

class DepartmentStatistics extends Model<DepartmentStatisticsAttributes, DepartmentStatisticsCreationAttributes> implements DepartmentStatisticsAttributes {
  public id!: string;
  public departmentId!: string;
  public totalPoints!: number;
  public averagePoints!: number;
  public participantCount!: number;
  public rank?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DepartmentStatistics.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'departments',
        key: 'id',
      },
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    averagePoints: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    participantCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'department_statistics',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['department_id'],
      },
      {
        fields: ['total_points'],
      },
      {
        fields: ['average_points'],
      },
      {
        fields: ['rank'],
      },
    ],
  }
);

export default DepartmentStatistics;
