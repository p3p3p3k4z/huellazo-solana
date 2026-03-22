import { useState, useEffect, useCallback } from "react";
import { 
  getProgramDerivedAddress, 
  getAddressEncoder, 
  getBytesEncoder, 
  createSolanaRpc, // <-- NUEVO: Para comunicarnos con la red
  type Address 
} from "@solana/kit";
import { useWalletConnection, useSendTransaction } from "@solana/react-hooks";

// Importamos la función de lectura que generó Codama
import { fetchMaybePassport } from "../generated/vault/accounts"; 

import { 
  getInitializeConfigInstructionDataEncoder,
  getInitializePassportInstructionDataEncoder,
  getRecordVisitInstructionDataEncoder,
  getRegisterMerchantInstructionDataEncoder 
} from "../generated/vault/instructions";
//import { HUELLAZO_PROGRAM_ADDRESS } from "../generated/vault/programs/huellazo";
const HUELLAZO_PROGRAM_ADDRESS = "CB2sVYQ48i3rTdM51zKxipweoFpxEEmJVC1NgxLeT5Xj" as Address;
const SYSTEM_PROGRAM_ADDRESS = "11111111111111111111111111111111" as Address;

// Creamos un cliente RPC para conectarnos a Devnet y leer los datos
const rpc = createSolanaRpc("https://api.devnet.solana.com"); 

export function useHuellazo() {
  const { wallet, status } = useWalletConnection();
  const { send, isSending } = useSendTransaction();
  
  const walletAddress = wallet?.account.address;
  const [txStatus, setTxStatus] = useState<string | null>(null);
  
  // NUEVO ESTADO: Aquí guardaremos la información de tu pasaporte
  const [passportData, setPassportData] = useState<any>(null); 
  
  const [pdas, setPdas] = useState<{ config: Address | null; passport: Address | null; merchant: Address | null }>({
    config: null, passport: null, merchant: null
  });

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

      const [merchantPda] = await getProgramDerivedAddress({
        programAddress: HUELLAZO_PROGRAM_ADDRESS,
        seeds: [
          encoder.encode(new Uint8Array([109, 101, 114, 99, 104, 97, 110, 116])),
          addrEncoder.encode(walletAddress),
        ],
      });

      setPdas({ config: configPda, passport: passportPda, merchant: merchantPda });
    }
    deriveAddresses();
  }, [walletAddress]);

  // 2. NUEVA FUNCIÓN: Leer los datos del pasaporte desde la blockchain
  const fetchPassportData = useCallback(async () => {
    if (!pdas.passport) return;
    try {
      const account = await fetchMaybePassport(rpc, pdas.passport);
      if (account && account.exists) {
        setPassportData(account.data); // Guardamos los datos si la cuenta existe
      } else {
        setPassportData(null); // La cuenta aún no ha sido creada
      }
    } catch (error) {
      console.error("Error leyendo pasaporte:", error);
    }
  }, [pdas.passport]);

  // Leer automáticamente cuando se detecta la PDA
  useEffect(() => {
    fetchPassportData();
  }, [fetchPassportData]);

  // Helper de transacciones
  const executeTx = async (name: string, instruction: any) => {
    try {
      setTxStatus(`Construyendo ${name}...`);
      const signature = await send({ instructions: [instruction] });
      setTxStatus(`✅ ${name}! TX: ${signature?.slice(0, 20)}...`);
      
      // Si la transacción fue exitosa, esperamos 2 segundos y recargamos los datos
      setTimeout(() => fetchPassportData(), 2000); 
    } catch (err) {
      console.error(err);
      setTxStatus(`❌ Error en ${name}: ${err instanceof Error ? err.message : "Desconocido"}`);
    }
  };

  const initConfig = useCallback(() => { /* ... (igual que antes) ... */ 
    if (!walletAddress || !pdas.config) return;
    executeTx("Init Config", {
      programAddress: HUELLAZO_PROGRAM_ADDRESS,
      accounts: [
        { address: pdas.config, role: 1 },
        { address: walletAddress, role: 3 },
        { address: SYSTEM_PROGRAM_ADDRESS, role: 0 },
      ],
      data: getInitializeConfigInstructionDataEncoder().encode({}),
    });
  }, [walletAddress, pdas]);

  const initPassport = useCallback(() => { /* ... (igual que antes) ... */ 
    if (!walletAddress || !pdas.passport || !pdas.config) return;
    executeTx("Init Passport", {
      programAddress: HUELLAZO_PROGRAM_ADDRESS,
      accounts: [
        { address: pdas.passport, role: 1 },
        { address: walletAddress, role: 3 },
        { address: pdas.config, role: 1 },
        { address: SYSTEM_PROGRAM_ADDRESS, role: 0 },
      ],
      data: getInitializePassportInstructionDataEncoder().encode({}),
    });
  }, [walletAddress, pdas]);

  const recordVisit = useCallback(() => { /* ... (igual que antes) ... */ 
    if (!walletAddress || !pdas.passport || !pdas.merchant) return;
    executeTx("Record Visit", {
      programAddress: HUELLAZO_PROGRAM_ADDRESS,
      accounts: [
        { address: pdas.passport, role: 1 },
        { address: pdas.merchant, role: 0 },
        { address: walletAddress, role: 2 }, 
      ],
      data: getRecordVisitInstructionDataEncoder().encode({ xp: 1500n, points: 50n }),
    });
  }, [walletAddress, pdas]);

  const registerMerchant = useCallback(() => {
    if (!walletAddress || !pdas.merchant || !pdas.config) return;
    executeTx("Register Merchant", {
      programAddress: HUELLAZO_PROGRAM_ADDRESS,
      accounts: [
        { address: pdas.merchant, role: 1 }, 
        { address: walletAddress, role: 0 }, 
        { address: pdas.config, role: 1 }, 
        { address: walletAddress, role: 3 }, 
        { address: SYSTEM_PROGRAM_ADDRESS, role: 0 },
      ],
      data: getRegisterMerchantInstructionDataEncoder().encode({ name: "Eco Tienda", tier: 1 }),
    });
  }, [walletAddress, pdas]);

  return {
    status,
    isSending,
    txStatus,
    passportData, // Exportamos los datos
    refreshPassport: fetchPassportData, // Exportamos la función por si queremos un botón de "recargar"
    initConfig,
    initPassport,
    registerMerchant,
    recordVisit
  };
}