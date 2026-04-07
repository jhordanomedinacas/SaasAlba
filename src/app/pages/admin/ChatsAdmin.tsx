import { useState, useMemo } from 'react';
import { Search, X, ChevronLeft, ChevronRight, MessageSquare, Clock, TrendingUp, Tag, Building2, ArrowLeft } from 'lucide-react';

type Rol    = 'entrenador' | 'asesor';
type Status = 'completado' | 'en curso' | 'incompleto';

interface Usuario {
  id: number;
  nombre: string;
  iniciales: string;
  email: string;
  rol: Rol;
  empresa: string;
  area: string;
  sesiones: number;
  scorePromedio: number | null;
}

interface ChatSesion {
  id: string;
  escenario: string;
  motivo: string;
  nivel: string;
  fecha: string;
  duracion: string;
  score: number | null;
  status: Status;
}

const usuarios: Usuario[] = [
  { id: 1, nombre: 'María Ríos',     iniciales: 'MR', email: 'maria.rios@banco.com',    rol: 'asesor',     empresa: 'Banco Continental', area: 'Atención al Cliente', sesiones: 12, scorePromedio: 84 },
  { id: 2, nombre: 'Jorge Paredes',  iniciales: 'JP', email: 'jorge.p@banco.com',        rol: 'asesor',     empresa: 'Banco Continental', area: 'Cobranzas',           sesiones: 8,  scorePromedio: 72 },
  { id: 3, nombre: 'Lucía Chávez',   iniciales: 'LC', email: 'l.chavez@telco.com',       rol: 'entrenador', empresa: 'Telco Express',     area: 'Formación',           sesiones: 5,  scorePromedio: 91 },
  { id: 4, nombre: 'Sofía Pérez',    iniciales: 'SP', email: 'sofia.p@telco.com',        rol: 'asesor',     empresa: 'Telco Express',     area: 'Atención al Cliente', sesiones: 15, scorePromedio: 88 },
  { id: 5, nombre: 'Rodrigo Vega',   iniciales: 'RV', email: 'r.vega@financiera.com',    rol: 'entrenador', empresa: 'Financiera Norte',  area: 'Capacitación',        sesiones: 7,  scorePromedio: 79 },
  { id: 6, nombre: 'Ana Torres',     iniciales: 'AT', email: 'a.torres@seguros.com',     rol: 'asesor',     empresa: 'Seguros del Sur',   area: 'Soporte',             sesiones: 10, scorePromedio: 67 },
  { id: 7, nombre: 'Carlos Mendoza', iniciales: 'CM', email: 'c.mendoza@banco.com',      rol: 'asesor',     empresa: 'Banco Continental', area: 'Cobranzas',           sesiones: 6,  scorePromedio: 75 },
  { id: 8, nombre: 'Patricia Luna',  iniciales: 'PL', email: 'p.luna@telco.com',         rol: 'asesor',     empresa: 'Telco Express',     area: 'Atención al Cliente', sesiones: 9,  scorePromedio: 82 },
  { id: 9, nombre: 'Diego Salinas',  iniciales: 'DS', email: 'd.salinas@financiera.com', rol: 'asesor',     empresa: 'Financiera Norte',  area: 'Soporte',             sesiones: 4,  scorePromedio: 61 },
  { id: 10, nombre: 'Valeria Cruz',  iniciales: 'VC', email: 'v.cruz@seguros.com',       rol: 'entrenador', empresa: 'Seguros del Sur',   area: 'Formación',           sesiones: 11, scorePromedio: 93 },
  { id: 11, nombre: 'Bruno Quispe',  iniciales: 'BQ', email: 'b.quispe@retail.com',      rol: 'asesor',     empresa: 'Retail Max',        area: 'Ventas',              sesiones: 3,  scorePromedio: 58 },
  { id: 12, nombre: 'Elena Ramos',   iniciales: 'ER', email: 'e.ramos@retail.com',       rol: 'asesor',     empresa: 'Retail Max',        area: 'Atención al Cliente', sesiones: 7,  scorePromedio: 70 },
];

