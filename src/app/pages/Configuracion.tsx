import { useState } from 'react';
import { User, Bell, Sliders, Lock } from 'lucide-react';

/* ── Toggle reutilizable ── */
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
        enabled ? 'bg-[#0F2C32]' : 'bg-slate-200'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

/* ── Fila de configuración con toggle ── */
function SettingRow({ label, description, enabled, onChange }: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-50 last:border-none">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

/* ── Sección contenedora ── */
function Section({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
          <Icon size={14} className="text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-[#0F2C32]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Configuracion() {
  /* Notificaciones */
  const [notifSesiones,   setNotifSesiones]   = useState(true);
  const [notifRecordatorio, setNotifRecordatorio] = useState(true);
  const [notifEmail,      setNotifEmail]      = useState(false);

  /* Entrenamiento */
  const [dificultad, setDificultad] = useState('medio');
  const [duracion,   setDuracion]   = useState('30');

  /* Perfil */
  const [nombre,    setNombre]    = useState('Juan Pérez');
  const [email,     setEmail]     = useState('juan.perez@empresa.com');
  const [editando,  setEditando]  = useState(false);

  const selectClass = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30";
  const inputClass  = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F2C32]/30 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
        <div>
          <p className="text-base md:text-lg font-semibold text-[#0F2C32]">Configuración</p>
          <p className="text-xs text-slate-400 mt-0.5">Ajusta tus preferencias de la plataforma</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ── Perfil ── */}
          <Section icon={User} title="Perfil">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  disabled={!editando}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={!editando}
                  className={inputClass}
                />
              </div>
              <div className="flex gap-2 pt-1">
                {editando ? (
                  <>
                    <button
                      onClick={() => setEditando(false)}
                      className="flex-1 py-2 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors"
                    >
                      Guardar cambios
                    </button>
                    <button
                      onClick={() => setEditando(false)}
                      className="px-4 py-2 text-xs font-medium border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditando(true)}
                    className="px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Editar perfil
                  </button>
                )}
              </div>
            </div>
          </Section>

          {/* ── Seguridad ── */}
          <Section icon={Lock} title="Seguridad">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Contraseña actual</label>
                <input type="password" placeholder="••••••••" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nueva contraseña</label>
                <input type="password" placeholder="••••••••" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Confirmar contraseña</label>
                <input type="password" placeholder="••••••••" className={inputClass} />
              </div>
              <button className="px-4 py-2 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors">
                Actualizar contraseña
              </button>
            </div>
          </Section>

          {/* ── Notificaciones ── */}
          <Section icon={Bell} title="Notificaciones">
            <SettingRow
              label="Sesiones completadas"
              description="Alerta al finalizar cada sesión de entrenamiento"
              enabled={notifSesiones}
              onChange={setNotifSesiones}
            />
            <SettingRow
              label="Recordatorios de entrenamiento"
              description="Notificaciones para mantener tu racha diaria"
              enabled={notifRecordatorio}
              onChange={setNotifRecordatorio}
            />
            <SettingRow
              label="Notificaciones por email"
              description="Recibe resúmenes semanales en tu correo"
              enabled={notifEmail}
              onChange={setNotifEmail}
            />
          </Section>

          {/* ── Preferencias de entrenamiento ── */}
          <Section icon={Sliders} title="Preferencias de entrenamiento">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Nivel de dificultad por defecto</label>
                <select value={dificultad} onChange={e => setDificultad(e.target.value)} className={selectClass}>
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Duración máxima de sesión</label>
                <select value={duracion} onChange={e => setDuracion(e.target.value)} className={selectClass}>
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Perfil de cliente favorito</label>
                <select className={selectClass}>
                  <option value="">Sin preferencia</option>
                  <option value="agresivo">Cliente Agresivo</option>
                  <option value="ansioso">Cliente Ansioso</option>
                  <option value="confundido">Cliente Confundido</option>
                  <option value="exigente">Cliente Exigente</option>
                  <option value="pasivo">Cliente Pasivo</option>
                  <option value="manipulador">Cliente Manipulador</option>
                </select>
              </div>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
