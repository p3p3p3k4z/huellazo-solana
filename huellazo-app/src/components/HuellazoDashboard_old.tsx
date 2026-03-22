import { useHuellazo } from "../hooks/useHuellazo";

export function HuellazoDashboard() {
  const { 
    status, 
    isSending, 
    txStatus, 
    passportData, 
    refreshPassport, 
    initConfig, 
    initPassport, 
    registerMerchant,
    recordVisit 
  } = useHuellazo();

  if (status !== "connected") {
    return (
      <section className="w-full max-w-2xl mx-auto space-y-4 rounded-2xl border border-green-900 bg-gray-900 p-6 shadow-2xl text-white mt-10 text-center">
        <h2 className="text-2xl font-bold text-green-400">Terminal Huellazo 🌿</h2>
        <p className="text-gray-400">Conecta tu wallet para acceder a las pruebas.</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-2xl mx-auto space-y-6 rounded-2xl border border-green-900 bg-gray-900 p-6 shadow-2xl text-white mt-10">
      
      {/* SECCIÓN 1: DATOS DEL PASAPORTE */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-green-400">Mi Pasaporte 🌿</h2>
            <p className="text-sm text-gray-400 mt-1">Tus estadísticas en tiempo real.</p>
          </div>
          <button onClick={refreshPassport} className="text-xs bg-gray-800 p-2 rounded hover:bg-gray-700 transition">
            🔄 Recargar
          </button>
        </div>

        {passportData ? (
          <div className="grid grid-cols-3 gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Nivel</p>
              <p className="text-2xl font-bold text-yellow-500">{passportData.level}</p>
            </div>
            <div className="text-center border-l border-r border-gray-700">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Experiencia (XP)</p>
              <p className="text-2xl font-bold text-blue-400">{passportData.experience.toString()}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Puntos Eco</p>
              <p className="text-2xl font-bold text-green-400">{passportData.fidelityPoints.toString()}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/30 p-4 rounded-xl border border-dashed border-gray-600 text-center">
            <p className="text-gray-400">Aún no tienes un pasaporte activo.</p>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: ACCIONES DE PRUEBA */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Laboratorio de Transacciones 🧪</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={initConfig}
            disabled={isSending}
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold transition hover:bg-blue-500 disabled:opacity-50"
          >
            1. Inicializar Global Config
          </button>

          <button
            onClick={initPassport}
            disabled={isSending || !!passportData}
            className="rounded-lg bg-green-600 px-4 py-3 text-sm font-bold transition hover:bg-green-500 disabled:opacity-50"
          >
            2. Emitir Mi Pasaporte
          </button>

          <button
            onClick={registerMerchant}
            disabled={isSending}
            className="rounded-lg bg-purple-600 px-4 py-3 text-sm font-bold transition hover:bg-purple-500 disabled:opacity-50"
          >
            3. Registrarme como Comercio
          </button>

          <button
            onClick={recordVisit}
            disabled={isSending || !passportData}
            className="rounded-lg bg-yellow-600 px-4 py-3 text-sm font-bold transition hover:bg-yellow-500 disabled:opacity-50 text-black"
          >
            4. Simular Visita (+1500 XP)
          </button>
        </div>
      </div>

      {txStatus && (
        <div className="mt-4 rounded-lg border border-gray-700 bg-black p-4 text-sm font-mono text-green-400">
          {txStatus}
        </div>
      )}
    </section>
  );
}