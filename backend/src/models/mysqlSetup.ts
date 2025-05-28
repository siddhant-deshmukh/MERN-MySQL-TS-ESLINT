import { Sequelize } from 'sequelize-typescript';
import logger from 'jet-logger';

import { User } from '../models/User'; // Import your User model
import ENV from '@src/common/constants/ENV';


const sequelize = new Sequelize({
  database: ENV.DbName,
  dialect: 'mysql',
  username: ENV.DbUser,
  password: ENV.DbPassword,
  host: ENV.DbHost,
  port: ENV.DbPort,
  // models: [User], // Add your models here
  logging: false, // Set to true to see SQL queries in console
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: false, // Adds createdAt and updatedAt columns
    underscored: true, // Use snake_case for column names
  },
});
sequelize.addModels([
  User,
]);
export const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL connection has been established successfully.');
    // await sequelize.sync({ force: false }); // `force: true` will drop and re-create tables (use with caution!)
    // logger.info('MySQL models synchronized.');
  } catch (error) {
    logger.err('Unable to connect to the MySQL database:', true);
    logger.err(error, true);
  }
};

export default sequelize;