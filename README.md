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

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+

### Database Setup

1. Create a PostgreSQL database named `agrobuizz`:

```sql
CREATE DATABASE agrobuizz;
```

2. Configure the .env file with your database credentials:

```
DATABASE_URL=postgresql://username:password@localhost:5432/agrobuizz
SESSION_SECRET=your-session-secret-key
PORT=5000
NODE_ENV=development
```

Replace `username` and `password` with your PostgreSQL credentials.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/agrobuizz.git
cd agrobuizz
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database by running the setup script:

```bash
# On Unix/Linux/macOS
./setup-database.sh

# On Windows (using PowerShell)
node scripts/db-setup.js
```

This script will:
- Verify your database connection
- Create all necessary database tables based on the schema
- Apply any pending migrations

4. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5000

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

## API Documentation

### Admin API Endpoints

- `GET /api/admin/farmers-with-crops` - Retrieve all farmers with their crops
- `GET /api/admin/customers-with-multiple-orders` - Get customers with 3+ orders
- `GET /api/admin/products-by-type/:type` - View products by type
- `GET /api/admin/products-by-price-range?min=X&max=Y` - Filter products by price
- `GET /api/admin/available-products` - View products with stock > 0
- `GET /api/admin/products-by-vendor-ratings?minRating=4` - Products by vendor ratings
- `GET /api/admin/crops-for-sale` - List crops available for sale
- `GET /api/admin/vendor-product-counts` - Count products by vendor
- `GET /api/admin/farmer-orders` - Track orders placed by farmers
- `GET /api/admin/disputes` - Track all disputes
- `GET /api/admin/highly-rated-vendors` - Vendors with excellent/good feedback
- `GET /api/admin/orders-by-year/:year` - Find orders by year
- `GET /api/admin/crop-sales` - Find sales of each crop
- `GET /api/admin/farmers-with-multiple-disputes` - Farmers with multiple disputes
- `GET /api/admin/most-sold-items` - Analytics for most sold items
- `POST /api/admin/execute-query` - Run custom SELECT queries

### Main API Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login with credentials
- `POST /api/logout` - Logout current user
- `GET /api/user` - Get current user info
- `POST /api/user/complaints` - Submit a product complaint
- `GET /api/user/complaints` - Get user's complaints
- `GET /api/vendor/products` - Get vendor's products
- `GET /api/vendor/complaints` - Get complaints for vendor's products
- `POST /api/vendor/complaints/:id` - Update complaint status/response
- `POST /api/waitlist` - Join the platform waitlist
- `GET /api/waitlist` - Get waitlist entries (admin access)

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

## Contributors

- Rahul Agarwal
- Saksham Bansal
- Vansh Jain
- Tanish Bachas