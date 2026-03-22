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
const RECEPTOR_PAGO_SIMULADO = "6KpQ1wYFKf3ChQ2UxSVdLP58T1Hrv5aFuNxDA1tyKEKu" as Address;
const rpc = createSolanaRpc("https://api.devnet.solana.com"); 

// Negocios con su metadata real y coordenadas en el mapa (X% y Y%)
export const LUGARES_DISPONIBLES = [
  { id: 'taller', nombre: 'Alebrijes "El Nahual"', tipo: 'Artesanía', xp: 500, pts: 50, costoLamports: 10000000n, costoSol: "0.01", tier: 1, color: 'bg-[#F2CC8F]', img: '/assets/negocio1.png', mapX: 20, mapY: 30, mapW: 10, mapH: 10 },
  { id: 'cenote', nombre: 'Cenote Azul', tipo: 'Aventura Eco', xp: 800, pts: 80, costoLamports: 20000000n, costoSol: "0.02", tier: 1, color: 'bg-[#81B29A]', img: '/assets/negocio2.png', mapX: 70, mapY: 20, mapW: 10, mapH: 10 },
  { id: 'hotel', nombre: 'Eco-Hotel Paraíso', tipo: 'Hospedaje', xp: 1500, pts: 150, costoLamports: 50000000n, costoSol: "0.05", tier: 2, actionId: 2, ecoSello: 'Cero Plásticos ♻️', color: 'bg-[#3D405B]', img: '/assets/negocio3.png', mapX: 50, mapY: 70, mapW: 10, mapH: 10 },
];

export function useHuellazoWeb3() {
  const { wallet, status, connect, disconnect, connectors } = useWalletConnection();
  const { send, isSending } = useSendTransaction();
  const walletAddress = wallet?.account.address;
  
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [passportData, setPassportData] = useState<any>(null); 
  const [xpLocal, setXpLocal] = useState(0);
  const [ptsLocal, setPtsLocal] = useState(0);
  const [sellosActivos, setSellosActivos] = useState<number[]>([]);
  const [pdas, setPdas] = useState<{ config: Address | null; passport: Address | null }>({ config: null, passport: null });

  // Calcula el pasaporte y la cuenta global PDA basados en la wallet actual
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

  // Lee el pasaporte desde Solana Devnet y sincroniza los estados locales (Híbrido)
  const fetchPassportData = useCallback(async () => {
    if (!pdas.passport) return;
    try {
      const account = await fetchMaybePassport(rpc, pdas.passport);
      if (account && account.exists) {
        setPassportData(account.data); 
        setXpLocal(Number(account.data.experience));
        setPtsLocal(Number(account.data.fidelityPoints));
      } else {
        setPassportData(null);
      }
    } catch (error) {
      console.error("Error leyendo pasaporte:", error);
    }
  }, [pdas.passport]);

  // Carga inicial al cambiar de wallet o recuperar sesión
  useEffect(() => { fetchPassportData(); }, [fetchPassportData]);

  // Ejecuta la TX real en Solana para crear el "Pasaporte del Turista"
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

  // Envía un pago real de prueba hacia la "caja recepcionista" del proyecto en Solana.
  const recordVisit = useCallback(async (lugar: typeof LUGARES_DISPONIBLES[0]) => {
    if (!walletAddress) return;
    try {
      setTxStatus(`Pagando ${lugar.costoSol} SOL en Devnet por la visita...`);
      
      const dataBuffer = new Uint8Array(12);
      const dataView = new DataView(dataBuffer.buffer);
      dataView.setUint32(0, 2, true); 
      dataView.setBigUint64(4, lugar.costoLamports, true); 

      const transferInstruction = {
        programAddress: SYSTEM_PROGRAM_ADDRESS,
        accounts: [
          { address: walletAddress, role: 3 }, 
          { address: RECEPTOR_PAGO_SIMULADO, role: 1 }, 
        ],
        data: dataBuffer, 
      };

      const signature = await send({ instructions: [transferInstruction] });
      setTxStatus(`✅ ¡Pago Confirmado! Visita registrada. TX: ${signature?.slice(0, 15)}...`);
      
      setXpLocal(prev => prev + lugar.xp);
      setPtsLocal(prev => prev + lugar.pts);
      if (lugar.tier === 2 && lugar.actionId !== undefined) {
        setSellosActivos(prev => {
          if (!prev.includes(lugar.actionId!)) return [...prev, lugar.actionId!];
          return prev;
        });
      }

    } catch (err) {
      setTxStatus(`❌ Error en el pago: ${err instanceof Error ? err.message : "Cancelado por usuario"}`);
    }
  }, [walletAddress, send]);

  return {
    wallet,
    status,
    connect,
    disconnect,
    connectors,
    isSending,
    txStatus,
    passportData, 
    xpLocal,      
    ptsLocal,
    sellosActivos,
    refreshPassport: fetchPassportData, 
    initPassport,
    recordVisit
  };
}
