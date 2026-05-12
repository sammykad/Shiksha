import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

export const basePrisma = globalForPrisma.prisma || new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'],
    adapter,
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;

export default basePrisma;
