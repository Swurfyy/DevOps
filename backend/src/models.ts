export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface GameServer {
  id: string;
  userId: string;
  pterodactylUserId: number;
  pterodactylServerId: number;
  name: string;
  game: string;
  ramMb: number;
  diskMb: number;
  cpuLimit: number;
  status: "provisioning" | "active" | "error";
  createdAt: Date;
}


