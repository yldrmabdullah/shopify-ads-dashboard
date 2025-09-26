import { PrismaClient } from "@prisma/client";

let prisma;
try {
  // Reuse prisma in dev and guard for failed initialization
  if (process.env.NODE_ENV !== "production") {
    if (!global.prismaGlobal) {
      global.prismaGlobal = new PrismaClient();
    }
    prisma = global.prismaGlobal;
  } else {
    prisma = new PrismaClient();
  }
} catch (error) {
  prisma = undefined;
}

export default prisma;
