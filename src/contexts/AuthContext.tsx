import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  unidad: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (usuario: Usuario) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const usuarioGuardado = localStorage.getItem('miconsorcio-usuario');
        if (usuarioGuardado) {
          setUsuario(JSON.parse(usuarioGuardado));
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, []);

  const login = (nuevoUsuario: Usuario) => {
    setUsuario(nuevoUsuario);
    localStorage.setItem('miconsorcio-usuario', JSON.stringify(nuevoUsuario));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('miconsorcio-usuario');
    localStorage.removeItem('miconsorcio-data'); // Limpiar datos también
  };

  const value: AuthContextType = {
    usuario,
    login,
    logout,
    isAuthenticated: !!usuario,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
