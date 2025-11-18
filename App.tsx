import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Standings from './components/Standings';
import TrackExplorer from './components/TrackExplorer';
import DriverDetails from './components/DriverDetails';
import CircuitGallery from './components/CircuitGallery';
import { ViewState, Driver } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriver(driver);
    setCurrentView(ViewState.DRIVER_DETAILS);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard onSelectDriver={handleDriverSelect} />;
      case ViewState.STANDINGS:
        return <Standings onSelectDriver={handleDriverSelect} />;
      case ViewState.TRACKS:
        return <TrackExplorer />;
      case ViewState.CIRCUITS:
        return <CircuitGallery />;
      case ViewState.DRIVER_DETAILS:
        return selectedDriver ? (
          <DriverDetails 
            driver={selectedDriver} 
            onBack={() => setCurrentView(ViewState.STANDINGS)} 
          />
        ) : (
          <Standings onSelectDriver={handleDriverSelect} />
        );
      default:
        return <Dashboard onSelectDriver={handleDriverSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-racing-dark flex flex-col">
      <Navbar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
      <footer className="bg-racing-charcoal border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>APEX F1 Concept App. Powered by Gemini 2.5.</p>
          <p className="mt-2 text-xs opacity-50">Data sourced from Ergast Developer API & Wikipedia.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;