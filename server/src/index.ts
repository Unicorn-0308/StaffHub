import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import depthLimit from 'graphql-depth-limit';

import { schema } from './graphql/schema.js';
import { createContext, Context } from './context.js';
import { createLoaders } from './graphql/loaders.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

async function startServer() {
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Create Apollo Server
  const server = new ApolloServer<Context>({
    schema,
    plugins: [
      // Graceful shutdown
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Performance logging plugin
      {
        async requestDidStart() {
          const start = Date.now();
          return {
            async willSendResponse() {
              const duration = Date.now() - start;
              if (duration > 100) {
                console.log(`⚠️ Slow query detected: ${duration}ms`);
              }
            },
          };
        },
      },
    ],
    validationRules: [
      // Prevent deeply nested queries (DoS protection)
      depthLimit(7),
    ],
    introspection: true, // Enable for playground
    formatError: (error) => {
      // Log errors for debugging
      console.error('GraphQL Error:', error);
      
      // Don't expose internal errors in production
      if (process.env.NODE_ENV === 'production') {
        if (error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
          return {
            message: 'Internal server error',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          };
        }
      }
      
      return error;
    },
  });

  // Start Apollo Server
  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: [CORS_ORIGIN, 'https://studio.apollographql.com'],
      credentials: true,
    }),
    express.json({ limit: '50mb' }),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const baseContext = await createContext({ req });
        return {
          ...baseContext,
          loaders: createLoaders(baseContext.prisma),
        };
      },
    })
  );

  // Health check endpoint
  app.get('/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Start HTTP server
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  
  console.log(`
🚀 StaffHub GraphQL Server ready!
📡 GraphQL Endpoint: http://localhost:${PORT}/graphql
💚 Health Check: http://localhost:${PORT}/health
🔧 Environment: ${process.env.NODE_ENV || 'development'}
  `);
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

