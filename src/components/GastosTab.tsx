import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, User, Plus, Receipt, Upload, X } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: "",
    monto: "",
    fecha: "",
    categoria: "",
    comprobante: null as File | null
  });
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, comprobante: file });
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, comprobante: null });
    // Limpiar el input file
    const fileInput = document.getElementById('comprobante') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    console.log('📤 Archivo a subir:', formData.comprobante?.name);

    if (!formData.descripcion || !formData.monto || !formData.fecha || !formData.categoria) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      setUploading(false);
      return;
    }

    let comprobanteFilename = null;

    // Si hay archivo, subirlo primero
    if (formData.comprobante) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.comprobante);

        const uploadResponse = await fetch('http://localhost:8000/upload/comprobante', {
          method: 'POST',
          body: uploadFormData
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {
          comprobanteFilename = uploadResult.filename;
        } else {
          throw new Error(uploadResult.message || 'Error al subir archivo');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Error",
          description: "Error al subir el comprobante. Intenta nuevamente.",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
    }


    // Crear el gasto con el nombre del archivo guardado o null
    const gastoData = {
      descripcion: formData.descripcion,
      monto: parseFloat(formData.monto),
      fecha: formData.fecha,
      categoria: formData.categoria,
      comprobante: comprobanteFilename,
      pagado_por: usuarioActual.id,
      participantes: [usuarioActual.id], // O los participantes seleccionados
      creado_por: usuarioActual.id
    };

    try {
      onAgregarGasto(gastoData);

      console.log('✅ onAgregarGasto llamado exitosamente');

      // Reset form
      setFormData({
        descripcion: "",
        monto: "",
        fecha: "",
        categoria: "",
        comprobante: null
      });

      // Limpiar el input file
      const fileInput = document.getElementById('comprobante') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      setOpen(false);
      toast({
        title: "¡Gasto agregado!",
        description: comprobanteFilename 
          ? "Tu gasto se registró correctamente con comprobante" 
          : "Tu gasto se registró correctamente"
      });
    } catch (error) {
      console.error('Error creating gasto:', error);
      toast({
        title: "Error",
        description: "Error al crear el gasto. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
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
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el gasto..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  disabled={uploading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto ($) *</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.monto}
                    onChange={(e) => setFormData({...formData, monto: e.target.value})}
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    disabled={uploading}
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
                <Label htmlFor="categoria">Categoría *</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => setFormData({...formData, categoria: value})}
                  disabled={uploading}
                >
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
                <div className="space-y-3">
                  {/* Input file personalizado */}
                  <div className="relative">
                    <input
                      id="comprobante"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="sr-only" // Ocultar el input nativo
                    />
                    <label
                      htmlFor="comprobante"
                      className={`
                        flex items-center justify-center gap-2 w-full px-4 py-3 
                        border-2 border-dashed rounded-lg cursor-pointer transition-colors
                        ${formData.comprobante 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                        }
                        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {formData.comprobante ? 'Cambiar archivo' : 'Seleccionar archivo'}
                      </span>
                    </label>
                  </div>

                  {formData.comprobante && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {formData.comprobante.type?.startsWith('image/') ? (
                            <span className="text-xs font-bold text-primary">IMG</span>
                          ) : (
                            <span className="text-xs font-bold text-primary">PDF</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {formData.comprobante.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(formData.comprobante.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        disabled={uploading}
                        className="h-8 w-8 p-0 flex-shrink-0 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {formData.comprobante ? "Subiendo archivo..." : "Guardando..."}
                  </div>
                ) : (
                  "Registrar Gasto"
                )}
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
                  </div>
                  {gasto.comprobante && (
                    <div className="mt-3">
                      {gasto.comprobante.endsWith(".pdf") ? (
                        <a
                          href={`http://localhost:8000/upload/comprobante/${gasto.comprobante}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary underline hover:text-primary/80"
                        >
                          <Receipt className="w-4 h-4" />
                          Ver comprobante (PDF)
                        </a>
                      ) : (
                        <a 
                          href={`http://localhost:8000/upload/comprobante/${gasto.comprobante}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <img
                            src={`http://localhost:8000/upload/comprobante/${gasto.comprobante}`}
                            alt="Comprobante"
                            className="w-32 h-32 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer shadow-sm"
                            onError={(e) => {
                              // Fallback si la imagen no se puede cargar
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentNode as HTMLElement;
                              if (parent) {
                                parent.innerHTML = '<span class="text-sm text-muted-foreground">Comprobante no disponible</span>';
                              }
                            }}
                          />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};