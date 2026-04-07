import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { SessionsProvider } from './context/SessionsContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Inicio from './pages/entrenador/Inicio';
import PerfilesCliente from './pages/entrenador/PerfilesCliente';
import InicioAsesor from './pages/asesor/InicioAsesor';
import InicioAdmin from './pages/admin/InicioAdmin';
import GestionUsuarios from './pages/admin/GestionUsuarios';
import ChatsAdmin from './pages/admin/ChatsAdmin';
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
            <Route path="/inicio" element={
              <ProtectedRoute allowed={['entrenador']}>
                <Inicio />
              </ProtectedRoute>
            } />
            <Route path="/inicio-asesor" element={
              <ProtectedRoute allowed={['asesor']}>
                <InicioAsesor />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowed={['admin']}>
                <InicioAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios" element={
              <ProtectedRoute allowed={['admin']}>
                <GestionUsuarios />
              </ProtectedRoute>
            } />
            <Route path="/admin/chats" element={
              <ProtectedRoute allowed={['admin']}>
                <ChatsAdmin />
              </ProtectedRoute>
            } />
            <Route path="/perfiles-cliente" element={
              <ProtectedRoute allowed={['entrenador']}>
                <PerfilesCliente />
              </ProtectedRoute>
            } />
            <Route path="/historial-chat" element={
              <ProtectedRoute allowed={['entrenador', 'asesor']}>
                <HistoryChats />
              </ProtectedRoute>
            } />
            <Route path="/historial-chat/:id" element={
              <ProtectedRoute allowed={['entrenador', 'asesor']}>
                <PracticaChat />
              </ProtectedRoute>
            } />
            <Route path="/configuracion" element={
              <ProtectedRoute allowed={['admin', 'entrenador', 'asesor']}>
                <Configuracion />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <SessionsProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
          <AccessibilityWidget />
        </SessionsProvider>
      </AuthProvider>
    </HashRouter>
  );
}
