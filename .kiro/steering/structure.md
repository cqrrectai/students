# Project Structure

## Root Directory Organization

### Core Application
- **`app/`** - Next.js App Router pages and layouts
- **`components/`** - Reusable React components
- **`lib/`** - Utility functions, contexts, and services
- **`hooks/`** - Custom React hooks
- **`public/`** - Static assets (images, manifest, etc.)
- **`styles/`** - Global CSS files

### Configuration
- **`.kiro/`** - Kiro IDE configuration and steering rules
- **`.next/`** - Next.js build output (auto-generated)
- **`.vscode/`** - VS Code workspace settings
- **`node_modules/`** - Dependencies (auto-generated)

## App Directory Structure (Next.js App Router)

```
app/
├── layout.tsx          # Root layout with providers
├── page.tsx           # Homepage
├── loading.tsx        # Global loading UI
├── globals.css        # Global styles
├── about/             # About page
├── admin/             # Admin dashboard
├── admin-login/       # Admin authentication
├── api/               # API routes
├── auth/              # Authentication pages
├── contact/           # Contact page
├── courses/           # Course management
├── cqrrect-ai/        # AI assistant interface
├── dashboard/         # User dashboard
├── exam/              # Individual exam pages
├── exams/             # Exam listing
├── login/             # User login
├── pricing/           # Pricing page
├── privacy/           # Privacy policy
└── terms/             # Terms of service
```

## Components Organization

```
components/
├── ui/                # Shadcn/ui components (buttons, cards, etc.)
├── admin/             # Admin-specific components
├── auth/              # Authentication components
├── proctoring/        # Exam proctoring components
├── public-layout.tsx  # Public pages layout
├── theme-provider.tsx # Theme context provider
└── [feature].tsx      # Feature-specific components
```

## Library Structure

```
lib/
├── auth-context.tsx       # Authentication state management
├── global-data-context.tsx # Global app state
├── database-service.ts    # Database operations
├── database.types.ts      # TypeScript database types
├── email-service.ts       # Email functionality
├── subscription-utils.ts  # Subscription logic
├── supabase.ts           # Supabase client configuration
└── utils.ts              # General utilities (cn function)
```

## Naming Conventions

### Files & Directories
- **kebab-case** for directories (`admin-login`, `cqrrect-ai`)
- **kebab-case** for component files (`public-layout.tsx`)
- **camelCase** for utility files (`authContext.tsx`)
- **PascalCase** for component names in code

### Components
- Use **PascalCase** for component names
- Prefer functional components with hooks
- Export components as named exports when possible

### Styling
- Use **Tailwind CSS** classes exclusively
- Custom CSS variables for theme colors (HSL format)
- Component variants managed with CVA

## Import Patterns

### Path Aliases
- Use `@/` for root-level imports
- Example: `import { Button } from "@/components/ui/button"`

### Import Order
1. React/Next.js imports
2. Third-party libraries
3. Internal components (`@/components`)
4. Internal utilities (`@/lib`, `@/hooks`)
5. Relative imports

## File Conventions

### Page Files
- `page.tsx` - Route component
- `layout.tsx` - Layout wrapper
- `loading.tsx` - Loading UI
- `error.tsx` - Error boundary

### Component Files
- Single component per file
- Include TypeScript interfaces in same file
- Use `"use client"` directive for client components