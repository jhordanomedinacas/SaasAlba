import { useState, useEffect, useMemo } from 'react';
import {
  Building2, Users, TrendingUp, ShieldCheck, MoreHorizontal,
  MessageSquare, Star, Clock, AlertTriangle, Activity, UserX,
  Search, X, DollarSign,
} from 'lucide-react';
import { Liveline } from 'liveline';
import type { LivelinePoint } from 'liveline';

/* ── Tipos ── */
type TipoEmpresa = 'Banca' | 'Seguros' | 'Telecomunicaciones' | 'Retail' | 'Financiero';

interface Empresa {
  nombre: string;
  tipo: TipoEmpresa;
  asesores: number;
  entrenadores: number;
  scorePromedio: number;
  plan: string;
  estado: string;
  fechaAlta: string;
  ingresosMes: number; // USD
}

/* ── Datos ── */
const todasEmpresas: Empresa[] = [
  { nombre: 'Banco Continental', tipo: 'Banca',              asesores: 24, entrenadores: 3, scorePromedio: 84, plan: 'Pro',    estado: 'activo',   fechaAlta: '2026-01-05', ingresosMes: 4800 },
  { nombre: 'Seguros del Sur',   tipo: 'Seguros',            asesores: 12, entrenadores: 2, scorePromedio: 77, plan: 'Básico', estado: 'activo',   fechaAlta: '2026-01-20', ingresosMes: 1200 },
  { nombre: 'Telco Express',     tipo: 'Telecomunicaciones', asesores: 31, entrenadores: 4, scorePromedio: 91, plan: 'Pro',    estado: 'activo',   fechaAlta: '2026-02-03', ingresosMes: 6200 },
  { nombre: 'Retail Max',        tipo: 'Retail',             asesores: 8,  entrenadores: 1, scorePromedio: 68, plan: 'Básico', estado: 'inactivo', fechaAlta: '2026-02-15', ingresosMes: 0    },
  { nombre: 'Financiera Norte',  tipo: 'Financiero',         asesores: 19, entrenadores: 3, scorePromedio: 80, plan: 'Pro',    estado: 'activo',   fechaAlta: '2026-03-01', ingresosMes: 3800 },
];

const TIPOS: TipoEmpresa[] = ['Banca', 'Seguros', 'Telecomunicaciones', 'Retail', 'Financiero'];

const tipoStyle: Record<TipoEmpresa, string> = {
  Banca:              'bg-blue-50 text-blue-600 border border-blue-100',
  Seguros:            'bg-violet-50 text-violet-600 border border-violet-100',
  Telecomunicaciones: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
  Retail:             'bg-orange-50 text-orange-600 border border-orange-100',
  Financiero:         'bg-emerald-50 text-emerald-600 border border-emerald-100',
};

const estadoStyle: Record<string, string> = {
  activo:   'bg-emerald-50 text-emerald-600 border border-emerald-100',
  inactivo: 'bg-slate-100 text-slate-400 border border-slate-200',
};

const scoreColor    = (s: number) => s >= 85 ? 'text-[#0F2C32]' : s >= 70 ? 'text-slate-600' : 'text-slate-400';
const scoreBarColor = (s: number) => s >= 85 ? 'bg-[#0F2C32]'   : s >= 70 ? 'bg-slate-500'   : 'bg-slate-300';
const fmtUSD = (n: number) => n === 0 ? '—' : `$${n.toLocaleString('en-US')}`;

