import React from 'react';

type ProfileViewProps = {
  web3State: any;
};

// Muestra el pasaporte, nivel y control de wallet
export function ProfileView({ web3State }: ProfileViewProps) {
  const { 
    wallet, status, connect, disconnect, connectors,
    passportData, xpLocal, initPassport, isSending
  } = web3State;

  const BORDER = "border-4 border-[#3D405B]";
  const SHADOW = "shadow-[6px_6px_0px_#3D405B]";

  const calcularNivelString = (xp: number) => {
    if (xp >= 5000) return "Oro 🏆";
    if (xp >= 1000) return "Plata 🥈";
    return "Bronce 🥉";
  };

  if (status !== "connected") {
    return (
      <div className={`p-10 bg-white rounded-2xl text-center ${BORDER} ${SHADOW} max-w-md mx-auto mt-20`}>
        <span className="text-7xl mb-6 block animate-bounce">🌵</span>
        <h2 className="text-3xl font-black text-[#3D405B] mb-2 uppercase">Conectar Billetera</h2>
        <p className="text-[#E07A5F] font-bold mb-6">Para empezar tu aventura neobrutalista.</p>
        
        <div className="flex flex-col gap-3">
          {connectors.map((c: any) => (
            <button 
              key={c.id} 
              onClick={() => connect(c.id)} 
              disabled={status === "connecting"}
              className={`bg-[#F2CC8F] py-3 rounded-xl font-black text-[#3D405B] uppercase ${BORDER} hover:-translate-y-1 hover:shadow-[2px_2px_0px_#3D405B] transition-all disabled:opacity-50`}
            >
              Conectar {c.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-[#81B29A] p-4 rounded-xl border-4 border-[#3D405B] shadow-[4px_4px_0px_#3D405B]">
        <p className="font-black text-white uppercase tracking-wider">🟢 Conectado a Devnet</p>
        <button onClick={() => disconnect()} className="bg-white px-4 py-2 rounded-lg font-black text-[#3D405B] uppercase text-sm border-2 border-[#3D405B] hover:bg-[#F2CC8F] transition-colors">
          Desconectar
        </button>
      </div>

      <div className={`bg-white p-8 rounded-3xl ${BORDER} ${SHADOW}`}>
        <div className="flex flex-col md:flex-row items-center gap-8 border-b-4 border-[#3D405B] pb-8 mb-8">
          <div className="w-32 h-32 bg-[#F2CC8F] rounded-full border-4 border-[#3D405B] shadow-[4px_4px_0px_#3D405B] flex justify-center items-center overflow-hidden">
            <img src="/assets/player.png" alt="Avatar" className="w-[80%] h-[80%] object-contain block" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-[#3D405B] uppercase mb-2">Turista Oficial</h2>
            <p className="bg-[#3D405B] text-white px-4 py-1 inline-block rounded font-mono font-bold">
              {wallet?.account.address.toString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`bg-[#E07A5F] p-6 rounded-2xl ${BORDER} flex flex-col justify-center items-center text-white shadow-[4px_4px_0px_#3D405B]`}>
            <p className="font-black uppercase tracking-widest text-sm opacity-80 mb-2">Experiencia</p>
            <p className="text-6xl font-black">{xpLocal} <span className="text-2xl">XP</span></p>
          </div>
          
          <div className={`bg-[#81B29A] p-6 rounded-2xl ${BORDER} flex flex-col justify-center items-center text-white shadow-[4px_4px_0px_#3D405B]`}>
            <p className="font-black uppercase tracking-widest text-sm opacity-80 mb-2">Nivel Actual</p>
            <p className="text-5xl font-black">{calcularNivelString(xpLocal)}</p>
          </div>
        </div>

        {!passportData && (
          <div className="mt-8 text-center">
             <button 
              onClick={initPassport} 
              disabled={isSending}
              className={`bg-[#3D405B] text-[#F2CC8F] font-black text-xl px-8 py-4 rounded-xl ${BORDER} shadow-[4px_4px_0px_#F2CC8F] hover:-translate-y-1 hover:shadow-[2px_2px_0px_#F2CC8F] uppercase transition-all disabled:opacity-50`}
            >
              {isSending ? 'Acuñando Pasaporte...' : 'Generar Pasaporte On-Chain'}
            </button>
            <p className="text-[#E07A5F] font-bold mt-4 uppercase text-sm">Crea tu pasaporte real en Devnet para guardar datos</p>
          </div>
        )}
      </div>
    </div>
  );
}
