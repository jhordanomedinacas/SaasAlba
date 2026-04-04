import { createContext, useContext, useState, ReactNode } from 'react';

export type SessionStatus = 'completado' | 'en curso' | 'incompleto';

export interface ChatSession {
  id: string;
  scenario: string;
  motivo?: string;
  orderCancelled: boolean;
  level: string;
  date: string;
  duration: string;
  score: number | null;
  status: SessionStatus;
  startTime: number;
}

interface SessionsContextType {
  sessions: ChatSession[];
  addSession: (profileName: string, level: string, motivo: string) => string;
  completeSession: (id: string) => void;
}

const SessionsContext = createContext<SessionsContextType | null>(null);

const initialSessions: ChatSession[] = [
  { id: '1', scenario: 'Cliente Agresivo',    motivo: 'Devolución / Reembolso',  orderCancelled: true,  level: 'Avanzado',   date: '03/04/2026', duration: '18 min', score: 82,   status: 'completado', startTime: 0 },
  { id: '2', scenario: 'Cliente Ansioso',     motivo: 'Facturación / Cobros',    orderCancelled: false, level: 'Intermedio', date: '02/04/2026', duration: '22 min', score: 74,   status: 'completado', startTime: 0 },
  { id: '3', scenario: 'Cliente Confundido',  motivo: 'Consulta de producto',    orderCancelled: false, level: 'Básico',     date: '01/04/2026', duration: '10 min', score: null, status: 'en curso',   startTime: Date.now() },
  { id: '4', scenario: 'Cliente Exigente',    motivo: 'Reclamo por envío',       orderCancelled: true,  level: 'Avanzado',   date: '31/03/2026', duration: '15 min', score: 91,   status: 'completado', startTime: 0 },
  { id: '5', scenario: 'Cliente Pasivo',      motivo: 'Información de cuenta',   orderCancelled: false, level: 'Básico',     date: '30/03/2026', duration: '08 min', score: 65,   status: 'incompleto', startTime: 0 },
  { id: '6', scenario: 'Cliente Manipulador', motivo: 'Cancelación de servicio', orderCancelled: true,  level: 'Avanzado',   date: '29/03/2026', duration: '25 min', score: 88,   status: 'completado', startTime: 0 },
];

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);

  const addSession = (profileName: string, level: string, motivo: string): string => {
    const id = Date.now().toString();
    const now = new Date();
    const date = now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const newSession: ChatSession = {
      id,
      scenario: profileName,
      motivo,
      orderCancelled: false, // las sesiones nuevas inician con orden activa
      level,
      date,
      duration: '0 min',
      score: null,
      status: 'en curso',
      startTime: Date.now(),
    };

    setSessions(prev => [newSession, ...prev]);
    return id;
  };

  const completeSession = (id: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== id) return s;
      const mins = Math.max(1, Math.round((Date.now() - s.startTime) / 60000));
      return { ...s, status: 'completado', duration: `${mins} min` };
    }));
  };

  return (
    <SessionsContext.Provider value={{ sessions, addSession, completeSession }}>
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) throw new Error('useSessions must be used inside SessionsProvider');
  return ctx;
}
