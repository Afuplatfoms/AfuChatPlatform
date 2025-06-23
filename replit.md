# AfuChat - Social Media Platform

## Overview

AfuChat is a comprehensive social media platform built with a modern full-stack architecture. It's a Twitter/Instagram-like application that combines social networking features with e-commerce capabilities, real-time messaging, and a digital wallet system. The platform supports posts, stories, direct messaging, user profiles, and a marketplace for digital products.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session management
- **Real-time Communication**: WebSocket server for live messaging
- **Password Security**: Node.js crypto module with scrypt hashing

### Database & ORM
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Schema**: Comprehensive social media schema with relationships
- **Session Store**: PostgreSQL-based session storage

## Key Components

### Authentication System
- Session-based authentication using Passport.js
- Secure password hashing with scrypt and salt
- Protected routes with authentication middleware
- User registration and login with form validation

### Social Media Features
- **Posts**: Create, read, like, and comment on posts
- **Stories**: Temporary content with 24-hour expiration
- **User Profiles**: Customizable profiles with avatars and bio
- **Following System**: Follow/unfollow users with relationship tracking
- **Feed Algorithm**: Personalized content feed based on following

### Real-time Communication
- WebSocket-based messaging system
- Direct message conversations
- Real-time notifications
- Connection management with authentication

### Digital Wallet System
- User wallet with balance tracking
- Transaction history
- Deposit/withdrawal functionality
- Premium subscription management

### E-commerce Integration
- Product marketplace
- Digital product sales
- Transaction processing
- Seller/buyer interactions

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Passport.js validates against database
3. Session created and stored in PostgreSQL
4. Protected routes verify session before access
5. Frontend receives user data via authenticated API calls

### Content Creation Flow
1. User creates post/story through React forms
2. Form data validated and sent to Express API
3. Drizzle ORM inserts data into PostgreSQL
4. Real-time updates sent via WebSocket
5. UI updates reflect changes immediately

### Messaging Flow
1. WebSocket connection established on login
2. Messages sent through WebSocket for real-time delivery
3. Messages persisted to database via API
4. Conversation history loaded from database
5. Offline message delivery handled on reconnection

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless
- **Authentication**: Passport.js ecosystem
- **UI Library**: Radix UI + Tailwind CSS
- **Real-time**: Native WebSocket implementation
- **Forms**: React Hook Form with Zod validation

### Development Tools
- **TypeScript**: Full type safety across stack
- **Vite**: Development server and build tool
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Server-side bundling for production

## Deployment Strategy

### Development Environment
- Replit-based development with hot reloading
- Vite dev server for frontend
- tsx for TypeScript execution
- PostgreSQL module configured in Replit

### Production Build
- Frontend: Vite build to static assets
- Backend: ESBuild bundle for Node.js deployment
- Database: Drizzle migrations applied automatically
- Session storage: PostgreSQL-backed sessions

### Deployment Options
- **Railway**: Full-stack deployment with automatic builds
- **Netlify**: Frontend deployment with Netlify functions
- **Docker**: Containerized deployment for any platform
- **Heroku**: Traditional PaaS deployment with Procfile
- **Port**: 5000 (configurable via PORT environment variable)
- **Environment**: Production NODE_ENV
- **Assets**: Served from dist/public directory

### Deployment Files Created
- `railway.json`: Railway deployment configuration
- `netlify.toml`: Netlify build and redirect configuration
- `Dockerfile`: Container deployment setup
- `Procfile`: Heroku deployment configuration
- `.gitignore`: Git ignore patterns for deployment
- `README.md`: Comprehensive deployment documentation

## Changelog

Changelog:
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.