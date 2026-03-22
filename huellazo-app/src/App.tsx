import { useWalletConnection } from "@solana/react-hooks";
import { HuellazoDemo } from "./components/HuellazoDemo"; // Ajusta la ruta

export default function App() {
  const { connectors, connect, disconnect, wallet, status } = useWalletConnection();
  const address = wallet?.account.address.toString();

  return (
    // Fondo claro cálido, típico de la arquitectura mexicana minimalista
    <div className="relative min-h-screen overflow-x-clip bg-[#FAF9F6] text-[#3D405B] font-sans selection:bg-[#F2CC8F]">
      
      {/* HEADER (Estilo Cartelera) */}
      <header className="border-b-4 border-[#3D405B] bg-[#E07A5F] py-4 px-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌿</span>
            <h1 className="text-2xl font-black tracking-widest text-[#FAF9F6] uppercase">
              Huellazo
            </h1>
          </div>
          
          {/* BOTÓN DE WALLET SIMPLE */}
          {status === "connected" ? (
            <button
              onClick={() => disconnect()}
              className="bg-[#FAF9F6] text-[#3D405B] font-black px-4 py-2 rounded-xl border-4 border-[#3D405B] shadow-[4px_4px_0px_#3D405B] hover:-translate-y-1 transition-transform text-sm"
            >
              Desconectar ({address?.slice(0,4)}...)
            </button>
          ) : (
            <div className="flex gap-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect(connector.id)}
                  disabled={status === "connecting"}
                  className="bg-[#F2CC8F] text-[#3D405B] font-black px-4 py-2 rounded-xl border-4 border-[#3D405B] shadow-[4px_4px_0px_#3D405B] hover:-translate-y-1 transition-transform text-sm"
                >
                  Conectar {connector.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8">
        {/* COMPONENTE PRINCIPAL */}
        <HuellazoDemo />
      </main>
      
    </div>
  );
}