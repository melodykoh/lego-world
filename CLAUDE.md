# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Aiden's Lego World** is a mobile-responsive React web application for showcasing Lego creation photos. The app uses a hybrid architecture with client-side functionality and cloud-based storage:

- **Frontend**: React 18 with modern CSS and mobile-first design
- **Database**: Supabase (PostgreSQL) for creation metadata and user management
- **Image Storage**: Cloudinary for photo hosting and optimization
- **Authentication**: Supabase Auth with admin-only access model

## Common Development Commands

- **Start development server**: `npm start`
- **Build for production**: `npm build`
- **Run tests**: `npm test`
- **Install dependencies**: `npm install`

## Architecture & Key Components

### Database Schema (Supabase)
The application uses two main tables defined in `database-setup.sql`:
- `creations`: Stores creation metadata (id, name, date_added, user_id)
- `photos`: Stores photo metadata linked to creations (url, public_id, name, dimensions)

Row Level Security (RLS) is enabled with policies for public read access and authenticated write access.

### Authentication System
- **Admin-only access**: Single admin user defined by email in `src/contexts/AuthContext.js:104`
- **Current admin email**: `melodykoh0818@gmail.com`
- **Auth context**: Provides authentication state, sign-in/up functions, and admin status
- **Access control**: Unauthenticated users can view content, only authenticated admin can create/edit/delete

### Image Upload & Storage Flow
1. **Local Upload**: Images selected via `PhotoUpload` component
2. **Cloudinary Upload**: Images uploaded to Cloudinary with metadata tags
3. **Database Storage**: Creation and photo metadata saved to Supabase
4. **Sync Management**: Handled by `cloudinaryUtils.js` with status updates

### Key Components Architecture
- **App.js**: Main application state and routing logic
- **AuthContext**: Global authentication state management
- **Home**: Dashboard with recent creations and statistics
- **PhotoGallery**: Grid view of all creations
- **CreationView**: Individual creation detail view with image carousel
- **PhotoUpload**: Multi-photo upload interface
- **Login**: Admin authentication interface

### Data Flow
1. **Initialization**: App loads from database via `fetchCreationsFromDatabase()`
2. **Upload**: Photos → Cloudinary → Database → App state update
3. **Sync**: Database and Cloudinary kept in sync via utility functions
4. **Fallback**: Local storage used as backup when cloud services unavailable

### Environment Configuration
Required environment variables:
- `REACT_APP_SUPABASE_URL`: Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous key
- `REACT_APP_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `REACT_APP_CLOUDINARY_UPLOAD_PRESET`: Cloudinary upload preset
- `REACT_APP_CLOUDINARY_API_KEY`: Cloudinary API key (for search)
- `REACT_APP_CLOUDINARY_API_SECRET`: Cloudinary API secret (for search)

### Database Setup
Run the SQL scripts in this order:
1. `database-setup.sql`: Creates tables, indexes, and policies
2. `database-migration.sql`: Any schema migrations
3. `database-fix.sql`: Bug fixes or updates

### API Integration
- **Cloudinary API**: Handles image uploads and metadata
- **Supabase API**: Manages database operations and authentication
- **Vercel Function**: `api/cloudinary-search.js` proxies Cloudinary search requests

### Mobile-First Design
- Responsive layout optimized for mobile devices
- Touch-friendly interfaces and gestures
- Performance optimization with lazy loading
- CSS Grid and Flexbox for flexible layouts