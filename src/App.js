import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import PhotoUpload from './components/PhotoUpload';
import PhotoGallery from './components/PhotoGallery';
import CreationView from './components/CreationView';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { fetchCreationsFromCloudinary, updateCreationNameInCloud, deleteCreation } from './utils/cloudinaryUtils';

function AppContent() {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedCreation, setSelectedCreation] = useState(null);
  const [legoCreations, setLegoCreations] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const loadCreations = async () => {
      try {
        // Try to load from Cloudinary first
        const cloudinaryCreations = await fetchCreationsFromCloudinary();
        
        if (cloudinaryCreations.length > 0) {
          setLegoCreations(cloudinaryCreations);
          return;
        }
        
        // Fallback to localStorage for migration
        const savedCreations = localStorage.getItem('aidens-lego-creations');
        if (savedCreations) {
          const parsed = JSON.parse(savedCreations);
          // Clean up broken blob URLs and accept both cloud and base64 URLs
          const cleanedCreations = parsed.map(creation => ({
            ...creation,
            photos: creation.photos.filter(photo => 
              photo.url && (
                photo.url.startsWith('data:') || // Base64 (local)
                photo.url.startsWith('https://res.cloudinary.com/') || // Cloudinary
                photo.url.startsWith('https://') // Other cloud URLs
              )
            )
          })).filter(creation => creation.photos.length > 0);
          
          setLegoCreations(cleanedCreations);
        }
      } catch (error) {
        console.error('Error loading creations:', error);
        setLegoCreations([]);
      }
    };
    
    loadCreations();
  }, []);

  useEffect(() => {
    localStorage.setItem('aidens-lego-creations', JSON.stringify(legoCreations));
  }, [legoCreations]);

  const addCreation = async (newCreation) => {
    // Photos are already uploaded to Cloudinary by PhotoUpload component
    // Just refresh the list from Cloudinary to show the new creation
    try {
      const updatedCreations = await fetchCreationsFromCloudinary();
      setLegoCreations(updatedCreations);
      setCurrentView('gallery');
    } catch (error) {
      console.error('Error refreshing creations after upload:', error);
      // Fallback: add to current list (but won't persist on refresh)
      setLegoCreations(prev => [...prev, { ...newCreation, id: Date.now() }]);
      setCurrentView('gallery');
    }
  };

  const editCreationName = async (creationId, newName) => {
    try {
      await updateCreationNameInCloud(creationId, newName);
      // Refresh the list
      const updatedCreations = await fetchCreationsFromCloudinary();
      setLegoCreations(updatedCreations);
      // Update selected creation if it's the one being edited
      if (selectedCreation && selectedCreation.id === creationId) {
        setSelectedCreation({ ...selectedCreation, name: newName });
      }
    } catch (error) {
      console.error('Error updating creation name:', error);
      alert('Failed to update creation name. Please try again.');
    }
  };

  const removeCreation = async (creationId) => {
    if (!window.confirm('Are you sure you want to delete this creation? This cannot be undone.')) {
      return;
    }
    
    try {
      await deleteCreation(creationId);
      // Refresh the list
      const updatedCreations = await fetchCreationsFromCloudinary();
      setLegoCreations(updatedCreations);
      // Navigate away if viewing the deleted creation
      if (selectedCreation && selectedCreation.id === creationId) {
        setCurrentView('gallery');
        setSelectedCreation(null);
      }
    } catch (error) {
      console.error('Error deleting creation:', error);
      alert('Failed to delete creation. Please try again.');
    }
  };

  const viewCreation = (creation) => {
    setSelectedCreation(creation);
    setCurrentView('creation');
    setIsMenuOpen(false);
  };

  const navigateToView = (view) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🧱 Loading...</div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home 
          creations={legoCreations}
          onNavigateToGallery={() => navigateToView('gallery')}
          onNavigateToUpload={() => navigateToView('upload')}
          onViewCreation={viewCreation}
        />;
      case 'gallery':
        return <PhotoGallery 
          creations={legoCreations} 
          onViewCreation={viewCreation} 
          onNavigateToUpload={() => navigateToView('upload')}
          onEditCreation={isAuthenticated ? editCreationName : null}
          onDeleteCreation={isAuthenticated ? removeCreation : null}
          isAuthenticated={isAuthenticated}
        />;
      case 'upload':
        if (!isAuthenticated) {
          return <Login />;
        }
        return <PhotoUpload 
          onAddCreation={addCreation}
        />;
      case 'login':
        return <Login />;
      case 'creation':
        return <CreationView creation={selectedCreation} onBack={() => setCurrentView('gallery')} />;
      default:
        return <Home 
          creations={legoCreations}
          onNavigateToGallery={() => navigateToView('gallery')}
          onNavigateToUpload={() => navigateToView('upload')}
          onViewCreation={viewCreation}
        />;
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <button className={`hamburger ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); navigateToView('home'); }}>
            <span className="logo-icon">🧱</span>
            <h1 className="logo-text">Aiden's Lego World</h1>
          </a>
          <div className="header-spacer"></div>
        </div>
      </header>

      <nav className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
        <div className="menu-content">
          <div className="menu-header">
            <h2>Menu</h2>
          </div>
          <ul className="menu-items">
            <li>
              <button 
                className={`menu-item ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => navigateToView('home')}
              >
                🏠 Home
              </button>
            </li>
            <li>
              <button 
                className={`menu-item ${currentView === 'gallery' ? 'active' : ''}`}
                onClick={() => navigateToView('gallery')}
              >
                🖼️ Gallery
              </button>
            </li>
            {isAuthenticated && (
              <li>
                <button 
                  className={`menu-item ${currentView === 'upload' ? 'active' : ''}`}
                  onClick={() => navigateToView('upload')}
                >
                  ➕ Add New Creation
                </button>
              </li>
            )}
            <li>
              {isAuthenticated ? (
                <button 
                  className="menu-item logout-btn"
                  onClick={async () => {
                    await signOut();
                    setCurrentView('home');
                    setIsMenuOpen(false);
                  }}
                >
                  🚪 Sign Out ({user?.email})
                </button>
              ) : (
                <button 
                  className={`menu-item ${currentView === 'login' ? 'active' : ''}`}
                  onClick={() => navigateToView('login')}
                >
                  🔐 Admin Login
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>

      <main className="app-main">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;