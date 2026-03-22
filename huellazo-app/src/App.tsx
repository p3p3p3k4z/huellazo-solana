import React, { useState } from 'react';
import { Sidebar } from './components/Dashboard/Sidebar';
import { useHuellazoWeb3 } from './hooks/useHuellazoWeb3';

// Vistas
import { MapView } from './views/MapView';
import { ProfileView } from './views/ProfileView';
import { BadgesView } from './views/BadgesView';
import { RewardsView } from './views/RewardsView';

export default function App() {
  const [currentView, setCurrentView] = useState('map');
  const web3State = useHuellazoWeb3();

  // Renderiza la vista correspondiente al nav
  const renderView = () => {
    switch(currentView) {
      case 'map': return <MapView web3State={web3State} />;
      case 'profile': return <ProfileView web3State={web3State} />;
      case 'badges': return <BadgesView web3State={web3State} />;
      case 'rewards': return <RewardsView web3State={web3State} />;
      default: return <MapView web3State={web3State} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#FAF9F6] selection:bg-[#F2CC8F] font-sans overflow-hidden">
      {/* Sidebar de Navegación Neobrutalista */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Contenedor Principal de la Vista */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-white md:bg-[#FAF9F6] layout-content-area">
        {renderView()}
      </main>
    </div>
  );
}