/**
 * Database seeding script for AgroBuizz
 * 
 * This script creates sample users, products, and basic data
 * for testing and demonstration purposes.
 */

import { db } from './db';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import {
  users,
  crops,
  products,
  productComplaints,
  farmerDisputes
} from '@shared/schema';
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
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).execute();
    
    if (existingAdmin.length > 0) {
      console.log('⏭️ Database already has admin user, skipping seeding');
      return;
    }
    
    console.log('👤 Creating users...');
    
    // Create admin user
    const adminUser = await db.insert(users).values({
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
    
    // Create crops for the farmer
    console.log('🌽 Creating crops for farmer...');
    
    // First crop
    const crop1 = await db.insert(crops).values({
      cropId: `crop_${uuidv4().substring(0, 8)}`,
      name: 'Organic Sweet Corn',
      type: 'vegetable',
      description: 'Freshly harvested organic sweet corn, perfect for summer meals',
      quantity: 1000,
      price: '3.99',
      imagePath: 'https://images.unsplash.com/photo-1601593346740-925612772716',
      season: 'Summer',
      farmerId: farmerUser[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    // Second crop
    const crop2 = await db.insert(crops).values({
      cropId: `crop_${uuidv4().substring(0, 8)}`,
      name: 'Premium Tomatoes',
      type: 'vegetable',
      description: 'Vine-ripened tomatoes, grown with organic practices',
      quantity: 500,
      price: '2.99',
      imagePath: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
      season: 'Summer',
      farmerId: farmerUser[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    console.log(`🌱 Created ${crop1.length + crop2.length} crops for farmer`);
    
    // Create products for the vendor
    console.log('🛠️ Creating products for vendor...');
    
    // First product
    const product1 = await db.insert(products).values({
      productId: `prod_${uuidv4().substring(0, 8)}`,
      name: 'Premium Wheat Seeds',
      type: 'Seeds',
      description: 'High-yield wheat seeds, perfect for next season planting',
      price: '45.99',
      quantity: 500,
      classification: 'Agriculture',
      vendorId: `vendor_${vendorUser[0].id}`,
    }).returning();
    
    // Second product
    const product2 = await db.insert(products).values({
      productId: `prod_${uuidv4().substring(0, 8)}`,
      name: 'Organic Fertilizer',
      type: 'Fertilizer',
      description: 'Eco-friendly organic fertilizer for better crop yields',
      price: '32.50',
      quantity: 300,
      classification: 'Agriculture',
      vendorId: `vendor_${vendorUser[0].id}`,
    }).returning();
    
    // Third product
    const product3 = await db.insert(products).values({
      productId: `prod_${uuidv4().substring(0, 8)}`,
      name: 'Compact Tractor',
      type: 'Equipment',
      description: 'Small but powerful tractor for small to medium farms',
      price: '12500.00',
      quantity: 5,
      classification: 'Machinery',
      vendorId: `vendor_${vendorUser[0].id}`,
    }).returning();
    
    console.log(`🧰 Created ${[product1, product2, product3].length} products for vendor`);
    
    // Create sample complaint
    const complaint = await db.insert(productComplaints).values({
      userId: customerUser[0].id,
      productId: product2[0].productId,
      vendorId: product2[0].vendorId || '',
      title: 'Package arrived damaged',
      description: 'The fertilizer bag was torn when it arrived',
      status: 'unsolved',
      createdAt: new Date(),
      updatedAt: new Date(),
      vendorResponse: null,
      responseDate: null
    }).returning();
    
    console.log(`🚩 Created ${complaint.length} sample complaint`);
    
    // Create sample dispute
    const dispute = await db.insert(farmerDisputes).values({
      vendorId: vendorUser[0].id,
      farmerId: farmerUser[0].id,
      title: 'Seeds quality issue',
      description: 'Seeds had lower germination rate than advertised',
      status: 'open',
      category: 'quality',
      createdAt: new Date(),
      updatedAt: new Date(),
      farmerResponse: null,
      responseDate: null,
      adminNotes: null,
      resolution: null,
      resolvedAt: null
    }).returning();
    
    console.log(`⚠️ Created ${dispute.length} sample dispute`);
    
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