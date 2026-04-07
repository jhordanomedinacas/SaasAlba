import { X, Star, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { COPCEvaluation, getScoreColor, criteria } from '../hooks/useCOPCRating';

interface RatingModalProps {
  evaluation: COPCEvaluation;
  profileName: string;
  onClose: () => void;
}

function Stars({ score }: { score: number }) {
  const filled = Math.round(score / 20);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < filled ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  );
}

const ratingBadgeStyle: Record<string, string> = {
  'EXCELENTE':       'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'BUENO':           'bg-blue-50 text-blue-700 border border-blue-200',
  'SATISFACTORIO':   'bg-amber-50 text-amber-700 border border-amber-200',
  'NECESITA MEJORA': 'bg-orange-50 text-orange-700 border border-orange-200',
  'INSATISFACTORIO': 'bg-red-50 text-red-700 border border-red-200',
};

export function RatingModal({ evaluation, profileName, onClose }: RatingModalProps) {
  const scoreColor = getScoreColor(evaluation.totalScore);
  const badgeStyle = ratingBadgeStyle[evaluation.rating] ?? 'bg-slate-100 text-slate-600 border border-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 bg-[#0F2C32] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Calificación COPC</h2>
              <p className="text-xs text-white/60 mt-0.5">{profileName} · {new Date().toLocaleDateString('es-PE')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">

          {/* Score hero */}
          <div className="px-5 py-6 flex items-center gap-6 border-b border-slate-100">
            {/* Circle */}
            <div
              className="w-20 h-20 rounded-full border-4 flex-shrink-0 flex items-center justify-center"
              style={{ borderColor: scoreColor, background: `${scoreColor}12` }}
            >
              <span className="text-2xl font-bold" style={{ color: scoreColor }}>
                {evaluation.totalScore}%
              </span>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${badgeStyle}`}>
                  {evaluation.rating}
                </span>
              </div>
              <Stars score={evaluation.totalScore} />
              <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                {evaluation.feedback.split('\n')[0]}
              </p>
            </div>
          </div>

          {/* Criterios */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Evaluación por criterios
            </p>
            <div className="space-y-3">
              {Object.entries(evaluation.scores).map(([key, score]) => {
                const color = getScoreColor(score);
                const name = criteria[key as keyof typeof criteria].name;
                const weight = criteria[key as keyof typeof criteria].weight;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{weight}% peso</span>
                        <span className="text-xs font-semibold w-8 text-right" style={{ color }}>
                          {Math.round(score)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${score}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback completo */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Feedback detallado
            </p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {evaluation.feedback}
            </p>
          </div>

          {/* Penalizaciones y errores */}
          {(evaluation.foundPenalties.length > 0 || evaluation.spellErrors.length > 0) && (
            <div className="px-5 py-4 border-b border-slate-100 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Observaciones
              </p>

              {evaluation.foundPenalties.length > 0 && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-red-700">Frases penalizadas</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.foundPenalties.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                        "{f.phrase}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {evaluation.spellErrors.length > 0 && (
                <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-amber-700">
                      Errores ortográficos ({evaluation.spellErrors.reduce((s, e) => s + e.count, 0)})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.spellErrors.map(e => (
                      <span key={e.wrong} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                        {e.wrong} ×{e.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recomendaciones */}
          {evaluation.recommendations.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Plan de mejora
              </p>
              <div className="space-y-2">
                {evaluation.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5">
                    <CheckCircle2 size={14} className="text-[#0F2C32] flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-slate-400" />
            <span className="text-xs text-slate-400">
              {evaluation.recommendations.length} recomendaciones generadas
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
