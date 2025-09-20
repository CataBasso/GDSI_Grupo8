import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, FileText, PlusCircle, User } from "lucide-react";
import { GastosTab } from "@/components/GastosTab";
import { ParticipantesTab } from "@/components/ParticipantesTab";
import { ResumenesTab } from "@/components/ResumenesTab";

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  participante: string;
  fecha: string;
  categoria: string;
}

export interface Participante {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  unidad: string;
  activo: boolean;
}

// Usuario actual simulado (en la app real vendría de la autenticación)
const USUARIO_ACTUAL = {
  id: "user-1",
  nombre: "Juan Pérez",
  email: "juan@email.com",
  unidad: "3C"
};

const Index = () => {
  // Gastos del grupo (simulando datos existentes de otros miembros)
  const [gastos, setGastos] = useState<Gasto[]>([
    {
      id: "1",
      descripcion: "Mantenimiento ascensor",
      monto: 25000,
      participante: "María González",
      fecha: "2024-01-15",
      categoria: "mantenimiento"
    },
    {
      id: "2", 
      descripcion: "Pintura hall principal",
      monto: 85000,
      participante: "Carlos Rodriguez",
      fecha: "2024-01-10",
      categoria: "mejoras"
    },
    {
      id: "3",
      descripcion: "Limpieza de tanques de agua",
      monto: 15000,
      participante: "Ana Martínez",
      fecha: "2024-01-08",
      categoria: "limpieza"
    },
    {
      id: "4",
      descripcion: "Arreglo de portón eléctrico",
      monto: 45000,
      participante: "Juan Pérez",
      fecha: "2024-01-05",
      categoria: "mantenimiento"
    }
  ]);

  // Miembros del consorcio (simulando otros usuarios del grupo)
  const [participantes] = useState<Participante[]>([
    {
      id: "1",
      nombre: "María González",
      email: "maria@email.com",
      telefono: "+54 11 1234-5678",
      unidad: "2A",
      activo: true
    },
    {
      id: "2",
      nombre: "Carlos Rodriguez", 
      email: "carlos@email.com",
      telefono: "+54 11 9876-5432",
      unidad: "1B",
      activo: true
    },
    {
      id: "3",
      nombre: "Ana Martínez",
      email: "ana@email.com",
      telefono: "+54 11 5555-1234",
      unidad: "4D",
      activo: true
    },
    {
      id: "4",
      nombre: "Juan Pérez", // Usuario actual
      email: "juan@email.com",
      telefono: "+54 11 7777-8888",
      unidad: "3C",
      activo: true
    }
  ]);

  const agregarGasto = (nuevoGasto: Omit<Gasto, 'id' | 'participante'>) => {
    const gasto: Gasto = {
      ...nuevoGasto,
      id: Date.now().toString(),
      participante: USUARIO_ACTUAL.nombre // Siempre el usuario actual
    };
    setGastos([...gastos, gasto]);
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
              <span>{USUARIO_ACTUAL.nombre} - Unidad {USUARIO_ACTUAL.unidad}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
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
                usuarioActual={USUARIO_ACTUAL}
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
        </div>
      </main>
    </div>
  );
};

export default Index;