/**
 * Database seeding script for AgroBuizz
 * 
 * This script creates sample users, products, and basic data
 * for testing and demonstration purposes.
 */

import { db } from './db';
import { executeRawQuery } from './db';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  // Use a shorter hash+salt combination to fit within varchar(100)
  const salt = randomBytes(8).toString("hex");  // 16 chars
  const buf = (await scryptAsync(password, salt, 32)) as Buffer; // 64 chars
  const result = `${buf.toString("hex")}.${salt}`;
  
  // Ensure the result fits within 100 characters
  if (result.length > 99) {
    console.warn(`Warning: Hash truncated from ${result.length} to 99 characters`);
    return result.substring(0, 99);
  }
  
  return result;
}

// Main seeding function
export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding process...');
    
    // Check if database is already seeded by looking for admin user
    const existingAdmin = await db.select().from(users)
      .where(eq(users.username, 'admin'))
      .execute();
    
    if (existingAdmin.length > 0) {
      console.log('⏭️ Database already has admin user, checking for test accounts...');
      
      // Check if we already have the test accounts
      const testFarmer = await db.select().from(users)
        .where(eq(users.username, 'farmer'))
        .execute();
        
      if (testFarmer.length > 0) {
        console.log('⏭️ Test accounts already exist, skipping seeding');
        return;
      }
    }
    
    console.log('👤 Creating users...');
    
    // Create admin user if it doesn't exist
    let adminUser;
    if (existingAdmin.length === 0) {
      adminUser = await db.insert(users).values({
        username: 'admin',
        email: 'admin@agrobuizz.com',
        password: await hashPassword('admin123'),
        role: 'admin',
        userType: 'admin',
        darkMode: false,
        createdAt: new Date(),
        lastLogin: new Date(),
      }).returning();
      
      console.log(`👑 Admin user created with ID: ${adminUser[0].id}`);
    } else {
      adminUser = existingAdmin;
      console.log(`👑 Admin user already exists with ID: ${adminUser[0].id}`);
    }
    
    // Create farmer user with shorter field values to prevent varchar overflow
    const farmerUser = await db.insert(users).values({
      username: 'farmer',
      email: 'farmer@example.com', // Using a shorter email
      password: await hashPassword('farmer123'),
      role: 'user',
      userType: 'farmer',
      darkMode: false,
      createdAt: new Date(),
      lastLogin: new Date(),
    }).returning();
    
    console.log(`🚜 Farmer user created with ID: ${farmerUser[0].id}`);
    
    // Create a farmer profile in the farmers table
    const farmerId = `farm_${uuidv4().substring(0, 8)}`;
    try {
      await executeRawQuery(`
        INSERT INTO farmers (farmer_id, name, contact_info, address, farm_type, crops_grown, profile_creation_date, username, password)
        VALUES (
          '${farmerId}',
          'Test Farmer',
          '555-123-4567',
          '123 Farm Lane, Countryside, CA',
          'Organic',
          'Corn, Tomatoes, Wheat',
          now(),
          'farmer',
          '${await hashPassword('farmer123')}'
        )
      `);
      console.log(`🧑‍🌾 Farmer profile created with ID: ${farmerId}`);
    } catch (error) {
      console.error('Failed to create farmer profile:', error);
    }
    
    // Create customer user
    const customerUser = await db.insert(users).values({
      username: 'customer',
      email: 'customer@example.com', // Using a shorter email
      password: await hashPassword('customer123'),
      role: 'user',
      userType: 'customer',
      darkMode: false,
      createdAt: new Date(),
      lastLogin: new Date(),
    }).returning();
    
    console.log(`🛒 Customer user created with ID: ${customerUser[0].id}`);
    
    // Create vendor user
    const vendorUser = await db.insert(users).values({
      username: 'vendor',
      email: 'vendor@example.com', // Using a shorter email
      password: await hashPassword('vendor123'),
      role: 'user',
      userType: 'vendor',
      darkMode: false,
      createdAt: new Date(),
      lastLogin: new Date(),
    }).returning();
    
    console.log(`🏪 Vendor user created with ID: ${vendorUser[0].id}`);
    
    // Create a vendor profile in the vendors table
    const vendorId = `vend_${uuidv4().substring(0, 8)}`;
    try {
      await executeRawQuery(`
        INSERT INTO vendors (vendor_id, name, business_details, contact_info, address, profile_creation_date, username, password)
        VALUES (
          '${vendorId}',
          'Test Vendor',
          'Agricultural supplies and equipment',
          '555-987-6543',
          '456 Business Ave, Metropolis, CA',
          now(),
          'vendor',
          '${await hashPassword('vendor123')}'
        )
      `);
      console.log(`🏭 Vendor profile created with ID: ${vendorId}`);
    } catch (error) {
      console.error('Failed to create vendor profile:', error);
    }
    
    // Create crops for the farmer using raw SQL (simpler than dealing with schema mismatches)
    console.log('🌽 Creating crops for farmer...');
    
    const crop1Id = `crop_${uuidv4().substring(0, 8)}`;
    await executeRawQuery(`
      INSERT INTO crops (crop_id, type, description, quantity, price)
      VALUES (
        '${crop1Id}',
        'vegetable',
        'Freshly harvested organic sweet corn, perfect for summer meals',
        1000,
        3.99
      )
    `);
    
    // Add relationship between farmer and crop in the farmer_crops table
    await executeRawQuery(`
      INSERT INTO farmer_crops (farmer_id, crop_id)
      VALUES ('${farmerUser[0].id}', '${crop1Id}')
    `);
    
    const crop2Id = `crop_${uuidv4().substring(0, 8)}`;
    await executeRawQuery(`
      INSERT INTO crops (crop_id, type, description, quantity, price)
      VALUES (
        '${crop2Id}',
        'vegetable',
        'Vine-ripened tomatoes, grown with organic practices',
        500,
        2.99
      )
    `);
    
    // Add relationship between farmer and crop in the farmer_crops table
    await executeRawQuery(`
      INSERT INTO farmer_crops (farmer_id, crop_id)
      VALUES ('${farmerUser[0].id}', '${crop2Id}')
    `);
    
    console.log(`🌱 Created 2 crops for farmer`);
    
    // Create products for the vendor
    console.log('🛠️ Creating products for vendor...');
    
    const product1Id = `prod_${uuidv4().substring(0, 8)}`;
    await executeRawQuery(`
      INSERT INTO products (product_id, name, type, description, price, quantity, classification)
      VALUES (
        '${product1Id}',
        'Premium Wheat Seeds',
        'Seeds',
        'High-yield wheat seeds, perfect for next season planting',
        45.99,
        500,
        'Agriculture'
      )
    `);
    
    // Add relationship between vendor and product in the vendor_products table
    await executeRawQuery(`
      INSERT INTO vendor_products (vendor_id, product_id)
      VALUES ('${vendorUser[0].id}', '${product1Id}')
    `);
    
    const product2Id = `prod_${uuidv4().substring(0, 8)}`;
    await executeRawQuery(`
      INSERT INTO products (product_id, name, type, description, price, quantity, classification)
      VALUES (
        '${product2Id}',
        'Organic Fertilizer',
        'Fertilizer',
        'Eco-friendly organic fertilizer for better crop yields',
        32.50,
        300,
        'Agriculture'
      )
    `);
    
    // Add relationship between vendor and product in the vendor_products table
    await executeRawQuery(`
      INSERT INTO vendor_products (vendor_id, product_id)
      VALUES ('${vendorUser[0].id}', '${product2Id}')
    `);
    
    const product3Id = `prod_${uuidv4().substring(0, 8)}`;
    await executeRawQuery(`
      INSERT INTO products (product_id, name, type, description, price, quantity, classification)
      VALUES (
        '${product3Id}',
        'Compact Tractor',
        'Equipment',
        'Small but powerful tractor for small to medium farms',
        12500.00,
        5,
        'Machinery'
      )
    `);
    
    // Add relationship between vendor and product in the vendor_products table
    await executeRawQuery(`
      INSERT INTO vendor_products (vendor_id, product_id)
      VALUES ('${vendorUser[0].id}', '${product3Id}')
    `);
    
    console.log(`🧰 Created 3 products for vendor`);
    
    // Create sample complaint
    try {
      await executeRawQuery(`
        INSERT INTO product_complaints (user_id, product_id, vendor_id, title, description, status, created_at, updated_at)
        VALUES (
          ${customerUser[0].id},
          '${product2Id}',
          '${vendorUser[0].id}',
          'Package arrived damaged',
          'The fertilizer bag was torn when it arrived',
          'unsolved',
          now(),
          now()
        )
      `);
      console.log(`🚩 Created sample complaint`);
    } catch (error) {
      console.error('Failed to create sample complaint:', error);
    }
    
    // Create sample dispute
    try {
      const disputeId = `disp_${uuidv4().substring(0, 8)}`;
      const orderId = `order_${uuidv4().substring(0, 8)}`;
      
      await executeRawQuery(`
        INSERT INTO vendor_farmer_disputes (dispute_id, order_id, dispute_type, dispute_status, details)
        VALUES (
          '${disputeId}',
          '${orderId}',
          'quality',
          'open',
          'Seeds had lower germination rate than advertised'
        )
      `);
      console.log(`⚠️ Created sample dispute with ID: ${disputeId}`);
    } catch (error) {
      console.error('Failed to create sample dispute:', error);
    }
    
    console.log('✅ Database seeding completed successfully!');
    
    return {
      admin: adminUser[0],
      farmer: farmerUser[0],
      customer: customerUser[0],
      vendor: vendorUser[0],
    };
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}