# Kamana Ordering - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Then fill in the values from Vercel Dashboard:

#### Get Postgres Connection Strings
1. Go to **Vercel Dashboard** → Your Project → **Storage**
2. Click on your **Neon Database**
3. Go to **.env.local** tab
4. Copy these variables to your `.env` file:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `DATABASE_URL` (use same value as `POSTGRES_PRISMA_URL`)

#### Get Redis (KV) Connection Strings
1. Go to **Vercel Dashboard** → Your Project → **Storage**
2. Click on your **KV Database**
3. Go to **.env.local** tab
4. Copy these variables to your `.env` file:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 3. Generate Prisma Client
```bash
npm run prisma:generate
```

### 4. Run Database Migration
```bash
npm run prisma:migrate
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Database

This project uses:
- **PostgreSQL** (via Neon) for product data
- **Prisma** as ORM
- **Redis** (via Vercel KV) for caching (optional)

### Prisma Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Vercel will automatically:
   - Detect Next.js
   - Run `npm run build` (which includes `prisma generate`)
   - Deploy your app

### Environment Variables in Vercel

All environment variables are automatically added when you connect databases in Vercel Storage.

## 📝 Project Structure

```
├── pages/
│   ├── api/
│   │   ├── products.ts          # Public products API
│   │   └── admin/
│   │       └── products.ts      # Admin products API
│   ├── index.tsx                # Homepage
│   └── admin/
│       └── products.tsx         # Admin panel
├── lib/
│   ├── db.ts                    # Database functions (Prisma)
│   ├── prisma.ts                # Prisma client
│   └── products.ts              # Default products data
├── prisma/
│   └── schema.prisma            # Database schema
└── .env                         # Environment variables (local)
```

## 🔧 Troubleshooting

### Prisma Client Not Found
```bash
npm run prisma:generate
```

### Database Connection Error
- Check your `.env` file has correct connection strings
- Verify database is running in Vercel Dashboard

### Migration Failed
- Ensure `DATABASE_URL` is set correctly
- Try resetting database: `npx prisma migrate reset`

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
