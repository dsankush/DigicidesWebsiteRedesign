# Digicides - Rural Marketing & AgriTech Platform

<p align="center">
  <img src="public/Logo.png" alt="Digicides Logo" width="200"/>
</p>

A modern web application for **Digicides**, an agriculture marketing and rural engagement platform. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🌾 About Digicides

Digicides is a rural marketing and AgriTech solutions company that helps brands connect with farmers across India. The platform offers:

- **Farmer Engagement Solutions** - Audio conferencing, WhatsApp communities, and mass communication tools
- **Rural Rewards Programs** - Loyalty and reward systems for rural audiences
- **Market Research** - Insights and analytics for agri-brands
- **Performance Marketing** - Targeted campaigns for rural markets
- **Analytics & Reporting** - Data-driven insights for campaign optimization

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Supabase** | PostgreSQL database & authentication |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Icon library |
| **Embla Carousel** | Touch-friendly carousels |
| **Resend** | Transactional emails |

## 📁 Project Structure

```
digicides/
├── public/                          # Static assets
│   ├── analytics/                   # Analytics page images
│   ├── engagement/                  # Engagement page images
│   ├── images/                      # General images
│   ├── market-research/             # Market research images
│   ├── missed-call-solution/        # Missed call solution assets
│   ├── performance-marketing/       # Performance marketing images
│   ├── rural-reward/                # Rural reward images
│   ├── slider/                      # Customer logo slider images
│   ├── team/                        # Team member photos
│   ├── Logo.png                     # Main logo
│   └── favicon.svg                  # Favicon
│
├── scripts/                         # Utility scripts
│   └── setup-supabase.cjs           # Supabase setup script
│
├── data/                            # Static data files
│   └── blogs/
│       └── blogs.json               # Sample blog data
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (landing)/               # Landing page group
│   │   │   ├── _components/         # Landing-specific components
│   │   │   │   └── Hero.tsx
│   │   │   ├── about/
│   │   │   │   └── page.tsx         # About page
│   │   │   ├── blog/
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx     # Individual blog post
│   │   │   │   └── page.tsx         # Blog listing
│   │   │   ├── privacy-policy/
│   │   │   │   └── page.tsx
│   │   │   ├── under-construction/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx           # Landing layout with navbar/footer
│   │   │   └── page.tsx             # Homepage
│   │   │
│   │   ├── api/                     # API Routes
│   │   │   ├── blogs/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts     # GET/PUT/DELETE single blog
│   │   │   │   └── route.ts         # GET all / POST new blog
│   │   │   └── contact-us/
│   │   │       └── route.ts         # Contact form handler
│   │   │
│   │   ├── product/                 # Product pages
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── discover/
│   │   │   │   └── page.tsx
│   │   │   ├── missed-call-solution/
│   │   │   │   └── page.tsx
│   │   │   ├── rural-reward/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── services/                # Services pages
│   │   │   ├── digixblog/           # Blog management system
│   │   │   │   ├── edit/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx # Edit blog
│   │   │   │   ├── manage/
│   │   │   │   │   └── page.tsx     # Blog management dashboard
│   │   │   │   └── page.tsx         # Blog creator
│   │   │   ├── engagement/
│   │   │   │   └── page.tsx
│   │   │   ├── market-research-for-agri-brands/
│   │   │   │   └── page.tsx
│   │   │   ├── performance-marketing-for-agri-brands/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── contact-landing/
│   │   │   └── page.tsx
│   │   ├── layout.tsx               # Root layout
│   │   ├── not-found.tsx            # 404 page
│   │   └── sitemap.xml              # Auto-generated sitemap
│   │
│   ├── components/                  # Reusable components
│   │   ├── analytics/
│   │   │   └── analytics-carousel.tsx
│   │   ├── carousel/
│   │   │   ├── css/
│   │   │   │   └── embla.css
│   │   │   ├── jss/
│   │   │   │   ├── EmblaCarousel.tsx
│   │   │   │   ├── EmblaCarouselArrowButtons.tsx
│   │   │   │   └── EmblaCarouselDotButton.tsx
│   │   │   ├── card.tsx
│   │   │   └── page.tsx
│   │   ├── landing/
│   │   │   ├── contact-us.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── how-do-we-do.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── our-customers.tsx
│   │   │   ├── what-do-we-do.tsx
│   │   │   ├── what-our-customer-tell.tsx
│   │   │   └── why-choose-us.tsx
│   │   ├── layouts/
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── market-research/
│   │   │   ├── hero.tsx
│   │   │   ├── market-card.tsx
│   │   │   └── why-choose.tsx
│   │   ├── missed-call-solution/
│   │   │   ├── missed-call-solution-carousel.tsx
│   │   │   └── speed-video.tsx
│   │   ├── rural-reward/
│   │   │   └── rural-reward-carousel.tsx
│   │   ├── ui/                      # UI primitives (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── ...
│   │   ├── meet-our-team.tsx
│   │   └── shell.tsx
│   │
│   ├── lib/                         # Utility functions
│   │   ├── blog-storage.ts          # Blog CRUD operations
│   │   └── utils.ts                 # General utilities
│   │
│   ├── styles/
│   │   └── globals.css              # Global styles & Tailwind
│   │
│   └── types/                       # TypeScript types
│       ├── blog.ts                  # Blog interfaces
│       └── global.d.ts              # Global type declarations
│
├── .env.example                     # Environment variables template
├── .env.local                       # Local environment (gitignored)
├── .eslintrc.cjs                    # ESLint configuration
├── .gitignore                       # Git ignore rules
├── components.json                  # shadcn/ui configuration
├── next.config.js                   # Next.js configuration
├── package.json                     # Dependencies & scripts
├── postcss.config.js                # PostCSS configuration
├── prettier.config.js               # Prettier configuration
├── supabase-setup.sql               # SQL for Supabase table setup
├── tailwind.config.ts               # Tailwind configuration
└── tsconfig.json                    # TypeScript configuration
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digicides
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   RESEND_API_KEY=your-resend-api-key
   ```

