import { 
  // Waitlist imports removed
  users, type User, type InsertUser,
  productComplaints, type ProductComplaint, type InsertProductComplaint,
  products, type Product, type InsertProduct,
  vendors, type Vendor, type InsertVendor,
  vendorProducts,
  crops, type Crop, type InsertCrop,
  farmerCrops,
  farmerDisputes, type FarmerDispute, type InsertFarmerDispute
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from './db';
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUserCredentials(username: string, password: string): Promise<User | null>;
  updateUserDarkMode(id: number, darkMode: boolean): Promise<User | undefined>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  updateUserType(id: number, userType: string): Promise<User | undefined>;
  
  // Crop related methods
  getCrops(): Promise<Crop[]>;
  getCropById(cropId: string): Promise<Crop | undefined>;
  getFarmerCrops(farmerId: number): Promise<Crop[]>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  updateCrop(cropId: string, crop: Partial<InsertCrop>): Promise<Crop | undefined>;
  deleteCrop(cropId: string): Promise<boolean>;
  searchCrops(query: string): Promise<Crop[]>;
  
  // Product related methods
  getProducts(): Promise<Product[]>; 
  getProductById(productId: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Vendor related methods
  getVendorById(vendorId: string): Promise<Vendor | undefined>;
  getVendorProducts(vendorId: string): Promise<Product[]>;
  
  // Product Complaint related methods
  createProductComplaint(complaint: InsertProductComplaint): Promise<ProductComplaint>;
  getProductComplaints(userId: number): Promise<ProductComplaint[]>;
  getVendorComplaints(vendorId: string): Promise<ProductComplaint[]>;
  updateComplaintStatus(complaintId: number, status: string): Promise<ProductComplaint | undefined>;
  addVendorResponse(complaintId: number, response: string): Promise<ProductComplaint | undefined>;
  
  // Farmer Dispute related methods
  createFarmerDispute(dispute: InsertFarmerDispute): Promise<FarmerDispute>;
  getVendorFarmerDisputes(vendorId: number): Promise<FarmerDispute[]>;
  getFarmerDisputes(farmerId: number): Promise<FarmerDispute[]>;
  getAllFarmerDisputes(): Promise<FarmerDispute[]>; // For admin view
  updateFarmerDisputeStatus(disputeId: number, status: string): Promise<FarmerDispute | undefined>;
  addFarmerResponse(disputeId: number, response: string): Promise<FarmerDispute | undefined>;
  addAdminNotes(disputeId: number, notes: string): Promise<FarmerDispute | undefined>;
  resolveFarmerDispute(disputeId: number, resolution: string): Promise<FarmerDispute | undefined>;
  
  sessionStore: session.Store;
}

// MemStorage class removed as we're now using DatabaseStorage

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log(`[DATABASE] Looking up user by ID: ${id}`);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      console.log(`[DATABASE] User found: ${user ? 'Yes' : 'No'}`);
      return user;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to get user by ID: ${id}`, error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log(`[DATABASE] Looking up user by username: ${username}`);
      const [user] = await db.select().from(users).where(eq(users.username, username));
      console.log(`[DATABASE] User with username "${username}" found: ${user ? 'Yes' : 'No'}`);
      return user;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to get user by username: ${username}`, error);
      throw error;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log(`[DATABASE] Looking up user by email: ${email}`);
      const [user] = await db.select().from(users).where(eq(users.email, email));
      console.log(`[DATABASE] User with email "${email}" found: ${user ? 'Yes' : 'No'}`);
      return user;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to get user by email: ${email}`, error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log(`[DATABASE] Creating new user with username: ${insertUser.username}, type: ${insertUser.userType || 'customer'}`);
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(insertUser.password, 10);
      
      const [user] = await db.insert(users)
        .values({
          ...insertUser,
          password: hashedPassword,
          role: insertUser.role || 'user',
          userType: insertUser.userType || 'customer',
          darkMode: insertUser.darkMode ?? false
        })
        .returning();
      
      console.log(`[DATABASE] User created successfully with ID: ${user.id}`);
      return user;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to create user: ${insertUser.username}`, error);
      throw error;
    }
  }
  
  async validateUserCredentials(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    return user;
  }
  
  async updateUserDarkMode(id: number, darkMode: boolean): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ darkMode })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async updateUserType(id: number, userType: string): Promise<User | undefined> {
    try {
      console.log(`[DATABASE] Updating user type for user ID: ${id} to type: ${userType}`);
      
      // First check if the user exists
      const user = await this.getUser(id);
      if (!user) {
        console.log(`[DATABASE] User with ID ${id} not found, cannot update type`);
        return undefined;
      }
      
      // Update the user's type
      const [updatedUser] = await db.update(users)
        .set({ 
          userType: userType as any, // Type assertion needed for enum compatibility
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      
      console.log(`[DATABASE] User type update ${updatedUser ? 'successful' : 'failed'}`);
      return updatedUser;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to update user type for ID: ${id}`, error);
      throw error;
    }
  }

  // Crop related methods
  async getCrops(): Promise<Crop[]> {
    try {
      console.log('[DATABASE] Fetching all crops');
      const result = await pool.query(`SELECT * FROM crops`);
      const cropList = result.rows || [];
      
      console.log(`[DATABASE] Retrieved ${cropList.length} crops`);
      return cropList;
    } catch (error) {
      console.error('[DATABASE ERROR] Failed to fetch crops', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  async getCropById(cropId: string): Promise<Crop | undefined> {
    try {
      console.log(`[DATABASE] Looking up crop by ID: ${cropId}`);
      const [crop] = await db.select().from(crops).where(eq(crops.cropId, cropId));
      console.log(`[DATABASE] Crop with ID "${cropId}" found: ${crop ? 'Yes' : 'No'}`);
      return crop;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to get crop by ID: ${cropId}`, error);
      throw error;
    }
  }

  async getFarmerCrops(farmerId: number): Promise<Crop[]> {
    try {
      console.log(`[DATABASE] Fetching crops for farmer ID: ${farmerId}`);
      
      // Get crops directly associated with the user
      const farmerCropsList = await db.select()
        .from(crops)
        .where(eq(crops.farmerId, farmerId));
      
      console.log(`[DATABASE] Retrieved ${farmerCropsList.length} crops for farmer ID: ${farmerId}`);
      return farmerCropsList;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to fetch crops for farmer ID: ${farmerId}`, error);
      return []; // Return empty array on error
    }
  }

  async createCrop(crop: InsertCrop): Promise<Crop> {
    try {
      console.log(`[DATABASE] Creating new crop: ${crop.name}`);
      const [newCrop] = await db.insert(crops)
        .values({
          ...crop,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log(`[DATABASE] Crop created successfully with ID: ${newCrop.cropId}`);
      return newCrop;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to create crop: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }

  async updateCrop(cropId: string, cropUpdates: Partial<InsertCrop>): Promise<Crop | undefined> {
    try {
      console.log(`[DATABASE] Updating crop with ID: ${cropId}`);
      
      // Add updatedAt timestamp to the updates
      const updates = {
        ...cropUpdates,
        updatedAt: new Date()
      };
      
      const [updatedCrop] = await db.update(crops)
        .set(updates)
        .where(eq(crops.cropId, cropId))
        .returning();
      
      console.log(`[DATABASE] Crop update ${updatedCrop ? 'successful' : 'failed'}`);
      return updatedCrop;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to update crop with ID: ${cropId}`, error);
      throw error;
    }
  }

  async deleteCrop(cropId: string): Promise<boolean> {
    try {
      console.log(`[DATABASE] Deleting crop with ID: ${cropId}`);
      
      // First check if the crop exists
      const cropExists = await this.getCropById(cropId);
      if (!cropExists) {
        console.log(`[DATABASE] Crop with ID "${cropId}" not found, cannot delete`);
        return false;
      }
      
      // Delete the crop
      const result = await db.delete(crops)
        .where(eq(crops.cropId, cropId))
        .returning();
      
      const success = result.length > 0;
      console.log(`[DATABASE] Crop deletion ${success ? 'successful' : 'failed'}`);
      return success;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to delete crop with ID: ${cropId}`, error);
      throw error;
    }
  }

  async searchCrops(query: string): Promise<Crop[]> {
    try {
      console.log(`[DATABASE] Searching for crops with query: "${query}"`);
      
      // Convert query to lowercase for case-insensitive search
      const lowercasedQuery = query.toLowerCase();
      
      // Get all crops - in a real app, we'd use a more efficient SQL query with LIKE or full-text search
      const allCrops = await this.getCrops();
      
      // Filter crops that match the query in name, type, or description
      const results = allCrops.filter(crop => 
        crop.name.toLowerCase().includes(lowercasedQuery) ||
        crop.type.toLowerCase().includes(lowercasedQuery) ||
        (crop.description && crop.description.toLowerCase().includes(lowercasedQuery))
      );
      
      console.log(`[DATABASE] Found ${results.length} crops matching "${query}"`);
      return results;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to search crops with query: ${query}`, error);
      throw error;
    }
  }

  // Product related methods
  async getProducts(): Promise<Product[]> {
    try {
      console.log('[DATABASE] Fetching all products');
      // Use a simplified query to avoid schema issues
      const result = await pool.query(`SELECT * FROM products`);
      const productList = result.rows || [];
      
      console.log(`[DATABASE] Retrieved ${productList.length} products`);
      return productList;
    } catch (error) {
      console.error('[DATABASE ERROR] Failed to fetch products', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  async getProductById(productId: string): Promise<Product | undefined> {
    try {
      console.log(`[DATABASE] Looking up product by ID: ${productId}`);
      const [product] = await db.select().from(products).where(eq(products.productId, productId));
      console.log(`[DATABASE] Product with ID "${productId}" found: ${product ? 'Yes' : 'No'}`);
      return product;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to get product by ID: ${productId}`, error);
      throw error;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      console.log(`[DATABASE] Searching for products with query: "${query}"`);
      // Convert query to lowercase for case-insensitive search
      const lowercasedQuery = query.toLowerCase();
      
      // Get all products - in a real app, we'd use a more efficient SQL query with LIKE or full-text search
      const allProducts = await this.getProducts();
      
      // Filter products that match the query in name, type, or description
      const results = allProducts.filter(product => 
        product.name.toLowerCase().includes(lowercasedQuery) ||
        product.type.toLowerCase().includes(lowercasedQuery) ||
        (product.description && product.description.toLowerCase().includes(lowercasedQuery))
      );
      
      console.log(`[DATABASE] Found ${results.length} products matching "${query}"`);
      return results;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to search products with query: ${query}`, error);
      throw error;
    }
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    try {
      console.log(`[DATABASE] Creating new product: ${product.name}`);
      const [newProduct] = await db.insert(products)
        .values({
          ...product,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log(`[DATABASE] Product created successfully with ID: ${newProduct.productId}`);
      
      // If the product has a vendorId, create the relationship in the vendorProducts table
      if (product.vendorId) {
        try {
          await db.insert(vendorProducts)
            .values({
              vendorId: product.vendorId,
              productId: newProduct.productId
            });
          console.log(`[DATABASE] Created vendor-product relationship for vendor: ${product.vendorId}, product: ${newProduct.productId}`);
        } catch (relationError) {
          console.error(`[DATABASE WARNING] Failed to create vendor-product relationship: ${relationError instanceof Error ? relationError.message : relationError}`);
          // Continue even if relationship creation fails
        }
      }
      
      return newProduct;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to create product: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }

  // Vendor related methods
  async getVendorById(vendorId: string): Promise<Vendor | undefined> {
    try {
      console.log(`[DATABASE] Looking up vendor by ID: ${vendorId}`);
      const [vendor] = await db.select().from(vendors).where(eq(vendors.vendorId, vendorId));
      console.log(`[DATABASE] Vendor with ID "${vendorId}" found: ${vendor ? 'Yes' : 'No'}`);
      return vendor;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to get vendor by ID: ${vendorId}`, error);
      throw error;
    }
  }

  async getVendorProducts(vendorId: string): Promise<Product[]> {
    try {
      console.log(`[DATABASE] Fetching products for vendor: ${vendorId}`);
      
      // Use the join table to get all products for this vendor
      // Since we don't have a direct vendorId in products table yet
      const vendorProductEntries = await db.select()
        .from(vendorProducts)
        .where(eq(vendorProducts.vendorId, vendorId));
      
      console.log(`[DATABASE] Found ${vendorProductEntries.length} product-vendor relationships for vendor: ${vendorId}`);
      
      // If we found matching products in the join table
      if (vendorProductEntries.length > 0) {
        // Get the product IDs
        const productIds = vendorProductEntries.map(entry => entry.productId);
        
        // Fetch the actual products
        const productList = await db.select()
          .from(products)
          .where(inArray(products.productId, productIds));
          
        console.log(`[DATABASE] Retrieved ${productList.length} products for vendor: ${vendorId}`);
        return productList;
      }
      
      console.log(`[DATABASE] No products found for vendor: ${vendorId}, falling back to all products`);
      // Fallback: return all products for now
      return await this.getProducts();
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to get vendor products for vendor: ${vendorId}`, error);
      return []; // Return empty array on error
    }
  }

  // Product Complaint related methods
  async createProductComplaint(complaint: InsertProductComplaint): Promise<ProductComplaint> {
    try {
      console.log(`[DATABASE] Creating new product complaint for product: ${complaint.productId}, by user: ${complaint.userId}`);
      const [newComplaint] = await db.insert(productComplaints)
        .values(complaint)
        .returning();
      
      console.log(`[DATABASE] Complaint created successfully with ID: ${newComplaint.id}`);
      return newComplaint;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to create product complaint`, error);
      throw error;
    }
  }

  async getProductComplaints(userId: number): Promise<ProductComplaint[]> {
    try {
      console.log(`[DATABASE] Fetching complaints for user: ${userId}`);
      const complaints = await db.select()
        .from(productComplaints)
        .where(eq(productComplaints.userId, userId))
        .orderBy(desc(productComplaints.createdAt));
      
      console.log(`[DATABASE] Retrieved ${complaints.length} complaints for user: ${userId}`);
      return complaints;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to fetch complaints for user: ${userId}`, error);
      throw error;
    }
  }

  async getVendorComplaints(vendorId: string): Promise<ProductComplaint[]> {
    try {
      console.log(`[DATABASE] Fetching complaints for vendor: ${vendorId}`);
      const complaints = await db.select()
        .from(productComplaints)
        .where(eq(productComplaints.vendorId, vendorId))
        .orderBy(desc(productComplaints.createdAt));
      
      console.log(`[DATABASE] Retrieved ${complaints.length} complaints for vendor: ${vendorId}`);
      return complaints;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to fetch complaints for vendor: ${vendorId}`, error);
      throw error;
    }
  }

  async updateComplaintStatus(complaintId: number, status: string): Promise<ProductComplaint | undefined> {
    try {
      console.log(`[DATABASE] Updating complaint ID: ${complaintId} to status: ${status}`);
      const [updatedComplaint] = await db.update(productComplaints)
        .set({ 
          status: status as any, // Type assertion needed here
          updatedAt: new Date()
        })
        .where(eq(productComplaints.id, complaintId))
        .returning();
      
      console.log(`[DATABASE] Complaint status update ${updatedComplaint ? 'successful' : 'failed'}`);
      return updatedComplaint;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to update complaint status for ID: ${complaintId}`, error);
      throw error;
    }
  }

  async addVendorResponse(complaintId: number, response: string): Promise<ProductComplaint | undefined> {
    try {
      console.log(`[DATABASE] Adding vendor response to complaint ID: ${complaintId}`);
      const [updatedComplaint] = await db.update(productComplaints)
        .set({ 
          vendorResponse: response,
          responseDate: new Date(),
          status: "in_progress" as any, // Type assertion needed here
          updatedAt: new Date()
        })
        .where(eq(productComplaints.id, complaintId))
        .returning();
      
      console.log(`[DATABASE] Vendor response added ${updatedComplaint ? 'successfully' : 'failed'}`);
      return updatedComplaint;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to add vendor response for complaint ID: ${complaintId}`, error);
      throw error;
    }
  }
  
  // Farmer Dispute related methods
  async createFarmerDispute(dispute: InsertFarmerDispute): Promise<FarmerDispute> {
    try {
      console.log(`[DATABASE] Creating new farmer dispute from vendor ID: ${dispute.vendorId} against farmer ID: ${dispute.farmerId}`);
      
      const [newDispute] = await db.insert(farmerDisputes)
        .values({
          ...dispute,
          status: dispute.status || "open",
        })
        .returning();
      
      console.log(`[DATABASE] Farmer dispute created successfully with ID: ${newDispute.id}`);
      return newDispute;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to create farmer dispute: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }

  async getVendorFarmerDisputes(vendorId: number): Promise<FarmerDispute[]> {
    try {
      console.log(`[DATABASE] Fetching disputes created by vendor ID: ${vendorId}`);
      
      const disputes = await db.select()
        .from(farmerDisputes)
        .where(eq(farmerDisputes.vendorId, vendorId));
      
      console.log(`[DATABASE] Retrieved ${disputes.length} disputes for vendor ID: ${vendorId}`);
      return disputes;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to fetch disputes for vendor ID: ${vendorId}`, error);
      return []; // Return empty array on error
    }
  }

  async getFarmerDisputes(farmerId: number): Promise<FarmerDispute[]> {
    try {
      console.log(`[DATABASE] Fetching disputes against farmer ID: ${farmerId}`);
      
      const disputes = await db.select()
        .from(farmerDisputes)
        .where(eq(farmerDisputes.farmerId, farmerId));
      
      console.log(`[DATABASE] Retrieved ${disputes.length} disputes against farmer ID: ${farmerId}`);
      return disputes;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to fetch disputes against farmer ID: ${farmerId}`, error);
      return []; // Return empty array on error
    }
  }

  async getAllFarmerDisputes(): Promise<FarmerDispute[]> {
    try {
      console.log('[DATABASE] Fetching all farmer disputes');
      
      const disputes = await db.select().from(farmerDisputes);
      
      console.log(`[DATABASE] Retrieved ${disputes.length} farmer disputes`);
      return disputes;
    } catch (error) {
      console.error('[DATABASE ERROR] Failed to fetch all farmer disputes', error);
      return []; // Return empty array on error
    }
  }

  async updateFarmerDisputeStatus(disputeId: number, status: string): Promise<FarmerDispute | undefined> {
    try {
      console.log(`[DATABASE] Updating farmer dispute status for ID: ${disputeId} to: ${status}`);
      
      const [updatedDispute] = await db.update(farmerDisputes)
        .set({
          status: status as any, // Type assertion needed for enum compatibility
          updatedAt: new Date()
        })
        .where(eq(farmerDisputes.id, disputeId))
        .returning();
      
      console.log(`[DATABASE] Farmer dispute status update ${updatedDispute ? 'successful' : 'failed'}`);
      return updatedDispute;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to update farmer dispute status for ID: ${disputeId}`, error);
      throw error;
    }
  }

  async addFarmerResponse(disputeId: number, response: string): Promise<FarmerDispute | undefined> {
    try {
      console.log(`[DATABASE] Adding farmer response to dispute ID: ${disputeId}`);
      
      const [updatedDispute] = await db.update(farmerDisputes)
        .set({
          farmerResponse: response,
          responseDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(farmerDisputes.id, disputeId))
        .returning();
      
      console.log(`[DATABASE] Farmer response added to dispute: ${updatedDispute ? 'Yes' : 'No'}`);
      return updatedDispute;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to add farmer response to dispute ID: ${disputeId}`, error);
      throw error;
    }
  }

  async addAdminNotes(disputeId: number, notes: string): Promise<FarmerDispute | undefined> {
    try {
      console.log(`[DATABASE] Adding admin notes to dispute ID: ${disputeId}`);
      
      const [updatedDispute] = await db.update(farmerDisputes)
        .set({
          adminNotes: notes,
          updatedAt: new Date()
        })
        .where(eq(farmerDisputes.id, disputeId))
        .returning();
      
      console.log(`[DATABASE] Admin notes added to dispute: ${updatedDispute ? 'Yes' : 'No'}`);
      return updatedDispute;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to add admin notes to dispute ID: ${disputeId}`, error);
      throw error;
    }
  }

  async resolveFarmerDispute(disputeId: number, resolution: string): Promise<FarmerDispute | undefined> {
    try {
      console.log(`[DATABASE] Resolving dispute ID: ${disputeId}`);
      
      const [resolvedDispute] = await db.update(farmerDisputes)
        .set({
          resolution: resolution,
          status: "resolved" as any,
          resolvedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(farmerDisputes.id, disputeId))
        .returning();
      
      console.log(`[DATABASE] Dispute resolution ${resolvedDispute ? 'successful' : 'failed'}`);
      return resolvedDispute;
    } catch (error) {
      console.error(`[DATABASE ERROR] Failed to resolve dispute ID: ${disputeId}`, error);
      throw error;
    }
  }
}

// Use database storage
export const storage = new DatabaseStorage();