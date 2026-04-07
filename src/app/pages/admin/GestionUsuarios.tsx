import { useState, useMemo } from 'react';
import { Plus, X, Building2, Users, ArrowLeft, Search, ShieldOff, UserCheck, Pencil, Calendar } from 'lucide-react';

/* ── Tipos ── */
type Rol    = 'entrenador' | 'asesor';
type Estado = 'activo' | 'baneado';

interface Empresa {
  id: number;
  nombre: string;
  fechaCreacion: string;
  plan: string;
}

interface Usuario {
  id: number;
  empresaId: number;
  nombre: string;
  email: string;
  rol: Rol;
  area: string;
  estado: Estado;
  fechaCreacion: string;
}

/* ── Datos iniciales ── */
const empresasIniciales: Empresa[] = [
  { id: 1, nombre: 'Banco Continental', fechaCreacion: '2026-01-05', plan: 'Pro'    },
  { id: 2, nombre: 'Seguros del Sur',   fechaCreacion: '2026-01-20', plan: 'Básico' },
  { id: 3, nombre: 'Telco Express',     fechaCreacion: '2026-02-03', plan: 'Pro'    },
  { id: 4, nombre: 'Retail Max',        fechaCreacion: '2026-02-15', plan: 'Básico' },
  { id: 5, nombre: 'Financiera Norte',  fechaCreacion: '2026-03-01', plan: 'Pro'    },
];

const usuariosIniciales: Usuario[] = [
  { id: 1,  empresaId: 1, nombre: 'María Ríos',     email: 'maria.rios@banco.com',       rol: 'asesor',     area: 'Atención al Cliente', estado: 'activo',  fechaCreacion: '2026-01-10' },
  { id: 2,  empresaId: 1, nombre: 'Jorge Paredes',  email: 'jorge.p@banco.com',          rol: 'asesor',     area: 'Cobranzas',           estado: 'activo',  fechaCreacion: '2026-01-15' },
  { id: 3,  empresaId: 1, nombre: 'Carlos Mendoza', email: 'c.mendoza@banco.com',        rol: 'entrenador', area: 'Formación',            estado: 'activo',  fechaCreacion: '2026-02-01' },
  { id: 4,  empresaId: 2, nombre: 'Ana Torres',     email: 'a.torres@seguros.com',       rol: 'asesor',     area: 'Soporte',              estado: 'activo',  fechaCreacion: '2026-01-22' },
  { id: 5,  empresaId: 2, nombre: 'Andrés Mora',    email: 'amora@seguros.com',          rol: 'asesor',     area: 'Atención al Cliente', estado: 'baneado', fechaCreacion: '2026-02-10' },
  { id: 6,  empresaId: 3, nombre: 'Lucía Chávez',   email: 'l.chavez@telco.com',         rol: 'entrenador', area: 'Capacitación',         estado: 'activo',  fechaCreacion: '2026-02-05' },
  { id: 7,  empresaId: 3, nombre: 'Sofía Pérez',    email: 'sofia.p@telco.com',          rol: 'asesor',     area: 'Atención al Cliente', estado: 'activo',  fechaCreacion: '2026-02-18' },
  { id: 8,  empresaId: 3, nombre: 'Patricia Luna',  email: 'p.luna@telco.com',           rol: 'asesor',     area: 'Soporte',              estado: 'activo',  fechaCreacion: '2026-03-01' },
  { id: 9,  empresaId: 4, nombre: 'Bruno Quispe',   email: 'b.quispe@retail.com',        rol: 'asesor',     area: 'Ventas',               estado: 'activo',  fechaCreacion: '2026-02-20' },
  { id: 10, empresaId: 4, nombre: 'Elena Ramos',    email: 'e.ramos@retail.com',         rol: 'asesor',     area: 'Atención al Cliente', estado: 'activo',  fechaCreacion: '2026-03-05' },
  { id: 11, empresaId: 5, nombre: 'Rodrigo Vega',   email: 'r.vega@financiera.com',      rol: 'entrenador', area: 'Capacitación',         estado: 'activo',  fechaCreacion: '2026-03-08' },
  { id: 12, empresaId: 5, nombre: 'Diego Salinas',  email: 'd.salinas@financiera.com',   rol: 'asesor',     area: 'Soporte',              estado: 'activo',  fechaCreacion: '2026-03-12' },
];

const areas = ['Atención al Cliente', 'Cobranzas', 'Soporte', 'Formación', 'Capacitación', 'Ventas', 'Back Office'];

const rolStyle: Record<Rol, string> = {
  entrenador: 'bg-[#0F2C32]/10 text-[#0F2C32] border border-[#0F2C32]/20',
  asesor:     'bg-slate-100 text-slate-600 border border-slate-200',
};

