import { useState, useEffect, useCallback } from "react";
import { 
  getProgramDerivedAddress, 
  getAddressEncoder, 
  getBytesEncoder, 
  createSolanaRpc, 
  type Address 
} from "@solana/kit";
import { useWalletConnection, useSendTransaction } from "@solana/react-hooks";
import { fetchMaybePassport } from "../generated/vault/accounts"; 
import { getInitializePassportInstructionDataEncoder } from "../generated/vault/instructions";

const HUELLAZO_PROGRAM_ADDRESS = "CB2sVYQ48i3rTdM51zKxipweoFpxEEmJVC1NgxLeT5Xj" as Address;
const SYSTEM_PROGRAM_ADDRESS = "11111111111111111111111111111111" as Address;

// Billetera "basura" a la que enviaremos el SOL para simular el pago en la red
const RECEPTOR_PAGO_SIMULADO = "6KpQ1wYFKf3ChQ2UxSVdLP58T1Hrv5aFuNxDA1tyKEKu" as Address;

const rpc = createSolanaRpc("https://api.devnet.solana.com"); 

export const LUGARES_DISPONIBLES = [
  { id: 'taller', nombre: 'Alebrijes "El Nahual"', tipo: 'Artesanía', xp: 500, pts: 50, costoLamports: 10000000n, costoSol: "0.01", tier: 1, color: 'bg-[#F2CC8F]' },
  { id: 'cenote', nombre: 'Cenote Azul', tipo: 'Aventura Eco', xp: 800, pts: 80, costoLamports: 20000000n, costoSol: "0.02", tier: 1, color: 'bg-[#81B29A]' },
  { id: 'hotel', nombre: 'Eco-Hotel Paraíso', tipo: 'Hospedaje', xp: 1500, pts: 150, costoLamports: 50000000n, costoSol: "0.05", tier: 2, actionId: 2, ecoSello: 'Cero Plásticos ♻️', color: 'bg-[#3D405B]' },
];

export function useRealHuellazo() {
  const { wallet, status } = useWalletConnection();
  const { send, isSending } = useSendTransaction();
  const walletAddress = wallet?.account.address;
  
  const [txStatus, setTxStatus] = useState<string | null>(null);
  
  // ESTADOS HÍBRIDOS (Blockchain + Frontend)
  const [passportData, setPassportData] = useState<any>(null); 
  const [xpLocal, setXpLocal] = useState(0);
  const [ptsLocal, setPtsLocal] = useState(0);
  const [sellosActivos, setSellosActivos] = useState<number[]>([]);
  const [pdas, setPdas] = useState<{ config: Address | null; passport: Address | null }>({ config: null, passport: null });

  // 1. Derivar PDAs
  useEffect(() => {
    async function deriveAddresses() {
      if (!walletAddress) return;
      const encoder = getBytesEncoder();
      const addrEncoder = getAddressEncoder();

      const [configPda] = await getProgramDerivedAddress({
        programAddress: HUELLAZO_PROGRAM_ADDRESS,
        seeds: [encoder.encode(new Uint8Array([99, 111, 110, 102, 105, 103]))],
      });

      const [passportPda] = await getProgramDerivedAddress({
        programAddress: HUELLAZO_PROGRAM_ADDRESS,
        seeds: [
          encoder.encode(new Uint8Array([112, 97, 115, 115, 112, 111, 114, 116])),
          addrEncoder.encode(walletAddress),
        ],
      });

      setPdas({ config: configPda, passport: passportPda });
    }
    deriveAddresses();
  }, [walletAddress]);

  // 2. Leer datos iniciales de la blockchain
  const fetchPassportData = useCallback(async () => {
    if (!pdas.passport) return;
    try {
      const account = await fetchMaybePassport(rpc, pdas.passport);
      if (account && account.exists) {
        setPassportData(account.data); 
        // Inicializamos los contadores locales con lo que haya en la blockchain
        setXpLocal(Number(account.data.experience));
        setPtsLocal(Number(account.data.fidelityPoints));
      } else {
        setPassportData(null);
      }
    } catch (error) {
      console.error("Error leyendo pasaporte:", error);
    }
  }, [pdas.passport]);

  useEffect(() => { fetchPassportData(); }, [fetchPassportData]);

  // --- TRANSACCIONES ---

  // REAL BLOCKCHAIN TX: Crea la cuenta en el contrato
  const initPassport = useCallback(async () => {
    if (!walletAddress || !pdas.passport || !pdas.config) return;
    try {
      setTxStatus("Firmando Emisión de Pasaporte en Devnet...");
      const instruction = {
        programAddress: HUELLAZO_PROGRAM_ADDRESS,
        accounts: [
          { address: pdas.passport, role: 1 },
          { address: walletAddress, role: 3 },
          { address: pdas.config, role: 1 },
          { address: SYSTEM_PROGRAM_ADDRESS, role: 0 },
        ],
        data: getInitializePassportInstructionDataEncoder().encode({}),
      };
      const signature = await send({ instructions: [instruction] });
      setTxStatus(`✅ ¡Pasaporte Creado! TX: ${signature?.slice(0, 15)}...`);
      setTimeout(() => fetchPassportData(), 3000); 
    } catch (err) {
      setTxStatus(`❌ Error: ${err instanceof Error ? err.message : "Desconocido"}`);
    }
  }, [walletAddress, pdas, send, fetchPassportData]);

// HACKATHON TX: Simula la visita haciendo un pago real de SOL
  const recordVisit = useCallback(async (lugar: typeof LUGARES_DISPONIBLES[0]) => {
    if (!walletAddress) return;
    try {
      setTxStatus(`Pagando ${lugar.costoSol} SOL en Devnet por la visita...`);
      
      // Armamos el paquete de datos EXACTO que espera Solana (12 bytes)
      const dataBuffer = new Uint8Array(12);
      const dataView = new DataView(dataBuffer.buffer);
      dataView.setUint32(0, 2, true); // Índice 2: Instrucción "Transfer"
      dataView.setBigUint64(4, lugar.costoLamports, true); // Cantidad en Lamports

      // Instrucción de Transferencia de SOL nativa (REAL)
      const transferInstruction = {
        programAddress: SYSTEM_PROGRAM_ADDRESS,
        accounts: [
          { address: walletAddress, role: 3 }, // Origen (El Turista paga y firma)
          { address: RECEPTOR_PAGO_SIMULADO, role: 1 }, // Destino (La caja recaudadora)
        ],
        data: dataBuffer, // Usamos nuestro paquete perfectamente formateado
      };

      const signature = await send({ instructions: [transferInstruction] });
      setTxStatus(`✅ ¡Pago Confirmado! Visita registrada. TX: ${signature?.slice(0, 15)}...`);
      
      // Magia Visual: Actualizamos el Frontend al instante
      setXpLocal(prev => prev + lugar.xp);
      setPtsLocal(prev => prev + lugar.pts);
      if (lugar.tier === 2 && lugar.actionId !== undefined) {
        setSellosActivos(prev => [...prev, lugar.actionId!]);
      }

    } catch (err) {
      setTxStatus(`❌ Error en el pago: ${err instanceof Error ? err.message : "Cancelado por usuario"}`);
    }
  }, [walletAddress, send]);

  return {
    status,
    isSending,
    txStatus,
    passportData, 
    xpLocal,      // Exportamos los datos locales para la UI
    ptsLocal,
    sellosActivos,
    refreshPassport: fetchPassportData, 
    initPassport,
    recordVisit
  };
}