import { GraphQLScalarType, Kind } from 'graphql';
import { queryResolvers } from './queries.js';
import { mutationResolvers } from './mutations.js';
import { employeeResolvers } from './employee.js';

// DateTime scalar implementation
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error('DateTime must be a Date object');
  },
  parseValue(value) {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value);
    }
    throw new Error('DateTime must be a string or number');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null;
  },
});

// SignupRequest resolvers
const signupRequestResolvers = {
  fullName: (parent: { firstName: string; lastName: string }): string => {
    return `${parent.firstName} ${parent.lastName}`;
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const resolvers: Record<string, any> = {
  DateTime: dateTimeScalar,
  Query: queryResolvers,
  Mutation: mutationResolvers,
  Employee: employeeResolvers,
  SignupRequest: signupRequestResolvers,
};

