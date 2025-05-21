import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLEnumType,
  GraphQLNonNull,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { ContextValue } from './types/context.js';
import {
  ICreateUserArgs,
  IUpdateUserArgs,
  IDeleteUserArgs,
  IUpdatePostArgs,
  IUpdateProfileArgs,
  ICreatePostArgs,
  ICreateProfileArgs,
} from './types/types.js';

const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

const MemberType = new GraphQLObjectType<unknown, ContextValue>({
  name: 'MemberType',
  fields: () => ({
    id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const Post = new GraphQLObjectType<unknown, ContextValue>({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }),
});


type ProfileTypeSource = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: string;
};
export const Profile = new GraphQLObjectType<ProfileTypeSource, ContextValue>({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (parent, _args, context) => {
        return context.prisma.memberType.findUnique({
          where: { id: parent.memberTypeId },
        });
      },
    },
  }),
});


const User: GraphQLObjectType<{id: string}, ContextValue> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: { type: Profile,
      resolve: (parent: { id: string }, _args, context) => {
        return context.prisma.profile.findUnique({
          where: {
            userId: parent.id,
          },
        });
      },
     },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async (parent, _args, context) => {
        return context.prisma.post.findMany({
          where: { authorId: (parent as { id: string }).id },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (parent, _args, context) => {
        return context.prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: (parent as { id: string }).id,
              },
            },
          },
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (parent, _args, context) => {
        return context.prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: (parent as { id: string }).id,
              },
            },
          },
        });
      },
    },    
  }),
});

const RootQueryType = new GraphQLObjectType<unknown, ContextValue>({
  name: 'RootQueryType',
  fields: {
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (_parent, _args, context) => {
        return context.prisma.user.findMany();
      },
    },
    user: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { id: string }, context) => {
        return context.prisma.user.findUnique({
          where: { id: args.id },
        });
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async (_parent, _args, context) => {
        return context.prisma.post.findMany();
      },
    },
    post: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { id: string }, context) => {
        return context.prisma.post.findUnique({
          where: { id: args.id },
        });
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
      resolve: async (_parent, _args, context) => {
        return context.prisma.profile.findMany();
      },
    },
    profile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { id: string }, context) => {
        return context.prisma.profile.findUnique({
          where: { id: args.id },
        });
      },
    },
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: async (_parent, _args, context) => {
        return context.prisma.memberType.findMany();
      },
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      },
      resolve: async (_parent, args: { id: 'BASIC' | 'BUSINESS' }, context) => {
        return context.prisma.memberType.findUnique({
          where: { id: args.id },
        });
      },
    },
  },
});

const RootMutationType = new GraphQLObjectType<unknown, ContextValue>({
  name: 'RootMutationType',
  fields: {
    createUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
      },
      resolve: async (_parent, args: ICreateUserArgs, context) => {
        return context.prisma.user.create({
          data: {
            id: args.id,
            name: args.name,
            balance: args.balance,
          },
        });
      },
    },

    updateUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
      },
      resolve: async (_parent, args: IUpdateUserArgs, context) => {
        return context.prisma.user.update({
          where: { id: args.id },
          data: {
            name: args.name ?? undefined,
            balance: args.balance ?? undefined,
          },
        });
      },
    },
    
    deleteUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: IDeleteUserArgs, context) => {
        return context.prisma.user.delete({
          where: { id: args.id },
        });
      },
    },
    updatePost: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
      },
      resolve: async (_parent, args: IUpdatePostArgs, context) => {
        return context.prisma.post.update({
          where: { id: args.id },
          data: {
            title: args.title ?? undefined,
            content: args.content ?? undefined,
          },
        });
      },
    },
    
    deletePost: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { id: string }, context) => {
        return context.prisma.post.delete({
          where: { id: args.id },
        });
      },
    },

    updateProfile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
        memberTypeId: { type: MemberTypeIdEnum },
      },
      resolve: async (_parent, args: IUpdateProfileArgs, context) => {
        return context.prisma.profile.update({
          where: { id: args.id },
          data: {
            isMale: args.isMale ?? undefined,
            yearOfBirth: args.yearOfBirth ?? undefined,
            memberTypeId: args.memberTypeId ?? undefined,
          },
        });
      },
    },
    
    deleteProfile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { id: string }, context) => {
        return context.prisma.profile.delete({
          where: { id: args.id },
        });
      },
    },

    createPost: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: ICreatePostArgs, context) => {
        return context.prisma.post.create({
          data: {
            id: args.id,
            title: args.title,
            content: args.content,
            authorId: args.authorId,
          },
        });
      },
    },
    
    createProfile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
        memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
        userId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: ICreateProfileArgs, context) => {
        return context.prisma.profile.create({
          data: {
            id: args.id,
            isMale: args.isMale,
            yearOfBirth: args.yearOfBirth,
            memberTypeId: args.memberTypeId,
            userId: args.userId,
          },
        });
      },
    },

    subscribeUser: {
      type: User,
      args: {
        subscriberId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { subscriberId: string; authorId: string }, context) => {
        await context.prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: args.subscriberId,
            authorId: args.authorId,
          },
        });
    
        return context.prisma.user.findUnique({
          where: { id: args.subscriberId },
        });
      },
    },

    unsubscribeUser: {
      type: User,
      args: {
        subscriberId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { subscriberId: string; authorId: string }, context) => {
        await context.prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: args.subscriberId,
              authorId: args.authorId,
            },
          },
        });
    
        return context.prisma.user.findUnique({
          where: { id: args.subscriberId },
        });
      },
    },
    
  },
});

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});
