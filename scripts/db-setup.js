// This script helps with database setup and initialization
import { config } from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  config({ path: envPath });
  console.log("✅ Loaded environment variables from .env file");
} else {
  console.log("⚠️ No .env file found in project root");
  console.log("Please create a .env file using .env.example as a template");
  process.exit(1);
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  console.log("Please configure your database connection in .env file");
  process.exit(1);
}

// Execute shell command as Promise
const execAsync = promisify(exec);

// Helper function to check if required packages are installed
async function checkDependencies() {
  console.log("🔍 Checking required dependencies...");
  try {
    await execAsync(`cd ${rootDir} && npm list pg dotenv drizzle-orm --depth=0`);
    console.log("✅ Required dependencies are installed");
    return true;
  } catch (error) {
    console.log("⚠️ Some required dependencies may be missing. Installing them now...");
    try {
      await execAsync(`cd ${rootDir} && npm install pg dotenv drizzle-orm --no-save`);
      console.log("✅ Dependencies installed successfully");
      return true;
    } catch (installError) {
      console.error("❌ Failed to install required dependencies");
      console.error(installError.stderr || installError.message);
      return false;
    }
  }
}

// Parse DATABASE_URL and check components
function checkDatabaseUrl(dbUrl) {
  try {
    const url = new URL(dbUrl);
    const username = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = url.port || '5432';
    const database = url.pathname.slice(1); // Remove leading '/'
    
    console.log(`
📊 Database connection info:
- Host: ${host}
- Port: ${port}
- Database: ${database}
- Username: ${username}
- Password: ${'*'.repeat(password.length)}
    `);
    
    // Check for common issues
    if (!username || !password) {
      console.log("⚠️ Warning: Username or password is missing in your DATABASE_URL");
    }
    
    if (host === 'localhost' && !process.env.PGHOST) {
      process.env.PGHOST = host;
    }
    
    if (port && !process.env.PGPORT) {
      process.env.PGPORT = port;
    }
    
    if (database && !process.env.PGDATABASE) {
      process.env.PGDATABASE = database;
    }
    
    if (username && !process.env.PGUSER) {
      process.env.PGUSER = username;
    }
    
    if (password && !process.env.PGPASSWORD) {
      process.env.PGPASSWORD = password;
    }
    
    return { host, port, database, username, password };
  } catch (error) {
    console.error("❌ Invalid DATABASE_URL format");
    console.error(error.message);
    return null;
  }
}

async function setupDatabase() {
  try {
    console.log("🔧 Setting up AgroBuizz database...");
    
    // Ensure dependencies are installed
    const dependenciesOk = await checkDependencies();
    if (!dependenciesOk) {
      console.log("\nPlease install required dependencies manually with:");
      console.log("npm install pg dotenv drizzle-orm");
      process.exit(1);
    }
    
    // Parse and validate DATABASE_URL
    const dbConfig = checkDatabaseUrl(process.env.DATABASE_URL);
    if (!dbConfig) {
      console.log("\nCorrect format: postgresql://username:password@hostname:port/database");
      process.exit(1);
    }
    
    // Check database connection
    console.log("🔍 Testing database connection...");
    try {
      await execAsync(`cd ${rootDir} && node -e "
        const { Pool } = require('pg');
        const dotenv = require('dotenv');
        dotenv.config();
        
        const pool = new Pool({ 
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        pool.connect()
          .then(client => {
            console.log('✅ Successfully connected to PostgreSQL database');
            client.query('SELECT version()').then(res => {
              console.log('🐘 PostgreSQL version:', res.rows[0].version.split(' ')[0]);
              client.release();
              process.exit(0);
            }).catch(err => {
              console.error('❌ Query error:', err.message);
              process.exit(1);
            });
          })
          .catch(err => {
            console.error('❌ Database connection error:', err.message);
            process.exit(1);
          });
      "`);
    } catch (error) {
      console.error("❌ Failed to connect to database");
      console.error(error.stderr || error.stdout || error.message);
      
      // Provide specific help based on common error messages
      const errorMsg = error.stderr || error.stdout || error.message || '';
      if (errorMsg.includes('ECONNREFUSED')) {
        console.log("\n🔍 Troubleshooting Help:");
        console.log("1. Make sure PostgreSQL is running on your system");
        console.log("2. Check if the hostname and port in DATABASE_URL are correct");
        console.log("3. Verify that PostgreSQL is listening on the specified port");
      } else if (errorMsg.includes('password authentication failed')) {
        console.log("\n🔍 Troubleshooting Help:");
        console.log("1. Check if the username and password in DATABASE_URL are correct");
        console.log("2. Verify that the user has proper access rights to the database");
      } else if (errorMsg.includes('database') && errorMsg.includes('does not exist')) {
        console.log("\n🔍 Troubleshooting Help:");
        console.log("1. Create the database by running these commands in PostgreSQL:");
        console.log(`   CREATE DATABASE ${dbConfig.database};`);
        console.log(`   GRANT ALL PRIVILEGES ON DATABASE ${dbConfig.database} TO ${dbConfig.username};`);
      }
      
      process.exit(1);
    }
    
    // Run database migrations
    console.log("\n📦 Running database migrations...");
    try {
      const { stdout, stderr } = await execAsync(`cd ${rootDir} && npx drizzle-kit push:pg`);
      if (stderr && !stderr.includes('warn')) console.error(stderr);
      console.log(stdout);
      console.log("✅ Database migrations completed successfully");
      
      // Try to create an admin user if needed
      console.log("\n👤 Checking for admin user...");
      try {
        await execAsync(`cd ${rootDir} && node -e "
          const { Pool } = require('pg');
          const crypto = require('crypto');
          const dotenv = require('dotenv');
          dotenv.config();
          
          const pool = new Pool({ 
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
          });
          
          // Hash password function (simplified version of what's in auth.ts)
          function hashPassword(password) {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
            return \`\${hash}.\${salt}\`;
          }
          
          async function checkOrCreateAdmin() {
            const client = await pool.connect();
            try {
              // Check if admin user exists
              const checkResult = await client.query(
                'SELECT COUNT(*) FROM users WHERE username = $1 AND role = $2',
                ['admin', 'admin']
              );
              
              if (parseInt(checkResult.rows[0].count) === 0) {
                // Create admin user
                const hashedPassword = hashPassword('admin123');
                await client.query(
                  'INSERT INTO users (username, email, password, role, user_type, created_at, dark_mode) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                  ['admin', 'admin@agrobuizz.com', hashedPassword, 'admin', 'admin', new Date(), false]
                );
                console.log('✅ Created default admin user (username: admin, password: admin123)');
                console.log('   IMPORTANT: Change this password after first login!');
              } else {
                console.log('✅ Admin user already exists');
              }
            } catch (err) {
              console.log('⚠️ Could not check/create admin user:', err.message);
            } finally {
              client.release();
              process.exit(0);
            }
          }
          
          checkOrCreateAdmin();
        "`);
      } catch (error) {
        console.log("⚠️ Could not create default admin user");
        // Don't exit here, not critical
      }
    } catch (error) {
      console.error("❌ Failed to run database migrations");
      console.error(error.stderr || error.stdout || error.message);
      process.exit(1);
    }
    
    console.log("\n🎉 Database setup complete!");
    console.log("You can now start the application with: npm run dev");
    
  } catch (error) {
    console.error("❌ An unexpected error occurred during database setup");
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();