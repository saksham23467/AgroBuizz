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

async function setupDatabase() {
  try {
    console.log("🔧 Setting up AgroBuizz database...");
    
    // Check database connection
    console.log("🔍 Testing database connection...");
    try {
      await execAsync(`cd ${rootDir} && node -e "
        import { Pool } from '@neondatabase/serverless';
        import { config } from 'dotenv';
        config();
        
        const pool = new Pool({ 
          connectionString: process.env.DATABASE_URL 
        });
        
        pool.connect()
          .then(() => {
            console.log('✅ Successfully connected to PostgreSQL database');
            process.exit(0);
          })
          .catch(err => {
            console.error('❌ Database connection error:', err.message);
            process.exit(1);
          });
      "`);
    } catch (error) {
      console.error("❌ Failed to connect to database");
      console.error(error.stderr || error.stdout || error.message);
      console.log("\nPlease check your DATABASE_URL in .env file and make sure PostgreSQL is running");
      process.exit(1);
    }
    
    // Run database migrations
    console.log("\n📦 Running database migrations...");
    try {
      const { stdout, stderr } = await execAsync(`cd ${rootDir} && npx drizzle-kit push:pg`);
      if (stderr) console.error(stderr);
      console.log(stdout);
      console.log("✅ Database migrations completed successfully");
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