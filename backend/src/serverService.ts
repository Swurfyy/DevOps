import { z } from "zod";
import { gameServerRepository, userRepository } from "./repositories";
import { pterodactylService } from "./pterodactylService";

export const orderServerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(3),
  game: z.string().min(2),
  ramMb: z.number().int().min(512),
  diskMb: z.number().int().min(1024),
  cpuLimit: z.number().int().min(10),
});

export type OrderServerInput = z.infer<typeof orderServerSchema>;

export async function registerUser(email: string, password: string) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new Error("User already exists");
  }
  // For demo purposes we don't hash passwords heavily; do not use this in production
  const passwordHash = `plain:${password}`;
  const user = await userRepository.createUser(email, passwordHash);
  return user;
}

export async function orderServer(input: OrderServerInput) {
  let user = await userRepository.findByEmail(input.email);
  if (!user) {
    user = await registerUser(input.email, input.password);
  }

  const pteroUser = await pterodactylService.ensureUserForExternalId({
    externalId: user.id,
    email: user.email,
  });

  const pteroServer = await pterodactylService.createServer({
    name: input.name,
    userId: pteroUser.id,
    description: `${input.game} server for ${input.email}`,
    ramMb: input.ramMb,
    diskMb: input.diskMb,
    cpuLimit: input.cpuLimit,
  });

  const localServer = await gameServerRepository.create({
    userId: user.id,
    pterodactylUserId: pteroUser.id,
    pterodactylServerId: pteroServer.id,
    name: input.name,
    game: input.game,
    ramMb: input.ramMb,
    diskMb: input.diskMb,
    cpuLimit: input.cpuLimit,
    status: "provisioning",
  });

  return {
    user,
    server: localServer,
    pterodactylServer: pteroServer,
  };
}

export async function listServersForUser(email: string) {
  const user = await userRepository.findByEmail(email);
  if (!user) return [];
  return gameServerRepository.listByUser(user.id);
}


