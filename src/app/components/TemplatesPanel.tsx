import { ChevronRight } from 'lucide-react';

interface TemplatesPanelProps {
  onTemplateClick: (template: string) => void;
}

export function TemplatesPanel({ onTemplateClick }: TemplatesPanelProps) {
  const templates = {
    retornos: [
      'Entiendo tu situación. Para procesar la devolución, necesito el número de orden.',
      'Lamento que el producto no haya cumplido tus expectativas. Te ayudaré con el reembolso.',
      'Por favor, envíame una foto del producto defectuoso para iniciar el proceso.'
    ],
    saludos: [
      '¡Hola! Soy tu asesor de atención al cliente. ¿En qué puedo ayudarte hoy?',
      'Buenos días, muchas gracias por contactarnos.',
      'Bienvenido, estoy aquí para ayudarte.'
    ],
    gestionCasos: [
      'He registrado tu caso con el número #12345. Te mantendré informado.',
      'Voy a escalar tu caso al departamento especializado.',
      'Permíteme unos minutos mientras reviso tu historial de órdenes.'
    ],
    despedida: [
      '¿Hay algo más en lo que pueda ayudarte?',
      'Gracias por tu paciencia. ¡Que tengas un excelente día!',
      'Quedamos atentos a cualquier otra consulta.'
    ]
  };

  return (
    <div className="w-80 bg-[#0F2C32] text-white p-4 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Templates Para</h3>
        <h3 className="text-lg font-semibold">Atención</h3>
      </div>

      <div className="space-y-4">
        <TemplateSection
          title="Retornos"
          templates={templates.retornos}
          onTemplateClick={onTemplateClick}
        />
        <TemplateSection
          title="Saludos"
          templates={templates.saludos}
          onTemplateClick={onTemplateClick}
        />
        <TemplateSection
          title="Gestión de Casos"
          templates={templates.gestionCasos}
          onTemplateClick={onTemplateClick}
        />
        <TemplateSection
          title="Despedida"
          templates={templates.despedida}
          onTemplateClick={onTemplateClick}
        />
      </div>
    </div>
  );
}

interface TemplateSectionProps {
  title: string;
  templates: string[];
  onTemplateClick: (template: string) => void;
}

function TemplateSection({ title, templates, onTemplateClick }: TemplateSectionProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2 text-white/90">{title}</h4>
      <div className="space-y-2">
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => onTemplateClick(template)}
            className="w-full text-left px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-start justify-between gap-2 group"
          >
            <span className="flex-1 line-clamp-2">{template}</span>
            <ChevronRight size={16} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
