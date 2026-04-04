import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Home, MessageSquare, BookOpen, TrendingUp, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import logoAlba from '../../assets/logo-alba.png';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggle} />
      )}

      {/* Modal cerrar sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#0F2C32]/10 flex items-center justify-center mb-4">
                <LogOut size={22} className="text-[#0F2C32]" />
              </div>
              <h3 className="text-base font-semibold text-[#0F2C32]">¿Cerrar sesión?</h3>
              <p className="text-sm text-slate-400 mt-1">Tu progreso está guardado. Podrás continuar cuando vuelvas.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 text-sm font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setShowLogoutModal(false); navigate('/login'); }}
                className="flex-1 py-2.5 text-sm font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`relative bg-[#0F2C32] text-white flex flex-col h-full transition-all duration-300 z-50
        ${isOpen ? 'w-64' : 'w-0 md:w-16'}
        ${isOpen ? 'fixed md:relative' : 'hidden md:flex'}
      `}>
        {/* Botón toggle pegado al borde derecho */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 z-50 w-6 h-6 bg-[#0F2C32] border border-white/20 rounded-full flex items-center justify-center hover:bg-[#1a4a52] transition-colors shadow-md"
        >
          {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
        <div className="border-b border-white/10 flex flex-col items-center py-4 px-3">
          {isOpen ? (
            <>
              <h1 className="text-xl font-semibold text-center">Varian Assists Alba</h1>
              <img src={logoAlba} alt="Logo Alba" className="w-20 h-20 object-contain mt-3" />
            </>
          ) : (
            <img src={logoAlba} alt="Logo Alba" className="w-12 h-12 object-contain" />
          )}
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <SidebarNavLink to="/inicio" icon={<Home size={20} />} label="Inicio" isOpen={isOpen} />
            <SidebarNavLink to="/historial-chat" icon={<MessageSquare size={20} />} label="Chats" isOpen={isOpen} />
            <SidebarNavLink to="/mis-cursos" icon={<BookOpen size={20} />} label="Mis Cursos" isOpen={isOpen} />
            <SidebarNavLink to="/certificaciones" icon={<TrendingUp size={20} />} label="Certificaciones" isOpen={isOpen} />
            <SidebarNavLink to="/configuracion" icon={<Settings size={20} />} label="Configuración" isOpen={isOpen} />
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          {isOpen ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-semibold">JD</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Juan Pérez</p>
                  <p className="text-xs text-white/60">Asesor en Entrenamiento</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white w-full"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-semibold">JD</span>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="text-white/80 hover:text-white"
                title="Cerrar Sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface SidebarNavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  end?: boolean;
}

function SidebarNavLink({ to, icon, label, isOpen, end }: SidebarNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={!isOpen ? label : undefined}
      className={({ isActive }) =>
        `w-full flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-white/10 text-white'
            : 'text-white/70 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {icon}
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </NavLink>
  );
}
