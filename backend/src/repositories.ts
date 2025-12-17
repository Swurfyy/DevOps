import { GameServer, User } from "./models";
import crypto from "crypto";

// NOTE: For a real deployment you would use a database (PostgreSQL, MySQL, ...).
// This in-memory implementation keeps the code simple but the architecture
// (repository pattern) is realistic and easy to swap to a DB-backed version.

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

class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async createUser(email: string, passwordHash: string): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }
}

class InMemoryGameServerRepository implements GameServerRepository {
  private servers: GameServer[] = [];

  async create(
    server: Omit<GameServer, "id" | "createdAt">
  ): Promise<GameServer> {
    const created: GameServer = {
      ...server,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.servers.push(created);
    return created;
  }

  async listByUser(userId: string): Promise<GameServer[]> {
    return this.servers.filter((s) => s.userId === userId);
  }

  async updateStatus(
    id: string,
    status: GameServer["status"]
  ): Promise<GameServer | null> {
    const server = this.servers.find((s) => s.id === id);
    if (!server) return null;
    server.status = status;
    return server;
  }
}

export const userRepository: UserRepository = new InMemoryUserRepository();
export const gameServerRepository: GameServerRepository =
  new InMemoryGameServerRepository();


