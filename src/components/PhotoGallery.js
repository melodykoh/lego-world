import React, { useState } from 'react';
import './PhotoGallery.css';
import { getMediaThumbnail } from '../utils/videoUtils';

function PhotoGallery({ creations, onViewCreation, onNavigateToUpload }) {
  const [viewMode, setViewMode] = useState('by-creation'); // 'by-creation' or 'view-all'
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedCreationName, setSelectedCreationName] = useState('');

  // Flatten all photos with creation info for "View All" mode
  const allPhotos = creations.flatMap(creation => 
    creation.photos.map(photo => ({
      ...photo,
      creationName: creation.name,
      creationId: creation.id,
      dateAdded: creation.dateAdded
    }))
  );

  const openPhotoModal = (photo, index) => {
    setCurrentPhotoIndex(index);
    setSelectedCreationName(photo.creationName || '');
    setShowFullScreen(true);
  };

  const closePhotoModal = () => {
    setShowFullScreen(false);
    setCurrentPhotoIndex(0);
  };

  if (creations.length === 0) {
    return (
      <div className="gallery-empty">
        <div className="empty-state">
          <div className="empty-icon">🧱</div>
          <h2 className="empty-title">No Creations Yet!</h2>
          <p className="empty-message">
            Start building your Lego world by uploading your first creation.
          </p>
          <button onClick={onNavigateToUpload} className="get-started-btn">
            📷 Upload Your First Creation
          </button>
        </div>
      </div>
    );
  }

  const renderViewAllGrid = () => (
    <div className="photos-grid">
      {allPhotos.map((photo, index) => (
        <div 
          key={`${photo.creationId}-${index}`} 
          className="photo-tile"
          onClick={() => openPhotoModal(photo, index)}
        >
          <div className="photo-tile-container">
            <div className="video-thumbnail">
              <img 
                src={getMediaThumbnail(photo, { width: 300, height: 300 }) || photo.url} 
                alt={photo.creationName}
                className="photo-tile-image"
                loading="lazy"
              />
              {photo.mediaType === 'video' && (
                <div className="play-overlay">▶</div>
              )}
            </div>
            <div className="photo-overlay">
              <div className="photo-info">
                <div className="photo-creation-name">{photo.creationName}</div>
                <div className="photo-date">
                  {new Date(photo.dateAdded).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderByCreationGrid = () => (
    <div className="gallery-grid">
      {creations.map((creation) => {
        // CRITICAL FIX: Skip creations with no photos to prevent white screen
        if (!creation.photos || creation.photos.length === 0) {
          return null;
        }
        
        return (
          <div 
            key={creation.id} 
            className="creation-card"
          >
            <div 
              className="card-clickable-area"
              onClick={() => onViewCreation(creation)}
            >
              <div className="card-image-container">
                <div className="video-thumbnail">
                  <img 
                    src={getMediaThumbnail(creation.photos[0], { width: 400, height: 300 }) || creation.photos[0].url} 
                    alt={creation.name}
                    className="card-image"
                    loading="lazy"
                  />
                  {creation.photos[0].mediaType === 'video' && (
                    <div className="play-overlay">▶</div>
                  )}
                </div>
              {creation.photos.length > 1 && (
                <div className="photo-count">
                  📷 {creation.photos.length}
                </div>
              )}
              </div>
              <div className="card-overlay">
                <div className="overlay-content">
                  <span className="view-text">👁️ View Creation</span>
                </div>
              </div>
            </div>
            
            <div className="card-content">
              <div className="creation-info">
                <h3 className="creation-name">{creation.name}</h3>
              </div>
              <p className="creation-date">
                Added {new Date(creation.dateAdded).toLocaleDateString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="photo-gallery">
      <div className="gallery-header">
        <div className="gallery-title-section">
          <h2 className="gallery-title">
            {viewMode === 'by-creation' 
              ? `Lego Creations (${creations.length})` 
              : `All Photos (${allPhotos.length})`
            }
          </h2>
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'by-creation' ? 'active' : ''}`}
              onClick={() => setViewMode('by-creation')}
            >
              📦 By Creation
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'view-all' ? 'active' : ''}`}
              onClick={() => setViewMode('view-all')}
            >
              🖼️ View All
            </button>
          </div>
        </div>
        <button onClick={onNavigateToUpload} className="gallery-add-btn">
          ➕ Add New Creation
        </button>
      </div>
      
      {viewMode === 'by-creation' ? renderByCreationGrid() : renderViewAllGrid()}

      {/* Full Screen Viewer - Temporarily disabled */}
      {false && showFullScreen && (
        <div>FullScreenViewer temporarily disabled for testing</div>
      )}
    </div>
  );
}

export default PhotoGallery;