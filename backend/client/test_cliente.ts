import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Buffer } from "buffer";
import type { Huellazo } from "../target/types/huellazo";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.Huellazo as anchor.Program<Huellazo>;


async function main() {
  console.log("🚀 INICIANDO SIMULACIÓN INTEGRAL: HUELLAZO FULL-PROTOCOLO");

  const admin = program.provider.publicKey;
  const program = program;

  // --- 1. CLIENTE DE INTERACCIÓN (Lógica de Negocio) ---
  const getHuellazoClient = (program) => {
    const getPda = (seed: string, extra: Buffer[] = []) => {
      const seeds = [Buffer.from(seed), ...extra];
      return web3.PublicKey.findProgramAddressSync(seeds, program.programId)[0];
    };

    return {
      // Direcciones PDA (Helpers)
      configAddr: () => getPda("config"),
      passportAddr: (owner: web3.PublicKey) => getPda("passport", [owner.toBuffer()]),
      merchantAddr: (auth: web3.PublicKey) => getPda("merchant", [auth.toBuffer()]),

      // --- INSTRUCCIONES ---
      initializeConfig: () => program.methods.initializeConfig().accounts({
        config: getPda("config"), admin: admin, systemProgram: web3.SystemProgram.programId,
      }).rpc(),

      registerMerchant: (auth: web3.PublicKey, name: string, tier: number) => 
        program.methods.registerMerchant(name, tier).accounts({
          merchant: getPda("merchant", [auth.toBuffer()]),
          merchantAuthority: auth, config: getPda("config"), admin: admin, systemProgram: web3.SystemProgram.programId,
        }).rpc(),

      updateMerchant: (mAuth: web3.Keypair, name: string | null, active: boolean | null) =>
        program.methods.updateMerchant(name, active).accounts({
          merchant: getPda("merchant", [mAuth.publicKey.toBuffer()]), authority: mAuth.publicKey,
        }).signers([mAuth]).rpc(),

      initializePassport: (user: web3.Keypair) => 
        program.methods.initializePassport().accounts({
          passport: getPda("passport", [user.publicKey.toBuffer()]), user: user.publicKey, config: getPda("config"), systemProgram: web3.SystemProgram.programId,
        }).signers([user]).rpc(),

      recordVisit: (user: web3.PublicKey, mAuth: web3.Keypair, xp: number, pts: number) => 
        program.methods.recordVisit(new anchor.BN(xp), new anchor.BN(pts)).accounts({
          passport: getPda("passport", [user.toBuffer()]), merchant: getPda("merchant", [mAuth.publicKey.toBuffer()]), authority: mAuth.publicKey,
        }).signers([mAuth]).rpc(),

      validateEco: (user: web3.PublicKey, mAuth: web3.Keypair, id: number) => 
        program.methods.validateEcoAction(id).accounts({
          passport: getPda("passport", [user.toBuffer()]), merchant: getPda("merchant", [mAuth.publicKey.toBuffer()]), authority: mAuth.publicKey,
        }).signers([mAuth]).rpc(),

      closePassport: (user: web3.Keypair) =>
        program.methods.closePassport().accounts({
          passport: getPda("passport", [user.publicKey.toBuffer()]), user: user.publicKey,
        }).signers([user]).rpc()
    };
  };

  const client = getHuellazoClient(program);

  // Helper: Autofondeo para evitar Error 429
  const fund = async (to: web3.PublicKey, sol: number) => {
    const tx = new web3.Transaction().add(web3.SystemProgram.transfer({
      fromPubkey: admin, toPubkey: to, lamports: sol * web3.LAMPORTS_PER_SOL,
    }));
    await program.provider.sendAndConfirm(tx);
  };

  try {
    // --- PASO 1: SETUP ---
    const configExists = await program.provider.connection.getAccountInfo(client.configAddr());
    if (!configExists) await client.initializeConfig();

    const hotel = web3.Keypair.generate();
    const turista = web3.Keypair.generate();
    await fund(hotel.publicKey, 0.05);
    await fund(turista.publicKey, 0.1);

    // --- PASO 2: GESTIÓN DE COMERCIO ---
    console.log("🛠️ Registrando 'Eco-Hotel Paraíso'...");
    await client.registerMerchant(hotel.publicKey, "Eco-Hotel Paraíso", 2);
    
    console.log("📝 Actualizando nombre del comercio...");
    await client.updateMerchant(hotel, "Eco-Hotel Paraíso V2", true);

    // --- PASO 3: GESTIÓN DE PASAPORTE ---
    console.log("🎒 Creando Pasaporte para Turista...");
    await client.initializePassport(turista);

    // --- PASO 4: INTERACCIONES ---
    console.log("🎉 Registrando Visita: +2500 XP y 500 Puntos...");
    const txVisit = await client.recordVisit(turista.publicKey, hotel, 2500, 500);
    
    // IMPORTANTE: Esperamos confirmación para que el fetch no de 0
    await program.provider.connection.confirmTransaction(txVisit, "confirmed");

    console.log("🌿 Validando Acción Eco: Sello ID #3...");
    await client.validateEco(turista.publicKey, hotel, 3);

    // --- PASO 5: VERIFICACIÓN ---
    const passportData = await program.account.passport.fetch(client.passportAddr(turista.publicKey));
    const merchantData = await program.account.merchant.fetch(client.merchantAddr(hotel.publicKey));

    console.log("\n--- 📊 REPORTE DE SIMULACIÓN ---");
    console.log(`[COMERCIO]: ${merchantData.name} | Tier: ${merchantData.tier} | Activo: ${merchantData.isActive}`);
    console.log(`[TURISTA]: ${turista.publicKey.toBase58()}`);
    console.log(`   -> Nivel: ${passportData.level} (Plata)`);
    console.log(`   -> Experiencia: ${passportData.experience.toString()} XP`);
    console.log(`   -> Puntos Eco: ${passportData.fidelityPoints.toString()}`);
    console.log(`   -> Eco-Flags: ${passportData.ecoFlags.toString(2)} (Binario)`);

    // --- PASO 6: LIMPIEZA (Opcional) ---
    console.log("\n♻️ Cerrando cuenta para recuperar renta...");
    await client.closePassport(turista);
    console.log("✅ Cuenta cerrada con éxito.");

  } catch (err) {
    console.error("❌ Fallo en el flujo:", err);
  }
}

main();

/**
 * --- AUTODOCUMENTACIÓN ---
 * initializeConfig: Crea el estado global 'config' con el contador de usuarios.
 * registerMerchant: Crea PDA de comercio vinculada a su autoridad.
 * updateMerchant: Modifica datos de un comercio existente (requiere firma del dueño).
 * initializePassport: Crea PDA 'passport' ligada a la wallet del turista.
 * recordVisit: Suma XP/Puntos; el contrato evalúa nivel automáticamente.
 * validateEcoAction: Usa bitwise OR para activar sellos verdes en un solo byte.
 * closePassport: Borra la cuenta del turista y le devuelve su SOL.
 */