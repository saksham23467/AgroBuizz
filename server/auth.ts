import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { db } from "./db";
import * as schema from "@shared/schema";
// Properly type the Express Request user property
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      password: string;
      role: "user" | "admin";
      userType: "admin" | "farmer" | "customer" | "vendor";
      createdAt: Date;
      lastLogin: Date | null;
      darkMode: boolean | null;
    }
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.validateUserCredentials(username, password);
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        // Update last login timestamp
        await storage.updateUserLastLogin(user.id);
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Username already exists" 
        });
      }
      
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          message: "Email already exists" 
        });
      }

      // Create the user
      const user = await storage.createUser(req.body);
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: "Error during login after registration" 
          });
        }
        return res.status(201).json({ 
          success: true, 
          user: { 
            id: user.id, 
            username: user.username, 
            email: user.email,
            role: user.role,
            userType: user.userType,
            darkMode: user.darkMode
          } 
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        success: false, 
        message: "An error occurred during registration" 
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Invalid credentials" 
        });
      }
      
      req.login(user, (err: Error) => {
        if (err) {
          return next(err);
        }
        
        return res.status(200).json({ 
          success: true, 
          user: { 
            id: user.id, 
            username: user.username, 
            email: user.email,
            role: user.role,
            userType: user.userType,
            darkMode: user.darkMode
          } 
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error during logout" 
        });
      }
      res.status(200).json({ 
        success: true, 
        message: "Logged out successfully" 
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    const user = req.user;
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        userType: user.userType,
        darkMode: user.darkMode
      } 
    });
  });
  
  // Route to update user preferences like dark mode and user type
  app.post("/api/user/preferences", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    try {
      const { darkMode, userType } = req.body;
      let updatedUser = req.user;
      
      // Update dark mode if provided
      if (typeof darkMode === 'boolean') {
        const result = await storage.updateUserDarkMode(req.user.id, darkMode);
        if (!result) {
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }
        updatedUser = result;
      }
      
      // Update user type if provided
      if (userType && ['farmer', 'customer', 'vendor'].includes(userType)) {
        // Call storage method to update user type
        const result = await storage.updateUserType(req.user.id, userType);
        if (!result) {
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }
        updatedUser = result;
        
        // Update session user data
        req.login(updatedUser, (err) => {
          if (err) {
            console.error("Error updating session after user type change:", err);
            return res.status(500).json({
              success: false,
              message: "Error updating session"
            });
          }
          
          // Return updated user data
          res.json({ 
            success: true, 
            user: { 
              id: updatedUser.id, 
              username: updatedUser.username, 
              email: updatedUser.email,
              role: updatedUser.role,
              userType: updatedUser.userType,
              darkMode: updatedUser.darkMode
            } 
          });
        });
      } else if (!userType) {
        // Just return the updated user if only dark mode was changed
        res.json({ 
          success: true, 
          user: { 
            id: updatedUser.id, 
            username: updatedUser.username, 
            email: updatedUser.email,
            role: updatedUser.role,
            userType: updatedUser.userType,
            darkMode: updatedUser.darkMode
          } 
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid user type"
        });
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({
        success: false,
        message: "Error updating preferences"
      });
    }
  });
  
  // Get all complaints submitted by a user
  app.get("/api/user/complaints", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    try {
      const complaints = await storage.getProductComplaints(req.user.id);
      res.json({ 
        success: true, 
        complaints 
      });
    } catch (error) {
      console.error("Error fetching user complaints:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching complaints"
      });
    }
  });
  
  // Submit a new product complaint
  app.post("/api/products/:productId/complaints", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    try {
      const { productId } = req.params;
      const { title, description, vendorId } = req.body;
      
      if (!title || !description || !vendorId) {
        return res.status(400).json({
          success: false,
          message: "Title, description and vendorId are required"
        });
      }
      
      // Create the complaint
      const complaint = await storage.createProductComplaint({
        userId: req.user.id,
        productId,
        vendorId,
        title,
        description
      });
      
      res.status(201).json({ 
        success: true, 
        complaint 
      });
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(500).json({
        success: false,
        message: "Error creating complaint"
      });
    }
  });
  
  // Middleware to check if user is authenticated
  app.use("/api/admin", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }
    
    next();
  });
  
  // Admin-only route to get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      // This route is protected by the middleware above
      const result = await db.select().from(schema.users);
      
      // Map to safe user objects (without passwords)
      const safeUsers = result.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        userType: user.userType,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }));
      
      res.json({ success: true, users: safeUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching users"
      });
    }
  });
  
  // Middleware to check if user is a vendor
  app.use("/api/vendor", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ 
        success: false, 
        message: "Only vendors can access this resource" 
      });
    }
    
    next();
  });
  
  // Get vendor's product inventory
  app.get("/api/vendor/products", async (req, res) => {
    try {
      // This API will return vendor's products based on user ID
      // In a real app, you would look up the vendor ID based on the user ID
      // For simplicity, we'll mock this with a direct list for now
      const products = await storage.getProducts();
      
      res.json({ 
        success: true, 
        products 
      });
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching vendor products"
      });
    }
  });
  
  // Get complaints for vendor's products
  app.get("/api/vendor/complaints", async (req, res) => {
    try {
      // In a real app, you would look up complaints for this vendor
      // Instead, we'll return all complaints for now
      const vendorId = "vendor1"; // Replace with actual vendor ID in production
      const complaints = await storage.getVendorComplaints(vendorId);
      
      res.json({ 
        success: true, 
        complaints 
      });
    } catch (error) {
      console.error("Error fetching vendor complaints:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching vendor complaints"
      });
    }
  });
  
  // Update a complaint status or add a response
  app.post("/api/vendor/complaints/:complaintId", async (req, res) => {
    try {
      const { complaintId } = req.params;
      const { status, response } = req.body;
      
      let updatedComplaint;
      
      if (response) {
        updatedComplaint = await storage.addVendorResponse(parseInt(complaintId), response);
      } else if (status) {
        updatedComplaint = await storage.updateComplaintStatus(parseInt(complaintId), status);
      } else {
        return res.status(400).json({
          success: false,
          message: "Either status or response is required"
        });
      }
      
      if (!updatedComplaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found"
        });
      }
      
      res.json({ 
        success: true, 
        complaint: updatedComplaint 
      });
    } catch (error) {
      console.error("Error updating complaint:", error);
      res.status(500).json({
        success: false,
        message: "Error updating complaint"
      });
    }
  });
  
  // Middleware to check if user is a farmer
  app.use("/api/farmer", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ 
        success: false, 
        message: "Only farmers can access this resource" 
      });
    }
    
    next();
  });
  
  // Create an admin user if none exists
  (async () => {
    const adminExists = await storage.getUserByUsername('admin');
    if (!adminExists) {
      await storage.createUser({
        username: 'admin',
        email: 'admin@agrobuizz.com',
        password: '123456',
        role: 'admin',
        userType: 'admin',
        darkMode: false
      });
      console.log('Admin user created');
    }
  })();
}