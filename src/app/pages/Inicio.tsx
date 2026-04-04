import { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingUp, Users, BarChart2, CheckSquare, ArrowRight, Search, X } from 'lucide-react';

type DifficultyLevel = 'alto' | 'medio' | 'bajo';
type SessionStatus   = 'completado' | 'incompleto' | 'en curso';

interface ClientProfile  { name: string; sector: string; level: DifficultyLevel; }
interface RecentSession  { initials: string; name: string; profile: string; duration: string; score: number; }
interface SimulationRecord {
  initials: string; name: string; profile: string; sector: string;
  duration: string; score: number; status: SessionStatus; date: string;
}

const difficultyStyles: Record<DifficultyLevel, string> = {
  alto:  'bg-slate-100 text-slate-700 border border-slate-200',
  medio: 'bg-slate-50  text-slate-500 border border-slate-200',
  bajo:  'bg-white     text-slate-400 border border-slate-200',
};

const clientProfiles: ClientProfile[] = [
  { name: 'Cliente Agresivo',    sector: 'Call Center', level: 'alto'  },
  { name: 'Cliente Ansioso',     sector: 'Banco',       level: 'medio' },
  { name: 'Cliente Confundido',  sector: 'Retail',      level: 'bajo'  },
  { name: 'Cliente Exigente',    sector: 'Seguros',     level: 'alto'  },
  { name: 'Cliente Pasivo',      sector: 'Telco',       level: 'bajo'  },
  { name: 'Cliente Manipulador', sector: 'Financiero',  level: 'alto'  },
];

const PROFILE_NAMES = clientProfiles.map(p => p.name);

const recentSessions: RecentSession[] = [
  { initials: 'MR', name: 'María Ríos',    profile: 'Cliente Agresivo',   duration: '18 min', score: 82 },
  { initials: 'JP', name: 'Jorge Paredes', profile: 'Cliente Ansioso',    duration: '12 min', score: 74 },
  { initials: 'LC', name: 'Lucía Chávez',  profile: 'Cliente Exigente',   duration: '22 min', score: 91 },
  { initials: 'AM', name: 'Andrés Mora',   profile: 'Cliente Confundido', duration: '09 min', score: 65 },
  { initials: 'SP', name: 'Sofía Pérez',   profile: 'Cliente Agresivo',   duration: '20 min', score: 88 },
];

const statusStyles: Record<SessionStatus, string> = {
  completado: 'bg-[#0F2C32] text-white',
  incompleto: 'bg-slate-100 text-slate-500 border border-slate-200',
  'en curso': 'bg-slate-200 text-slate-600',
};

const scoreColor    = (s: number) => s >= 85 ? 'text-[#0F2C32]' : s >= 70 ? 'text-slate-600' : 'text-slate-400';
const scoreBarColor = (s: number) => s >= 85 ? 'bg-[#0F2C32]'   : s >= 70 ? 'bg-slate-500'   : 'bg-slate-300';
const sectorStyle   = 'bg-slate-50 text-slate-600 border border-slate-200';

const simulationHistory: SimulationRecord[] = [
  { initials: 'MR', name: 'María Ríos',     profile: 'Cliente Agresivo',    sector: 'Call Center', duration: '18 min', score: 82, status: 'completado', date: '2026-03-01' },
  { initials: 'JP', name: 'Jorge Paredes',  profile: 'Cliente Ansioso',     sector: 'Banco',       duration: '12 min', score: 74, status: 'completado', date: '2026-03-05' },
  { initials: 'LC', name: 'Lucía Chávez',   profile: 'Cliente Exigente',    sector: 'Seguros',     duration: '22 min', score: 91, status: 'completado', date: '2026-03-10' },
  { initials: 'AM', name: 'Andrés Mora',    profile: 'Cliente Confundido',  sector: 'Retail',      duration: '09 min', score: 65, status: 'incompleto', date: '2026-03-12' },
  { initials: 'SP', name: 'Sofía Pérez',    profile: 'Cliente Agresivo',    sector: 'Call Center', duration: '20 min', score: 88, status: 'completado', date: '2026-03-15' },
  { initials: 'RV', name: 'Rodrigo Vega',   profile: 'Cliente Manipulador', sector: 'Financiero',  duration: '25 min', score: 70, status: 'en curso',   date: '2026-04-01' },
];

const MONTHS = ['Ago','Sep','Oct','Nov','Dic','Ene','Feb','Mar','Abr'];

