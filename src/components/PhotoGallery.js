import React, { useState, useEffect, useCallback } from 'react';
import './PhotoGallery.css';
import { getMediaThumbnail } from '../utils/videoUtils';

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

  // Enhanced zoom reset for video exit issues after rotation
  const videoExitZoomReset = () => {
    // Multiple zoom reset strategies for iOS Safari video issues
    document.body.style.zoom = '1';
    document.documentElement.style.zoom = '1';
    window.scrollTo(0, 0);

    // Aggressive viewport meta tag reset for post-video zoom issues
    let viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      const originalContent = viewport.getAttribute('content');
      // Force complete scale reset
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no');
      setTimeout(() => {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=yes');
      }, 150);
      setTimeout(() => {
        viewport.setAttribute('content', originalContent);
      }, 300);
    }

    // Force additional DOM reflow to combat iOS video zoom issues
    setTimeout(() => {
      document.body.style.minHeight = '100vh';
      window.scrollTo(0, 0);
      document.body.style.zoom = '1';
      document.documentElement.style.zoom = '1';
      setTimeout(() => {
        document.body.style.minHeight = '';
      }, 50);
    }, 100);
  };

  const closePhotoModal = () => {
    // Use enhanced zoom reset for video exit issues
    videoExitZoomReset();

    setSelectedPhoto(null);
    setCurrentPhotoIndex(0);

    // Additional reset after state change
    setTimeout(() => {
      videoExitZoomReset();
    }, 50);
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
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Prevent zoom on double tap for iOS
      document.body.style.touchAction = 'manipulation';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      };
    }
  }, [selectedPhoto, navigatePhoto]);

  // Handle orientation change and viewport issues
  useEffect(() => {
    const handleOrientationChange = () => {
      if (selectedPhoto) {
        // Force viewport reset and prevent zoom issues
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.body.style.zoom = '1';
          document.documentElement.style.zoom = '1';
          // Force a repaint
          const modal = document.querySelector('.photo-modal');
          if (modal) {
            modal.style.display = 'none';
            void modal.offsetHeight; // Force reflow
            modal.style.display = 'block';
          }
        }, 100);
      }
    };

    const handleResize = () => {
      if (selectedPhoto) {
        // Reset any zoom issues on window resize
        window.scrollTo(0, 0);
        document.body.style.zoom = '1';
        document.documentElement.style.zoom = '1';
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedPhoto]);

  const minSwipeDistance = 50;
  const [isPinching, setIsPinching] = useState(false);

  const onTouchStart = (e) => {
    // Detect multi-touch (pinch gesture)
    if (e.touches.length > 1) {
      setIsPinching(true);
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    setIsPinching(false);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    // Ignore touch move during pinch gestures
    if (e.touches.length > 1 || isPinching) {
      setIsPinching(true);
      return;
    }

    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    // Don't trigger swipe if this was a pinch gesture
    if (isPinching || !touchStart || !touchEnd) {
      setIsPinching(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigatePhoto('next');
    } else if (isRightSwipe) {
      navigatePhoto('prev');
    }

    // Reset after handling
    setIsPinching(false);
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

            {selectedPhoto.mediaType === 'video' ? (
              <video
                src={selectedPhoto.url}
                className="modal-photo"
                controls
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.creationName}
                className="modal-photo"
              />
            )}
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