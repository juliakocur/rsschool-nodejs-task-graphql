import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { Profile, Post, MemberType } from '@prisma/client';

export interface ContextValue {
    prisma: PrismaClient;
    loaders: {
        profile: DataLoader<string, Profile | null>;
        posts: DataLoader<string, Post[]>;
        subscribers: DataLoader<string, {id: string, name: string; balance: number}[]>
        memberType: DataLoader<string, MemberType | null>;
        authors: DataLoader<string, {id: string; name: string; balance: number}[], string>
    };
};
