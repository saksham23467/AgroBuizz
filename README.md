# AgroBuizz - Agricultural Marketplace Platform

AgroBuizz is a comprehensive web application designed to connect farmers, vendors, and customers in a specialized agricultural marketplace. The platform enables seamless interaction between different user types with role-specific functionalities.

## Features

- **Role-Based Authentication**: Different interfaces for Users, Vendors, and Farmers
- **Product Management**: Inventory tracking and management for vendors and farmers
- **Marketplace**: Purchase agricultural products including seeds, equipment, and produce
- **Complaint System**: Submit and resolve product-related issues
- **Real-time Updates**: Live market prices and interactive search
- **Admin Dashboard**: Comprehensive reporting and data analytics

## Tech Stack

- **Frontend**: React with TypeScript, TailwindCSS, Shadcn/UI, Framer Motion
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **Real-time**: WebSockets for live updates

## Quick Start Guide

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+

### Download and Run Locally

1. **Download the code**:
```bash
git clone https://github.com/saksham23467/agrobuizz.git
cd agrobuizz
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create PostgreSQL database**:
```sql
CREATE DATABASE agrobuizz;
CREATE USER agrobuizz_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE agrobuizz TO agrobuizz_user;
```

4. **Set up your environment**:
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` and other settings in `.env` with your database credentials
   - Generate a strong `SESSION_SECRET` value

5. **Initialize the database**:
```bash
# On Unix/Linux/macOS
chmod +x setup-database.sh
./setup-database.sh

# On Windows
node scripts/db-setup.js
```

6. **Start the application**:
```bash
npm run dev
```

7. **Access the application**:
   - Open http://localhost:5000 in your browser
   - Test accounts (automatically created for demonstration):
     
     | User Type | Username | Password    | Description                                 |
     |-----------|----------|-------------|---------------------------------------------|
     | Admin     | `admin`  | `admin123`  | Access to all features and admin dashboard  |
     | Farmer    | `farmer` | `farmer123` | Can sell crops and buy from vendors         |
     | Vendor    | `vendor` | `vendor123` | Can sell seeds, equipment, and supplies     |
     | Customer  | `customer` | `customer123` | Can purchase crops from farmers         |
     
   - **Note**: Change these passwords immediately in a production environment!

### Deployment Configuration

For production deployment, update your `.env` file:
```
NODE_ENV=production
DATABASE_SSL=true
SESSION_SECRET=<strong-random-string>
```

### Detailed Setup Instructions

#### PostgreSQL Database Setup

1. **Install PostgreSQL** (if not already installed):
   - Ubuntu/Debian: `sudo apt install postgresql postgresql-contrib`
   - macOS: `brew install postgresql`
   - Windows: Download installer from postgresql.org

2. **Create database and user**:
```sql
-- Login to PostgreSQL
sudo -u postgres psql    # Linux/macOS
psql -U postgres         # Windows

-- Create database and user
CREATE DATABASE agrobuizz;
CREATE USER agrobuizz_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE agrobuizz TO agrobuizz_user;
```

3. **Configure environment variables**:
   - Set `DATABASE_URL=postgresql://agrobuizz_user:your_password@localhost:5432/agrobuizz`
   - Alternatively, set individual connection parameters:
     ```
     PGUSER=agrobuizz_user
     PGPASSWORD=your_password
     PGHOST=localhost
     PGPORT=5432
     PGDATABASE=agrobuizz
     ```

#### Environment Configuration

Create a `.env` file in the project root:
```
# Database Configuration
DATABASE_URL=postgresql://agrobuizz_user:your_password@localhost:5432/agrobuizz

# Security
SESSION_SECRET=generate_a_strong_random_string

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Troubleshooting Database Connection

The most common database issues and their solutions:

| Error | Solution |
|-------|----------|
| ECONNREFUSED | • Ensure PostgreSQL service is running<br>• Verify host/port in DATABASE_URL |
| Authentication failed | • Check username and password<br>• Verify user has proper permissions |
| Database does not exist | • Create the database with CREATE DATABASE command |
| Permission denied | • Grant privileges to the database user |

Run this command to test your database connection:
```bash
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.connect()
  .then(() => console.log('✅ Database connection successful'))
  .catch(err => console.error('❌ Connection error:', err.message))
  .finally(() => process.exit());
