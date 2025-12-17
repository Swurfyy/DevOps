import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  env: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  pterodactyl: {
    baseUrl: string;
    apiKey: string;
    defaultEggId: number;
    defaultNestId: number;
    defaultLocationId: number;
    defaultAllocationId: number;
  };
}

const numberFromEnv = (key: string, fallback: number): number => {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
};

export const config: AppConfig = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.BACKEND_PORT || process.env.PORT || 4000),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://devops_hosting:devops_hosting@db:5432/devops_hosting",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  pterodactyl: {
    baseUrl: process.env.PTERO_BASE_URL || "http://localhost",
    apiKey: process.env.PTERO_API_KEY || "",
    defaultEggId: numberFromEnv("PTERO_DEFAULT_EGG_ID", 1),
    defaultNestId: numberFromEnv("PTERO_DEFAULT_NEST_ID", 1),
    defaultLocationId: numberFromEnv("PTERO_DEFAULT_LOCATION_ID", 1),
    defaultAllocationId: numberFromEnv("PTERO_DEFAULT_ALLOCATION_ID", 1),
  },
};

if (!config.pterodactyl.apiKey) {
  // In a real deployment you probably want to fail fast here.
  // eslint-disable-next-line no-console
  console.warn(
    "[config] PTERO_API_KEY is not set. Pterodactyl integration will fail until this is configured."
  );
}


