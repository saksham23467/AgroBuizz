import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertProductComplaintSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import adminRoutes from "./admin-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Register admin routes
  app.use('/api/admin', adminRoutes);
  
  // Middleware to ensure user is authenticated
  const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ success: false, message: "Not authenticated" });
  };
  
  // Middleware to ensure user is a vendor
  const ensureVendor = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user.userType === "vendor") {
      return next();
    }
    res.status(403).json({ success: false, message: "Access denied. Vendor access required." });
  };
  
  // Middleware to ensure user is a farmer
  const ensureFarmer = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user.userType === "farmer") {
      return next();
    }
    res.status(403).json({ success: false, message: "Access denied. Farmer access required." });
  };
  
  // Middleware to ensure user is an admin
  const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    }
    res.status(403).json({ success: false, message: "Access denied. Admin access required." });
  };
  
  // User complaints API routes
  app.post("/api/user/complaints", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      // At this point req.user is guaranteed to exist due to ensureAuthenticated middleware
      const user = req.user!;
      
      // Validate request body
      const validatedData = insertProductComplaintSchema.safeParse({
        ...req.body,
        userId: user.id, // Use the authenticated user's ID
        status: "unsolved",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Create the complaint
      const complaint = await storage.createProductComplaint(validatedData.data);
      
      return res.status(201).json({
        message: "Complaint submitted successfully",
        complaint
      });
    } catch (error) {
      console.error("Error submitting complaint:", error);
      return res.status(500).json({ message: "Server error processing your complaint" });
    }
  });
  
  app.get("/api/user/complaints", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      // User is guaranteed to exist due to ensureAuthenticated middleware
      const user = req.user!;
      const complaints = await storage.getProductComplaints(user.id);
      return res.status(200).json(complaints);
    } catch (error) {
      console.error("Error fetching user complaints:", error);
      return res.status(500).json({ message: "Server error fetching complaints" });
    }
  });
  
  // Vendor API routes
  app.get("/api/vendor/products", ensureVendor, async (req: Request, res: Response) => {
    try {
      // User is guaranteed to exist due to ensureVendor middleware
      const user = req.user!;
      const products = await storage.getVendorProducts(user.id.toString());
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      return res.status(500).json({ message: "Server error fetching products" });
    }
  });
  
  app.get("/api/vendor/complaints", ensureVendor, async (req: Request, res: Response) => {
    try {
      // User is guaranteed to exist due to ensureVendor middleware
      const user = req.user!;
      const complaints = await storage.getVendorComplaints(user.id.toString());
      return res.status(200).json(complaints);
    } catch (error) {
      console.error("Error fetching vendor complaints:", error);
      return res.status(500).json({ message: "Server error fetching complaints" });
    }
  });
  
  app.post("/api/vendor/complaints/:id", ensureVendor, async (req: Request, res: Response) => {
    try {
      // User is guaranteed to exist due to ensureVendor middleware
      const user = req.user!;
      const complaintId = parseInt(req.params.id);
      const { status, response } = req.body;
      
      let updatedComplaint;
      
      // If a status update is requested
      if (status) {
        updatedComplaint = await storage.updateComplaintStatus(complaintId, status);
      }
      
      // If a vendor response is provided
      if (response) {
        updatedComplaint = await storage.addVendorResponse(complaintId, response);
      }
      
      if (!updatedComplaint) {
        return res.status(404).json({ message: "Complaint not found or could not be updated" });
      }
      
      return res.status(200).json({
        message: "Complaint updated successfully",
        complaint: updatedComplaint
      });
    } catch (error) {
      console.error("Error updating complaint:", error);
      return res.status(500).json({ message: "Server error updating complaint" });
    }
  });
  
  // Waitlist signup route removed

  // Waitlist entries route removed

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time search suggestions and updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Keep track of connected clients for broadcasting
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.add(ws);
    
    // Send initial connection message
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        type: 'connection_established',
        message: 'Connected to AgroBuizz real-time service'
      }));
    }
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'search') {
          // Send back search suggestions based on the query
          const suggestions = await handleSearchQuery(data.query);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'search_results',
              results: suggestions
            }));
          }
        } 
        else if (data.type === 'cart_update') {
          // Broadcast cart update to all clients except sender (for multi-device sync)
          if (data.userId) {
            clients.forEach(client => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'cart_sync',
                  userId: data.userId,
                  cartItems: data.cartItems
                }));
              }
            });
          }
        }
        else if (data.type === 'market_price_request') {
          // Get real-time market prices for products from database
          const products = await generateMarketPrices(data.categoryId);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'market_price_update',
              products
            }));
          }
        }
      } catch (error) {
        console.error('[WEBSOCKET ERROR] Error processing message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
  });

  return httpServer;
}

