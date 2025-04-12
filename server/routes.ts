import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWaitlistSchema, insertProductComplaintSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
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
      const complaints = await storage.getProductComplaints(req.user.id);
      return res.status(200).json(complaints);
    } catch (error) {
      console.error("Error fetching user complaints:", error);
      return res.status(500).json({ message: "Server error fetching complaints" });
    }
  });
  
  // Vendor API routes
  app.get("/api/vendor/products", ensureVendor, async (req: Request, res: Response) => {
    try {
      const products = await storage.getVendorProducts(req.user.id.toString());
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      return res.status(500).json({ message: "Server error fetching products" });
    }
  });
  
  app.get("/api/vendor/complaints", ensureVendor, async (req: Request, res: Response) => {
    try {
      const complaints = await storage.getVendorComplaints(req.user.id.toString());
      return res.status(200).json(complaints);
    } catch (error) {
      console.error("Error fetching vendor complaints:", error);
      return res.status(500).json({ message: "Server error fetching complaints" });
    }
  });
  
  app.post("/api/vendor/complaints/:id", ensureVendor, async (req: Request, res: Response) => {
    try {
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
  
  // API route for waitlist signup
  app.post("/api/waitlist", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertWaitlistSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }

      // Check if email already exists in waitlist
      const existingEntry = await storage.getWaitlistEntryByEmail(validatedData.data.email);
      if (existingEntry) {
        return res.status(409).json({ message: "Email already registered in our waitlist" });
      }

      // Create waitlist entry
      const newEntry = await storage.createWaitlistEntry(validatedData.data);
      
      // Track analytics (simplified version)
      console.log(`[ANALYTICS] New waitlist signup: ${validatedData.data.email}`);
      
      return res.status(201).json({
        message: "Successfully joined the waitlist",
        entry: newEntry
      });
    } catch (error) {
      console.error("Error processing waitlist signup:", error);
      return res.status(500).json({ message: "Server error processing your request" });
    }
  });

  // Route to get waitlist entries (for admin purposes)
  app.get("/api/waitlist", async (_req: Request, res: Response) => {
    try {
      const entries = await storage.getWaitlistEntries();
      return res.status(200).json({
        count: entries.length,
        entries
      });
    } catch (error) {
      console.error("Error fetching waitlist entries:", error);
      return res.status(500).json({ message: "Server error fetching waitlist entries" });
    }
  });

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
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'search') {
          // Send back search suggestions based on the query
          const suggestions = handleSearchQuery(data.query);
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
          // Simulate getting real-time market prices for products
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'market_price_update',
              products: generateMarketPrices(data.categoryId)
            }));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
  });

  return httpServer;
}

// Helper function to generate search suggestions
function handleSearchQuery(query: string): string[] {
  // This is a simple implementation. In a real app, you would:
  // 1. Query your database for matching items
  // 2. Return the results
  
  const allItems = [
    'Organic Seeds', 'Heirloom Seeds', 'GMO-Free Seeds', 
    'Farm Equipment', 'Tractors', 'Harvesting Tools',
    'Fresh Produce', 'Organic Vegetables', 'Locally Grown Fruits',
    'Corn Seeds', 'Wheat Seeds', 'Tomato Seeds', 'Potato Seeds',
    'Irrigation Equipment', 'Fertilizer Spreaders', 'Sprayers',
    'Apples', 'Oranges', 'Bananas', 'Strawberries', 'Lettuce',
    'Carrots', 'Onions', 'Garlic'
  ];
  
  if (!query) return [];
  
  // Filter items that contain the query (case insensitive)
  return allItems.filter(item => 
    item.toLowerCase().includes(query.toLowerCase())
  );
}

// Function to generate simulated market prices
interface ProductPrice {
  id: number;
  name: string;
  price: number;
  change: number; // Percentage change
  availability: 'high' | 'medium' | 'low';
}

function generateMarketPrices(categoryId?: string): ProductPrice[] {
  // Sample product data by category
  const seedProducts = [
    { id: 101, name: 'Organic Corn Seeds', basePrice: 5.99 },
    { id: 102, name: 'Heirloom Tomato Seeds', basePrice: 4.50 },
    { id: 103, name: 'GMO-Free Wheat Seeds', basePrice: 6.75 },
    { id: 104, name: 'Potato Seeds', basePrice: 3.99 },
    { id: 105, name: 'Sunflower Seeds', basePrice: 5.25 },
  ];
  
  const equipmentProducts = [
    { id: 201, name: 'Small Tractor', basePrice: 12000 },
    { id: 202, name: 'Harvesting Combine', basePrice: 25000 },
    { id: 203, name: 'Irrigation System', basePrice: 8500 },
    { id: 204, name: 'Fertilizer Spreader', basePrice: 3000 },
    { id: 205, name: 'Sprayer', basePrice: 1500 },
  ];
  
  const produceProducts = [
    { id: 301, name: 'Organic Apples (5kg)', basePrice: 12.99 },
    { id: 302, name: 'Vine-ripened Tomatoes (2kg)', basePrice: 8.50 },
    { id: 303, name: 'Fresh Lettuce (500g)', basePrice: 3.99 },
    { id: 304, name: 'Organic Potatoes (10kg)', basePrice: 15.75 },
    { id: 305, name: 'Sweet Corn (dozen)', basePrice: 7.25 },
  ];
  
  // Select products based on category
  let products;
  switch(categoryId) {
    case 'seeds':
      products = seedProducts;
      break;
    case 'equipment':
      products = equipmentProducts;
      break;
    case 'produce':
      products = produceProducts;
      break;
    default:
      // If no category specified, return a mix
      products = [...seedProducts.slice(0, 2), ...equipmentProducts.slice(0, 2), ...produceProducts.slice(0, 2)];
  }
  
  // Add random price fluctuations and availability
  const availabilityOptions: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
  
  return products.map(product => {
    // Generate random price fluctuation between -8% and +8%
    const fluctuation = (Math.random() * 16 - 8) / 100;
    const newPrice = product.basePrice * (1 + fluctuation);
    
    // Random availability
    const availability = availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)];
    
    return {
      id: product.id,
      name: product.name,
      price: parseFloat(newPrice.toFixed(2)),
      change: parseFloat((fluctuation * 100).toFixed(2)),
      availability
    };
  });
}
