import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User } from "@shared/schema";
import createMemoryStore from "memorystore";

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

const MemoryStore = createMemoryStore(session);

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
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
  
  // Route to update user preferences like dark mode
  app.post("/api/user/preferences", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    try {
      const { darkMode } = req.body;
      
      if (typeof darkMode !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: "Invalid dark mode value"
        });
      }
      
      const updatedUser = await storage.updateUserDarkMode(req.user.id, darkMode);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
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
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({
        success: false,
        message: "Error updating preferences"
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
  app.get("/api/admin/users", (req, res) => {
    // This route is protected by the middleware above
    const users = Array.from(storage['users'].values()).map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      userType: user.userType,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    res.json({ success: true, users });
  });
  
  // Create an admin user if none exists
  (async () => {
    const adminExists = await storage.getUserByUsername('admin');
    if (!adminExists) {
      await storage.createUser({
        username: 'admin',
        email: 'admin@agrobuizz.com',
        password: '12345',
        role: 'admin',
        userType: 'admin',
        darkMode: false
      });
      console.log('Admin user created');
    }
  })();
}