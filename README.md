# 🧱 Aiden's Lego World

A mobile-responsive React web application for showcasing Lego creation photos. Built with React for a snappy, responsive experience optimized for mobile devices.

## Features

- 📱 **Mobile-First Design**: Optimized for phone usage with responsive layout
- 📷 **Photo Upload**: Upload single or multiple photos per Lego creation
- 🖼️ **Photo Gallery**: Browse through all creations in a beautiful grid layout
- 👁️ **Individual Creation View**: View all photos of a specific creation with image carousel
- 🚀 **Performance Optimized**: Lazy loading and image optimization for fast loading
- 💾 **Local Storage**: Photos are stored in browser's local storage (client-side only)

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## How to Use

1. **Upload Creations**: Click the "Upload" tab to add new Lego creations
   - Enter a name for your creation
   - Select one or multiple photos from your device
   - Preview selected photos before submitting
   - Click "Add Creation" to save

2. **Browse Gallery**: The main gallery shows all your creations
   - Each creation displays the first photo as a thumbnail
   - Shows the number of photos if multiple
   - Click on any creation to view details

3. **View Individual Creations**: 
   - Navigate through multiple photos using arrow buttons
   - Use thumbnail navigation for quick photo selection
   - View creation name and date added

## Technical Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Image Handling**: Supports all common image formats (JPG, PNG, WebP, etc.)
- **Local Storage**: All data persists in browser storage
- **Performance**: Lazy loading for optimal performance
- **Modern UI**: Clean, colorful design with smooth animations

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes

- Photos are stored locally in your browser
- No server or cloud storage required
- Data persists between sessions
- Clearing browser data will remove all creations

## Development

Built with:
- React 18
- Modern CSS with Grid and Flexbox
- ES6+ JavaScript
- Mobile-first responsive design principles