# AI Use Case Catalog

Internal web application for SSA & Company to capture, prioritize, and track AI use case ideas.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update the `DATABASE_URL` in `.env` with your PostgreSQL connection string.

5. Run database migrations:
   ```bash
   npm run db:push
   ```

6. Seed the database with test users:
   ```bash
   npm run db:seed
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`.

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Test Users

After seeding the database, you can log in with these accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@ssaandco.com | admin123 | Admin |
| committee@ssaandco.com | committee123 | Committee |
| submitter@ssaandco.com | submitter123 | Submitter |

## User Roles

- **Submitter**: Can create use cases, view all use cases, edit own submissions
- **Committee**: All Submitter permissions + score, approve/reject, assign owners
- **Admin**: All permissions + manage users, delete records

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user (Admin only) |
| POST | /api/auth/login | Authenticate user |
| GET | /api/auth/me | Get current user |
| GET | /api/use-cases | List all use cases |
| POST | /api/use-cases | Create new use case |
| GET | /api/use-cases/:id | Get single use case |
| PATCH | /api/use-cases/:id | Update use case |
| PATCH | /api/use-cases/:id/score | Score use case (Committee/Admin) |
| DELETE | /api/use-cases/:id | Delete use case (Admin) |
| GET | /api/users | List users (Admin) |
| GET | /api/users/owner-candidates | Get assignable users (Committee/Admin) |
| PATCH | /api/users/:id | Update user (Admin) |
| DELETE | /api/users/:id | Delete user (Admin) |

## Deployment to Render

### Database
1. Create a PostgreSQL database on Render
2. Copy the connection string

### Backend
1. Create a new Web Service
2. Connect your repository
3. Set build command: `cd server && npm install && npm run db:push`
4. Set start command: `cd server && npm start`
5. Add environment variables:
   - `DATABASE_URL`: Your Render PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production

### Frontend
1. Create a new Static Site (or Web Service)
2. Connect your repository
3. Set build command: `cd client && npm install && npm run build`
4. Set publish directory: `client/dist`

## Features

- Use case submission form
- Committee scoring (Business Impact, Feasibility, Strategic Alignment)
- Composite score calculation
- Status tracking (New, In Progress, Completed)
- Approval workflow (Pending Review, Approved, On Hold, Rejected)
- Filtering and sorting
- Search functionality
- User management (Admin)
