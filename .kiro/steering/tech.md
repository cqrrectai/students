# Technology Stack

## Framework & Runtime
- **Next.js 15.2.4** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Node.js** - Runtime environment

## Styling & UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Headless UI components for accessibility
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Class Variance Authority (CVA)** - Component variant management
- **Tailwind Merge & CLSX** - Conditional class utilities

## Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL database, auth, real-time)
- **Supabase Auth Helpers** - Next.js authentication integration
- **MCP Supabase Server** - Model Context Protocol integration

## AI & External Services
- **AI SDK with Groq** - AI model integration
- **Vercel AI SDK** - AI application framework

## Form Handling & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Hookform Resolvers** - Form validation integration

## Development Tools
- **ESLint** - Code linting
- **PostCSS & Autoprefixer** - CSS processing
- **Sharp** - Image optimization
- **Bundle Analyzer** - Build analysis

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run analyze      # Analyze bundle size
```

### Package Management
- Uses **npm** as primary package manager
- **pnpm-lock.yaml** present indicates pnpm compatibility

## Configuration Notes
- **TypeScript**: Strict mode enabled, path aliases configured (`@/*`)
- **Next.js**: ESLint and TypeScript errors ignored during builds for faster development
- **Images**: Optimized with AVIF/WebP formats, caching enabled
- **Security**: CSP headers, powered-by header disabled