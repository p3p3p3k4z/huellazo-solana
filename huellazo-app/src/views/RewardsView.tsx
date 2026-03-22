import React from 'react';

type RewardsViewProps = {
  web3State: any;
};

// Tienda simulada para canjear Puntos Eco (Huellazos)
export function RewardsView({ web3State }: RewardsViewProps) {
  const { ptsLocal } = web3State;
  
  const RECOMPENSAS = [
    { id: 1, nombre: "Descuento en Café Local", pts: 200, icon: "/assets/coffee.png", bg: "bg-[#F2CC8F]" },
    { id: 2, nombre: "Entrada Gratis Cenote", pts: 500, icon: "/assets/water.png", bg: "bg-[#81B29A]" },
    { id: 3, nombre: "Noche Hotel Eco", pts: 2000, icon: "/assets/hotel.png", bg: "bg-[#E07A5F]" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-[#3D405B] border-4 border-[#3D405B] rounded-2xl p-8 shadow-[8px_8px_0px_#F2CC8F] mb-12 flex flex-col md:flex-row justify-between items-center text-white">
        <div>
          <h2 className="text-4xl font-black uppercase mb-2 text-[#F2CC8F]">Bóveda de Recompensas</h2>
          <p className="font-bold opacity-80 uppercase">Canjea tus Puntos Eco "Huellazos" por beneficios reales.</p>
        </div>
        <div className="mt-6 md:mt-0 text-center bg-white text-[#3D405B] p-4 rounded-xl border-4 border-[#F2CC8F] min-w-[200px] shadow-[4px_4px_0px_#F2CC8F] rotate-3">
          <p className="text-sm font-black uppercase">Tu Saldo</p>
          <p className="text-5xl font-black">{ptsLocal}</p>
          <p className="text-xs font-black uppercase text-[#81B29A] mt-1">Puntos Eco</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {RECOMPENSAS.map(rec => {
          const puedeComprar = ptsLocal >= rec.pts;
          return (
            <div key={rec.id} className={`border-4 border-[#3D405B] bg-white rounded-2xl overflow-hidden flex flex-col shadow-[6px_6px_0px_#3D405B]`}>
              <div className={`${rec.bg} p-8 text-center border-b-4 border-[#3D405B] flex justify-center items-center h-32`}>
                <img src={rec.icon} alt="Icono" className="w-16 h-16 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-black text-[#3D405B] uppercase mb-4 leading-tight">{rec.nombre}</h3>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-[#E07A5F] uppercase text-sm">Costo</span>
                    <span className="font-black text-2xl text-[#3D405B]">{rec.pts} pts</span>
                  </div>
                  
                  <button 
                    disabled={!puedeComprar}
                    className={`w-full py-4 rounded-xl font-black uppercase border-4 border-[#3D405B] transition-all
                      ${puedeComprar 
                        ? 'bg-[#81B29A] text-white shadow-[4px_4px_0px_#3D405B] hover:-translate-y-1 hover:shadow-[2px_2px_0px_#3D405B]' 
                        : 'bg-gray-200 text-gray-500 opacity-70 cursor-not-allowed shadow-none'}
                    `}
                  >
                    {puedeComprar ? 'Canjear' : 'Puntos Insuficientes'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
