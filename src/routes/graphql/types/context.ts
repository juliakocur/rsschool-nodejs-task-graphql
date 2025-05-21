import { PrismaClient } from '@prisma/client';

export type ContextValue = {
    prisma: PrismaClient
};
