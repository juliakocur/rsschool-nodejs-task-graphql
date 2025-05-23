import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema} from './schemas.js';
import { graphql } from 'graphql';
import { schema } from './schemas.js';
import { ContextValue } from './types/context.js';
import {
  createProfileLoader,
  createPostsLoader,
  createMemberTypeLoader,
  createSubscribersLoader,
  createAuthorsLoader,
} from './loaders.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      const partialContext = { prisma };
      const context: ContextValue = { 
        prisma,
        loaders: {
          profile: createProfileLoader(partialContext as ContextValue),
          posts: createPostsLoader(partialContext as ContextValue),
          memberType: createMemberTypeLoader(partialContext as ContextValue),
          subscribers: createSubscribersLoader(partialContext as ContextValue),
          authors: createAuthorsLoader(partialContext as ContextValue),
        }
       };

      const result = await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: context,
      });
      return result;
    },
  });
};

export default plugin;
