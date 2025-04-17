  import { pgTable, text, serial, timestamp, boolean, numeric, integer, date, foreignKey, primaryKey, varchar, pgEnum } from "drizzle-orm/pg-core";
  import { createInsertSchema } from "drizzle-zod";
  import { z } from "zod";
  import { relations } from "drizzle-orm";
  
  // User Types
  export const userTypeEnum = pgEnum('user_type', ['farmer', 'customer', 'vendor', 'admin']);
  export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
  
  // User Table - For authentication
  export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 100 }).notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    userType: userTypeEnum("user_type").notNull().default("customer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastLogin: timestamp("last_login"),
    darkMode: boolean("dark_mode").default(false),
  });
  export const roleEnum = pgEnum('role', ['admin', 'manager', 'support']);
  export const orderTypeEnum = pgEnum('order_type', ['standard', 'express', 'rental', 'subscription']);
  export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
  export const disputeTypeEnum = pgEnum('dispute_type', ['quality', 'delivery', 'payment', 'other']);
  export const disputeStatusEnum = pgEnum('dispute_status', ['open', 'investigating', 'resolved', 'closed']);
  
  // Admin Table
  export const admins = pgTable("admins", {
    adminId: varchar("admin_id", { length: 50 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    role: roleEnum("role").notNull(),
  });
  
  // Crop Table
  export const crops = pgTable("crops", {
    cropId: varchar("crop_id", { length: 50 }).primaryKey(),
    type: varchar("type", { length: 50 }).notNull(),
    quantity: integer("quantity").notNull().default(0),
    price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
    description: text("description"),
  });
  
  // Customer Table
  export const customers = pgTable("customers", {
    customerId: varchar("customer_id", { length: 50 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    contactInfo: varchar("contact_info", { length: 50 }).notNull(),
    address: text("address").notNull(),
    profileCreationDate: timestamp("profile_creation_date").defaultNow().notNull(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
  });
  
  // Farmer Table
  export const farmers = pgTable("farmers", {
    farmerId: varchar("farmer_id", { length: 50 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    contactInfo: varchar("contact_info", { length: 50 }).notNull(),
    address: text("address").notNull(),
    farmType: varchar("farm_type", { length: 50 }),
    cropsGrown: text("crops_grown"),
    profileCreationDate: timestamp("profile_creation_date").defaultNow().notNull(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
  });
  
  // Product Table
  export const products = pgTable("products", {
    productId: varchar("product_id", { length: 50 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
    quantity: integer("quantity").notNull().default(0),
    classification: varchar("classification", { length: 50 }),
  });
  
  // Vendor Table
  export const vendors = pgTable("vendors", {
    vendorId: varchar("vendor_id", { length: 50 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    businessDetails: text("business_details").notNull(),
    contactInfo: varchar("contact_info", { length: 50 }).notNull(),
    address: text("address").notNull(),
    profileCreationDate: timestamp("profile_creation_date").defaultNow().notNull(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
  });
  
  // Farmer Crop Join Table
  export const farmerCrops = pgTable("farmer_crops", {
    farmerId: varchar("farmer_id", { length: 50 }).notNull().references(() => farmers.farmerId, { onDelete: 'cascade' }),
    cropId: varchar("crop_id", { length: 50 }).notNull().references(() => crops.cropId, { onDelete: 'cascade' }),
  }, (table) => {
    return {
      pk: primaryKey({ columns: [table.farmerId, table.cropId] }),
    };
  });
  
  // Vendor Product Join Table
  export const vendorProducts = pgTable("vendor_products", {
    vendorId: varchar("vendor_id", { length: 50 }).notNull().references(() => vendors.vendorId, { onDelete: 'cascade' }),
    productId: varchar("product_id", { length: 50 }).notNull().references(() => products.productId, { onDelete: 'cascade' }),
  }, (table) => {
    return {
      pk: primaryKey({ columns: [table.vendorId, table.productId] }),
    };
  });
  
  // Farmer Inventory Table
  export const farmerInventories = pgTable("farmer_inventories", {
    farmerId: varchar("farmer_id", { length: 50 }).notNull().references(() => farmers.farmerId, { onDelete: 'cascade' }),
    cropId: varchar("crop_id", { length: 50 }).notNull().references(() => crops.cropId, { onDelete: 'cascade' }),
    stockLevel: integer("stock_level").notNull().default(0),
    lowStockNotification: boolean("low_stock_notification").default(false),
  }, (table) => {
    return {
      pk: primaryKey({ columns: [table.farmerId, table.cropId] }),
    };
  });
  
  // Vendor Inventory Table
  export const vendorInventories = pgTable("vendor_inventories", {
    vendorId: varchar("vendor_id", { length: 50 }).notNull().references(() => vendors.vendorId, { onDelete: 'cascade' }),
    productId: varchar("product_id", { length: 50 }).notNull().references(() => products.productId, { onDelete: 'cascade' }),
    stockLevel: integer("stock_level").notNull().default(0),
    lowStockNotification: boolean("low_stock_notification").default(false),
  }, (table) => {
    return {
      pk: primaryKey({ columns: [table.vendorId, table.productId] }),
    };
  });
  
  // Farmer Customer Order Table
  export const farmerCustomerOrders = pgTable("farmer_customer_orders", {
    orderId: varchar("order_id", { length: 50 }).primaryKey(),
    farmerId: varchar("farmer_id", { length: 50 }).notNull().references(() => farmers.farmerId, { onDelete: 'cascade' }),
    customerId: varchar("customer_id", { length: 50 }).notNull().references(() => customers.customerId, { onDelete: 'cascade' }),
    cropId: varchar("crop_id", { length: 50 }).notNull().references(() => crops.cropId, { onDelete: 'cascade' }),
    orderType: orderTypeEnum("order_type").notNull(),
    orderStatus: orderStatusEnum("order_status"),
    quantity: integer("quantity").notNull().default(1),
    orderDate: timestamp("order_date").defaultNow().notNull(),
  });
  
  // Vendor Farmer Order Table
  export const vendorFarmerOrders = pgTable("vendor_farmer_orders", {
    orderId: varchar("order_id", { length: 50 }).primaryKey(),
    vendorId: varchar("vendor_id", { length: 50 }).notNull().references(() => vendors.vendorId, { onDelete: 'cascade' }),
    farmerId: varchar("farmer_id", { length: 50 }).notNull().references(() => farmers.farmerId, { onDelete: 'cascade' }),
    productId: varchar("product_id", { length: 50 }).notNull().references(() => products.productId, { onDelete: 'cascade' }),
    orderType: orderTypeEnum("order_type").notNull(),
    orderStatus: orderStatusEnum("order_status"),
    quantity: integer("quantity").notNull().default(1),
    orderDate: timestamp("order_date").defaultNow().notNull(),
  });
  
  // Farmer Customer Transaction Table
  export const farmerCustomerTransactions = pgTable("farmer_customer_transactions", {
    transactionId: varchar("transaction_id", { length: 50 }).primaryKey(),
    orderId: varchar("order_id", { length: 50 }).notNull().references(() => farmerCustomerOrders.orderId, { onDelete: 'cascade' }),
    paymentMode: varchar("payment_mode", { length: 50 }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
    transactionTimestamp: timestamp("transaction_timestamp").defaultNow().notNull(),
    commission: numeric("commission", { precision: 10, scale: 2 }),
  });
  
  // Vendor Farmer Transaction Table
  export const vendorFarmerTransactions = pgTable("vendor_farmer_transactions", {
    transactionId: varchar("transaction_id", { length: 50 }).primaryKey(),
    orderId: varchar("order_id", { length: 50 }).notNull().references(() => vendorFarmerOrders.orderId, { onDelete: 'cascade' }),
    paymentMode: varchar("payment_mode", { length: 50 }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
    transactionTimestamp: timestamp("transaction_timestamp").defaultNow().notNull(),
    commission: numeric("commission", { precision: 10, scale: 2 }),
  });
  
  // Farmer Customer Feedback Table
  export const farmerCustomerFeedbacks = pgTable("farmer_customer_feedbacks", {
    feedbackId: varchar("feedback_id", { length: 50 }).primaryKey(),
    orderId: varchar("order_id", { length: 50 }).notNull().references(() => farmerCustomerOrders.orderId, { onDelete: 'cascade' }),
    farmerId: varchar("farmer_id", { length: 50 }).references(() => farmers.farmerId, { onDelete: 'set null' }),
    customerId: varchar("customer_id", { length: 50 }).references(() => customers.customerId, { onDelete: 'set null' }),
    rating: integer("rating").notNull(),
    comments: text("comments"),
    feedbackTimestamp: timestamp("feedback_timestamp").defaultNow().notNull(),
  });
  
  // Vendor Farmer Feedback Table
  export const vendorFarmerFeedbacks = pgTable("vendor_farmer_feedbacks", {
    feedbackId: varchar("feedback_id", { length: 50 }).primaryKey(),
    orderId: varchar("order_id", { length: 50 }).notNull().references(() => vendorFarmerOrders.orderId, { onDelete: 'cascade' }),
    farmerId: varchar("farmer_id", { length: 50 }).references(() => farmers.farmerId, { onDelete: 'set null' }),
    vendorId: varchar("vendor_id", { length: 50 }).references(() => vendors.vendorId, { onDelete: 'set null' }),
    rating: integer("rating").notNull(),
    comments: text("comments"),
    feedbackTimestamp: timestamp("feedback_timestamp").defaultNow().notNull(),
  });
  
  // Farmer Customer Dispute Table
  export const farmerCustomerDisputes = pgTable("farmer_customer_disputes", {
    disputeId: varchar("dispute_id", { length: 50 }).primaryKey(),
    orderId: varchar("order_id", { length: 50 }).notNull().references(() => farmerCustomerOrders.orderId, { onDelete: 'cascade' }),
    disputeType: disputeTypeEnum("dispute_type").notNull(),
    disputeStatus: disputeStatusEnum("dispute_status"),
    details: text("details"),
    resolutionDate: date("resolution_date"),
  });
  
  // Vendor Farmer Dispute Table
  export const vendorFarmerDisputes = pgTable("vendor_farmer_disputes", {
    disputeId: varchar("dispute_id", { length: 50 }).primaryKey(),
    orderId: varchar("order_id", { length: 50 }).notNull().references(() => vendorFarmerOrders.orderId, { onDelete: 'cascade' }),
    disputeType: disputeTypeEnum("dispute_type").notNull(),
    disputeStatus: disputeStatusEnum("dispute_status"),
    details: text("details"),
    resolutionDate: date("resolution_date"),
  });
  
  // Waitlist Entries (keep the original table)
  export const waitlistEntries = pgTable("waitlist_entries", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    reason: text("reason").notNull(),
    userType: text("user_type").notNull(),
    notifications: boolean("notifications").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  });
  
  // Define relations
  export const adminsRelations = relations(admins, ({ many }) => ({
    // Admin doesn't directly relate to other tables in this schema
  }));
  
  export const cropsRelations = relations(crops, ({ many }) => ({
    farmerCrops: many(farmerCrops),
    farmerInventories: many(farmerInventories),
    farmerCustomerOrders: many(farmerCustomerOrders),
  }));
  
  export const customersRelations = relations(customers, ({ many }) => ({
    farmerCustomerOrders: many(farmerCustomerOrders),
    farmerCustomerFeedbacks: many(farmerCustomerFeedbacks),
  }));
  
  export const farmersRelations = relations(farmers, ({ many }) => ({
    farmerCrops: many(farmerCrops),
    farmerInventories: many(farmerInventories),
    farmerCustomerOrders: many(farmerCustomerOrders),
    vendorFarmerOrders: many(vendorFarmerOrders),
    farmerCustomerFeedbacks: many(farmerCustomerFeedbacks),
    vendorFarmerFeedbacks: many(vendorFarmerFeedbacks),
  }));
  
  export const productsRelations = relations(products, ({ many }) => ({
    vendorProducts: many(vendorProducts),
    vendorInventories: many(vendorInventories),
    vendorFarmerOrders: many(vendorFarmerOrders),
  }));
  
  export const vendorsRelations = relations(vendors, ({ many }) => ({
    vendorProducts: many(vendorProducts),
    vendorInventories: many(vendorInventories),
    vendorFarmerOrders: many(vendorFarmerOrders),
    vendorFarmerFeedbacks: many(vendorFarmerFeedbacks),
  }));
  
  // Define insert schemas for each table
  export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, lastLogin: true });
  export const insertAdminSchema = createInsertSchema(admins);
  export const insertCropSchema = createInsertSchema(crops);
  export const insertCustomerSchema = createInsertSchema(customers).omit({ profileCreationDate: true });
  export const insertFarmerSchema = createInsertSchema(farmers).omit({ profileCreationDate: true });
  export const insertProductSchema = createInsertSchema(products);
  export const insertVendorSchema = createInsertSchema(vendors).omit({ profileCreationDate: true });
  export const insertFarmerCropSchema = createInsertSchema(farmerCrops);
  export const insertVendorProductSchema = createInsertSchema(vendorProducts);
  export const insertFarmerInventorySchema = createInsertSchema(farmerInventories);
  export const insertVendorInventorySchema = createInsertSchema(vendorInventories);
  export const insertFarmerCustomerOrderSchema = createInsertSchema(farmerCustomerOrders).omit({ orderDate: true });
  export const insertVendorFarmerOrderSchema = createInsertSchema(vendorFarmerOrders).omit({ orderDate: true });
  export const insertFarmerCustomerTransactionSchema = createInsertSchema(farmerCustomerTransactions).omit({ transactionTimestamp: true });
  export const insertVendorFarmerTransactionSchema = createInsertSchema(vendorFarmerTransactions).omit({ transactionTimestamp: true });
  export const insertFarmerCustomerFeedbackSchema = createInsertSchema(farmerCustomerFeedbacks).omit({ feedbackTimestamp: true });
  export const insertVendorFarmerFeedbackSchema = createInsertSchema(vendorFarmerFeedbacks).omit({ feedbackTimestamp: true });
  export const insertFarmerCustomerDisputeSchema = createInsertSchema(farmerCustomerDisputes);
  export const insertVendorFarmerDisputeSchema = createInsertSchema(vendorFarmerDisputes);
  export const insertWaitlistSchema = createInsertSchema(waitlistEntries).pick({
    name: true,
    email: true,
    reason: true,
    userType: true,
    notifications: true,
  });
  
  // Define types
  export type InsertUser = z.infer<typeof insertUserSchema>;
  export type User = typeof users.$inferSelect;
  
  export type InsertAdmin = z.infer<typeof insertAdminSchema>;
  export type Admin = typeof admins.$inferSelect;
  
  export type InsertCrop = z.infer<typeof insertCropSchema>;
  export type Crop = typeof crops.$inferSelect;
  
  export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
  export type Customer = typeof customers.$inferSelect;
  
  export type InsertFarmer = z.infer<typeof insertFarmerSchema>;
  export type Farmer = typeof farmers.$inferSelect;
  
  export type InsertProduct = z.infer<typeof insertProductSchema>;
  export type Product = typeof products.$inferSelect;
  
  export type InsertVendor = z.infer<typeof insertVendorSchema>;
  export type Vendor = typeof vendors.$inferSelect;
  
  export type InsertFarmerCrop = z.infer<typeof insertFarmerCropSchema>;
  export type FarmerCrop = typeof farmerCrops.$inferSelect;
  
  export type InsertVendorProduct = z.infer<typeof insertVendorProductSchema>;
  export type VendorProduct = typeof vendorProducts.$inferSelect;
  
  export type InsertFarmerInventory = z.infer<typeof insertFarmerInventorySchema>;
  export type FarmerInventory = typeof farmerInventories.$inferSelect;
  
  export type InsertVendorInventory = z.infer<typeof insertVendorInventorySchema>;
  export type VendorInventory = typeof vendorInventories.$inferSelect;
  
  export type InsertFarmerCustomerOrder = z.infer<typeof insertFarmerCustomerOrderSchema>;
  export type FarmerCustomerOrder = typeof farmerCustomerOrders.$inferSelect;
  
  export type InsertVendorFarmerOrder = z.infer<typeof insertVendorFarmerOrderSchema>;
  export type VendorFarmerOrder = typeof vendorFarmerOrders.$inferSelect;
  
  export type InsertFarmerCustomerTransaction = z.infer<typeof insertFarmerCustomerTransactionSchema>;
  export type FarmerCustomerTransaction = typeof farmerCustomerTransactions.$inferSelect;
  
  export type InsertVendorFarmerTransaction = z.infer<typeof insertVendorFarmerTransactionSchema>;
  export type VendorFarmerTransaction = typeof vendorFarmerTransactions.$inferSelect;
  
  export type InsertFarmerCustomerFeedback = z.infer<typeof insertFarmerCustomerFeedbackSchema>;
  export type FarmerCustomerFeedback = typeof farmerCustomerFeedbacks.$inferSelect;
  
  export type InsertVendorFarmerFeedback = z.infer<typeof insertVendorFarmerFeedbackSchema>;
  export type VendorFarmerFeedback = typeof vendorFarmerFeedbacks.$inferSelect;
  
  export type InsertFarmerCustomerDispute = z.infer<typeof insertFarmerCustomerDisputeSchema>;
  export type FarmerCustomerDispute = typeof farmerCustomerDisputes.$inferSelect;
  
  export type InsertVendorFarmerDispute = z.infer<typeof insertVendorFarmerDisputeSchema>;
  export type VendorFarmerDispute = typeof vendorFarmerDisputes.$inferSelect;
  
  export type InsertWaitlistEntry = z.infer<typeof insertWaitlistSchema>;
  export type WaitlistEntry = typeof waitlistEntries.$inferSelect;
  