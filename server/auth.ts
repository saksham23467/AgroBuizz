import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { db, users } from "./storage.js";
import { eq } from "drizzle-orm";
import { User } from "../shared/schema.js";
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
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: (u, { eq, and }) =>
            and(eq(u.username, username), eq(u.password, password)),
        });

        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        await db
          .update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.id, user.id));

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db.query.users.findFirst({ where: eq(users.id, id) });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res) => {
    console.log("📩 Received register request body:", req.body);
    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, req.body.username),
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Username already exists" });
      }

      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, req.body.email),
      });
      if (existingEmail) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }

      const [user] = await db.insert(users).values(req.body).returning();

      req.login(user, (err) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "Login error after registration",
          });
        return res.status(201).json({ success: true, user });
      });
    } catch (error) {
      console.error("❌ Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration error",
        error: error?.message || error,
      });
    }
  });

  // app.post("/api/register", async (req, res) => {
  //   try {
  //     const [user] = await db
  //       .insert(users)
  //       .values({
  //         username: "testuser123",
  //         email: "testuser123@example.com",
  //         password: "securepass",
  //         userType: "farmer", // ✅ Must match the enum exactly
  //         role: "user", // optional (default is 'user')
  //       })
  //       .returning();

  //     console.log("✅ Hardcoded user inserted:", user);

  //     req.login(user, (err) => {
  //       if (err) {
  //         console.log("⚠️ Login error after registration:", err);
  //         return res.status(500).json({
  //           success: false,
  //           message: "Login error after registration",
  //         });
  //       }
  //       return res.status(201).json({ success: true, user });
  //     });
  //   } catch (error) {
  //     console.error(
  //       "❌ Registration error (hardcoded):",
  //       error?.message || error
  //     );
  //     res
  //       .status(500)
  //       .json({ success: false, message: "Registration error (hardcoded)" });
  //   }
  // });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ success: true, user: req.user });
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Logout error" });
      res.json({ success: true, message: "Logged out" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated())
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    res.json({ success: true, user: req.user });
  });
}
