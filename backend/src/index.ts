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

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: config.env });
});

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const user = await registerUser(email, password);
    return res.status(201).json({ id: user.id, email: user.email });
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
    return res.status(200).json({ id: user.id, email: user.email });
  } catch (err: any) {
    if (err.message === "Invalid credentials") {
      return res.status(401).json({ error: err.message });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/servers/order", async (req, res) => {
  const parseResult = orderServerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parseResult.error.flatten() });
  }

  try {
    const result = await orderServer(parseResult.data);
    return res.status(201).json({
      user: { id: result.user.id, email: result.user.email },
      server: result.server,
      pterodactylServer: result.pterodactylServer,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err.response?.data ?? err);
    return res.status(500).json({ error: "Failed to provision server" });
  }
});

app.get("/servers", async (req, res) => {
  const email = req.query.email;
  if (typeof email !== "string") {
    return res
      .status(400)
      .json({ error: "email query parameter is required" });
  }
  try {
    const servers = await listServersForUser(email);
    return res.json({ servers });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch servers" });
  }
});

initDb()
  .then(() => {
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend listening on port ${config.port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to initialise database", err);
    process.exit(1);
  });
