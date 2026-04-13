#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script automatically creates database tables on Railway
 * Run this after deploying to Railway for the first time
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  console.log('\n🗄️  Database Initialization\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'warehouse_label',
    multipleStatements: true
  });

  console.log('✅ Connected to database');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'warehouse_label'}\n`);

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Reading schema.sql...');
    
    // Execute schema
    console.log('⚙️  Creating tables...\n');
    await connection.query(schema);

    // Verify tables created
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('✅ Database initialized successfully!\n');
    console.log('📊 Tables created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check if admin user exists
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    
    if (users[0].count === 0) {
      console.log('⚠️  No users found. Creating default admin user...\n');
      
      // Create default admin user (password: admin123)
      await connection.query(
        `INSERT INTO users (full_name, username, password_hash, role) 
         VALUES ('Administrator', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin')`
      );
      
      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   ⚠️  Please change password after first login!\n');
    } else {
      console.log(`ℹ️  Found ${users[0].count} existing user(s)\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database setup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error initializing database:');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('1. Database credentials are correct');
    console.error('2. Database exists');
    console.error('3. User has CREATE TABLE permissions\n');
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase().catch(console.error);
}

module.exports = initDatabase;