const sesionesPool: Record<number, ChatSesion[]> = {
  1: [
    { id: '1a', escenario: 'Cliente Agresivo',    motivo: 'Devolución / Reembolso',   nivel: 'Avanzado',   fecha: '03/04/2026', duracion: '18 min', score: 82,   status: 'completado' },
    { id: '1b', escenario: 'Cliente Ansioso',     motivo: 'Facturación / Cobros',     nivel: 'Intermedio', fecha: '01/04/2026', duracion: '12 min', score: 74,   status: 'completado' },
    { id: '1c', escenario: 'Cliente Confundido',  motivo: 'Consulta de producto',     nivel: 'Básico',     fecha: '30/03/2026', duracion: '09 min', score: null, status: 'en curso'   },
  ],
  2: [
    { id: '2a', escenario: 'Cliente Exigente',    motivo: 'Reclamo por envío',        nivel: 'Avanzado',   fecha: '02/04/2026', duracion: '22 min', score: 71,   status: 'completado' },
    { id: '2b', escenario: 'Cliente Pasivo',      motivo: 'Información de cuenta',    nivel: 'Básico',     fecha: '29/03/2026', duracion: '08 min', score: 65,   status: 'incompleto' },
  ],
  3: [
    { id: '3a', escenario: 'Cliente Manipulador', motivo: 'Cancelación de servicio',  nivel: 'Avanzado',   fecha: '03/04/2026', duracion: '25 min', score: 91,   status: 'completado' },
    { id: '3b', escenario: 'Cliente Agresivo',    motivo: 'Devolución / Reembolso',   nivel: 'Avanzado',   fecha: '01/04/2026', duracion: '20 min', score: 88,   status: 'completado' },
  ],
};

const empresas = ['Todas las empresas', 'Banco Continental', 'Seguros del Sur', 'Telco Express', 'Retail Max', 'Financiera Norte'];

const statusStyles: Record<Status, string> = {
  completado:  'bg-[#0F2C32] text-white',
  'en curso':  'bg-slate-200 text-slate-600',
  incompleto:  'bg-slate-100 text-slate-500 border border-slate-200',
};

const scoreColor = (s: number) => s >= 85 ? 'text-[#0F2C32]' : s >= 70 ? 'text-slate-600' : 'text-slate-400';

const ITEMS_POR_PAGINA = 6;

