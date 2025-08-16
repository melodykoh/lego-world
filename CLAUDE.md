# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Aiden's Lego World** is a comprehensive React web application for showcasing Lego creation photos and videos. The app uses modern cloud architecture with sophisticated media management capabilities:

- **Frontend**: React 18 with mobile-first responsive design
- **Database**: Supabase (PostgreSQL) with Row Level Security for metadata and user management  
- **Media Storage**: Cloudinary for photo/video hosting, optimization, and transformation
- **Authentication**: Supabase Auth with admin-only access model
- **Architecture**: Progressive Web App with offline resilience and cross-device sync

## Recent Major Features (Latest Updates)

### Media Management System
- **Add/Delete Media**: Individual photos/videos can be added to or removed from existing creations
- **Video Support**: Full video upload with iOS-optimized thumbnail generation via Cloudinary
- **Simplified UX**: Centralized management in CreationView with clean edit mode toggle
- **Mobile Optimization**: Touch-friendly interfaces with proper responsive design

### Database Schema Updates
- **Media Type Support**: `photos` table includes `media_type` column ('image' or 'video')
- **CRUD Operations**: `addMediaToCreation()` and `deleteMediaFromCreation()` functions
- **Cache Sync**: Comprehensive localStorage and database synchronization

## Common Development Commands

- **Start development server**: `npm start` (typically runs on port 3002)
- **Build for production**: `npm run build`
- **Run tests**: `npm test`
- **Install dependencies**: `npm install`

## Architecture & Key Components

### Database Schema (Supabase)
**Tables:**
- `creations`: Stores creation metadata (id, name, date_added, user_id)
- `photos`: Stores media metadata (creation_id, url, public_id, name, width, height, media_type)

**Key Functions:**
- `saveCreationToDatabase()`: Creates new creations with associated media
- `addMediaToCreation()`: Adds new media to existing creations
- `deleteMediaFromCreation()`: Removes individual media files
- `updateCreationName()`: Updates creation names
- `deleteCreationFromDatabase()`: Removes entire creations

Row Level Security (RLS) is enabled with policies for public read access and authenticated write access.

### Authentication System
- **Admin-only access**: Single admin user defined by email in `src/contexts/AuthContext.js:104`
- **Current admin email**: `melodykoh0818@gmail.com`
- **Auth context**: Provides authentication state, sign-in/up functions, and admin status
- **Access control**: Unauthenticated users can view content, only authenticated admin can create/edit/delete

### Media Upload & Storage Flow
1. **File Selection**: Multi-file upload with validation (images: 10MB, videos: 50MB)
2. **Image Compression**: Automatic compression for images via `imageUtils.js`
3. **Cloudinary Upload**: Media uploaded with creation metadata and organized in folders
4. **Database Storage**: Creation and media metadata saved to Supabase
5. **Sync Management**: Handled by `cloudinaryUtils.js` with real-time status updates
6. **Cache Sync**: localStorage maintained as backup with database sync

### Key Components Architecture

#### App.js - Main Application
- **State Management**: Manages `legoCreations` array and view state
- **Routing Logic**: Handles navigation between Home, Gallery, Upload, Creation, Login views
- **Function Orchestration**: Coordinates media management operations
- **Props Distribution**: Passes management functions to appropriate components

#### Authentication (AuthContext)
- **Global State**: Authentication state management across app
- **Admin Detection**: Determines admin status based on email
- **Protected Routes**: Controls access to management features

#### Home.js - Dashboard
- **Recent Creations**: Displays 3 most recent uploads
- **Statistics**: Shows total creations, photos, and building timeline
- **Navigation**: Quick access to gallery and upload features

#### PhotoGallery.js - Gallery Views  
- **Clean Interface**: No edit/delete buttons (moved to CreationView)
- **Two View Modes**: "By Creation" grid and "View All" media grid
- **Modal Navigation**: Full-screen photo/video viewing with swipe support
- **Simplified UX**: Pure browsing experience without management clutter

#### CreationView.js - Media Management Hub
- **Edit Mode Toggle**: Side-by-side "Back" and "Edit" buttons
- **Centralized Management**: All creation actions in one location
  - ✏️ Rename creation (inline editing)
  - 🗑️ Delete entire creation
  - 📷 Add more photos/videos
  - ✕ Delete individual media files
- **State Management**: Edit mode doesn't persist between navigation
- **Mobile Optimized**: Touch-friendly controls and responsive design

#### PhotoUpload.js - New Creation Upload
- **Multi-file Support**: Images and videos in single upload
- **File Validation**: Format and size validation with user feedback
- **Progress Tracking**: Real-time upload status and error handling
- **Preview System**: Thumbnail preview with video play overlays

### Data Flow Patterns

#### Creation Management Flow
1. **Gallery Browse**: Clean PhotoGallery without edit controls
2. **Navigation**: Click creation → CreationView with view mode
3. **Edit Mode**: Toggle "Edit" button → Reveals management controls
4. **Actions**: Perform rename/delete/add media/remove media
5. **State Reset**: Edit mode resets when navigating away

