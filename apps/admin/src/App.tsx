import { useState } from 'react';
import EventDashboard from './pages/events/EventDashboard';
import './App.css';

function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState('events');

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>ed. Admin</h1>
        </div>
        <div className="nav-links">
          <button 
            className={currentView === 'events' ? 'active' : ''} 
            onClick={() => setCurrentView('events')}
          >
            Events
          </button>
          <button onClick={() => alert('Users module coming soon')}>Users</button>
          <button onClick={() => alert('Settings module coming soon')}>Settings</button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {currentView === 'events' && <EventDashboard />}
      </main>
    </div>
  );
}

export default App;