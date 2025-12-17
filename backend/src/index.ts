import express from "express";
import cors from "cors";
import { config } from "./config";
import {
  orderServer,
  orderServerSchema,
  registerUser,
  listServersForUser,
  loginUser,
} from "./serverService";
import { initDb } from "./db";
import { generateToken, requireAuth, AuthenticatedRequest } from "./auth";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: config.env });
});

app.get("/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  return res.json({ user: req.user });
});

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const user = await registerUser(email, password);
    const token = generateToken({ userId: user.id, email: user.email });
    return res.status(201).json({ 
      user: { id: user.id, email: user.email },
      token 
    });
  } catch (err: any) {
    if (err.message === "User already exists") {
      return res.status(409).json({ error: err.message });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const user = await loginUser(email, password);
    const token = generateToken({ userId: user.id, email: user.email });
    return res.status(200).json({ 
      user: { id: user.id, email: user.email },
      token 
    });
  } catch (err: any) {
    if (err.message === "Invalid credentials") {
      return res.status(401).json({ error: err.message });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/servers/order", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parseResult = orderServerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parseResult.error.flatten() });
  }

  try {
    const result = await orderServer(parseResult.data, req.user!.userId);
    return res.status(201).json({
      user: { id: result.user.id, email: result.user.email },
      server: result.server,
      pterodactylServer: result.pterodactylServer,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err.response?.data ?? err);
    return res.status(500).json({ error: err.message || "Failed to provision server" });
  }
});

app.get("/servers", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const servers = await listServersForUser(req.user!.email);
    return res.json({ servers });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch servers" });
  }
});

// Test database connection before starting server
async function startServer() {
  try {
    // Test database connection
    await pool.query("SELECT 1");
    // eslint-disable-next-line no-console
    console.log("✓ Database connection successful");
    
    // Initialize database schema
    await initDb();
    // eslint-disable-next-line no-console
    console.log("✓ Database schema initialized");
    
    // Start server
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`✓ Backend listening on port ${config.port}`);
      // eslint-disable-next-line no-console
      console.log(`✓ Environment: ${config.env}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("✗ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