#### Media Addition Flow
1. **Edit Mode**: Toggle edit in CreationView
2. **File Selection**: "📷 Add Photos & Videos" button (matching existing UI)
3. **Upload Process**: Cloudinary upload → Database insert → Cache update
4. **State Refresh**: App state updated with new media

#### Video Handling Flow
1. **Upload**: Video files validated and uploaded to Cloudinary
2. **Thumbnail Generation**: Cloudinary video-to-image transformation
3. **iOS Compatibility**: Static image thumbnails instead of video elements
4. **Playback**: Native video controls in modal/full view

### Environment Configuration
Required environment variables:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

### Database Setup
Run SQL scripts in this order:
1. `database-setup.sql`: Creates tables, indexes, and RLS policies
2. `database-video-migration.sql`: Adds media_type column support
3. `database-fix.sql`: Any additional fixes or updates

### CSS Architecture & Styling Patterns

#### Design System
- **Colors**: Primary orange `#ff6b35`, grays `#f8f9fa`, `#e1e5e9`, `#666`
- **Typography**: Bold headings, 600 weight for buttons, clean sans-serif
- **Buttons**: Rounded corners (12px-25px), soft shadows, hover effects with `translateY(-2px)`
- **Mobile**: Responsive breakpoints at 768px and 480px

#### Component Styling
- **CreationView**: 
  - `.header-top`: Side-by-side button layout
  - `.icon-btn`: Minimal icon buttons without oval padding
  - `.add-media-section`: Styled like existing upload components
- **PhotoGallery**: Clean grid layouts without management UI
- **Consistent Patterns**: All components follow established design tokens

### Mobile-First Development

#### Responsive Design Principles
- **Touch Targets**: Minimum 40px for mobile interactions
- **Side-by-Side Layouts**: Maintained across all screen sizes
- **Progressive Enhancement**: Works on all modern mobile browsers
- **iOS Optimization**: Special handling for iOS WebKit limitations

#### Video Mobile Considerations
- **iOS Thumbnail Issue**: iOS doesn't load video thumbnails properly
- **Solution**: Cloudinary static image generation using `c_thumb` transformation
- **Implementation**: `videoUtils.js` with `generateVideoThumbnail()` function
- **Fallback**: Graceful degradation if Cloudinary transformation fails

### API Integration Details

#### Cloudinary Integration
- **Upload Endpoint**: `/upload` (universal for images and videos)
- **Transformations**: Video thumbnail generation, image optimization
- **Organization**: Media organized by creation ID in folder structure
- **Metadata**: Creation context stored in Cloudinary tags

#### Supabase Integration  
- **Authentication**: Email-based admin authentication
- **Database**: PostgreSQL with automatic syncing
- **Real-time**: Potential for real-time updates (not currently implemented)
- **Row Level Security**: Ensures proper access control

### Error Handling & UX Patterns

#### User Feedback
- **Upload Progress**: Real-time status updates during uploads
- **Error Messages**: User-friendly error handling with retry options
- **Confirmation Dialogs**: Destructive actions require confirmation
- **Loading States**: Clear loading indicators for all async operations

#### Offline Resilience
- **Cache Strategy**: localStorage backup when cloud services unavailable
- **Sync Recovery**: Automatic sync when connection restored
- **Status Indicators**: User awareness of sync status

### Testing & Quality Assurance

#### Cross-Browser Testing
- **iOS Safari**: Specific video thumbnail testing
- **Mobile Chrome**: Touch interaction testing
- **Desktop Browsers**: Full feature testing
- **Responsive**: All breakpoints verified

#### Performance Considerations
- **Image Compression**: Automatic optimization before upload
- **Lazy Loading**: Progressive loading for large galleries
- **CDN Delivery**: Global content delivery via Cloudinary
- **Bundle Size**: Optimized build for fast loading

## Development Guidelines

### Adding New Features
1. **Component Patterns**: Follow existing React functional component patterns
2. **CSS Organization**: Use component-specific CSS files with consistent naming
3. **Mobile First**: Design for mobile, enhance for desktop
4. **State Management**: Use React hooks for local state, context for global state
5. **Error Handling**: Implement user-friendly error messages and fallbacks

### Code Style & Conventions
- **File Naming**: PascalCase for components, camelCase for utilities
- **CSS Classes**: kebab-case with component prefixes
- **Functions**: Descriptive names with clear purpose
- **Comments**: Focus on "why" not "what" in code comments

### Database Modifications
- **Schema Changes**: Always create migration SQL files
- **RLS Policies**: Ensure proper security for new tables/columns
- **Indexes**: Add appropriate indexes for query performance
- **Backup**: Test changes on development environment first

This codebase represents a mature, production-ready application with sophisticated media management capabilities optimized for mobile-first usage.