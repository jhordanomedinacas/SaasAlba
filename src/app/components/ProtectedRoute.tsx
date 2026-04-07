import { Navigate } from 'react-router';
import { useAuth, UserRole } from '../context/AuthContext';

const roleHome: Record<UserRole, string> = {
  admin:       '/admin',
  entrenador:  '/inicio',
  asesor:      '/inicio-asesor',
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowed: UserRole[];
}

export function ProtectedRoute({ children, allowed }: ProtectedRouteProps) {
  const { role } = useAuth();

  if (!role) return <Navigate to="/login" replace />;
  if (!allowed.includes(role)) return <Navigate to={roleHome[role]} replace />;

  return <>{children}</>;
}
