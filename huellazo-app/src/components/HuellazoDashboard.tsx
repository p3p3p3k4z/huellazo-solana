import { useWalletConnection } from "@solana/react-hooks";
import { useRealHuellazo, LUGARES_DISPONIBLES } from "../hooks/useRealHuellazo";

export function HuellazoDashboard() {
  const { wallet, connect, disconnect, connectors } = useWalletConnection();
  
  // Traemos los estados híbridos (Blockchain + Frontend)
  const { 
    status, isSending, txStatus, passportData, xpLocal, ptsLocal, sellosActivos, 
    refreshPassport, initPassport, recordVisit 
  } = useRealHuellazo();

  // Estilos Neobrutalistas Mexicanos
  const BORDER = "border-4 border-[#3D405B]";
  const SHADOW = "shadow-[6px_6px_0px_#3D405B]";
  const SHADOW_HOVER = "hover:shadow-[2px_2px_0px_#3D405B] hover:-translate-y-1 transition-all";

  // Función simple para calcular el rango visualmente
  const calcularNivelString = (xp: number) => {
    if (xp >= 5000) return "Oro 🏆";
    if (xp >= 1000) return "Plata 🥈";
    return "Bronce 🥉";
  };

  // --- PANTALLA DESCONECTADA ---
  if (status !== "connected") {
    return (
      <div className={`p-10 bg-[#FAF9F6] rounded-3xl text-center ${BORDER} ${SHADOW} max-w-md mx-auto mt-20`}>
        <span className="text-7xl mb-6 block animate-bounce">🌵</span>
        <h2 className="text-3xl font-black text-[#3D405B] mb-2 uppercase">Huellazo Demo</h2>
        <p className="text-[#E07A5F] font-bold mb-6">Turismo Sustentable On-Chain</p>
        
        <div className="flex flex-col gap-3">
          {connectors.map((c) => (
            <button 
              key={c.id} 
              onClick={() => connect(c.id)} 
              disabled={status === "connecting"}
              className={`bg-[#F2CC8F] py-3 rounded-xl font-black text-[#3D405B] ${BORDER} ${SHADOW_HOVER} disabled:opacity-50`}
            >
              {status === "connecting" ? "Conectando..." : `Conectar ${c.name}`}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- PANTALLA CONECTADA ---
  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-6 pb-20 px-4">
      
      {/* HEADER DE DESCONEXIÓN */}
      <div className="flex justify-between items-center bg-[#81B29A] p-4 rounded-xl border-4 border-[#3D405B]">
        <p className="font-black text-white">🟢 Conectado a Devnet</p>
        <button onClick={() => disconnect()} className="bg-white px-4 py-1 rounded-lg font-bold text-[#3D405B] text-sm hover:bg-gray-200">
          Desconectar
        </button>
      </div>

      {/* --- SECCIÓN 1: EL PASAPORTE EN BLOCKCHAIN --- */}
      <section className={`bg-[#FAF9F6] p-6 rounded-2xl ${BORDER} ${SHADOW} flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className={`w-20 h-20 bg-[#F2CC8F] rounded-full flex items-center justify-center text-4xl ${BORDER}`}>🤠</div>
          <div>
            <h2 className="text-2xl font-black text-[#3D405B] uppercase">Turista Digital</h2>
            <p className="font-mono text-sm text-[#E07A5F] font-bold">
              {wallet?.account.address.toString().slice(0, 8)}...
            </p>
          </div>
        </div>

        {passportData ? (
          <div className="flex gap-3 w-full md:w-auto">
            <div className={`bg-[#81B29A] px-4 py-2 rounded-xl text-center ${BORDER} flex-1`}>
              <p className="text-[10px] font-black text-white uppercase">Rango</p>
              <p className="text-lg font-black text-white">{calcularNivelString(xpLocal)}</p>
            </div>
            <div className={`bg-[#E07A5F] px-4 py-2 rounded-xl text-center ${BORDER} flex-1`}>
              <p className="text-[10px] font-black text-white uppercase">Experiencia</p>
              <p className="text-lg font-black text-white">{xpLocal} XP</p>
            </div>
          </div>
        ) : (
          <button 
            onClick={initPassport} 
            disabled={isSending}
            className={`bg-[#81B29A] text-white font-black px-6 py-4 rounded-xl ${BORDER} ${SHADOW_HOVER} w-full md:w-auto uppercase disabled:opacity-50`}
          >
            {isSending ? 'Firmando en Devnet...' : 'Crear Pasaporte Real'}
          </button>
        )}
      </section>

      {/* CONSOLA DE TRANSACCIONES */}
      {txStatus && (
        <div className="bg-[#3D405B] text-[#F2CC8F] font-mono p-4 rounded-xl border-4 border-[#3D405B] text-sm text-center animate-pulse font-bold">
          {txStatus}
        </div>
      )}

      {/* --- SECCIÓN 2: MINIMAPA (Escribir en la Blockchain) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className={`lg:col-span-2 bg-[#FAF9F6] p-6 rounded-2xl ${BORDER} ${SHADOW}`}>
          <div className="flex justify-between items-center mb-6 border-b-4 border-[#3D405B] pb-4">
            <h3 className="text-2xl font-black text-[#3D405B] uppercase">📍 Mapa Interactivo</h3>
            <button onClick={refreshPassport} className="text-2xl hover:rotate-180 transition-transform">🔄</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LUGARES_DISPONIBLES.map((lugar) => (
              <div key={lugar.id} className={`flex flex-col p-4 rounded-xl ${BORDER} ${lugar.color}`}>
                <div className="flex-1 mb-4">
                  <p className={`font-black text-lg ${lugar.tier === 2 ? 'text-white' : 'text-[#3D405B]'}`}>
                    {lugar.nombre}
                  </p>
                  <p className={`text-xs font-bold ${lugar.tier === 2 ? 'text-gray-300' : 'text-[#3D405B]/70'} uppercase`}>
                    {lugar.tipo}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="bg-white/90 px-2 py-1 rounded text-xs font-black text-[#3D405B]">+{lugar.xp.toString()} XP</span>
                    {lugar.tier === 2 && <span className="bg-[#81B29A] px-2 py-1 rounded text-xs font-black text-white border-2 border-white">Sello Eco</span>}
                  </div>
                </div>
                
                <button
                  onClick={() => recordVisit(lugar)}
                  disabled={isSending || !passportData}
                  className={`w-full py-2 rounded-lg border-2 border-[#3D405B] font-black uppercase text-sm bg-[#FAF9F6] text-[#3D405B] ${SHADOW_HOVER} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Pagar {lugar.costoSol} SOL
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* --- SECCIÓN 3: SIDEBAR (Tokenomics y Sellos) --- */}
        <div className="space-y-6">
          
          <section className={`bg-[#3D405B] p-6 rounded-2xl ${BORDER} ${SHADOW}`}>
            <h3 className="text-lg font-black text-white uppercase mb-4 border-b-2 border-white/20 pb-2">🎖️ Eco-Sellos</h3>
            {sellosActivos.length === 0 ? (
              <p className="text-white/60 text-sm font-medium">Visita lugares nivel 2 para desbloquear insignias.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sellosActivos.map((idSello) => {
                  const lugar = LUGARES_DISPONIBLES.find(l => l.actionId === idSello);
                  return (
                    <span key={idSello} className="bg-[#81B29A] text-white px-3 py-2 rounded-xl border-2 border-white font-black text-sm">
                      {lugar?.ecoSello || `Sello #${idSello}`}
                    </span>
                  );
                })}
              </div>
            )}
          </section>

          <section className={`bg-[#E07A5F] p-6 rounded-2xl ${BORDER} ${SHADOW}`}>
             <h3 className="text-lg font-black text-white uppercase mb-2">💎 Tokenomics</h3>
             <p className="text-white/80 text-sm mb-4">Puntos de fidelidad (Huellazos) acumulados:</p>
             <p className="text-4xl font-black text-white">{ptsLocal}</p>
          </section>
          
        </div>
      </div>
    </div>
  );
}