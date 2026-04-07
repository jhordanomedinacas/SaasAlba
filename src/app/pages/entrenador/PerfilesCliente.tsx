import { useState } from 'react';
import {
  Plus, X, Brain, Zap, Target, Users, Star, ChevronRight,
  Pencil, Trash2, Sparkles, CheckCircle2, Loader2,
} from 'lucide-react';

/* ── Tipos ── */
type Dificultad = 'alto' | 'medio' | 'bajo';

interface Perfil {
  id: number;
  nombre: string;
  sector: string;
  dificultad: Dificultad;
  descripcion: string;
  sesiones: number;
  scorePromedio: number;
  efectividad: number;
  generadoPorIA: boolean;
}

/* ── Datos ── */
const perfilesIniciales: Perfil[] = [
  {
    id: 1,
    nombre: 'Cliente Agresivo',
    sector: 'Call Center',
    dificultad: 'alto',
    descripcion: 'Cliente que levanta la voz, interrumpe constantemente y amenaza con cancelar. Requiere técnicas de desescalada.',
    sesiones: 48,
    scorePromedio: 76,
    efectividad: 82,
    generadoPorIA: false,
  },
  {
    id: 2,
    nombre: 'Cliente Ansioso',
    sector: 'Banca',
    dificultad: 'medio',
    descripcion: 'Cliente que repite la misma pregunta varias veces por inseguridad. Necesita confirmaciones constantes y tono tranquilizador.',
    sesiones: 35,
    scorePromedio: 84,
    efectividad: 90,
    generadoPorIA: false,
  },
  {
    id: 3,
    nombre: 'Cliente Confundido',
    sector: 'Retail',
    dificultad: 'bajo',
    descripcion: 'Cliente con dificultades para explicar su problema. Requiere paciencia y preguntas guiadas para identificar la necesidad.',
    sesiones: 29,
    scorePromedio: 91,
    efectividad: 95,
    generadoPorIA: false,
  },
  {
    id: 4,
    nombre: 'Cliente Exigente',
    sector: 'Seguros',
    dificultad: 'alto',
    descripcion: 'Cliente que exige soluciones inmediatas y no acepta explicaciones. Valora la eficiencia y odia los procesos.',
    sesiones: 42,
    scorePromedio: 79,
    efectividad: 85,
    generadoPorIA: false,
  },
  {
    id: 5,
    nombre: 'Cliente Manipulador',
    sector: 'Financiero',
    dificultad: 'alto',
    descripcion: 'Intenta obtener beneficios adicionales usando excusas emocionales o amenazas veladas. Requiere firmeza con empatía.',
    sesiones: 21,
    scorePromedio: 72,
    efectividad: 78,
    generadoPorIA: true,
  },
  {
    id: 6,
    nombre: 'Cliente Pasivo',
    sector: 'Telco',
    dificultad: 'bajo',
    descripcion: 'Responde con monosílabos y no da señales de satisfacción o insatisfacción. Requiere técnicas de sondeo activo.',
    sesiones: 18,
    scorePromedio: 88,
    efectividad: 92,
    generadoPorIA: true,
  },
];

const sectores = ['Call Center', 'Banca', 'Retail', 'Seguros', 'Financiero', 'Telco', 'Salud', 'Gobierno'];

const dificultadStyle: Record<Dificultad, { badge: string; bar: string; label: string }> = {
  alto:  { badge: 'bg-red-50 text-red-500 border border-red-100',         bar: 'bg-red-400',    label: 'Alto' },
  medio: { badge: 'bg-amber-50 text-amber-600 border border-amber-100',   bar: 'bg-amber-400',  label: 'Medio' },
  bajo:  { badge: 'bg-emerald-50 text-emerald-600 border border-emerald-100', bar: 'bg-emerald-400', label: 'Bajo' },
};

const scoreColor = (s: number) => s >= 85 ? 'text-[#0F2C32]' : s >= 70 ? 'text-slate-600' : 'text-slate-400';

type EstadoML = 'idle' | 'training' | 'done';

