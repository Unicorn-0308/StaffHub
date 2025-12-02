// Employee types
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type Role = 'ADMIN' | 'EMPLOYEE';

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  age: number;
  dateOfBirth?: string | null;
  gender: Gender;
  department: string;
  position: string;
  class?: string | null;
  subjects?: string[] | null;
  salary?: number | null;
  joinDate: string;
  status: EmployeeStatus;
  isFlagged: boolean;
  flagReason?: string | null;
  attendance: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
  fullAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Pagination types
export interface PageInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
}

export interface EmployeeConnection {
  data: Employee[];
  totalCount: number;
  pageInfo: PageInfo;
}

// Filter types
export interface EmployeeFilter {
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

// Sort types
export type SortDirection = 'ASC' | 'DESC';
export type SortField = 
  | 'NAME' 
  | 'EMAIL' 
  | 'AGE' 
  | 'DEPARTMENT' 
  | 'POSITION' 
  | 'JOIN_DATE' 
  | 'SALARY' 
  | 'ATTENDANCE' 
  | 'CREATED_AT';

export interface SortInput {
  field: SortField;
  direction: SortDirection;
}

// Pagination input
export interface PaginationInput {
  page: number;
  pageSize: number;
}

// Dashboard stats
export interface DepartmentCount {
  department: string;
  count: number;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  flaggedEmployees: number;
  averageAttendance: number;
  departmentCounts: DepartmentCount[];
}

// Input types for mutations
export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  age: number;
  dateOfBirth?: string;
  gender?: Gender;
  department: string;
  position: string;
  class?: string;
  subjects?: string[];
  salary?: number;
  joinDate?: string;
  status?: EmployeeStatus;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  age?: number;
  dateOfBirth?: string;
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

// View types
export type ViewMode = 'grid' | 'tile';

// Menu types
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
}