// Helper function to generate search suggestions from database products
async function handleSearchQuery(query: string): Promise<string[]> {
  console.log(`[SEARCH] Searching database for: "${query}"`);
  
  if (!query || query.trim() === '') return [];
  
  try {
    // Get matching products from the database
    const matchingProducts = await storage.searchProducts(query);
    console.log(`[SEARCH] Found ${matchingProducts.length} matching products in database`);
    
    // Extract product names
    const suggestions = matchingProducts.map(product => product.name);
    return suggestions;
  } catch (error) {
    console.error('[SEARCH ERROR] Database search failed:', error);
    return [];
  }
}

// Function to generate market prices from database products
// Define the availability options
type AvailabilityType = 'high' | 'medium' | 'low';

interface ProductPrice {
  id: number;
  name: string;
  price: number;
  change: number; // Percentage change
  availability: AvailabilityType;
}

async function generateMarketPrices(categoryId?: string): Promise<ProductPrice[]> {
  console.log(`[MARKET] Fetching products from database for category: ${categoryId || 'mixed'}`);
  
  try {
    // Get products from database
    const allProducts = await storage.getProducts();
    console.log(`[MARKET] Retrieved ${allProducts.length} products from database`);
    
    if (allProducts.length === 0) {
      console.log('[MARKET] No products found in database, generating sample data');
      // Generate sample market prices when database is empty
      const high: AvailabilityType = 'high';
      const medium: AvailabilityType = 'medium';
      const low: AvailabilityType = 'low';
      
      return [
        { id: 1, name: 'Organic Wheat Seeds', price: 24.99, change: 2.3, availability: high },
        { id: 2, name: 'Tomato Seedlings', price: 8.50, change: -1.5, availability: medium },
        { id: 3, name: 'Corn Seeds (Premium)', price: 15.75, change: 0.8, availability: high },
        { id: 4, name: 'Rice Seeds', price: 12.25, change: -0.5, availability: high },
        { id: 5, name: 'Onion Sets', price: 5.99, change: 1.2, availability: medium },
        { id: 6, name: 'Tractor (Small)', price: 12500, change: -2.1, availability: low },
        { id: 7, name: 'Irrigation System', price: 850, change: 3.4, availability: medium },
        { id: 8, name: 'Fresh Tomatoes', price: 3.99, change: 4.2, availability: high },
        { id: 9, name: 'Organic Apples', price: 4.50, change: -1.8, availability: medium },
        { id: 10, name: 'Fertilizer (20kg)', price: 35.00, change: 1.5, availability: high }
      ].filter(item => {
        // Filter by category if specified
        if (!categoryId) return true;
        if (categoryId === 'seeds' && (item.name.toLowerCase().includes('seed') || item.name.toLowerCase().includes('seedling'))) return true;
        if (categoryId === 'equipment' && (item.name.toLowerCase().includes('tractor') || item.name.toLowerCase().includes('system'))) return true;
        if (categoryId === 'produce' && (item.name.toLowerCase().includes('tomato') || item.name.toLowerCase().includes('apple'))) return true;
        return false;
      });
    }
    
    // Filter by category if specified
    let filteredProducts = [...allProducts];
    if (categoryId) {
      filteredProducts = allProducts.filter(product => {
        if (categoryId === 'seeds' && product.type.toLowerCase().includes('seed')) {
          return true;
        } else if (categoryId === 'equipment' && product.type.toLowerCase().includes('equipment')) {
          return true;
        } else if (categoryId === 'produce' && product.type.toLowerCase().includes('produce')) {
          return true;
        }
        return false;
      });
      console.log(`[MARKET] Filtered to ${filteredProducts.length} products for category: ${categoryId}`);
    }
    
    // Limit to a reasonable number of products (max 10)
    const limitedProducts = filteredProducts.slice(0, 10);
    
    // Generate availability and price fluctuations
    const availabilityOptions: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    
    return limitedProducts.map(product => {
      // Create a numeric ID from the string product ID
      const numericId = parseInt(product.productId.replace(/\D/g, '')) || Math.floor(Math.random() * 1000);
      
      // Generate random price fluctuation between -8% and +8%
      const fluctuation = (Math.random() * 16 - 8) / 100;
      const basePrice = typeof product.price === 'number' ? product.price : parseFloat(product.price as string) || 10.0;
      const newPrice = basePrice * (1 + fluctuation);
      
      // Random availability
      const availability = availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)];
      
      return {
        id: numericId,
        name: product.name,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat((fluctuation * 100).toFixed(2)),
        availability
      };
    });
  } catch (error) {
    console.error('[MARKET ERROR] Failed to generate market prices:', error);
    return [];
  }
}
