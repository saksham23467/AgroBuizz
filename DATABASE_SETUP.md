# AgroBuizz Database Setup Guide

This guide provides detailed instructions for setting up and configuring the PostgreSQL database for the AgroBuizz platform.

## Prerequisites

- PostgreSQL 14 or higher installed on your system
- Node.js 18 or higher
- npm or yarn package manager

## Local Database Setup

### 1. Install PostgreSQL

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### On macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### On Windows:
Download and run the installer from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/).

### 2. Create Database User and Database

#### On Linux/macOS:
```bash
# Log in as PostgreSQL user
sudo -u postgres psql

# Create a new database user (change username and password)
CREATE USER agrobuizz_user WITH PASSWORD 'your_secure_password';

# Create the database
CREATE DATABASE agrobuizz WITH OWNER agrobuizz_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE agrobuizz TO agrobuizz_user;

# Exit PostgreSQL
\q
```

#### On Windows (using psql command line):
```powershell
# Open Command Prompt and connect to PostgreSQL
psql -U postgres

# Then run the same commands as above
CREATE USER agrobuizz_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE agrobuizz WITH OWNER agrobuizz_user;
GRANT ALL PRIVILEGES ON DATABASE agrobuizz TO agrobuizz_user;
\q
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with the following content:

```
# Database Configuration
DATABASE_URL=postgresql://agrobuizz_user:your_secure_password@localhost:5432/agrobuizz
PGUSER=agrobuizz_user
PGHOST=localhost
PGPASSWORD=your_secure_password
PGDATABASE=agrobuizz
PGPORT=5432

# Session Configuration
SESSION_SECRET=your_secure_random_string

# Application Configuration
PORT=5000
NODE_ENV=development
```

Replace `your_secure_password` with your actual database user password and `your_secure_random_string` with a secure random string for session encryption.

### 4. Run Database Migrations

The schema is managed using Drizzle ORM. To set up the initial schema:

```bash
# Install dependencies first
npm install

# Run the database migration script
npm run db:push
```

This will create all necessary tables based on the schema defined in `shared/schema.ts`.

## Schema Overview

The AgroBuizz platform uses the following main tables:

- **users**: Platform users with authentication details
- **admins**: Administrative users with additional permissions
- **vendors**: Sellers of agricultural equipment and supplies
- **farmers**: Agricultural producers who sell crops
- **customers**: Buyers of agricultural products
- **products**: Items available for purchase (seeds, equipment, supplies)
- **crops**: Agricultural products grown by farmers
- **product_complaints**: System for tracking and resolving product issues

For the complete schema, refer to `shared/schema.ts`.

## Automated Setup Script

For convenience, you can use the built-in setup scripts:

```bash
# On Unix/Linux/macOS
chmod +x setup.sh
./setup.sh

# This will:
# 1. Check for Node.js and npm
# 2. Install dependencies
# 3. Set up environment variables
# 4. Create the database if it doesn't exist
# 5. Run migrations
```

## Troubleshooting

### Common Issues

#### Connection Refused
- Make sure PostgreSQL service is running
- Check if the port specified in DATABASE_URL is correct (default is 5432)
- Ensure there are no firewall rules blocking the connection

#### Authentication Failed
- Verify the username and password in the DATABASE_URL
- Check if the specified user has appropriate permissions

#### Database Does Not Exist
- Confirm you've created the database using the CREATE DATABASE command
- Check if the database name in the DATABASE_URL matches the created database

#### Permission Denied
- Ensure the database user has the necessary permissions on the database
- Try granting all privileges: `GRANT ALL PRIVILEGES ON DATABASE agrobuizz TO agrobuizz_user;`

### Database Logs

To check PostgreSQL logs for more detailed error information:

#### On Linux:
```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### On macOS:
```bash
tail -f /usr/local/var/log/postgres.log
```

#### On Windows:
Logs are typically in the PostgreSQL data directory's `log` subdirectory.

## Testing Database Connection

You can test if your database connection is properly configured by running:

```bash
node -e "
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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
"
```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Node-Postgres Documentation](https://node-postgres.com/)