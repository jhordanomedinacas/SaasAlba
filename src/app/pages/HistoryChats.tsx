import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MessageSquare, Clock, TrendingUp, Plus, Tag } from 'lucide-react';
import NewSessionModal from '../components/NewSessionModal';
import { useSessions, SessionStatus } from '../context/SessionsContext';

const statusStyles: Record<SessionStatus, string> = {
  completado: 'bg-[#0F2C32] text-white',
  'en curso':  'bg-slate-200 text-slate-600',
  incompleto:  'bg-slate-100 text-slate-500 border border-slate-200',
};

export default function HistoryChats() {
  const navigate = useNavigate();
  const { sessions } = useSessions();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
    <NewSessionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-[#0F2C32]">Historial de chats activos</h2>
            <p className="text-xs text-slate-400 mt-0.5">{sessions.length} sesiones registradas</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
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
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  session.status === 'en curso' ? 'bg-[#0F2C32]/10' : 'bg-slate-100'
                }`}>
                  <MessageSquare size={18} className={session.status === 'en curso' ? 'text-[#0F2C32]' : 'text-slate-500'} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{session.scenario}</p>
                  {session.motivo && (
                    <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                      <Tag size={10} />
                      {session.motivo}
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
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
    </>
  );
}
