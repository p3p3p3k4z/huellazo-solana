import React from 'react';

type SidebarProps = {
  currentView: string;
  onViewChange: (view: string) => void;
};

// Componente lateral de navegación con estilo Neobrutalista
export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: 'map', icon: '/assets/map-icon.png', label: 'Mapa' },
    { id: 'profile', icon: '/assets/passport-icon.png', label: 'Mi Pasaporte' },
    { id: 'badges', icon: '/assets/badges-icon.png', label: 'Insignias' },
    { id: 'rewards', icon: '/assets/rewards-icon.png', label: 'Recompensas' }
  ];

  return (
    <aside className="w-full md:w-64 bg-[#FAF9F6] border-b-4 md:border-b-0 md:border-r-4 border-[#3D405B] p-6 flex flex-col min-h-full">
      <div className="mb-10 text-center">
        {/* Logo o Imagen representativa del menú */}
        <h1 className="text-3xl font-black text-[#E07A5F] shadow-[#3D405B] drop-shadow-[2px_2px_0px_#3D405B] uppercase tracking-wider">Huellazo</h1>
        <p className="text-[#3D405B] font-bold text-sm mt-2">DApp Gamificada</p>
      </div>

      <nav className="flex md:flex-col gap-4 overflow-x-auto pb-4 md:pb-0 hide-scrollbar flex-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border-4 border-[#3D405B] 
                font-black uppercase whitespace-nowrap md:whitespace-normal transition-all
                ${isActive ? 'bg-[#F2CC8F] shadow-none translate-y-1' : 'bg-white shadow-[4px_4px_0px_#3D405B] hover:shadow-[2px_2px_0px_#3D405B] hover:translate-y-1'}
              `}
            >
              <img src={item.icon} alt={item.label} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="text-[#3D405B]">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Información del Footer del Menú */}
      <div className="mt-auto hidden md:block pt-8 border-t-4 border-[#3D405B] border-dashed">
        <p className="text-xs text-center font-bold text-[#3D405B]/60 uppercase">
          Mario Ramirez (p3p3p3k4z)<br/>© 2026 Huellazo
        </p>
      </div>
    </aside>
  );
}
