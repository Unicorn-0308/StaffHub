import { Context } from '../../context.js';
import { GraphQLError } from 'graphql';

// Type definitions (SQLite uses strings instead of enums)
type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
type Gender = 'MALE' | 'FEMALE' | 'OTHER';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Input types
interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  role?: 'ADMIN' | 'EMPLOYEE';
}

interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  age: number;
  dateOfBirth?: Date;
  gender?: Gender;
  department: string;
  position: string;
  class?: string;
  subjects?: string[];
  salary?: number;
  joinDate?: Date;
  status?: EmployeeStatus;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  age?: number;
  dateOfBirth?: Date;
  gender?: Gender;
  department?: string;
  position?: string;
  class?: string;
  subjects?: string[];
  salary?: number;
  status?: EmployeeStatus;
  isFlagged?: boolean;
  flagReason?: string;
  attendance?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

// Helper functions
function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
}

function requireAdmin(context: Context) {
  const user = requireAuth(context);
  if (user.role !== 'ADMIN') {
    throw new GraphQLError('Admin access required', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return user;
}

// Generate employee ID
async function generateEmployeeId(context: Context): Promise<string> {
  const lastEmployee = await context.prisma.employee.findFirst({
    orderBy: { employeeId: 'desc' },
    select: { employeeId: true },
  });

  if (!lastEmployee) {
    return 'EMP001';
  }

  const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''), 10);
  return `EMP${String(lastNumber + 1).padStart(3, '0')}`;
}

// Generate JWT token
function generateToken(userId: string, email: string, role: string): string {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign({ userId, email, role }, secret, { expiresIn });
}