"
```

For detailed database setup instructions, see [DATABASE_SETUP.md](DATABASE_SETUP.md).

## Authentication

The system supports different user types:

- **Users/Customers**: Can browse products, make purchases, and submit complaints
- **Farmers**: Can sell produce, manage inventory, and track customer orders
- **Vendors**: Can sell agricultural equipment/supplies and manage product inventory
- **Admins**: Have access to all system features and analytics

## Admin Dashboard

The admin dashboard provides access to powerful analytics and reporting:

- View farmers and their crops
- Track customers with multiple orders
- Filter products by type, price range, and availability
- Monitor vendor ratings and performance
- Track disputes and sales data
- Generate analytics reports

## API Documentation and SQL Mapping

### Admin API Endpoints

Each admin endpoint corresponds to specific SQL queries that provide insights into the platform's data.

| Endpoint | Description | SQL Query |
|---------|-------------|-----------|
| `GET /api/admin/farmers-with-crops` | Retrieves all farmers with their crops | `SELECT f.*, c.* FROM users f JOIN crop c ON f.id = c.farmer_id WHERE f.user_type = 'farmer'` |
| `GET /api/admin/customers-with-multiple-orders` | Lists customers with 3+ orders | `SELECT u.*, COUNT(o.id) AS order_count FROM users u JOIN orders o ON u.id = o.user_id WHERE u.user_type = 'customer' GROUP BY u.id HAVING COUNT(o.id) >= 3` |
| `GET /api/admin/products-by-type/:type` | Shows products by type | `SELECT * FROM products WHERE type = $1` |
| `GET /api/admin/products-by-price-range` | Filters products by price range | `SELECT * FROM products WHERE price BETWEEN $1 AND $2` |
| `GET /api/admin/available-products` | Shows in-stock products | `SELECT * FROM products WHERE quantity > 0` |
| `GET /api/admin/products-by-vendor-ratings` | Lists products by vendor ratings | `SELECT p.*, AVG(r.rating) FROM products p JOIN users v ON p.vendor_id = v.id JOIN ratings r ON v.id = r.vendor_id GROUP BY p.id HAVING AVG(r.rating) >= $1` |
| `GET /api/admin/crops-for-sale` | Lists crops available for sale | `SELECT * FROM crops WHERE status = 'harvested' AND quantity > 0` |
| `GET /api/admin/vendor-product-counts` | Counts products by vendor | `SELECT v.username, COUNT(p.id) FROM users v LEFT JOIN products p ON v.id = p.vendor_id WHERE v.user_type = 'vendor' GROUP BY v.id` |
| `GET /api/admin/farmer-orders` | Shows orders placed by farmers | `SELECT o.* FROM orders o JOIN users u ON o.user_id = u.id WHERE u.user_type = 'farmer'` |
| `GET /api/admin/disputes` | Lists all disputes/complaints | `SELECT pc.*, u.username FROM product_complaints pc JOIN users u ON pc.user_id = u.id` |
| `GET /api/admin/orders-by-year/:year` | Shows orders from specific year | `SELECT * FROM orders WHERE EXTRACT(YEAR FROM created_at) = $1` |
| `GET /api/admin/crop-sales` | Shows sales metrics for each crop | `SELECT c.name, SUM(oi.quantity) as total_sold FROM crops c JOIN order_items oi ON c.id = oi.crop_id GROUP BY c.id` |
| `POST /api/admin/execute-query` | Runs custom SELECT queries | Dynamic SQL execution with validation and security restrictions |

### Main API Endpoints

These endpoints power the core application features.

#### Authentication Endpoints

| Endpoint | Description | Database Operation |
|---------|-------------|-------------------|
| `POST /api/register` | Registers a new user | `INSERT INTO users (username, email, password, userType) VALUES ($1, $2, $3, $4)` |
| `POST /api/login` | Authenticates user | Validates credentials and creates session |
| `POST /api/logout` | Ends user session | Destroys session data |
| `GET /api/user` | Gets current user info | `SELECT * FROM users WHERE id = $1` |

#### User & Complaint Endpoints

| Endpoint | Description | Database Operation |
|---------|-------------|-------------------|
| `POST /api/user/complaints` | Submits product complaint | `INSERT INTO product_complaints (user_id, product_id, description, status) VALUES ($1, $2, $3, 'pending')` |
| `GET /api/user/complaints` | Lists user's complaints | `SELECT pc.*, p.name as product_name FROM product_complaints pc JOIN products p ON pc.product_id = p.id WHERE pc.user_id = $1` |

#### Vendor Endpoints

| Endpoint | Description | Database Operation |
|---------|-------------|-------------------|
| `GET /api/vendor/products` | Gets vendor's products | `SELECT * FROM products WHERE vendor_id = $1` |
| `POST /api/vendor/products` | Creates new product | `INSERT INTO products (name, type, price, quantity, description, vendor_id, classification) VALUES ($1, $2, $3, $4, $5, $6, $7)` |
| `PUT /api/vendor/products/:id` | Updates product | `UPDATE products SET name = $1, type = $2... WHERE id = $3 AND vendor_id = $4` |
| `DELETE /api/vendor/products/:id` | Deletes product | `DELETE FROM products WHERE id = $1 AND vendor_id = $2` |
| `GET /api/vendor/complaints` | Gets complaints about vendor's products | `SELECT pc.* FROM product_complaints pc JOIN products p ON pc.product_id = p.id WHERE p.vendor_id = $1` |
| `POST /api/vendor/complaints/:id` | Updates complaint status/response | `UPDATE product_complaints SET vendor_response = $1, status = $2 WHERE id = $3` |

#### Farmer Endpoints

| Endpoint | Description | Database Operation |
|---------|-------------|-------------------|
| `GET /api/farmer/crops` | Gets farmer's crops | `SELECT * FROM crops WHERE farmer_id = $1` |
| `POST /api/farmer/crops` | Creates new crop listing | `INSERT INTO crops (name, type, quantity, price, description, farmer_id) VALUES ($1, $2, $3, $4, $5, $6)` |
| `PUT /api/farmer/crops/:id` | Updates crop details | `UPDATE crops SET name = $1, quantity = $2... WHERE id = $3 AND farmer_id = $4` |
| `DELETE /api/farmer/crops/:id` | Removes crop listing | `DELETE FROM crops WHERE id = $1 AND farmer_id = $2` |

#### Market & Search Endpoints

| Endpoint | Description | Database Operation |
|---------|-------------|-------------------|
| `GET /api/crops/search` | Searches for crops | `SELECT * FROM crops WHERE name ILIKE $1 OR type ILIKE $1` |
| `GET /api/market/prices` | Gets current market prices | `SELECT * FROM market_prices WHERE category = $1 ORDER BY updated_at DESC LIMIT 20` |

## WebSocket API

For real-time features, the application uses WebSockets to provide:

- Live market price updates
- Real-time search suggestions
- Cart synchronization across devices

## Project Structure

```
├── client/ - React frontend
│   ├── src/
│   │   ├── components/ - Reusable UI components
│   │   ├── contexts/ - React context providers
│   │   ├── hooks/ - Custom React hooks
│   │   ├── lib/ - Utility functions
│   │   ├── pages/ - Application pages
│   │   └── main.tsx - Application entry point
│
├── server/ - Node.js backend
│   ├── auth.ts - Authentication logic
│   ├── db.ts - Database connection and queries
│   ├── routes.ts - API routes
│   ├── admin-routes.ts - Admin-specific routes
│   ├── storage.ts - Data access layer
│   └── index.ts - Server entry point
│
├── shared/ - Shared code between client and server
│   └── schema.ts - Database schema definitions with Drizzle
│
├── .env - Environment variables
├── drizzle.config.ts - Drizzle ORM configuration
└── package.json - Project dependencies
```

