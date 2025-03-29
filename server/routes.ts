import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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
  return httpServer;
}
