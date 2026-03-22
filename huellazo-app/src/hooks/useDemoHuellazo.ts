import { useState } from 'react';

// Base de datos simulada de nuestros comercios locales
export const LUGARES_DISPONIBLES = [
  { id: 'taller', nombre: 'Taller de Alebrijes "El Nahual"', xp: 300, tipo: 'Artesanía', color: 'bg-[#F2CC8F]' },
  { id: 'cafe', nombre: 'Café Orgánico Don Pancho', xp: 150, tipo: 'Gastronomía', color: 'bg-[#E07A5F]' },
  { id: 'cenote', nombre: 'Ecoturismo Cenote Azul', xp: 600, tipo: 'Aventura Eco', color: 'bg-[#81B29A]' },
];

export function useDemoHuellazo() {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [puntosEco, setPuntosEco] = useState(0);
  const [lugaresVisitados, setLugaresVisitados] = useState<string[]>([]);

  const simularVisita = (idLugar: string, xpGanada: number) => {
    if (!lugaresVisitados.includes(idLugar)) {
      // Agregamos a la lista de visitados
      setLugaresVisitados((prev) => [...prev, idLugar]);
      
      // Calculamos nueva experiencia
      const nuevaXp = xp + xpGanada;
      setXp(nuevaXp);
      
      // Cada 1000 XP subimos de nivel
      setLevel(Math.floor(nuevaXp / 1000) + 1);
      
      // Damos 1 punto eco por cada 100 XP
      setPuntosEco((prev) => prev + (xpGanada / 10));
    }
  };

  const resetDemo = () => {
    setXp(0);
    setLevel(1);
    setPuntosEco(0);
    setLugaresVisitados([]);
  };

  return {
    xp,
    level,
    puntosEco,
    lugaresVisitados,
    simularVisita,
    resetDemo
  };
}