import { Context } from '../../context.js';
import { Prisma } from '@prisma/client';

// Type definitions (SQLite uses strings instead of enums)
type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// Input types
interface PaginationInput {
  page?: number;
  pageSize?: number;
}

interface SortInput {
  field?: string;
  direction?: 'ASC' | 'DESC';
}

interface EmployeeFilter {
  search?: string;
  department?: string;
  status?: EmployeeStatus;
  gender?: Gender;
  isFlagged?: boolean;
  minAge?: number;
  maxAge?: number;
  minAttendance?: number;
  maxAttendance?: number;
}

// Map sort field enum to Prisma field
function mapSortField(field: string): string {
  const fieldMap: Record<string, string> = {
    NAME: 'firstName',
    EMAIL: 'email',
    AGE: 'age',
    DEPARTMENT: 'department',
    POSITION: 'position',
    JOIN_DATE: 'joinDate',
    SALARY: 'salary',
    ATTENDANCE: 'attendance',
    CREATED_AT: 'createdAt',
  };
  return fieldMap[field] || 'createdAt';
}

export const queryResolvers = {
  // Get paginated employees with filtering and sorting
  employees: async (
    _: unknown,
    args: {
      filter?: EmployeeFilter;
      pagination?: PaginationInput;
      sort?: SortInput;
    },
    context: Context
  ) => {
    const { filter, pagination, sort } = args;
    const page = pagination?.page || 1;
    const pageSize = Math.min(pagination?.pageSize || 10, 100); // Max 100 per page
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.EmployeeWhereInput = {};

    if (filter) {
      if (filter.search) {
        where.OR = [
          { firstName: { contains: filter.search } },
          { lastName: { contains: filter.search } },
          { email: { contains: filter.search } },
          { employeeId: { contains: filter.search } },
          { department: { contains: filter.search } },
          { position: { contains: filter.search } },
        ];
      }
      if (filter.department) {
        where.department = filter.department;
      }
      if (filter.status) {
        where.status = filter.status;
      }
      if (filter.gender) {
        where.gender = filter.gender;
      }
      if (filter.isFlagged !== undefined) {
        where.isFlagged = filter.isFlagged;
      }
      if (filter.minAge !== undefined || filter.maxAge !== undefined) {
        where.age = {};
        if (filter.minAge !== undefined) where.age.gte = filter.minAge;
        if (filter.maxAge !== undefined) where.age.lte = filter.maxAge;
      }
      if (filter.minAttendance !== undefined || filter.maxAttendance !== undefined) {
        where.attendance = {};
        if (filter.minAttendance !== undefined) where.attendance.gte = filter.minAttendance;
        if (filter.maxAttendance !== undefined) where.attendance.lte = filter.maxAttendance;
      }
    }

    // Build order by
    const sortField = mapSortField(sort?.field || 'JOIN_DATE');
    const sortDirection = sort?.direction?.toLowerCase() || 'desc';
    const orderBy = { [sortField]: sortDirection };

    // Execute queries in parallel for performance
    const [data, totalCount] = await Promise.all([
      context.prisma.employee.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      context.prisma.employee.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data,
      totalCount,
      pageInfo: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        pageSize,
      },
    };
  },

  // Get single employee by ID
  employee: async (_: unknown, args: { id: string }, context: Context) => {
    return context.loaders.employeeLoader.load(args.id);
  },

  // Get employee by employee ID (e.g., EMP001)
  employeeByEmployeeId: async (
    _: unknown,
    args: { employeeId: string },
    context: Context
  ) => {
    return context.prisma.employee.findUnique({
      where: { employeeId: args.employeeId },
    });
  },

  // Get dashboard statistics
  dashboardStats: async (_: unknown, __: unknown, context: Context) => {
    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      flaggedEmployees,
      attendanceData,
      departmentCounts,
    ] = await Promise.all([
      context.prisma.employee.count(),
      context.prisma.employee.count({ where: { status: 'ACTIVE' } }),
      context.prisma.employee.count({ where: { status: 'ON_LEAVE' } }),
      context.prisma.employee.count({ where: { isFlagged: true } }),
      context.prisma.employee.aggregate({
        _avg: { attendance: true },
      }),
      context.prisma.employee.groupBy({
        by: ['department'],
        _count: { department: true },
        orderBy: { _count: { department: 'desc' } },
      }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      flaggedEmployees,
      averageAttendance: attendanceData._avg.attendance || 0,
      departmentCounts: departmentCounts.map((d) => ({
        department: d.department,
        count: d._count.department,
      })),
    };
  },

  // Get current user
  me: async (_: unknown, __: unknown, context: Context) => {
    if (!context.user) {
      return null;
    }

    return context.prisma.user.findUnique({
      where: { id: context.user.id },
      include: { employee: true },
    });
  },

  // Get all unique departments
  departments: async (_: unknown, __: unknown, context: Context) => {
    const result = await context.prisma.employee.findMany({
      select: { department: true },
      distinct: ['department'],
      orderBy: { department: 'asc' },
    });
    return result.map((r) => r.department);
  },

  // Get all unique positions
  positions: async (_: unknown, __: unknown, context: Context) => {
    const result = await context.prisma.employee.findMany({
      select: { position: true },
      distinct: ['position'],
      orderBy: { position: 'asc' },
    });
    return result.map((r) => r.position);
  },

  // Get signup requests (admin only)
  signupRequests: async (
    _: unknown,
    args: { status?: string },
    context: Context
  ) => {
    // Check if user is admin
    if (!context.user || context.user.role !== 'ADMIN') {
      return [];
    }

    const where = args.status ? { status: args.status } : {};
    
    return context.prisma.signupRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get pending signup request count (for badge)
  signupRequestCount: async (_: unknown, __: unknown, context: Context) => {
    if (!context.user || context.user.role !== 'ADMIN') {
      return 0;
    }

    return context.prisma.signupRequest.count({
      where: { status: 'PENDING' },
    });
  },
};

