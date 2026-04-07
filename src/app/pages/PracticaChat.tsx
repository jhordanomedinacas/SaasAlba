import { useParams } from 'react-router';
import { ChatTraining } from '../components/ChatTraining';
import { useSessions, SavedMessage } from '../context/SessionsContext';
import { COPCEvaluation } from '../hooks/useCOPCRating';

export default function PracticaChat() {
  const { id } = useParams<{ id: string }>();
  const { sessions, completeSession } = useSessions();
  const session = sessions.find(s => s.id === id);

  const handleComplete = (evaluation: COPCEvaluation, messages: SavedMessage[]) => {
    if (id) completeSession(id, evaluation, messages);
  };

  return (
    <ChatTraining
      profileName={session?.scenario ?? 'Práctica de Chat'}
      level={session?.level ?? 'Intermedio'}
      isCompleted={session?.status === 'completado'}
      orderCancelled={session?.orderCancelled ?? false}
      initialEvaluation={session?.evaluation}
      initialMessages={session?.messages}
      onComplete={handleComplete}
    />
  );
}
