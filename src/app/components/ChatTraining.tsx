import { Send, Info, CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { OrderInfoPanel } from './OrderInfoPanel';

interface Message {
  id: string;
  sender: 'customer' | 'agent';
  text: string;
  time: string;
}

interface ChatTrainingProps {
  profileName: string;
  level: string;
  isCompleted: boolean;
  orderCancelled: boolean;
  onComplete: () => void;
}

export function ChatTraining({ profileName, level, isCompleted, orderCancelled, onComplete }: ChatTrainingProps) {
  const navigate = useNavigate();
  const [infoPanelOpen, setInfoPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(420);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(700, Math.max(280, startWidth.current + delta));
      setPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [panelWidth]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'customer',
      text: 'Hola, ¿cómo hago una devolución de mi orden?',
      time: '10:30'
    },
    {
      id: '2',
      sender: 'customer',
      text: 'El producto llegó defectuoso y necesito un reembolso',
      time: '10:31'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputText.trim() || isCompleted) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      text: inputText,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const quickReplies = [
    '¿Puedes proporcionarme el número de tu orden?',
    'Entiendo tu situación, permítame ayudarte.',
    'Voy a revisar tu caso inmediatamente.'
  ];

  return (
    <div className="flex-1 flex h-full bg-gray-50 relative">
      <div className="flex-1 flex flex-col w-full overflow-hidden">

        {/* Header */}
        <div className="bg-white border-b px-4 md:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/historial-chat')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F2C32] hover:bg-slate-100 transition-colors"
                title="Volver al historial"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">{profileName}</h2>
                <p className="text-xs md:text-sm text-gray-500">Nivel: {level}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isCompleted && (
                <button
                  onClick={onComplete}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors whitespace-nowrap"
                >
                  <CheckCircle size={15} />
                  <span className="hidden sm:inline">Finalizar Sesión</span>
                </button>
              )}
              <button
                onClick={() => setInfoPanelOpen(!infoPanelOpen)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 whitespace-nowrap"
              >
                <Info size={16} />
                <span className="hidden sm:inline">{infoPanelOpen ? 'Ocultar Info' : 'Ver Info'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Banner de sesión completada */}
        {isCompleted && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0F2C32]/5 border-b border-[#0F2C32]/10 flex-shrink-0">
            <CheckCircle size={15} className="text-[#0F2C32] flex-shrink-0" />
            <p className="text-xs font-medium text-[#0F2C32]">
              Esta sesión ha finalizado. El historial es de solo lectura.
            </p>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-lg ${
                  message.sender === 'agent'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 border'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {isCompleted ? (
          <div className="bg-white border-t p-3 md:p-4 flex items-center justify-center gap-2 text-slate-400">
            <Lock size={14} />
            <span className="text-xs font-medium">Sesión completada — escritura deshabilitada</span>
          </div>
        ) : (
          <div className="bg-white border-t p-3 md:p-4 flex-shrink-0">
            {/* Quick Replies */}
            <div className="flex flex-wrap gap-2 mb-3 overflow-x-auto">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(reply)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors whitespace-nowrap flex-shrink-0"
                >
                  {reply}
                </button>
              ))}
            </div>

            <div className="flex gap-2 md:gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu respuesta..."
                className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Send size={16} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Info Panel */}
      {infoPanelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setInfoPanelOpen(false)}
          />
          <div
            className={`
              fixed md:relative
              inset-y-0 right-0
              z-50 md:z-0
              flex-shrink-0
              transform transition-transform duration-300
              ${infoPanelOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            `}
            style={{ width: panelWidth }}
          >
            <div
              onMouseDown={onResizeStart}
              className="hidden md:block absolute left-0 top-0 h-full w-1.5 cursor-col-resize z-10 group hover:bg-blue-400/40 transition-colors"
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
            </div>
            <OrderInfoPanel orderCancelled={orderCancelled} />
          </div>
        </>
      )}
    </div>
  );
}
