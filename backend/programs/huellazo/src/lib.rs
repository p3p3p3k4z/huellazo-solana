use anchor_lang::prelude::*;

// Tu ID de programa detectado en Solana Playground
declare_id!("CB2sVYQ48i3rTdM51zKxipweoFpxEEmJVC1NgxLeT5Xj");

#[program]
pub mod huellazo {
    use super::*;

    /// [CREATE] Inicializa el protocolo como una PDA única usando la semilla "config".
    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.total_users = 0;
        Ok(())
    }

    /// [CREATE] Crea el pasaporte del turista y aumenta el contador global de usuarios.
    pub fn initialize_passport(ctx: Context<InitializePassport>) -> Result<()> {
        let passport = &mut ctx.accounts.passport;
        passport.owner = ctx.accounts.user.key();
        passport.level = 1; // Nivel Bronce inicial.
        passport.experience = 0;
        passport.fidelity_points = 0;
        passport.eco_flags = 0;
        passport.bump = ctx.bumps.passport;

        ctx.accounts.config.total_users += 1;
        Ok(())
    }

    /// [CREATE] Registra un comercio local validando que solo el admin pueda hacerlo.
    pub fn register_merchant(ctx: Context<RegisterMerchant>, name: String, tier: u8) -> Result<()> {
        let merchant = &mut ctx.accounts.merchant;
        merchant.authority = ctx.accounts.merchant_authority.key();
        merchant.name = name;
        merchant.tier = tier;
        merchant.is_active = true;
        Ok(())
    }

    /// [UPDATE] Incrementa XP y puntos; sube de nivel automáticamente si alcanza los umbrales.
    pub fn record_visit(ctx: Context<RecordVisit>, xp: u64, points: u64) -> Result<()> {
        let passport = &mut ctx.accounts.passport;
        passport.experience += xp;
        passport.fidelity_points += points;

        if passport.experience >= 5000 { passport.level = 3; } // Oro.
        else if passport.experience >= 1000 { passport.level = 2; } // Plata.
        Ok(())
    }

    /// [UPDATE] Activa sellos ecológicos mediante bits (0: sin plásticos, 1: transporte eco, etc).
    pub fn validate_eco_action(ctx: Context<ValidateEcoAction>, action_id: u8) -> Result<()> {
        let passport = &mut ctx.accounts.passport;
        passport.eco_flags |= 1 << action_id;
        Ok(())
    }

    /// [UPDATE] Permite a un comercio cambiar su nombre o estado de actividad.
    pub fn update_merchant(ctx: Context<UpdateMerchant>, name: Option<String>, active: Option<bool>) -> Result<()> {
        let merchant = &mut ctx.accounts.merchant;
        if let Some(new_name) = name { merchant.name = new_name; }
        if let Some(status) = active { merchant.is_active = status; }
        Ok(())
    }

    /// [DELETE] Cierra el pasaporte y devuelve los fondos de la renta al usuario.
    pub fn close_passport(_ctx: Context<ClosePassport>) -> Result<()> {
        Ok(()) // anchor ya lo hace automaticamente
    }
}

// --- ESTRUCTURAS DE DATOS ---

#[account]
pub struct GlobalConfig {
    pub admin: Pubkey,
    pub total_users: u64,
}

#[account]
pub struct Passport {
    pub owner: Pubkey,
    pub level: u8,
    pub experience: u64,
    pub fidelity_points: u64,
    pub eco_flags: u8,
    pub bump: u8,
}

#[account]
pub struct Merchant {
    pub authority: Pubkey,
    pub name: String,
    pub tier: u8,
    pub is_active: bool,
}

// --- CONTEXTOS DE VALIDACIÓN ---

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init, 
        payer = admin, 
        space = 8 + 32 + 8,
        seeds = [b"config"], // Esto hace que la cuenta sea única y fácil de encontrar.
        bump
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializePassport<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + 32 + 1 + 8 + 8 + 1 + 1, 
        seeds = [b"passport", user.key().as_ref()], 
        bump
    )]
    pub passport: Account<'info, Passport>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"config"], bump)] // Referencia a la PDA de Config.
    pub config: Account<'info, GlobalConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterMerchant<'info> {
    #[account(
        init, 
        payer = admin, 
        space = 8 + 32 + (4 + 30) + 1 + 1, 
        seeds = [b"merchant", merchant_authority.key().as_ref()], 
        bump
    )]
    pub merchant: Account<'info, Merchant>,
    pub merchant_authority: SystemAccount<'info>,
    #[account(mut, seeds = [b"config"], bump, has_one = admin)] // Solo el admin de la config puede registrar.
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordVisit<'info> {
    #[account(mut, seeds = [b"passport", passport.owner.as_ref()], bump = passport.bump)]
    pub passport: Account<'info, Passport>,
    #[account(has_one = authority, constraint = merchant.is_active == true)]
    pub merchant: Account<'info, Merchant>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ValidateEcoAction<'info> {
    #[account(mut, seeds = [b"passport", passport.owner.as_ref()], bump = passport.bump)]
    pub passport: Account<'info, Passport>,
    #[account(has_one = authority, constraint = merchant.tier == 2)] // Solo hoteles (Tier 2).
    pub merchant: Account<'info, Merchant>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateMerchant<'info> {
    #[account(mut, has_one = authority)]
    pub merchant: Account<'info, Merchant>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClosePassport<'info> {
    #[account(
        mut, 
        seeds = [b"passport", user.key().as_ref()], 
        bump = passport.bump, 
        close = user
    )]
    pub passport: Account<'info, Passport>,
    #[account(mut)]
    pub user: Signer<'info>,
}