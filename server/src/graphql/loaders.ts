import DataLoader from 'dataloader';
import { PrismaClient, Employee } from '@prisma/client';

/**
 * DataLoader for batching and caching employee queries
 * This is a key performance optimization - prevents N+1 queries
 */
export function createLoaders(prisma: PrismaClient) {
  return {
    employeeLoader: new DataLoader<string, Employee | null>(
      async (ids) => {
        // Batch load all employees in a single query
        const employees = await prisma.employee.findMany({
          where: {
            id: { in: [...ids] },
          },
        });

        // Create a map for O(1) lookup
        const employeeMap = new Map(
          employees.map((emp) => [emp.id, emp])
        );

        // Return in the same order as requested ids
        return ids.map((id) => employeeMap.get(id) || null);
      },
      {
        // Cache for the duration of a single request
        cache: true,
        // Maximum batch size
        maxBatchSize: 100,
      }
    ),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;

