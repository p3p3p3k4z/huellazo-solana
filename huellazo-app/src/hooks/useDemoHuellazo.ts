import { useState } from 'react';

// Base de datos que mezcla tus comercios (Tier 1 y Tier 2)
export const LUGARES_DISPONIBLES = [
  { id: 'cafe', nombre: 'Café de Olla Don Pancho', tipo: 'Gastronomía', xp: 200, pts: 20, costoSol: 0.05, tier: 1, color: 'bg-[#E07A5F]' },
  { id: 'taller', nombre: 'Alebrijes "El Nahual"', tipo: 'Artesanía', xp: 500, pts: 50, costoSol: 0.1, tier: 1, color: 'bg-[#F2CC8F]' },
  { id: 'cenote', nombre: 'Cenote Azul', tipo: 'Aventura Eco', xp: 800, pts: 80, costoSol: 0.2, tier: 1, color: 'bg-[#81B29A]' },
  // Tier 2: Tiene permiso de dar Eco-Flags según tu contrato
  { id: 'hotel', nombre: 'Eco-Hotel Paraíso', tipo: 'Hospedaje Sustentable', xp: 1500, pts: 150, costoSol: 0.5, tier: 2, ecoSello: 'Cero Plásticos ♻️', color: 'bg-[#3D405B]' },
];

export function useDemoHuellazo() {
  const [balanceSol, setBalanceSol] = useState(2.5); // Empezamos con 2.5 SOL simulados
  const [xp, setXp] = useState(0);
  const [levelName, setLevelName] = useState('Bronce');
  const [puntosEco, setPuntosEco] = useState(0);
  const [lugaresVisitados, setLugaresVisitados] = useState<string[]>([]);
  const [sellos, setSellos] = useState<string[]>([]); // Tus Eco-Flags

  const simularVisita = (lugar: typeof LUGARES_DISPONIBLES[0]) => {
    if (balanceSol < lugar.costoSol) {
      alert("¡No tienes suficiente SOL para esta visita!");
      return;
    }

    if (!lugaresVisitados.includes(lugar.id)) {
      // 1. Simular Pago
      setBalanceSol((prev) => prev - lugar.costoSol);
      
      // 2. Registrar Visita
      setLugaresVisitados((prev) => [...prev, lugar.id]);
      
      // 3. Sumar XP y Puntos
      const nuevaXp = xp + lugar.xp;
      setXp(nuevaXp);
      setPuntosEco((prev) => prev + lugar.pts);
      
      // 4. Lógica de Niveles exacta de tu Smart Contract en Rust
      if (nuevaXp >= 5000) setLevelName('Oro 🏆');
      else if (nuevaXp >= 1000) setLevelName('Plata 🥈');

      // 5. Validar Eco-Action si es Tier 2
      if (lugar.tier === 2 && lugar.ecoSello && !sellos.includes(lugar.ecoSello)) {
        setSellos((prev) => [...prev, lugar.ecoSello!]);
      }
    }
  };

  // Simula la función close_passport de tu contrato
  const cerrarPasaporte = () => {
    setBalanceSol((prev) => prev + 0.1); // Recuperas la renta de la cuenta
    setXp(0);
    setLevelName('Bronce');
    setPuntosEco(0);
    setLugaresVisitados([]);
    setSellos([]);
    alert("Pasaporte cerrado. Has recuperado 0.1 SOL de renta.");
  };

  return {
    balanceSol,
    xp,
    levelName,
    puntosEco,
    lugaresVisitados,
    sellos,
    simularVisita,
    cerrarPasaporte
  };
}