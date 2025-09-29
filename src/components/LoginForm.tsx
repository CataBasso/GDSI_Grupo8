import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, User, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (usuario: { id: string; nombre: string; email: string; unidad: string }) => void;
  participantes: Array<{
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    unidad: string;
    activo: boolean;
  }>;
}

export const LoginForm = ({ onLogin, participantes }: LoginFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Buscar usuario por email
      const usuario = participantes.find(p => p.email === formData.email);
      
      if (!usuario) {
        setError("Usuario no encontrado");
        return;
      }

      // Verificar contraseña (en una app real, esto sería más seguro)
      const passwordCorrecta = verificarPassword(usuario.email, formData.password);
      
      if (!passwordCorrecta) {
        setError("Contraseña incorrecta");
        return;
      }

      // Login exitoso
      onLogin({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        unidad: usuario.unidad
      });

      toast({
        title: "¡Bienvenido!",
        description: `Hola ${usuario.nombre}, has iniciado sesión correctamente`
      });

    } catch (error) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Función simple de verificación de contraseña (en producción usar hash)
  const verificarPassword = (email: string, password: string): boolean => {
    // Contraseñas por defecto para cada usuario (en producción usar hash)
    const passwords: Record<string, string> = {
      "maria@email.com": "maria123",
      "carlos@email.com": "carlos123", 
      "ana@email.com": "ana123",
      "juan@email.com": "juan123"
    };
    
    return passwords[email] === password;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg mx-auto">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">MiConsorcio</CardTitle>
            <CardDescription>
              Inicia sesión para acceder a tu consorcio
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Usuarios de prueba:</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• maria@email.com / maria123</div>
              <div>• carlos@email.com / carlos123</div>
              <div>• ana@email.com / ana123</div>
              <div>• juan@email.com / juan123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
