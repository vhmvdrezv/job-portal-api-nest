# 🚀 Job Portal API

A scalable, secure, and modern Job Portal REST API built with [NestJS](https://nestjs.com/), [Prisma ORM](https://www.prisma.io/), and PostgreSQL.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Migration & Seeding](#database-migration--seeding)
  - [Running the Application](#running-the-application)
  - [Running Tests](#running-tests)
- [🔐 Role-Based Access Control](#-role-based-access-control)
- [📚 API Overview](#-api-overview)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## ✨ Features

- **User Authentication**: Secure JWT-based login and registration
- **Email Verification**: Email confirmation for new users
- **Role-Based Access Control**: `ADMIN`, `EMPLOYER`, `SEEKER`, and public (anonymous) access
- **Job Management**: Employers can create, update, and delete jobs; seekers can view and apply
- **Job Applications**: Seekers can apply to jobs with resume upload
- **Pagination & Filtering**: For jobs and applications
- **Custom Logging**: Middleware logs all HTTP requests and responses
- **Robust Error Handling**: Global exception filter for consistent API errors
- **Modular Architecture**: Clean, maintainable, and testable codebase

---

## 🛠️ Tech Stack

- **Backend Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Authentication:** JWT (Passport.js)
- **Validation:** class-validator, class-transformer
- **Mail:** Nodemailer
- **File Uploads:** Multer

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database

### Installation

```bash
git clone https://github.com/vhmvdrezv/job-portal-api.git
cd job-portal-api
npm install
```

### Environment Variables

Create a `.env` file in the root directory and set the following variables:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your_jwt_secret
MAIL_HOST=smtp.example.com
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_password
PORT=3000
FRONT_APP_URL=http://your_front_app_url:your_port/
```

### Database Migration & Seeding

```bash
# Development
npx prisma migrate dev

# Production
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

## 🔐 Role-Based Access Control

| Role      | Can See Jobs                | Can Create/Update/Delete Jobs | Can Apply to Jobs | Can See Applications |
|-----------|----------------------------|-------------------------------|-------------------|---------------------|
| ADMIN     | All jobs (any status)       | Yes (admin endpoints)         | No                | All                 |
| EMPLOYER  | Active jobs + own jobs      | Yes (own jobs)                | No                | Own jobs' apps      |
| SEEKER    | Only active jobs            | No                            | Yes               | Own applications    |
| Anonymous | Only active jobs            | No                            | No                | No                  |

---

## 📚 API Overview

### Authentication

- `POST /auth/register` — Register a new user (Seeker or Employer)
- `POST /auth/login` — Login and receive JWT
- `POST /auth/resend-verification-email` — Resend email verification
- `GET /auth/verify-email?token=...` — Verify email
- `POST /auth/forget-password` — Request password reset
- `PATCH /auth/reset-password` — Reset password

### Jobs

- `GET /jobs` — List jobs (role-based filtering)
- `GET /jobs/:id` — Get job details (role-based access)
- `POST /jobs` — Create a job (Employer only)
- `PATCH /jobs/:id` — Update a job (Employer only, if active)
- `DELETE /jobs/:id` — Delete a job (Employer only)
- `GET /jobs/my-jobs` — List jobs created by the employer

#### Admin Endpoints

- `GET /admin/jobs` — List all jobs (Admin only, with filters)
- `PATCH /admin/jobs/:id` — Update job status (Admin only)

### Applications

- `POST /applications/jobs/:jobId` — Apply to a job (Seeker only, with resume upload)
- `GET /applications/jobs/:jobId` — List applications for a job (Employer only)
- `GET /applications/my-applications` — List applications by the seeker
- `GET /applications` — List all applications (Admin only)
- `PATCH /applications/:id` — Update application status (Employer only)
- `GET /applications/:id` — Get application details (Admin, employer, or owner)

---

## 📁 Project Structure

```
src/
  ├── auth/           # Authentication & user management
  ├── jobs/           # Job CRUD and business logic
  ├── applications/   # Job applications logic
  ├── mail/           # Email service
  ├── database/       # Prisma database integration
  ├── common/         # Shared decorators, guards, middleware, logger, etc.
  └── app.module.ts   # Main application module
prisma/
  ├── schema.prisma   # Prisma schema
  └── seed.ts         # Seed data script
uploads/
  └── resumes/        # Uploaded resumes
```

---

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests.

---

**Author:** [Ahmadreza](https://github.com/vhmvdrezv)

---

