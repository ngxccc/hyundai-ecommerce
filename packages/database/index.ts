// import { PrismaClient } from '@prisma/client';

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// // Nếu đã có instance thì xài lại, chưa có thì tạo mới
// export const prisma = globalForPrisma.prisma || new PrismaClient();

// // Trong môi trường dev, lưu instance vào global scope
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// export * from "@prisma/client";
