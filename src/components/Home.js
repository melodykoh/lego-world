import React from 'react';
import './Home.css';

function Home({ creations, onNavigateToGallery, onNavigateToUpload, onViewCreation }) {
  const recentCreations = creations.slice(-3).reverse(); // Show 3 most recent

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Welcome to Your Lego Universe! 🚀</h2>
          <p className="hero-description">
            Showcase your amazing Lego creations, organize your builds, and share your creative journey.
          </p>
          
          <div className="quick-actions">
            <button onClick={onNavigateToUpload} className="action-btn primary">
              📷 Add Your Creation
            </button>
            {creations.length > 0 && (
              <button onClick={onNavigateToGallery} className="action-btn secondary">
                🖼️ Browse Gallery ({creations.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {creations.length > 0 && (
        <>
          <div className="lego-separator"></div>
          <div className="recent-section">
            <h3 className="section-title">Recent Creations</h3>
          <div className="recent-grid">
            {recentCreations.map((creation) => (
              <div 
                key={creation.id} 
                className="recent-card"
                onClick={() => onViewCreation(creation)}
              >
                <div className="recent-image-container">
                  <img 
                    src={creation.photos[0].url} 
                    alt={creation.name}
                    className="recent-image"
                  />
                  {creation.photos.length > 1 && (
                    <div className="photo-badge">
                      📷 {creation.photos.length}
                    </div>
                  )}
                </div>
                <div className="recent-content">
                  <h4 className="recent-name">{creation.name}</h4>
                  <p className="recent-date">
                    {new Date(creation.dateAdded).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {creations.length > 3 && (
            <div className="view-all">
              <button onClick={onNavigateToGallery} className="view-all-btn">
                View All {creations.length} Creations →
              </button>
            </div>
          )}
          </div>
        </>
      )}

      <div className="lego-separator"></div>
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{creations.length}</div>
            <div className="stat-label">Total Creations</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {creations.reduce((total, creation) => total + creation.photos.length, 0)}
            </div>
            <div className="stat-label">Photos Captured</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {creations.length > 0 ? 
                Math.ceil((Date.now() - new Date(creations[0].dateAdded).getTime()) / (1000 * 60 * 60 * 24)) 
                : 0}
            </div>
            <div className="stat-label">Days Building</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;