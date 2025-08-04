import React, { useState } from 'react';
import './CreationView.css';

function CreationView({ creation, onBack }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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

  return (
    <div className="creation-view">
      <div className="creation-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Gallery
        </button>
        <h1 className="creation-title">{creation.name}</h1>
        <p className="creation-meta">
          Added {new Date(creation.dateAdded).toLocaleDateString()} • {creation.photos.length} photo{creation.photos.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="photo-viewer">
        <div className="main-photo-container">
          <img 
            src={creation.photos[currentPhotoIndex].url} 
            alt={`${creation.name} - ${currentPhotoIndex + 1}`}
            className="main-photo"
          />
          
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
              <button
                key={index}
                onClick={() => goToPhoto(index)}
                className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
              >
                <img 
                  src={photo.url} 
                  alt={`Thumbnail ${index + 1}`}
                  className="thumbnail-image"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CreationView;