const stats = [
  {
    numeric: 248, value: '248', label: 'Sesiones totales', trend: '+12 este mes', icon: BarChart2,
    bar: 82, sparkline: [120, 140, 130, 160, 175, 190, 210, 225, 248],
    chartType: 'bar' as const,
  },
  {
    numeric: 34, value: '34', label: 'Agentes Activos', trend: '+5 nuevos', icon: Users,
    bar: 68, sparkline: [18, 20, 22, 24, 26, 28, 30, 32, 34],
    chartType: 'area' as const,
  },
  {
    numeric: 78, value: '78%', label: 'Score Promedio', trend: '+3% este mes', icon: TrendingUp,
    bar: 78, sparkline: [60, 65, 63, 70, 68, 72, 74, 76, 78],
    chartType: 'sparkline' as const,
  },
];

/* ─────────────────────────────────────────────────────
   INICIO
───────────────────────────────────────────────────── */
export default function Inicio() {
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [profileFilter,  setProfileFilter]  = useState('Todos');
  const [agentSearch,    setAgentSearch]    = useState('');

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const capitalizedDate = today.charAt(0).toUpperCase() + today.slice(1);

  const filteredHistory = useMemo(() => simulationHistory.filter(row => {
    if (agentSearch && !row.name.toLowerCase().includes(agentSearch.toLowerCase())) return false;
    if (profileFilter !== 'Todos' && row.profile !== profileFilter) return false;
    if (dateFrom && row.date < dateFrom) return false;
    if (dateTo   && row.date > dateTo)   return false;
    return true;
  }), [agentSearch, profileFilter, dateFrom, dateTo]);

  const filteredSessions = useMemo(() => recentSessions.filter(s => {
    if (agentSearch && !s.name.toLowerCase().includes(agentSearch.toLowerCase())) return false;
    if (profileFilter !== 'Todos' && s.profile !== profileFilter) return false;
    return true;
  }), [agentSearch, profileFilter]);

  const hasFilters = !!(agentSearch || profileFilter !== 'Todos' || dateFrom || dateTo);

  const clearFilters = () => {
    setAgentSearch(''); setProfileFilter('Todos'); setDateFrom(''); setDateTo('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-[#0F2C32]">Panel Entrenador</h2>
            <p className="text-xs text-slate-400 mt-0.5">{capitalizedDate}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors whitespace-nowrap">
            + Nueva Simulación
          </button>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-3 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2">

          {/* Buscar agente */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar agente..."
              value={agentSearch}
              onChange={e => setAgentSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30 w-36 md:w-44"
            />
          </div>

          {/* Perfil de cliente */}
          <select
            value={profileFilter}
            onChange={e => setProfileFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30"
          >
            <option value="Todos">Todos los perfiles</option>
            {PROFILE_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Desde */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 whitespace-nowrap">Desde</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30"
            />
          </div>

          {/* Hasta */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 whitespace-nowrap">Hasta</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30"
            />
          </div>

          {/* Limpiar filtros */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={11} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => <KpiCard key={stat.label} {...stat} />)}
          <AprobacionCard />
        </div>

        {/* Middle panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Perfiles de Cliente — clic filtra */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#0F2C32]">Perfiles de Cliente</h3>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                {clientProfiles.length} activos
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {clientProfiles.map((profile) => (
                <div
                  key={profile.name}
                  onClick={() => setProfileFilter(profile.name === profileFilter ? 'Todos' : profile.name)}
                  className={`flex items-center justify-between border rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                    profileFilter === profile.name
                      ? 'border-[#0F2C32] bg-[#0F2C32]/5'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{profile.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{profile.sector}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${difficultyStyles[profile.level]}`}>
                    {profile.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sesiones Recientes */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#0F2C32]">Sesiones Recientes</h3>
              <button className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
                Ver Todo <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-0.5">
              {filteredSessions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Sin resultados</p>
              ) : filteredSessions.map((session, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-none">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 border border-slate-200">
                    {session.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{session.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{session.profile} · {session.duration}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 flex-shrink-0">{session.score}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Historial de Simulaciones */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-5">
          <div className="flex items-center gap-2 mb-5">
            <h3 className="text-sm font-semibold text-[#0F2C32]">Historial de Simulaciones</h3>
            {hasFilters && (
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                {filteredHistory.length} resultado{filteredHistory.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="hidden md:grid md:grid-cols-[2fr_2fr_1.2fr_1fr_2fr_1fr] gap-4 px-3 pb-2.5 border-b border-slate-100">
            {['AGENTE','PERFIL CLIENTE','SECTOR','DURACION','SCORE','ESTADO'].map(col => (
              <span key={col} className="text-xs font-semibold text-slate-300 tracking-widest uppercase">{col}</span>
            ))}
          </div>

          <div className="divide-y divide-slate-50">
            {filteredHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Sin resultados para los filtros aplicados</p>
            ) : filteredHistory.map((row, i) => (
              <div key={i} className="hover:bg-slate-50 transition-colors px-3 py-3.5">
                <div className="hidden md:grid md:grid-cols-[2fr_2fr_1.2fr_1fr_2fr_1fr] gap-4 items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 border border-slate-200">
                      {row.initials}
                    </div>
                    <span className="text-sm font-medium text-slate-800 truncate">{row.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">{row.profile}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md w-fit ${sectorStyle}`}>{row.sector}</span>
                  <span className="text-sm text-slate-500">{row.duration}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${scoreBarColor(row.score)}`} style={{ width: `${row.score}%` }} />
                    </div>
                    <span className={`text-sm font-semibold w-9 text-right ${scoreColor(row.score)}`}>{row.score}%</span>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md w-fit ${statusStyles[row.status]}`}>{row.status}</span>
                </div>
                <div className="md:hidden flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 border border-slate-200">
                    {row.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 truncate">{row.name}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md flex-shrink-0 ${statusStyles[row.status]}`}>{row.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{row.profile} · {row.sector}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-slate-400">{row.duration}</span>
                      <div className="flex items-center gap-1.5 flex-1">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${scoreBarColor(row.score)}`} style={{ width: `${row.score}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${scoreColor(row.score)}`}>{row.score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   APROBACIÓN CARD — donut animado
───────────────────────────────────────────────────── */
function AprobacionCard() {
  const [progress, setProgress] = useState(0);
  const [count, setCount]       = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const aprobados    = 91;
  const desaprobados = 100 - aprobados;
  const R    = 28;
  const circ = 2 * Math.PI * R;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const duration = 1200, start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(ease * aprobados));
        setProgress(ease * aprobados);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-white border border-slate-200 rounded-lg p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs text-slate-400 mt-1">Tasa de Aprobación</p>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
          <CheckSquare size={15} className="text-slate-400" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width={70} height={70} viewBox="0 0 80 80">
            <circle cx={40} cy={40} r={R} fill="none" stroke="#f1f5f9" strokeWidth={10} />
            <circle
              cx={40} cy={40} r={R} fill="none" stroke="#0F2C32" strokeWidth={10}
              strokeLinecap="round" strokeDasharray={circ}
              strokeDashoffset={circ * (1 - progress / 100)}
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-[#0F2C32] tabular-nums">{count}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F2C32] flex-shrink-0" />
            <span className="text-xs text-slate-600">Aprobados <span className="font-semibold">{aprobados}%</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 flex-shrink-0" />
            <span className="text-xs text-slate-400">Desaprobados <span className="font-semibold">{desaprobados}%</span></span>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">
          <TrendingUp size={11} className="text-slate-400" />+2% este mes
        </p>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#0F2C32] rounded-full" style={{ width: `${progress}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   KPI CARD — sparkline / barras mensuales / área
───────────────────────────────────────────────────── */
interface KpiCardProps {
  numeric: number;
  value: string;
  label: string;
  trend: string;
  icon: React.ElementType;
  bar: number;
  sparkline: number[];
  chartType?: 'sparkline' | 'bar' | 'area';
}

function KpiCard({ numeric, value, label, trend, icon: Icon, bar, sparkline, chartType = 'sparkline' }: KpiCardProps) {
  const [count,      setCount]      = useState(0);
  const [barWidth,   setBarWidth]   = useState(0);
  const [animPct,    setAnimPct]    = useState(0); // 0→1 para barras y área
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const duration = 1200, start = performance.now();
      const tick = (now: number) => {
        const p    = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(ease * numeric));
        setAnimPct(ease);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      setTimeout(() => setBarWidth(bar), 200);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numeric, bar]);

  const displayValue = value.includes('%') ? `${count}%` : String(count);

  /* ── Sparkline ── */
  const SW = 80, SH = 32;
  const sMin = Math.min(...sparkline), sMax = Math.max(...sparkline);
  const spkPts = sparkline.map((v, i) => {
    const x = (i / (sparkline.length - 1)) * SW;
    const y = SH - ((v - sMin) / (sMax - sMin || 1)) * SH;
    return `${x},${y}`;
  }).join(' ');

  /* ── Bar chart — viewBox fijo para que los textos no se distorsionen ── */
  const BW = 180, BH = 48, LABEL_H = 14;
  const bMax   = Math.max(...sparkline);
  const slotW  = BW / sparkline.length;
  const bBarW  = slotW * 0.52;

  /* ── Area chart ── */
  const AW = 100, AH = 36;
  const aMin = Math.min(...sparkline), aMax = Math.max(...sparkline);
  const areaPts = sparkline.map((v, i) => {
    const x = (i / (sparkline.length - 1)) * AW;
    const y = AH - ((v - aMin) / (aMax - aMin || 1)) * AH * 0.85;
    return [x, y] as [number, number];
  });
  const linePath  = areaPts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const areaPath  = `${linePath} L${AW},${AH} L0,${AH} Z`;

  return (
    <div ref={ref} className="bg-white border border-slate-200 rounded-lg p-4 md:p-5 flex flex-col gap-3">

      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl md:text-3xl font-bold text-[#0F2C32] tabular-nums">{displayValue}</p>
          <p className="text-xs text-slate-400 mt-1">{label}</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
          <Icon size={15} className="text-slate-400" />
        </div>
      </div>

      {/* Chart */}
      {chartType === 'bar' && (
        <svg width="100%" height={BH + LABEL_H} viewBox={`0 0 ${BW} ${BH + LABEL_H}`}>
          {sparkline.map((v, i) => {
            const fullH = (v / bMax) * BH;
            const animH = fullH * animPct;
            const x     = i * slotW + (slotW - bBarW) / 2;
            const isLast = i === sparkline.length - 1;
            return (
              <g key={i}>
                <rect x={x} y={0} width={bBarW} height={BH} rx="2" fill="#f1f5f9" />
                <rect x={x} y={BH - animH} width={bBarW} height={animH} rx="2"
                  fill={isLast ? '#0F2C32' : '#94a3b8'} />
                <text
                  x={x + bBarW / 2} y={BH + LABEL_H - 2}
                  textAnchor="middle" fontSize="8.5" fill="#94a3b8" fontFamily="system-ui"
                >
                  {MONTHS[i]}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {chartType === 'area' && (
        <svg width="100%" height={AH + 4} viewBox={`0 0 ${AW} ${AH + 4}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`areaGrad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#0F2C32" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0F2C32" stopOpacity="0"    />
            </linearGradient>
            <clipPath id={`clip-${label}`}>
              <rect x="0" y="0" width={AW * animPct} height={AH + 4} />
            </clipPath>
          </defs>
          {/* Área rellena */}
          <path d={areaPath} fill={`url(#areaGrad-${label})`} clipPath={`url(#clip-${label})`} />
          {/* Línea base gris */}
          <polyline points={areaPts.map(([x,y]) => `${x},${y}`).join(' ')}
            fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Línea animada */}
          <polyline points={areaPts.map(([x,y]) => `${x},${y}`).join(' ')}
            fill="none" stroke="#0F2C32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            clipPath={`url(#clip-${label})`} />
          {/* Puntos */}
          {areaPts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2"
              fill={i === sparkline.length - 1 ? '#0F2C32' : '#94a3b8'}
              opacity={animPct > (i / (sparkline.length - 1)) ? 1 : 0}
              style={{ transition: 'opacity 0.2s' }}
            />
          ))}
        </svg>
      )}

      {chartType === 'sparkline' && (
        <svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} className="overflow-visible">
          <polyline points={spkPts} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={spkPts} fill="none" stroke="#0F2C32" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="200" strokeDashoffset={barWidth > 0 ? 0 : 200}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
          <circle
            cx={SW} cy={SH - ((sparkline[sparkline.length - 1] - sMin) / (sMax - sMin || 1)) * SH}
            r="2.5" fill="#0F2C32"
            opacity={barWidth > 0 ? 1 : 0}
            style={{ transition: 'opacity 0.3s ease 1s' }}
          />
        </svg>
      )}

      {/* Barra de progreso */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <TrendingUp size={11} className="text-slate-400" />{trend}
          </p>
          <span className="text-xs font-semibold text-[#0F2C32]">{bar}%</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#0F2C32] rounded-full"
            style={{ width: `${barWidth}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </div>
      </div>
    </div>
  );
}
