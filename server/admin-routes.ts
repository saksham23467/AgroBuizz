import { Router, Request, Response } from "express";
import { db } from "./db";
import { executeRawQuery } from "./db";
import { storage } from "./storage";

const router = Router();

// Middleware to ensure the user is an admin
const ensureAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  
  next();
};

// 1. Find all farmers along with their crops
router.get("/farmers-with-crops", ensureAdmin, async (_req: Request, res: Response) => {
  try {
    // This would be replaced with actual database query
    const farmersWithCrops = [
      {
        farmerId: 1,
        farmerName: "John Smith",
        email: "john@agrobuizz.com",
        totalCrops: 3,
        cropsList: [
          { id: "c1", name: "Wheat", quantity: 1500, price: 25.99 },
          { id: "c2", name: "Corn", quantity: 2000, price: 18.50 },
          { id: "c3", name: "Soybeans", quantity: 1200, price: 32.75 }
        ]
      },
      {
        farmerId: 2,
        farmerName: "Maria Garcia",
        email: "maria@agrobuizz.com",
        totalCrops: 2,
        cropsList: [
          { id: "c4", name: "Rice", quantity: 3000, price: 15.25 },
          { id: "c5", name: "Barley", quantity: 1800, price: 21.00 }
        ]
      },
      {
        farmerId: 3,
        farmerName: "Ahmed Khan",
        email: "ahmed@agrobuizz.com",
        totalCrops: 4,
        cropsList: [
          { id: "c6", name: "Cotton", quantity: 900, price: 45.50 },
          { id: "c7", name: "Sugarcane", quantity: 2500, price: 12.75 },
          { id: "c8", name: "Lentils", quantity: 800, price: 35.25 },
          { id: "c9", name: "Sunflower", quantity: 1200, price: 27.50 }
        ]
      }
    ];
    
    res.json(farmersWithCrops);
  } catch (error) {
    console.error("Error fetching farmers with crops:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 2. Get customers who have placed at least 3 orders
router.get("/customers-with-multiple-orders", ensureAdmin, async (_req: Request, res: Response) => {
  try {
    // This would be replaced with actual database query
    const customers = [
      {
        customerId: 101,
        customerName: "Emma Wilson",
        email: "emma@example.com",
        totalOrders: 5,
        totalSpent: 3250.75,
        lastOrderDate: "2025-04-10T09:30:00.000Z"
      },
      {
        customerId: 102,
        customerName: "James Brown",
        email: "james@example.com",
        totalOrders: 4,
        totalSpent: 1875.20,
        lastOrderDate: "2025-04-08T14:15:00.000Z"
      },
      {
        customerId: 103,
        customerName: "Sophia Chen",
        email: "sophia@example.com",
        totalOrders: 7,
        totalSpent: 5120.50,
        lastOrderDate: "2025-04-12T11:45:00.000Z"
      },
      {
        customerId: 104,
        customerName: "Miguel Rodriguez",
        email: "miguel@example.com",
        totalOrders: 3,
        totalSpent: 1450.25,
        lastOrderDate: "2025-04-05T16:20:00.000Z"
      }
    ];
    
    res.json(customers);
  } catch (error) {
    console.error("Error fetching frequent customers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 3. Find products by type
router.get("/products-by-type/:type", ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    // This would be replaced with actual database query
    const products = [
      {
        id: "p1",
        name: "Premium Wheat Seeds",
        type: "seeds",
        price: 45.99,
        stock: 500,
        vendorId: "v1",
        vendorName: "AgriSeeds Co."
      },
      {
        id: "p2",
        name: "Organic Fertilizer",
        type: "fertilizer",
        price: 32.50,
        stock: 300,
        vendorId: "v2",
        vendorName: "EcoFarm Supplies"
      },
      {
        id: "p3",
        name: "Compact Tractor",
        type: "equipment",
        price: 12500.00,
        stock: 5,
        vendorId: "v3",
        vendorName: "FarmTech Machinery"
      }
    ].filter(p => p.type === type);
    
    res.json(products);
  } catch (error) {
    console.error(`Error fetching products of type ${req.params.type}:`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 4. Find products by price range
router.get("/products-by-price-range", ensureAdmin, async (req: Request, res: Response) => {
  try {
    const min = parseFloat(req.query.min as string) || 0;
    const max = parseFloat(req.query.max as string) || Number.MAX_SAFE_INTEGER;
    
    // This would be replaced with actual database query
    const products = [
      {
        id: "p1",
        name: "Premium Wheat Seeds",
        type: "seeds",
        price: 45.99,
        stock: 500,
        vendorId: "v1",
        vendorName: "AgriSeeds Co."
      },
      {
        id: "p2",
        name: "Organic Fertilizer",
        type: "fertilizer",
        price: 32.50,
        stock: 300,
        vendorId: "v2",
        vendorName: "EcoFarm Supplies"
      },
      {
        id: "p3",
        name: "Compact Tractor",
        type: "equipment",
        price: 12500.00,
        stock: 5,
        vendorId: "v3",
        vendorName: "FarmTech Machinery"
      }
    ].filter(p => p.price >= min && p.price <= max);
    
    res.json(products);
  } catch (error) {
    console.error(`Error fetching products by price range:`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 5. Find available products (in stock)
router.get("/available-products", ensureAdmin, async (_req: Request, res: Response) => {
  try {
    // This would be replaced with actual database query
    const products = [
      {
        id: "p1",
        name: "Premium Wheat Seeds",
        type: "seeds",
        price: 45.99,
        stock: 500,
        vendorId: "v1",
        vendorName: "AgriSeeds Co."
      },
      {
        id: "p2",
        name: "Organic Fertilizer",
        type: "fertilizer",
        price: 32.50,
        stock: 300,
        vendorId: "v2",
        vendorName: "EcoFarm Supplies"
      },
      {
        id: "p3",
        name: "Compact Tractor",
        type: "equipment",
        price: 12500.00,
        stock: 5,
        vendorId: "v3",
        vendorName: "FarmTech Machinery"
      }
    ].filter(p => p.stock > 0);
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching available products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 6. Find products by vendor ratings
router.get("/products-by-vendor-ratings", ensureAdmin, async (_req: Request, res: Response) => {
  try {
    // This would be replaced with actual database query
    const products = [
      {
        id: "p1",
        name: "Premium Wheat Seeds",
        type: "seeds",
        price: 45.99,
        vendorId: "v1",
        vendorName: "AgriSeeds Co.",
        vendorRating: 4.8
      },
      {
        id: "p2",
        name: "Organic Fertilizer",
        type: "fertilizer",
        price: 32.50,
        vendorId: "v2",
        vendorName: "EcoFarm Supplies",
        vendorRating: 4.5
      },
      {
        id: "p3",
        name: "Compact Tractor",
        type: "equipment",
        price: 12500.00,
        vendorId: "v3",
        vendorName: "FarmTech Machinery",
        vendorRating: 4.2
      }
    ].sort((a, b) => b.vendorRating - a.vendorRating);
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching products by vendor ratings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 7. Find sales of each crop (crop sales report)
router.get("/crop-sales", ensureAdmin, async (_req: Request, res: Response) => {
  try {
    // This would be replaced with actual database query
    const cropSales = [
      {
        cropId: "c1",
        cropName: "Wheat",
        totalSales: 12500,
        totalRevenue: 325000.00,
        farmerId: 1,
        farmerName: "John Smith"
      },
      {
        cropId: "c2",
        cropName: "Corn",
        totalSales: 18000,
        totalRevenue: 333000.00,
        farmerId: 1,
        farmerName: "John Smith"
      },
      {
        cropId: "c4",
        cropName: "Rice",
        totalSales: 22500,
        totalRevenue: 343125.00,
        farmerId: 2,
        farmerName: "Maria Garcia"
      },
      {
        cropId: "c6",
        cropName: "Cotton",
        totalSales: 7500,
        totalRevenue: 341250.00,
        farmerId: 3,
        farmerName: "Ahmed Khan"
      },
      {
        cropId: "c7",
        cropName: "Sugarcane",
        totalSales: 15000,
        totalRevenue: 191250.00,
        farmerId: 3,
        farmerName: "Ahmed Khan"
      }
    ];
    
    res.json(cropSales);
  } catch (error) {
    console.error("Error fetching crop sales:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 8. Find the total number of products offered by each vendor
router.get("/vendor-product-counts", ensureAdmin, async (_req: Request, res: Response) => {
  try {
    // This would be replaced with actual database query
    const vendorProducts = [
      {
        vendorId: "v1",
        vendorName: "AgriSeeds Co.",
        email: "contact@agriseeds.com",
        totalProducts: 15,
        avgRating: 4.8
      },
      {
        vendorId: "v2",
        vendorName: "EcoFarm Supplies",
        email: "info@ecofarm.com",
        totalProducts: 28,
        avgRating: 4.5
      },
      {
        vendorId: "v3",
        vendorName: "FarmTech Machinery",
        email: "sales@farmtech.com",
        totalProducts: 12,
        avgRating: 4.2
      },
      {
        vendorId: "v4",
        vendorName: "Green Thumb Garden",
        email: "support@greenthumb.com",
        totalProducts: 32,
        avgRating: 4.7
      },
      {
        vendorId: "v5",
        vendorName: "Harvest Solutions",
        email: "info@harvestsolutions.com",
        totalProducts: 21,
        avgRating: 3.9
      }
    ];
    
    res.json(vendorProducts);
  } catch (error) {
    console.error("Error fetching vendor product counts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 9. Find orders placed by farmers
router.get("/farmer-orders", ensureAdmin, async (_req: Request, res: Response) => {
  try {
    // This would be replaced with actual database query
    const farmerOrders = [
      {
        orderId: "fo1",
        farmerId: 1,
        farmerName: "John Smith",
        productId: "p1",
        productName: "Premium Wheat Seeds",
        quantity: 50,
        totalAmount: 2299.50,
        orderDate: "2025-03-15T10:30:00.000Z",
        status: "completed"
      },
      {
        orderId: "fo2",
        farmerId: 1,
        farmerName: "John Smith",
        productId: "p2",
        productName: "Organic Fertilizer",
        quantity: 25,
        totalAmount: 812.50,
        orderDate: "2025-04-02T14:45:00.000Z",
        status: "processing"
      },
      {
        orderId: "fo3",
        farmerId: 2,
        farmerName: "Maria Garcia",
        productId: "p3",
        productName: "Compact Tractor",
        quantity: 1,
        totalAmount: 12500.00,
        orderDate: "2025-02-20T09:15:00.000Z",
        status: "completed"
      },
      {
        orderId: "fo4",
        farmerId: 3,
        farmerName: "Ahmed Khan",
        productId: "p1",
        productName: "Premium Wheat Seeds",
        quantity: 75,
        totalAmount: 3449.25,
        orderDate: "2025-04-10T11:20:00.000Z",
        status: "processing"
      }
    ];
    
    res.json(farmerOrders);
  } catch (error) {
    console.error("Error fetching farmer orders:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 10. Get all disputes
router.get("/disputes", ensureAdmin, async (_req: Request, res: Response) => {
  try {
    // This would be replaced with actual database query
    const disputes = [
      {
        disputeId: 1,
        customerId: 101,
        customerName: "Emma Wilson",
        vendorId: "v1",
        vendorName: "AgriSeeds Co.",
        productId: "p1",
        productName: "Premium Wheat Seeds",
        status: "open",
        createdAt: "2025-04-05T14:30:00.000Z",
        description: "Seeds did not germinate properly"
      },
      {
        disputeId: 2,
        customerId: 103,
        customerName: "Sophia Chen",
        vendorId: "v2",
        vendorName: "EcoFarm Supplies",
        productId: "p2",
        productName: "Organic Fertilizer",
        status: "resolved",
        createdAt: "2025-04-01T09:15:00.000Z",
        description: "Package arrived damaged"
      },
      {
        disputeId: 3,
        customerId: 104,
        customerName: "Miguel Rodriguez",
        vendorId: "v3",
        vendorName: "FarmTech Machinery",
        productId: "p3",
        productName: "Compact Tractor",
        status: "pending",
        createdAt: "2025-04-08T16:45:00.000Z",
        description: "Tractor delivered with scratches and dents"
      },
      {
        disputeId: 4,
        customerId: 102,
        customerName: "James Brown",
        vendorId: "v4",
        vendorName: "Green Thumb Garden",
        productId: "p4",
        productName: "Garden Tools Set",
        status: "open",
        createdAt: "2025-04-11T10:20:00.000Z",
        description: "Missing items in the set"
      }
    ];
    
    res.json(disputes);
  } catch (error) {
    console.error("Error fetching disputes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 11. Get highly rated vendors
router.get("/highly-rated-vendors", ensureAdmin, async (_req: Request, res: Response) => {
  try {
    // This would be replaced with actual database query
    const vendors = [
      {
        vendorId: "v1",
        vendorName: "AgriSeeds Co.",
        email: "contact@agriseeds.com",
        rating: 4.8,
        totalReviews: 256,
        topProducts: ["Premium Wheat Seeds", "Organic Corn Seeds"]
      },
      {
        vendorId: "v4",
        vendorName: "Green Thumb Garden",
        email: "support@greenthumb.com",
        rating: 4.7,
        totalReviews: 189,
        topProducts: ["Herb Seed Collection", "Vegetable Starter Kit"]
      },
      {
        vendorId: "v2",
        vendorName: "EcoFarm Supplies",
        email: "info@ecofarm.com",
        rating: 4.5,
        totalReviews: 312,
        topProducts: ["Organic Fertilizer", "Sustainable Pest Control"]
      }
    ];
    
    res.json(vendors);
  } catch (error) {
    console.error("Error fetching highly rated vendors:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 12. Find orders by year
router.get("/orders-by-year/:year?", ensureAdmin, async (req: Request, res: Response) => {
  try {
    const year = req.params.year || "2025";
    
    // This would be replaced with actual database query
    const yearOrders = [
      {
        orderId: "o1",
        customerName: "Emma Wilson",
        orderDate: "2025-04-10T09:30:00.000Z",
        totalAmount: 1250.75,
        status: "completed",
        items: 5
      },
      {
        orderId: "o2",
        customerName: "James Brown",
        orderDate: "2025-04-08T14:15:00.000Z",
        totalAmount: 875.20,
        status: "processing",
        items: 3
      },
      {
        orderId: "o3",
        customerName: "Sophia Chen",
        orderDate: "2025-04-12T11:45:00.000Z",
        totalAmount: 2120.50,
        status: "completed",
        items: 8
      },
      {
        orderId: "o4",
        customerName: "Miguel Rodriguez",
        orderDate: "2025-04-05T16:20:00.000Z",
        totalAmount: 450.25,
        status: "processing",
        items: 2
      },
      {
        orderId: "o5",
        customerName: "Emma Wilson",
        orderDate: "2025-04-15T10:10:00.000Z",
        totalAmount: 755.00,
        status: "cancelled",
        items: 4
      },
      {
        orderId: "o6",
        customerName: "Ahmed Khan",
        orderDate: "2025-04-11T15:30:00.000Z",
        totalAmount: 1850.75,
        status: "completed",
        items: 6
      }
    ].filter(order => new Date(order.orderDate).getFullYear().toString() === year);
    
    res.json(yearOrders);
  } catch (error) {
    console.error(`Error fetching orders for year ${req.params.year}:`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 13. Find Farmers with Multiple Disputes
router.get("/farmers-with-multiple-disputes", ensureAdmin, async (_req: Request, res: Response) => {
  try {
    // This would be replaced with actual database query
    const farmerDisputes = [
      {
        farmerId: 1,
        farmerName: "John Smith",
        email: "john@agrobuizz.com",
        totalDisputes: 3,
        openDisputes: 1,
        resolvedDisputes: 2
      },
      {
        farmerId: 3,
        farmerName: "Ahmed Khan",
        email: "ahmed@agrobuizz.com",
        totalDisputes: 2,
        openDisputes: 0,
        resolvedDisputes: 2
      }
    ];
    
    res.json(farmerDisputes);
  } catch (error) {
    console.error("Error fetching farmers with multiple disputes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 14. Find Most Sold Items
router.get("/most-sold-items", ensureAdmin, async (_req: Request, res: Response) => {
  try {
    // This would be replaced with actual database query
    const topSellingItems = [
      {
        itemId: "p1",
        itemName: "Premium Wheat Seeds",
        category: "Seeds",
        totalSold: 1250,
        revenue: 57487.50,
        percentageOfSales: 25.3
      },
      {
        itemId: "p2",
        itemName: "Organic Fertilizer",
        category: "Fertilizer",
        totalSold: 980,
        revenue: 31850.00,
        percentageOfSales: 18.7
      },
      {
        itemId: "p5",
        itemName: "Drip Irrigation Kit",
        category: "Irrigation",
        totalSold: 850,
        revenue: 42500.00,
        percentageOfSales: 15.2
      },
      {
        itemId: "p8",
        itemName: "Pest Control Solution",
        category: "Pesticides",
        totalSold: 760,
        revenue: 22800.00,
        percentageOfSales: 13.5
      },
      {
        itemId: "p12",
        itemName: "Gardening Tools Set",
        category: "Tools",
        totalSold: 630,
        revenue: 37800.00,
        percentageOfSales: 10.8
      },
      {
        itemId: "p15",
        itemName: "Greenhouse Cover",
        category: "Structures",
        totalSold: 450,
        revenue: 33750.00,
        percentageOfSales: 8.2
      },
      {
        itemId: "p7",
        itemName: "Soil pH Tester",
        category: "Tools",
        totalSold: 380,
        revenue: 15200.00,
        percentageOfSales: 6.5
      },
      {
        itemId: "p22",
        itemName: "Weather Station",
        category: "Equipment",
        totalSold: 210,
        revenue: 41930.00,
        percentageOfSales: 4.8
      }
    ];
    
    if (_req.query.format === 'csv') {
      // Generate CSV output
      let csv = "Item ID,Item Name,Category,Total Sold,Revenue,Percentage of Sales\n";
      topSellingItems.forEach(item => {
        csv += `${item.itemId},${item.itemName},${item.category},${item.totalSold},${item.revenue.toFixed(2)},${item.percentageOfSales.toFixed(1)}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=most_sold_items.csv');
      return res.send(csv);
    }
    
    res.json(topSellingItems);
  } catch (error) {
    console.error("Error fetching most sold items:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 15. Execute Custom Query (For admin to run ad-hoc SQL queries)
router.post("/execute-query", ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }
    
    // Validate the query to prevent dangerous operations
    const lowerQuery = query.toLowerCase();
    if (
      lowerQuery.includes("drop") || 
      lowerQuery.includes("truncate") || 
      lowerQuery.includes("delete") || 
      lowerQuery.includes("update") ||
      lowerQuery.includes("alter")
    ) {
      return res.status(400).json({ 
        success: false, 
        message: "For safety reasons, only SELECT queries are allowed" 
      });
    }
    
    // Execute the query against the database
    const result = await executeRawQuery(query);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error("Error executing custom query:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error executing query", 
      error: error.message 
    });
  }
});

export default router;