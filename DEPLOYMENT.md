# FemRes Deployment Guide | 部署指南

Vercel + Neon Postgres deployment guide.

## Prerequisites

- Node.js 18+
- Vercel account
- Neon account

## Setup

```bash
npm install
```

## Database Setup (Neon)

1. Create database at [neon.tech](https://neon.tech)
2. Run schema from `sql/schema.sql`
3. Copy connection string

## Environment Variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

## Deploy to Vercel

```bash
# Link project
vercel

# Deploy
vercel --prod
```

## Local Development

```bash
npm run dev
```

Visit `http://localhost:4321`
