# 🧱 Aiden's Lego World

A comprehensive React web application for showcasing Lego creation photos and videos. Built with modern cloud architecture for cross-device sync and optimized for mobile-first experience.

## Features

### Media Management
- 📷 **Photo & Video Support**: Upload both images and videos for each creation
- 🎬 **Video Thumbnails**: iOS-optimized video preview using Cloudinary transformations
- 📱 **Mobile-First Design**: Optimized for phone usage with responsive layout
- ☁️ **Cloud Storage**: Photos and videos stored in Cloudinary with cross-device sync
- 🔄 **Database Sync**: Supabase PostgreSQL for metadata with real-time sync

### User Experience
- 🖼️ **Gallery Views**: Browse creations in grid layout or view all media
- 👁️ **Creation Detail View**: Navigate through media with carousel and thumbnails
- ✏️ **Media Management**: Add/delete individual photos/videos to existing creations
- 🎯 **Simplified UX**: Clean interfaces with centralized edit mode
- 🔐 **Admin Controls**: Secure admin-only content management

### Technical Features
- 🚀 **Performance Optimized**: Lazy loading, image compression, and CDN delivery
- 📊 **Analytics**: Creation statistics and building timeline
- 🌐 **Cross-Device**: Access your creations from any device
- 💾 **Offline Resilience**: Local caching with cloud sync when available

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- Supabase account (for database)
- Cloudinary account (for media storage)

### Installation

1. Clone and install dependencies:
```bash
git clone [repository-url]
cd aiden-lego-world
npm install
```

2. Set up environment variables:
Create a `.env.local` file with:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

3. Set up database:
```bash
# Run the database setup scripts in Supabase SQL editor
# 1. database/setup/database-setup.sql
# 2. database/migrations/database-video-migration.sql (if needed)
```

4. Start development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) (or custom port)

## How to Use

### For Visitors
1. **Browse Gallery**: View all Lego creations in beautiful grid layout
2. **View Creations**: Click any creation to see all photos/videos
3. **Navigate Media**: Use arrows, thumbnails, or swipe gestures
4. **View Statistics**: See building timeline and creation counts

### For Admin
1. **Sign In**: Admin login for content management
2. **Upload Creations**: 
   - Add new creations with multiple photos/videos
   - Support for images (JPG, PNG, WebP, GIF) and videos (MP4, MOV, AVI, WebM)
   - Automatic compression and cloud upload

3. **Manage Existing Creations**:
   - Click any creation → Toggle "Edit" mode
   - ✏️ Rename creations
   - 🗑️ Delete entire creations  
   - 📷 Add more photos/videos to existing creations
   - ✕ Delete individual media files

4. **Cross-Device Access**: All changes sync across devices automatically

## Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **Responsive CSS**: Mobile-first design with CSS Grid and Flexbox
- **Progressive Web App**: Optimized loading and offline capabilities

### Backend Services
- **Supabase**: PostgreSQL database with Row Level Security
- **Cloudinary**: Media storage, optimization, and transformation
- **Authentication**: Supabase Auth with admin-only access

### Database Schema
- **creations**: id, name, date_added, user_id
- **photos**: creation_id, url, public_id, name, dimensions, media_type
- **Row Level Security**: Public read, authenticated write

## Technical Features

### Performance
- **Image Optimization**: Automatic compression and format conversion
- **Lazy Loading**: Progressive loading for fast initial page load
- **CDN Delivery**: Global content delivery via Cloudinary
- **Caching Strategy**: Smart client-side caching with cloud sync

### Mobile Optimization
- **Touch Interactions**: Optimized for mobile touch and gestures
- **Responsive Design**: Seamless experience across all screen sizes
- **iOS Compatibility**: Special handling for iOS video thumbnail display
- **Progressive Enhancement**: Works on all modern mobile browsers

### Video Support
- **Format Support**: MP4, MOV, AVI, WebM, QuickTime
- **Thumbnail Generation**: Cloudinary video-to-image transformation
- **iOS Optimization**: Static thumbnails for iOS WebKit compatibility
- **Playback Controls**: Native video controls in modal view

## Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari (including iOS)
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Key Commands
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
npm run lint       # Code linting
```

### Project Structure
```
src/
├── components/     # React components
├── contexts/       # React contexts (Auth)
├── utils/          # Utility functions (Cloudinary, Supabase)
├── assets/         # Static assets
└── App.js         # Main application component
```

### Adding Features
- **New Components**: Follow existing patterns in `/components`
- **Database Changes**: Update schema in SQL files
- **Cloud Functions**: Add to `/api` directory for serverless functions
- **Styling**: Mobile-first CSS with consistent design tokens

## Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Configure production environment variables
- Set up Supabase production database
- Configure Cloudinary production settings
- Deploy to hosting platform (Vercel, Netlify, etc.)

## Contributing

1. Follow existing code patterns and conventions
2. Test on multiple devices and browsers
3. Ensure mobile optimization
4. Update documentation for new features

Built with ❤️ for showcasing amazing Lego creations!