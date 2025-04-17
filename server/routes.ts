import express from "express";
import { db, users, crops } from "./storage.js";
import { eq } from "drizzle-orm";

const router = express.Router();

// USER ROUTES
router.get("/users", async (_req, res) => {
  const result = await db.select().from(users);
  res.json(result);
});

router.post("/users", async (req, res) => {
  const newUser = await db.insert(users).values(req.body).returning();
  res.status(201).json(newUser);
});

// CROPS ROUTES
router.get("/crops", async (_req, res) => {
  const result = await db.select().from(crops);
  res.json(result);
});

router.post("/crops", async (req, res) => {
  const newCrop = await db.insert(crops).values(req.body).returning();
  res.status(201).json(newCrop);
});

export default router;