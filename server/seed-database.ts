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
    
    // Check if we have products in the database to determine if data is fully seeded
    let productsExist;
    try {
      productsExist = await executeRawQuery(`
        SELECT COUNT(*) as count FROM products
      `);
      console.log(`Found ${productsExist.rows[0].count} products in database`);
    } catch (err) {
      console.error('Error checking for products:', err);
      console.log('Will attempt to create products table and seed data');
      productsExist = { rows: [{ count: '0' }] };
    }
    
    if (existingAdmin.length > 0) {
      console.log('⏭️ Database already has admin user, checking for products...');
      
      // Check if we already have test products
      if (productsExist && productsExist.rows && productsExist.rows[0] && parseInt(productsExist.rows[0].count) > 0) {
        console.log(`⏭️ Test products already exist (${productsExist.rows[0].count} products found), skipping seeding`);
        return;
      } else {
        console.log('⚠️ Admin exists but no products found, continuing with data seeding...');
      }
    } else {
      console.log('⚠️ Admin user does not exist, proceeding with full database seeding...');
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
    
    // Check if farmer user already exists
    const existingFarmer = await db.select().from(users)
      .where(eq(users.username, 'farmer'))
      .execute();
      
    let farmerUser;
    if (existingFarmer.length === 0) {
      // Create farmer user with shorter field values to prevent varchar overflow
      farmerUser = await db.insert(users).values({
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
    } else {
      farmerUser = existingFarmer;
      console.log(`🚜 Farmer user already exists with ID: ${farmerUser[0].id}`);
    }
    
    // Check if a farmer profile already exists in the farmers table
    let farmerId = null;

    try {
      // First, do a more general search to find any farmer profile
      // This is needed in case username is not unique in the farmers table
      const anyFarmerProfile = await executeRawQuery(`
        SELECT farmer_id FROM farmers LIMIT 1
      `);
      
      if (anyFarmerProfile && anyFarmerProfile.rows && anyFarmerProfile.rows.length > 0) {
        farmerId = anyFarmerProfile.rows[0].farmer_id;
        console.log(`🧑‍🌾 Using existing farmer profile with ID: ${farmerId}`);
      } else {
        try {
          // Create a new farmer profile
          farmerId = `farm_${uuidv4().substring(0, 8)}`;
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
          console.log(`🧑‍🌾 Created new farmer profile with ID: ${farmerId}`);
        } catch (insertError) {
          console.error('Failed to create farmer profile:', insertError);
          // In case of insert error, try one more search
          try {
            const retryFarmerProfile = await executeRawQuery(`
              SELECT farmer_id FROM farmers LIMIT 1
            `);
            
            if (retryFarmerProfile && retryFarmerProfile.rows && retryFarmerProfile.rows.length > 0) {
              farmerId = retryFarmerProfile.rows[0].farmer_id;
              console.log(`🧑‍🌾 Using existing farmer profile (fallback) with ID: ${farmerId}`);
            }
          } catch (retryError) {
            console.error('Failed to get existing farmer profile after insert failed:', retryError);
            farmerId = null;
          }
        }
      }
    } catch (error) {
      console.error('Error in farmer profile retrieval:', error);
      farmerId = null;
    }
    
    if (!farmerId) {
      console.error('Cannot proceed with crop creation as no farmer profile exists');
    }
    
    // Check if customer user already exists
    const existingCustomer = await db.select().from(users)
      .where(eq(users.username, 'customer'))
      .execute();
      
    let customerUser;
    if (existingCustomer.length === 0) {
      // Create customer user
      customerUser = await db.insert(users).values({
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
    } else {
      customerUser = existingCustomer;
      console.log(`🛒 Customer user already exists with ID: ${customerUser[0].id}`);
    }
    
    // Check if vendor user already exists
    const existingVendor = await db.select().from(users)
      .where(eq(users.username, 'vendor'))
      .execute();
      
    let vendorUser;
    if (existingVendor.length === 0) {
      // Create vendor user
      vendorUser = await db.insert(users).values({
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
    } else {
      vendorUser = existingVendor;
      console.log(`🏪 Vendor user already exists with ID: ${vendorUser[0].id}`);
    }
    
    // Check if a vendor profile already exists in the vendors table
    let vendorId = null;

    try {
      // First, do a more general search to find any vendor profile
      // This is needed in case username is not unique in the vendors table
      const anyVendorProfile = await executeRawQuery(`
        SELECT vendor_id FROM vendors LIMIT 1
      `);
      
      if (anyVendorProfile && anyVendorProfile.rows && anyVendorProfile.rows.length > 0) {
        vendorId = anyVendorProfile.rows[0].vendor_id;
        console.log(`🏭 Using existing vendor profile with ID: ${vendorId}`);
      } else {
        try {
          // Create a new vendor profile
          vendorId = `vend_${uuidv4().substring(0, 8)}`;
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
          console.log(`🏭 Created new vendor profile with ID: ${vendorId}`);
        } catch (insertError) {
          console.error('Failed to create vendor profile:', insertError);
          // In case of insert error, try one more search
          try {
            const retryVendorProfile = await executeRawQuery(`
              SELECT vendor_id FROM vendors LIMIT 1
            `);
            
            if (retryVendorProfile && retryVendorProfile.rows && retryVendorProfile.rows.length > 0) {
              vendorId = retryVendorProfile.rows[0].vendor_id;
              console.log(`🏭 Using existing vendor profile (fallback) with ID: ${vendorId}`);
            }
          } catch (retryError) {
            console.error('Failed to get existing vendor profile after insert failed:', retryError);
            vendorId = null;
          }
        }
      }
    } catch (error) {
      console.error('Error in vendor profile retrieval:', error);
      vendorId = null;
    }
    
    if (!vendorId) {
      console.error('Cannot proceed with product creation as no vendor profile exists');
    }
    
    // Create crops for the farmer using raw SQL (simpler than dealing with schema mismatches)
    if (farmerId) {
      console.log('🌽 Creating crops for farmer...');
      
      try {
        // Check if crops already exist
        const existingCrops = await executeRawQuery(`
          SELECT COUNT(*) as count FROM crops c
          JOIN farmer_crops fc ON c.crop_id = fc.crop_id
          WHERE fc.farmer_id = '${farmerId}'
        `);
        
        if (existingCrops && existingCrops.rows && existingCrops.rows[0] && parseInt(existingCrops.rows[0].count) > 0) {
          console.log(`🌱 Farmer already has ${existingCrops.rows[0].count} crops, skipping crop creation`);
        } else {
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
            VALUES ('${farmerId}', '${crop1Id}')
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
            VALUES ('${farmerId}', '${crop2Id}')
          `);
          
          console.log(`🌱 Created 2 crops for farmer`);
        }
      } catch (error) {
        console.error('Failed to create crops for farmer:', error);
      }
    } else {
      console.log('⏭️ Skipping crop creation as farmer ID is not available');
    }
    
    // Create products for the vendor
    // Since we're seeing foreign key constraint issues, let's just create products without the vendor relationship
    console.log('🛠️ Creating standalone products...');
    
    try {
      // Check if products already exist
      const existingProducts = await executeRawQuery(`
        SELECT COUNT(*) as count FROM products
      `);
      
      if (existingProducts && existingProducts.rows && existingProducts.rows[0] && parseInt(existingProducts.rows[0].count) > 0) {
        console.log(`🧰 Database already has ${existingProducts.rows[0].count} products, skipping product creation`);
      } else {
        // Create products in database without vendor relationship
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
        
        console.log(`🧰 Created 3 standalone products`);
      }
    } catch (error) {
      console.error('Failed to create products:', error);
    }
    
    // Create sample orders section
    console.log('📋 Creating sample orders...');
    
    try {
      // First, check if we have any orders already
      const existingOrders = await executeRawQuery(`
        SELECT COUNT(*) as count FROM vendor_farmer_orders
      `);
      
      // Only proceed with creating orders if none exist
      if (!existingOrders.rows[0] || parseInt(existingOrders.rows[0].count) === 0) {
        console.log('📋 No existing orders found, creating sample orders...');
        
        // Get vendor ID from the database
        const vendorResult = await executeRawQuery(`
          SELECT vendor_id FROM vendors LIMIT 1
        `);
        
        // Get farmer ID from the database
        const farmerResult = await executeRawQuery(`
          SELECT farmer_id FROM farmers LIMIT 1
        `);
        
        // Get product IDs from the database
        const productsResult = await executeRawQuery(`
          SELECT product_id FROM products LIMIT 3
        `);
        
        // Get crop IDs from the database
        const cropsResult = await executeRawQuery(`
          SELECT crop_id FROM crops LIMIT 3
        `);
        
        // Only proceed if we have all the required data
        if (vendorResult.rows.length > 0 && 
            farmerResult.rows.length > 0 && 
            productsResult.rows.length > 0 &&
            cropsResult.rows.length > 0) {
          
          const vendorId = vendorResult.rows[0].vendor_id;
          const farmerId = farmerResult.rows[0].farmer_id;
          
          // Create vendor-farmer orders (vendor selling to farmer)
          for (let i = 0; i < Math.min(productsResult.rows.length, 3); i++) {
            const productId = productsResult.rows[i].product_id;
            const orderTypes = ['seeds', 'equipment', 'fertilizer'];
            const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            
            // Create order with a random status and order_type
            const orderType = orderTypes[i % orderTypes.length];
            // Create orders with different status to demonstrate the dashboard filters
            const orderStatus = orderStatuses[i % orderStatuses.length];
            const quantity = Math.floor(Math.random() * 20) + 1;
            const orderId = `order_${uuidv4().substring(0, 8)}`;
            
            try {
              await executeRawQuery(`
                INSERT INTO vendor_farmer_orders (
                  order_id, 
                  vendor_id, 
                  farmer_id, 
                  product_id, 
                  quantity, 
                  order_type, 
                  order_status, 
                  order_date
                ) VALUES (
                  '${orderId}',
                  '${vendorId}', 
                  '${farmerId}', 
                  '${productId}',
                  ${quantity},
                  '${orderType}',
                  '${orderStatus}',
                  now() - interval '${i} days'
                )
              `);
              console.log(`📦 Created vendor-farmer order #${i+1} with ID: ${orderId}, status: ${orderStatus}`);
            } catch (orderError) {
              console.error(`Failed to create vendor-farmer order #${i+1}:`, orderError);
            }
          }
          
          // Create farmer-customer orders (farmer selling to customer)
          for (let i = 0; i < Math.min(cropsResult.rows.length, 3); i++) {
            const cropId = cropsResult.rows[i].crop_id;
            const orderTypes = ['grain', 'vegetables', 'fruit'];
            const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            
            // Create order with a random status and order_type
            const orderType = orderTypes[i % orderTypes.length];
            // Create orders with different status to demonstrate the dashboard filters
            const orderStatus = orderStatuses[(i+2) % orderStatuses.length]; // Different from vendor orders
            const quantity = Math.floor(Math.random() * 50) + 5;
            const orderId = `order_${uuidv4().substring(0, 8)}`;
            
            try {
              await executeRawQuery(`
                INSERT INTO farmer_customer_orders (
                  order_id, 
                  farmer_id, 
                  customer_id, 
                  crop_id, 
                  quantity, 
                  order_type, 
                  order_status, 
                  order_date
                ) VALUES (
                  '${orderId}',
                  '${farmerId}', 
                  'cust_${uuidv4().substring(0, 8)}', 
                  '${cropId}',
                  ${quantity},
                  '${orderType}',
                  '${orderStatus}',
                  now() - interval '${i*2} days'
                )
              `);
              console.log(`🥕 Created farmer-customer order #${i+1} with ID: ${orderId}, status: ${orderStatus}`);
            } catch (orderError) {
              console.error(`Failed to create farmer-customer order #${i+1}:`, orderError);
            }
          }
          
          console.log('📋 Sample orders created successfully');
        } else {
          console.log('⚠️ Missing required data for creating sample orders (vendor, farmer, products, or crops)');
        }
      } else {
        console.log(`📋 ${existingOrders.rows[0].count} existing orders found, skipping sample order creation`);
      }
      
      // Create disputes section
      console.log('⚠️ Checking for vendor-farmer orders to create disputes...');
      
      try {
        // Get an existing vendor-farmer order ID to create a dispute
        const orderResult = await executeRawQuery(`
          SELECT order_id FROM vendor_farmer_orders LIMIT 1
        `);
        
        if (orderResult && orderResult.rows && orderResult.rows.length > 0) {
          const orderId = orderResult.rows[0].order_id;
          console.log(`📋 Found order with ID: ${orderId} for dispute creation`);
          
          // Check if disputes already exist
          const existingDisputes = await executeRawQuery(`
            SELECT COUNT(*) as count FROM vendor_farmer_disputes
          `);
          
          if (existingDisputes && existingDisputes.rows && existingDisputes.rows[0] && parseInt(existingDisputes.rows[0].count) > 0) {
            console.log(`⚠️ Dispute already exists, skipping dispute creation`);
          } else {
            const disputeId = `disp_${uuidv4().substring(0, 8)}`;
            
            console.log(`⚠️ Attempting to create sample dispute with ID: ${disputeId}`);
            
            // Create dispute with the valid order ID
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
            console.log(`⚠️ Created sample dispute with ID: ${disputeId} for order ${orderId}`);
          }
        } else {
          console.log('⏭️ Skipping dispute creation as no orders are available');
        }
      } catch (disputeError) {
        console.error('Failed to create dispute:', disputeError);
      }
    } catch (error) {
      console.error('Failed to create/process disputes:', error);
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