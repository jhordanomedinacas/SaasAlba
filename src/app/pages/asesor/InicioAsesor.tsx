import { useEffect, useRef, useState } from 'react';
import { TrendingUp, MessageSquare, Star, Clock, Target, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import NewSessionModal from '../../components/NewSessionModal';
import { useSessions } from '../../context/SessionsContext';

const scoreColor    = (s: number) => s >= 85 ? 'text-[#0F2C32]' : s >= 70 ? 'text-slate-600' : 'text-slate-400';
const scoreBarColor = (s: number) => s >= 85 ? 'bg-[#0F2C32]'   : s >= 70 ? 'bg-slate-500'   : 'bg-slate-300';

const statusStyles: Record<string, string> = {
  completado: 'bg-[#0F2C32] text-white',
  'en curso':  'bg-slate-200 text-slate-600',
  incompleto:  'bg-slate-100 text-slate-500 border border-slate-200',
};

/* ── KPI personal ── */
function PersonalKpi({ icon: Icon, label, value, unit, trend, trendPositive }: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit?: string;
  trend: string;
  trendPositive: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl md:text-3xl font-bold text-[#0F2C32] tabular-nums">
            {value}
            {unit && <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>}
          </p>
          <p className="text-xs text-slate-400 mt-1">{label}</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
          <Icon size={15} className="text-slate-400" />
        </div>
      </div>
      <p className={`text-xs font-medium flex items-center gap-1 ${trendPositive ? 'text-emerald-600' : 'text-slate-400'}`}>
        <TrendingUp size={11} />
        {trend}
      </p>
    </div>
  );
}

export default function InicioAsesor() {
  const navigate = useNavigate();
  const { sessions } = useSessions();
  const [modalOpen, setModalOpen] = useState(false);

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const capitalizedDate = today.charAt(0).toUpperCase() + today.slice(1);

  const completadas  = sessions.filter(s => s.status === 'completado');
  const enCurso      = sessions.filter(s => s.status === 'en curso');
  const scores       = completadas.filter(s => s.score !== null).map(s => s.score as number);
  const scorePromedio = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <>
      <NewSessionModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-base md:text-lg font-semibold text-[#0F2C32]">Mi Dashboard</p>
              <p className="text-xs text-slate-400 mt-0.5">{capitalizedDate}</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors whitespace-nowrap"
            >
              + Nueva Sesión
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 space-y-5">

          {/* KPIs personales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <PersonalKpi
              icon={Target}
              label="Score Promedio"
              value={scorePromedio ? `${scorePromedio}%` : '--'}
              trend="+3% este mes"
              trendPositive
            />
            <PersonalKpi
              icon={MessageSquare}
              label="Sesiones completadas"
              value={String(completadas.length)}
              trend={`${enCurso.length} en curso`}
              trendPositive={enCurso.length > 0}
            />
            <PersonalKpi
              icon={Star}
              label="CSAT Promedio"
              value="4.2"
              unit="/5"
              trend="+0.2 este mes"
              trendPositive
            />
            <PersonalKpi
              icon={Clock}
              label="AHT Promedio"
              value="5:14"
              unit="min"
              trend="-0:32 vs mes ant."
              trendPositive
            />
          </div>

          {/* Progreso y sesiones recientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Progreso por nivel */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#0F2C32]">Progreso por nivel</h3>
                <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  <Award size={13} className="text-slate-400" />
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Básico',     score: 82, sessions: 8  },
                  { label: 'Intermedio', score: 74, sessions: 5  },
                  { label: 'Avanzado',   score: 61, sessions: 3  },
                ].map(lvl => (
                  <div key={lvl.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-600">{lvl.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{lvl.sessions} sesiones</span>
                        <span className={`text-sm font-semibold ${scoreColor(lvl.score)}`}>{lvl.score}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${scoreBarColor(lvl.score)}`} style={{ width: `${lvl.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mis sesiones recientes */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#0F2C32]">Mis sesiones recientes</h3>
                <button
                  onClick={() => navigate('/historial-chat')}
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Ver todo <ArrowRight size={12} />
                </button>
              </div>
              <div className="space-y-0.5">
                {sessions.slice(0, 5).map((s, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/historial-chat/${s.id}`)}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-none cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 border border-slate-200">
                      {s.scenario.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{s.scenario}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.date} · {s.level}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {s.score !== null && (
                        <span className={`text-sm font-semibold ${scoreColor(s.score)}`}>{s.score}%</span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[s.status]}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
