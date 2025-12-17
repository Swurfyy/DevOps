import { Pool } from "pg";
import { config } from "./config";

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

export async function initDb() {
  await pool.query(`
    create table if not exists users (
      id uuid primary key,
      email text not null unique,
      password_hash text not null,
      created_at timestamptz not null default now()
    );
  `);

  await pool.query(`
    create table if not exists game_servers (
      id uuid primary key,
      user_id uuid not null references users(id) on delete cascade,
      pterodactyl_user_id integer not null,
      pterodactyl_server_id integer not null,
      name text not null,
      game text not null,
      ram_mb integer not null,
      disk_mb integer not null,
      cpu_limit integer not null,
      status text not null,
      created_at timestamptz not null default now()
    );
  `);
}


