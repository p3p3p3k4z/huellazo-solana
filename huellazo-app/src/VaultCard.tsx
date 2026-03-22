import { useState, useEffect, useCallback } from "react";
import {
  useWalletConnection,
  useSendTransaction,
} from "@solana/react-hooks";
import {
  getProgramDerivedAddress,
  getAddressEncoder,
  getBytesEncoder,
  type Address,
} from "@solana/kit";
import {
  getInitializePassportInstructionDataEncoder, // Asumo que Codama generó esto
  HUELLAZO_PROGRAM_ADDRESS, // Asegúrate de exportarlo desde tu index.ts generado
} from "./generated/vault"; // Ajusta la ruta a tu carpeta generada

const SYSTEM_PROGRAM_ADDRESS = "CB2sVYQ48i3rTdM51zKxipweoFpxEEmJVC1NgxLeT5Xj" as Address;

export function PassportCard() {
  const { wallet, status } = useWalletConnection();
  const { send, isSending } = useSendTransaction();

  const [passportAddress, setPassportAddress] = useState<Address | null>(null);
  const [configAddress, setConfigAddress] = useState<Address | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const walletAddress = wallet?.account.address;

  // Derivar las PDAs de Huellazo cuando la wallet se conecta
  useEffect(() => {
    async function deriveAddresses() {
      if (!walletAddress) {
        setPassportAddress(null);
        setConfigAddress(null);
        return;
      }

      // 1. Derivar la PDA del Pasaporte (Semillas: "passport" + wallet)
      const [passportPda] = await getProgramDerivedAddress({
        programAddress: HUELLAZO_PROGRAM_ADDRESS,
        seeds: [
          getBytesEncoder().encode(new Uint8Array([112, 97, 115, 115, 112, 111, 114, 116])), // "passport" en ASCII
          getAddressEncoder().encode(walletAddress),
        ],
      });

      // 2. Derivar la PDA de Configuración (Semilla: "config")
      const [configPda] = await getProgramDerivedAddress({
        programAddress: HUELLAZO_PROGRAM_ADDRESS,
        seeds: [
          getBytesEncoder().encode(new Uint8Array([99, 111, 110, 102, 105, 103])), // "config" en ASCII
        ],
      });

      setPassportAddress(passportPda);
      setConfigAddress(configPda);
    }

    deriveAddresses();
  }, [walletAddress]);

  // Función para Crear el Pasaporte
  const handleCreatePassport = useCallback(async () => {
    if (!walletAddress || !passportAddress || !configAddress) return;

    try {
      setTxStatus("Construyendo transacción...");

      // Construcción manual de la instrucción, tal como lo hacía el Vault
      const instruction = {
        programAddress: HUELLAZO_PROGRAM_ADDRESS,
        accounts: [
          { address: passportAddress, role: 1 }, // Writable (El pasaporte a inicializar)
          { address: walletAddress, role: 3 }, // WritableSigner (Quien paga y es dueño)
          { address: configAddress, role: 1 }, // Writable (Se actualiza el contador global)
          { address: SYSTEM_PROGRAM_ADDRESS, role: 0 }, // Readonly
        ],
        // Codama debería haber generado un encoder sin argumentos (o vacío) para esta función
        data: getInitializePassportInstructionDataEncoder().encode({}), 
      };

      setTxStatus("Esperando firma...");

      const signature = await send({
        instructions: [instruction],
      });

      setTxStatus(`¡Pasaporte creado! Firma: ${signature?.slice(0, 20)}...`);
    } catch (err) {
      console.error("Fallo al crear pasaporte:", err);
      setTxStatus(`Error: ${err instanceof Error ? err.message : "Error desconocido"}`);
    }
  }, [walletAddress, passportAddress, configAddress, send]);

  if (status !== "connected") {
    return (
      <section className="w-full max-w-3xl space-y-4 rounded-2xl border border-green-900 bg-gray-900 p-6 shadow-[0_20px_80px_-50px_rgba(22,163,74,0.15)] text-white">
        <div className="space-y-1">
          <p className="text-xl font-bold text-green-400">Terminal Huellazo</p>
          <p className="text-sm text-gray-400">
            Conecta tu wallet para acceder a tu pasaporte turístico sustentable.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl space-y-6 rounded-2xl border border-green-900 bg-gray-900 p-6 shadow-[0_20px_80px_-50px_rgba(22,163,74,0.15)] text-white">
      <div className="space-y-1">
        <p className="text-xl font-bold text-green-400">Mi Pasaporte</p>
        <p className="text-sm text-gray-400">
          Inicia tu viaje sustentable emitiendo tu credencial inmutable.
        </p>
      </div>

      <button
        onClick={handleCreatePassport}
        disabled={isSending}
        className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-bold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSending ? "Confirmando..." : "Emitir Pasaporte"}
      </button>

      {txStatus && (
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300 font-mono">
          {txStatus}
        </div>
      )}
    </section>
  );
}