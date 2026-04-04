import { useNavigate } from 'react-router';
import { MessageSquare, Clock, TrendingUp, Plus } from 'lucide-react';

type ChatStatus = 'completado' | 'en curso' | 'incompleto';

interface ChatSession {
  id: string;
  scenario: string;
  level: string;
  date: string;
  duration: string;
  score: number | null;
  status: ChatStatus;
}

const statusStyles: Record<ChatStatus, string> = {
  completado: 'bg-[#0F2C32] text-white',
  'en curso':  'bg-slate-200 text-slate-600',
  incompleto:  'bg-slate-100 text-slate-500 border border-slate-200',
};

const sessions: ChatSession[] = [
  { id: '1', scenario: 'Escenario de Devolución',    level: 'Intermedio', date: '03/04/2026', duration: '18 min', score: 82,   status: 'completado' },
  { id: '2', scenario: 'Cliente Agresivo',           level: 'Avanzado',   date: '02/04/2026', duration: '22 min', score: 74,   status: 'completado' },
  { id: '3', scenario: 'Consulta de Producto',       level: 'Básico',     date: '01/04/2026', duration: '10 min', score: null, status: 'en curso'   },
  { id: '4', scenario: 'Reclamo por Envío',          level: 'Intermedio', date: '31/03/2026', duration: '15 min', score: 91,   status: 'completado' },
  { id: '5', scenario: 'Cliente Confundido',         level: 'Básico',     date: '30/03/2026', duration: '08 min', score: 65,   status: 'incompleto' },
  { id: '6', scenario: 'Negociación de Reembolso',   level: 'Avanzado',   date: '29/03/2026', duration: '25 min', score: 88,   status: 'completado' },
];

export default function HistoryChats() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-[#0F2C32]">Historial de chats activos</h2>
            <p className="text-xs text-slate-400 mt-0.5">{sessions.length} sesiones registradas</p>
          </div>
          <button
            onClick={() => navigate('/historial-chat/nueva')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors whitespace-nowrap"
          >
            <Plus size={14} />
            Nueva Sesión
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 p-4 md:p-6">
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => navigate(`/historial-chat/${session.id}`)}
              className="bg-white border border-slate-200 rounded-lg px-3 md:px-4 py-3.5 md:py-4 flex items-center justify-between gap-3 md:gap-4 hover:border-[#0F2C32]/30 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={18} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{session.scenario}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-slate-400">{session.date}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={11} />
                      {session.duration}
                    </span>
                    <span className="text-xs text-slate-400">{session.level}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                {session.score !== null && (
                  <span className="flex items-center gap-1 text-sm font-bold text-[#0F2C32]">
                    <TrendingUp size={13} />
                    {session.score}%
                  </span>
                )}
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[session.status]}`}>
                  {session.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
