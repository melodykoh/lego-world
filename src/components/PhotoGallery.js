import React, { useState, useEffect, useCallback } from 'react';
import './PhotoGallery.css';

function PhotoGallery({ creations, onViewCreation, onNavigateToUpload }) {
  const [viewMode, setViewMode] = useState('by-creation'); // 'by-creation' or 'view-all'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Touch/swipe handling hooks - must be at top level
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
  };

  const navigatePhoto = useCallback((direction) => {
    if (allPhotos.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentPhotoIndex < allPhotos.length - 1 ? currentPhotoIndex + 1 : 0;
    } else {
      newIndex = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : allPhotos.length - 1;
    }
    
    setCurrentPhotoIndex(newIndex);
    setSelectedPhoto(allPhotos[newIndex]);
  }, [allPhotos, currentPhotoIndex]);

  const closePhotoModal = () => {
    setSelectedPhoto(null);
    setCurrentPhotoIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedPhoto) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          navigatePhoto('prev');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigatePhoto('next');
          break;
        case 'Escape':
          event.preventDefault();
          closePhotoModal();
          break;
        default:
          break;
      }
    };

    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPhoto, navigatePhoto]);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigatePhoto('next');
    } else if (isRightSwipe) {
      navigatePhoto('prev');
    }
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
            <img 
              src={photo.url} 
              alt={photo.creationName}
              className="photo-tile-image"
              loading="lazy"
            />
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
      {creations.map((creation) => (
          <div 
            key={creation.id} 
            className="creation-card"
            onClick={() => onViewCreation(creation)}
          >
            <div className="card-image-container">
              <img 
                src={creation.photos[0].url} 
                alt={creation.name}
                className="card-image"
                loading="lazy"
              />
              {creation.photos.length > 1 && (
                <div className="photo-count">
                  📷 {creation.photos.length}
                </div>
              )}
            </div>
            
            <div className="card-content">
              <h3 className="creation-name">{creation.name}</h3>
              <p className="creation-date">
                Added {new Date(creation.dateAdded).toLocaleDateString()}
              </p>
            </div>
            
            <div className="card-overlay">
              <div className="overlay-content">
                <span className="view-text">👁️ View Creation</span>
              </div>
            </div>
          </div>
        ))}
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

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={closePhotoModal}>
          <div 
            className="photo-modal-content" 
            onClick={e => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button className="modal-close-btn" onClick={closePhotoModal}>✕</button>
            
            {/* Navigation arrows */}
            {allPhotos.length > 1 && (
              <>
                <button 
                  className="modal-nav-btn modal-nav-prev" 
                  onClick={() => navigatePhoto('prev')}
                  title="Previous photo"
                >
                  ‹
                </button>
                <button 
                  className="modal-nav-btn modal-nav-next" 
                  onClick={() => navigatePhoto('next')}
                  title="Next photo"
                >
                  ›
                </button>
              </>
            )}
            
            {/* Photo counter */}
            {allPhotos.length > 1 && (
              <div className="modal-photo-counter">
                {currentPhotoIndex + 1} of {allPhotos.length}
              </div>
            )}
            
            <img 
              src={selectedPhoto.url} 
              alt={selectedPhoto.creationName}
              className="modal-photo"
            />
            <div className="modal-info">
              <h3 className="modal-creation-name">{selectedPhoto.creationName}</h3>
              <p className="modal-date">
                Added {new Date(selectedPhoto.dateAdded).toLocaleDateString()}
              </p>
              <button 
                className="view-creation-btn"
                onClick={() => {
                  const creation = creations.find(c => c.id === selectedPhoto.creationId);
                  onViewCreation(creation);
                  closePhotoModal();
                }}
              >
                View Full Creation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoGallery;