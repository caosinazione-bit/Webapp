# Overview

This is a fully functional YouTube SEO analyzer application that helps content creators optimize their videos for better discoverability. The app analyzes YouTube videos from simple URLs and generates professional SEO-optimized content in Italian including titles, descriptions, hashtags, tags (500 characters), thumbnail tips, and optimization recommendations using Google AI Studio (Gemini API). Built with a full-stack TypeScript architecture using React frontend and Express backend.

**Status**: ✅ COMPLETED AND WORKING (August 20, 2025)
- YouTube Data API v3 integration working
- Google Gemini AI generating SEO content in Italian  
- Complete user interface with Italian localization
- Full SEO package: optimized titles, descriptions with hashtags, 500-character tags, thumbnail tips, video optimization advice

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture  
- **Framework**: Express.js with TypeScript for REST API endpoints
- **Development**: tsx for TypeScript execution in development, esbuild for production bundling
- **Data Storage**: In-memory storage with interface for future database integration (prepared for PostgreSQL with Drizzle ORM)
- **API Integration**: YouTube Data API v3 for video metadata and Google Gemini AI for SEO content generation
- **Middleware**: Custom logging, JSON parsing, error handling

## Data Storage Design
- **Current**: Memory-based storage using Map for development and testing
- **Prepared**: Drizzle ORM schema defined for PostgreSQL with video analysis table
- **Schema**: Video analyses stored with metadata, SEO results, and timestamps
- **Migration Ready**: Drizzle configuration set up for database migrations

## Authentication & Security
- **Current**: No authentication implemented (single-user application)
- **API Keys**: Environment-based configuration for YouTube and Gemini APIs
- **CORS**: Basic CORS handling for development
- **Validation**: Zod schemas for request/response validation

# External Dependencies

## Third-Party APIs
- **YouTube Data API v3**: Video metadata extraction (title, description, views, thumbnails, channel info)
- **Google Gemini AI API**: SEO content generation (titles, descriptions, tags, optimization tips)

## Database
- **PostgreSQL**: Configured with Neon Database serverless for production
- **Drizzle ORM**: Type-safe database operations and schema management
- **Connection**: Environment-based DATABASE_URL configuration

## UI Components & Styling
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Inter Font**: Primary typography via Google Fonts

## Development Tools
- **Vite**: Build tool with HMR and optimized bundling
- **TypeScript**: Type safety across frontend, backend, and shared schemas
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations and error handling