/* ── Modal nuevo perfil ── */
function ModalNuevoPerfil({ onClose, onCrear }: {
  onClose: () => void;
  onCrear: (p: Omit<Perfil, 'id' | 'sesiones' | 'scorePromedio' | 'efectividad'>) => void;
}) {
  const [nombre,      setNombre]      = useState('');
  const [sector,      setSector]      = useState('Call Center');
  const [dificultad,  setDificultad]  = useState<Dificultad>('medio');
  const [descripcion, setDescripcion] = useState('');

  const inputClass  = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30";
  const selectClass = inputClass;

  const guardar = () => {
    if (!nombre.trim() || !descripcion.trim()) return;
    onCrear({ nombre, sector, dificultad, descripcion, generadoPorIA: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-[#0F2C32] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Nuevo perfil de cliente</p>
            <p className="text-white/50 text-xs mt-0.5">Define el comportamiento y características</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre del perfil</label>
            <input type="text" placeholder="Ej: Cliente Indeciso" value={nombre}
              onChange={e => setNombre(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Sector</label>
              <select value={sector} onChange={e => setSector(e.target.value)} className={selectClass}>
                {sectores.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Dificultad</label>
              <select value={dificultad} onChange={e => setDificultad(e.target.value as Dificultad)} className={selectClass}>
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Descripción del comportamiento</label>
            <textarea
              rows={3}
              placeholder="Describe cómo se comporta este cliente, qué espera y qué técnicas requiere..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={!nombre.trim() || !descripcion.trim()}
              className="flex-1 py-2.5 text-sm font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Crear perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Card de perfil ── */
function PerfilCard({ perfil, onEditar, onEliminar }: {
  perfil: Perfil;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  const d = dificultadStyle[perfil.dificultad];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#0F2C32] truncate">{perfil.nombre}</p>
            {perfil.generadoPorIA && (
              <span className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                <Sparkles size={9} /> IA
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-slate-400">{perfil.sector}</span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${d.badge}`}>
              {d.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onEditar} className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={onEliminar} className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{perfil.descripcion}</p>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Efectividad del entrenamiento</span>
          <span className={`text-xs font-semibold ${scoreColor(perfil.efectividad)}`}>{perfil.efectividad}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${d.bar}`} style={{ width: `${perfil.efectividad}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Users size={11} /> {perfil.sesiones} sesiones
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Star size={11} /> {perfil.scorePromedio}% score
          </span>
        </div>
        <button className="flex items-center gap-1 text-xs font-medium text-[#0F2C32] hover:underline">
          Ver sesiones <ChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}

/* ── Panel ML ── */
function PanelML() {
  const [prompt,  setPrompt]  = useState('');
  const [estado,  setEstado]  = useState<EstadoML>('idle');
  const [resultado, setResultado] = useState('');

  const ejemplos = [
    'Cliente mayor de 60 años que no entiende los procesos digitales y pide hablar con un humano constantemente.',
    'Cliente VIP con alto valor de cuenta que exige atención prioritaria y descuentos exclusivos.',
    'Cliente que usa redes sociales y amenaza con publicar su mala experiencia si no se le resuelve.',
  ];

  const entrenar = () => {
    if (!prompt.trim()) return;
    setEstado('training');
    setResultado('');
    setTimeout(() => {
      setEstado('done');
      setResultado(
        `Perfil generado: "Cliente ${prompt.split(' ').slice(0, 2).join(' ')}". ` +
        `El modelo ha identificado patrones de comportamiento: alta resistencia al proceso estándar, necesidad de validación emocional y tendencia a escalar. ` +
        `Se recomienda estrategia de escucha activa con reencuadre positivo. ` +
        `Efectividad estimada del entrenamiento: 87%.`
      );
    }, 2800);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
          <Brain size={18} className="text-violet-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#0F2C32]">Entrenamiento con IA</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Describe el comportamiento de un tipo de cliente y el modelo generará un perfil de entrenamiento automáticamente.
          </p>
        </div>
      </div>

      {/* Ejemplos */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2">Ejemplos de descripción:</p>
        <div className="flex flex-col gap-1.5">
          {ejemplos.map((ej, i) => (
            <button
              key={i}
              onClick={() => setPrompt(ej)}
              className="text-left text-xs text-slate-500 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 hover:border-[#0F2C32]/20 hover:bg-[#0F2C32]/5 hover:text-[#0F2C32] transition-colors"
            >
              "{ej}"
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        rows={4}
        placeholder="Describe el tipo de cliente que quieres simular: su comportamiento, sector, emociones, nivel de dificultad, y qué espera del asesor..."
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30 resize-none"
      />

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={entrenar}
          disabled={!prompt.trim() || estado === 'training'}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {estado === 'training' ? (
            <><Loader2 size={13} className="animate-spin" /> Generando perfil...</>
          ) : (
            <><Zap size={13} /> Generar perfil con IA</>
          )}
        </button>
        {estado !== 'idle' && (
          <button onClick={() => { setEstado('idle'); setPrompt(''); setResultado(''); }}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Limpiar
          </button>
        )}
      </div>

      {/* Resultado */}
      {estado === 'done' && resultado && (
        <div className="mt-4 p-4 bg-violet-50 border border-violet-100 rounded-lg flex items-start gap-3">
          <CheckCircle2 size={15} className="text-violet-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-violet-700 mb-1">Perfil generado exitosamente</p>
            <p className="text-xs text-violet-600 leading-relaxed">{resultado}</p>
            <button className="mt-2 flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline">
              <Plus size={11} /> Agregar a perfiles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Página principal ── */
export default function PerfilesCliente() {
  const [perfiles,    setPerfiles]    = useState<Perfil[]>(perfilesIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtroDif,   setFiltroDif]   = useState<Dificultad | 'Todos'>('Todos');

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const capitalizedDate = today.charAt(0).toUpperCase() + today.slice(1);

  const perfilesFiltrados = filtroDif === 'Todos'
    ? perfiles
    : perfiles.filter(p => p.dificultad === filtroDif);

  const agregarPerfil = (datos: Omit<Perfil, 'id' | 'sesiones' | 'scorePromedio' | 'efectividad'>) => {
    const nuevo: Perfil = {
      ...datos,
      id: Date.now(),
      sesiones: 0,
      scorePromedio: 0,
      efectividad: 0,
    };
    setPerfiles(prev => [nuevo, ...prev]);
  };

  const eliminarPerfil = (id: number) => setPerfiles(prev => prev.filter(p => p.id !== id));

  return (
    <>
      {modalAbierto && <ModalNuevoPerfil onClose={() => setModalAbierto(false)} onCrear={agregarPerfil} />}

      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-base md:text-lg font-semibold text-[#0F2C32]">Perfiles de Cliente</p>
              <p className="text-xs text-slate-400 mt-0.5">{capitalizedDate}</p>
            </div>
            <button
              onClick={() => setModalAbierto(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors whitespace-nowrap"
            >
              <Plus size={14} /> Nuevo perfil
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 space-y-5">

          {/* KPIs rápidos */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Perfiles activos', value: String(perfiles.length), icon: Target },
              { label: 'Sesiones totales', value: String(perfiles.reduce((a, p) => a + p.sesiones, 0)), icon: Users },
              { label: 'Efectividad prom.', value: `${Math.round(perfiles.filter(p=>p.efectividad>0).reduce((a,p)=>a+p.efectividad,0)/Math.max(1,perfiles.filter(p=>p.efectividad>0).length))}%`, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#0F2C32] tabular-nums">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Perfiles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-300 tracking-widest uppercase">Perfiles disponibles</p>
              <div className="flex items-center gap-1.5">
                {(['Todos', 'bajo', 'medio', 'alto'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setFiltroDif(d)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                      filtroDif === d
                        ? 'bg-[#0F2C32] text-white border-[#0F2C32]'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {d === 'Todos' ? 'Todos' : dificultadStyle[d].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {perfilesFiltrados.map(p => (
                <PerfilCard
                  key={p.id}
                  perfil={p}
                  onEditar={() => {}}
                  onEliminar={() => eliminarPerfil(p.id)}
                />
              ))}
            </div>
          </div>

          {/* Panel ML */}
          <div>
            <p className="text-xs font-semibold text-slate-300 tracking-widest uppercase mb-3">Machine Learning</p>
            <PanelML />
          </div>

        </div>
      </div>
    </>
  );
}
