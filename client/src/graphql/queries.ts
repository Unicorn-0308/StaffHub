import { gql } from '@apollo/client';

// Employee fragments for reusability
export const EMPLOYEE_BASIC_FRAGMENT = gql`
  fragment EmployeeBasic on Employee {
    id
    employeeId
    firstName
    lastName
    fullName
    email
    avatar
    department
    position
    status
  }
`;

export const EMPLOYEE_FULL_FRAGMENT = gql`
  fragment EmployeeFull on Employee {
    id
    employeeId
    firstName
    lastName
    fullName
    email
    phone
    avatar
    age
    dateOfBirth
    gender
    department
    position
    class
    subjects
    salary
    joinDate
    status
    isFlagged
    flagReason
    attendance
    address
    city
    state
    country
    zipCode
    fullAddress
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_EMPLOYEES = gql`
  query GetEmployees(
    $filter: EmployeeFilter
    $pagination: PaginationInput
    $sort: SortInput
  ) {
    employees(filter: $filter, pagination: $pagination, sort: $sort) {
      data {
        ...EmployeeFull
      }
      totalCount
      pageInfo {
        currentPage
        totalPages
        hasNextPage
        hasPreviousPage
        pageSize
      }
    }
  }
  ${EMPLOYEE_FULL_FRAGMENT}
`;

export const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      ...EmployeeFull
    }
  }
  ${EMPLOYEE_FULL_FRAGMENT}
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalEmployees
      activeEmployees
      onLeaveEmployees
      flaggedEmployees
      averageAttendance
      departmentCounts {
        department
        count
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      role
      employee {
        id
        employeeId
        firstName
        lastName
        fullName
        email
        phone
        avatar
        age
        dateOfBirth
        gender
        department
        position
        class
        subjects
        salary
        joinDate
        status
        attendance
        address
        city
        state
        country
        zipCode
      }
    }
  }
`;

export const GET_DEPARTMENTS = gql`
  query GetDepartments {
    departments
  }
`;

export const GET_POSITIONS = gql`
  query GetPositions {
    positions
  }
`;

// Signup requests queries
export const GET_SIGNUP_REQUESTS = gql`
  query GetSignupRequests($status: SignupRequestStatus) {
    signupRequests(status: $status) {
      id
      email
      firstName
      lastName
      fullName
      phone
      age
      gender
      address
      city
      state
      country
      zipCode
      status
      rejectionReason
      createdAt
    }
  }
`;

export const GET_SIGNUP_REQUEST_COUNT = gql`
  query GetSignupRequestCount {
    signupRequestCount
  }
`;

