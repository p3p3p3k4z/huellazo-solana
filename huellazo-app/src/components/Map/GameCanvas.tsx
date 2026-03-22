import React from 'react';
import { Position, Place } from '../../hooks/useGameEngine';
import { LUGARES_DISPONIBLES } from '../../hooks/useHuellazoWeb3';

type GameCanvasProps = {
  playerPosition: Position;
  playerSize: number;
};

// Renderiza el mapa, el jugador y los puntos de interés
export function GameCanvas({ playerPosition, playerSize }: GameCanvasProps) {
  return (
    <div className="relative w-full h-[600px] bg-[#FAF9F6] border-4 border-[#3D405B] rounded-2xl shadow-[8px_8px_0px_#3D405B] overflow-hidden">
      
      {/* Fondo del Mapa (Simulación de Terreno Web3) */}
      <div className="absolute inset-0 bg-[#81B29A]/20 opacity-50" style={{ backgroundImage: 'radial-gradient(#3D405B 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Renderizado de Negocios (POIs) */}
      {LUGARES_DISPONIBLES.map((lugar) => (
        <div
          key={lugar.id}
          className="absolute flex flex-col items-center justify-center transition-transform"
          style={{
            left: `${lugar.mapX}%`,
            top: `${lugar.mapY}%`,
            width: `${lugar.mapW}%`,
            height: `${lugar.mapH}%`,
          }}
        >
          {/* Sombra base del POI */}
          <div className={`w-full h-full rounded-2xl border-4 border-[#3D405B] ${lugar.color} shadow-[4px_4px_0px_#3D405B] flex items-center justify-center overflow-hidden`}>
            <img src={lugar.img} alt={lugar.nombre} className="opacity-80 object-cover w-full h-full" />
          </div>
          {/* Tooltip pequeño flotante para ubicarlo */}
          <span className="absolute -bottom-6 bg-white border-2 border-[#3D405B] px-2 py-0.5 rounded text-[10px] font-black text-[#3D405B] uppercase whitespace-nowrap shadow-[2px_2px_0px_#3D405B]">
            {lugar.nombre}
          </span>
        </div>
      ))}

      {/* Renderizado del Jugador (Turista) */}
      <div 
        className="absolute transition-all duration-75 ease-linear pointer-events-none"
        style={{
          left: `${playerPosition.x}%`,
          top: `${playerPosition.y}%`,
          width: `${playerSize}%`,
          height: `${playerSize}%`,
        }}
      >
        <div className="w-full h-full bg-[#E07A5F] border-4 border-[#3D405B] rounded-full shadow-[4px_4px_0px_#3D405B] flex items-center justify-center overflow-hidden z-10">
          <img src="/assets/player.png" alt="Player" className="w-[100%] h-[100%] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        {/* Sombra debajo del jugador */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/20 rounded-full w-full backdrop-blur-sm -z-10" />
      </div>

      {/* Instrucciones de movimiento en esquina */}
      <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 border-2 border-[#3D405B] rounded-lg shadow-[2px_2px_0px_#3D405B] text-xs font-black text-[#3D405B] uppercase text-center">
        Usa (W A S D)<br/>para moverte
      </div>
    </div>
  );
}
