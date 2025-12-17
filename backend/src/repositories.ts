import { GameServer, User } from "./models";
import crypto from "crypto";
import { pool } from "./db";

export interface UserRepository {
  createUser(email: string, passwordHash: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export interface GameServerRepository {
  create(server: Omit<GameServer, "id" | "createdAt">): Promise<GameServer>;
  listByUser(userId: string): Promise<GameServer[]>;
  updateStatus(
    id: string,
    status: GameServer["status"]
  ): Promise<GameServer | null>;
}

class PostgresUserRepository implements UserRepository {
  async createUser(email: string, passwordHash: string): Promise<User> {
    const id = crypto.randomUUID();
    const result = await pool.query(
      `insert into users (id, email, password_hash) values ($1, $2, $3)
       returning id, email, password_hash, created_at`,
      [id, email, passwordHash]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `select id, email, password_hash, created_at from users where email = $1`,
      [email]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    };
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      `select id, email, password_hash, created_at from users where id = $1`,
      [id]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    };
  }
}

class PostgresGameServerRepository implements GameServerRepository {
  async create(
    server: Omit<GameServer, "id" | "createdAt">
  ): Promise<GameServer> {
    const id = crypto.randomUUID();
    const result = await pool.query(
      `insert into game_servers
       (id, user_id, pterodactyl_user_id, pterodactyl_server_id, name, game, ram_mb, disk_mb, cpu_limit, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       returning id, user_id, pterodactyl_user_id, pterodactyl_server_id, name, game,
                 ram_mb, disk_mb, cpu_limit, status, created_at`,
      [
        id,
        server.userId,
        server.pterodactylUserId,
        server.pterodactylServerId,
        server.name,
        server.game,
        server.ramMb,
        server.diskMb,
        server.cpuLimit,
        server.status,
      ]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      pterodactylUserId: row.pterodactyl_user_id,
      pterodactylServerId: row.pterodactyl_server_id,
      name: row.name,
      game: row.game,
      ramMb: row.ram_mb,
      diskMb: row.disk_mb,
      cpuLimit: row.cpu_limit,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  async listByUser(userId: string): Promise<GameServer[]> {
    const result = await pool.query(
      `select id, user_id, pterodactyl_user_id, pterodactyl_server_id, name, game,
              ram_mb, disk_mb, cpu_limit, status, created_at
       from game_servers
       where user_id = $1
       order by created_at desc`,
      [userId]
    );
    return result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      pterodactylUserId: row.pterodactyl_user_id,
      pterodactylServerId: row.pterodactyl_server_id,
      name: row.name,
      game: row.game,
      ramMb: row.ram_mb,
      diskMb: row.disk_mb,
      cpuLimit: row.cpu_limit,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  async updateStatus(
    id: string,
    status: GameServer["status"]
  ): Promise<GameServer | null> {
    const result = await pool.query(
      `update game_servers set status = $2 where id = $1
       returning id, user_id, pterodactyl_user_id, pterodactyl_server_id, name, game,
                 ram_mb, disk_mb, cpu_limit, status, created_at`,
      [id, status]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      pterodactylUserId: row.pterodactyl_user_id,
      pterodactylServerId: row.pterodactyl_server_id,
      name: row.name,
      game: row.game,
      ramMb: row.ram_mb,
      diskMb: row.disk_mb,
      cpuLimit: row.cpu_limit,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}

export const userRepository: UserRepository = new PostgresUserRepository();
export const gameServerRepository: GameServerRepository =
  new PostgresGameServerRepository();


