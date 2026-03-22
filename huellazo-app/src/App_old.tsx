import { useWalletConnection } from "@solana/react-hooks";
import { HuellazoDashboard } from "./components/HuellazoDashboard_old"; // Ajusta la ruta si es necesario

export default function App() {
  const { connectors, connect, disconnect, wallet, status } = useWalletConnection();
  const address = wallet?.account.address.toString();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-gray-950 text-white selection:bg-green-500/30">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col gap-10 border-x border-gray-800 px-6 py-12">
        
        {/* --- HEADER --- */}
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-green-500 font-bold">
            Devnet Environment
          </p>
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌿</span>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
              Huellazo Protocol
            </h1>
          </div>
          <p className="max-w-3xl text-base leading-relaxed text-gray-400">
            Turismo transparente y sustentable impulsado por Solana. Conecta tu wallet para emitir tu pasaporte inmutable, registrar comercios y ganar experiencia ecológica.
          </p>
        </header>

        {/* --- CONEXIÓN DE WALLET (Lógica original, diseño adaptado) --- */}
        <section className="w-full max-w-3xl space-y-4 rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-white">Wallet Connection</p>
              <p className="text-sm text-gray-400">
                Selecciona tu wallet para interactuar con la blockchain.
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              status === "connected" ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-400"
            }`}>
              {status === "connected" ? "Conectada" : "Desconectada"}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect(connector.id)}
                disabled={status === "connecting" || status === "connected"}
                className="group flex items-center justify-between rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-left text-sm font-medium transition hover:border-green-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex flex-col">
                  <span className="text-base text-white">{connector.name}</span>
                  <span className="text-xs text-gray-400">
                    {status === "connecting"
                      ? "Conectando…"
                      : status === "connected" && wallet?.connector.id === connector.id
                        ? "Activa"
                        : "Toca para conectar"}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    status === "connected" && wallet?.connector.id === connector.id 
                      ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" 
                      : "bg-gray-600 group-hover:bg-green-500/50"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-gray-800 pt-4 text-sm">
            <span className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300">
              {address ?? "Ninguna wallet conectada"}
            </span>
            <button
              onClick={() => disconnect()}
              disabled={status !== "connected"}
              className="inline-flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-900/20 px-3 py-2 font-medium text-red-400 transition hover:bg-red-900/40 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              Desconectar
            </button>
          </div>
        </section>

        {/* --- PANEL PRINCIPAL DE HUELLAZO --- */}
        <HuellazoDashboard />

      </main>
    </div>
  );
}