const estadoStyle: Record<Estado, string> = {
  activo:  'bg-emerald-50 text-emerald-600 border border-emerald-100',
  baneado: 'bg-red-50 text-red-500 border border-red-100',
};

const inputClass  = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30";
const selectClass = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30";

const fmt = (fecha: string) => new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

/* ── Modal: nueva empresa ── */
function ModalNuevaEmpresa({ onClose, onCrear }: {
  onClose: () => void;
  onCrear: (nombre: string, plan: string) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [plan,   setPlan]   = useState('Básico');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-[#0F2C32] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Nueva empresa</p>
            <p className="text-white/50 text-xs mt-0.5">Registra una nueva organización</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre de la empresa</label>
            <input type="text" placeholder="Ej: Banco del Sur" value={nombre}
              onChange={e => setNombre(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Plan</label>
            <select value={plan} onChange={e => setPlan(e.target.value)} className={selectClass}>
              <option>Básico</option>
              <option>Pro</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
            <button
              onClick={() => { if (nombre.trim()) { onCrear(nombre.trim(), plan); onClose(); } }}
              className="flex-1 py-2.5 text-sm font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors"
            >
              Crear empresa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Modal: nuevo usuario ── */
function ModalNuevoUsuario({ empresa, onClose, onCrear }: {
  empresa: Empresa;
  onClose: () => void;
  onCrear: (u: Omit<Usuario, 'id' | 'fechaCreacion' | 'estado' | 'empresaId'>) => void;
}) {
  const [rol,    setRol]    = useState<Rol>('asesor');
  const [nombre, setNombre] = useState('');
  const [email,  setEmail]  = useState('');
  const [area,   setArea]   = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-[#0F2C32] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Nuevo usuario</p>
            <p className="text-white/50 text-xs mt-0.5">{empresa.nombre}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={16} /></button>
        </div>

        {/* Selector de rol */}
        <div className="px-6 pt-5">
          <p className="text-xs text-slate-400 mb-3">Selecciona el rol</p>
          <div className="grid grid-cols-2 gap-3">
            {(['asesor', 'entrenador'] as Rol[]).map(r => (
              <button
                key={r}
                onClick={() => setRol(r)}
                className={`relative py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  rol === r ? 'border-[#0F2C32] bg-[#0F2C32]/5' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${rol === r ? 'bg-[#0F2C32] text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Users size={16} />
                </div>
                <span className={`text-xs font-semibold capitalize ${rol === r ? 'text-[#0F2C32]' : 'text-slate-500'}`}>{r}</span>
                {rol === r && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0F2C32]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div className="px-6 py-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Nombre completo</label>
              <input type="text" placeholder="Ej: Juan Pérez" value={nombre}
                onChange={e => setNombre(e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Correo electrónico</label>
              <input type="email" placeholder="correo@empresa.com" value={email}
                onChange={e => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Área</label>
              <select value={area} onChange={e => setArea(e.target.value)} className={selectClass}>
                <option value="">Seleccionar área</option>
                {areas.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
            <button
              onClick={() => { if (nombre && email && area) { onCrear({ nombre, email, rol, area }); onClose(); } }}
              className="flex-1 py-2.5 text-sm font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors"
            >
              Crear usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Modal: confirmar baneo ── */
function ModalConfirmarBaneo({ usuario, onClose, onConfirm }: {
  usuario: Usuario; onClose: () => void; onConfirm: () => void;
}) {
  const esBaneado = usuario.estado === 'baneado';
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${esBaneado ? 'bg-emerald-50' : 'bg-red-50'}`}>
            {esBaneado ? <UserCheck size={22} className="text-emerald-500" /> : <ShieldOff size={22} className="text-red-400" />}
          </div>
          <p className="text-sm font-semibold text-[#0F2C32] mb-1">{esBaneado ? '¿Reactivar usuario?' : '¿Banear usuario?'}</p>
          <p className="text-xs text-slate-400 mb-1 font-medium">{usuario.nombre}</p>
          <p className="text-xs text-slate-400">{esBaneado ? 'El usuario podrá volver a iniciar sesión.' : 'El usuario no podrá iniciar sesión hasta ser reactivado.'}</p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${esBaneado ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
            {esBaneado ? 'Reactivar' : 'Banear'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal: editar usuario ── */
function ModalEditarUsuario({ usuario, onClose, onGuardar }: {
  usuario: Usuario; onClose: () => void; onGuardar: (u: Usuario) => void;
}) {
  const [form, setForm] = useState({ ...usuario });
  const set = (key: keyof Usuario, val: string) => setForm(prev => ({ ...prev, [key]: val }));
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-[#0F2C32] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Editar usuario</p>
            <p className="text-white/50 text-xs mt-0.5">{usuario.nombre}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre completo</label>
            <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Correo electrónico</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Rol</label>
              <select value={form.rol} onChange={e => set('rol', e.target.value)} className={selectClass}>
                <option value="asesor">Asesor</option>
                <option value="entrenador">Entrenador</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Área</label>
              <select value={form.area} onChange={e => set('area', e.target.value)} className={selectClass}>
                {areas.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
            <button onClick={() => { onGuardar(form); onClose(); }} className="flex-1 py-2.5 text-sm font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   VISTA DE USUARIOS POR EMPRESA
═══════════════════════════════════════════════════════ */
function UsuariosEmpresa({ empresa, usuarios, onVolver, onAgregar, onEditar, onToggleBaneo }: {
  empresa: Empresa;
  usuarios: Usuario[];
  onVolver: () => void;
  onAgregar: () => void;
  onEditar: (u: Usuario) => void;
  onToggleBaneo: (u: Usuario) => void;
}) {
  const [search, setSearch]           = useState('');
  const [filtroRol, setFiltroRol]     = useState<'todos' | Rol>('todos');

  const filtrados = useMemo(() => usuarios.filter(u => {
    if (search && !u.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtroRol !== 'todos' && u.rol !== filtroRol) return false;
    return true;
  }), [usuarios, search, filtroRol]);

  const activos = usuarios.filter(u => u.estado === 'activo').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onVolver} className="text-slate-400 hover:text-[#0F2C32] transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="w-9 h-9 rounded-lg bg-[#0F2C32]/10 flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-[#0F2C32]" />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold text-[#0F2C32] leading-tight">{empresa.nombre}</p>
              <p className="text-xs text-slate-400 mt-0.5">{activos} usuario{activos !== 1 ? 's' : ''} activo{activos !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onAgregar} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors whitespace-nowrap">
            <Plus size={14} /> Nuevo usuario
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-3 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Buscar usuario..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30 w-40 md:w-52" />
          </div>
          <select value={filtroRol} onChange={e => setFiltroRol(e.target.value as typeof filtroRol)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30">
            <option value="todos">Todos los roles</option>
            <option value="asesor">Asesor</option>
            <option value="entrenador">Entrenador</option>
          </select>
          <span className="ml-auto text-xs text-slate-400">{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 p-4 md:p-6">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100">
            {['USUARIO', 'EMAIL', 'ROL', 'ÁREA', 'ESTADO', 'ACCIONES'].map(col => (
              <span key={col} className="text-xs font-semibold text-slate-300 tracking-widest uppercase">{col}</span>
            ))}
          </div>
          <div className="divide-y divide-slate-50">
            {filtrados.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">Sin usuarios registrados</p>
            ) : filtrados.map(u => (
              <div key={u.id} className="hover:bg-slate-50 transition-colors px-5 py-3.5">

                {/* Desktop */}
                <div className="hidden md:grid md:grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-4 items-center">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${u.estado === 'baneado' ? 'bg-red-50 text-red-400' : 'bg-[#0F2C32]/10 text-[#0F2C32]'}`}>
                      {u.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 truncate">{u.nombre}</p>
                      <p className="text-xs text-slate-400">{u.fechaCreacion}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 truncate">{u.email}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md w-fit ${rolStyle[u.rol]}`}>{u.rol}</span>
                  <span className="text-sm text-slate-500 truncate">{u.area}</span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full w-fit ${estadoStyle[u.estado]}`}>{u.estado}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEditar(u)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => onToggleBaneo(u)} className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${u.estado === 'baneado' ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' : 'border-red-200 text-red-500 hover:bg-red-50'}`}>
                      {u.estado === 'baneado' ? <><UserCheck size={12} /> Reactivar</> : <><ShieldOff size={12} /> Banear</>}
                    </button>
                  </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${u.estado === 'baneado' ? 'bg-red-50 text-red-400' : 'bg-[#0F2C32]/10 text-[#0F2C32]'}`}>
                    {u.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 truncate">{u.nombre}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${estadoStyle[u.estado]}`}>{u.estado}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{u.email} · {u.area}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${rolStyle[u.rol]}`}>{u.rol}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onEditar(u)} className="flex items-center gap-1 text-xs font-medium text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                          <Pencil size={11} /> Editar
                        </button>
                        <button onClick={() => onToggleBaneo(u)} className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border transition-colors ${u.estado === 'baneado' ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' : 'text-red-500 border-red-200 hover:bg-red-50'}`}>
                          {u.estado === 'baneado' ? <><UserCheck size={11} /> Reactivar</> : <><ShieldOff size={11} /> Banear</>}
                        </button>
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

/* ═══════════════════════════════════════════════════════
   PÁGINA PRINCIPAL — CARDS DE EMPRESAS
═══════════════════════════════════════════════════════ */
export default function GestionUsuarios() {
  const [empresas,  setEmpresas]  = useState<Empresa[]>(empresasIniciales);
  const [usuarios,  setUsuarios]  = useState<Usuario[]>(usuariosIniciales);
  const [empresaSel, setEmpresaSel] = useState<Empresa | null>(null);

  const [modalEmpresa, setModalEmpresa]     = useState(false);
  const [modalUsuario, setModalUsuario]     = useState(false);
  const [editando,     setEditando]         = useState<Usuario | null>(null);
  const [confirmBaneo, setConfirmBaneo]     = useState<Usuario | null>(null);

  const crearEmpresa = (nombre: string, plan: string) => {
    const nueva: Empresa = {
      id: Date.now(),
      nombre,
      plan,
      fechaCreacion: new Date().toISOString().split('T')[0],
    };
    setEmpresas(prev => [...prev, nueva]);
  };

  const crearUsuario = (data: Omit<Usuario, 'id' | 'fechaCreacion' | 'estado' | 'empresaId'>) => {
    if (!empresaSel) return;
    const nuevo: Usuario = {
      ...data,
      id: Date.now(),
      empresaId: empresaSel.id,
      estado: 'activo',
      fechaCreacion: new Date().toISOString().split('T')[0],
    };
    setUsuarios(prev => [...prev, nuevo]);
  };

  const editarUsuario = (u: Usuario) =>
    setUsuarios(prev => prev.map(x => x.id === u.id ? u : x));

  const toggleBaneo = (u: Usuario) => {
    setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, estado: x.estado === 'activo' ? 'baneado' : 'activo' } : x));
    setConfirmBaneo(null);
  };

  const usuariosDeEmpresa = (id: number) => usuarios.filter(u => u.empresaId === id);
  const activosDeEmpresa  = (id: number) => usuarios.filter(u => u.empresaId === id && u.estado === 'activo').length;

  /* Vista detalle de empresa */
  if (empresaSel) return (
    <>
      {modalUsuario && (
        <ModalNuevoUsuario empresa={empresaSel} onClose={() => setModalUsuario(false)} onCrear={crearUsuario} />
      )}
      {editando && (
        <ModalEditarUsuario usuario={editando} onClose={() => setEditando(null)} onGuardar={editarUsuario} />
      )}
      {confirmBaneo && (
        <ModalConfirmarBaneo usuario={confirmBaneo} onClose={() => setConfirmBaneo(null)} onConfirm={() => toggleBaneo(confirmBaneo)} />
      )}
      <UsuariosEmpresa
        empresa={empresaSel}
        usuarios={usuariosDeEmpresa(empresaSel.id)}
        onVolver={() => setEmpresaSel(null)}
        onAgregar={() => setModalUsuario(true)}
        onEditar={setEditando}
        onToggleBaneo={setConfirmBaneo}
      />
    </>
  );

  /* Vista principal: cards de empresas */
  return (
    <>
      {modalEmpresa && <ModalNuevaEmpresa onClose={() => setModalEmpresa(false)} onCrear={crearEmpresa} />}

      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-base md:text-lg font-semibold text-[#0F2C32]">Gestión de usuarios</p>
              <p className="text-xs text-slate-400 mt-0.5">{empresas.length} empresa{empresas.length !== 1 ? 's' : ''} registrada{empresas.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setModalEmpresa(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors whitespace-nowrap"
            >
              <Plus size={14} /> Nueva empresa
            </button>
          </div>
        </div>

        {/* Cards de empresas */}
        <div className="flex-1 p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {empresas.map(e => {
              const totalUsuarios  = usuariosDeEmpresa(e.id).length;
              const totalActivos   = activosDeEmpresa(e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => setEmpresaSel(e)}
                  className="bg-white border border-slate-200 rounded-lg p-5 text-left hover:border-[#0F2C32]/40 hover:shadow-sm transition-all group"
                >
                  {/* Ícono + nombre */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#0F2C32]/10 flex items-center justify-center group-hover:bg-[#0F2C32] transition-colors flex-shrink-0">
                      <Building2 size={20} className="text-[#0F2C32] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      {e.plan}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 mb-1">{e.nombre}</p>

                  {/* Fecha de creación */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                    <Calendar size={11} />
                    <span>Creada el {fmt(e.fechaCreacion)}</span>
                  </div>

                  {/* Contador de usuarios */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users size={13} className="text-slate-400" />
                      <span><span className="font-semibold text-[#0F2C32]">{totalActivos}</span> usuario{totalActivos !== 1 ? 's' : ''} activo{totalActivos !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="text-xs text-slate-400">{totalUsuarios} en total</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