/* ── KPI card ── */
function KpiCard({
  icon: Icon, label, value, unit, trend, trendUp, trendNeutral, tooltip, accent,
}: {
  icon: React.ElementType; label: string; value: string; unit?: string;
  trend: string; trendUp?: boolean; trendNeutral?: boolean; tooltip?: string; accent?: boolean;
}) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-5 flex flex-col gap-3 relative">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl md:text-3xl font-bold text-[#0F2C32] tabular-nums">
            {value}
            {unit && <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>}
          </p>
          <p className="text-xs text-slate-400 mt-1">{label}</p>
        </div>
        <div
          className={`p-2 rounded-lg border cursor-default relative ${accent ? 'bg-[#0F2C32]/5 border-[#0F2C32]/10' : 'bg-slate-50 border-slate-100'}`}
          onMouseEnter={() => tooltip && setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
        >
          <Icon size={15} className={accent ? 'text-[#0F2C32]' : 'text-slate-400'} />
          {showTip && tooltip && (
            <div className="absolute right-0 top-full mt-1.5 z-20 w-52 bg-[#0F2C32] text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed">
              {tooltip}
              <div className="absolute -top-1 right-2 w-2 h-2 bg-[#0F2C32] rotate-45" />
            </div>
          )}
        </div>
      </div>
      <p className={`text-xs font-medium flex items-center gap-1 ${trendNeutral ? 'text-slate-400' : trendUp ? 'text-emerald-600' : 'text-red-400'}`}>
        <TrendingUp size={11} />
        {trend}
      </p>
    </div>
  );
}

