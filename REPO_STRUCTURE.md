# Repository Structure - Aiden's Lego World

## Overview
This document describes the organization and structure of the Aiden's Lego World repository. All files should follow this structure to maintain consistency and clarity.

## Directory Structure

```
/
├── src/                        # Application source code
│   ├── components/            # React components
│   ├── contexts/             # React context providers (Auth, etc.)
│   ├── utils/                # Utility functions
│   ├── assets/               # Images, fonts, static assets
│   ├── App.js                # Main application component
│   ├── App.css               # Application styles
│   ├── index.js              # Application entry point
│   └── index.css             # Global styles
│
├── public/                     # Static public files
│   ├── index.html            # HTML template
│   └── [static assets]       # Favicons, manifests, etc.
│
├── database/                   # Database-related files
│   ├── setup/                # Initial database setup
│   │   └── database-setup.sql
│   ├── migrations/           # Database migrations (chronological)
│   │   ├── database-migration.sql
│   │   └── database-video-migration.sql
│   └── maintenance/          # Cleanup, fixes, analysis scripts
│       ├── database-fix.sql
│       ├── check-remaining-duplicates.sql
│       └── cleanup-remaining-duplicate.sql
│
├── api/                        # Backend/API scripts
│   └── cloudinary-search.js  # Cloudinary API utilities
│
├── build/                      # Production build output (git-ignored)
│
├── node_modules/              # Dependencies (git-ignored)
│
├── .github/                   # GitHub-specific files
│   └── workflows/            # GitHub Actions workflows
│
├── package.json               # NPM dependencies and scripts
├── package-lock.json          # Locked dependency versions
├── .gitignore                 # Git ignore rules
├── .env                       # Environment variables (not in git)
├── README.md                  # Project overview and setup
├── CLAUDE.md                  # AI assistant instructions
├── SESSION_LOG.md             # Development session history
├── REPO_STRUCTURE.md          # This file
└── compile_output.log         # Compilation output (temporary)
```

## File Organization Guidelines

### Source Code (`/src`)
- **components/**: React components, each with its own CSS file
- **contexts/**: Global state management (AuthContext, etc.)
- **utils/**: Shared utility functions (database, cloudinary, image processing)
- **assets/**: Static resources like images and fonts

### Database (`/database`)
- **setup/**: Initial schema creation and setup scripts
- **migrations/**: Schema changes, features, and updates (run in order)
- **maintenance/**: One-off fixes, cleanups, and analysis queries

### Documentation (Root Level)
- **README.md**: Public-facing project documentation
- **CLAUDE.md**: Technical implementation details and AI instructions
- **SESSION_LOG.md**: Ongoing record of development sessions
- **REPO_STRUCTURE.md**: This organizational guide

## Naming Conventions

### Files
- **React Components**: PascalCase (e.g., `PhotoGallery.js`)
- **Utilities**: camelCase (e.g., `imageUtils.js`)
- **CSS Files**: Match component name (e.g., `PhotoGallery.css`)
- **SQL Files**: kebab-case with descriptive names

### Folders
- **All folders**: lowercase with hyphens if needed
- **Exception**: React component folders can be PascalCase if grouping related components

## Adding New Files

### When adding SQL files:
1. **Setup scripts** → `/database/setup/`
2. **New features/changes** → `/database/migrations/`
3. **Fixes/cleanup** → `/database/maintenance/`

### When adding components:
1. Place in `/src/components/`
2. Include matching CSS file
3. Update imports in App.js or parent components

### When adding documentation:
1. **Session updates** → Update `SESSION_LOG.md`
2. **Architecture changes** → Update `CLAUDE.md`
3. **Structure changes** → Update this file

## Important Notes

- **Never scatter files at root**: All code files should be in appropriate subdirectories
- **Preserve git-ignored files**: `.env`, `node_modules/`, `build/` are not tracked
- **Update documentation**: Keep CLAUDE.md and SESSION_LOG.md current
- **Follow patterns**: Match existing code style and organization

## Environment Files

The following files are required but not tracked in git:
- `.env` - Contains API keys and configuration:
  ```
  REACT_APP_SUPABASE_URL=
  REACT_APP_SUPABASE_ANON_KEY=
  REACT_APP_CLOUDINARY_CLOUD_NAME=
  REACT_APP_CLOUDINARY_UPLOAD_PRESET=
  ```

## Build and Deployment

- **Development**: `npm start` (typically port 3002)
- **Production Build**: `npm run build`
- **Deployment**: Auto-deploys from `main` branch via Vercel
- **Feature Branches**: Do not auto-deploy, safe for development

---

*Last Updated: September 27, 2025*
*Maintain this document as the repository structure evolves*