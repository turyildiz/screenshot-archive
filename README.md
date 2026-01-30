# Screenshot Archive

A NextJS application for archiving and browsing screenshots, deployed to Cloudflare Pages.

## Features

- 📸 Browse all screenshots in a grid layout
- 🏷️ Filter by tags
- 📅 Filter by date range
- 👁️ View screenshot details
- 📊 Statistics dashboard
- ☁️ Cloudflare R2 storage
- 🗄️ Neon PostgreSQL database

## Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Database:** Neon PostgreSQL with Prisma ORM
- **Storage:** Cloudflare R2 (S3-compatible)
- **Styling:** Tailwind CSS
- **Deployment:** Cloudflare Pages

## Prerequisites

1. Node.js 18+ installed
2. A Cloudflare account with R2 enabled
3. A Neon PostgreSQL account

## Setup

### 1. Clone and Install Dependencies

```bash
cd screenshot-archive
npm install
```

### 2. Set Up Neon Database

1. Go to [Neon](https://neon.tech) and create a new project
2. In the project dashboard, get your connection string
3. The format is: `postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/database?sslmode=require`

### 3. Set Up Cloudflare R2

1. Go to Cloudflare Dashboard → R2
2. Create a new bucket named `screenshots` (or your preferred name)
3. Create an R2 API token with read/write permissions
4. Note your:
   - Account ID (from R2 settings)
   - Access Key ID
   - Secret Access Key
   - Bucket name

### 4. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/screenshot-archive?sslmode=require"

# Cloudflare R2
R2_ENDPOINT="https://<accountId>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="screenshots"

# App URL
NEXT_PUBLIC_APP_URL="https://your-project.pages.dev"
```

### 5. Initialize the Database

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
```

### 6. Run Locally (Optional)

Test the application locally:

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app.

## Deployment to Cloudflare Pages

### Option 1: Using Wrangler CLI

1. Install Wrangler:

```bash
npm install -g wrangler
```

2. Login to Cloudflare:

```bash
wrangler login
```

3. Deploy:

```bash
npx wrangler pages deploy .vercel/output/static --project-name=screenshot-archive
```

Or use the deployment command:

```bash
npm run build
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static --project-name=screenshot-archive
```

### Option 2: Using GitHub Integration

1. Push your code to a GitHub repository
2. Go to Cloudflare Dashboard → Pages → Connect to Git
3. Select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `.vercel/output/static`
5. Click "Deploy site"

### Option 3: Using Cloudflare Dashboard

1. Build the project:

```bash
npm run build
npx @cloudflare/next-on-pages
```

2. Go to Cloudflare Dashboard → Pages → Create a project
3. Select "Direct upload"
4. Upload the `.vercel/output/static` folder
5. Configure environment variables in the Pages dashboard

## API Endpoints

### List Screenshots

```
GET /api/screenshots
```

Query Parameters:
- `tag` - Filter by tag
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Get Single Screenshot

```
GET /api/screenshots/:id
```

### Upload Screenshot

```
POST /api/screenshots
```

Content-Type: `multipart/form-data`

Body:
- `file` - The image file
- `tags` - Comma-separated tags (optional)

### List All Tags

```
GET /api/tags
```

### Get Statistics

```
GET /api/stats
```

## Integration with OpenClaw

To upload screenshots from OpenClaw, use:

```bash
curl -X POST https://your-project.pages.dev/api/screenshots \
  -F "file=@screenshot.png" \
  -F "tags=tag1,tag2"
```

## Project Structure

```
screenshot-archive/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── screenshots/   # API routes
│   │   │   ├── tags/          # Tags endpoint
│   │   │   └── stats/         # Stats endpoint
│   │   ├── screenshots/       # Detail page
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx           # Main gallery
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   └── r2.ts              # R2 utilities
├── .env.example
├── wrangler.toml
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

## Troubleshooting

### Database Connection Issues

- Ensure your Neon database allows connections from Cloudflare IPs
- Check that `sslmode=require` is in your connection string

### R2 Access Issues

- Verify your R2 credentials are correct
- Ensure the bucket name matches exactly
- Check that CORS is configured on your R2 bucket

### Build Failures

- Ensure Node.js version is 18+
- Run `npx prisma generate` before building
- Check that all environment variables are set

## License

MIT
