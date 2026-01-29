import { Sequelize } from 'sequelize';
import { config } from './environment';

// Create Sequelize instance with environment-specific configuration
const isProduction = config.nodeEnv === 'production';
const isServerless = process.env.NETLIFY === 'true';
// Check if using cloud database (Neon, Supabase, etc.) - they always need SSL
const isCloudDatabase = config.database.url.includes('neon.tech') || 
                        config.database.url.includes('supabase') ||
                        config.database.url.includes('sslmode=require');

export const sequelize = new Sequelize(config.database.url, {
  dialect: 'postgres',
  logging: config.nodeEnv === 'development' ? console.log : false,
  
  // SSL configuration for cloud databases (Neon, Supabase, etc.)
  // Enable SSL for production OR cloud databases
  dialectOptions: (isProduction || isCloudDatabase) ? {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for most cloud PostgreSQL providers
    },
  } : {},
  
  // Connection pool configuration
  // Serverless needs smaller pool sizes
  pool: {
    max: isServerless ? 2 : (isProduction ? 10 : 50),  // Low max for serverless, higher for production server
    min: isServerless ? 0 : (isProduction ? 2 : 5),    // Allow scaling to zero in serverless
    acquire: 30000,  // Max time to get connection before throwing error
    idle: isServerless ? 1000 : 10000,  // Close idle connections quickly in serverless
  },
  
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
});

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Sync database (create tables)
export const syncDatabase = async (force = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    console.log(`✅ Database synchronized ${force ? '(force)' : ''}.`);
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

export default sequelize;
