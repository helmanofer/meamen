# Meamen

**Live**: [https://meamen.fly.dev/](https://meamen.fly.dev/) | [https://meamen.onrender.com/](https://meamen.onrender.com/)

A fitness training management platform built with Bun, Hono.js, React, and Prisma.

## Overview

Meamen is a web application for managing fitness training sessions, tracking exercises, and facilitating trainer-trainee relationships. Trainers can create sessions, assign exercises, and track trainee progress, while trainees can view their assigned sessions and log completed exercises.

## Tech Stack

- **Runtime**: Bun
- **Backend**: Hono.js
- **Database**: Prisma ORM (SQLite for development, PostgreSQL for production)
- **Frontend**: React + TypeScript + Vite
- **Authentication**: JWT + bcryptjs

## Project Structure

```
meamen/
├── client/                 # React frontend
│   ├── src/               # Source files
│   ├── public/            # Static assets
│   └── package.json       # Client dependencies
├── server/                # Hono.js backend
│   ├── routes/            # API route handlers
│   │   ├── auth.ts       # Authentication routes
│   │   ├── sessions.ts   # Session management
│   │   ├── exercises.ts  # Exercise CRUD
│   │   ├── templates.ts  # Session templates
│   │   └── trainees.ts   # Trainee management
│   ├── middleware/       # Custom middleware
│   ├── types/            # TypeScript types
│   └── index.ts          # Server entry point
├── prisma/
│   ├── schema.prisma      # Database schema (PostgreSQL)
│   ├── schema.sqlite.prisma  # Database schema (SQLite)
│   └── seed.ts           # Database seeding
├── _bmad/                # BMad agent framework
└── package.json          # Root package.json
```

## Database Schema

### Core Models

- **User**: Trainers and trainees with role-based access
- **TrainerTrainee**: Many-to-many relationship between trainers and trainees
- **Session**: Training sessions assigned to trainees
- **Exercise**: Individual exercises within a session
- **ExerciseLog**: Trainee's completed exercise records
- **SessionTemplate**: Reusable session templates for trainers

## Getting Started

### Prerequisites

- Bun (latest version)
- Node.js 18+ (for Prisma)

### Installation

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Seed the database
bun run db:seed
```

### Development

```bash
# Run both server and client
bun run dev

# Run only server (with hot reload)
bun run dev:server

# Run only client
bun run dev:client
```

### Linting

```bash
# Lint entire project
bun run lint

# Lint client only
bun run lint:client
```

### Testing

```bash
bun test
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and receive JWT

### Sessions

- `GET /sessions` - List sessions
- `POST /sessions` - Create session
- `GET /sessions/:id` - Get session details
- `PUT /sessions/:id` - Update session
- `DELETE /sessions/:id` - Delete session

### Exercises

- `GET /exercises` - List exercises
- `POST /exercises` - Create exercise
- `GET /exercises/:id` - Get exercise details
- `PUT /exercises/:id` - Update exercise
- `DELETE /exercises/:id` - Delete exercise

### Templates

- `GET /templates` - List templates
- `POST /templates` - Create template
- `GET /templates/:id` - Get template details
- `PUT /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template

### Trainees

- `GET /trainees` - List trainees
- `POST /trainees` - Add trainee relationship
- `DELETE /trainees/:id` - Remove trainee relationship

## Deployment

### Docker

```bash
docker build -t meamen .
docker run -p 3000:3000 meamen
```

### Fly.io

```bash
fly deploy
```

### Render.com

#### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/helmanofer/meamen)

This uses the `render.yaml` Blueprint to automatically provision a web service and PostgreSQL database.

#### Manual Setup

1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set **Runtime** to **Docker**
4. Add a **PostgreSQL** database and link it (provides `DATABASE_URL` automatically)
5. Set environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `8080`
   - `HOSTNAME` = `0.0.0.0` (required — Render overrides `HOSTNAME` with the container name)
   - `JWT_SECRET` = (generate a secure random string)
6. Set **Health Check Path** to: `/api/health`
7. After the first deploy, push the schema and seed the database using the **external** connection string from the Render dashboard:

```bash
DATABASE_URL=<external-connection-string> bunx prisma db push --schema prisma/schema.prisma --skip-generate
DATABASE_URL=<external-connection-string> bunx prisma generate --schema prisma/schema.prisma && DATABASE_URL=<external-connection-string> bun run prisma/seed.ts
```

> **Note:** Pre-deploy commands require a paid Render plan. On the free tier, run the above commands manually after each schema change.

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/meamen
JWT_SECRET=your-jwt-secret
```

## License

Private project.
