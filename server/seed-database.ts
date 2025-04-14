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
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
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
    
    // Create farmer user
    const farmerUser = await db.insert(users).values({
      username: 'farmer',
      email: 'farmer@agrobuizz.com',
      password: await hashPassword('farmer123'),
      role: 'user',
      userType: 'farmer',
      darkMode: false,
      createdAt: new Date(),
      lastLogin: new Date(),
    }).returning();
    
    console.log(`🚜 Farmer user created with ID: ${farmerUser[0].id}`);
    
    // Create customer user
    const customerUser = await db.insert(users).values({
      username: 'customer',
      email: 'customer@agrobuizz.com',
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
      email: 'vendor@agrobuizz.com',
      password: await hashPassword('vendor123'),
      role: 'user',
      userType: 'vendor',
      darkMode: false,
      createdAt: new Date(),
      lastLogin: new Date(),
    }).returning();
    
    console.log(`🏪 Vendor user created with ID: ${vendorUser[0].id}`);
    
    // Create crops for the farmer using raw SQL (simpler than dealing with schema mismatches)
    console.log('🌽 Creating crops for farmer...');
    
    const crop1Id = `crop_${uuidv4().substring(0, 8)}`;
    await executeRawQuery(`
      INSERT INTO crops (crop_id, name, type, description, quantity, price)
      VALUES (
        '${crop1Id}',
        'Organic Sweet Corn',
        'vegetable',
        'Freshly harvested organic sweet corn, perfect for summer meals',
        1000,
        3.99
      )
    `);
    
    const crop2Id = `crop_${uuidv4().substring(0, 8)}`;
    await executeRawQuery(`
      INSERT INTO crops (crop_id, name, type, description, quantity, price)
      VALUES (
        '${crop2Id}',
        'Premium Tomatoes',
        'vegetable',
        'Vine-ripened tomatoes, grown with organic practices',
        500,
        2.99
      )
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
    
    console.log(`🧰 Created 3 products for vendor`);
    
    // Create sample complaint
    try {
      await executeRawQuery(`
        INSERT INTO product_complaints (user_id, product_id, title, description, status, created_at, updated_at)
        VALUES (
          ${customerUser[0].id},
          '${product2Id}',
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
      await executeRawQuery(`
        INSERT INTO farmer_disputes (vendor_id, farmer_id, title, description, status, category, created_at, updated_at)
        VALUES (
          ${vendorUser[0].id},
          ${farmerUser[0].id},
          'Seeds quality issue',
          'Seeds had lower germination rate than advertised',
          'open',
          'quality',
          now(),
          now()
        )
      `);
      console.log(`⚠️ Created sample dispute`);
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