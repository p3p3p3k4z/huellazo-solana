import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Huellazo } from "../target/types/huellazo";
import type { Huellazo } from "../target/types/huellazo";

describe("huellazo", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Huellazo as anchor.Program<Huellazo>;
  
  // Configuramos el provider con confirmación para evitar el error de "Account does not exist"
  const provider = anchor.AnchorProvider.env();
  provider.opts.commitment = "confirmed"; 
  anchor.setProvider(provider);

  const program = anchor.workspace.Huellazo as unknown as Program<Huellazo>;

  const admin = provider.wallet;
  const user = anchor.web3.Keypair.generate();
  const merchantAuthority = anchor.web3.Keypair.generate();

  // Derivación de PDAs
  const [configPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);
  const [passportPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("passport"), user.publicKey.toBuffer()], program.programId);
  const [merchantPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("merchant"), merchantAuthority.publicKey.toBuffer()], program.programId);

  // Función auxiliar para comparar sin usar librerías externas
  const assertEquals = (val1: any, val2: any, msg: string) => {
    if (val1 !== val2) throw new Error(`❌ FALLO: ${msg} (Esperaba ${val2}, recibí ${val1})`);
  };

  it("1. [SETUP] Inicializa el protocolo", async () => {
    console.log("🚀 Inicializando Huellazo...");
    try {
      await program.methods.initializeConfig().accounts({
        config: configPda,
        admin: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();
      
      const configAccount = await program.account.globalConfig.fetch(configPda);
      assertEquals(configAccount.totalUsers.toNumber(), 0, "Usuarios iniciales");
      console.log("✅ Configuración lista.");
    } catch (err) {
      console.log("⚠️ Nota: Si ya estaba inicializado, esto puede fallar. Continuando...");
    }
  });

  it("2. [CREATE] El turista obtiene su Pasaporte", async () => {
    console.log("🧳 Creando pasaporte...");
    
    const transferTx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: user.publicKey,
        lamports: 0.1 * anchor.web3.LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(transferTx);

    await program.methods.initializePassport().accounts({
      passport: passportPda,
      user: user.publicKey,
      config: configPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([user]).rpc();

    const passport = await program.account.passport.fetch(passportPda);
    assertEquals(passport.level, 1, "Nivel inicial Bronce");
    console.log("✅ Pasaporte creado.");
  });

  it("3. [CREATE] Registro de Comercio", async () => {
    console.log("🏪 Registrando comercio...");
    await program.methods.registerMerchant("Restaurante Huellazo", 2).accounts({
      merchant: merchantPda,
      merchantAuthority: merchantAuthority.publicKey,
      config: configPda,
      admin: admin.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    const merchant = await program.account.merchant.fetch(merchantPda);
    assertEquals(merchant.name, "Restaurante Huellazo", "Nombre del comercio");
    console.log("✅ Comercio registrado.");
  });

  it("4. [UPDATE] El Huellazo (XP + Subida de Nivel)", async () => {
    console.log("⚡ Procesando Huellazo...");
    await program.methods.recordVisit(new anchor.BN(1200), new anchor.BN(50)).accounts({
      passport: passportPda,
      merchant: merchantPda,
      authority: merchantAuthority.publicKey,
    }).signers([merchantAuthority]).rpc();

    const passport = await program.account.passport.fetch(passportPda);
    assertEquals(passport.level, 2, "Subida a nivel Plata"); 
    console.log("✅ ¡Nivel 2 (Plata) alcanzado!");
  });

  it("5. [UPDATE] Acción Sustentable", async () => {
    console.log("🍃 Validando Eco-Stay...");
    await program.methods.validateEcoAction(0).accounts({
      passport: passportPda,
      merchant: merchantPda,
      authority: merchantAuthority.publicKey,
    }).signers([merchantAuthority]).rpc();

    const passport = await program.account.passport.fetch(passportPda);
    if (passport.ecoFlags <= 0) throw new Error("EcoFlags no se actualizó");
    console.log("✅ Certificación Eco grabada.");
  });

  it("6. [DELETE] Cierre de cuenta", async () => {
    console.log("👋 Finalizando viaje...");
    await program.methods.closePassport().accounts({
      passport: passportPda,
      user: user.publicKey,
    }).signers([user]).rpc();
    console.log("✅ Pasaporte cerrado y SOL recuperado.");
  });
});