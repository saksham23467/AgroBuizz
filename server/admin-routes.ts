import { Request, Response, Router } from "express";
import { executeRawQuery, commonQueries } from "./db";

const router = Router();

// Middleware to ensure admin access
const ensureAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
    });
  }
  next();
};

// Apply admin middleware to all routes in this file
router.use(ensureAdmin);

// 1. Retrieve all farmers along with crops they grow
router.get("/farmers-with-crops", async (_req: Request, res: Response) => {
  try {
    const result = await executeRawQuery(commonQueries.getAllFarmersWithCrops);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching farmers with crops:", error);
    res.status(500).json({ success: false, message: "Failed to fetch farmers with crops" });
  }
});

// 3. Get customers who have placed at least 3 orders
router.get("/customers-with-multiple-orders", async (_req: Request, res: Response) => {
  try {
    const result = await executeRawQuery(commonQueries.getCustomersWithMultipleOrders);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching customers with multiple orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch customers with multiple orders" });
  }
});

// 4. View Products by Type
router.get("/products-by-type/:type", async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const result = await executeRawQuery(commonQueries.getProductsByType(type));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching products by type:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products by type" });
  }
});

// 5. View Products by Price Range
router.get("/products-by-price-range", async (req: Request, res: Response) => {
  try {
    const min = Number(req.query.min) || 0;
    const max = Number(req.query.max) || 1000;
    const result = await executeRawQuery(commonQueries.getProductsByPriceRange(min, max));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching products by price range:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products by price range" });
  }
});

// 6. View Available Products (Stock > 0)
router.get("/available-products", async (_req: Request, res: Response) => {
  try {
    const result = await executeRawQuery(commonQueries.getAvailableProducts);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching available products:", error);
    res.status(500).json({ success: false, message: "Failed to fetch available products" });
  }
});

// 7. View Products by Vendor Ratings
router.get("/products-by-vendor-ratings", async (req: Request, res: Response) => {
  try {
    const minRating = Number(req.query.minRating) || 4;
    const result = await executeRawQuery(commonQueries.getProductsByVendorRatings(minRating));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching products by vendor ratings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products by vendor ratings" });
  }
});

// 8. List crops for sale with specifications
router.get("/crops-for-sale", async (_req: Request, res: Response) => {
  try {
    const result = await executeRawQuery(commonQueries.getCropsForSale);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching crops for sale:", error);
    res.status(500).json({ success: false, message: "Failed to fetch crops for sale" });
  }
});

// 9. Find the total number of products offered by each vendor
router.get("/vendor-product-counts", async (_req: Request, res: Response) => {
  try {
    const result = await executeRawQuery(commonQueries.getVendorProductCounts);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching vendor product counts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch vendor product counts" });
  }
});

// 10. Query to Track Orders Placed by Farmers
router.get("/farmer-orders", async (_req: Request, res: Response) => {
  try {
    const result = await executeRawQuery(commonQueries.getFarmerOrders);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching farmer orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch farmer orders" });
  }
});

// 11. Query to track Disputes
router.get("/disputes", async (_req: Request, res: Response) => {
  try {
    const result = await executeRawQuery(commonQueries.getDisputes);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching disputes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch disputes" });
  }
});

// 12. Get vendors with Excellent and good in their comments
router.get("/highly-rated-vendors", async (_req: Request, res: Response) => {
  try {
    const result = await executeRawQuery(commonQueries.getHighlyRatedVendors);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching highly rated vendors:", error);
    res.status(500).json({ success: false, message: "Failed to fetch highly rated vendors" });
  }
});

// 13. Find the orders placed in year 2025
router.get("/orders-by-year/:year?", async (req: Request, res: Response) => {
  try {
    const year = Number(req.params.year) || 2025;
    const result = await executeRawQuery(commonQueries.getOrdersFromYear(year));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching orders by year:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders by year" });
  }
});

// 14. Query to find sales of each crop
router.get("/crop-sales", async (_req: Request, res: Response) => {
  try {
    const result = await executeRawQuery(commonQueries.getCropSales);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching crop sales:", error);
    res.status(500).json({ success: false, message: "Failed to fetch crop sales" });
  }
});

// 15. Query to find a farmer who is in dispute with both customer and vendor
router.get("/farmers-with-multiple-disputes", async (_req: Request, res: Response) => {
  try {
    const result = await executeRawQuery(commonQueries.getFarmersWithMultipleDisputes);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching farmers with multiple disputes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch farmers with multiple disputes" });
  }
});

// 16. Generate admin analytics report for most sold items
router.get("/most-sold-items", async (_req: Request, res: Response) => {
  try {
    const result = await executeRawQuery(commonQueries.getMostSoldItems);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching most sold items:", error);
    res.status(500).json({ success: false, message: "Failed to fetch most sold items" });
  }
});

// General API to execute any custom SQL query (admin only)
router.post("/execute-query", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: "SQL query is required" 
      });
    }
    
    // Check if query is a SELECT statement (prevent data modification)
    if (!query.trim().toLowerCase().startsWith('select')) {
      return res.status(403).json({ 
        success: false, 
        message: "Only SELECT queries are allowed for security reasons" 
      });
    }
    
    const result = await executeRawQuery(query);
    res.json({ success: true, data: result });
  } catch (err) {
    const error = err as Error;
    console.error("Error executing custom query:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to execute custom query",
      error: error.message || "Unknown error"
    });
  }
});

export default router;