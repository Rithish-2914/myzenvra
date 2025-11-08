# MyZenvra E-commerce Platform

## Overview

MyZenvra is a luxury Gen-Z streetwear e-commerce platform built by VIT students. The platform combines "Old Money" aesthetics with modern streetwear, offering customizable apparel and gifts. The application features a React/TypeScript frontend with Firebase authentication, a serverless Express backend deployed on Vercel, and Supabase for database and storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **Routing**: Wouter for client-side routing with SPA architecture
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: 
  - React Context API for global state (Auth, Cart)
  - TanStack Query (React Query) for server state and caching
- **Styling System**: 
  - Tailwind CSS with custom design tokens
  - Theme variables for light/dark mode support
  - Custom color palette (beige, gold accents, neutral dark)
  - Typography hierarchy using Inter (sans-serif) and Playfair Display (serif)
- **Animation**: Framer Motion for smooth transitions and interactive elements
- **Form Handling**: React Hook Form with Zod validation

**Design Philosophy**: Reference-based design drawing from luxury e-commerce (H&M elegance) combined with Gen-Z platforms (Instagram/Pinterest aesthetic) to create "Old Money meets Streetwear" brand identity.

### Backend Architecture
- **Deployment**: Vercel serverless functions (consolidated into single Express handler at `/api/index.ts` to work within Hobby plan's 12-function limit)
- **Server Framework**: Express.js handling all API routes
- **Authentication Strategy**:
  - **Frontend**: Firebase Authentication (Email/Password + Google Sign-in)
  - **Backend**: JWT-based authentication with HTTP-only cookies for admin sessions
  - Token verification via Firebase Admin SDK
  - Role-based access control (admin role in users table)
- **API Structure**: RESTful endpoints organized by resource type
  - Categories, Products, Orders, Customizations
  - Cart, Wishlist, Reviews
  - Admin operations (orders, messages, user management)
  - Contact/bulk order inquiries
- **File Upload**: Multer with in-memory storage for image processing before Supabase upload
- **Validation**: Zod schemas shared between client and server (`shared/schema.ts`)

### Database Architecture
- **Primary Database**: Supabase (PostgreSQL)
- **Schema Organization**: Centralized in `shared/schema.ts` with Zod validation
- **Key Tables**:
  - `categories` - Product categorization
  - `products` - Core product catalog with customization flags, gift types, stock management
  - `orders` - Customer orders with JSON shipping addresses and line items
  - `order_events` - Order status history/timeline tracking
  - `customizations` - Custom product requests with user uploads
  - `cart_items` - Shopping cart supporting both guest (session_id) and authenticated users (user_id)
  - `wishlist_items` - User wishlists
  - `product_reviews` - Product ratings and reviews
  - `contact_inquiries` - Customer messages
  - `bulk_orders` - Bulk order requests for colleges/offices
  - `users` - Firebase-synced user profiles with role-based permissions
  - `admin_users` - Legacy admin authentication (being phased out in favor of users table)
  - `user_activity` - Analytics/activity tracking

**Database Strategy**: User-centric design with guest support (cart uses session_id OR user_id), Firebase UID as primary user identifier, Supabase RLS (Row Level Security) ready but using service role key for admin operations.

### Storage Architecture
- **Provider**: Supabase Storage
- **Buckets**: Organized for product images, custom uploads, and user-generated content
- **Upload Flow**: Client uploads through backend proxy to maintain security and validation

## External Dependencies

### Authentication & User Management
- **Firebase Authentication**: Primary user authentication system
  - Email/Password authentication
  - Google OAuth sign-in
  - Firebase Admin SDK for server-side token verification
  - Required environment variables: `VITE_FIREBASE_*` for client, `FIREBASE_SERVICE_ACCOUNT` for server

### Database & Storage
- **Supabase**: PostgreSQL database and file storage
  - Client SDK for public operations (anon key)
  - Admin SDK for privileged operations (service role key)
  - Required environment variables:
    - `SUPABASE_URL`
    - `SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`

### Deployment Platform
- **Vercel**: Serverless function hosting and static site deployment
  - Single consolidated API function (`/api/index.ts`) to stay within free tier limits
  - Environment variables configured in Vercel dashboard
  - Custom routing configuration in `vercel.json`:
    - API routes (`/api/*`) → serverless function
    - All other routes → SPA (`/index.html`)
  - CORS headers configured for cross-origin API requests

### Third-Party Libraries
- **UI Components**: Radix UI primitives (@radix-ui/*)
- **Form Management**: React Hook Form + Hookform Resolvers
- **Validation**: Zod for runtime type validation
- **HTTP Client**: Native Fetch API with TanStack Query wrapper
- **Password Hashing**: bcryptjs for admin credentials
- **JWT**: jsonwebtoken for admin session tokens
- **CSS Framework**: Tailwind CSS with custom configuration
- **Icons**: Lucide React

### Development Tools
- **Build Tool**: Vite
- **Type Checking**: TypeScript with strict mode
- **Package Manager**: npm
- **Database Migrations**: Drizzle Kit (configured but using Supabase migrations)

### Security Configuration
- **JWT Secret**: Required environment variable `JWT_SECRET` for admin token signing (no fallback - deployment will fail without it)
- **CORS**: Configured to allow credentials and specific headers
- **Cookies**: HTTP-only, secure in production, SameSite=Lax
- **Authentication**: Multi-layer (Firebase for users, JWT for admin, role-based for elevated permissions)