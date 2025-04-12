import { 
  waitlistEntries, type WaitlistEntry, type InsertWaitlistEntry,
  users, type User, type InsertUser,
  productComplaints, type ProductComplaint, type InsertProductComplaint,
  products, type Product, type InsertProduct,
  vendors, type Vendor, type InsertVendor
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private waitlist: Map<number, WaitlistEntry>;
  
  currentUserId: number;
  currentWaitlistId: number;

  constructor() {
    this.users = new Map();
    this.waitlist = new Map();
    
    this.currentUserId = 1;
    this.currentWaitlistId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: null,
      role: insertUser.role || 'user',
      userType: insertUser.userType || 'customer',
      darkMode: insertUser.darkMode ?? false
    };
    
    this.users.set(id, user);
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
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, darkMode };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, lastLogin: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const id = this.currentWaitlistId++;
    const waitlistEntry: WaitlistEntry = {
      ...entry,
      id,
      createdAt: new Date(),
      notifications: entry.notifications === undefined ? false : entry.notifications,
    };
    this.waitlist.set(id, waitlistEntry);
    return waitlistEntry;
  }

  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return Array.from(this.waitlist.values());
  }

  async getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined> {
    return Array.from(this.waitlist.values()).find(
      (entry) => entry.email === email,
    );
  }
}

// Just use memory storage for now
export const storage = new MemStorage();