export const mutationResolvers = {
  // Authentication mutations
  login: async (_: unknown, args: { input: LoginInput }, context: Context) => {
    const { email, password } = args.input;

    // Find user
    const user = await context.prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user) {
      throw new GraphQLError('Invalid email or password', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new GraphQLError('Invalid email or password', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    return {
      token,
      user,
    };
  },

  register: async (_: unknown, args: { input: RegisterInput }, context: Context) => {
    const { email, password, role } = args.input;

    // Check if user exists
    const existingUser = await context.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new GraphQLError('Email already registered', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await context.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE',
      },
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    return {
      token,
      user,
    };
  },

  // Employee mutations
  createEmployee: async (
    _: unknown,
    args: { input: CreateEmployeeInput },
    context: Context
  ) => {
    requireAdmin(context);

    const { subjects, ...data } = args.input;

    // Check if email already exists
    const existingEmployee = await context.prisma.employee.findUnique({
      where: { email: data.email },
    });

    if (existingEmployee) {
      throw new GraphQLError('Email already in use', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Generate employee ID
    const employeeId = await generateEmployeeId(context);

    // Generate avatar if not provided
    const avatar = data.avatar || 
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}${data.lastName}`;

    return context.prisma.employee.create({
      data: {
        ...data,
        employeeId,
        avatar,
        subjects: subjects ? JSON.stringify(subjects) : null,
        gender: data.gender || 'OTHER',
        status: data.status || 'ACTIVE',
        joinDate: data.joinDate || new Date(),
      },
    });
  },

  updateEmployee: async (
    _: unknown,
    args: { id: string; input: UpdateEmployeeInput },
    context: Context
  ) => {
    const user = requireAuth(context);

    // Get employee
    const employee = await context.prisma.employee.findUnique({
      where: { id: args.id },
    });

    if (!employee) {
      throw new GraphQLError('Employee not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Check permissions - employees can only update their own profile
    if (user.role !== 'ADMIN') {
      const userRecord = await context.prisma.user.findUnique({
        where: { id: user.id },
      });

      if (userRecord?.employeeId !== args.id) {
        throw new GraphQLError('You can only update your own profile', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Employees can't update sensitive fields
      const restrictedFields: (keyof UpdateEmployeeInput)[] = [
        'salary', 'status', 'isFlagged', 'flagReason', 'attendance'
      ];
      
      for (const field of restrictedFields) {
        if (args.input[field] !== undefined) {
          throw new GraphQLError(`You don't have permission to update ${field}`, {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }
    }

    const { subjects, ...data } = args.input;

    // Check email uniqueness if updating
    if (data.email && data.email !== employee.email) {
      const existingEmployee = await context.prisma.employee.findUnique({
        where: { email: data.email },
      });

      if (existingEmployee) {
        throw new GraphQLError('Email already in use', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    }

    return context.prisma.employee.update({
      where: { id: args.id },
      data: {
        ...data,
        subjects: subjects !== undefined ? JSON.stringify(subjects) : undefined,
      },
    });
  },

  deleteEmployee: async (
    _: unknown,
    args: { id: string },
    context: Context
  ) => {
    requireAdmin(context);

    // Check if employee exists
    const employee = await context.prisma.employee.findUnique({
      where: { id: args.id },
    });

    if (!employee) {
      throw new GraphQLError('Employee not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Delete associated user first (if any)
    await context.prisma.user.deleteMany({
      where: { employeeId: args.id },
    });

    // Delete employee
    await context.prisma.employee.delete({
      where: { id: args.id },
    });

    return true;
  },

  flagEmployee: async (
    _: unknown,
    args: { id: string; reason: string },
    context: Context
  ) => {
    requireAdmin(context);

    const employee = await context.prisma.employee.findUnique({
      where: { id: args.id },
    });

    if (!employee) {
      throw new GraphQLError('Employee not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    return context.prisma.employee.update({
      where: { id: args.id },
      data: {
        isFlagged: true,
        flagReason: args.reason,
      },
    });
  },

  unflagEmployee: async (
    _: unknown,
    args: { id: string },
    context: Context
  ) => {
    requireAdmin(context);

    const employee = await context.prisma.employee.findUnique({
      where: { id: args.id },
    });

    if (!employee) {
      throw new GraphQLError('Employee not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    return context.prisma.employee.update({
      where: { id: args.id },
      data: {
        isFlagged: false,
        flagReason: null,
      },
    });
  },

  bulkDeleteEmployees: async (
    _: unknown,
    args: { ids: string[] },
    context: Context
  ) => {
    requireAdmin(context);

    // Delete associated users first
    await context.prisma.user.deleteMany({
      where: { employeeId: { in: args.ids } },
    });

    // Delete employees
    const result = await context.prisma.employee.deleteMany({
      where: { id: { in: args.ids } },
    });

    return result.count;
  },

  bulkUpdateStatus: async (
    _: unknown,
    args: { ids: string[]; status: EmployeeStatus },
    context: Context
  ) => {
    requireAdmin(context);

    const result = await context.prisma.employee.updateMany({
      where: { id: { in: args.ids } },
      data: { status: args.status },
    });

    return result.count;
  },

  // Submit signup request (public - no auth required)
  submitSignupRequest: async (
    _: unknown,
    args: {
      input: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        age: number;
        gender?: Gender;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
      };
    },
    context: Context
  ) => {
    const { email, password, ...data } = args.input;

    // Check if email already exists in users
    const existingUser = await context.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new GraphQLError('Email already registered', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Check if email already exists in employees
    const existingEmployee = await context.prisma.employee.findUnique({
      where: { email },
    });

    if (existingEmployee) {
      throw new GraphQLError('Email already in use', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Check if there's already a pending request with this email
    const existingRequest = await context.prisma.signupRequest.findUnique({
      where: { email },
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        throw new GraphQLError('A signup request with this email is already pending', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      // If rejected, delete old request and allow new one
      if (existingRequest.status === 'REJECTED') {
        await context.prisma.signupRequest.delete({
          where: { email },
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create signup request
    return context.prisma.signupRequest.create({
      data: {
        email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        age: data.age,
        gender: data.gender || 'OTHER',
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode,
        status: 'PENDING',
      },
    });
  },

  // Approve signup request (admin only)
  approveSignupRequest: async (
    _: unknown,
    args: {
      id: string;
      input: {
        department: string;
        position: string;
        class?: string;
        salary?: number;
      };
    },
    context: Context
  ) => {
    requireAdmin(context);

    // Get the signup request
    const request = await context.prisma.signupRequest.findUnique({
      where: { id: args.id },
    });

    if (!request) {
      throw new GraphQLError('Signup request not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (request.status !== 'PENDING') {
      throw new GraphQLError('This request has already been processed', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Generate employee ID
    const lastEmployee = await context.prisma.employee.findFirst({
      orderBy: { employeeId: 'desc' },
      select: { employeeId: true },
    });

    let employeeId = 'EMP001';
    if (lastEmployee) {
      const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''), 10);
      employeeId = `EMP${String(lastNumber + 1).padStart(3, '0')}`;
    }

    // Create employee
    const employee = await context.prisma.employee.create({
      data: {
        employeeId,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        phone: request.phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.firstName}${request.lastName}`,
        age: request.age,
        gender: request.gender,
        department: args.input.department,
        position: args.input.position,
        class: args.input.class,
        salary: args.input.salary,
        address: request.address,
        city: request.city,
        state: request.state,
        country: request.country,
        zipCode: request.zipCode,
        status: 'ACTIVE',
      },
    });

    // Create user account linked to employee
    await context.prisma.user.create({
      data: {
        email: request.email,
        password: request.password, // Already hashed
        role: 'EMPLOYEE',
        employeeId: employee.id,
      },
    });

    // Update signup request status
    await context.prisma.signupRequest.update({
      where: { id: args.id },
      data: { status: 'APPROVED' },
    });

    return employee;
  },

  // Reject signup request (admin only)
  rejectSignupRequest: async (
    _: unknown,
    args: { id: string; reason: string },
    context: Context
  ) => {
    requireAdmin(context);

    const request = await context.prisma.signupRequest.findUnique({
      where: { id: args.id },
    });

    if (!request) {
      throw new GraphQLError('Signup request not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (request.status !== 'PENDING') {
      throw new GraphQLError('This request has already been processed', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    return context.prisma.signupRequest.update({
      where: { id: args.id },
      data: {
        status: 'REJECTED',
        rejectionReason: args.reason,
      },
    });
  },
};

