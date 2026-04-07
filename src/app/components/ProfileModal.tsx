import { useState } from 'react';
import { X, Mail, Briefcase, CreditCard, Trash2, AlertTriangle, CalendarDays, ShieldCheck } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

type ConfirmAction = 'payment' | 'subscription' | null;

function Corner() {
  return (
    <>
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
      {children}
    </p>
  );
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 sm:mx-6 rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header oscuro ── */}
        <div className="relative bg-[#0F2C32] px-6 sm:px-8 pt-7 pb-10">
          <Corner />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-px bg-white/30" />
            <span className="text-[0.60rem] uppercase tracking-widest text-white">
              Perfil de usuario
            </span>
          </div>

          {/* Avatar + nombre */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-white">JD</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0F2C32]" />
            </div>
            <div>
              <p className="text-white font-semibold text-base sm:text-lg leading-tight">Juan Pérez</p>
              <p className="text-white text-xs sm:text-sm mt-0.5 opacity-80">Asesor en Entrenamiento</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-white/70 text-xs">
                  <Mail size={11} className="shrink-0" />
                  <span>juan.perez@empresa.com</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 text-xs">
                  <Briefcase size={11} className="shrink-0" />
                  <span>Área de Atención al Cliente</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body blanco ── */}
        <div className="bg-white px-6 sm:px-8 py-6 space-y-6">

          {/* Plan */}
          <div>
            <Label>Suscripción activa</Label>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#0F2C32]" />
                  <span className="text-sm font-semibold text-[#0F2C32]">Pro Mensual</span>
                </div>
                <span className="text-[0.60rem] uppercase tracking-widest font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  Activo
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100">
                <CalendarDays size={13} className="text-slate-400 shrink-0" />
                <span className="text-xs sm:text-sm text-slate-500">
                  Vence el <span className="text-slate-700 font-medium">15 mayo 2026</span>
                </span>
              </div>
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <Label>Método de pago</Label>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded bg-[#0F2C32] flex items-center justify-center shrink-0">
                  <CreditCard size={13} className="text-white" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium text-slate-700">Visa •••• 4242</p>
                  <p className="text-xs text-slate-400">Vence 08/27</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmAction('payment')}
                className="text-slate-300 hover:text-red-400 transition-colors p-1"
                title="Eliminar método de pago"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Cancelar suscripción */}
          <div>
            <button
              onClick={() => setConfirmAction('subscription')}
              className="w-full py-2.5 text-sm font-medium text-red-400 border border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              Cancelar suscripción
            </button>
          </div>
        </div>

        {/* ── Overlay de confirmación ── */}
        {confirmAction && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 rounded-2xl">
            <div className="text-center w-full">
              <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <p className="text-sm font-semibold text-[#0F2C32] mb-1">
                {confirmAction === 'payment' ? '¿Eliminar método de pago?' : '¿Cancelar suscripción?'}
              </p>
              <p className="text-xs text-slate-400 mb-6">
                {confirmAction === 'payment'
                  ? 'No podrás renovar sin un método de pago asociado.'
                  : 'Perderás acceso al terminar tu período actual.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2.5 text-sm font-medium border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={() => setConfirmAction(null) /* TODO: conectar backend */}
                  className="flex-1 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
