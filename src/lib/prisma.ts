import { PrismaClient } from "../generated/prisma/client";

const prismaClientSingleton = () => {
  // @ts-ignore - Suppressing TS ghost error caused by custom generated output folder
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
