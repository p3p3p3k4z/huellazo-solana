import { useWalletConnection } from "@solana/react-hooks";
import { useDemoHuellazo, LUGARES_DISPONIBLES } from "../hooks/useDemoHuellazo";

export function HuellazoDemo() {
  const { wallet, status } = useWalletConnection();
  const { balanceSol, xp, levelName, puntosEco, lugaresVisitados, sellos, simularVisita, cerrarPasaporte } = useDemoHuellazo();

  // Estilos base Neobrutalistas
  const BORDER = "border-4 border-[#3D405B]";
  const SHADOW = "shadow-[6px_6px_0px_#3D405B]";
  const SHADOW_HOVER = "hover:shadow-[2px_2px_0px_#3D405B] hover:translate-y-1 transition-all";

  if (status !== "connected") {
    return (
      <div className={`p-10 bg-[#FAF9F6] rounded-3xl text-center ${BORDER} ${SHADOW} max-w-md mx-auto mt-20`}>
        <span className="text-7xl mb-6 block animate-bounce">🌮</span>
        <h2 className="text-3xl font-black text-[#3D405B] mb-2 uppercase">Huellazo</h2>
        <p className="text-[#E07A5F] font-bold mb-6">Turismo Sustentable</p>
        <p className="text-[#3D405B] font-medium opacity-80">Conecta tu wallet para iniciar la simulación.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-6 pb-20">
      
      {/* --- SECCIÓN 1: EL PASAPORTE (PERFIL) --- */}
      <section className={`bg-[#FAF9F6] p-6 rounded-2xl ${BORDER} ${SHADOW} flex flex-col lg:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className={`w-24 h-24 bg-[#F2CC8F] rounded-full flex items-center justify-center text-5xl ${BORDER}`}>
            🤠
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#3D405B] uppercase">Turista Explorer</h2>
            <p className="font-mono text-sm text-[#81B29A] font-bold bg-[#81B29A]/10 px-2 py-1 rounded-md inline-block mt-1">
              Wallet: {wallet?.account.address.toString().slice(0, 6)}...
            </p>
            <p className="text-[#E07A5F] font-black mt-1">💰 {balanceSol.toFixed(2)} SOL</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <div className={`bg-[#81B29A] p-3 rounded-xl text-center ${BORDER}`}>
            <p className="text-[10px] font-black text-white uppercase tracking-wider">Nivel</p>
            <p className="text-xl font-black text-white">{levelName}</p>
          </div>
          <div className={`bg-[#E07A5F] p-3 rounded-xl text-center ${BORDER}`}>
            <p className="text-[10px] font-black text-white uppercase tracking-wider">Experiencia</p>
            <p className="text-xl font-black text-white">{xp} XP</p>
          </div>
          <div className={`bg-[#F2CC8F] p-3 rounded-xl text-center ${BORDER}`}>
            <p className="text-[10px] font-black text-[#3D405B] uppercase tracking-wider">Puntos Eco</p>
            <p className="text-xl font-black text-[#3D405B]">{puntosEco}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- SECCIÓN 2: MINIMAPA DE NEGOCIOS --- */}
        <section className={`lg:col-span-2 bg-[#FAF9F6] p-6 rounded-2xl ${BORDER} ${SHADOW}`}>
          <div className="flex justify-between items-center mb-6 border-b-4 border-[#3D405B] pb-4">
            <h3 className="text-2xl font-black text-[#3D405B] uppercase">📍 Ruta Sugerida</h3>
            <span className="text-3xl">🗺️</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LUGARES_DISPONIBLES.map((lugar) => {
              const visitado = lugaresVisitados.includes(lugar.id);
              return (
                <div key={lugar.id} className={`flex flex-col p-4 rounded-xl ${BORDER} ${visitado ? 'bg-gray-200 opacity-60' : lugar.color}`}>
                  <div className="flex-1 mb-4">
                    <p className={`font-black text-lg ${lugar.tier === 2 ? 'text-white' : 'text-[#3D405B]'}`}>
                      {lugar.nombre} {lugar.tier === 2 && '🌟'}
                    </p>
                    <p className={`text-xs font-bold ${lugar.tier === 2 ? 'text-gray-300' : 'text-[#3D405B]/70'} uppercase`}>
                      {lugar.tipo}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="bg-white/90 px-2 py-1 rounded text-xs font-black text-[#3D405B]">+{lugar.xp} XP</span>
                      {lugar.tier === 2 && <span className="bg-[#81B29A] px-2 py-1 rounded text-xs font-black text-white">Certificador</span>}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => simularVisita(lugar)}
                    disabled={visitado}
                    className={`w-full py-2 rounded-lg border-2 border-[#3D405B] font-black uppercase text-sm ${
                      visitado ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : `bg-[#FAF9F6] text-[#3D405B] ${SHADOW_HOVER}`
                    }`}
                  >
                    {visitado ? '✅ Visitado' : `Pagar ${lugar.costoSol} SOL`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- SECCIÓN 3: SIDEBAR (Sellos y Bitácora) --- */}
        <div className="space-y-8">
          
          {/* Módulo de Eco-Flags */}
          <section className={`bg-[#3D405B] p-6 rounded-2xl ${BORDER} ${SHADOW}`}>
            <h3 className="text-lg font-black text-white uppercase mb-4 border-b-2 border-white/20 pb-2">🎖️ Eco-Sellos</h3>
            {sellos.length === 0 ? (
              <p className="text-white/60 text-sm font-medium">Visita lugares Tier 2 para desbloquear certificaciones.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sellos.map((sello, i) => (
                  <span key={i} className={`bg-[#81B29A] text-white px-3 py-2 rounded-xl border-2 border-white font-black text-sm animate-pulse`}>
                    {sello}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Módulo de Bitácora */}
          <section className={`bg-[#E07A5F] p-6 rounded-2xl ${BORDER} ${SHADOW}`}>
            <h3 className="text-lg font-black text-white uppercase mb-4 border-b-2 border-white/20 pb-2">📔 Bitácora</h3>
            <ul className="space-y-2">
              {lugaresVisitados.length === 0 ? (
                <li className="text-white/70 text-sm font-medium">Sin visitas recientes.</li>
              ) : (
                lugaresVisitados.map((id) => {
                  const lugar = LUGARES_DISPONIBLES.find(l => l.id === id);
                  return (
                    <li key={id} className="bg-[#FAF9F6] text-[#3D405B] p-2 rounded-lg font-bold text-sm flex justify-between border-2 border-[#3D405B]">
                      <span>{lugar?.nombre}</span>
                      <span>+{lugar?.pts} pts</span>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          {/* Módulo Peligroso (Cerrar Cuenta) */}
          <button 
            onClick={cerrarPasaporte}
            className={`w-full bg-red-500 text-white font-black uppercase py-4 rounded-2xl ${BORDER} ${SHADOW_HOVER}`}
          >
            🔥 Cerrar Pasaporte (+0.1 SOL)
          </button>

        </div>
      </div>
    </div>
  );
}