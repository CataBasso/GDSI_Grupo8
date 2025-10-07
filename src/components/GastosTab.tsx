import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, User, Plus, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Gasto, Participante } from "@/pages/Index";
interface GastosTabProps {
  gastos: Gasto[];
  participantes: Participante[];
  usuarioActual: { id: string; nombre: string; email: string; unidad: string };
  onAgregarGasto: (gasto: Omit<Gasto, 'id' | 'participante'>) => void;
}

const categorias = [
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "limpieza", label: "Limpieza" },
  { value: "seguridad", label: "Seguridad" },
  { value: "jardineria", label: "Jardinería" },
  { value: "mejoras", label: "Mejoras" },
  { value: "administracion", label: "Administración" },
  { value: "servicios", label: "Servicios" },
  { value: "otros", label: "Otros" }
];

export const getCategoriaColorClass = (categoria: string) => {
  const classColors: Record<string, string> = {
    mantenimiento: "bg-blue-100 text-blue-800",
    limpieza: "bg-lime-100 text-lime-800",
    seguridad: "bg-red-100 text-red-800",
    jardineria: "bg-violet-100 text-violet-800",
    mejoras: "bg-purple-100 text-purple-800",
    administracion: "bg-orange-100 text-orange-800",
    servicios: "bg-cyan-100 text-cyan-800",
    otros: "bg-amber-100 text-amber-800"
  };
  return classColors[categoria] || classColors.otros;
}


export const GastosTab = ({ gastos, usuarioActual, onAgregarGasto }: GastosTabProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: "",
    monto: "",
    fecha: "",
    categoria: "",
    comprobante: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descripcion || !formData.monto || !formData.fecha || !formData.categoria) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    onAgregarGasto({
      descripcion: formData.descripcion,
      monto: parseFloat(formData.monto),
      fecha: formData.fecha,
      categoria: formData.categoria,
      comprobante: formData.comprobante
    });

    setFormData({
      descripcion: "",
      monto: "",
      fecha: "",
      categoria: "",
      comprobante: ""
    });

    setOpen(false);
    toast({
      title: "Gasto agregado",
      description: "Tu gasto se registró correctamente en el grupo"
    });
  };

  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  const misGastos = gastos.filter(gasto => gasto.participante === usuarioActual.nombre);
  const totalMisGastos = misGastos.reduce((sum, gasto) => sum + gasto.monto, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mis Gastos del Consorcio</h2>
          <p className="text-muted-foreground">Registra los gastos comunes que realizaste para el grupo</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Mi Gasto</DialogTitle>
              <DialogDescription>
                Registra un gasto común que realizaste para el consorcio
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el gasto..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto ($)</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.monto}
                    onChange={(e) => setFormData({...formData, monto: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Pagado por:</span>
                  <span className="font-medium">{usuarioActual.nombre} - Unidad {usuarioActual.unidad}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comprobante">Comprobante (opcional)</Label>
                <Input
                  id="comprobante"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setFormData({ ...formData, comprobante: url });
                    }
                  }}
                />
              </div>
              <Button type="submit" className="w-full">
                Registrar Gasto
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-accent/10 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mis Gastos</p>
                <p className="text-2xl font-bold text-foreground">
                  ${totalMisGastos.toLocaleString('es-AR')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gastos del Grupo</p>
                <p className="text-2xl font-bold text-foreground">${totalGastos.toLocaleString('es-AR')}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tus Registros</p>
                <p className="text-2xl font-bold text-foreground">{misGastos.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-r from-card via-card to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Todos los Gastos del Grupo
          </CardTitle>
          <CardDescription>Historial completo de gastos del consorcio (incluye gastos de otros miembros)</CardDescription>
        </CardHeader>
        <CardContent>
          {gastos.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay gastos registrados</h3>
              <p className="text-muted-foreground">Los gastos del grupo aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gastos.map((gasto) => (
                <div key={gasto.id} className={`p-4 rounded-lg border hover:shadow-md transition-shadow ${
                  gasto.participante === usuarioActual.nombre
                    ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20"
                    : "bg-gradient-to-r from-background to-accent/5"
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{gasto.descripcion}</h4>
                      {gasto.participante === usuarioActual.nombre && (
                        <Badge variant="default" className="text-xs">Mi gasto</Badge>
                      )}
                    </div>
                    <Badge className={getCategoriaColorClass(gasto.categoria)}>
                      {categorias.find(c => c.value === gasto.categoria)?.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium text-foreground">${gasto.monto.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className={gasto.participante === usuarioActual.nombre ? "font-medium text-primary" : ""}>
                        {gasto.participante}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      <span>{new Date(gasto.fecha).toLocaleDateString('es-AR')}</span>
                    </div>
                    {gasto.comprobante && (
                      <div className="mt-2">
                        {gasto.comprobante.endsWith(".pdf") ? (
                          <a
                            href={gasto.comprobante}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary underline"
                          >
                            Ver comprobante (PDF)
                          </a>
                        ) : (
                          <a href={gasto.comprobante} target="_blank" rel="noopener noreferrer">
                            <img
                              src={gasto.comprobante}
                              alt="Comprobante"
                              className="w-24 h-24 object-cover rounded-md border hover:scale-105 transition-transform"
                            />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};