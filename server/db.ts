import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("Loaded environment variables from .env file");
} else {
  dotenv.config();
  console.log("No .env file found, using environment variables");
}

// Configure Neon Database (works for both local and remote PostgreSQL)
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set in environment variables or .env file. Format should be: postgresql://username:password@localhost:5432/agrobuizz",
  );
}

// Create database connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings for better performance
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
});

// Initialize Drizzle ORM
export const db = drizzle({ client: pool, schema });

// Test the database connection
pool.connect()
  .then(() => console.log('Successfully connected to PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err.message));

// Function to execute raw SQL queries for the provided SQL examples
export async function executeRawQuery(sql: string) {
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error('Error executing raw SQL query:', error);
    throw error;
  }
}

// Common queries from the provided SQL file
export const commonQueries = {
  // 1. Retrieve all farmers with their crops
  getAllFarmersWithCrops: `
    SELECT f.name AS farmer_name, c.type AS crop_type, c.quantity 
    FROM FARMER f
    JOIN FARMER_CROP fc ON f.farmer_id = fc.farmer_id
    JOIN CROP c ON fc.crop_id = c.crop_id
  `,
  
  // 3. Get customers with at least 3 orders
  getCustomersWithMultipleOrders: `
    SELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders
    FROM customer c
    JOIN farmer_customer_order o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id, c.name
    HAVING COUNT(o.order_id) >= 3
    ORDER BY total_orders DESC
  `,
  
  // 4. View products by type
  getProductsByType: (type: string) => `
    SELECT * 
    FROM product 
    WHERE type = '${type}'
  `,
  
  // 5. View products by price range
  getProductsByPriceRange: (min: number, max: number) => `
    SELECT * 
    FROM product 
    WHERE price BETWEEN ${min} AND ${max}
  `,
  
  // 6. View available products
  getAvailableProducts: `
    SELECT p.product_id, p.name, v.vendor_id, v.name AS vendor_name, vi.stock_level
    FROM product p
    JOIN vendor_inventory vi ON p.product_id = vi.product_id
    JOIN vendor v ON vi.vendor_id = v.vendor_id
    WHERE vi.stock_level > 0
  `,
  
  // 7. View products by vendor ratings
  getProductsByVendorRatings: (minRating: number = 4) => `
    SELECT p.product_id, p.name, v.vendor_id, v.name AS vendor_name, 
           AVG(vf.rating) AS average_rating
    FROM product p
    JOIN vendor_product vp ON p.product_id = vp.product_id
    JOIN vendor v ON vp.vendor_id = v.vendor_id
    JOIN vendor_farmer_feedback vf ON v.vendor_id = vf.vendor_id
    GROUP BY p.product_id, p.name, v.vendor_id, v.name
    HAVING AVG(vf.rating) >= ${minRating}
    ORDER BY average_rating DESC
  `,
  
  // 8. List crops for sale
  getCropsForSale: `
    SELECT crop_id, type, quantity, price
    FROM crop
    WHERE quantity > 0
    ORDER BY type, price ASC
  `,
  
  // 9. Find total products by vendor
  getVendorProductCounts: `
    SELECT v.vendor_id, v.name, COUNT(vp.product_id) AS total_products
    FROM vendor v
    LEFT JOIN vendor_product vp ON v.vendor_id = vp.vendor_id
    GROUP BY v.vendor_id, v.name
    ORDER BY total_products DESC
  `,
  
  // 10. Track farmer orders
  getFarmerOrders: `
    SELECT v.vendor_id, v.name AS vendor_name, 
           vfo.order_id, vfo.farmer_id, f.name AS farmer_name, 
           vfo.product_id, p.name AS product_name, 
           vfo.quantity, vfo.order_status, vfo.order_date
    FROM vendor_farmer_order vfo
    JOIN vendor v ON vfo.vendor_id = v.vendor_id
    JOIN farmer f ON vfo.farmer_id = f.farmer_id
    JOIN product p ON vfo.product_id = p.product_id
    ORDER BY vfo.order_date DESC
  `,
  
  // 11. Track disputes
  getDisputes: `
    SELECT v.vendor_id, v.name AS vendor_name, 
           vfd.dispute_id, vfd.order_id, 
           vfd.dispute_type, vfd.dispute_status, vfd.details, vfd.resolution_date
    FROM vendor_farmer_dispute vfd
    JOIN vendor v ON vfd.order_id IN (SELECT order_id FROM vendor_farmer_order WHERE vendor_id = v.vendor_id)
    ORDER BY vfd.resolution_date DESC
  `,
  
  // 12. Get vendors with excellent/good feedback
  getHighlyRatedVendors: `
    SELECT v.vendor_id, v.name
    FROM vendor_farmer_feedback AS vff
    JOIN vendor AS v ON vff.vendor_id = v.vendor_id
    WHERE vff.comments REGEXP 'Excellent|Good'
  `,
  
  // 13. Find orders from 2025
  getOrdersFromYear: (year: number = 2025) => `
    SELECT *
    FROM farmer_customer_order
    WHERE order_date BETWEEN '${year}-01-01 00:00:00' AND '${year}-12-31 23:59:59'
  `,
  
  // 14. Get sales by crop
  getCropSales: `
    SELECT 
        c.crop_id,
        c.type,
        SUM(o.quantity) AS total_quantity_sold,
        SUM(o.quantity * c.price) AS total_sales_amount
    FROM farmer_customer_order o
    JOIN crop c ON o.crop_id = c.crop_id
    GROUP BY c.crop_id, c.type
  `,
  
  // 15. Find farmers with multiple disputes
  getFarmersWithMultipleDisputes: `
    SELECT 
        f.farmer_id,
        fc.details AS customer_dispute_detail,
        vf.details AS vendor_dispute_detail
    FROM farmer f
    LEFT JOIN (
        SELECT o.farmer_id, d.details
        FROM farmer_customer_order o
        JOIN farmer_customer_dispute d ON o.order_id = d.order_id
    ) AS fc ON f.farmer_id = fc.farmer_id
    LEFT JOIN (
        SELECT o.farmer_id, d.details
        FROM vendor_farmer_order o
        JOIN vendor_farmer_dispute d ON o.order_id = d.order_id
    ) AS vf ON f.farmer_id = vf.farmer_id
  `,
  
  // 16. Generate analytics for most sold items
  getMostSoldItems: `
    SELECT 
        c.type AS crop_name, 
        COUNT(fco.order_id) AS total_orders
    FROM crop c
    JOIN farmer_customer_order fco ON c.crop_id = fco.crop_id
    GROUP BY c.crop_id, c.type
    ORDER BY total_orders DESC
    LIMIT 5
  `
};
