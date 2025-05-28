import { QueryInterface, Sequelize } from 'sequelize';
import * as fs from 'fs';
import logger from 'jet-logger';
import * as path from 'path';

interface Migration {
  up: (queryInterface: QueryInterface, Sequelize: Sequelize) => Promise<void>;
  down: (queryInterface: QueryInterface, Sequelize: Sequelize) => Promise<void>;
}

const migration: Migration = {
  async up(queryInterface: QueryInterface, _: Sequelize): Promise<void> {
    try {
      logger.info('Running initial setup migration...');
      
      const sqlContent = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL, -- This will store hashed passwords
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `;
      
      // Split SQL content by statements (assuming they're separated by semicolons)
      const statements = sqlContent
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0 && !statement.startsWith('--'));
      
      logger.info(`Executing ${statements.length} SQL statements...`);
      
      // Execute each SQL statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        try {
          logger.info(`Executing statement ${i + 1}/${statements.length}`);
          await queryInterface.sequelize.query(statement);
        } catch (error) {
          logger.err(`Error executing statement ${i + 1}:`, true);
          throw error;
        }
      }
      
      logger.info('Initial setup migration completed successfully');
    } catch (error) {
      logger.err('Error running initial setup migration:', true);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface, _: Sequelize): Promise<void> {
    logger.info('Rolling back initial setup migration...');
    
    try {
      // Option 1: Read a rollback SQL file
      const rollbackSqlPath = path.join(__dirname, '../../../migrations/rollback-setup.sql');
      
      if (fs.existsSync(rollbackSqlPath)) {
        const rollbackSql = fs.readFileSync(rollbackSqlPath, 'utf8');
        const statements = rollbackSql
          .split(';')
          .map(statement => statement.trim())
          .filter(statement => statement.length > 0 && !statement.startsWith('--'));
        
        for (const statement of statements) {
          await queryInterface.sequelize.query(statement);
        }
        logger.info('Rollback completed using rollback-setup.sql');
      } else {
        // Option 2: Manual rollback (example)
        logger.info('No rollback SQL file found. Manual rollback required.');
        
        // Example: If you know the table names from setup.sql, drop them
        // const tablesToDrop = ['users', 'products', 'orders']; // Add your table names
        // for (const tableName of tablesToDrop) {
        //   try {
        //     await queryInterface.dropTable(tableName);
        //     logger.info(`Dropped table: ${tableName}`);
        //   } catch (error) {
        //     logger.info(`Table ${tableName} doesn't exist or couldn't be dropped`);
        //   }
        // }
      }
    } catch (error) {
      logger.err('Error rolling back initial setup migration:', true);
      throw error;
    }
  },
};

// Export for CommonJS (required by sequelize-cli)
module.exports = migration;
export default migration;