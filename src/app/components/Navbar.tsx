import { NavLink } from 'react-router';
import { User, Bell, Settings } from 'lucide-react';
import { Button } from './ui/button';

export function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors text-sm ${isActive ? 'text-white font-semibold border-b-2 border-white pb-0.5' : 'text-white/70 hover:text-white'}`;

  return (
    <nav className="bg-[#0F2C32] text-white px-6 py-4 flex items-center justify-between shadow-lg shrink-0">
      <div className="flex items-center gap-8">
        <h2 className="text-white font-semibold">Sistema de Entrenamiento</h2>
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={linkClass}>Inicio</NavLink>
          <NavLink to="/practica-chat" className={linkClass}>Práctica de Chat</NavLink>
          <NavLink to="/mis-cursos" className={linkClass}>Mis Cursos</NavLink>
          <NavLink to="/certificaciones" className={linkClass}>Certificaciones</NavLink>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Settings className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-white/20">
          <div className="bg-white/20 p-2 rounded-full">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm leading-none">Asesor en Entrenamiento</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
