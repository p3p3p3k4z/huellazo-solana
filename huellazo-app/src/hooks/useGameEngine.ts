import { useState, useEffect, useCallback } from "react";
import { LUGARES_DISPONIBLES } from "./useHuellazoWeb3";

export type Position = { x: number; y: number };
export type Place = typeof LUGARES_DISPONIBLES[0];

const PLAYER_SIZE = 10; // tamaño en porcentaje relativo al mapa
const MOVE_SPEED = 1.5; // velocidad de movimiento

export function useGameEngine() {
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 50, y: 50 });
  const [activePoi, setActivePoi] = useState<Place | null>(null);

  // Maneja el ciclo principal del movimiento usando requestAnimationFrame (60 FPS ideal)
  useEffect(() => {
    const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };

    // Captura cuando se presiona una tecla
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key)) keys[e.key as keyof typeof keys] = true;
    };
    
    // Libera la bandera de movimiento
    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key)) keys[e.key as keyof typeof keys] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let animationId: number;
    
    // Función central de actualización de posición
    const updatePosition = () => {
      setPlayerPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        if (keys.w || keys.ArrowUp) newY -= MOVE_SPEED;
        if (keys.s || keys.ArrowDown) newY += MOVE_SPEED;
        if (keys.a || keys.ArrowLeft) newX -= MOVE_SPEED;
        if (keys.d || keys.ArrowRight) newX += MOVE_SPEED;

        // Limita al jugador dentro del mapa (0-100%)
        newX = Math.max(0, Math.min(newX, 100 - PLAYER_SIZE));
        newY = Math.max(0, Math.min(newY, 100 - PLAYER_SIZE));

        return { x: newX, y: newY };
      });
      animationId = requestAnimationFrame(updatePosition);
    };

    animationId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Detecta colisiones sencillas estilo "Bounding Box" entre el juegador y los Negocios
  const checkCollisions = useCallback(() => {
    let touchedPoi: Place | null = null;
    
    for (const place of LUGARES_DISPONIBLES) {
      const pRect = { x: playerPosition.x, y: playerPosition.y, w: PLAYER_SIZE, h: PLAYER_SIZE };
      const placeRect = { x: place.mapX, y: place.mapY, w: place.mapW, h: place.mapH };

      const isColliding = 
        pRect.x < placeRect.x + placeRect.w &&
        pRect.x + pRect.w > placeRect.x &&
        pRect.y < placeRect.y + placeRect.h &&
        pRect.y + pRect.h > placeRect.y;

      if (isColliding) {
        touchedPoi = place;
        break; // Al tocar uno, terminamos búsqueda
      }
    }
    
    // Solo actualizar el estado si cambió el POI activo
    setActivePoi((prev) => (prev?.id === touchedPoi?.id ? prev : touchedPoi));
  }, [playerPosition]);

  // Ejecuta el check de colisiones al cambiar la posición (con debounce virtual frame a frame)
  useEffect(() => {
    checkCollisions();
  }, [playerPosition, checkCollisions]);

  return { playerPosition, playerSize: PLAYER_SIZE, activePoi };
}
