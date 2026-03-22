import { useWalletConnection } from "@solana/react-hooks";
import { useDemoHuellazo, LUGARES_DISPONIBLES } from "../hooks/useDemoHuellazo";

export function HuellazoDemo() {
  const { wallet, status } = useWalletConnection();
  const { xp, level, puntosEco, lugaresVisitados, simularVisita, resetDemo } = useDemoHuellazo();

  // Colores del tema
  const COLOR_TEXTO = "text-[#3D405B]";
  const BORDER_GRUESO = "border-4 border-[#3D405B]";
  const SOMBRA_CARICATURA = "shadow-[6px_6px_0px_#3D405B]";

  if (status !== "connected") {
    return (
      <div className={`p-8 bg-[#FAF9F6] rounded-2xl text-center ${BORDER_GRUESO} ${SOMBRA_CARICATURA} max-w-md mx-auto mt-10`}>
        <span className="text-6xl mb-4 block">🌵</span>
        <h2 className={`text-2xl font-bold ${COLOR_TEXTO} mb-2`}>¡Bienvenido a Huellazo!</h2>
        <p className={`${COLOR_TEXTO} opacity-80 font-medium`}>Conecta tu wallet para comenzar tu viaje sustentable.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-6">
      
      {/* SECCIÓN: PERFIL (Pasaporte) */}
      <section className={`bg-[#FAF9F6] p-6 rounded-2xl ${BORDER_GRUESO} ${SOMBRA_CARICATURA} flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 bg-[#F2CC8F] rounded-full flex items-center justify-center text-4xl ${BORDER_GRUESO}`}>
            🤠
          </div>
          <div>
            <h2 className={`text-2xl font-black ${COLOR_TEXTO} uppercase tracking-wide`}>Pasaporte Viajero</h2>
            <p className="font-mono text-sm text-[#E07A5F] font-bold">
              {wallet?.account.address.toString().slice(0, 4)}...{wallet?.account.address.toString().slice(-4)}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className={`bg-[#81B29A] px-4 py-2 rounded-xl text-center ${BORDER_GRUESO}`}>
            <p className="text-xs font-bold text-white uppercase">Nivel</p>
            <p className="text-2xl font-black text-[#FAF9F6]">{level}</p>
          </div>
          <div className={`bg-[#E07A5F] px-4 py-2 rounded-xl text-center ${BORDER_GRUESO}`}>
            <p className="text-xs font-bold text-white uppercase">Experiencia</p>
            <p className="text-2xl font-black text-[#FAF9F6]">{xp} XP</p>
          </div>
          <div className={`bg-[#F2CC8F] px-4 py-2 rounded-xl text-center ${BORDER_GRUESO}`}>
            <p className="text-xs font-bold text-[#3D405B] uppercase">Puntos Eco</p>
            <p className="text-2xl font-black text-[#3D405B]">{puntosEco}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* SECCIÓN: MINI-MAPA INTERACTIVO */}
        <section className={`bg-[#81B29A] p-6 rounded-2xl ${BORDER_GRUESO} ${SOMBRA_CARICATURA}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black text-[#FAF9F6] uppercase">📍 Mapa de Ruta</h3>
            <span className="text-2xl">🗺️</span>
          </div>
          <p className="text-[#FAF9F6] font-medium mb-4">Visita negocios locales para ganar experiencia.</p>
          
          <div className="space-y-4">
            {LUGARES_DISPONIBLES.map((lugar) => {
              const visitado = lugaresVisitados.includes(lugar.id);
              return (
                <button
                  key={lugar.id}
                  onClick={() => simularVisita(lugar.id, lugar.xp)}
                  disabled={visitado}
                  className={`w-full flex items-center justify-between p-4 rounded-xl ${BORDER_GRUESO} transition-transform ${
                    visitado 
                      ? 'bg-[#FAF9F6] opacity-60 cursor-not-allowed' 
                      : `${lugar.color} hover:-translate-y-1 hover:shadow-[4px_4px_0px_#3D405B]`
                  }`}
                >
                  <div className="text-left">
                    <p className={`font-black ${COLOR_TEXTO}`}>{lugar.nombre}</p>
                    <p className={`text-xs font-bold ${COLOR_TEXTO} opacity-80`}>{lugar.tipo}</p>
                  </div>
                  <div className={`font-black ${COLOR_TEXTO}`}>
                    {visitado ? '✅ Visitado' : `+${lugar.xp} XP`}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECCIÓN: HISTORIAL DE VISITAS */}
        <section className={`bg-[#F2CC8F] p-6 rounded-2xl ${BORDER_GRUESO} ${SOMBRA_CARICATURA} flex flex-col`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-black ${COLOR_TEXTO} uppercase`}>📔 Tu Bitácora</h3>
            <span className="text-2xl">📸</span>
          </div>

          <div className={`flex-1 bg-[#FAF9F6] rounded-xl p-4 ${BORDER_GRUESO} overflow-y-auto min-h-[200px]`}>
            {lugaresVisitados.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <span className="text-4xl mb-2">🏜️</span>
                <p className={`font-bold ${COLOR_TEXTO}`}>Aún no tienes aventuras.</p>
                <p className={`text-sm ${COLOR_TEXTO}`}>Explora el mapa para comenzar.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lugaresVisitados.map((id, index) => {
                  const lugar = LUGARES_DISPONIBLES.find(l => l.id === id);
                  return (
                    <li key={index} className={`p-3 bg-white rounded-lg ${BORDER_GRUESO} flex items-center gap-3`}>
                      <span className="text-xl">🌟</span>
                      <div>
                        <p className={`font-bold ${COLOR_TEXTO} text-sm`}>{lugar?.nombre}</p>
                        <p className={`text-xs ${COLOR_TEXTO} opacity-70`}>Sello digital registrado</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          
          <button 
            onClick={resetDemo}
            className={`mt-4 w-full py-2 bg-[#E07A5F] text-[#FAF9F6] font-black rounded-xl ${BORDER_GRUESO} hover:-translate-y-1 hover:shadow-[4px_4px_0px_#3D405B] transition-transform`}
          >
            Reiniciar Demo 🔄
          </button>
        </section>

      </div>
    </div>
  );
}