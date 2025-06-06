# Job Portal API

A scalable, secure, and modern Job Portal REST API built with [NestJS](https://nestjs.com/), [Prisma ORM](https://www.prisma.io/), and PostgreSQL.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Migration & Seeding](#database-migration--seeding)
  - [Running the Application](#running-the-application)
  - [Running Tests](#running-tests)
- [API Overview](#api-overview)
  - [Authentication](#authentication)
  - [Role-Based Access Control](#role-based-access-control)
  - [Jobs](#jobs)
  - [Applications](#applications)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- User registration and authentication (JWT)
- Email verification flow
- Role-based access control (RBAC): Seeker, Employer, Admin
- CRUD operations for jobs and job locations
- Job application system with file upload (resume)
- Pagination and filtering for listings
- Modular, testable architecture
- Input validation and error handling
- Nodemailer integration for transactional emails

---

## Tech Stack

- **Backend Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Authentication:** JWT (Passport.js)
- **Validation:** class-validator, class-transformer
- **Mail:** Nodemailer

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database

### Installation

```bash
git clone https://github.com/your-username/job-portal-api.git
cd job-portal-api
npm install
```

### Environment Variables

Create a `.env` file in the root directory and set the following variables:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your_jwt_secret
MAIL_HOST=smtp.example.com
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_password
PORT=3000
```

### Database Migration & Seeding

```bash
npx prisma migrate deploy
npm run seed
```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Running Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e
```

---

## API Overview

### Authentication

- **POST /auth/register** — Register a new user (Seeker or Employer)
- **POST /auth/login** — Login and receive JWT
- **POST /auth/resend-verification-email** — Resend email verification
- **GET /auth/verify-email?token=** — Verify email

### Role-Based Access Control

- **Roles:** `ADMIN`, `EMPLOYER`, `SEEKER`
- **Access Rules:**
  - **ADMIN:** Can manage all jobs and applications.
  - **EMPLOYER:** Can create jobs, see all their jobs (any status), and see all active jobs.
  - **SEEKER:** Can see only active jobs and apply to them.
  - **Anonymous:** Can see only active jobs.

### Jobs

- **GET /jobs** — List jobs (active only for seekers/anonymous, active+own for employers, all for admin)
- **GET /jobs/:id** — Get job details (access controlled)
- **POST /jobs** — Create a job (employer only)
- **PATCH /jobs/:id** — Update a job (employer only, only if job is active)
- **DELETE /jobs/:id** — Delete a job (employer only)
- **GET /jobs/my-jobs** — List jobs created by the employer

#### Admin Endpoints

- **GET /admin/jobs** — List all jobs (admin only, with filters)
- **PATCH /admin/jobs/:id** — Update job status (admin only)

### Applications

- **POST /applications/jobs/:jobId** — Apply to a job (seeker only, with resume upload)
- **GET /applications/jobs/:jobId** — List applications for a job (employer only)
- **GET /applications/my-applications** — List applications by the seeker
- **GET /applications** — List all applications (admin only)
- **PATCH /applications/:id** — Update application status (employer only)
- **GET /applications/:id** — Get application details (admin, employer, or owner)

---

## Project Structure

```
src/
  ├── auth/         # Authentication & user management
  ├── jobs/         # Job CRUD and business logic
  ├── applications/ # Job applications logic
  ├── mail/         # Email service
  ├── database/     # Prisma database integration
  ├── common/       # Shared decorators, guards, etc.
  └── app.module.ts # Main application module
prisma/
  ├── schema.prisma # Prisma schema
  └── seed.ts       # Seed data script
uploads/
  └── resumes/      # Uploaded resumes
```

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

---

## License

[MIT](LICENSE)

---

**Author:** [Your Name](https://github.com/your-username)