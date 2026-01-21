import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TeamAttributes {
  id: string;
  name: string;
  countryCode: string;
  flagUrl: string;
  groupLetter: string;
  fifaRank: number;
  apiTeamId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamCreationAttributes extends Optional<TeamAttributes, 'id' | 'apiTeamId' | 'createdAt' | 'updatedAt'> {}

class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  public id!: string;
  public name!: string;
  public countryCode!: string;
  public flagUrl!: string;
  public groupLetter!: string;
  public fifaRank!: number;
  public apiTeamId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Team.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    countryCode: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    flagUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    groupLetter: {
      type: DataTypes.STRING(1),
      allowNull: false,
      validate: {
        is: /^[A-L]$/i,
      },
    },
    fifaRank: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    apiTeamId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'teams',
    timestamps: true,
    indexes: [
      {
        fields: ['group_letter'],
      },
      {
        fields: ['api_team_id'],
      },
    ],
  }
);

export default Team;
