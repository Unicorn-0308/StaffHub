import { PrismaClient, User, Role } from '@prisma/client';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import DataLoader from 'dataloader';
import { Employee } from '@prisma/client';

// Initialize Prisma Client with query logging in development
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// JWT payload interface
interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

// Auth user type
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

// Context interface
export interface Context {
  prisma: PrismaClient;
  user: AuthUser | null;
  loaders: {
    employeeLoader: DataLoader<string, Employee | null>;
  };
}

// Create context function
export async function createContext({ req }: { req: Request }): Promise<Omit<Context, 'loaders'>> {
  let user: AuthUser | null = null;

  // Extract and verify JWT token
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      const decoded = jwt.verify(token, secret) as JWTPayload;
      
      // Verify user still exists in database
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
        };
      }
    } catch (error) {
      // Token invalid or expired - user remains null
      console.log('Invalid token:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return {
    prisma,
    user,
  };
}

export { prisma };

