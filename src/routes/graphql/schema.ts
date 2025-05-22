import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
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
  ICreatePostArgs,
  ICreateProfileArgs,
  ProfileTypeSource
} from './types/types.js';
import { randomUUID } from 'crypto';

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


const Profile = new GraphQLObjectType<ProfileTypeSource, ContextValue>({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberType: {
      type: MemberType,
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
        try {
          return context.prisma.user.findMany({
            where: {
              userSubscribedTo: {
                some: {
                  authorId: (parent as { id: string }).id,
                }
              }
            }
          });
        } catch (error) {
          console.error(error);
          return [];
        }
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
        try {
          return context.prisma.user.findUnique({
            where: { id: args.id },
          });
        } catch (error) {
          return null;
        }
      },
    },
    posts: {
      type: new GraphQLList(Post),
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
      type: new GraphQLList(Profile),
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
      type: new GraphQLList(MemberType),
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

const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    authorId: { type: UUIDType },
    content: { type: GraphQLString },
    title: { type: GraphQLString },
  },
});

const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
  },
});

const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
  },
});

const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeIdEnum },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  },
});

const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
  },
});


const RootMutationType = new GraphQLObjectType<unknown, ContextValue>({
  name: 'Mutation',
  fields: {
    createUser: {
      type: User,
      args: {
        dto: {
          type: new GraphQLNonNull(CreateUserInput)
        },
      },
      resolve: async (_parent, {dto}: {dto: { name:string; balance: number }}, context) => {
        return context.prisma.user.create({
          data: {
            name: dto.name,
            balance: dto.balance,
          },
        });
      },
    },

    changeUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (_parent, args: {id:string; dto:{name?:string; balance?: number}}, context) => {
        return context.prisma.user.update({
          where: { id: args.id },
          data: {
            name: args.dto.name ?? undefined,
            balance: args.dto.balance ?? undefined,
          },
        });
      },
    },
    
    deleteUser: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: {id: string}, context) => {
        await context.prisma.user.delete({
          where: { id: args.id },
        });
        return args.id;
      },
    },
    changePost: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (_parent, args: {id: string;dto: { title?:string; content?: string}}, context) => {
        return context.prisma.post.update({
          where: { id: args.id },
          data: {
            title: args.dto.title ?? undefined,
            content: args.dto.content ?? undefined,
          },
        });
      },
    },
    
    deletePost: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { id: string }, context) => {
       await context.prisma.post.delete({
          where: { id: args.id },
        });
        return args.id;
      },
    },

    changeProfile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) }
      },
      resolve: async (_parent, args: {id: string; dto: {isMale?: boolean; yearOfBirth?: number; memberTypeId?: string}}, context) => {
        return context.prisma.profile.update({
          where: { id: args.id },
          data: {
            isMale: args.dto.isMale ?? undefined,
            yearOfBirth: args.dto.yearOfBirth ?? undefined,
            memberTypeId: args.dto.memberTypeId ?? undefined,
          },
        });
      },
    },
    
    deleteProfile: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { id: string }, context) => {
        await context.prisma.profile.delete({
          where: { id: args.id },
        });
        return args.id
      },
    },

    createPost: {
      type: Post,
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInput) }
      },
      resolve: async (_parent,  args: ICreatePostArgs, context) => {
        const { title, content, authorId } = args.dto;
    
        return context.prisma.post.create({
          data: {
            id: randomUUID(),
            title,
            content,
            authorId,
          }
        });
      },
    },
    
    createProfile: {
      type: Profile,
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInput) }
      },
      resolve: async (_parent, args: ICreateProfileArgs, context) => {
        return context.prisma.profile.create({
          data: {
            id: randomUUID(),
            ...args.dto,
          },
        });
      },
    },

    subscribeTo: {
      type: User,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, {userId, authorId}: {userId: string; authorId: string }, context) => {
        try {
          await context.prisma.user.update({
            where: {id: userId},
            data: {
              userSubscribedTo: {
                create: {authorId: authorId},
              },
            },
          });
          return await context.prisma.user.findUnique({
            where: { id: userId },
          });      
        } catch (error) {
          console.error('Subscription error:', error);
          return null;
        }
      },
    },

    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, {userId, authorId}: { userId: string; authorId: string }, context) => {
        try {
           await context.prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: userId,
                authorId: authorId,
              },
            }
           });
           return true;
        } catch (error) {
          console.error('Unsubscription error:', error);
          return false;
        }
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});
