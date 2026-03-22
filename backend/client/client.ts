import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
// Client
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Huellazo } from "../target/types/huellazo";
import type { Huellazo } from "../target/types/huellazo";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.Huellazo as anchor.Program<Huellazo>;


// Semillas para las PDAs (Deben coincidir con las de Rust)
const SEED_CONFIG = "config";
const SEED_PASSPORT = "passport";
const SEED_MERCHANT = "merchant";

console.log("My address:", program.provider.publicKey.toString());
const balance = await program.provider.connection.getBalance(program.provider.publicKey);
console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);


export const getHuellazoClient = (program: anchor.Program<Huellazo>) => {
  
  // --- DERIVACIÓN DE DIRECCIONES (READ-ONLY HELPERS) ---

  const getConfigAddress = () => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_CONFIG)],
      program.programId
    );
    return pda;
  };

  const getPassportAddress = (userWallet: PublicKey) => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_PASSPORT), userWallet.toBuffer()],
      program.programId
    );
    return pda;
  };

  const getMerchantAddress = (merchantAuthority: PublicKey) => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_MERCHANT), merchantAuthority.toBuffer()],
      program.programId
    );
    return pda;
  };

  return {
    // --- LECTURA DE DATOS ---

    /** Obtiene los datos del pasaporte de un turista */
    fetchPassport: async (userWallet: PublicKey) => {
      const address = getPassportAddress(userWallet);
      try {
        return await program.account.passport.fetch(address);
      } catch (e) {
        console.warn("El turista no tiene un pasaporte inicializado.");
        return null;
      }
    },

    /** Obtiene la configuración global del protocolo */
    fetchGlobalConfig: async () => {
      const address = getConfigAddress();
      return await program.account.globalConfig.fetch(address);
    },

    // --- ACCIONES (TRANSACCIONES) ---

    /** [Turista] Crea su pasaporte inicial */
    initializePassport: async (userWallet: PublicKey) => {
      return await program.methods
        .initializePassport()
        .accounts({
          passport: getPassportAddress(userWallet),
          user: userWallet,
          config: getConfigAddress(),
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    },

    /** [Comercio] Registra un 'Huellazo' (XP + Puntos) */
    recordVisit: async (
      userWallet: PublicKey, 
      merchantAuthority: PublicKey, 
      xp: number, 
      points: number
    ) => {
      return await program.methods
        .recordVisit(new anchor.BN(xp), new anchor.BN(points))
        .accounts({
          passport: getPassportAddress(userWallet),
          merchant: getMerchantAddress(merchantAuthority),
          authority: merchantAuthority,
        })
        .rpc();
    },

    /** [Hotel] Certifica una acción sustentable (Eco-Stay) */
    validateEcoAction: async (
      userWallet: PublicKey, 
      merchantAuthority: PublicKey, 
      actionId: number
    ) => {
      return await program.methods
        .validateEcoAction(actionId)
        .accounts({
          passport: getPassportAddress(userWallet),
          merchant: getMerchantAddress(merchantAuthority),
          authority: merchantAuthority,
        })
        .rpc();
    },

    /** [Turista] Cierra su cuenta para recuperar el SOL de la renta */
    closePassport: async (userWallet: PublicKey) => {
      return await program.methods
        .closePassport()
        .accounts({
          passport: getPassportAddress(userWallet),
          user: userWallet,
        })
        .rpc();
    }
  };
};