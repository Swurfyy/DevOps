import axios from "axios";
import { config } from "./config";

export interface PteroUser {
  id: number;
  email: string;
  username: string;
  external_id?: string;
}

export interface PteroServer {
  id: number;
  identifier: string;
}

export interface CreateServerRequest {
  name: string;
  userId: number;
  description?: string;
  ramMb: number;
  diskMb: number;
  cpuLimit: number;
}

export class PterodactylApplicationService {
  private client = axios.create({
    baseURL: `${config.pterodactyl.baseUrl}/api/application`,
    headers: {
      Authorization: `Bearer ${config.pterodactyl.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  async findUserByExternalId(externalId: string): Promise<PteroUser | null> {
    const res = await this.client.get("/users", {
      params: { "filter[external_id]": externalId },
    });
    const user = res.data.data?.[0];
    if (!user) return null;
    return {
      id: user.attributes.id,
      email: user.attributes.email,
      username: user.attributes.username,
      external_id: user.attributes.external_id,
    };
  }

  async createUser(params: {
    email: string;
    username: string;
    externalId: string;
  }): Promise<PteroUser> {
    const res = await this.client.post("/users", {
      email: params.email,
      username: params.username,
      first_name: "Hosting",
      last_name: "User",
      external_id: params.externalId,
    });

    const u = res.data.attributes;
    return {
      id: u.id,
      email: u.email,
      username: u.username,
      external_id: u.external_id,
    };
  }

  async ensureUserForExternalId(options: {
    externalId: string;
    email: string;
  }): Promise<PteroUser> {
    const existing = await this.findUserByExternalId(options.externalId);
    if (existing) return existing;
    const username = options.email.split("@")[0];
    return this.createUser({
      email: options.email,
      username,
      externalId: options.externalId,
    });
  }

  async createServer(req: CreateServerRequest): Promise<PteroServer> {
    const res = await this.client.post("/servers", {
      name: req.name,
      description: req.description ?? "",
      user: req.userId,
      egg: config.pterodactyl.defaultEggId,
      nest: config.pterodactyl.defaultNestId,
      limits: {
        memory: req.ramMb,
        disk: req.diskMb,
        cpu: req.cpuLimit,
        swap: 0,
        io: 500,
      },
      feature_limits: {
        databases: 0,
        allocations: 1,
        backups: 3,
      },
      allocation: {
        default: config.pterodactyl.defaultAllocationId,
      },
      deploy: {
        locations: [config.pterodactyl.defaultLocationId],
        dedicated_ip: false,
        port_range: [],
      },
      start_on_completion: true,
      skip_scripts: false,
    });

    const s = res.data.attributes;
    return {
      id: s.id,
      identifier: s.identifier,
    };
  }
}

export const pterodactylService = new PterodactylApplicationService();


