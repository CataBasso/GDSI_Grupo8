import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, FileText, PlusCircle, User, Moon, Sun } from "lucide-react";
import { GastosTab } from "@/components/GastosTab";
import { ResumenesTab } from "@/components/ResumenesTab";
import { loadData, saveData, loadDataFromLocalStorage, generateId } from "@/lib/dataStorage";

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  participante: string;
  fecha: string;
  categoria: string;
  comprobante: string
}

export interface Participante {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  unidad: string;
  activo: boolean;
}

const Index = () => {
  // Estados para los datos
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [usuarioActual, setUsuarioActual] = useState({
    id: "user-1",
    nombre: "Usuario",
    email: "usuario@email.com",
    unidad: "1A"
  });
  const [loading, setLoading] = useState(true);

  // Cargar datos al inicializar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // Intentar cargar desde el archivo JSON primero
        const data = await loadData();
        setGastos(data.gastos);
        setParticipantes(data.participantes);
        setUsuarioActual(data.usuarioActual);
      } catch (error) {
        console.error('Error cargando datos:', error);
        // Si falla, intentar cargar desde localStorage
        const dataLocal = loadDataFromLocalStorage();
        if (dataLocal) {
          setGastos(dataLocal.gastos);
          setParticipantes(dataLocal.participantes);
          setUsuarioActual(dataLocal.usuarioActual);
        }
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const agregarGasto = async (nuevoGasto: Omit<Gasto, 'id' | 'participante'>) => {
    const gasto: Gasto = {
      ...nuevoGasto,
      id: generateId(),
      participante: usuarioActual.nombre // Siempre el usuario actual
    };
    
    const nuevosGastos = [...gastos, gasto];
    setGastos(nuevosGastos);
    
    // Guardar datos actualizados
    await saveData({
      gastos: nuevosGastos,
      participantes,
      usuarioActual
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">MiConsorcio</h1>
                <p className="text-sm text-muted-foreground">Consorcio colaborativo - Edificio San Martín 1250</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{usuarioActual.nombre} - Unidad {usuarioActual.unidad}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando datos...</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="gastos" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm border shadow-sm">
                <TabsTrigger
                  value="gastos"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <PlusCircle className="w-4 h-4" />
                  Mis Gastos
                </TabsTrigger>
                <TabsTrigger
                  value="resumenes"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <FileText className="w-4 h-4" />
                  Balance del Grupo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gastos" className="space-y-6">
                <GastosTab
                  gastos={gastos}
                  participantes={participantes}
                  usuarioActual={usuarioActual}
                  onAgregarGasto={agregarGasto}
                />
              </TabsContent>

              <TabsContent value="resumenes" className="space-y-6">
                <ResumenesTab
                  gastos={gastos}
                  participantes={participantes}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;