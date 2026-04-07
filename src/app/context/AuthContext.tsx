import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'entrenador' | 'asesor';

interface AuthContextType {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);

  const setRole = (r: UserRole) => setRoleState(r);
  const clearRole = () => setRoleState(null);

  return (
    <AuthContext.Provider value={{ role, setRole, clearRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