/* ── Vista de chats de un usuario ── */
function ChatsUsuario({ usuario, onVolver }: { usuario: Usuario; onVolver: () => void }) {
  const sesiones = sesionesPool[usuario.id] ?? [];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onVolver} className="text-slate-400 hover:text-[#0F2C32] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#0F2C32]/10 flex items-center justify-center text-xs font-bold text-[#0F2C32] flex-shrink-0">
            {usuario.iniciales}
          </div>
          <div>
            <p className="text-base md:text-lg font-semibold text-[#0F2C32] leading-tight">{usuario.nombre}</p>
            <p className="text-xs text-slate-400 mt-0.5">{usuario.empresa} · {usuario.area}</p>
          </div>
        </div>
      </div>

      {/* Lista de sesiones */}
      <div className="flex-1 p-4 md:p-6">
        {sesiones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <MessageSquare size={28} className="mb-2 opacity-40" />
            <p className="text-sm">Este usuario no tiene sesiones registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sesiones.map(s => (
              <div key={s.id} className="bg-white border border-slate-200 rounded-lg px-4 py-4 flex items-center justify-between gap-4 hover:border-[#0F2C32]/30 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.status === 'en curso' ? 'bg-[#0F2C32]/10' : 'bg-slate-100'}`}>
                    <MessageSquare size={18} className={s.status === 'en curso' ? 'text-[#0F2C32]' : 'text-slate-400'} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{s.escenario}</p>
                    <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                      <Tag size={10} />{s.motivo}
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">{s.fecha}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={11} />{s.duracion}
                      </span>
                      <span className="text-xs text-slate-400">{s.nivel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                  {s.score !== null && (
                    <span className={`flex items-center gap-1 text-sm font-bold ${scoreColor(s.score)}`}>
                      <TrendingUp size={13} />{s.score}%
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[s.status]}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Vista principal: listado de usuarios ── */
export default function ChatsAdmin() {
  const [search, setSearch]           = useState('');
  const [empresa, setEmpresa]         = useState('Todas las empresas');
  const [filtroRol, setFiltroRol]     = useState<'todos' | Rol>('todos');
  const [pagina, setPagina]           = useState(1);
  const [usuarioSel, setUsuarioSel]   = useState<Usuario | null>(null);

  const filtrados = useMemo(() => usuarios.filter(u => {
    if (search && !u.nombre.toLowerCase().includes(search.toLowerCase()) &&
        !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (empresa !== 'Todas las empresas' && u.empresa !== empresa) return false;
    if (filtroRol !== 'todos' && u.rol !== filtroRol) return false;
    return true;
  }), [search, empresa, filtroRol]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles     = filtrados.slice((paginaActual - 1) * ITEMS_POR_PAGINA, paginaActual * ITEMS_POR_PAGINA);

  const limpiar = () => { setSearch(''); setEmpresa('Todas las empresas'); setFiltroRol('todos'); setPagina(1); };
  const hayFiltros = search || empresa !== 'Todas las empresas' || filtroRol !== 'todos';

  if (usuarioSel) return <ChatsUsuario usuario={usuarioSel} onVolver={() => setUsuarioSel(null)} />;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
        <div>
          <p className="text-base md:text-lg font-semibold text-[#0F2C32]">Chats por usuario</p>
          <p className="text-xs text-slate-400 mt-0.5">Selecciona un usuario para ver sus sesiones</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-3 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text" placeholder="Buscar usuario..." value={search}
              onChange={e => { setSearch(e.target.value); setPagina(1); }}
              className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30 w-40 md:w-52"
            />
          </div>
          <select value={empresa} onChange={e => { setEmpresa(e.target.value); setPagina(1); }}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30">
            {empresas.map(e => <option key={e}>{e}</option>)}
          </select>
          <select value={filtroRol} onChange={e => { setFiltroRol(e.target.value as typeof filtroRol); setPagina(1); }}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30">
            <option value="todos">Todos los roles</option>
            <option value="asesor">Asesor</option>
            <option value="entrenador">Entrenador</option>
          </select>
          {hayFiltros && (
            <button onClick={limpiar} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              <X size={11} /> Limpiar
            </button>
          )}
          <span className="ml-auto text-xs text-slate-400">{filtrados.length} usuario{filtrados.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-4 md:p-6 flex flex-col gap-5">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Search size={28} className="mb-2 opacity-40" />
            <p className="text-sm">Sin resultados para los filtros aplicados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibles.map(u => (
              <button
                key={u.id}
                onClick={() => setUsuarioSel(u)}
                className="bg-white border border-slate-200 rounded-lg p-4 text-left hover:border-[#0F2C32]/40 hover:shadow-sm transition-all group"
              >
                {/* Avatar + nombre */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#0F2C32]/10 flex items-center justify-center text-sm font-bold text-[#0F2C32] flex-shrink-0 group-hover:bg-[#0F2C32] group-hover:text-white transition-colors">
                    {u.iniciales}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{u.nombre}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Building2 size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{u.empresa}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${u.rol === 'entrenador' ? 'bg-[#0F2C32]/10 text-[#0F2C32] border border-[#0F2C32]/20' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                      {u.rol}
                    </span>
                    <span className="text-xs text-slate-400">{u.area}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MessageSquare size={12} className="text-slate-400" />
                    <span>{u.sesiones} sesiones</span>
                  </div>
                  {u.scorePromedio !== null && (
                    <span className={`text-sm font-bold ${scoreColor(u.scorePromedio)}`}>
                      {u.scorePromedio}%
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 mt-auto pt-2">
            <button
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPagina(n)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  n === paginaActual
                    ? 'bg-[#0F2C32] text-white'
                    : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
