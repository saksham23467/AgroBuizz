import { 
  waitlistEntries, type WaitlistEntry, type InsertWaitlistEntry,
  users, type User, type InsertUser,
  productComplaints, type ProductComplaint, type InsertProductComplaint,
  products, type Product, type InsertProduct,
  vendors, type Vendor, type InsertVendor,
  vendorProducts
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq, and, desc } from 'drizzle-orm';
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
  
  // Waitlist related methods
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  getWaitlistEntries(): Promise<WaitlistEntry[]>;
  getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined>;
  
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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
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
    
    return user;
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

  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const [waitlistEntry] = await db.insert(waitlistEntries)
      .values({
        ...entry,
        notifications: entry.notifications === undefined ? false : entry.notifications,
      })
      .returning();
    
    return waitlistEntry;
  }

  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlistEntries);
  }

  async getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined> {
    const [entry] = await db.select().from(waitlistEntries).where(eq(waitlistEntries.email, email));
    return entry;
  }

  // Product related methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductById(productId: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.productId, productId));
    return product;
  }

  async searchProducts(query: string): Promise<Product[]> {
    // Convert query to lowercase for case-insensitive search
    const lowercasedQuery = query.toLowerCase();
    
    // Get all products - in a real app, we'd use a more efficient SQL query with LIKE or full-text search
    const allProducts = await this.getProducts();
    
    // Filter products that match the query in name, type, or description
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(lowercasedQuery) ||
      product.type.toLowerCase().includes(lowercasedQuery) ||
      (product.description && product.description.toLowerCase().includes(lowercasedQuery))
    );
  }

  // Vendor related methods
  async getVendorById(vendorId: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.vendorId, vendorId));
    return vendor;
  }

  async getVendorProducts(vendorId: string): Promise<Product[]> {
    try {
      // First, check if we can directly query products by vendorId
      // If there's a direct relationship in the products table
      const vendorProducts = await db.select()
        .from(products)
        .where(eq(products.vendorId, vendorId));
      
      if (vendorProducts.length > 0) {
        return vendorProducts;
      }
      
      // Fallback: return all products for now
      // In a real app, you would handle the many-to-many relationship properly
      return await this.getProducts();
    } catch (error) {
      console.error("Error getting vendor products:", error);
      return []; // Return empty array on error
    }
  }

  // Product Complaint related methods
  async createProductComplaint(complaint: InsertProductComplaint): Promise<ProductComplaint> {
    const [newComplaint] = await db.insert(productComplaints)
      .values(complaint)
      .returning();
    
    return newComplaint;
  }

  async getProductComplaints(userId: number): Promise<ProductComplaint[]> {
    return await db.select()
      .from(productComplaints)
      .where(eq(productComplaints.userId, userId))
      .orderBy(desc(productComplaints.createdAt));
  }

  async getVendorComplaints(vendorId: string): Promise<ProductComplaint[]> {
    return await db.select()
      .from(productComplaints)
      .where(eq(productComplaints.vendorId, vendorId))
      .orderBy(desc(productComplaints.createdAt));
  }

  async updateComplaintStatus(complaintId: number, status: string): Promise<ProductComplaint | undefined> {
    const [updatedComplaint] = await db.update(productComplaints)
      .set({ 
        status: status as any, // Type assertion needed here
        updatedAt: new Date()
      })
      .where(eq(productComplaints.id, complaintId))
      .returning();
    
    return updatedComplaint;
  }

  async addVendorResponse(complaintId: number, response: string): Promise<ProductComplaint | undefined> {
    const [updatedComplaint] = await db.update(productComplaints)
      .set({ 
        vendorResponse: response,
        responseDate: new Date(),
        status: "in_progress" as any, // Type assertion needed here
        updatedAt: new Date()
      })
      .where(eq(productComplaints.id, complaintId))
      .returning();
    
    return updatedComplaint;
  }
}

// Use database storage
export const storage = new DatabaseStorage();