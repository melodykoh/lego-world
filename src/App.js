import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import PhotoUpload from './components/PhotoUpload';
import PhotoGallery from './components/PhotoGallery';
import CreationView from './components/CreationView';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCreation, setSelectedCreation] = useState(null);
  const [legoCreations, setLegoCreations] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedCreations = localStorage.getItem('aidens-lego-creations');
    if (savedCreations) {
      try {
        setLegoCreations(JSON.parse(savedCreations));
      } catch (error) {
        console.error('Error loading saved creations:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aidens-lego-creations', JSON.stringify(legoCreations));
  }, [legoCreations]);

  const addCreation = (newCreation) => {
    setLegoCreations(prev => [...prev, { ...newCreation, id: Date.now() }]);
    setCurrentView('gallery');
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
        />;
      case 'upload':
        return <PhotoUpload 
          onAddCreation={addCreation}
        />;
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
      <header className="app-header">
        <button className="hamburger-btn" onClick={toggleMenu}>
          <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        <h1 className="app-title">🧱 Aiden's Lego World</h1>
      </header>

      <nav className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
        <div className="menu-content">
          <div className="menu-header">
            <h2>Menu</h2>
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>✕</button>
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
            <li>
              <button 
                className={`menu-item ${currentView === 'upload' ? 'active' : ''}`}
                onClick={() => navigateToView('upload')}
              >
                ➕ Add New Creation
              </button>
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

export default App;