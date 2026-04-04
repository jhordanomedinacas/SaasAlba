import { useParams } from 'react-router';
import { ChatTraining } from '../components/ChatTraining';
import { useSessions } from '../context/SessionsContext';

export default function PracticaChat() {
  const { id } = useParams<{ id: string }>();
  const { sessions, completeSession } = useSessions();
  const session = sessions.find(s => s.id === id);

  return (
    <ChatTraining
      profileName={session?.scenario ?? 'Práctica de Chat'}
      level={session?.level ?? 'Intermedio'}
      isCompleted={session?.status === 'completado'}
      orderCancelled={session?.orderCancelled ?? false}
      onComplete={() => id && completeSession(id)}
    />
  );
}
