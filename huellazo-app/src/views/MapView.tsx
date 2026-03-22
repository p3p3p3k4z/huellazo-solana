import React from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { GameCanvas } from '../components/Map/GameCanvas';
import { PoiCard } from '../components/Map/PoiCard';

type MapViewProps = {
  web3State: any; 
};

// Integra la lógica del motor de juego con el canvas y la lógica web3
export function MapView({ web3State }: MapViewProps) {
  const { playerPosition, playerSize, activePoi } = useGameEngine();
  const { isSending, txStatus, recordVisit, passportData } = web3State;

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-black text-[#3D405B] uppercase drop-shadow-[2px_2px_0px_#F2CC8F]">
          Mapa de Huellazo
        </h2>
        {txStatus && (
          <div className="bg-[#E07A5F] text-white px-4 py-2 rounded font-black border-2 border-[#3D405B] shadow-[2px_2px_0px_#3D405B] animate-pulse max-w-xs text-sm truncate">
            {txStatus}
          </div>
        )}
      </div>

      {!passportData && (
        <div className="bg-[#F2CC8F] border-4 border-[#3D405B] p-4 text-[#3D405B] font-black uppercase mb-6 shadow-[4px_4px_0px_#3D405B]">
          ⚠️ Crea tu pasaporte en "Mi Pasaporte" para guardar tu progreso en Devnet.
        </div>
      )}

      <div className="relative flex-1">
        <GameCanvas playerPosition={playerPosition} playerSize={playerSize} />
        
        {activePoi && (
          <PoiCard 
            poi={activePoi} 
            isSending={isSending} 
            onPay={() => recordVisit(activePoi)} 
          />
        )}
      </div>
    </div>
  );
}
