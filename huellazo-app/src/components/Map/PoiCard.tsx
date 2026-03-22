import React from 'react';
import { Place } from '../../hooks/useGameEngine';

type PoiCardProps = {
  poi: Place;
  isSending: boolean;
  onPay: () => void;
};

// Tarjeta Neobrutalista que aparece al colisionar con un negocio
export function PoiCard({ poi, isSending, onPay }: PoiCardProps) {
  return (
    <div className="absolute top-4 right-4 z-50 animate-bounce-short">
      <div className={`w-72 bg-[#FAF9F6] border-4 border-[#3D405B] rounded-2xl p-5 shadow-[8px_8px_0px_#3D405B]`}>
        
        {/* Etiqueta de Tipo de Negocio */}
        <div className="absolute -top-3 -left-3 bg-[#E07A5F] text-white font-black uppercase text-xs px-3 py-1 border-2 border-[#3D405B] rounded shadow-[2px_2px_0px_#3D405B] rotate-[-5deg]">
          {poi.tipo}
        </div>

        <img 
          src={poi.img} 
          alt={poi.nombre} 
          className="w-full h-32 object-cover rounded-lg border-2 border-[#3D405B] mb-4 bg-gray-200" 
        />
        
        <h3 className="text-xl font-black text-[#3D405B] uppercase leading-tight mb-2">
          {poi.nombre}
        </h3>
        
        <div className="flex justify-between items-center mb-4 bg-[#81B29A]/10 p-2 rounded border-2 border-dashed border-[#81B29A]">
          <div>
            <p className="text-[10px] font-black text-[#3D405B] uppercase">Recompensa</p>
            <p className="text-sm font-black text-[#81B29A]">+{poi.xp} XP</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-[#3D405B] uppercase">Costo</p>
            <p className="text-sm font-black text-[#E07A5F]">{poi.costoSol} SOL</p>
          </div>
        </div>

        {poi.ecoSello && (
          <p className="text-xs font-bold text-[#3D405B] bg-[#F2CC8F] border-2 border-[#3D405B] px-2 py-1 rounded inline-block mb-4 shadow-[2px_2px_0px_#3D405B]">
            [SELLO] Desbloquea: {poi.ecoSello}
          </p>
        )}

        <button
          onClick={onPay}
          disabled={isSending}
          className={`
            w-full bg-[#81B29A] text-white font-black uppercase py-3 rounded-xl border-4 border-[#3D405B]
            transition-all disabled:opacity-50 disabled:cursor-not-allowed
            ${isSending ? 'opacity-50 translate-y-1 shadow-none' : 'shadow-[4px_4px_0px_#3D405B] hover:shadow-[2px_2px_0px_#3D405B] hover:translate-y-1'}
          `}
        >
          {isSending ? 'Procesando Tx...' : 'Visitar y Pagar'}
        </button>
      </div>
    </div>
  );
}
