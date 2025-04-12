import { 
  // Waitlist imports removed
  users, type User, type InsertUser,
  productComplaints, type ProductComplaint, type InsertProductComplaint,
  products, type Product, type InsertProduct,
  vendors, type Vendor, type InsertVendor,
  vendorProducts
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
  
  // Waitlist methods removed
  
  // Product related methods
  getProducts(): Promise<Product[]>; 
  getProductById(productId: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Vendor related methods
  getVendorById(vendorId: string): Promise<Vendor | undefined>;
  getVendorProducts(vendorId: string): Promise<Product[]>;
  
  // Product Complaint related methods
  createProductComplaint(complaint: InsertProductComplaint): Promise<ProductComplaint>;
  getProductComplaints(userId: number): Promise<ProductComplaint[]>;
  getVendorComplaints(vendorId: string): Promise<ProductComplaint[]>;
  updateComplaintStatus(complaintId: number, status: string): Promise<ProductComplaint | undefined>;
  addVendorResponse(complaintId: number, response: string): Promise<ProductComplaint | undefined>;
  
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

  // Waitlist methods implementation removed

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
}

// Use database storage
export const storage = new DatabaseStorage();