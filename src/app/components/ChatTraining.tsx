import { Send, Info, CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { OrderInfoPanel } from './OrderInfoPanel';
import { RatingModal } from './RatingModal';
import { evaluateConversation, COPCEvaluation } from '../hooks/useCOPCRating';
import { CriticalCustomerBot, BotState, OrderInfo } from '../hooks/useCriticalBot';
import { SavedMessage } from '../context/SessionsContext';

interface Message {
  id: string;
  sender: 'customer' | 'agent';
  text: string;
  time: string;
  timestamp: number;
}

interface ChatTrainingProps {
  profileName: string;
  level: string;
  isCompleted: boolean;
  orderCancelled: boolean;
  initialEvaluation?: COPCEvaluation;
  initialMessages?: SavedMessage[];
  onComplete: (evaluation: COPCEvaluation, messages: SavedMessage[]) => void;
}

// Colores del indicador de escalamiento
const ESCALATION_COLOR: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Tranquilo'   },
  2: { bg: 'bg-yellow-100',  text: 'text-yellow-700',  label: 'Molesto'     },
  3: { bg: 'bg-orange-100',  text: 'text-orange-700',  label: 'Irritado'    },
  4: { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Furioso'     },
  5: { bg: 'bg-red-200',     text: 'text-red-800',     label: 'Crítico'     },
};

export function ChatTraining({ profileName, level, isCompleted, orderCancelled, initialEvaluation, initialMessages, onComplete }: ChatTrainingProps) {
  const navigate = useNavigate();
  const [infoPanelOpen, setInfoPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(420);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Bot instance — persiste durante toda la sesión
  const bot = useRef<CriticalCustomerBot>(new CriticalCustomerBot(profileName));
  const [botState, setBotState] = useState<BotState>(bot.current.getState());
  const orderInfo = useRef<OrderInfo>(bot.current.getOrderInfo());
  const [isTyping, setIsTyping] = useState(false);

  // Rating — si la sesión ya estaba completada cargamos la evaluación guardada
  const [ratingEval, setRatingEval] = useState<COPCEvaluation | null>(initialEvaluation ?? null);
  const lastCustomerMsgTime = useRef<number | null>(Date.now());
  const responseTimes = useRef<number[]>([]);

  // Mensajes — si la sesión ya está completada carga el historial guardado
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages.map(m => ({ ...m, timestamp: 0 }));
    }
    const now = Date.now();
    return [{
      id: '1',
      sender: 'customer',
      text: bot.current.getInitialComplaint(),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now,
    }];
  });

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startX.current - e.clientX;
      setPanelWidth(Math.min(700, Math.max(280, startWidth.current + delta)));
    };
    const onMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [panelWidth]);

  const handleSend = () => {
    if (!inputText.trim() || isCompleted || isTyping) return;

    const now = Date.now();
    const text = inputText.trim();

    // Medir tiempo de respuesta
    if (lastCustomerMsgTime.current !== null) {
      responseTimes.current.push(now - lastCustomerMsgTime.current);
      lastCustomerMsgTime.current = null;
    }

    const agentMsg: Message = {
      id: now.toString(),
      sender: 'agent',
      text,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now,
    };

    setMessages(prev => [...prev, agentMsg]);
    setInputText('');

    // Bot responde con delay tipo "escribiendo..."
    setIsTyping(true);
    const delay = 1200 + Math.random() * 1000;
    setTimeout(() => {
      const response = bot.current.respond(text);
      setBotState(response.state);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'customer',
        text: response.text,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      lastCustomerMsgTime.current = Date.now();

      // El cliente abandona el chat si shouldTerminate
      if (response.shouldTerminate) {
        setTimeout(() => {
          const leaveMsg: Message = {
            id: (Date.now() + 2).toString(),
            sender: 'customer',
            text: '— El cliente ha abandonado el chat —',
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, leaveMsg]);
          // Pequeña pausa antes de mostrar la calificación
          setTimeout(() => {
            const evaluation = evaluateConversation(
              [...messages, agentMsg, botMsg],
              responseTimes.current
            );
            const allMsgs = [...messages, agentMsg, botMsg];
            setRatingEval(evaluation);
            onComplete(evaluation, toSaved(allMsgs));
          }, 1500);
        }, 800);
      }
    }, delay);
  };

  const toSaved = (msgs: Message[]): SavedMessage[] =>
    msgs.map(({ id, sender, text, time }) => ({ id, sender, text, time }));

  const handleComplete = () => {
    const evaluation = evaluateConversation(messages, responseTimes.current);
    setRatingEval(evaluation);
    onComplete(evaluation, toSaved(messages));
  };

  const escalation = ESCALATION_COLOR[botState.escalationLevel] ?? ESCALATION_COLOR[1];

  const quickReplies = [
    'Entiendo tu frustración, lamento lo sucedido.',
    'Voy a resolver esto ahora mismo.',
    'Permíteme verificar tu caso de inmediato.',
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
              {/* Indicador de escalamiento */}
              {!isCompleted && (
                <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${escalation.bg} ${escalation.text}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Nv.{botState.escalationLevel} — {escalation.label}
                </div>
              )}

              {!isCompleted && (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] transition-colors whitespace-nowrap"
                >
                  <CheckCircle size={15} />
                  <span className="hidden sm:inline">Finalizar Sesión</span>
                </button>
              )}
              {isCompleted && ratingEval && (
                <button
                  onClick={() => setRatingEval(ratingEval)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <CheckCircle size={15} />
                  <span className="hidden sm:inline">Ver Calificación</span>
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
                    ? 'bg-[#0F2C32] text-white'
                    : 'bg-white text-gray-900 border shadow-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'agent' ? 'text-white/50' : 'text-gray-400'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm px-4 py-3 rounded-lg flex items-center gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

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
                placeholder={isTyping ? 'El cliente está respondiendo...' : 'Escribe tu respuesta...'}
                disabled={isTyping}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2C32]/30 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={isTyping}
                className="px-4 md:px-6 py-2 md:py-3 bg-[#0F2C32] text-white rounded-lg hover:bg-[#1a4a52] flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Send size={16} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingEval && (
        <RatingModal
          evaluation={ratingEval}
          profileName={profileName}
          onClose={() => setRatingEval(null)}
        />
      )}

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
            <OrderInfoPanel orderCancelled={orderCancelled} orderInfo={orderInfo.current} />
          </div>
        </>
      )}
    </div>
  );
}
