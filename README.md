# Digicides - Agri-Marketing Solutions

A modern Next.js web application for Digicides, offering end-to-end marketing solutions for agricultural brands in rural India.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## 📁 Project Structure

```
/workspace
├── public/
│   ├── images/             # Static images
│   ├── slider/             # Slider images
│   └── ...                 # Other static assets
├── src/
│   ├── app/
│   │   ├── (landing)/      # Public landing pages
│   │   │   ├── blog/       # Blog listing & individual posts
│   │   │   ├── about/
│   │   │   ├── contact-landing/
│   │   │   └── ...
│   │   ├── api/            # API routes
│   │   │   ├── blogs/      # Blog CRUD operations
│   │   │   ├── admin/      # Admin auth & management
│   │   │   └── contact-us/
│   │   ├── product/        # Product pages
│   │   └── services/       # Service pages
│   │       └── digixblog/  # Blog management system
│   │           ├── page.tsx           # Blog creator
│   │           ├── manage/            # Blog list & management
│   │           ├── edit/[id]/         # Edit blog
│   │           ├── comments/          # Comments moderation
│   │           └── login/             # Admin login
│   ├── components/         # Reusable components
│   ├── lib/                # Utility functions
│   │   └── blog-storage.ts # Blog API client
│   └── types/              # TypeScript types
│       └── blog.ts         # Blog-related types
├── supabase-setup.sql      # Database setup script
├── .env.local              # Environment variables
└── .env.example            # Environment template
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd workspace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up Supabase database:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase-setup.sql`

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Access the app:**
   - Website: http://localhost:3000
   - Admin login: http://localhost:3000/services/digixblog/login

### Default Admin Credentials

```
Email: admin@digicides.com
Password: Digicides@123
```

## 📝 Blog Management System

### Features

- **Blog CRUD:** Create, read, update, delete blogs
- **Rich Text Editor:** Full-featured editor with:
  - Text formatting (bold, italic, underline, strikethrough)
  - Headings (H1, H2, H3)
  - Lists (bullet, numbered)
  - Links and images
  - Video embeds (YouTube, direct video)
  - Emojis
  - Font styles and colors
  - Code blocks and quotes
- **Draft/Publish:** Save as draft or publish immediately
- **Likes System:** One like per user (tracked by browser fingerprint)
- **Comments System:** 
  - Users can comment on blogs
  - Comments require admin approval
  - Admin can approve, reject, or delete comments
- **SEO:** Custom meta titles, descriptions, and URL slugs
- **Export:** Export blogs as PDF or JSON

### Routes

| Route | Description |
|-------|-------------|
| `/blog` | Public blog listing |
| `/blog/[slug]` | Individual blog post |
| `/services/digixblog` | Blog creator |
| `/services/digixblog/manage` | Blog management dashboard |
| `/services/digixblog/edit/[id]` | Edit existing blog |
| `/services/digixblog/comments` | Comment moderation |
| `/services/digixblog/login` | Admin login |

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/blogs` | GET | Fetch all blogs |
| `/api/blogs` | POST | Create new blog |
| `/api/blogs/[id]` | GET | Fetch single blog |
| `/api/blogs/[id]` | PUT | Update blog |
| `/api/blogs/[id]` | DELETE | Delete blog |
| `/api/blogs/[id]/like` | GET | Check like status |
| `/api/blogs/[id]/like` | POST | Toggle like |
| `/api/blogs/[id]/comments` | GET | Fetch comments |
| `/api/blogs/[id]/comments` | POST | Submit comment |
| `/api/admin/login` | POST | Admin login |
| `/api/admin/logout` | POST | Admin logout |
| `/api/admin/session` | GET | Check auth status |
| `/api/admin/comments` | GET | Fetch all comments (admin) |
| `/api/admin/comments/[id]` | PUT | Approve/reject comment |
| `/api/admin/comments/[id]` | DELETE | Delete comment |

## 🗄️ Database Schema

### Tables

- **blogs**: Blog posts with title, content, status, etc.
- **blog_likes**: Like records (one per user per blog)
- **blog_comments**: Comments with approval status
- **admins**: Admin users
- **admin_sessions**: Login sessions

See `supabase-setup.sql` for complete schema.

## 🌐 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `RESEND_API_KEY` | Optional: For contact form emails |

## 🎨 Theming

The app uses a custom theme with:
- Primary color: Orange (#E07B00)
- Background: Cream (#FEF4E8)
- Consistent branding throughout

## 📄 Pages Overview

- **Home** (`/`): Landing page with services overview
- **About** (`/about`): Company information
- **Products**: Analytics, Engagement, Rewards, etc.
- **Services**: Performance marketing, Market research, etc.
- **Blog**: Articles and insights

## 🔒 Security

- Admin routes are protected with session-based authentication
- Service role key is only used server-side
- Row Level Security (RLS) enabled in Supabase
- CSRF protection via HTTP-only cookies

## 📧 Contact

For questions or support, visit [digicides.com](https://digicides.com)

---

© 2024 Digicides. All rights reserved.
