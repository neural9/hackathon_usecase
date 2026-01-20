# Project Overview

This is a Next.js application.

## Tech Stack

- Next.js
- React
- TypeScript

## Getting Started

```bash
pnpm install
pnpm dev
```

## Project Structure

- `app/` - Next.js app router pages and layouts
- `lib/` - Utility functions and shared code
- `public/` - Static assets

## Development Guidelines

- Follow existing code patterns and conventions
- Use TypeScript for type safety
- Keep components small and focused
- Use shadcn/ui exclusively for UI components

## Authentication (Clerk)

This project uses Clerk for authentication. Follow these rules:

### Required Setup

1. **Middleware**: Use `clerkMiddleware()` from `@clerk/nextjs/server` in `middleware.ts`
2. **Layout**: Wrap the app with `<ClerkProvider>` in `app/layout.tsx`
3. **Components**: Use Clerk components (`<SignInButton>`, `<SignUpButton>`, `<UserButton>`, `<SignedIn>`, `<SignedOut>`) from `@clerk/nextjs`
4. **Server Functions**: Import `auth()` from `@clerk/nextjs/server` and use with `async/await`

### Environment Variables

Store keys in `.env.local` only:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

### Do NOT

- Use deprecated `authMiddleware()` - use `clerkMiddleware()` instead
- Reference pages router patterns (`_app.tsx`, `pages/`)
- Hardcode real API keys in code files
