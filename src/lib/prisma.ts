import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const prismaClientSingleton = () => {
  // neon-adapter setup
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter, log: ["error", "warn"] });
};

// Next.js Hot Reloading trick: Save the Prisma instance to a global variable

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// If the global variable exists, use it. Otherwise, create a new instance.
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// In development, attach the instance to the global object so it survives reloads

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
