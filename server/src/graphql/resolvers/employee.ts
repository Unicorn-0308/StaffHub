import { Employee } from '@prisma/client';

// Field resolvers for Employee type
export const employeeResolvers = {
  // Computed field: full name
  fullName: (parent: Employee): string => {
    return `${parent.firstName} ${parent.lastName}`;
  },

  // Parse subjects from JSON string
  subjects: (parent: Employee): string[] | null => {
    if (!parent.subjects) return null;
    try {
      return JSON.parse(parent.subjects);
    } catch {
      return null;
    }
  },

  // Computed field: full address
  fullAddress: (parent: Employee): string | null => {
    const parts = [
      parent.address,
      parent.city,
      parent.state,
      parent.zipCode,
      parent.country,
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : null;
  },
};

