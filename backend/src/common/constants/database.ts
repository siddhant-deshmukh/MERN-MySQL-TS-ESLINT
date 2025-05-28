import dotenv from 'dotenv';
import path from 'path';


// Check the env
const NODE_ENV = (process.env.NODE_ENV ?? 'development');

// Configure "dotenv"
const result2 = dotenv.config({
  path: path.join(`config/.env.${NODE_ENV}`),
});
console.log('Loading ', `config/.env.${NODE_ENV}`);

if (result2.error) {
  throw result2.error;
}

const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql' as const,
    dialectOptions: {
      options: {
        encrypt: true, // Use encryption for SQL Server
        trustServerCertificate: true, // For development
      },
    },
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql' as const,
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql' as const,
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
    },
  },
};

console.log(config.development)
// Export for CommonJS (required by sequelize-cli)
module.exports = config;
export default config;