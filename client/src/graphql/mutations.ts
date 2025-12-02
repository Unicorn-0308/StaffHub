import { gql } from '@apollo/client';
import { EMPLOYEE_FULL_FRAGMENT } from './queries';

// Auth mutations
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        role
        employee {
          id
          firstName
          lastName
          avatar
        }
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

// Employee mutations
export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      ...EmployeeFull
    }
  }
  ${EMPLOYEE_FULL_FRAGMENT}
`;

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $input: UpdateEmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      ...EmployeeFull
    }
  }
  ${EMPLOYEE_FULL_FRAGMENT}
`;

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

export const FLAG_EMPLOYEE = gql`
  mutation FlagEmployee($id: ID!, $reason: String!) {
    flagEmployee(id: $id, reason: $reason) {
      id
      isFlagged
      flagReason
    }
  }
`;

export const UNFLAG_EMPLOYEE = gql`
  mutation UnflagEmployee($id: ID!) {
    unflagEmployee(id: $id) {
      id
      isFlagged
      flagReason
    }
  }
`;

export const BULK_DELETE_EMPLOYEES = gql`
  mutation BulkDeleteEmployees($ids: [ID!]!) {
    bulkDeleteEmployees(ids: $ids)
  }
`;

export const BULK_UPDATE_STATUS = gql`
  mutation BulkUpdateStatus($ids: [ID!]!, $status: EmployeeStatus!) {
    bulkUpdateStatus(ids: $ids, status: $status)
  }
`;

// Signup request mutations
export const SUBMIT_SIGNUP_REQUEST = gql`
  mutation SubmitSignupRequest($input: SignupRequestInput!) {
    submitSignupRequest(input: $input) {
      id
      email
      firstName
      lastName
      status
      createdAt
    }
  }
`;

export const APPROVE_SIGNUP_REQUEST = gql`
  mutation ApproveSignupRequest($id: ID!, $input: ApproveSignupInput!) {
    approveSignupRequest(id: $id, input: $input) {
      id
      employeeId
      firstName
      lastName
      email
      department
      position
    }
  }
`;

export const REJECT_SIGNUP_REQUEST = gql`
  mutation RejectSignupRequest($id: ID!, $reason: String!) {
    rejectSignupRequest(id: $id, reason: $reason) {
      id
      status
      rejectionReason
    }
  }
`;

