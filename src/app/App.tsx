import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { SessionsProvider } from './context/SessionsContext';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import HistoryChats from './pages/HistoryChats';
import PracticaChat from './pages/PracticaChat';
import Configuracion from './pages/Configuracion';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#0F2C32] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/80 hover:text-white p-1"
          >
            <Menu size={22} />
          </button>
          <span className="text-white text-sm font-semibold">Varian Assists Alba</span>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/historial-chat" element={<HistoryChats />} />
            <Route path="/historial-chat/:id" element={<PracticaChat />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Routes>
        </div>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <SessionsProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
        <AccessibilityWidget />
      </SessionsProvider>
    </HashRouter>
  );
}
