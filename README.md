# 🏢 StaffHub - Employee Management System

A modern, full-stack employee management application built with React, GraphQL, Node.js, and Prisma.

![StaffHub Banner](https://img.shields.io/badge/StaffHub-Employee%20Management-667eea?style=for-the-badge)

## 🌟 Features

### Frontend
- 📱 **Responsive Design** - Works on all devices
- 🍔 **Hamburger Menu** - Collapsible navigation with sub-menus
- 📊 **Grid View** - Display employees in a 10-column data table
- 🎴 **Tile View** - Card-based employee display with action menus
- 🔍 **Detail View** - Expanded employee information popup
- 🎨 **Modern UI** - Beautiful animations and interactions
- 🌙 **Dark/Light Mode** - Theme switching support

### Backend
- 🚀 **GraphQL API** - Flexible querying with Apollo Server
- 📄 **Pagination & Sorting** - Efficient data loading
- 🔐 **JWT Authentication** - Secure user sessions
- 👥 **Role-Based Access** - Admin and Employee permissions
- ⚡ **Performance Optimized** - DataLoader, caching, query complexity analysis

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| TypeScript | Type Safety |
| TailwindCSS | Styling |
| Apollo Client | GraphQL Client |
| Framer Motion | Animations |
| Lucide React | Icons |
| React Router | Navigation |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | Web Framework |
| Apollo Server v4 | GraphQL Server |
| Prisma | ORM |
| SQLite/PostgreSQL | Database |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| DataLoader | Query Batching |

## 📁 Project Structure

```
StaffHub/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── graphql/        # GraphQL queries/mutations
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── ...
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── graphql/        # Schema & resolvers
│   │   ├── middleware/     # Auth & other middleware
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Server entry point
│   ├── prisma/             # Database schema & migrations
│   └── ...
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/staffhub.git
cd staffhub
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install all dependencies (client + server)
npm run install:all
```

3. **Set up environment variables**
```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

4. **Initialize database**
```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

5. **Start development servers**
```bash
# From root directory
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000/graphql

## 🔐 Authentication

### Default Users
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@staffhub.com | admin123 |
| Employee | john@staffhub.com | employee123 |

### Role Permissions
| Feature | Admin | Employee |
|---------|-------|----------|
| View Employees | ✅ | ✅ |
| Add Employee | ✅ | ❌ |
| Edit Employee | ✅ | Own profile only |
| Delete Employee | ✅ | ❌ |
| Flag Employee | ✅ | ❌ |

## 📊 GraphQL API

### Queries
```graphql
# List employees with filters and pagination
query GetEmployees($filter: EmployeeFilter, $pagination: PaginationInput, $sort: SortInput) {
  employees(filter: $filter, pagination: $pagination, sort: $sort) {
    data {
      id
      name
      email
      age
      department
      subjects
      attendance
    }
    totalCount
    hasMore
  }
}

# Get single employee
query GetEmployee($id: ID!) {
  employee(id: $id) {
    id
    name
    email
    # ... all fields
  }
}
```

### Mutations
```graphql
# Add employee (Admin only)
mutation AddEmployee($input: CreateEmployeeInput!) {
  createEmployee(input: $input) {
    id
    name
  }
}

# Update employee
mutation UpdateEmployee($id: ID!, $input: UpdateEmployeeInput!) {
  updateEmployee(id: $id, input: $input) {
    id
    name
  }
}

# Delete employee (Admin only)
mutation DeleteEmployee($id: ID!) {
  deleteEmployee(id: $id)
}
```

## 🎨 Screenshots

*Screenshots will be added after deployment*

## 🌐 Live Demo

- **Frontend**: [https://staffhub-app.vercel.app](https://staffhub-app.vercel.app)
- **Backend**: [https://staffhub-api.onrender.com/graphql](https://staffhub-api.onrender.com/graphql)

## 📝 License

MIT License - feel free to use this project for learning and development.

---

Built with ❤️ for the Full-Stack Developer Assessment

