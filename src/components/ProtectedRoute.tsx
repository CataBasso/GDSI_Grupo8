import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "./LoginForm";

interface ProtectedRouteProps {
  children: ReactNode;
  participantes: Array<{
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    unidad: string;
    activo: boolean;
  }>;
}

export const ProtectedRoute = ({ children, participantes }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} participantes={participantes} />;
  }

  return <>{children}</>;
};
