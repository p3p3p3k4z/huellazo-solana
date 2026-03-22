import React from 'react';
import { LUGARES_DISPONIBLES } from '../hooks/useHuellazoWeb3';

type BadgesViewProps = {
  web3State: any;
};

// Muestra galería de coleccionables (Sellos Ecológicos)
export function BadgesView({ web3State }: BadgesViewProps) {
  const { sellosActivos } = web3State;
  
  // Filtramos todos los lugares que dan un sello y los mostramos.
  const lugaresConSellos = LUGARES_DISPONIBLES.filter(l => l.actionId !== undefined);

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-5xl font-black text-[#3D405B] uppercase drop-shadow-[4px_4px_0px_#81B29A] mb-10 text-center md:text-left">
        Galería de Insignias
      </h2>
      
      <p className="text-xl font-bold text-[#E07A5F] mb-8 uppercase">
        Desbloquea sellos visitando los mejores puntos ecológicos nivel 2
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {lugaresConSellos.map(lugar => {
          const desbloqueado = sellosActivos.includes(lugar.actionId!);
          
          return (
            <div 
              key={lugar.id} 
              className={`
                border-4 border-[#3D405B] rounded-3xl p-6 flex flex-col items-center text-center transition-all bg-white
                ${desbloqueado ? 'shadow-[8px_8px_0px_#3D405B]' : 'opacity-60 grayscale scale-95 shadow-[4px_4px_0px_#3D405B]'}
              `}
            >
              <div className={`w-24 h-24 rounded-full border-4 border-[#3D405B] flex justify-center items-center mb-6 shadow-[4px_4px_0px_#3D405B] ${desbloqueado ? 'bg-[#F2CC8F]' : 'bg-gray-300'}`}>
                <span className="text-4xl">🎖️</span>
              </div>
              <h3 className="text-2xl font-black text-[#3D405B] uppercase leading-tight mb-2">
                {lugar.ecoSello?.replace(' ♻️', '') || 'Sello Secreto'}
              </h3>
              <p className="text-[#81B29A] font-black uppercase text-sm mb-4">
                {lugar.nombre}
              </p>
              
              {!desbloqueado && (
                <div className="mt-auto bg-[#3D405B] text-white px-4 py-2 rounded-lg font-black text-xs uppercase border-2 border-[#3D405B]">
                  No Desbloqueado
                </div>
              )}
              {desbloqueado && (
                <div className="mt-auto bg-[#81B29A] text-white px-4 py-2 rounded-lg font-black text-xs uppercase border-2 border-[#3D405B] shadow-[2px_2px_0px_#3D405B]">
                  Sello Obtenido!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
