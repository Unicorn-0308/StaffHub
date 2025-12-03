import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Types for SQLite (no enums)
type Role = 'ADMIN' | 'EMPLOYEE';
type Gender = 'MALE' | 'FEMALE' | 'OTHER';
type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

// Sample departments
const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product'];

// Sample positions
const positions = ['Software Engineer', 'Senior Developer', 'UI/UX Designer', 'Marketing Manager', 'Sales Representative', 'HR Specialist', 'Financial Analyst', 'Product Manager', 'Team Lead', 'Director'];

// Sample subjects (for educational context)
const subjectsList = [
  ['Mathematics', 'Physics', 'Computer Science'],
  ['English', 'Literature', 'History'],
  ['Biology', 'Chemistry', 'Environmental Science'],
  ['Economics', 'Business Studies', 'Accounting'],
  ['Art', 'Music', 'Drama'],
  ['Physical Education', 'Health', 'Nutrition'],
];

// Generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random attendance percentage
function randomAttendance(): number {
  return Math.round((85 + Math.random() * 15) * 10) / 10; // 85-100%
}

// Sample employee data
const employeesData: { firstName: string; lastName: string; gender: Gender; age: number }[] = [
  { firstName: 'John', lastName: 'Doe', gender: 'MALE', age: 32 },
  { firstName: 'Jane', lastName: 'Smith', gender: 'FEMALE', age: 28 },
  { firstName: 'Michael', lastName: 'Johnson', gender: 'MALE', age: 45 },
  { firstName: 'Emily', lastName: 'Williams', gender: 'FEMALE', age: 35 },
  { firstName: 'David', lastName: 'Brown', gender: 'MALE', age: 29 },
  { firstName: 'Sarah', lastName: 'Davis', gender: 'FEMALE', age: 41 },
  { firstName: 'James', lastName: 'Miller', gender: 'MALE', age: 38 },
  { firstName: 'Jennifer', lastName: 'Wilson', gender: 'FEMALE', age: 33 },
  { firstName: 'Robert', lastName: 'Moore', gender: 'MALE', age: 52 },
  { firstName: 'Lisa', lastName: 'Taylor', gender: 'FEMALE', age: 26 },
  { firstName: 'William', lastName: 'Anderson', gender: 'MALE', age: 44 },
  { firstName: 'Jessica', lastName: 'Thomas', gender: 'FEMALE', age: 31 },
  { firstName: 'Daniel', lastName: 'Jackson', gender: 'MALE', age: 36 },
  { firstName: 'Amanda', lastName: 'White', gender: 'FEMALE', age: 27 },
  { firstName: 'Christopher', lastName: 'Harris', gender: 'MALE', age: 48 },
  { firstName: 'Ashley', lastName: 'Martin', gender: 'FEMALE', age: 34 },
  { firstName: 'Matthew', lastName: 'Garcia', gender: 'MALE', age: 30 },
  { firstName: 'Stephanie', lastName: 'Martinez', gender: 'FEMALE', age: 39 },
  { firstName: 'Andrew', lastName: 'Robinson', gender: 'MALE', age: 42 },
  { firstName: 'Nicole', lastName: 'Clark', gender: 'FEMALE', age: 25 },
  { firstName: 'Joshua', lastName: 'Rodriguez', gender: 'MALE', age: 37 },
  { firstName: 'Megan', lastName: 'Lewis', gender: 'FEMALE', age: 29 },
  { firstName: 'Kevin', lastName: 'Lee', gender: 'MALE', age: 46 },
  { firstName: 'Rachel', lastName: 'Walker', gender: 'FEMALE', age: 32 },
  { firstName: 'Brian', lastName: 'Hall', gender: 'MALE', age: 40 },
  { firstName: 'Lauren', lastName: 'Allen', gender: 'FEMALE', age: 28 },
  { firstName: 'Justin', lastName: 'Young', gender: 'MALE', age: 35 },
  { firstName: 'Samantha', lastName: 'King', gender: 'FEMALE', age: 43 },
  { firstName: 'Ryan', lastName: 'Wright', gender: 'MALE', age: 31 },
  { firstName: 'Brittany', lastName: 'Scott', gender: 'FEMALE', age: 24 },
];

// Cities data
const cities = [
  { city: 'New York', state: 'NY', country: 'USA' },
  { city: 'Los Angeles', state: 'CA', country: 'USA' },
  { city: 'Chicago', state: 'IL', country: 'USA' },
  { city: 'Houston', state: 'TX', country: 'USA' },
  { city: 'Phoenix', state: 'AZ', country: 'USA' },
  { city: 'San Francisco', state: 'CA', country: 'USA' },
  { city: 'Seattle', state: 'WA', country: 'USA' },
  { city: 'Boston', state: 'MA', country: 'USA' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();

  console.log('📦 Creating employees...');

  // Create employees
  const employees = await Promise.all(
    employeesData.map(async (emp, index) => {
      const department = departments[index % departments.length];
      const position = positions[index % positions.length];
      const subjects = subjectsList[index % subjectsList.length];
      const location = cities[index % cities.length];
      const status: EmployeeStatus = index < 25 ? 'ACTIVE' : 
                     index < 28 ? 'ON_LEAVE' : 'INACTIVE';

      return prisma.employee.create({
        data: {
          employeeId: `EMP${String(index + 1).padStart(3, '0')}`,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@staffhub.com`,
          phone: `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.firstName}${emp.lastName}`,
          age: emp.age,
          dateOfBirth: randomDate(new Date(1970, 0, 1), new Date(2000, 11, 31)),
          gender: emp.gender,
          department,
          position,
          class: `Class ${String.fromCharCode(65 + (index % 5))}`, // A-E
          subjects: JSON.stringify(subjects),
          salary: 50000 + Math.random() * 100000,
          joinDate: randomDate(new Date(2018, 0, 1), new Date(2023, 11, 31)),
          status,
          isFlagged: index === 5 || index === 15, // Flag a couple employees for demo
          flagReason: index === 5 ? 'Performance review pending' : index === 15 ? 'Documents incomplete' : null,
          attendance: randomAttendance(),
          address: `${Math.floor(100 + Math.random() * 9900)} ${['Main', 'Oak', 'Maple', 'Cedar', 'Pine'][index % 5]} Street`,
          city: location.city,
          state: location.state,
          country: location.country,
          zipCode: String(10000 + Math.floor(Math.random() * 89999)),
        },
      });
    })
  );

  console.log(`✅ Created ${employees.length} employees`);

  console.log('👤 Creating admin user...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.create({
    data: {
      email: 'admin@staffhub.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('👤 Creating employee user...');

  // Create employee user (linked to John Doe)
  const employeePassword = await bcrypt.hash('employee123', 12);
  await prisma.user.create({
    data: {
      email: 'john@staffhub.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      employeeId: employees[0].id, // Link to John Doe
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Login credentials:');
  console.log('   Admin: admin@staffhub.com / admin123');
  console.log('   Employee: john@staffhub.com / employee123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
