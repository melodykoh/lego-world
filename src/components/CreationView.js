import React, { useState, useEffect } from 'react';
import './CreationView.css';
import { getMediaThumbnail } from '../utils/videoUtils';

function CreationView({ creation, onBack, onEditCreation, onDeleteCreation, onAddMedia, onDeleteMedia, isAuthenticated }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Touch/swipe handling for fullscreen modal
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isPinching, setIsPinching] = useState(false);

  // Reset edit mode when creation changes (don't persist edit state)
  useEffect(() => {
    setIsEditMode(false);
    setIsEditingName(false);
    setEditingName('');
    setSelectedFiles([]);
    setCurrentPhotoIndex(0);
  }, [creation?.id]);

  // Handle fullscreen modal body scroll and orientation changes
  useEffect(() => {
    if (showFullScreen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'manipulation';

      const handleOrientationChange = () => {
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
      };

      const handleResize = () => {
        // Reset any zoom issues on window resize
        window.scrollTo(0, 0);
        document.body.style.zoom = '1';
        document.documentElement.style.zoom = '1';
      };

      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleResize);

      return () => {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [showFullScreen]);

  if (!creation) {
    return (
      <div className="creation-view">
        <p>Creation not found</p>
      </div>
    );
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === creation.photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? creation.photos.length - 1 : prev - 1
    );
  };

  const goToPhoto = (index) => {
    setCurrentPhotoIndex(index);
  };

  // Swipe gesture handling for fullscreen modal
  const minSwipeDistance = 50;

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
      nextPhoto();
    } else if (isRightSwipe) {
      prevPhoto();
    }

    // Reset after handling
    setIsPinching(false);
  };

  // Management functions
  const handleEditNameStart = () => {
    setEditingName(creation.name);
    setIsEditingName(true);
  };

  const handleEditNameSave = async () => {
    if (editingName.trim() && editingName.trim() !== creation.name) {
      try {
        await onEditCreation(creation.id, editingName.trim());
        setIsEditingName(false);
      } catch (error) {
        alert('Failed to update creation name. Please try again.');
      }
    } else {
      setIsEditingName(false);
    }
  };

  const handleEditNameCancel = () => {
    setEditingName('');
    setIsEditingName(false);
  };

  const handleDeleteCreation = () => {
    if (window.confirm('Are you sure you want to delete this entire creation? This cannot be undone.')) {
      onDeleteCreation(creation.id);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleAddMedia = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setIsProcessing(true);
      await onAddMedia(creation.id, selectedFiles);
      setSelectedFiles([]);
      // Reset file input
      const fileInput = document.getElementById('add-media-input');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      alert('Failed to add media. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteMedia = (mediaIndex) => {
    const media = creation.photos[mediaIndex];
    if (window.confirm('Are you sure you want to delete this photo/video? This cannot be undone.')) {
      onDeleteMedia(creation.id, media.url, mediaIndex);
      // Adjust current photo index if needed
      if (currentPhotoIndex >= creation.photos.length - 1 && currentPhotoIndex > 0) {
        setCurrentPhotoIndex(currentPhotoIndex - 1);
      }
    }
  };

  return (
    <div className="creation-view">
      <div className="creation-header">
        <div className="header-top">
          <button onClick={onBack} className="back-btn">
            ← Back to Gallery
          </button>
          {isAuthenticated && (
            <button 
              onClick={() => setIsEditMode(!isEditMode)} 
              className="back-btn edit-mode-btn"
            >
              {isEditMode ? 'Exit Edit' : 'Edit'}
            </button>
          )}
        </div>
        
        <div className="header-main">
          {isEditingName ? (
            <div className="edit-name-section">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEditNameSave()}
                className="edit-name-input"
                autoFocus
              />
              <div className="edit-name-actions">
                <button onClick={handleEditNameSave} className="save-btn">✓</button>
                <button onClick={handleEditNameCancel} className="cancel-btn">✗</button>
              </div>
            </div>
          ) : (
            <div className="title-section">
              <h1 className="creation-title">{creation.name}</h1>
              {isEditMode && (
                <div className="inline-actions">
                  <button onClick={handleEditNameStart} className="icon-btn" title="Edit name">
                    ✏️
                  </button>
                  <button onClick={handleDeleteCreation} className="icon-btn delete-icon" title="Delete creation">
                    🗑️
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <p className="creation-meta">
          Added {new Date(creation.dateAdded).toLocaleDateString()} • {creation.photos.length} file{creation.photos.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="photo-viewer">
        <div className="main-photo-container">
          {creation.photos[currentPhotoIndex].mediaType === 'video' ? (
            <video
              key={currentPhotoIndex}  // Force re-mount when switching videos
              src={creation.photos[currentPhotoIndex].url}
              className="main-photo"
              controls
              preload="auto"
              muted
              playsInline
              onClick={() => setShowFullScreen(true)}
              style={{ cursor: 'pointer' }}
              onLoadedData={(e) => {
                // Seek to a frame to show video preview
                e.target.currentTime = 0.1;
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img 
              src={creation.photos[currentPhotoIndex].url} 
              alt={`${creation.name} - ${currentPhotoIndex + 1}`}
              className="main-photo"
              onClick={() => setShowFullScreen(true)}
              style={{ cursor: 'pointer' }}
            />
          )}
          
          {creation.photos.length > 1 && (
            <>
              <button 
                onClick={prevPhoto} 
                className="nav-btn prev-btn"
                disabled={creation.photos.length <= 1}
              >
                ‹
              </button>
              <button 
                onClick={nextPhoto} 
                className="nav-btn next-btn"
                disabled={creation.photos.length <= 1}
              >
                ›
              </button>
              
              <div className="photo-counter">
                {currentPhotoIndex + 1} / {creation.photos.length}
              </div>
            </>
          )}
        </div>

        {creation.photos.length > 1 && (
          <div className="photo-thumbnails">
            {creation.photos.map((photo, index) => (
              <div key={index} className="thumbnail-container">
                <button
                  onClick={() => goToPhoto(index)}
                  className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                >
                  <div className="video-thumbnail">
                    <img 
                      src={getMediaThumbnail(photo, { width: 150, height: 150 }) || photo.url} 
                      alt={`Thumbnail ${index + 1}`}
                      className="thumbnail-image"
                    />
                    {photo.mediaType === 'video' && (
                      <div className="play-overlay">▶</div>
                    )}
                  </div>
                </button>
                {isEditMode && creation.photos.length > 1 && (
                  <button
                    onClick={() => handleDeleteMedia(index)}
                    className="delete-media-btn"
                    title="Delete this photo/video"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Media Section - only in edit mode */}
        {isEditMode && (
          <div className="add-media-section">
            <input
              id="add-media-input"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/mov,video/avi,video/webm,video/quicktime"
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="add-media-input" className="file-input-label add-media-btn">
              {isProcessing ? `⏳ Uploading...` : '📷 Add Photos & Videos'}
            </label>
            {selectedFiles.length > 0 && !isProcessing && (
              <div className="selected-files-info">
                <span className="file-count">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                </span>
                <button 
                  onClick={handleAddMedia}
                  className="file-input-label upload-selected-btn"
                >
                  🚀 Add to Creation
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Screen Viewer Modal */}
      {showFullScreen && creation.photos[currentPhotoIndex] && (
        <div
          className="photo-modal"
          onClick={() => {
            // Use enhanced zoom reset for video exit issues
            videoExitZoomReset();
            setShowFullScreen(false);
            setTimeout(() => {
              videoExitZoomReset();
            }, 50);
          }}
        >
          <div
            className="photo-modal-content"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button
              className="modal-close-btn"
              onClick={() => {
              // Use enhanced zoom reset for video exit issues
              videoExitZoomReset();
              setShowFullScreen(false);
              setTimeout(() => {
                videoExitZoomReset();
              }, 50);
            }}
            >
              ✕
            </button>

            {/* Media display */}
            {creation.photos[currentPhotoIndex].mediaType === 'video' ? (
              <video
                src={creation.photos[currentPhotoIndex].url}
                className="modal-photo"
                controls
                autoPlay
                style={{ touchAction: 'pinch-zoom' }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={creation.photos[currentPhotoIndex].url}
                alt={`${creation.name} - ${currentPhotoIndex + 1}`}
                className="modal-photo"
                style={{ touchAction: 'pinch-zoom' }}
              />
            )}

            {/* Navigation buttons for multiple photos */}
            {creation.photos.length > 1 && (
              <>
                <button
                  className="modal-nav-btn modal-nav-prev"
                  onClick={prevPhoto}
                  title="Previous photo"
                >
                  ‹
                </button>
                <button
                  className="modal-nav-btn modal-nav-next"
                  onClick={nextPhoto}
                  title="Next photo"
                >
                  ›
                </button>

                {/* Photo counter */}
                <div className="modal-photo-counter">
                  {currentPhotoIndex + 1} of {creation.photos.length}
                </div>
              </>
            )}

            {/* Photo info */}
            <div className="modal-info">
              <h3 className="modal-creation-name">{creation.name}</h3>
              <p className="modal-date">
                Added {new Date(creation.dateAdded).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreationView;