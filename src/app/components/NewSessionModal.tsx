import { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, ArrowRight, ChevronDown } from 'lucide-react';
import { useSessions } from '../context/SessionsContext';

type DifficultyLevel = 'alto' | 'medio' | 'bajo';

interface ClientProfile {
  name: string;
  sector: string;
  level: DifficultyLevel;
  description: string;
}

const difficultyStyles: Record<DifficultyLevel, string> = {
  alto:  'bg-slate-100 text-slate-700 border border-slate-200',
  medio: 'bg-slate-50  text-slate-500 border border-slate-200',
  bajo:  'bg-white     text-slate-400 border border-slate-200',
};

const clientProfiles: ClientProfile[] = [
  { name: 'Cliente Agresivo',    sector: 'Call Center', level: 'alto',  description: 'Tono confrontacional, respuestas exigentes' },
  { name: 'Cliente Ansioso',     sector: 'Banco',       level: 'medio', description: 'Preguntas repetitivas, necesita calma' },
  { name: 'Cliente Confundido',  sector: 'Retail',      level: 'bajo',  description: 'Necesita orientación clara y paciente' },
  { name: 'Cliente Exigente',    sector: 'Seguros',     level: 'alto',  description: 'Altos estándares, poca tolerancia a errores' },
  { name: 'Cliente Pasivo',      sector: 'Telco',       level: 'bajo',  description: 'Poca iniciativa, requiere guía activa' },
  { name: 'Cliente Manipulador', sector: 'Financiero',  level: 'alto',  description: 'Intenta desviar o presionar al asesor' },
];

const motivosContacto = [
  'Devolución / Reembolso',
  'Consulta de producto',
  'Reclamo por envío',
  'Facturación / Cobros',
  'Soporte técnico',
  'Cancelación de servicio',
  'Información de cuenta',
  'Queja general',
];

const levelByDifficulty: Record<string, string> = {
  alto:  'Avanzado',
  medio: 'Intermedio',
  bajo:  'Básico',
};

interface NewSessionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NewSessionModal({ open, onClose }: NewSessionModalProps) {
  const navigate = useNavigate();
  const { addSession } = useSessions();
  const [selected, setSelected] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');

  if (!open) return null;

  const canStart = !!selected && !!motivo;

  const handleStart = () => {
    if (!canStart) return;
    const profile = clientProfiles.find(p => p.name === selected)!;
    const level = levelByDifficulty[profile.level];
    const id = addSession(selected, level, motivo);
    onClose();
    setSelected(null);
    setMotivo('');
    navigate(`/historial-chat/${id}`);
  };

  const handleClose = () => {
    setSelected(null);
    setMotivo('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-[#0F2C32]">Nueva Sesión</h2>
            <p className="text-xs text-slate-400 mt-0.5">Completa los campos para comenzar la simulación</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh]">

          {/* Motivo de contacto */}
          <div className="px-5 pt-5 pb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Motivo de contacto
            </label>
            <div className="relative">
              <select
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                className={`w-full appearance-none px-3.5 py-2.5 pr-9 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C32]/25 focus:border-[#0F2C32] transition-colors ${
                  motivo ? 'text-slate-800 border-[#0F2C32]/40' : 'text-slate-400 border-slate-200'
                }`}
              >
                <option value="" disabled>Selecciona un motivo...</option>
                {motivosContacto.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Separador */}
          <div className="px-5 pb-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Perfil de cliente</p>

            {/* Profile grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {clientProfiles.map((profile) => {
                const isSelected = selected === profile.name;
                return (
                  <button
                    key={profile.name}
                    onClick={() => setSelected(isSelected ? null : profile.name)}
                    className={`text-left border rounded-lg px-3.5 py-3 transition-all ${
                      isSelected
                        ? 'border-[#0F2C32] bg-[#0F2C32]/5 ring-1 ring-[#0F2C32]/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{profile.name}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md flex-shrink-0 ${difficultyStyles[profile.level]}`}>
                        {profile.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{profile.description}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1.5">{profile.sector}</p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
          <div className="text-xs text-slate-400 min-w-0">
            {canStart
              ? <span className="text-[#0F2C32] font-medium truncate">{selected} · {motivo}</span>
              : <span>{!motivo ? 'Elige un motivo' : 'Elige un perfil'}</span>
            }
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleStart}
              disabled={!canStart}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Iniciar Sesión <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