/* ── Card ingresos por empresa ── */
function IngresosCard({ empresas }: { empresas: Empresa[] }) {
  const total = empresas.reduce((a, e) => a + e.ingresosMes, 0);
  const max   = Math.max(...empresas.map(e => e.ingresosMes), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#0F2C32]">Ingresos por empresa</h3>
          <p className="text-xs text-slate-400 mt-0.5">Este mes · USD</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-[#0F2C32] tabular-nums">{fmtUSD(total)}</p>
          <p className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-0.5 mt-0.5">
            <TrendingUp size={10} /> +12% vs mes ant.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {[...empresas]
          .sort((a, b) => b.ingresosMes - a.ingresosMes)
          .map((e, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${tipoStyle[e.tipo]} flex-shrink-0`}>
                  {e.tipo.slice(0, 3).toUpperCase()}
                </span>
                <span className="text-xs text-slate-600 font-medium truncate">{e.nombre}</span>
              </div>
              <span className={`text-xs font-semibold ml-2 flex-shrink-0 ${e.ingresosMes > 0 ? 'text-[#0F2C32]' : 'text-slate-300'}`}>
                {fmtUSD(e.ingresosMes)}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${e.ingresosMes > 0 ? 'bg-[#0F2C32]' : 'bg-slate-200'}`}
                style={{ width: `${(e.ingresosMes / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Gráfico realtime ── */
function RealtimePanel() {
  const [data,  setData]  = useState<LivelinePoint[]>([]);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const now = () => Date.now() / 1000;
    let agents = 72;

    const history: LivelinePoint[] = Array.from({ length: 30 }, (_, i) => {
      const f = Math.floor(Math.random() * 10) - 5;
      agents = Math.max(30, Math.min(120, agents + f));
      return { time: now() - (30 - i) * 4, value: agents };
    });

    setData(history);
    setValue(agents);

    const interval = setInterval(() => {
      const f = Math.floor(Math.random() * 8) - 4;
      agents = Math.max(30, Math.min(120, agents + f));
      const point: LivelinePoint = { time: now(), value: agents };
      setData(prev => [...prev.slice(-60), point]);
      setValue(agents);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#0F2C32]">Actividad en tiempo real</h3>
          <p className="text-xs text-slate-400 mt-0.5">Usuarios activos en toda la plataforma</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">En vivo</span>
        </div>
      </div>
      <div style={{ height: 200 }}>
        <Liveline
          data={data}
          value={value}
          color="#0F2C32"
          theme="light"
          grid
          fill
          pulse
          scrub
          exaggerate
          badge
          badgeVariant="minimal"
          window={120}
          formatValue={v => `${Math.round(v)} usuarios`}
          windows={[
            { label: '1m', secs: 60  },
            { label: '2m', secs: 120 },
            { label: '5m', secs: 300 },
          ]}
          windowStyle="rounded"
        />
      </div>
    </div>
  );
}

/* ── Componente principal ── */
export default function InicioAdmin() {
  const [busqueda,   setBusqueda]   = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoEmpresa | 'Todos'>('Todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const capitalizedDate = today.charAt(0).toUpperCase() + today.slice(1);

  const totalAsesores     = todasEmpresas.reduce((a, e) => a + e.asesores, 0);
  const totalEntrenadores = todasEmpresas.reduce((a, e) => a + e.entrenadores, 0);
  const scoreGlobal       = Math.round(todasEmpresas.reduce((a, e) => a + e.scorePromedio, 0) / todasEmpresas.length);
  const empresasActivas   = todasEmpresas.filter(e => e.estado === 'activo').length;
  const ingresosTotal     = todasEmpresas.reduce((a, e) => a + e.ingresosMes, 0);

  const empresasFiltradas = useMemo(() => todasEmpresas.filter(e => {
    if (busqueda    && !e.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroTipo  !== 'Todos' && e.tipo !== filtroTipo) return false;
    if (fechaDesde  && e.fechaAlta < fechaDesde) return false;
    if (fechaHasta  && e.fechaAlta > fechaHasta) return false;
    return true;
  }), [busqueda, filtroTipo, fechaDesde, fechaHasta]);

  const hayFiltros = !!(busqueda || filtroTipo !== 'Todos' || fechaDesde || fechaHasta);
  const limpiar = () => { setBusqueda(''); setFiltroTipo('Todos'); setFechaDesde(''); setFechaHasta(''); };

  const inputClass  = "px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30";
  const selectClass = "px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-base md:text-lg font-semibold text-[#0F2C32]">Panel Administrador</p>
            <p className="text-xs text-slate-400 mt-0.5">{capitalizedDate}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors whitespace-nowrap">
            + Nueva empresa
          </button>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-3 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2">

          {/* Buscar empresa */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar empresa..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className={`${inputClass} pl-7 w-40 md:w-48`}
            />
          </div>

          {/* Tipo de empresa */}
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value as TipoEmpresa | 'Todos')}
            className={selectClass}
          >
            <option value="Todos">Tipo: Todos</option>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Desde */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 whitespace-nowrap">Desde</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Hasta */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 whitespace-nowrap">Hasta</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Limpiar */}
          {hayFiltros && (
            <button
              onClick={limpiar}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={11} /> Limpiar
            </button>
          )}

          {/* Chip filtro activo */}
          {filtroTipo !== 'Todos' && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tipoStyle[filtroTipo as TipoEmpresa]}`}>
              {filtroTipo}
            </span>
          )}

          {/* Contador resultados */}
          {hayFiltros && (
            <span className="ml-auto text-xs text-slate-400">
              {empresasFiltradas.length} de {todasEmpresas.length} empresa{todasEmpresas.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 bg-slate-50 overflow-y-auto p-4 md:p-6 space-y-5">

        {/* ── KPIs Plataforma ── */}
        <div>
          <p className="text-xs font-semibold text-slate-300 tracking-widest uppercase mb-3">Plataforma</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={Building2}    label="Empresas activas"    value={String(empresasActivas)}                    trend={`${todasEmpresas.length} registradas en total`} trendNeutral tooltip="Empresas con plan activo en la plataforma" />
            <KpiCard icon={Users}        label="Usuarios totales"     value={String(totalAsesores + totalEntrenadores)}  trend="+8 nuevos este mes" trendUp tooltip="Suma de asesores y entrenadores en todas las empresas" />
            <KpiCard icon={DollarSign}   label="Ingresos este mes"    value={fmtUSD(ingresosTotal)}                      trend="+12% vs mes anterior" trendUp accent tooltip="Suma de ingresos mensuales de todas las empresas activas" />
            <KpiCard icon={Activity}     label="Score global"         value={`${scoreGlobal}%`}                          trend="+2% vs mes anterior" trendUp tooltip="Promedio de score de todas las sesiones completadas" />
          </div>
        </div>

        {/* ── KPIs Rendimiento ── */}
        <div>
          <p className="text-xs font-semibold text-slate-300 tracking-widest uppercase mb-3">Rendimiento global</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={Star}          label="CSAT promedio"     value="4.3" unit="/5"   trend="+0.2 vs mes anterior"   trendUp    tooltip="Customer Satisfaction Score — calificación del cliente del 1 al 5" />
            <KpiCard icon={Clock}         label="AHT promedio"      value="5:08" unit="min" trend="-0:24 vs mes anterior"  trendUp    tooltip="Average Handle Time — tiempo total de atención por sesión" />
            <KpiCard icon={MessageSquare} label="TMR promedio"      value="1:15" unit="min" trend="-0:10 vs mes anterior"  trendUp    tooltip="Time to Message Response — tiempo promedio de primera respuesta" />
            <KpiCard icon={UserX}         label="Usuarios baneados" value="3"               trend="1 nuevo este mes"       trendNeutral tooltip="Usuarios con acceso suspendido en todas las empresas" />
          </div>
        </div>

        {/* ── Gráfico realtime + Ingresos por empresa ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
          <RealtimePanel />
          <IngresosCard empresas={empresasFiltradas} />
        </div>

        {/* ── Alerta baneados ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            Hay <span className="font-bold">3 usuarios baneados</span> en la plataforma. Revisa la sección de{' '}
            <span className="underline cursor-pointer">Gestión de Usuarios</span> para más detalles.
          </p>
        </div>

        {/* ── Tabla de empresas ── */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0F2C32]">Empresas registradas</h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              {empresasFiltradas.length} de {todasEmpresas.length}
            </span>
          </div>

          {/* Header tabla */}
          <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1fr] gap-3 px-3 pb-2.5 border-b border-slate-100">
            {['EMPRESA', 'TIPO', 'ASESORES', 'ENTRENS.', 'SCORE', 'INGRESOS/MES', 'ESTADO'].map(col => (
              <span key={col} className="text-xs font-semibold text-slate-300 tracking-widest uppercase">{col}</span>
            ))}
          </div>

          <div className="divide-y divide-slate-50">
            {empresasFiltradas.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No hay empresas que coincidan con los filtros.</p>
            ) : empresasFiltradas.map((e, i) => (
              <div key={i} className="hover:bg-slate-50 transition-colors px-3 py-3.5">

                {/* Desktop */}
                <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1fr] gap-3 items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0F2C32]/10 flex items-center justify-center flex-shrink-0">
                      <Building2 size={13} className="text-[#0F2C32]" />
                    </div>
                    <span className="text-sm font-medium text-slate-800 truncate">{e.nombre}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${tipoStyle[e.tipo]}`}>{e.tipo}</span>
                  <span className="text-sm text-slate-500">{e.asesores}</span>
                  <span className="text-sm text-slate-500">{e.entrenadores}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${scoreBarColor(e.scorePromedio)}`} style={{ width: `${e.scorePromedio}%` }} />
                    </div>
                    <span className={`text-sm font-semibold w-9 text-right ${scoreColor(e.scorePromedio)}`}>{e.scorePromedio}%</span>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${e.ingresosMes > 0 ? 'text-[#0F2C32]' : 'text-slate-300'}`}>
                    {fmtUSD(e.ingresosMes)}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${estadoStyle[e.estado]}`}>{e.estado}</span>
                    <button className="text-slate-300 hover:text-slate-500 transition-colors">
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0F2C32]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-[#0F2C32]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 truncate">{e.nombre}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${estadoStyle[e.estado]}`}>{e.estado}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${tipoStyle[e.tipo]}`}>{e.tipo}</span>
                      <span className="text-xs text-slate-500">{e.asesores} asesores · {e.entrenadores} entrens.</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${scoreBarColor(e.scorePromedio)}`} style={{ width: `${e.scorePromedio}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${scoreColor(e.scorePromedio)}`}>{e.scorePromedio}%</span>
                      </div>
                      <span className={`text-xs font-semibold ml-3 tabular-nums ${e.ingresosMes > 0 ? 'text-[#0F2C32]' : 'text-slate-300'}`}>
                        {fmtUSD(e.ingresosMes)}
                      </span>
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