4. **Set up Supabase database**
   
   Run this SQL in your Supabase SQL Editor:
   ```sql
   CREATE TABLE IF NOT EXISTS blogs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     subtitle TEXT DEFAULT '',
     slug TEXT NOT NULL UNIQUE,
     content TEXT DEFAULT '',
     author TEXT DEFAULT '',
     category TEXT DEFAULT '',
     tags TEXT[] DEFAULT '{}',
     thumbnail TEXT,
     meta_title TEXT DEFAULT '',
     meta_description TEXT DEFAULT '',
     status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
     word_count INTEGER DEFAULT 0,
     reading_time INTEGER DEFAULT 1,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow public read" ON blogs FOR SELECT USING (true);
   CREATE POLICY "Allow all for service role" ON blogs FOR ALL USING (true);
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run format:write` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## 📝 Blog Management System (DigiXBlog)

The platform includes a full-featured blog management system:

### Features
- ✏️ **Rich Text Editor** - Bold, italic, headings, lists, quotes, code blocks
- 🎨 **Text Formatting** - Custom fonts, sizes, colors, highlights
- 😀 **Emoji Support** - Built-in emoji picker with categories
- 🎥 **Media Embedding** - Images and YouTube/video embedding
- 📊 **Auto Statistics** - Word count and reading time calculation
- 🔍 **SEO Settings** - Meta titles, descriptions, and custom slugs
- 📤 **Export Options** - PDF and JSON export
- 👁️ **Preview Mode** - Real-time content preview

### Blog Routes
| Route | Description |
|-------|-------------|
| `/services/digixblog` | Create new blog post |
| `/services/digixblog/manage` | Manage all blog posts |
| `/services/digixblog/edit/[id]` | Edit existing blog post |
| `/blog` | Public blog listing |
| `/blog/[slug]` | Individual blog post |

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
4. Deploy!

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Docker

## 🎨 Theming

The app uses a custom color scheme:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#E07B00` | Brand orange - CTAs, accents |
| Background | `#FEF4E8` | Warm cream background |
| Foreground | `#1a1a1a` | Text color |

Theme configuration is in `tailwind.config.ts`.

## 📱 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with hero, services, testimonials |
| About | `/about` | Company information and team |
| Products | `/product/*` | Product pages (Analytics, Rural Reward, etc.) |
| Services | `/services/*` | Service pages (Engagement, Marketing, etc.) |
| Blog | `/blog` | Public blog listing |
| Contact | `/#contact-us` | Contact form section |
| Privacy | `/privacy-policy` | Privacy policy |

## 🔒 Security

- Environment variables are gitignored
- Supabase Row Level Security (RLS) enabled
- Service role key only used server-side
- Input validation with Zod

## 📄 License

This project is private and proprietary to Digicides.

## 👥 Team

Built with ❤️ by the Digicides team.

---

<p align="center">
  <strong>Digicides</strong> - Connecting Brands with Rural India
</p>
