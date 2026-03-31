import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

interface UserAttributes {
  id: string;
  eventId: string;
  email: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  customerNumber: string;
  role: 'user' | 'event_admin' | 'platform_admin';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  languagePreference: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'isEmailVerified' | 'emailVerificationToken' | 'emailVerificationExpires' | 'languagePreference' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public eventId!: string;
  public email!: string;
  public username!: string;
  public passwordHash!: string;
  public firstName!: string;
  public lastName!: string;
  public customerNumber!: string;
  public role!: 'user' | 'event_admin' | 'platform_admin';
  public isEmailVerified!: boolean;
  public emailVerificationToken?: string;
  public emailVerificationExpires?: Date;
  public languagePreference!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to compare password
  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  // Helper method to hash password
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Exclude password from JSON
  public toJSON(): Partial<UserAttributes> {
    const values = { ...this.get() } as UserAttributes;
    delete (values as any).passwordHash;
    (values as any).isAdmin = values.role === 'event_admin' || values.role === 'platform_admin';
    return values;
  }
}

User.init(
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customerNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      references: {
        model: 'customers',
        key: 'customer_number',
      },
      validate: {
        is: /^C\d{4}_\d{7}$/, // Format: C1234_1234567
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'event_admin', 'platform_admin'),
      allowNull: false,
      defaultValue: 'user',
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    languagePreference: {
      type: DataTypes.STRING(20),
      defaultValue: 'en',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['event_id', 'email'],
      },
      {
        unique: true,
        fields: ['event_id', 'username'],
      },
      {
        unique: true,
        fields: ['event_id', 'customer_number'],
      },
      {
        fields: ['event_id'],
      },
    ],
  }
);

export default User;
