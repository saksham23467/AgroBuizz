import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite.js";
import routes from "./routes.js";
import { setupAuth } from "./auth.js"; // ✅ import auth setup
import cors from "cors";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true, // allow cookies/sessions
  })
);

app.use(express.json());

// ✅ Setup authentication before other routes
setupAuth(app);

// ✅ Then register custom API routes
app.use("/api", routes);

if (app.get("env") === "development") {
  setupVite(app, server);
} else {
  serveStatic(app);
}

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
