export const typeDefs = `#graphql
  """
  Custom scalar for Date handling
  """
  scalar DateTime

  """
  User roles for authorization
  """
  enum Role {
    ADMIN
    EMPLOYEE
  }

  """
  Gender options
  """
  enum Gender {
    MALE
    FEMALE
    OTHER
  }

  """
  Employee status
  """
  enum EmployeeStatus {
    ACTIVE
    INACTIVE
    ON_LEAVE
    TERMINATED
  }

  """
  Sort direction
  """
  enum SortDirection {
    ASC
    DESC
  }

  """
  Sortable fields for employees
  """
  enum EmployeeSortField {
    NAME
    EMAIL
    AGE
    DEPARTMENT
    POSITION
    JOIN_DATE
    SALARY
    ATTENDANCE
    CREATED_AT
  }

  """
  Authentication response
  """
  type AuthPayload {
    token: String!
    user: User!
  }

  """
  User type (for authentication)
  """
  type User {
    id: ID!
    email: String!
    role: Role!
    employee: Employee
    createdAt: DateTime!
  }

  """
  Employee type - main data entity
  """
  type Employee {
    id: ID!
    employeeId: String!
    firstName: String!
    lastName: String!
    fullName: String!
    email: String!
    phone: String
    avatar: String
    age: Int!
    dateOfBirth: DateTime
    gender: Gender!
    department: String!
    position: String!
    class: String
    subjects: [String!]
    salary: Float
    joinDate: DateTime!
    status: EmployeeStatus!
    isFlagged: Boolean!
    flagReason: String
    attendance: Float!
    address: String
    city: String
    state: String
    country: String
    zipCode: String
    fullAddress: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  """
  Paginated employee response
  """
  type EmployeeConnection {
    data: [Employee!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  """
  Pagination info
  """
  type PageInfo {
    currentPage: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    pageSize: Int!
  }

  """
  Pagination input
  """
  input PaginationInput {
    page: Int = 1
    pageSize: Int = 10
  }

  """
  Sort input
  """
  input SortInput {
    field: EmployeeSortField = JOIN_DATE
    direction: SortDirection = DESC
  }

  """
  Filter input for employees
  """
  input EmployeeFilter {
    search: String
    department: String
    status: EmployeeStatus
    gender: Gender
    isFlagged: Boolean
    minAge: Int
    maxAge: Int
    minAttendance: Float
    maxAttendance: Float
  }

  """
  Input for creating an employee
  """
  input CreateEmployeeInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    avatar: String
    age: Int!
    dateOfBirth: DateTime
    gender: Gender
    department: String!
    position: String!
    class: String
    subjects: [String!]
    salary: Float
    joinDate: DateTime
    status: EmployeeStatus
    address: String
    city: String
    state: String
    country: String
    zipCode: String
  }

  """
  Input for updating an employee
  """
  input UpdateEmployeeInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    avatar: String
    age: Int
    dateOfBirth: DateTime
    gender: Gender
    department: String
    position: String
    class: String
    subjects: [String!]
    salary: Float
    status: EmployeeStatus
    isFlagged: Boolean
    flagReason: String
    attendance: Float
    address: String
    city: String
    state: String
    country: String
    zipCode: String
  }

  """
  Login input
  """
  input LoginInput {
    email: String!
    password: String!
  }

  """
  Register input
  """
  input RegisterInput {
    email: String!
    password: String!
    role: Role
  }

  """
  Signup request status
  """
  enum SignupRequestStatus {
    PENDING
    APPROVED
    REJECTED
  }

  """
  Signup request type
  """
  type SignupRequest {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    fullName: String!
    phone: String
    age: Int!
    gender: Gender!
    address: String
    city: String
    state: String
    country: String
    zipCode: String
    status: SignupRequestStatus!
    rejectionReason: String
    createdAt: DateTime!
  }

  """
  Input for submitting a signup request
  """
  input SignupRequestInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phone: String
    age: Int!
    gender: Gender
    address: String
    city: String
    state: String
    country: String
    zipCode: String
  }

  """
  Input for approving a signup request
  """
  input ApproveSignupInput {
    department: String!
    position: String!
    class: String
    salary: Float
  }

  """
  Dashboard statistics
  """
  type DashboardStats {
    totalEmployees: Int!
    activeEmployees: Int!
    onLeaveEmployees: Int!
    flaggedEmployees: Int!
    averageAttendance: Float!
    departmentCounts: [DepartmentCount!]!
  }

  type DepartmentCount {
    department: String!
    count: Int!
  }

  """
  Queries
  """
  type Query {
    # Employee queries
    employees(
      filter: EmployeeFilter
      pagination: PaginationInput
      sort: SortInput
    ): EmployeeConnection!
    
    employee(id: ID!): Employee
    
    employeeByEmployeeId(employeeId: String!): Employee
    
    # Dashboard
    dashboardStats: DashboardStats!
    
    # Auth
    me: User
    
    # Metadata
    departments: [String!]!
    positions: [String!]!
    
    # Signup requests (admin only)
    signupRequests(status: SignupRequestStatus): [SignupRequest!]!
    signupRequestCount: Int!
  }

  """
  Mutations
  """
  type Mutation {
    # Auth mutations
    login(input: LoginInput!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!
    
    # Employee mutations (require authentication)
    createEmployee(input: CreateEmployeeInput!): Employee!
    updateEmployee(id: ID!, input: UpdateEmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
    
    # Bulk operations (admin only)
    flagEmployee(id: ID!, reason: String!): Employee!
    unflagEmployee(id: ID!): Employee!
    bulkDeleteEmployees(ids: [ID!]!): Int!
    bulkUpdateStatus(ids: [ID!]!, status: EmployeeStatus!): Int!
    
    # Signup request mutations
    submitSignupRequest(input: SignupRequestInput!): SignupRequest!
    approveSignupRequest(id: ID!, input: ApproveSignupInput!): Employee!
    rejectSignupRequest(id: ID!, reason: String!): SignupRequest!
  }
`;

