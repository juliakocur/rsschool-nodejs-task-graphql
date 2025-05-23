import DataLoader from 'dataloader';
import {
    Profile,
    Post,
    MemberType,
    User
} from './types/types.js';
import { ContextValue } from './types/context.js';

export const createAuthorsLoader = (context: ContextValue) => {
  return new DataLoader<string, User[]>(async (subscriberIds: readonly string[]): Promise<User[][]> => {
    const subscriptions = await context.prisma.subscribersOnAuthors.findMany({
      where: { subscriberId: { in: subscriberIds as string[] } },
      include: { author: true },
    });

    const subscriptionMap = new Map<string, User[]>();
    subscriptions.forEach((sub) => {
      const authors = subscriptionMap.get(sub.subscriberId) || [];
      authors.push(sub.author);
      subscriptionMap.set(sub.subscriberId, authors);
    });

    return subscriberIds.map((id) => subscriptionMap.get(id) || []);
  });
};

export const createMemberTypeLoader = (context: ContextValue) => {
    return new DataLoader<string, MemberType | null>(async (memberTypeIds) => {
      const memberTypes = await context.prisma.memberType.findMany({
        where: { id: { in: memberTypeIds as string[] } },
      });
  
      const memberTypeMap = new Map<string, MemberType>();
      memberTypes.forEach((mt) => memberTypeMap.set(mt.id, mt));
  
      return memberTypeIds.map((id) => memberTypeMap.get(id) || null);
    });
};

export const createProfileLoader = (context: ContextValue) => {
  return new DataLoader<string, Profile | null>(async (userIds) => {
    const profiles = await context.prisma.profile.findMany({
      where: { userId: { in: userIds as string[] } },
    });

    const profileMap = new Map<string, Profile>();
    profiles.forEach((profile) => {
      profileMap.set(profile.userId, {
        id: profile.id,
        userId: profile.userId,
        memberTypeId: profile.memberTypeId,
        isMale: profile.isMale ?? false,             
        yearOfBirth: profile.yearOfBirth ?? 0,     
      });
    });

    return userIds.map((id) => profileMap.get(id) || null);
  });
};

export const createPostsLoader = (context: ContextValue) => {
  return new DataLoader<string, Post[]>(async (authorIds) => {
    const posts = await context.prisma.post.findMany({
      where: { authorId: { in: authorIds as string[] } },
    });

    const postMap = new Map<string, Post[]>();
    authorIds.forEach((id) => postMap.set(id, []));
    posts.forEach((post) => {
      const current = postMap.get(post.authorId) || [];
      current.push(post);
      postMap.set(post.authorId, current);
    });

    return authorIds.map((id) => postMap.get(id)!);
  });
};


export const createSubscribersLoader = (context: ContextValue) => {
  return new DataLoader<string, User[]>(async (authorIds) => {
    const subscriptions = await context.prisma.subscribersOnAuthors.findMany({
      where: { authorId: { in: authorIds as string[] } },
      include: { subscriber: true },
    });

    const subscriberMap = new Map<string, User[]>();
    authorIds.forEach((id) => subscriberMap.set(id, []));
    subscriptions.forEach((sub) => {
      const current = subscriberMap.get(sub.authorId) || [];
      current.push(sub.subscriber);
      subscriberMap.set(sub.authorId, current);
    });

    return authorIds.map((id) => subscriberMap.get(id)!);
  });
};
