# Elite High School Management System

A modern full-stack application for managing Elite High School operations in Kampala, Uganda with role-based access control.

## Tech Stack

### Frontend & Backend (Next.js 16)
- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Neon PostgreSQL
- JWT Authentication
- React Query (@tanstack/react-query)
- Axios

### Database
- Neon PostgreSQL (Serverless Postgres)
- Prisma ORM for database management

## Features

- **Authentication & Authorization**: JWT-based with role management
- **User Management**: Admin, Teacher, Student, Parent, Department Head
- **Class/Course Management**: Create and manage courses, assign teachers
- **Student Records**: Comprehensive student profiles
- **Grade Management**: Multi-level approval workflow
- **Attendance Tracking**: Daily attendance per class
- **Assignment Management**: Upload, submit, and grade assignments
- **Reports & Analytics**: GPA calculation, transcripts, performance dashboards
- **Notifications**: In-app notification system

## Elite High School Branding

- **Primary Color**: Deep Royal Blue (#1E3A8A) - Trust, Wisdom, Professionalism
- **Secondary Color**: Gold/Amber (#F59E0B) - Excellence, Achievement, Elite Status
- **Accent Color**: Rich Emerald Green (#10B981) - Growth, Success, African Heritage
- **Motto**: Excellence in Education

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL account (or local PostgreSQL)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd High-School-Management-System-main/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your database URL in `.env`:
```
DATABASE_URL=postgresql://your-neon-database-url
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=http://localhost:3000
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Run database migrations:
```bash
npx prisma migrate dev
```

7. Seed the database with initial data:
```bash
npm run seed
```

8. Start the development server:
```bash
npm run dev
```

9. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Credentials

- Admin: admin@elitehighschool.ug / password
- Teacher: teacher@elitehighschool.ug / password
- Student: student@elitehighschool.ug / password
- Parent: parent@elitehighschool.ug / password

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── users/         # User management
│   │   │   ├── courses/       # Course management
│   │   │   ├── classes/       # Class management
│   │   │   ├── enrollments/   # Student enrollments
│   │   │   ├── grades/        # Grade management
│   │   │   ├── assignments/   # Assignment management
│   │   │   ├── submissions/   # Assignment submissions
│   │   │   ├── attendance/    # Attendance tracking
│   │   │   └── notifications/ # Notification system
│   │   ├── dashboard/        # Dashboard pages
│   │   └── page.tsx          # Login page
│   ├── components/           # Reusable components
│   ├── lib/                  # Utility functions
│   │   ├── prisma.ts         # Prisma client
│   │   ├── auth.ts           # Auth utilities
│   │   ├── server-auth.ts    # Server-side auth
│   │   ├── middleware.ts     # Auth middleware
│   │   ├── api.ts            # API client
│   │   └── design-system.ts  # Elite High School design system
│   └── app/globals.css       # Global styles
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts              # Database seeding
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin, department_head)
- `POST /api/users` - Create user (admin, department_head)
- `GET /api/users/[id]` - Get single user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user (admin)

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (admin, department_head)
- `GET /api/courses/[id]` - Get single course
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course (admin)

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class (admin, department_head)
- `GET /api/classes/[id]` - Get single class
- `PUT /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Delete class (admin)

### And more... (enrollments, grades, assignments, submissions, attendance, notifications)

## Development

### Run development server:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Database operations:
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Seed database
npm run seed

# Open Prisma Studio
npx prisma studio
```

## License

MIT
